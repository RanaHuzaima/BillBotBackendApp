const express = require('express');
const bodyParser = require('body-parser');
const { Client, Databases, Query } = require('node-appwrite');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json());

// Appwrite Client Setup
const client = new Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTION_ID = process.env.COLLECTION_ID;

// API to Get All Users
app.get('/api/v1/users', async (req, res) => {
    try {
        const users = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        res.json(users.documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to Add a User
app.post('/api/v1/users', async (req, res) => {
    const { name, email, machineId } = req.body;
    try {
        const newUser = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            'unique()',
            { name, email, machineId }
        );
        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to Update a User
app.put('/api/v1/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, machineId } = req.body;
    try {
        const updatedUser = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            userId,
            { name, email, machineId }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to Verify Machine ID
app.post('/api/v1/verify-machine', async (req, res) => {
    const { machineId } = req.body;
    try {
        const users = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('machineId', machineId), // Correct syntax for querying
        ]);
        if (users.documents.length > 0) {
            res.json({ verified: true, user: users.documents[0] });
        } else {
            res.json({ verified: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
