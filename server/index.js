const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');
const { generateSecretKey } = require('./utils/generateSecreteKey');
const path = require('path');
const ngrok = require('@ngrok/ngrok');
const cron = require('node-cron'); // not required but useful for scheduling
const { createApiRouter } = require('./api');
require('dotenv').config();

const app = express();
let SECRET_KEY = null;

// Middleware to parse JSON requests
app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static(path.join(__dirname, '../dist'), { 'extensions': ['html', 'css', 'js'] }));

const uri = process.env.MONGO;
const client = new MongoClient(uri);

client.connect().then(async () => {
    const db = client.db("E-Learning");
    // Ensure unique indexes on email and name fields
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ name: 1 }, { unique: true });
    console.log("Successfully connected to MongoDB and ensured indexes");
}).catch(err => {
    console.error("Failed to connect:", err);
});

app.use('/api', createApiRouter({ client, getSecretKey: () => SECRET_KEY }));


// PlayBit
// home page route
app.get(/.*/, async (req, res) => {
    if (process.env.npm_lifecycle_event === 'start') {
        return res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    }
    else {
        return res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    }
});

let job = cron.schedule("* * * * * *", async () => {
    if (!SECRET_KEY) {
        SECRET_KEY = await generateSecretKey();
        console.log("Generated new SECRET_KEY");
    }
    job.stop();
    job = cron.schedule("0 0 * * *", async () => {
        SECRET_KEY = await generateSecretKey();
        console.log("Generated new SECRET_KEY");
    });
    console.log("✅ Switched to 24-hour schedule for both dice and questions");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});


const canRunNgrok = process.env.npm_lifecycle_event === 'pre:prod';
if (canRunNgrok) {
    ngrok.connect({ addr: PORT, authtoken: process.env.NGROK })
        .then(listener => console.log(`Ingress established at: ${listener.url()}`));
}