const firebaseService = require('../services/firebaseServices');

module.exports = (bot, mqttClient) => {
  let lastMQTTMessage = '';
  let subscribedTopics = {
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
    'sniffcount': '-'
  };
  let lastMQTTTopic = '';
  // Prepopulate chatIdsPerTopic
let chatIdsPerTopic = {
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
  'sniffcount': 0
};
  // Store the chatId for each subscribed topic


  // Subscribe to all predefined topics on MQTT client connection
mqttClient.on('connect', () => {
  Object.keys(subscribedTopics).forEach(topic => {
    mqttClient.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);

        subscribedTopics[topic] = `Subscribed to ${topic}, waiting for data...`;
      } else {
        console.log(`Failed to subscribe to topic: ${topic}`);
      }
    });
  });
});


  // Handle incoming MQTT messages (set up this listener once)
  mqttClient.on('message', (topic, message) => {
    const lastMQTTMessage = message.toString();
    const lastMQTTTopic = topic;
    const timestamp = new Date().toISOString();  // Store the current timestamp
  
    console.log(`Received message from topic ${topic}: ${lastMQTTMessage} at ${timestamp}`);
  
    // Store the latest message for the subscribed topic
    subscribedTopics[topic] = lastMQTTMessage;
  
    const chatId = chatIdsPerTopic[topic];
  
    // Notify users about the latest message on the subscribed topic
    if (chatId) {
      bot.sendMessage(chatId, `The topic '${topic}' consists of: "${lastMQTTMessage}" at ${timestamp}`);
    }
  
    //uncomment only if u want to push data to firebase
    const firebasePath = topic.replace(/\//g, '/'); // Path structure remains the same
    // First, check if this message (with the same timestamp) is already stored in Firebase
    firebaseService.getData(firebasePath)
      .then((data) => {
        // If there is no data or if the timestamp is different, store the new message and timestamp
        if (!data || data.timestamp !== timestamp) {
          // Store the message and timestamp in Firebase if it's new
          firebaseService.storeData(firebasePath, { message: lastMQTTMessage, timestamp: timestamp })
            .then(() => {
              console.log(`Message from topic ${topic} stored successfully in Firebase with timestamp ${timestamp}.`);
            })
            .catch((error) => {
              console.error(`Error storing message from topic ${topic} in Firebase: ${error}`);
            });
        } else {
          console.log(`Message from topic ${topic} is already stored with the same timestamp.`);
        }
      })
      .catch((error) => {
        console.error(`Error checking message from topic ${topic} in Firebase: ${error}`);
      });
  });


  // Handle bot commands
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.split(' ');

    if (msg.text === '/start') {
      // Loop through all topics and assign the chatId to each topic
      Object.keys(chatIdsPerTopic).forEach(topic => {
        chatIdsPerTopic[topic] = chatId;
      });
  
      // Send a welcome message and notify the user
      bot.sendMessage(chatId, 'Welcome to the bot! You have been subscribed to all bus topics.');
    }

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

    else if (text[0].toLowerCase() === 'deletemqtt' && text.length > 1) {
      const topicName = text[1]; // topic name to delete
    
      // Publish an empty message with retain flag set to true to clear the retained message
      mqttClient.publish(topicName, '', { retain: true }, () => {
        // Clear the topic from the subscribedTopics
        subscribedTopics[topicName] = '-';
        bot.sendMessage(chatId, `Retained message for topic '${topicName}' has been deleted.`);
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
        console.log(chatIdsPerTopic);
        
        // Loop through each topic in chatIdsPerTopic
        Object.keys(chatIdsPerTopic).forEach((topic) => {
          const latestMessage = subscribedTopics[topic] || 'No messages received yet';
          messageList += `- ${topic}: "${latestMessage}"\n`;
        });
        
        bot.sendMessage(chatId, messageList);
      }
    }


    else if (text[0].toLowerCase() === 'options') {
      // Send a message with a custom keyboard containing "YES" and "NO" buttons
      bot.sendMessage(chatId, 'Choose an option:', {
        reply_markup: {
          keyboard: [
            ['YES', 'NO'] // Custom keyboard with two buttons
          ],
          resize_keyboard: true, // Auto-resize keyboard to fit window
          one_time_keyboard: true // Remove the keyboard after one use
        }
      });
    }

    else if (text[0].toLowerCase() === 'sniffkenneth') {
      bot.sendMessage(chatId, ` Kenneth sniffing ${subscribedTopics['sniffcount']}`, 
  );
    }
    
    
    
     else {
      // bot.sendMessage(chatId, 'Unknown command. Use "addMQTT <string>", "storeMQTT", "viewMQTT", "add", "view", "update", or "delete".');
    }
  });


  bot.onText(/\/options/, (msg) => {
    const chatId = msg.chat.id;
  
    // Send a message with inline buttons for the four options
    bot.sendMessage(chatId, 'Choose an option:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Bus Stops', callback_data: 'bus_stops' },
            { text: 'Study Areas', callback_data: 'study_areas' },
          ],
          [
            { text: 'Canteens', callback_data: 'canteens' },
            { text: 'All', callback_data: 'all' },
          ]
        ]
      }
    });
  });

  bot.on('callback_query', function (callbackQuery) {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = message.chat.id;
    const messageId = message.message_id;

    // Handle when user selects Bus Stops
    if (data === 'bus_stops') {
      // Delete the original message (Choose an option)
      bot.deleteMessage(chatId, messageId).then(() => {
        // Send a new message asking for bus types
        bot.sendMessage(chatId, 'Choose a bus type:', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Blue', callback_data: 'bluebus' },
                { text: 'Red', callback_data: 'redbus' },
              ],
              [
                { text: 'Green', callback_data: 'greenbus' },
                { text: 'Brown', callback_data: 'brownbus' },
              ]
            ]
          }
        });
      });
    }

    // Handle when user selects Blue Bus
    else if (data === 'bluebus') {
      // Helper function to return the appropriate icon based on the value
      const getIconForValue = (value) => {
        if (isNaN(value) || value === undefined || value === null) {
          return '💋'; // If value is NaN or doesn't exist, return 💋
        }
        const intValue = parseInt(value, 10);
        if (intValue >= 0 && intValue <= 7) {
          return '🟢'; // Value between 0 and 7
        } else if (intValue >= 8 && intValue <= 14) {
          return '🟠'; // Value between 8 and 14
        } else if (intValue >= 15) {
          return '🔴'; // Value 15 or greater
        }
      };
    
      // Delete the bus type selection message
      bot.deleteMessage(chatId, messageId).then(() => {
        // Send the final message with the actual values and appropriate icons for each stop
        bot.sendMessage(
          chatId,
          `LIST OF NTU BUSES 🚍🚍🚍\n\nAs promised, we will be changing our Mala Bowl ingredients weekly so you guys won’t be bored 🤪\n\nFor this week, our Mala Bowl 🌶️🌶️ will be:\n\n` +
            `Opp Hall 11 ${subscribedTopics['/bus/blue/opphall11']} ${getIconForValue(subscribedTopics['/bus/blue/opphall11'])}\n` +
            `Nanyang Heights ${subscribedTopics['/bus/blue/nanyangheights']} ${getIconForValue(subscribedTopics['/bus/blue/nanyangheights'])}\n` +
            `Hall 6 ${subscribedTopics['/bus/blue/hall6']} ${getIconForValue(subscribedTopics['/bus/blue/hall6'])}\n` +
            `Opp Hall 4 ${subscribedTopics['/bus/blue/opphall4']} ${getIconForValue(subscribedTopics['/bus/blue/opphall4'])}\n` +
            `Opp Yunnan Garden ${subscribedTopics['/bus/blue/oppyunnangarden']} ${getIconForValue(subscribedTopics['/bus/blue/oppyunnangarden'])}\n` +
            `Opp SPMS ${subscribedTopics['/bus/blue/oppspms']} ${getIconForValue(subscribedTopics['/bus/blue/oppspms'])}\n` +
            `Opp WKWSCI ${subscribedTopics['/bus/blue/oppwkwsci']} ${getIconForValue(subscribedTopics['/bus/blue/oppwkwsci'])}\n` +
            `Opp CEE ${subscribedTopics['/bus/blue/oppcee']} ${getIconForValue(subscribedTopics['/bus/blue/oppcee'])}\n` +
            `NIE Blk 2 ${subscribedTopics['/bus/blue/nieblk2']} ${getIconForValue(subscribedTopics['/bus/blue/nieblk2'])}\n` +
            `Opp Hall 16 ${subscribedTopics['/bus/blue/opphall16']} ${getIconForValue(subscribedTopics['/bus/blue/opphall16'])}\n` +
            `Opp Hall 14 ${subscribedTopics['/bus/blue/opphall14']} ${getIconForValue(subscribedTopics['/bus/blue/opphall14'])}\n` +
            `Opp NY Cres Halls ${subscribedTopics['/bus/blue/oppnycreshalls']} ${getIconForValue(subscribedTopics['/bus/blue/oppnycreshalls'])}\n\n` +
            `‼️ *SPECIAL*: Soft Fluffy Scrambled Eggs 🥚🥚🥚 placed on top of your MALA`, {
            parse_mode: 'Markdown'
          });
      });
    }
    

    // Handle other options like Study Areas, Canteens, All
    else if (data === 'study_areas') {
      bot.deleteMessage(chatId, messageId).then(() => {
        bot.sendMessage(chatId, 'You selected: Study Areas 📚');
      });
    } else if (data === 'canteens') {
      bot.deleteMessage(chatId, messageId).then(() => {
        bot.sendMessage(chatId, 'You selected: Canteens 🍽️');
      });
    } else if (data === 'all') {
      bot.deleteMessage(chatId, messageId).then(() => {
        bot.sendMessage(chatId, 'You selected: All Options 🌍');
      });
    }
  });
  
  
};
