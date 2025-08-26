// Load environment variables from .env file
require('dotenv').config();

// --- ADD THESE LINES FOR DEBUGGING ---
console.log("--- Loading .env variables ---");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_PORT:", process.env.DB_PORT);
// For security, it's better not to log the password, but check it's not undefined.
console.log("DB_PASSWORD is set:", !!process.env.DB_PASSWORD); 
console.log("----------------------------");

const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

// Middleware
app.use(express.json()); // for parsing application/json
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// API Endpoints

// GET all job applications
app.get('/api/applications', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM applications ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET a single job application by ID
app.get('/api/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
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
app.put('/api/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).send('Status is required');
        }
        const result = await pool.query(
            'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
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