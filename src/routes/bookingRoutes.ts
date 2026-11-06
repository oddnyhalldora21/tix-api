import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();


router.use(authenticate);


router.post('/', createBooking);


router.get('/', getUserBookings);


router.delete('/:id', cancelBooking);

export default router;