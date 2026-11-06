import { Request, Response } from 'express';
import UserModel from '../models/user';
import { registerSchema, loginSchema } from '../utils/validation';
import { comparePassword, generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const validatedData = registerSchema.parse(req.body);

    
    const existingUser = await UserModel.findByEmail(validatedData.email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

   
    const user = await UserModel.create(validatedData);

    
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.issues });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const validatedData = loginSchema.parse(req.body);

    
    const user = await UserModel.findByEmail(validatedData.email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

   
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
} catch (error: any) {
    console.error('Login error:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.issues });
    } else {
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  }
};