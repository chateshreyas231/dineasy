/**
 * Table Assignment Service
 * Automatically assigns tables based on availability, capacity, and efficiency
 */

import { Table, TableBooking } from '../screens/restaurant/TableMapScreen';

export interface BookingRequest {
  partySize: number;
  dateTime: Date;
  guestName: string;
  preferredTableId?: string;
}

export interface AssignmentResult {
  success: boolean;
  table?: Table;
  booking?: TableBooking;
  message: string;
  waitlist?: boolean;
}

class TableAssignmentService {
  /**
   * Find the best table for a booking request
   */
  findBestTable(
    request: BookingRequest,
    tables: Table[],
    existingBookings: TableBooking[]
  ): AssignmentResult {
    const { partySize, dateTime, guestName, preferredTableId } = request;
    const endTime = new Date(dateTime);
    endTime.setHours(endTime.getHours() + 2); // 2-hour window

    // Filter available tables
    const availableTables = tables.filter((table) => {
      // Check capacity
      if (partySize > table.capacity) {
        return false;
      }

      // Check if table is available at requested time
      const tableBookings = existingBookings.filter((b) => b.tableId === table.id);
      for (const booking of tableBookings) {
        if (
          (dateTime >= booking.startTime && dateTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (dateTime <= booking.startTime && endTime >= booking.endTime)
        ) {
          return false; // Conflict
        }
      }

      return true;
    });

    if (availableTables.length === 0) {
      return {
        success: false,
        message: 'No tables available at this time',
        waitlist: true,
      };
    }

    // If preferred table is available, use it
    if (preferredTableId) {
      const preferredTable = availableTables.find((t) => t.id === preferredTableId);
      if (preferredTable) {
        return {
          success: true,
          table: preferredTable,
          message: `Assigned to preferred table ${preferredTable.number}`,
        };
      }
    }

    // Score tables based on efficiency
    const scoredTables = availableTables.map((table) => {
      let score = 0;

      // Prefer tables that match party size exactly (minimize wasted capacity)
      const capacityDiff = table.capacity - partySize;
      if (capacityDiff === 0) {
        score += 100; // Perfect match
      } else if (capacityDiff <= 2) {
        score += 80 - capacityDiff * 10; // Close match
      } else {
        score += 50 - capacityDiff * 5; // Larger table, less efficient
      }

      // Prefer available tables over reserved
      if (table.status === 'available') {
        score += 20;
      } else if (table.status === 'reserved') {
        score += 10;
      }

      // Prefer smaller tables when party size is small (efficiency)
      if (partySize <= 2 && table.capacity <= 4) {
        score += 15;
      }

      // Prefer tables that are not currently occupied
      if (table.status !== 'occupied') {
        score += 10;
      }

      return { table, score };
    });

    // Sort by score (highest first)
    scoredTables.sort((a, b) => b.score - a.score);

    const bestTable = scoredTables[0].table;

    return {
      success: true,
      table: bestTable,
      message: `Assigned to table ${bestTable.number} (optimal capacity match)`,
    };
  }

  /**
   * Auto-assign table and create booking
   */
  autoAssign(
    request: BookingRequest,
    tables: Table[],
    existingBookings: TableBooking[]
  ): AssignmentResult {
    const assignment = this.findBestTable(request, tables, existingBookings);

    if (!assignment.success || !assignment.table) {
      return assignment;
    }

    const endTime = new Date(request.dateTime);
    endTime.setHours(endTime.getHours() + 2);

    const booking: TableBooking = {
      id: `booking_${Date.now()}`,
      tableId: assignment.table.id,
      guestName: request.guestName,
      partySize: request.partySize,
      startTime: request.dateTime,
      endTime,
      status: 'confirmed',
    };

    return {
      ...assignment,
      booking,
    };
  }

  /**
   * Find alternative tables if preferred is not available
   */
  findAlternatives(
    request: BookingRequest,
    tables: Table[],
    existingBookings: TableBooking[]
  ): Table[] {
    const assignment = this.findBestTable(request, tables, existingBookings);
    
    if (!assignment.success) {
      return [];
    }

    // Return top 3 alternatives
    const availableTables = tables.filter((table) => {
      if (request.partySize > table.capacity) return false;
      if (table.id === assignment.table?.id) return false; // Exclude already assigned

      const tableBookings = existingBookings.filter((b) => b.tableId === table.id);
      const endTime = new Date(request.dateTime);
      endTime.setHours(endTime.getHours() + 2);

      for (const booking of tableBookings) {
        if (
          (request.dateTime >= booking.startTime && request.dateTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (request.dateTime <= booking.startTime && endTime >= booking.endTime)
        ) {
          return false;
        }
      }
      return true;
    });

    // Sort by capacity difference (closest match first)
    return availableTables
      .sort((a, b) => {
        const diffA = Math.abs(a.capacity - request.partySize);
        const diffB = Math.abs(b.capacity - request.partySize);
        return diffA - diffB;
      })
      .slice(0, 3);
  }
}

export const tableAssignmentService = new TableAssignmentService();
