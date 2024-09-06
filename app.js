const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const mqtt = require('mqtt');

const emcutiety = require('./credentials/emcutiety');

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

let lastMQTTMessage = ''; 


mqttClient.on('connect', () => {
  console.log('Connected to HiveMQ MQTT broker');


  mqttClient.subscribe('iot/test', (err) => {
    if (!err) {
      console.log('Subscribed to topic: iot/test');
    }
  });
});

mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});



mqttClient.on('message', (topic, message) => {
  const receivedMessage = message.toString();
  console.log(`Received message from topic ${topic}: ${receivedMessage}`);


  lastMQTTMessage = receivedMessage;
});


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.split(' ');


  if (text[0].toLowerCase() === 'addmqtt' && text.length > 1) {
    const mqttMessage = text.slice(1).join(' ');

    mqttClient.publish('iot/test', mqttMessage, () => {
      bot.sendMessage(chatId, `Published message: "${mqttMessage}" to the topic 'iot/test'`);
    });

 
  } else if (text[0].toLowerCase() === 'storemqtt') {
    if (lastMQTTMessage) {
      const newRef = database.ref('/mqtt/messages').push();
      newRef.set({ message: lastMQTTMessage }).then(() => {
        bot.sendMessage(chatId, `Stored last MQTT message: "${lastMQTTMessage}" in Firebase.`);
      }).catch(error => {
        bot.sendMessage(chatId, `Error storing data in Firebase: ${error.message}`);
      });
    } else {
      bot.sendMessage(chatId, 'No MQTT message to store.');
    }


  } else if (text[0].toLowerCase() === 'viewmqtt') {
    database.ref('/mqtt/messages').once('value').then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data).map(item => `Message: ${item.message}`).join('\n');
        bot.sendMessage(chatId, `Stored MQTT Messages:\n${messages}`);
      } else {
        bot.sendMessage(chatId, 'No MQTT messages found.');
      }
    }).catch(error => {
      bot.sendMessage(chatId, `Error fetching data: ${error.message}`);
    });


  } else if (text[0].toLowerCase() === 'add' && text.length > 1) {
    const dataToAdd = text.slice(1).join(' ');  
    const newRef = database.ref('/messages').push();
    newRef.set({ message: dataToAdd }).then(() => {
      bot.sendMessage(chatId, `Added: ${dataToAdd}`);
    }).catch(error => {
      bot.sendMessage(chatId, `Error adding data: ${error.message}`);
    });


  } else if (text[0].toLowerCase() === 'view') {
    database.ref('/messages').once('value').then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data).map(item => item.message).join('\n');
        bot.sendMessage(chatId, `Messages:\n${messages}`);
      } else {
        bot.sendMessage(chatId, 'No messages found.');
      }
    }).catch(error => {
      bot.sendMessage(chatId, `Error fetching data: ${error.message}`);
    });


  } else if (text[0].toLowerCase() === 'update' && text.length > 2) {
    const oldMessage = text[1];
    const newMessage = text.slice(2).join(' ');
    database.ref('/messages').once('value').then((snapshot) => {
      const data = snapshot.val();
      let updated = false;
      for (const key in data) {
        if (data[key].message === oldMessage) {
          database.ref(`/messages/${key}`).update({ message: newMessage });
          updated = true;
          bot.sendMessage(chatId, `Updated: "${oldMessage}" to "${newMessage}"`);
          break;
        }
      }
      if (!updated) {
        bot.sendMessage(chatId, `Message "${oldMessage}" not found.`);
      }
    }).catch(error => {
      bot.sendMessage(chatId, `Error updating data: ${error.message}`);
    });

  } else if (text[0].toLowerCase() === 'delete' && text.length > 1) {
    const messageToDelete = text.slice(1).join(' ');
    database.ref('/messages').once('value').then((snapshot) => {
      const data = snapshot.val();
      let deleted = false;
      for (const key in data) {
        if (data[key].message === messageToDelete) {
          database.ref(`/messages/${key}`).remove();
          deleted = true;
          bot.sendMessage(chatId, `Deleted: "${messageToDelete}"`);
          break;
        }
      }
      if (!deleted) {
        bot.sendMessage(chatId, `Message "${messageToDelete}" not found.`);
      }
    }).catch(error => {
      bot.sendMessage(chatId, `Error deleting data: ${error.message}`);
    });


  } else {
    bot.sendMessage(chatId, 'Unknown command. Use "addMQTT <string>", "storeMQTT", "viewMQTT", "add", "view", "update", or "delete".');
  }
});


app.get('/api/your-endpoint', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
