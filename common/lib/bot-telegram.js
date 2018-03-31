const Promise = require('bluebird');
Promise.config({
  cancellation: true
});
const request = require('request-promise-native');

const TelegramBot = require('node-telegram-bot-api');
const token = '503772624:AAE7-ksWuKtiJ73yFffdMtLJl63fV25b0dw';

const bot = new TelegramBot(token, {  
    polling: true
});

bot.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
});

bot.on('message', async function onMessage(msg) {
    try {
        const result = await request({
            headers:{
                "Content-Type": "application/json"
            },
            url:'http://pythonservice:3001/handle',
            method: 'POST',
            body: {
                "text": msg.text,
                "chat_id": msg.chat.id
            },
            json: true
        });  
        bot.sendMessage(result.chat_id, result.text);   
    } catch (error) {
        console.log("error", error);
    }
});


module.exports =  {
    bot: bot
}