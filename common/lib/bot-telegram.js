const Promise = require('bluebird');
const moment = require('moment');
const app = require('../../server/server');
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
    const session = await app.models.Session.findOne({ 
        where: {
            state: "opened",
            chatId: msg.chat.id
        }
    });

    if ( msg.text === "create session" ) {
        if (session) await session.updateAttribute('state','closed');
        await createSession(msg);
        return;
    }

    if (!session) {
        bot.sendMessage(msg.chat.id, "No opened sessions. Please enter 'create session'");
        return;
    }   

    if ( msg.text === "end session" ) {
        await endSession(session, msg);
        return;
    }

    const askSolvedProblem = await session.dialog.findOne({
        where: {
            initiator: "Infopulse bot",
            text: "Is your problem solved?",
            state: "asking"
        }
    });

    if (askSolvedProblem) {
        const valid = checkUserMessage(msg.text);
        let text = "Close session. Good day";
        if (!valid) {
            await session.dialog.create({
                initiator: msg.chat.first_name + " " + msg.chat.last_name,
                text: msg.user,
                date: msg.date
            });

            Promise.all([
                session.dialog.create({
                    initiator: "Infopulse bot",
                    text: text,
                    date: msg.date
                }),
                session.updateAttribute('state','closed')
            ]);
            bot.sendMessage(msg.chat.id, text);
            return;
        }

        text = "Enter your email for feedback, please";
        await session.dialog.create({
            initiator: msg.chat.first_name + " " + msg.chat.last_name,
            text: msg.text,
            date: msg.date
        });
        Promise.all([
            session.dialog.create({
                initiator: "Infopulse bot",
                text: text,
                date: msg.date
            }),
            askSolvedProblem.updateAttribute('state','answered')
        ]);
        bot.sendMessage(msg.chat.id, text);  
        return;
    }

    const enteredEmail = await session.dialog.findOne({
        where: {
            initiator: "Infopulse bot",
            text: "Enter your email for feedback, please"
        }
    });

    if (enteredEmail) {
        await closeSession(session, msg);
        await sendEmail(session, msg);
        return;
    }

    await dialogueWithUser(session, msg);
});

function checkUserMessage(message) {
    return message === "no";
}

async function createSession(msg){
    const new_session = await app.models.Session.create({
        chatId: msg.chat.id,
        state: "opened",
    });

    await new_session.dialog.create({
        sessionId: new_session.id, 
        initiator: "Infopulse bot",
        text: "Hi. How can I help you?",
        date: msg.date
    });

    bot.sendMessage(msg.chat.id, "Hi. How can I help you?");
}

async function endSession(session, msg){
    bot.sendMessage(msg.chat.id, "Is your problem solved?");
    await session.dialog.create({
        initiator: "Infopulse bot",
        text: "Is your problem solved?",
        date: msg.date,
        state: "asking"
    });
}

async function closeSession(session, msg) {
    let text = "Close session. Good day";
    await session.dialog.create({
        initiator: msg.chat.first_name + " " + msg.chat.last_name,
        text: msg.text,
        date: msg.date
    });
    Promise.all([
        session.dialog.create({
            initiator: "Infopulse bot",
            text: text,
            date: msg.date
        }),
        session.updateAttribute('state','closed')
    ]);
    bot.sendMessage(msg.chat.id, text); 
}

async function dialogueWithUser(session, msg){
    await session.dialog.create({
        initiator: msg.chat.first_name + " " + msg.chat.last_name,
        text: msg.text,
        date: msg.date
    });

    try {
        const result = await request({
            headers:{
                "Content-Type": "application/json"
            },
            url:'http://pythonservice:3001/handle',
            method: 'POST',
            body: {
                "text": msg.text,
                "chat_id": msg.chat.id,
                "session_id": session.id
            },
            json: true
        });  

        await session.dialog.create({
            initiator: "Infopulse bot",
            text: result.text,
            date: msg.date
        });

        bot.sendMessage(result.chat_id, result.text);   
    } catch (error) {
        console.log("error", error);
    }
}

async function sendEmail(session, msg){
    const dialogs = await session.dialog.find({});
    let list = '<h2> Chat Messages </h2>';
   
    // dialogs.map(dialog => {
    //     list = list + `<li> ${dialog.initiator}: ${dialog.text} </li>`;
    // })
    const containerStyle = `border: 2px solid #dedede; background-color: #f1f1f1;border-radius: 5px;padding: 10px;margin: 10px 0;`;
    dialogs.map(dialog => {
        let darker ='';
        if (dialog.initiator === "Infopulse bot") {
            darker = `border-color: #ccc;background-color: #ddd;`;
        }   

        list = list +  `<div style="${containerStyle + darker}">
                            <span  style="width:100%;"> <b>${dialog.initiator}</b></span> 
                            <p>${dialog.text}</p>
                        </div>`;
    });
    const html = list;
    await app.models.Email.send({
        to: "infopulseoperator@gmail.com",
        from: msg.text,
        subject: 'Bot dialog',
        html: html
      });
}

module.exports =  {
    bot: bot
}