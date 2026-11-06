import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import bookingRoutes from '../src/routes/bookingRoutes';
import db from '../src/config/database';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

describe('Booking Tests', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Booking Test User',
        email: `booking${Date.now()}@example.com`,
        password: 'password123',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/bookings - Create Booking', () => {
    it('should create a booking successfully', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticket_id: 1,
          quantity: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('booking');
      expect(response.body.booking.quantity).toBe(2);
      expect(response.body.booking.status).toBe('confirmed');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          ticket_id: 1,
          quantity: 1,
        });

      expect(response.status).toBe(401);
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticket_id: 1,
          // missing quantity
        });

      expect(response.status).toBe(400);
    });

    it('should fail with invalid quantity (negative)', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticket_id: 1,
          quantity: -5,
        });

      expect(response.status).toBe(400);
    });

    it('should fail when booking past event', async () => {
      // ticket_id 11 is for the past event (event 7)
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticket_id: 11,
          quantity: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('past');
    });

    it('should fail when requesting more tickets than available', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticket_id: 2, // VIP tickets - only 100 available
          quantity: 200, // Too many!
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Not enough tickets');
    });
  });

  describe('GET /api/bookings - Get User Bookings', () => {
    it('should get user bookings successfully', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookings');
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/bookings');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/bookings/:id - Cancel Booking', () => {
    let bookingId: number;

    beforeAll(async () => {
      // Create a booking to cancel
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticket_id: 3, // Handball game - far in future
          quantity: 2,
        });

      bookingId = response.body.booking.id;
    });

    it('should cancel booking successfully (more than 24 hours before event)', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('cancelled successfully');
    });

    it('should fail to cancel non-existent booking', async () => {
      const response = await request(app)
        .delete('/api/bookings/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/bookings/${bookingId}`);

      expect(response.status).toBe(401);
    });

    it('should fail when cancelling already cancelled booking', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already cancelled');
    });
  });
});