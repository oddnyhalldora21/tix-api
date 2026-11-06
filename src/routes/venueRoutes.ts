import { Router } from 'express';
import { getAllVenues, getVenueById, getVenueEvents } from '../controllers/venueController';

const router = Router();


router.get('/', getAllVenues);


router.get('/:id', getVenueById);


router.get('/:id/events', getVenueEvents);

export default router;