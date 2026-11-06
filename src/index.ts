import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import db from './config/database';
import eventRoutes from './routes/eventRoutes';
import venueRoutes from './routes/venueRoutes';
import categoryRoutes from './routes/categoryRoutes';
import bookingRoutes from './routes/bookingRoutes';

dotenv.config();


db.any('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection error:', err));

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Tix API is running! 🎫' });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

