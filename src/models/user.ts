import db from '../config/database';
import { hashPassword } from '../utils/auth';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

class UserModel {
  
  async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await db.one(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [userData.name, userData.email, hashedPassword]
    );
    
    return user;
  }

  
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await db.one('SELECT * FROM users WHERE email = $1', [email]);
      return user;
    } catch (error) {
      return null;
    }
  }

  
  async findById(id: number): Promise<User | null> {
    try {
      const user = await db.one('SELECT * FROM users WHERE id = $1', [id]);
      return user;
    } catch (error) {
      return null;
    }
  }

  
  async update(id: number, userData: UpdateUserData): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.name) {
      updates.push(`name = $${paramCount++}`);
      values.push(userData.name);
    }

    if (userData.email) {
      updates.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }

    if (userData.password) {
      const hashedPassword = await hashPassword(userData.password);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const user = await db.one(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, name, email, created_at, updated_at`,
      values
    );

    return user;
  }

  
  async delete(id: number): Promise<void> {
    await db.none('DELETE FROM users WHERE id = $1', [id]);
  }
}

export default new UserModel();