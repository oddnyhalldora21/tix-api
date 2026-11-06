import { beforeAll, afterAll } from 'vitest';
import db from '../src/config/database';

beforeAll(async () => {
  // You could set up test database here if needed
  console.log('🧪 Tests starting...');
});

afterAll(async () => {
  // Close database connection after all tests
  db.$pool.end();
  console.log('✅ Tests completed');
});