import { Request, Response } from 'express';
import UserModel from '../models/user';
import { updateUserSchema } from '../utils/validation';


export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!; 
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};


export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const validatedData = updateUserSchema.parse(req.body);
    
    
    if (validatedData.email) {
      const existingUser = await UserModel.findByEmail(validatedData.email);
      if (existingUser && existingUser.id !== userId) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }
    
    const updatedUser = await UserModel.update(userId, validatedData);
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};


export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    
    await UserModel.delete(userId);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};