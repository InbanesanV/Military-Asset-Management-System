import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import db from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSchema() {
  console.log('🔧 Running database schema migration...');
  try {
    const schema = readFileSync(join(__dirname, '../schema.sql'), 'utf-8');
    await db.query(schema);
    console.log('✅ Schema applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema migration failed:', error.message);
    process.exit(1);
  }
}

runSchema();
