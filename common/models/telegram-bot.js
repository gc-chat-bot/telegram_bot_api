'use strict';
const bot = require('../lib/bot-telegram').bot;

module.exports = function(Telegrambot) {
    Telegrambot.answerText = function(text, chatId, cb) {
        bot.sendMessage(chatId, text);
        cb(null, { answer: text });
    }

    Telegrambot.remoteMethod('answerText', {
        accepts: [{
            arg: "text", type: "string"},{
            arg: "chatId", type: "string"
            }],
        returns: { arg: 'answer', type: 'object'},
        http: {path: '/answerText', verb: 'post'}
    });

};
