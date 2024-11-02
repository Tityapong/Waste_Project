import dotenv from 'dotenv';
dotenv.config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from './schema';

// Initialize connection using DATABASE_URL with non-null assertion
const sql = neon(process.env.DATABASE_URL!);

// Initialize drizzle with the SQL connection and schema
const db = drizzle(sql, { schema });
