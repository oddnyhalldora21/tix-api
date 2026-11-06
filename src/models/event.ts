import db from '../config/database';

export interface Event {
  id: number;
  name: string;
  description: string;
  event_date: Date;
  venue_id: number;
  category_id: number;
  created_at: Date;
  
  venue_name?: string;
  venue_city?: string;
  category_name?: string;
}

export interface EventFilters {
  category_id?: number;
  venue_id?: number;
  city?: string;
  date_from?: string;
  date_to?: string;
}

class EventModel {
  
  async getAll(filters: EventFilters = {}): Promise<Event[]> {
    let query = `
      SELECT 
        e.*,
        v.name as venue_name,
        v.city as venue_city,
        c.name as category_name
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (filters.category_id) {
      conditions.push(`e.category_id = $${paramCount++}`);
      values.push(filters.category_id);
    }

    if (filters.venue_id) {
      conditions.push(`e.venue_id = $${paramCount++}`);
      values.push(filters.venue_id);
    }

    if (filters.city) {
      conditions.push(`v.city ILIKE $${paramCount++}`);
      values.push(`%${filters.city}%`);
    }

    if (filters.date_from) {
      conditions.push(`e.event_date >= $${paramCount++}`);
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      conditions.push(`e.event_date <= $${paramCount++}`);
      values.push(filters.date_to);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.event_date ASC';

    return await db.any(query, values);
  }

  
 
  async getById(id: number): Promise<any | null> {
    try {
      const event = await db.one(
        `SELECT 
          e.*,
          v.name as venue_name,
          v.city as venue_city,
          v.address as venue_address,
          v.capacity as venue_capacity,
          c.name as category_name
        FROM events e
        JOIN venues v ON e.venue_id = v.id
        JOIN categories c ON e.category_id = c.id
        WHERE e.id = $1`,
        [id]
      );
      
     
      const tickets = await db.any(
        'SELECT * FROM tickets WHERE event_id = $1',
        [id]
      );
      
      return {
        ...event,
        tickets
      };
    } catch (error) {
      return null;
    }
  }

}

export default new EventModel();