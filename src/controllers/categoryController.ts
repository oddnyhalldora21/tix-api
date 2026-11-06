import { Request, Response } from 'express';
import CategoryModel from '../models/category';


export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.getAll();
    
    res.json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = Number(req.params.id);
    
    const category = await CategoryModel.getById(categoryId);
    
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};