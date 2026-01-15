import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { TableScheduleModal } from '../../components/TableScheduleModal';
import { AddBookingModal } from '../../components/AddBookingModal';
import { DraggableTable } from '../../components/DraggableTable';
import * as Haptics from 'expo-haptics';

// Extract radius values to constants for StyleSheet
const mapBorderRadius = radius.lg;
const tableBorderRadius = radius.full;
const badgeBorderRadius = radius.full;
const buttonBorderRadius = radius.xl;

const { width } = Dimensions.get('window');

export interface Table {
  id: string;
  number: number;
  capacity: number;
  x: number; // Position in grid (0-100%)
  y: number; // Position in grid (0-100%)
  status: 'available' | 'occupied' | 'reserved';
}

export interface TableBooking {
  id: string;
  tableId: string;
  guestName: string;
  partySize: number;
  startTime: Date;
  endTime: Date; // startTime + 2 hours
  status: 'confirmed' | 'pending';
}

// Mock data
const mockTables: Table[] = [
  { id: '1', number: 1, capacity: 2, x: 10, y: 10, status: 'available' },
  { id: '2', number: 2, capacity: 4, x: 30, y: 10, status: 'occupied' },
  { id: '3', number: 3, capacity: 2, x: 50, y: 10, status: 'reserved' },
  { id: '4', number: 4, capacity: 6, x: 70, y: 10, status: 'available' },
  { id: '5', number: 5, capacity: 2, x: 10, y: 30, status: 'available' },
  { id: '6', number: 6, capacity: 4, x: 30, y: 30, status: 'occupied' },
  { id: '7', number: 7, capacity: 2, x: 50, y: 30, status: 'available' },
  { id: '8', number: 8, capacity: 4, x: 70, y: 30, status: 'reserved' },
  { id: '9', number: 9, capacity: 8, x: 40, y: 50, status: 'available' },
  { id: '10', number: 10, capacity: 2, x: 10, y: 50, status: 'available' },
];

const mockBookings: TableBooking[] = [
  {
    id: 'b1',
    tableId: '2',
    guestName: 'John Smith',
    partySize: 3,
    startTime: new Date(new Date().setHours(18, 0, 0, 0)),
    endTime: new Date(new Date().setHours(20, 0, 0, 0)),
    status: 'confirmed',
  },
  {
    id: 'b2',
    tableId: '3',
    guestName: 'Sarah Johnson',
    partySize: 2,
    startTime: new Date(new Date().setHours(19, 30, 0, 0)),
    endTime: new Date(new Date().setHours(21, 30, 0, 0)),
    status: 'confirmed',
  },
  {
    id: 'b3',
    tableId: '6',
    guestName: 'Mike Davis',
    partySize: 4,
    startTime: new Date(new Date().setHours(20, 0, 0, 0)),
    endTime: new Date(new Date().setHours(22, 0, 0, 0)),
    status: 'confirmed',
  },
  {
    id: 'b4',
    tableId: '8',
    guestName: 'Emily Brown',
    partySize: 3,
    startTime: new Date(new Date().setHours(19, 0, 0, 0)),
    endTime: new Date(new Date().setHours(21, 0, 0, 0)),
    status: 'pending',
  },
];

export const TableMapScreen: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [bookings, setBookings] = useState<TableBooking[]>(mockBookings);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return colors.status.success;
      case 'occupied':
        return colors.status.error;
      case 'reserved':
        return colors.status.warning;
      default:
        return colors.text.muted;
    }
  };

  const getTableBookings = (tableId: string) => {
    return bookings.filter((b) => b.tableId === tableId);
  };

  const handleTablePress = (table: Table) => {
    setSelectedTable(table);
    setShowSchedule(true);
  };

  const handleAddBooking = (booking: TableBooking) => {
    setBookings([...bookings, booking]);
    
    // Update table status if needed
    const updatedTables = tables.map((t) =>
      t.id === booking.tableId ? { ...t, status: 'reserved' as const } : t
    );
    setTables(updatedTables);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddToWaitlist = (booking: TableBooking) => {
    setBookings([...bookings, booking]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleDeleteBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setBookings(bookings.filter((b) => b.id !== bookingId));
    
    // Update table status if no more bookings
    if (booking) {
      const tableBookings = bookings.filter((b) => b.tableId === booking.tableId && b.id !== bookingId);
      if (tableBookings.length === 0) {
        const updatedTables = tables.map((t) =>
          t.id === booking.tableId ? { ...t, status: 'available' as const } : t
        );
        setTables(updatedTables);
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddTable = () => {
    const newTableNumber = Math.max(...tables.map((t) => t.number), 0) + 1;
    const newTable: Table = {
      id: `table_${Date.now()}`,
      number: newTableNumber,
      capacity: 4,
      x: 50,
      y: 50,
      status: 'available',
    };
    setTables([...tables, newTable]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRemoveTable = (tableId: string) => {
    // Remove table and all its bookings
    setTables(tables.filter((t) => t.id !== tableId));
    setBookings(bookings.filter((b) => b.tableId !== tableId));
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
      setShowSchedule(false);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleTableMove = (tableId: string, newX: number, newY: number) => {
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));
    setTables(
      tables.map((t) =>
        t.id === tableId ? { ...t, x: clampedX, y: clampedY } : t
      )
    );
  };

  const getTableStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'checkmark-circle';
      case 'occupied':
        return 'close-circle';
      case 'reserved':
        return 'time';
      default:
        return 'ellipse';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Table Map</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.status.success }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.status.error }]} />
              <Text style={styles.legendText}>Occupied</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.status.warning }]} />
              <Text style={styles.legendText}>Reserved</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.mapContainer}>
            {tables.map((table) => {
              const tableBookings = getTableBookings(table.id);
              
              return (
                <DraggableTable
                  key={table.id}
                  table={table}
                  bookings={tableBookings}
                  onPress={() => handleTablePress(table)}
                  onMove={handleTableMove}
                  onRemove={handleRemoveTable}
                  getStatusColor={getTableStatusColor}
                  getStatusIcon={getTableStatusIcon}
                />
              );
            })}
          </View>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Today's Schedule</Text>
            <Text style={styles.infoText}>
              Tap on any table to view its detailed schedule
            </Text>
            <Text style={styles.infoText}>
              Each booking has a 2-hour window
            </Text>
          </Card>

          <View style={styles.actionButtons}>
            <Button
              title="Add New Booking"
              onPress={() => setShowAddBooking(true)}
              variant="primary"
              size="lg"
              style={styles.actionButton}
            />
            <Button
              title="Add Table"
              onPress={handleAddTable}
              variant="secondary"
              size="lg"
              style={styles.actionButton}
            />
          </View>
        </ScrollView>

        {selectedTable && (
          <TableScheduleModal
            visible={showSchedule}
            table={selectedTable}
            bookings={getTableBookings(selectedTable.id)}
            onClose={() => {
              setShowSchedule(false);
              setSelectedTable(null);
            }}
            onDeleteBooking={handleDeleteBooking}
            onUpdateTableCapacity={(tableId, newCapacity) => {
              setTables(tables.map((t) =>
                t.id === tableId ? { ...t, capacity: newCapacity } : t
              ));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          />
        )}

        <AddBookingModal
          visible={showAddBooking}
          table={selectedTable}
          tables={tables}
          existingBookings={bookings}
          onClose={() => {
            setShowAddBooking(false);
            setSelectedTable(null);
          }}
          onAddBooking={handleAddBooking}
          onAddToWaitlist={handleAddToWaitlist}
        />
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
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.elegant,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  mapContainer: {
    width: '100%',
    height: 500,
    backgroundColor: colors.background.secondary,
    borderRadius: mapBorderRadius,
    position: 'relative',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
  },
  table: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: tableBorderRadius,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  tableNumber: {
    ...typography.h4,
    fontWeight: '700',
    marginTop: spacing.xs / 2,
  },
  tableCapacity: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
  },
  bookingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary.main,
    borderRadius: badgeBorderRadius,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingBadgeText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: spacing.md,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
