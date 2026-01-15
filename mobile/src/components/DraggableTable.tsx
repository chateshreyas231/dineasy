import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import { Table, TableBooking } from '../screens/restaurant/TableMapScreen';
import * as Haptics from 'expo-haptics';

interface DraggableTableProps {
  table: Table;
  bookings: TableBooking[];
  onPress: () => void;
  onMove: (tableId: string, x: number, y: number) => void;
  onRemove: (tableId: string) => void;
  getStatusColor: (status: Table['status']) => string;
  getStatusIcon: (status: Table['status']) => string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 32; // Account for padding
const TABLE_SIZE = 60;

// Extract radius values
const tableBorderRadius = radius.full;
const removeButtonRadius = radius.full;

export const DraggableTable: React.FC<DraggableTableProps> = ({
  table,
  bookings,
  onPress,
  onMove,
  onRemove,
  getStatusColor,
  getStatusIcon,
}) => {
  const [showRemove, setShowRemove] = useState(false);
  const [position, setPosition] = useState({ x: table.x, y: table.y });
  const startPosition = useRef({ x: table.x, y: table.y });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start dragging if movement is significant (to avoid interfering with tap)
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        startPosition.current = { x: position.x, y: position.y };
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (evt, gestureState) => {
        const deltaXPercent = (gestureState.dx / MAP_WIDTH) * 100;
        const deltaYPercent = (gestureState.dy / 500) * 100;
        
        const newX = Math.max(0, Math.min(100, startPosition.current.x + deltaXPercent));
        const newY = Math.max(0, Math.min(100, startPosition.current.y + deltaYPercent));
        
        setPosition({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        onMove(table.id, position.x, position.y);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
    })
  ).current;

  const statusColor = getStatusColor(table.status);

  // Update position when table prop changes
  useEffect(() => {
    setPosition({ x: table.x, y: table.y });
  }, [table.x, table.y]);

  return (
    <View
      style={[
        styles.tableContainer,
        {
          left: `${position.x}%`,
          top: `${position.y}%`,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[
          styles.table,
          {
            backgroundColor: statusColor + '20',
            borderColor: statusColor,
          },
        ]}
        onPress={onPress}
        onLongPress={() => {
          setShowRemove(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        activeOpacity={0.7}
      >
          <Ionicons
            name={getStatusIcon(table.status) as any}
            size={20}
            color={statusColor}
          />
          <Text style={[styles.tableNumber, { color: statusColor }]}>
            {table.number}
          </Text>
          <Text style={styles.tableCapacity}>{table.capacity}</Text>
          {bookings.length > 0 && (
            <View style={styles.bookingBadge}>
              <Text style={styles.bookingBadgeText}>{bookings.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {showRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              onRemove(table.id);
              setShowRemove(false);
            }}
          >
            <Ionicons name="close-circle" size={24} color={colors.status.error} />
          </TouchableOpacity>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    position: 'absolute',
    width: TABLE_SIZE,
    height: TABLE_SIZE,
  },
  table: {
    width: TABLE_SIZE,
    height: TABLE_SIZE,
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
    borderRadius: removeButtonRadius,
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
  removeButton: {
    position: 'absolute',
    top: -30,
    right: -10,
    backgroundColor: colors.background.card,
    borderRadius: removeButtonRadius,
    padding: spacing.xs,
  },
});
