module.exports = (bot, subscribedTopics) => {

  // Function to handle bus stops options
  const handleBusStops = (bot, chatId, messageId) => {
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
  };

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

  // Handle callback queries for bus types
  bot.on('callback_query', function (callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;

    if (data === 'bluebus') {
      // Blue Bus Stops
      bot.deleteMessage(chatId, messageId).then(() => {
        bot.sendMessage(
          chatId,
          `LIST OF NTU BLUE BUSES 🚍🚍🚍\n\n` +
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
          `Opp NY Cres Halls ${subscribedTopics['/bus/blue/oppnycreshalls']} ${getIconForValue(subscribedTopics['/bus/blue/oppnycreshalls'])}\n\n`
        );
      });
      
    } else if (data === 'redbus') {
      // Red Bus Stops
      bot.deleteMessage(chatId, messageId).then(() => {
        bot.sendMessage(
          chatId,
          `LIST OF NTU RED BUSES 🚍🚍🚍\n\n` +
          `Hall 11 Blk 55 ${subscribedTopics['/bus/red/hall11blk55']} ${getIconForValue(subscribedTopics['/bus/red/hall11blk55'])}\n` +
          `Nanyang Crescent Halls ${subscribedTopics['/bus/red/nanyangcrescenthalls']} ${getIconForValue(subscribedTopics['/bus/red/nanyangcrescenthalls'])}\n` +
          `Hall 12 ${subscribedTopics['/bus/red/hall12']} ${getIconForValue(subscribedTopics['/bus/red/hall12'])}\n` +
          `Lee Wee Nam Lib ${subscribedTopics['/bus/red/leeweenamlib']} ${getIconForValue(subscribedTopics['/bus/red/leeweenamlib'])}\n` +
          `Sch of Biological Sciences ${subscribedTopics['/bus/red/schofbiologicalsciences']} ${getIconForValue(subscribedTopics['/bus/red/schofbiologicalsciences'])}\n` +
          `WKWSCI ${subscribedTopics['/bus/red/wkwsci']} ${getIconForValue(subscribedTopics['/bus/red/wkwsci'])}\n` +
          `SPMS ${subscribedTopics['/bus/red/spms']} ${getIconForValue(subscribedTopics['/bus/red/spms'])}\n` +
          `Gaia ${subscribedTopics['/bus/red/gaia']} ${getIconForValue(subscribedTopics['/bus/red/gaia'])}\n` +
          `Hall 4 ${subscribedTopics['/bus/red/hall4']} ${getIconForValue(subscribedTopics['/bus/red/hall4'])}\n` +
          `Hall 1 ${subscribedTopics['/bus/red/hall1']} ${getIconForValue(subscribedTopics['/bus/red/hall1'])}\n` +
          `Hall 2 ${subscribedTopics['/bus/red/hall2']} ${getIconForValue(subscribedTopics['/bus/red/hall2'])}\n` +
          `Hall 8 & 9 ${subscribedTopics['/bus/red/hall8and9']} ${getIconForValue(subscribedTopics['/bus/red/hall8and9'])}\n` +
          `Hall 11 ${subscribedTopics['/bus/red/hall11']} ${getIconForValue(subscribedTopics['/bus/red/hall11'])}\n\n`
        );
      });

    } else if (data === 'greenbus') {
      // Green Bus Stops
      bot.deleteMessage(chatId, messageId).then(() => {
        bot.sendMessage(
          chatId,
          `LIST OF NTU GREEN BUSES 🚍🚍🚍\n\n` +
          `Hall 1 ${subscribedTopics['/bus/green/hall1']} ${getIconForValue(subscribedTopics['/bus/green/hall1'])}\n` +
          `Hall 2 ${subscribedTopics['/bus/green/hall2']} ${getIconForValue(subscribedTopics['/bus/green/hall2'])}\n` +
          `Uni Health ${subscribedTopics['/bus/green/unihealth']} ${getIconForValue(subscribedTopics['/bus/green/unihealth'])}\n` +
          `TCT-LT ${subscribedTopics['/bus/green/tctlt']} ${getIconForValue(subscribedTopics['/bus/green/tctlt'])}\n` +
          `Opp Hall 2 ${subscribedTopics['/bus/green/opphall2']} ${getIconForValue(subscribedTopics['/bus/green/opphall2'])}\n\n`
        );
      });

    } else if (data === 'brownbus') {
      // Brown Bus Stops
      bot.deleteMessage(chatId, messageId).then(() => {
        bot.sendMessage(
          chatId,
          `LIST OF NTU BROWN BUSES 🚍🚍🚍\n\n` +
          `Hall 1 ${subscribedTopics['/bus/brown/hall1']} ${getIconForValue(subscribedTopics['/bus/brown/hall1'])}\n` +
          `Hall 2 ${subscribedTopics['/bus/brown/hall2']} ${getIconForValue(subscribedTopics['/bus/brown/hall2'])}\n` +
          `Uni Health ${subscribedTopics['/bus/brown/unihealth']} ${getIconForValue(subscribedTopics['/bus/brown/unihealth'])}\n` +
          `TCT-LT ${subscribedTopics['/bus/brown/tctlt']} ${getIconForValue(subscribedTopics['/bus/brown/tctlt'])}\n` +
          `Sch of ADM ${subscribedTopics['/bus/brown/schofadm']} ${getIconForValue(subscribedTopics['/bus/brown/schofadm'])}\n` +
          `Lee Wee Nam Lib ${subscribedTopics['/bus/brown/leeweenamlib']} ${getIconForValue(subscribedTopics['/bus/brown/leeweenamlib'])}\n` +
          `Sch of CEE ${subscribedTopics['/bus/brown/schofcee']} ${getIconForValue(subscribedTopics['/bus/brown/schofcee'])}\n` +
          `Sch of Biological Sciences ${subscribedTopics['/bus/brown/schofbiologicalsciences']} ${getIconForValue(subscribedTopics['/bus/brown/schofbiologicalsciences'])}\n` +
          `WKWSCI ${subscribedTopics['/bus/brown/wkwsci']} ${getIconForValue(subscribedTopics['/bus/brown/wkwsci'])}\n` +
          `SPMS ${subscribedTopics['/bus/brown/spms']} ${getIconForValue(subscribedTopics['/bus/brown/spms'])}\n` +
          `Gaia ${subscribedTopics['/bus/brown/gaia']} ${getIconForValue(subscribedTopics['/bus/brown/gaia'])}\n` +
          `Hall 4 ${subscribedTopics['/bus/brown/hall4']} ${getIconForValue(subscribedTopics['/bus/brown/hall4'])}\n` +
          `Hall 5 ${subscribedTopics['/bus/brown/hall5']} ${getIconForValue(subscribedTopics['/bus/brown/hall5'])}\n\n`
        );
      });
    }
  });

  // Expose the handleBusStops function to be called from the mainController
  return {
    handleBusStops
  };
};
