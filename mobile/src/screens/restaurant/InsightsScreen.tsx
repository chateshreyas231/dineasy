import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';

export function InsightsScreen() {
  const requestsReceived = 45;
  const confirmRate = 67; // percentage
  const avgResponseTime = 5; // minutes

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Insights" subtitle="Your restaurant performance" />

        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Requests Received</Text>
          <Text style={styles.metricValue}>{requestsReceived}</Text>
          <Text style={styles.metricPeriod}>This week</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Confirm Rate</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${confirmRate}%` }]} />
            </View>
            <Text style={styles.progressText}>{confirmRate}%</Text>
          </View>
          <Text style={styles.metricHint}>
            {confirmRate}% of requests were confirmed
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Average Response Time</Text>
          <Text style={styles.metricValue}>{avgResponseTime} min</Text>
          <Text style={styles.metricHint}>
            Time to respond to requests
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Peak Request Times</Text>
          <View style={styles.peakTimes}>
            <View style={styles.peakTimeItem}>
              <Text style={styles.peakTimeLabel}>6:00 PM - 7:00 PM</Text>
              <View style={styles.peakTimeBar}>
                <View style={[styles.peakTimeFill, { width: '85%' }]} />
              </View>
            </View>
            <View style={styles.peakTimeItem}>
              <Text style={styles.peakTimeLabel}>7:30 PM - 8:30 PM</Text>
              <View style={styles.peakTimeBar}>
                <View style={[styles.peakTimeFill, { width: '75%' }]} />
              </View>
            </View>
            <View style={styles.peakTimeItem}>
              <Text style={styles.peakTimeLabel}>8:45 PM - 9:45 PM</Text>
              <View style={styles.peakTimeBar}>
                <View style={[styles.peakTimeFill, { width: '60%' }]} />
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  metricPeriod: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
    minWidth: 50,
    textAlign: 'right',
  },
  metricHint: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  peakTimes: {
    gap: 16,
  },
  peakTimeItem: {
    marginBottom: 8,
  },
  peakTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  peakTimeBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  peakTimeFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
});

