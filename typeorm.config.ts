import { config } from 'dotenv';
import { DataSource } from 'typeorm';
const env = process.env.NODE_ENV || 'development';

config({
  path: `.env.${env}`,
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/entities/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
});
