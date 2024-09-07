const firebaseService = require('../services/firebaseServices');

module.exports = (bot, mqttClient) => {
  let lastMQTTMessage = '';
  let subscribedTopics = {};
  let lastMQTTTopic = '';
  let chatIdsPerTopic = {};  // Store the chatId for each subscribed topic

  // Handle incoming MQTT messages (set up this listener once)
  mqttClient.on('message', (topic, message) => {
    lastMQTTMessage = message.toString();
    lastMQTTTopic = topic;
    console.log(`Received message from topic ${topic}: ${lastMQTTMessage}`);

    

    
    // Store the latest message for the subscribed topic
    subscribedTopics[topic] = lastMQTTMessage;

    const chatId = chatIdsPerTopic[topic];

    // Notify users about the latest message on the subscribed topic
    if (chatId) {
      bot.sendMessage(chatId, `The topic '${topic}' consists of: "${lastMQTTMessage}"`);
    }
  });

  // Handle bot commands
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.split(' ');

    // Command: addmqtt
    if (text[0].toLowerCase() === 'addmqtt' && text.length > 1) {
      const mqttMessage = text.slice(1).join(' ');
      mqttClient.publish('iot/test', mqttMessage, () => {
        bot.sendMessage(chatId, `Published message: "${mqttMessage}" to the topic 'iot/test'`);
      });

    // Command: storemqtt
    } else if (text[0].toLowerCase() === 'storemqtt') {
      if (lastMQTTMessage) {
        // Store the last MQTT message and topic using the firebaseService
        firebaseService.storeData('/mqtt/messages', { message: `${lastMQTTMessage} from ${lastMQTTTopic}` })
          .then(() => {
            bot.sendMessage(chatId, `Stored last MQTT message: "${lastMQTTMessage}" from ${lastMQTTTopic} in Firebase.`);
          })
          .catch(error => {
            bot.sendMessage(chatId, `Error storing data in Firebase: ${error.message}`);
          });
      } else {
        bot.sendMessage(chatId, 'No MQTT message to store.');
      }
    }
     else if (text[0].toLowerCase() === 'viewmqtt') {
      // Fetch data using firebaseService
      firebaseService.getData('/mqtt/messages')
        .then((data) => {
          if (data) {
            const messages = Object.values(data).map(item => `Message: ${item.message}`).join('\n');
            bot.sendMessage(chatId, `Stored MQTT Messages:\n${messages}`);
          } else {
            bot.sendMessage(chatId, 'No MQTT messages found.');
          }
        })
        .catch(error => {
          bot.sendMessage(chatId, `Error fetching data: ${error.message}`);
        });

    // Command: add
    } else if (text[0].toLowerCase() === 'add' && text.length > 1) {
      const dataToAdd = { message: text.slice(1).join(' ') };
      // Store the message using firebaseService
      firebaseService.storeData('/messages', dataToAdd)
        .then(() => {
          bot.sendMessage(chatId, `Added: ${dataToAdd.message}`);
        })
        .catch(error => {
          bot.sendMessage(chatId, `Error adding data: ${error.message}`);
        });

    // Command: view
    } else if (text[0].toLowerCase() === 'view') {
      // Fetch data using firebaseService
      firebaseService.getData('/messages')
        .then((data) => {
          if (data) {
            const messages = Object.values(data).map(item => item.message).join('\n');
            bot.sendMessage(chatId, `Messages:\n${messages}`);
          } else {
            bot.sendMessage(chatId, 'No messages found.');
          }
        })
        .catch(error => {
          bot.sendMessage(chatId, `Error fetching data: ${error.message}`);
        });

    // Command: update
    } else if (text[0].toLowerCase() === 'update' && text.length > 2) {
      const oldMessage = text[1];
      const newMessage = { message: text.slice(2).join(' ') };
      
      // Fetch and update data using firebaseService
      firebaseService.getData('/messages')
        .then((data) => {
          let updated = false;
          for (const key in data) {
            if (data[key].message === oldMessage) {
              firebaseService.updateData(`/messages/${key}`, newMessage)
                .then(() => {
                  bot.sendMessage(chatId, `Updated: "${oldMessage}" to "${newMessage.message}"`);
                });
              updated = true;
              break;
            }
          }
          if (!updated) {
            bot.sendMessage(chatId, `Message "${oldMessage}" not found.`);
          }
        })
        .catch(error => {
          bot.sendMessage(chatId, `Error updating data: ${error.message}`);
        });

    // Command: delete
    } else if (text[0].toLowerCase() === 'delete' && text.length > 1) {
      const messageToDelete = text.slice(1).join(' ');

      // Fetch and delete data using firebaseService
      firebaseService.getData('/messages')
        .then((data) => {
          let deleted = false;
          for (const key in data) {
            if (data[key].message === messageToDelete) {
              firebaseService.deleteData(`/messages/${key}`)
                .then(() => {
                  bot.sendMessage(chatId, `Deleted: "${messageToDelete}"`);
                });
              deleted = true;
              break;
            }
          }
          if (!deleted) {
            bot.sendMessage(chatId, `Message "${messageToDelete}" not found.`);
          }
        })
        .catch(error => {
          bot.sendMessage(chatId, `Error deleting data: ${error.message}`);
        });

    // Command: publish topic/message
    } else if (text[0].toLowerCase() === 'publish' && text.length > 2) {
      const topicName = text[1]; // topic/name
      const mqttMessage = text.slice(2).join(' '); // the string to publish
      mqttClient.publish(topicName, mqttMessage, {retain: true}, () => {
        // Simulate message reception for self-published messages
        lastMQTTMessage = mqttMessage;
        lastMQTTTopic = topicName;  // Update the last topic
        subscribedTopics[topicName] = mqttMessage;  // Update the topic's message in the map
        bot.sendMessage(chatId, `Published message: "${mqttMessage}" to the topic '${topicName}'`);
      });
    }
     else if (text[0].toLowerCase() === 'subscribe' && text.length > 1) {
      const topicName = text[1]; // topic/name
    
      // Subscribe to the given topic
      mqttClient.subscribe(topicName, (err) => {
        if (!err) {
          bot.sendMessage(chatId, `Subscribed to topic: ${topicName}`);
    
          // Placeholder message until a message is received
          subscribedTopics[topicName] = 'No messages received yet.';

          chatIdsPerTopic[topicName] = chatId;  // Store the chatId for the topic
    
        } else {
          bot.sendMessage(chatId, `Error subscribing to topic: ${topicName}`);
        }
      });

    // Command: storemqtt (store the latest message in Firebase)
    }

    else if (text[0].toLowerCase() === 'showsubscribed') {
      if (Object.keys(chatIdsPerTopic).length === 0) {
        bot.sendMessage(chatId, 'No topics are currently subscribed.');
      } else {
        let messageList = 'Currently Subscribed Topics and Latest Messages:\n';
        
        // Loop through each topic in chatIdsPerTopic
        Object.keys(chatIdsPerTopic).forEach((topic) => {
          const latestMessage = subscribedTopics[topic] || 'No messages received yet';
          messageList += `- ${topic}: "${latestMessage}"\n`;
        });
        
        bot.sendMessage(chatId, messageList);
      }
    }
    
    
    
     else {
      bot.sendMessage(chatId, 'Unknown command. Use "addMQTT <string>", "storeMQTT", "viewMQTT", "add", "view", "update", or "delete".');
    }
  });
};
