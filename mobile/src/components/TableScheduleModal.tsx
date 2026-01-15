import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, typography, spacing, radius } from '../theme';
import { Table, TableBooking } from '../screens/restaurant/TableMapScreen';

interface TableScheduleModalProps {
  visible: boolean;
  table: Table;
  bookings: TableBooking[];
  onClose: () => void;
  onDeleteBooking?: (bookingId: string) => void;
  onUpdateTableCapacity?: (tableId: string, newCapacity: number) => void;
}

// Extract radius values to constants for StyleSheet
const modalBorderRadius = radius['2xl'];
const cardBorderRadius = radius.md;
const badgeBorderRadius = radius.sm;
const indicatorBorderRadius = radius.xs;
const inputBorderRadius = radius.sm;

// Generate time slots in 15-minute intervals for the day
const generateTimeSlots = (): Date[] => {
  const slots: Date[] = [];
  const start = new Date();
  start.setHours(11, 0, 0, 0); // 11 AM
  const end = new Date();
  end.setHours(23, 0, 0, 0); // 11 PM

  const current = new Date(start);
  while (current <= end) {
    slots.push(new Date(current));
    current.setMinutes(current.getMinutes() + 15);
  }

  return slots;
};

export const TableScheduleModal: React.FC<TableScheduleModalProps> = ({
  visible,
  table,
  bookings,
  onClose,
  onDeleteBooking,
  onUpdateTableCapacity,
}) => {
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [newCapacity, setNewCapacity] = useState(table.capacity.toString());

  useEffect(() => {
    setNewCapacity(table.capacity.toString());
  }, [table.capacity]);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const getSlotStatus = (slotTime: Date): {
    hasBooking: boolean;
    booking?: TableBooking;
    isStart: boolean;
    isEnd: boolean;
  } => {
    for (const booking of bookings) {
      const slotStart = new Date(slotTime);
      const slotEnd = new Date(slotTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + 15);

      // Check if this slot overlaps with booking
      if (slotStart < booking.endTime && slotEnd > booking.startTime) {
        const isStart = Math.abs(slotStart.getTime() - booking.startTime.getTime()) < 15 * 60 * 1000;
        const isEnd = Math.abs(slotEnd.getTime() - booking.endTime.getTime()) < 15 * 60 * 1000;
        
        return {
          hasBooking: true,
          booking,
          isStart,
          isEnd,
        };
      }
    }

    return { hasBooking: false, isStart: false, isEnd: false };
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: 'confirmed' | 'pending') => {
    return status === 'confirmed' ? colors.status.success : colors.status.warning;
  };

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
              <View style={styles.headerContent}>
                <Text style={styles.title}>Table {table.number}</Text>
                <View style={styles.capacityRow}>
                  {editingCapacity ? (
                    <View style={styles.capacityEdit}>
                      <TextInput
                        style={styles.capacityInput}
                        value={newCapacity}
                        onChangeText={setNewCapacity}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const capacity = parseInt(newCapacity);
                          if (capacity > 0 && onUpdateTableCapacity) {
                            onUpdateTableCapacity(table.id, capacity);
                            setEditingCapacity(false);
                          }
                        }}
                        style={styles.saveButton}
                      >
                        <Ionicons name="checkmark" size={20} color={colors.status.success} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCapacity(false);
                          setNewCapacity(table.capacity.toString());
                        }}
                        style={styles.cancelButton}
                      >
                        <Ionicons name="close" size={20} color={colors.text.muted} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setEditingCapacity(true)}
                      style={styles.capacityDisplay}
                    >
                      <Text style={styles.subtitle}>
                        Capacity: {table.capacity} • {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                      </Text>
                      <Ionicons name="pencil" size={16} color={colors.text.muted} style={styles.editIcon} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Bookings Summary */}
              {bookings.length > 0 ? (
                <Card style={styles.bookingsCard}>
                  <Text style={styles.sectionTitle}>Bookings for Table {table.number}</Text>
                  {bookings
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                    .map((booking) => (
                      <View key={booking.id} style={styles.bookingItem}>
                        <View style={styles.bookingHeader}>
                          <View style={styles.bookingInfo}>
                            <Text style={styles.guestName}>{booking.guestName}</Text>
                            <Text style={styles.bookingDetails}>
                              Party of {booking.partySize} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </Text>
                            <Text style={styles.bookingDate}>
                              {new Date(booking.startTime).toLocaleDateString()}
                            </Text>
                          </View>
                          <View style={styles.bookingActions}>
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(booking.status) + '20' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: getStatusColor(booking.status) },
                                ]}
                              >
                                {booking.status}
                              </Text>
                            </View>
                            {onDeleteBooking && (
                              <TouchableOpacity
                                onPress={() => onDeleteBooking(booking.id)}
                                style={styles.deleteButton}
                              >
                                <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                </Card>
              ) : (
                <Card style={styles.emptyCard}>
                  <Ionicons name="calendar-outline" size={48} color={colors.text.muted} />
                  <Text style={styles.emptyText}>No bookings for this table</Text>
                </Card>
              )}
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
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.elegant,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  capacityRow: {
    marginTop: spacing.xs,
  },
  capacityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  capacityEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  capacityInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: inputBorderRadius,
    borderWidth: 1,
    borderColor: colors.border.medium,
    minWidth: 60,
    textAlign: 'center',
  },
  saveButton: {
    padding: spacing.xs,
  },
  cancelButton: {
    padding: spacing.xs,
  },
  editIcon: {
    marginLeft: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  bookingsCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bookingItem: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: cardBorderRadius,
    marginBottom: spacing.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  bookingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  guestName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: badgeBorderRadius,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  bookingDetails: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs / 2,
  },
  bookingDate: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  scheduleCard: {
    margin: spacing.lg,
    marginTop: spacing.md,
  },
  scheduleGrid: {
    marginTop: spacing.md,
  },
  timeSlot: {
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    position: 'relative',
  },
  hourSlot: {
    borderBottomWidth: 2,
    borderBottomColor: colors.border.medium,
  },
  halfHourSlot: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border.light,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.text.muted,
    position: 'absolute',
    left: spacing.sm,
  },
  bookingIndicator: {
    position: 'absolute',
    left: 80,
    right: spacing.sm,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: indicatorBorderRadius,
  },
  bookingIndicatorText: {
    ...typography.caption,
    color: colors.text.primary,
    fontSize: 10,
  },
  emptyCard: {
    margin: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
