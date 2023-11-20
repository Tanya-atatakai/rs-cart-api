import { Client, ClientConfig } from 'pg';

const { PGHOST, PGPORT, PGNAME, PGUSERNAME, PGPASSWORD } = process.env;

export const config: ClientConfig = {
  host: PGHOST,
  port: parseInt(PGPORT, 10),
  database: PGNAME,
  user: PGUSERNAME,
  password: PGPASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
};

export const getPgClient = () => {
  const client = new Client(config);

  // Handle connection errors
  client.on('error', err => {
    console.error('PostgreSQL client error:', err.message);
  });

  return client;
};
