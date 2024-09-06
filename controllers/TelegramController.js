module.exports = (bot, mqttClient, database) => {
    let lastMQTTMessage = '';
  
    // Handle incoming MQTT messages
    mqttClient.on('message', (topic, message) => {
      lastMQTTMessage = message.toString();
      console.log(`Received message from topic ${topic}: ${lastMQTTMessage}`);
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
          const newRef = database.ref('/mqtt/messages').push();
          newRef.set({ message: lastMQTTMessage }).then(() => {
            bot.sendMessage(chatId, `Stored last MQTT message: "${lastMQTTMessage}" in Firebase.`);
          }).catch(error => {
            bot.sendMessage(chatId, `Error storing data in Firebase: ${error.message}`);
          });
        } else {
          bot.sendMessage(chatId, 'No MQTT message to store.');
        }
  
      // Command: viewmqtt
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
  
      // Command: add
      } else if (text[0].toLowerCase() === 'add' && text.length > 1) {
        const dataToAdd = text.slice(1).join(' ');
        const newRef = database.ref('/messages').push();
        newRef.set({ message: dataToAdd }).then(() => {
          bot.sendMessage(chatId, `Added: ${dataToAdd}`);
        }).catch(error => {
          bot.sendMessage(chatId, `Error adding data: ${error.message}`);
        });
  
      // Command: view
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
  
      // Command: update
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
  
      // Command: delete
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
  
      // Unknown command
      } else {
        bot.sendMessage(chatId, 'Unknown command. Use "addMQTT <string>", "storeMQTT", "viewMQTT", "add", "view", "update", or "delete".');
      }
    });
  };
  