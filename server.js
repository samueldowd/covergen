// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
const PORT = process.env.PORT || 3000;

// Log the environment for debugging
console.log(`Application is running in ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} environment.`);

// Initialize Firebase Admin SDK
let firebaseConfig = {};

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseConfig.credential = cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS));
} else {
    firebaseConfig.credential = applicationDefault();
}

initializeApp(firebaseConfig);
const db = getFirestore();

// Middleware
app.use(express.json()); // for parsing application/json
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// API Endpoints

// GET all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobsRef = db.collection('jobs');
        const snapshot = await jobsRef.orderBy('date', 'desc').get();
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET a single job application by ID
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const jobDoc = await db.collection('jobs').doc(id).get();
        if (!jobDoc.exists) {
            return res.status(404).send('Application not found');
        }
        res.json({ id: jobDoc.id, ...jobDoc.data() });
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
        const jobRef = db.collection('jobs').doc(id);
        const jobDoc = await jobRef.get();
        if (!jobDoc.exists) {
            return res.status(404).send('Application not found');
        }
        await jobRef.update({ status });
        const updatedDoc = await jobRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
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
