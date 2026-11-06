import db from '../config/database';

export interface Booking {
  id: number;
  user_id: number;
  ticket_id: number;
  quantity: number;
  total_price: number;
  booking_date: Date;
  status: string;
}

export interface BookingWithDetails extends Booking {
  event_name: string;
  event_date: Date;
  venue_name: string;
  ticket_type: string;
  ticket_price: number;
}

class BookingModel {
  
  async create(userId: number, ticketId: number, quantity: number): Promise<Booking> {
    return await db.tx(async (t) => {
      
      const ticket = await t.one(
        'SELECT * FROM tickets WHERE id = $1',
        [ticketId]
      );

      
      if (ticket.available_quantity < quantity) {
        throw new Error('Not enough tickets available');
      }

     
      const event = await t.one(
        'SELECT event_date FROM events WHERE id = $1',
        [ticket.event_id]
      );

      if (new Date(event.event_date) < new Date()) {
        throw new Error('Cannot book tickets for past events');
      }

     
      const totalPrice = ticket.price * quantity;

     
      const booking = await t.one(
        `INSERT INTO bookings (user_id, ticket_id, quantity, total_price, status)
         VALUES ($1, $2, $3, $4, 'confirmed')
         RETURNING *`,
        [userId, ticketId, quantity, totalPrice]
      );

      
      await t.none(
        'UPDATE tickets SET available_quantity = available_quantity - $1 WHERE id = $2',
        [quantity, ticketId]
      );

      return booking;
    });
  }

  
  async getUserBookings(userId: number): Promise<BookingWithDetails[]> {
    return await db.any(
      `SELECT 
        b.*,
        e.name as event_name,
        e.event_date,
        v.name as venue_name,
        t.ticket_type,
        t.price as ticket_price
       FROM bookings b
       JOIN tickets t ON b.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       JOIN venues v ON e.venue_id = v.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC`,
      [userId]
    );
  }

  
  async getById(bookingId: number): Promise<BookingWithDetails | null> {
    try {
      const booking = await db.one(
        `SELECT 
          b.*,
          e.name as event_name,
          e.event_date,
          v.name as venue_name,
          t.ticket_type,
          t.price as ticket_price
         FROM bookings b
         JOIN tickets t ON b.ticket_id = t.id
         JOIN events e ON t.event_id = e.id
         JOIN venues v ON e.venue_id = v.id
         WHERE b.id = $1`,
        [bookingId]
      );
      return booking;
    } catch (error) {
      return null;
    }
  }

  
  async cancel(bookingId: number): Promise<void> {
    await db.tx(async (t) => {
      
      const booking = await t.one(
        `SELECT b.*, e.event_date
         FROM bookings b
         JOIN tickets t ON b.ticket_id = t.id
         JOIN events e ON t.event_id = e.id
         WHERE b.id = $1`,
        [bookingId]
      );

      
      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      
      const eventDate = new Date(booking.event_date);
      const now = new Date();
      const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilEvent < 24) {
        throw new Error('Cannot cancel booking less than 24 hours before event');
      }

      
      await t.none(
        `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
        [bookingId]
      );

      
      await t.none(
        'UPDATE tickets SET available_quantity = available_quantity + $1 WHERE id = $2',
        [booking.quantity, booking.ticket_id]
      );
    });
  }
}

export default new BookingModel();