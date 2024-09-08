const express = require('express');
const admin = require('./config/firebaseConfig'); // Import initialized Firebase app
const TelegramBot = require('node-telegram-bot-api');
const mqtt = require('mqtt');
const emcutiety = require('./config/emcutiety');
const teleContr = require('./controllers/TelegramController');
const apiRoutes = require('./routes/apiRoutes');
const cors = require('cors');

console.log("Starting server...");

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:3001', // Allow only this origin
  methods: 'GET,POST,PUT,DELETE',   // Allowed HTTP methods
  allowedHeaders: 'Content-Type,Authorization' // Allowed headers
}));

const token = emcutiety.telegrambotToken;
const bot = new TelegramBot(token, { polling: true });

const mqttClient = mqtt.connect(emcutiety.mqttUrl, {
  username: emcutiety.mqttUsername,
  password: emcutiety.mqttPassword,
  port: 8883,
  rejectUnauthorized: false,
});

app.use('/api', apiRoutes);

// Load TelegramController after Firebase is initialized
teleContr(bot, mqttClient);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
