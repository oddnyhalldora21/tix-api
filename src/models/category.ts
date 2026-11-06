import db from '../config/database';

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: Date;
}

class CategoryModel {
  
  async getAll(): Promise<Category[]> {
    return await db.any('SELECT * FROM categories ORDER BY name');
  }

  
  async getById(id: number): Promise<Category | null> {
    try {
      const category = await db.one('SELECT * FROM categories WHERE id = $1', [id]);
      return category;
    } catch (error) {
      return null;
    }
  }
}

export default new CategoryModel();