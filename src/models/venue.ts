import db from '../config/database';

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  created_at: Date;
}

class VenueModel {
 
  async getAll(): Promise<Venue[]> {
    return await db.any('SELECT * FROM venues ORDER BY name');
  }

 
  async getById(id: number): Promise<Venue | null> {
    try {
      const venue = await db.one('SELECT * FROM venues WHERE id = $1', [id]);
      return venue;
    } catch (error) {
      return null;
    }
  }

  // Get events at a specific venue
  async getEvents(venueId: number) {
    return await db.any(
      `SELECT e.*, c.name as category_name
       FROM events e
       JOIN categories c ON e.category_id = c.id
       WHERE e.venue_id = $1
       ORDER BY e.event_date ASC`,
      [venueId]
    );
  }
}

export default new VenueModel();