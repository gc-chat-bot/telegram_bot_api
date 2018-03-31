const Promise = require('bluebird');
Promise.config({
  cancellation: true
});

const TelegramBot = require('node-telegram-bot-api');
const token = 'AAE7-ksWuKtiJ73yFffdMtLJl63fV25b0dw';

const bot = new TelegramBot(token, {  
    polling: true
});

bot.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
});

bot.on('message', function onMessage(msg) {
    console.log("message");
    bot.sendMessage(msg.chat.id, 'I am alive on Zeit Now!');
});