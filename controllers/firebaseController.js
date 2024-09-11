const firebaseService = require('../services/firebaseServices'); // Make sure Firebase service is available

module.exports = (bot) => {

  // Handle bot commands
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.split(' ');

    // Command: storemqtt (store the last MQTT message in Firebase)
    if (text[0].toLowerCase() === 'storemqtt') {
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

    // Command: viewmqtt (view stored MQTT messages)
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
    }

    // Command: add (add a message to Firebase)
    else if (text[0].toLowerCase() === 'add' && text.length > 1) {
      const dataToAdd = { message: text.slice(1).join(' ') };
      // Store the message using firebaseService
      firebaseService.storeData('/messages', dataToAdd)
        .then(() => {
          bot.sendMessage(chatId, `Added: ${dataToAdd.message}`);
        })
        .catch(error => {
          bot.sendMessage(chatId, `Error adding data: ${error.message}`);
        });
    }

    // Command: view (view all stored messages)
    else if (text[0].toLowerCase() === 'view') {
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
    }

    // Command: update (update a message in Firebase)
    else if (text[0].toLowerCase() === 'update' && text.length > 2) {
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
    }

    // Command: delete (delete a message from Firebase)
    else if (text[0].toLowerCase() === 'delete' && text.length > 1) {
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
    }
  });
};
