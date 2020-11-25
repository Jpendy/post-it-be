/* eslint-disable indent */
require('dotenv').config();

const pg = require('pg');

const Client = pg.Client;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE && { rejectUnauthorized: false }
});

module.exports = client;
