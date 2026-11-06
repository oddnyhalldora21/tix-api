import { Request, Response } from 'express';
import BookingModel from '../models/booking';
import { createBookingSchema } from '../utils/validation';


export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const validatedData = createBookingSchema.parse(req.body);

    const booking = await BookingModel.create(
      userId,
      validatedData.ticket_id,
      validatedData.quantity
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
    } else if (error.message === 'Not enough tickets available') {
      res.status(400).json({ error: error.message });
    } else if (error.message === 'Cannot book tickets for past events') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }
};


export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    
    const bookings = await BookingModel.getUserBookings(userId);
    
    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};


export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const bookingId = Number(req.params.id);

   
    const booking = await BookingModel.getById(bookingId);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

   
    if (booking.user_id !== userId) {
      res.status(403).json({ error: 'Not authorized to cancel this booking' });
      return;
    }

    await BookingModel.cancel(bookingId);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    if (error.message === 'Booking is already cancelled') {
      res.status(400).json({ error: error.message });
    } else if (error.message === 'Cannot cancel booking less than 24 hours before event') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }
};