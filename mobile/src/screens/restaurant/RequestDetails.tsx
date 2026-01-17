import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { colors, typography, spacing, radius } from '../../theme';
import { respondToRequest, Request } from '../../services/api/requests';
import * as Haptics from 'expo-haptics';

/**
 * Extract dietary and allergy tags from preferences_snapshot
 */
function extractPreferenceTags(preferencesSnapshot: any): string[] {
  if (!preferencesSnapshot) return [];
  
  const tags: string[] = [];
  
  if (preferencesSnapshot.dietary && Array.isArray(preferencesSnapshot.dietary)) {
    tags.push(...preferencesSnapshot.dietary);
  }
  
  if (preferencesSnapshot.allergies && Array.isArray(preferencesSnapshot.allergies)) {
    tags.push(...preferencesSnapshot.allergies);
  }
  
  if (preferencesSnapshot.dietary_restrictions && Array.isArray(preferencesSnapshot.dietary_restrictions)) {
    tags.push(...preferencesSnapshot.dietary_restrictions);
  }
  
  return tags;
}

/**
 * Format date and time for display
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time only
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Add minutes to a date
 */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export const RequestDetails: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const request = (route.params as any)?.request as Request;

  const [loading, setLoading] = useState(false);
  const [actionMode, setActionMode] = useState<'accept' | 'decline' | 'alternates' | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [alternateTimes, setAlternateTimes] = useState<string[]>([]);
  const [declineMessage, setDeclineMessage] = useState('');

  if (!request) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Request not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  const tags = extractPreferenceTags(request.preferences_snapshot);
  const windowStart = new Date(request.time_window_start);
  const windowEnd = new Date(request.time_window_end);

  // Quick time options: start, start+30, start+60
  const quickTimes = [
    { label: formatTime(request.time_window_start), value: request.time_window_start },
    { label: formatTime(addMinutes(windowStart, 30).toISOString()), value: addMinutes(windowStart, 30).toISOString() },
    { label: formatTime(addMinutes(windowStart, 60).toISOString()), value: addMinutes(windowStart, 60).toISOString() },
  ];

  const handleAccept = async (acceptedTime?: string) => {
    if (!acceptedTime && !selectedTime) {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    setLoading(true);
    try {
      await respondToRequest(request.id, 'accept', {
        accepted_time: acceptedTime || selectedTime || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to accept request');
    } finally {
      setLoading(false);
      setActionMode(null);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await respondToRequest(request.id, 'decline', {
        message: declineMessage || null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to decline request');
    } finally {
      setLoading(false);
      setActionMode(null);
    }
  };

  const handleAlternates = async () => {
    if (alternateTimes.length === 0) {
      Alert.alert('Error', 'Please select at least one alternate time');
      return;
    }

    if (alternateTimes.length > 3) {
      Alert.alert('Error', 'Please select up to 3 alternate times');
      return;
    }

    setLoading(true);
    try {
      await respondToRequest(request.id, 'alternates', {
        alternates: alternateTimes,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to suggest alternates');
    } finally {
      setLoading(false);
      setActionMode(null);
    }
  };

  const toggleAlternateTime = (time: string) => {
    setAlternateTimes((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      } else if (prev.length < 3) {
        return [...prev, time];
      } else {
        Alert.alert('Limit', 'You can select up to 3 alternate times');
        return prev;
      }
    });
  };

  // Generate time options within window (every 30 minutes)
  const generateTimeOptions = (): string[] => {
    const options: string[] = [];
    let current = new Date(windowStart);
    const end = new Date(windowEnd);

    while (current <= end) {
      options.push(current.toISOString());
      current = addMinutes(current, 30);
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Request Details</Text>

          <Card style={styles.card}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reservation Details</Text>
              <View style={[styles.statusBadge, styles.statusPending]}>
                <Text style={styles.statusText}>PENDING</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Party Size:</Text>
              <Text style={styles.detailValue}>
                {request.party_size} guest{request.party_size !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time Window:</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(request.time_window_start)} - {formatTime(request.time_window_end)}
              </Text>
            </View>

            {request.notes && (
              <View style={styles.notesRow}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <Text style={styles.detailValue}>{request.notes}</Text>
              </View>
            )}
          </Card>

          {tags.length > 0 && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Dietary & Allergy Preferences</Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Chip key={index} label={tag} style={styles.tag} />
                ))}
              </View>
            </Card>
          )}

          <View style={styles.actions}>
            <Button
              title="Accept Request"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActionMode('accept');
              }}
              variant="primary"
              size="lg"
              style={styles.button}
            />
            <Button
              title="Suggest Alternates"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActionMode('alternates');
              }}
              variant="secondary"
              size="lg"
              style={styles.button}
            />
            <Button
              title="Decline Request"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActionMode('decline');
              }}
              variant="secondary"
              size="lg"
              style={[styles.button, styles.declineButton]}
            />
          </View>
        </ScrollView>

        {/* Accept Modal */}
        <Modal
          visible={actionMode === 'accept'}
          transparent
          animationType="slide"
          onRequestClose={() => setActionMode(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Accept Request</Text>
              <Text style={styles.modalSubtitle}>Select a time:</Text>

              <View style={styles.quickTimesContainer}>
                <Text style={styles.quickTimesLabel}>Quick picks:</Text>
                {quickTimes.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeOption,
                      selectedTime === time.value && styles.timeOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTime(time.value);
                    }}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedTime === time.value && styles.timeOptionTextSelected,
                      ]}
                    >
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView style={styles.timePickerScroll} nestedScrollEnabled>
                <Text style={styles.quickTimesLabel}>Or choose another time:</Text>
                {timeOptions.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeOption,
                      selectedTime === time && styles.timeOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTime(time);
                    }}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedTime === time && styles.timeOptionTextSelected,
                      ]}
                    >
                      {formatTime(time)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setActionMode(null);
                    setSelectedTime(null);
                  }}
                  variant="secondary"
                  size="md"
                  style={styles.modalButton}
                />
                <Button
                  title={loading ? 'Accepting...' : 'Accept'}
                  onPress={() => {
                    if (selectedTime) {
                      handleAccept(selectedTime);
                    } else {
                      Alert.alert('Error', 'Please select a time');
                    }
                  }}
                  variant="primary"
                  size="md"
                  style={styles.modalButton}
                  disabled={loading || !selectedTime}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Alternates Modal */}
        <Modal
          visible={actionMode === 'alternates'}
          transparent
          animationType="slide"
          onRequestClose={() => setActionMode(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Suggest Alternates</Text>
              <Text style={styles.modalSubtitle}>
                Select up to 3 times within the window:
              </Text>
              <Text style={styles.modalHint}>
                Selected: {alternateTimes.length}/3
              </Text>

              <ScrollView style={styles.timePickerScroll} nestedScrollEnabled>
                {timeOptions.map((time, index) => {
                  const isSelected = alternateTimes.includes(time);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeOption,
                        isSelected && styles.timeOptionSelected,
                        !isSelected && alternateTimes.length >= 3 && styles.timeOptionDisabled,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleAlternateTime(time);
                      }}
                      disabled={!isSelected && alternateTimes.length >= 3}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          isSelected && styles.timeOptionTextSelected,
                        ]}
                      >
                        {formatTime(time)}
                      </Text>
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setActionMode(null);
                    setAlternateTimes([]);
                  }}
                  variant="secondary"
                  size="md"
                  style={styles.modalButton}
                />
                <Button
                  title={loading ? 'Sending...' : 'Send Alternates'}
                  onPress={handleAlternates}
                  variant="primary"
                  size="md"
                  style={styles.modalButton}
                  disabled={loading || alternateTimes.length === 0}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Decline Modal */}
        <Modal
          visible={actionMode === 'decline'}
          transparent
          animationType="slide"
          onRequestClose={() => setActionMode(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Decline Request</Text>
              <Text style={styles.modalSubtitle}>
                Optional message to diner:
              </Text>

              <Input
                placeholder="e.g., We're fully booked for this time..."
                value={declineMessage}
                onChangeText={setDeclineMessage}
                multiline
                numberOfLines={4}
                style={styles.messageInput}
                containerStyle={styles.messageInputContainer}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setActionMode(null);
                    setDeclineMessage('');
                  }}
                  variant="secondary"
                  size="md"
                  style={styles.modalButton}
                />
                <Button
                  title={loading ? 'Declining...' : 'Decline'}
                  onPress={handleDecline}
                  variant="secondary"
                  size="md"
                  style={[styles.modalButton, styles.declineButton]}
                  disabled={loading}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  statusPending: {
    backgroundColor: colors.status.warning + '20',
  },
  statusText: {
    ...typography.caption,
    color: colors.status.warning,
    fontWeight: '600',
    fontSize: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  notesRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.muted,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    width: '100%',
  },
  declineButton: {
    backgroundColor: colors.status.error + '20',
  },
  errorText: {
    ...typography.body,
    color: colors.status.error,
    textAlign: 'center',
    padding: spacing.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  modalHint: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  quickTimesContainer: {
    marginBottom: spacing.md,
  },
  quickTimesLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  timePickerScroll: {
    maxHeight: 300,
    marginBottom: spacing.md,
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeOptionSelected: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main,
  },
  timeOptionDisabled: {
    opacity: 0.5,
  },
  timeOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  timeOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary.main,
  },
  checkmark: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  messageInputContainer: {
    marginBottom: spacing.md,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
