// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Determine if we are running in a production environment (on App Engine)
const isProduction = process.env.NODE_ENV === 'production';

// Log the environment for debugging
console.log(`Application is running in ${isProduction ? 'Production' : 'Development'} environment.`);

// Set up PostgreSQL connection pool
let poolConfig;

if (isProduction) {
    // Configuration for App Engine using a Unix socket
    poolConfig = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        // The host should be the Unix socket path, which is located
        // at /cloudsql/[INSTANCE_CONNECTION_NAME]
        host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
        port: process.env.DB_PORT
    };
} else {
    // Configuration for local development
    poolConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };
}

// Log the connection configuration for debugging
console.log('Using pool configuration:', poolConfig);

const pool = new Pool(poolConfig);

// Connect to the database
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

// Middleware
app.use(express.json()); // for parsing application/json
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// API Endpoints

// GET all job jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET a single job application by ID
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Application not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// UPDATE the status of an application
app.put('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).send('Status is required');
        }
        const result = await pool.query(
            'UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Application not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Fallback to serve index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
