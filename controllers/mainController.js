// /controllers/mainController.js

module.exports = (bot, busController) => {

  // Command: /options (display the main options for Bus Stops, Study Areas, Canteens, All)
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

  // Handle callback queries for selecting options
  bot.on('callback_query', function (callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;

    if (data === 'bus_stops') {
      // Delegate bus stop logic to the busController
      busController.handleBusStops(bot, chatId, messageId);
    } else if (data === 'study_areas') {
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
