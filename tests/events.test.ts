import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import eventRoutes from '../src/routes/eventRoutes';
import venueRoutes from '../src/routes/venueRoutes';
import categoryRoutes from '../src/routes/categoryRoutes';

const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/categories', categoryRoutes);

describe('Events, Venues, and Categories Tests', () => {
  describe('GET /api/events - Get All Events', () => {
    it('should get all events successfully', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter events by category', async () => {
      const response = await request(app).get('/api/events?category_id=1');

      expect(response.status).toBe(200);
      expect(response.body.events.every((e: any) => e.category_id === 1)).toBe(true);
    });

    it('should filter events by city', async () => {
      const response = await request(app).get('/api/events?city=Reykjavík');

      expect(response.status).toBe(200);
      expect(response.body.events.every((e: any) => e.venue_city === 'Reykjavík')).toBe(true);
    });
  });

  describe('GET /api/events/:id - Get Single Event', () => {
    it('should get event by id successfully', async () => {
      const response = await request(app).get('/api/events/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('tickets');
      expect(Array.isArray(response.body.tickets)).toBe(true);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app).get('/api/events/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/venues - Get All Venues', () => {
    it('should get all venues successfully', async () => {
      const response = await request(app).get('/api/venues');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('venues');
      expect(Array.isArray(response.body.venues)).toBe(true);
    });
  });

  describe('GET /api/venues/:id - Get Single Venue', () => {
    it('should get venue by id successfully', async () => {
      const response = await request(app).get('/api/venues/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('capacity');
    });

    it('should return 404 for non-existent venue', async () => {
      const response = await request(app).get('/api/venues/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/venues/:id/events - Get Events at Venue', () => {
    it('should get events at venue successfully', async () => {
      const response = await request(app).get('/api/venues/1/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
    });
  });

  describe('GET /api/categories - Get All Categories', () => {
    it('should get all categories successfully', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
    });
  });

  describe('GET /api/categories/:id - Get Single Category', () => {
    it('should get category by id successfully', async () => {
      const response = await request(app).get('/api/categories/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app).get('/api/categories/99999');

      expect(response.status).toBe(404);
    });
  });
});