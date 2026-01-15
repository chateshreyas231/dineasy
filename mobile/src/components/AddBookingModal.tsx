import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { colors, typography, spacing, radius } from '../theme';
import { Table, TableBooking } from '../screens/restaurant/TableMapScreen';
import { tableAssignmentService } from '../services/tableAssignmentService';
import * as Haptics from 'expo-haptics';

interface AddBookingModalProps {
  visible: boolean;
  table: Table | null;
  tables?: Table[];
  existingBookings: TableBooking[];
  onClose: () => void;
  onAddBooking: (booking: TableBooking) => void;
  onAddToWaitlist: (booking: TableBooking) => void;
}

// Extract radius values to constants
const modalBorderRadius = radius['2xl'];
const inputBorderRadius = radius.md;

export const AddBookingModal: React.FC<AddBookingModalProps> = ({
  visible,
  table,
  tables = [],
  existingBookings,
  onClose,
  onAddBooking,
  onAddToWaitlist,
}) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(table);
  const [guestName, setGuestName] = useState('');
  const [partySize, setPartySize] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (table) {
      setSelectedTable(table);
    } else if (tables.length > 0) {
      setSelectedTable(tables[0]);
    }
  }, [table, tables]);

  // Auto-assignment will be handled by the service

  const handleSubmit = () => {
    if (!guestName || !partySize || !date || !time) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);

    try {
      // Parse date and time
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      const requestedDateTime = new Date(year, month - 1, day, hours, minutes);

      // Use auto-assignment service
      const allTables = tables.length > 0 ? tables : (selectedTable ? [selectedTable] : []);
      const assignment = tableAssignmentService.autoAssign(
        {
          partySize: parseInt(partySize),
          dateTime: requestedDateTime,
          guestName,
          preferredTableId: selectedTable?.id,
        },
        allTables,
        existingBookings
      );

      if (assignment.success && assignment.booking) {
        onAddBooking(assignment.booking);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Create waitlist booking
        const endTime = new Date(requestedDateTime);
        endTime.setHours(endTime.getHours() + 2);
        const waitlistBooking: TableBooking = {
          id: `waitlist_${Date.now()}`,
          tableId: selectedTable?.id || '',
          guestName,
          partySize: parseInt(partySize),
          startTime: requestedDateTime,
          endTime,
          status: 'pending',
        };
        onAddToWaitlist(waitlistBooking);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // Reset form
      setGuestName('');
      setPartySize('');
      setDate('');
      setTime('');
      setSelectedTable(table || null);
      onClose();
    } catch (error) {
      console.error('Error adding booking:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const getDefaultTime = () => {
    const now = new Date();
    const nextHour = now.getHours() + 1;
    return `${String(nextHour).padStart(2, '0')}:00`;
  };

  if (!selectedTable && tables.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Add Booking</Text>
                {selectedTable && (
                  <Text style={styles.subtitle}>
                    Table {selectedTable.number} • Capacity: {selectedTable.capacity}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <Card style={styles.formCard}>
                {tables.length > 0 && !table && (
                  <View style={styles.tableSelector}>
                    <Text style={styles.label}>Select Table</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
                      {tables.map((t) => (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => setSelectedTable(t)}
                          style={[
                            styles.tableOption,
                            selectedTable?.id === t.id && styles.tableOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tableOptionText,
                              selectedTable?.id === t.id && styles.tableOptionTextSelected,
                            ]}
                          >
                            Table {t.number}
                          </Text>
                          <Text style={styles.tableOptionCapacity}>{t.capacity}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Input
                  placeholder="Guest Name"
                  value={guestName}
                  onChangeText={setGuestName}
                  leftIcon="person-outline"
                />

                <Input
                  placeholder="Party Size"
                  value={partySize}
                  onChangeText={setPartySize}
                  keyboardType="numeric"
                  leftIcon="people-outline"
                />

                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeInput}>
                    <Text style={styles.label}>Date</Text>
                    <Input
                      placeholder="YYYY-MM-DD"
                      value={date || getDefaultDate()}
                      onChangeText={setDate}
                      leftIcon="calendar-outline"
                    />
                  </View>

                  <View style={styles.dateTimeInput}>
                    <Text style={styles.label}>Time</Text>
                    <Input
                      placeholder="HH:MM"
                      value={time || getDefaultTime()}
                      onChangeText={setTime}
                      leftIcon="time-outline"
                    />
                  </View>
                </View>

                {selectedTable && parseInt(partySize) > selectedTable.capacity && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={20} color={colors.status.warning} />
                    <Text style={styles.warningText}>
                      Party size ({partySize}) exceeds table capacity ({selectedTable.capacity}). Will auto-assign to appropriate table.
                    </Text>
                  </View>
                )}

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.status.info} />
                  <Text style={styles.infoText}>
                    Table will be automatically assigned based on availability and optimal capacity matching.
                  </Text>
                </View>

                <Button
                  title="Add Booking"
                  onPress={handleSubmit}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={!guestName || !partySize || !date || !time || loading}
                  style={styles.submitButton}
                />
              </Card>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: modalBorderRadius,
    borderTopRightRadius: modalBorderRadius,
    maxHeight: '90%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.elegant,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: spacing.lg,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  dateTimeInput: {
    flex: 1,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.warning + '20',
    padding: spacing.md,
    borderRadius: inputBorderRadius,
    marginTop: spacing.md,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.status.warning,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.status.info + '15',
    padding: spacing.md,
    borderRadius: inputBorderRadius,
    marginTop: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.status.info,
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  tableSelector: {
    marginBottom: spacing.md,
  },
  tableScroll: {
    marginTop: spacing.sm,
  },
  tableOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: inputBorderRadius,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  tableOptionSelected: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main,
  },
  tableOptionText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tableOptionTextSelected: {
    color: colors.primary.main,
  },
  tableOptionCapacity: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs / 2,
  },
});
