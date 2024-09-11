const firebaseService = require('../services/firebaseServices'); // Make sure Firebase service is available

module.exports = (bot, mqttClient, subscribedTopics, chatIdsPerTopic) => {
  let lastMQTTMessage = '';
  let lastMQTTTopic = '';

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

  // Handle incoming MQTT messages
  mqttClient.on('message', (topic, message) => {
    lastMQTTMessage = message.toString();
    lastMQTTTopic = topic;
    const timestamp = new Date().toISOString();  // Store the current timestamp

    console.log(`Received message from topic ${topic}: ${lastMQTTMessage} at ${timestamp}`);

    // Store the latest message for the subscribed topic
    subscribedTopics[topic] = lastMQTTMessage;

    const chatId = chatIdsPerTopic[topic];

    // Notify users about the latest message on the subscribed topic
    if (chatId) {
      bot.sendMessage(chatId, `The topic '${topic}' consists of: "${lastMQTTMessage}" at ${timestamp}`);
    }

    // Uncomment this block to push data to Firebase
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

    // Command: addmqtt
    if (text[0].toLowerCase() === 'addmqtt' && text.length > 1) {
      const mqttMessage = text.slice(1).join(' ');
      mqttClient.publish('iot/test', mqttMessage, () => {
        bot.sendMessage(chatId, `Published message: "${mqttMessage}" to the topic 'iot/test'`);
      });
    }

    // Command: deletemqtt (delete retained MQTT message)
    else if (text[0].toLowerCase() === 'deletemqtt' && text.length > 1) {
      const topicName = text[1]; // topic name to delete
      mqttClient.publish(topicName, '', { retain: true }, () => {
        subscribedTopics[topicName] = '-'; // Clear the topic's message
        bot.sendMessage(chatId, `Retained message for topic '${topicName}' has been deleted.`);
      });
    }

    // Command: showsubscribed (show all subscribed topics)
    else if (text[0].toLowerCase() === 'showsubscribed') {
      if (Object.keys(chatIdsPerTopic).length === 0) {
        bot.sendMessage(chatId, 'No topics are currently subscribed.');
      } else {
        let messageList = 'Currently Subscribed Topics and Latest Messages:\n';
        Object.keys(chatIdsPerTopic).forEach((topic) => {
          const latestMessage = subscribedTopics[topic] || 'No messages received yet';
          messageList += `- ${topic}: "${latestMessage}"\n`;
        });
        bot.sendMessage(chatId, messageList);
      }
    }

    // Command: publish topic/message
    else if (text[0].toLowerCase() === 'publish' && text.length > 2) {
      const topicName = text[1]; // topic/name
      const mqttMessage = text.slice(2).join(' '); // the string to publish
      mqttClient.publish(topicName, mqttMessage, { retain: true }, () => {
        // Simulate message reception for self-published messages
        lastMQTTMessage = mqttMessage;
        lastMQTTTopic = topicName;  // Update the last topic
        subscribedTopics[topicName] = mqttMessage;  // Update the topic's message in the map
        bot.sendMessage(chatId, `Published message: "${mqttMessage}" to the topic '${topicName}'`);
      });
    }
  });
};
