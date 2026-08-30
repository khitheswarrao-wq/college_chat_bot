const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
  return client.query('SELECT id, name, status, "processingError" FROM documents ORDER BY "createdAt" DESC LIMIT 5');
}).then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  client.end();
}).catch(e => {
  console.error(e);
  client.end();
});
