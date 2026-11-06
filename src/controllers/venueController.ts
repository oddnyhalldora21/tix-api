import { Request, Response } from 'express';
import VenueModel from '../models/venue';


export const getAllVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const venues = await VenueModel.getAll();
    
    res.json({
      count: venues.length,
      venues,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
};


export const getVenueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const venueId = Number(req.params.id);
    
    const venue = await VenueModel.getById(venueId);
    
    if (!venue) {
      res.status(404).json({ error: 'Venue not found' });
      return;
    }
    
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
};


export const getVenueEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const venueId = Number(req.params.id);
    
    
    const venue = await VenueModel.getById(venueId);
    if (!venue) {
      res.status(404).json({ error: 'Venue not found' });
      return;
    }
    
    const events = await VenueModel.getEvents(venueId);
    
    res.json({
      venue: venue.name,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venue events' });
  }
};