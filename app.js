const express = require('express');
const admin = require('./config/firebaseConfig'); // Import initialized Firebase app
const TelegramBot = require('node-telegram-bot-api');
const mqtt = require('mqtt');

const mqttController = require('./controllers/mqttController');
const firebaseController = require('./controllers/firebaseController');
const busController = require('./controllers/busController');
const mainController = require('./controllers/mainController');
const emcutiety = require('./config/emcutiety'); // Your configuration file

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

// Initialize TelegramBot with proper polling error handling
const token = emcutiety.telegrambotToken;
const bot = new TelegramBot(token, { 
  polling: {
    interval: 300, // Polling interval in ms
    autoStart: true,
    params: {
      timeout: 10 // Timeout in seconds for long polling
    }
  }
});

// Initialize MQTT Client
const mqttClient = mqtt.connect(emcutiety.mqttUrl, {
  username: emcutiety.mqttUsername,
  password: emcutiety.mqttPassword,
  port: 8883,
  rejectUnauthorized: false,
});

let subscribedTopics = {
  // Blue bus stops
  '/bus/blue/opphall11': '-',
  '/bus/blue/nanyangheights': '-',
  '/bus/blue/hall6': '-',
  '/bus/blue/opphall4': '-',
  '/bus/blue/oppyunnangarden': '-',
  '/bus/blue/oppspms': '-',
  '/bus/blue/oppwkwsci': '-',
  '/bus/blue/oppcee': '-',
  '/bus/blue/nieblk2': '-',
  '/bus/blue/opphall16': '-',
  '/bus/blue/opphall14': '-',
  '/bus/blue/oppnycreshalls': '-',
  
  // Red bus stops
  '/bus/red/hall11blk55': '-',
  '/bus/red/nanyangcrescenthalls': '-',
  '/bus/red/hall12': '-',
  '/bus/red/leeweenamlib': '-',
  '/bus/red/schofbiologicalsciences': '-',
  '/bus/red/wkwsci': '-',
  '/bus/red/spms': '-',
  '/bus/red/gaia': '-',
  '/bus/red/hall4': '-',
  '/bus/red/hall1': '-',
  '/bus/red/hall2': '-',
  '/bus/red/hall8and9': '-',
  '/bus/red/hall11': '-',

  // Green bus stops
  '/bus/green/hall1': '-',
  '/bus/green/hall2': '-',
  '/bus/green/unihealth': '-',
  '/bus/green/tctlt': '-',
  '/bus/green/opphall2': '-',

  // Brown bus stops
  '/bus/brown/hall1': '-',
  '/bus/brown/hall2': '-',
  '/bus/brown/unihealth': '-',
  '/bus/brown/tctlt': '-',
  '/bus/brown/schofadm': '-',
  '/bus/brown/leeweenamlib': '-',
  '/bus/brown/schofcee': '-',
  '/bus/brown/schofbiologicalsciences': '-',
  '/bus/brown/wkwsci': '-',
  '/bus/brown/spms': '-',
  '/bus/brown/gaia': '-',
  '/bus/brown/hall4': '-',
  '/bus/brown/hall5': '-',

  'sniffcount': '-'
};

// Prepopulate chatIdsPerTopic
let chatIdsPerTopic = {
  // Blue bus stops
  '/bus/blue/opphall11': 0,
  '/bus/blue/nanyangheights': 0,
  '/bus/blue/hall6': 0,
  '/bus/blue/opphall4': 0,
  '/bus/blue/oppyunnangarden': 0,
  '/bus/blue/oppspms': 0,
  '/bus/blue/oppwkwsci': 0,
  '/bus/blue/oppcee': 0,
  '/bus/blue/nieblk2': 0,
  '/bus/blue/opphall16': 0,
  '/bus/blue/opphall14': 0,
  '/bus/blue/oppnycreshalls': 0,

  // Red bus stops
  '/bus/red/hall11blk55': 0,
  '/bus/red/nanyangcrescenthalls': 0,
  '/bus/red/hall12': 0,
  '/bus/red/leeweenamlib': 0,
  '/bus/red/schofbiologicalsciences': 0,
  '/bus/red/wkwsci': 0,
  '/bus/red/spms': 0,
  '/bus/red/gaia': 0,
  '/bus/red/hall4': 0,
  '/bus/red/hall1': 0,
  '/bus/red/hall2': 0,
  '/bus/red/hall8and9': 0,
  '/bus/red/hall11': 0,

  // Green bus stops
  '/bus/green/hall1': 0,
  '/bus/green/hall2': 0,
  '/bus/green/unihealth': 0,
  '/bus/green/tctlt': 0,
  '/bus/green/opphall2': 0,

  // Brown bus stops
  '/bus/brown/hall1': 0,
  '/bus/brown/hall2': 0,
  '/bus/brown/unihealth': 0,
  '/bus/brown/tctlt': 0,
  '/bus/brown/schofadm': 0,
  '/bus/brown/leeweenamlib': 0,
  '/bus/brown/schofcee': 0,
  '/bus/brown/schofbiologicalsciences': 0,
  '/bus/brown/wkwsci': 0,
  '/bus/brown/spms': 0,
  '/bus/brown/gaia': 0,
  '/bus/brown/hall4': 0,
  '/bus/brown/hall5': 0,

  'sniffcount': 0
};

app.use('/api', apiRoutes);

// Load all controllers
mqttController(bot, mqttClient, subscribedTopics, chatIdsPerTopic);   // Handling MQTT functionality
firebaseController(bot);          // Handling Firebase operations

// Pass busController functions to mainController to handle routing
mainController(bot, busController(bot, subscribedTopics)); 

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
