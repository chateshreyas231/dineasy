/**
 * Voice Input Hook
 * Uses expo-av to record audio and transcribe via backend
 */

import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { apiClient } from '../utils/api';

export type VoiceResult = { text: string; confidence?: number };

export function useVoiceInput() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const start = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        throw new Error('Microphone permission denied');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopAndTranscribe = useCallback(async (): Promise<VoiceResult> => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const recording = recordingRef.current;
    if (!recording) {
      return { text: '' };
    }

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        return { text: '' };
      }

      // Upload audio to backend for transcription
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      } as any);

      // Get base URL and token from apiClient
      const baseUrl = (apiClient as any).baseUrl || 'http://localhost:3001/api';
      const token = (apiClient as any).token;

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/voice/transcribe`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Transcription failed' }));
        throw new Error(error.error || 'Transcription failed');
      }

      const data = await response.json();
      return data || { text: '' };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }, []);

  const cancel = useCallback(async () => {
    const recording = recordingRef.current;
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error canceling recording:', error);
      }
      recordingRef.current = null;
      setIsRecording(false);
    }
  }, []);

  return { isRecording, start, stopAndTranscribe, cancel };
}
