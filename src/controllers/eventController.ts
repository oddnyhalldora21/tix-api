import { Request, Response } from 'express';
import EventModel from '../models/event';


export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      venue_id: req.query.venue_id ? Number(req.query.venue_id) : undefined,
      city: req.query.city as string,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
    };

    const events = await EventModel.getAll(filters);
    
    res.json({
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};


export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = Number(req.params.id);
    
    const event = await EventModel.getById(eventId);
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};