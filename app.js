const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const mqtt = require('mqtt');
const emcutiety = require('./credentials/emcutiety');
const teleContr = require('./controllers/TelegramController');  // Import the controller

console.log("ehlllo?");

const serviceAccount = require('./firebase-service-account.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: emcutiety.firebaseUrl
});

const database = admin.database();
const app = express();
const port = 3000;

const token = emcutiety.telegrambotToken;
const bot = new TelegramBot(token, { polling: true });

const mqttClient = mqtt.connect(emcutiety.mqttUrl, {
  username: emcutiety.mqttUsername, 
  password: emcutiety.mqttPassword,
  port: 8883, 
  rejectUnauthorized: false
});

// Call the TelegramController and pass the bot, mqttClient, and database
teleContr(bot, mqttClient, database);

app.get('/api/your-endpoint', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
