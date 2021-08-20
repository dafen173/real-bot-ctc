
//web: node ./src/index.js


//cd C:\Program Files\MongoDB\Server\3.6\bin

//http://www.avscreen.com.ua/images/manual.png



//new token
//1860414673:AAEV7oeJWq9LC6gYpw5jcZN4DfC_uPU44Dg

//old token
//1860414673:AAFo5kV5d2bZQgVSUuSUpE9UgAqfsCcqcrI




db.users.insertMany([
    {
        films: 'Сейчас в кино', 
        favourite: 'Избранное',
        cinemas: 'Кинотеатры'
    },
    {
        random:'Случайный жанр',
        action: 'Боевик',
        comedy: 'Комедия'
    }
])











/*
bot.on('message', (msg) => {
    const chatId = msg.chat.id

    if (msg.text === 'Закрыть') {    
        bot.sendMessage(chatId, 'Закрываю клавиатуру', {
            reply_markup: {
                remove_keyboard: true
            }
        })

    } else if (msg.text === 'Ответить') {
        bot.sendMessage(chatId, 'Отвечаю', {
            reply_markup: {
                  force_reply: true  
            }
        })

    } else {
        bot.sendMessage(chatId, 'Клавиатура', {
            reply_markup: {
                keyboard: [
                    [{
                        text: 'Отправить местоположение',
                        request_location: true
                    }],
                    ['Ответить', 'Закрыть'],
                    [{
                        text: 'Отправить контакт',
                        request_contact: true
                    }]
                ],
                
                one_time_keyboard: true
            }
        })
    }
    })
*/

/*
bot.on('message', (msg) => {
    
    setTimeout(() => {
        bot.sendMessage(msg.chat.id, 'test')
        }, 4000)
    })
*/
/*
bot.on('message', (msg) => {
    
    const html = `
    <strong>Hello, ${msg.from.first_name}</strong>
    <pre>${debug(msg)}</pre>
    `
    
    bot.sendMessage(msg.chat.id, html, {
        parse_mode: 'HTML'
    })
})
*/
/*
bot.onText (/\/start/, msg => {
    const { id } = msg.chat

    bot.sendMessage(id, debug(msg))
})

bot.onText (/\/help (.+)/, (msg, [source, match]) => {
    const { id } = msg.chat

    bot.sendMessage(id, debug(match))
})
*/
/*
bot.on('message', (msg) => {
    console.log(msg)
    bot.sendMessage(msg.chat.id, 'hello, ' + msg.from.first_name)
})
*/

/*
bot.on('message', msg => {
    const { id } = msg.chat

    bot.sendMessage (id, debug (msg))
    .then(() => {
        console.log('msg has been send')
    })
    .catch((error) => {
        console.error(error);
    })
})
*/


