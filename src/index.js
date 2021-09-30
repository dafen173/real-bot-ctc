// ctc-bot

require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')
//const mongoose = require('mongoose')
const geolib = require('geolib')
const _ = require('lodash')
const config = require('./config')
const helper = require('./helper')
const keyboard = require('./keyboard')
const kb = require('./keyboard-buttons')
const database = require('../database.json')


helper.logStart()

/* mongoose.connect(config.DB_URL, {
    //useMongoClient: true
    useNewUrlParser: true,
    useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))
require('./models/film.model')
require('./models/cinema.model')
require('./models/user.model')
const Film = mongoose.model('films')
const Cinema = mongoose.model('cinemas')
const User = mongoose.model('users') */

//database.films.forEach(f => new Film(f).save().catch(e => console.log(e)))
//database.cinemas.forEach(c => new Cinema(c).save().catch(e => console.log(e)))

const COEF16TO9 = 1.77777
const COEF16TO10 = 1.6
const COEF21TO9 = 2.35
const WIDTH = 'width'
const HEIGHT = 'height'
const DIAGONAL_INPUT = 'diagonalInput'

const ACTION_TYPE = {
    TOGGLE_FAV_FILM: 'tff',
    SHOW_CINEMAS: 'sc',
    SHOW_CINEMAS_MAP: 'scm',
    SHOW_FILMS: 'sf'
}

// =========================================================================



const bot = new TelegramBot (config.TOKEN, {
    polling: true
})


/*
const bot = new TelegramBot (process.env.BOT_TOKEN, {
    polling: true
})
*/

bot.on('message', msg => {
    //console.log('Working', msg.from.first_name)
    const chatId = helper.getChatId(msg)
     
    //screenCalculation (msg)



    switch (msg.text) {
        case kb.home.rate:
            bot.sendMessage(chatId, config.EXCHANGE_RATE)
            break
        case kb.home.price:
            bot.sendMessage(chatId, `Ссылка для скачивания прайса\n 
                                    http://www.ctccapital.ua/price_a/dealer/CTCCapital2107081715.xls`)
            break
        case kb.home.sale:
            bot.sendMessage(chatId, `Ссылка для скачивания прайса\n 
                        http://www.ctccapital.ua/price_a/all/CTCCapital_Sale_deadline_30.07.21_inclusive.xls`)
            break        
        case kb.home.promo:
            //bot.sendPhoto(chatId, "D:/kottans/real-bot-ctc/real-bot-ctc/photos/mf-triangle.png")               
            break
        case kb.home.screen_calc:
            bot.sendMessage(chatId, `Выберите нужную команду`, {
                reply_markup: {
                    keyboard: keyboard.screens
                }
            })
            break
        case kb.screen.w16to9:
            bot.sendMessage(chatId, `Укажите ширину в сантиметрах`)                      
            const w16on9Handler = (msg) => {                   
                screenInput(msg, COEF16TO9, WIDTH, w16on9Handler)               
            }          
            bot.on('message', w16on9Handler)           
            break
        case kb.screen.h16to9:
            bot.sendMessage(chatId, `Укажите высоту в сантиметрах`)           
            const h16on9Handler = (msg) => {
                screenInput(msg, COEF16TO9, HEIGHT, h16on9Handler) 
            }           
            bot.on('message', h16on9Handler)  
            break
        case kb.screen.w16to10:
            bot.sendMessage(chatId, `Укажите ширину в сантиметрах`)                      
            const w16on10Handler = (msg) => {                   
                screenInput(msg, COEF16TO10, WIDTH, w16on10Handler)               
            }          
            bot.on('message', w16on10Handler)           
            break
        
        case kb.back:
            bot.sendMessage(chatId, `Выберите команду для начала работы:`, {
                reply_markup: {keyboard: keyboard.home}
            })
            break
    }
})


bot.on("polling_error", (err) => console.log(err))
bot.on("error", (err) => console.log(err))


bot.onText(/\/start/, msg => {
    const text = `Здраствуйте, ${msg.from.first_name}\nВыберите команду для начала работы: `

    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {
           keyboard: keyboard.home
        }
    })
})

bot.onText(/\/f(.+)/, (msg, [source, match]) => {
    const filmUuid = helper.getItemUuid(source)
    const chatId = helper.getChatId(msg)

    Promise.all([
        Film.findOne({uuid: filmUuid}),
        User.findOne({telegramId: msg.from.id})
    ]).then(([film, user]) => {
        
        let isFav = false

        if (user) {
            isFav = user.films.indexOf(film.uuid) !== -1
        }

        const favText = isFav ? 'Удалить из избранного' : 'Добавить в избранное'

        const caption = `Название: ${film.name}\nГод: ${film.year}\nРейтинг: ${film.rate}\nДлительность: ${film.length}`       
        
        bot.sendPhoto(chatId, film.picture, {
           caption: caption,
           reply_markup: {
               inline_keyboard: [
                   [
                        {
                            text: favText,
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.TOGGLE_FAV_FILM,
                                filmUuid: film.uuid,
                                isFav: isFav
                            })
                        },
                        {
                            text:'Показать кинотеатры',
                            callback_data: JSON.stringify({                             
                                type: ACTION_TYPE.SHOW_CINEMAS,
                                cinemaUuids: film.cinemas,
                            })
                        }
                   ],
                   [
                        {
                            text: `Кинопоиск ${film.name}`,
                            url: film.link
                        }
                   ]
               ]
           }                
        })
    })
})

bot.onText(/\/c(.+)/, (msg, [source, match]) => {
    const cinemaUuid = helper.getItemUuid(source)
    const chatId = helper.getChatId(msg)

    Cinema.findOne({uuid: cinemaUuid}).then(cinema => {
        console.log(cinema)

        bot.sendMessage(chatId, `Кинотеатр ${cinema.name}`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: cinema.name,
                            url: cinema.url
                        },
                        {
                            text: 'Показать на карте',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_CINEMAS_MAP,
                                lat: cinema.location.latitude,
                                lon: cinema.location.longitude
                            })
                        }
                    ],
                    [
                        {
                            text: 'Показать фильмы',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_FILMS,
                                filmUuids: cinema.films
                            })
                        }
                    ]
                ]
            }
        })
    })
})

bot.on('callback_query', query => {
    const userId = query.from.id

    let data
    try {
        data = JSON.parse(query.data)
    } catch (e) {
        throw new Error ('Data is not an object')
    }

    const { type } = data

    if (type === ACTION_TYPE.SHOW_CINEMAS_MAP) {
        const {lat, lon} = data
        bot.sendLocation(query.message.chat.id, lat, lon)
    } else if (type === ACTION_TYPE.SHOW_CINEMAS) {      
        sendCinemasByQuery(userId, {uuid: {'$in': data.cinemaUuids}})
    } else if (type === ACTION_TYPE.TOGGLE_FAV_FILM) {
        toggleFavouriteFilm(userId, query.id, data)     
    } else if (type === ACTION_TYPE.SHOW_FILMS) {
        sendFilmByQuery(userId, {uuid: {'$in': data.filmUuids}})
    }   
})

bot.on('inline_query', query => {
    Film.find({}).then(films => {
        const results = films.map(f => {
            const caption = `Название: ${f.name}\nГод: ${f.year}\nРейтинг: ${f.rate}\nДлительность: ${f.length}`
            return {
                id: f.uuid,
                type: 'photo',
                photo_url: f.picture,
                thumb_url: f.picture,
                caption: caption,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `Кинопоиск: ${f.name}`,
                                url: f.link
                            }
                        ]
            
                    ]                  
                }
            }
        })

        bot.answerInlineQuery(query.id, results, {
            cache_time: 0
        })
    })
})


//===========================================



function sendFilmByQuery(chatId, query) {
    Film.find(query).then(films => {
        //console.log(films)

        const html = films.map((f, i) => {
            return `<b>${i + 1}</b> ${f.name} - /f${f.uuid}`
        }).join('\n')

        sendHTML (chatId, html, 'films')
    })
}

function sendHTML (chatId, html, kbName = null) {
    const options = {
        parse_mode: 'HTML'
    }
    if (kbName) {
        options['reply_markup'] = {
            keyboard: keyboard[kbName]
        }
    }
    bot.sendMessage(chatId, html, options)
}

function getCinemasInCoord(chatId, location) {
    Cinema.find({}).then(cinemas => {

        cinemas.forEach(c => {
            c.distance = geolib.getDistance(location, c.location) / 1000
        })

        cinemas = _.sortBy(cinemas, 'distance')

        const html = cinemas.map((c, i) => {
            return `<b>${i + 1}</b> ${c.name}. <em>Расстояние</em> - <strong>${c.distance}</strong> км. /c${c.uuid}`
        }).join('\n')

        sendHTML(chatId, html, 'home')
    })
}

function toggleFavouriteFilm(userId, queryId, {filmUuid, isFav}) {      
    
    let userPromise
    User.findOne({telegramId: userId})
    .then(user => {
      if (user) {
        if (isFav) {
          user.films = user.films.filter(fUuid => fUuid !== filmUuid)
        } else {
          user.films.push(filmUuid)
        }
        userPromise = user
      } else {
        userPromise = new User({
          telegramId: userId,
          films: [filmUuid]
        })
      }

      const answerText = isFav ? `Удалено из избранного` : `Фильм добавлен в избранное`
  
      userPromise.save()
      .then(_ => { bot.answerCallbackQuery(queryId, answerText) })
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function showFavouriteFilms(chatId, telegramId) {
    User.findOne(({telegramId}))
    .then(user => {

        if (user) {
            Film.find({uuid: {'$in': user.films}}).then(films => {
                let html

                if (films.length) {
                    html = films.map((f, i) => {
                        return `<b>${i + 1}</b> ${f.name} - <b>${f.rate}</b> /f${f.uuid}`
                    }).join('\n')
                } else {
                    html = 'Вы пока ничего не добавили'
                }

                sendHTML(chatId, html, 'home')
            }).catch(e => console.log(e))
        } else {
            sendHTML (chatId, 'Вы пока ничего не добавили', 'home')
        }

    }).catch(e => console.log(e))
}

function sendCinemasByQuery (userId, query) {
    Cinema.find(query).then(cinemas => {

        const html = cinemas.map((c, i) => {
            return `<b>${i + 1}</b> ${c.name} - /c${c.uuid}`      
        }).join('\n')

        sendHTML(userId, html, 'home')
    })
}

function screenInput(msg, aspectRatio, howSideInput, handlerName) {
    const chatId = helper.getChatId(msg)

    if (Number(msg.text) && Number(msg.text) > 0) {
        screenCalculation(msg, aspectRatio, howSideInput)
    }
    else if (Object.values(kb.screen).indexOf(msg.text) > -1) {
        bot.removeListener('message', handlerName)
        //console.log(`not match ${caseName}`)
    }
    else if (msg.text === kb.back) {
        bot.removeListener('message', handlerName)
        //console.log(`not match ${caseName}`)
    }
    else {   
        bot.sendMessage(chatId, `Вводите данные только в цифрах`)                                          
    } 
}

function screenCalculation (msg, aspectRatio, howSideInput) {
    let formatOfscreen
    if (aspectRatio === COEF16TO9) {
        formatOfscreen = '16:9'
    } if (aspectRatio === COEF16TO10) {
        formatOfscreen = '16:10'
    } if (aspectRatio === COEF21TO9) {
        formatOfscreen = '2,35:1'
    }
    const input = Number(msg.text)    
    const chatId = helper.getChatId(msg)

    let sideFromInput

    const diagonal = Math.round(Math.sqrt(Math.pow(input, 2) + Math.pow(sideFromInput, 2)))
    const inputInInches = Math.round(input / 2.54)
    const sideFromInputInInches = Math.round(sideFromInput / 2.54)
    const diagonalInInches = Math.round(diagonal / 2.54)
    let answer = `${input} x ${sideFromInput} см - ширина и высота экрана, формат ${formatOfscreen}
                    \n${diagonal} см - диагональ экрана
                    \n${inputInInches} x ${sideFromInputInInches} дюймов - ширина и высота экрана, формат ${formatOfscreen}
                    \n${diagonalInInches} дюймов - диагональ экрана`                                              
        
    if (howSideInput === WIDTH) {
        sideFromInput = Math.round(input / aspectRatio) 
        /* const diagonal = Math.round(Math.sqrt(Math.pow(input, 2) + Math.pow(sideFromInput, 2)))
        const inputInInches = Math.round(input / 2.54)
        const sideFromInputInInches = Math.round(sideFromInput / 2.54)
        const diagonalInInches = Math.round(diagonal / 2.54)
        const answer = `${input} x ${sideFromInput} см - ширина и высота экрана, формат ${formatOfscreen}
                        \n${diagonal} см - диагональ экрана
                        \n${inputInInches} x ${sideFromInputInInches} дюймов - ширина и высота экрана, формат ${formatOfscreen}
                        \n${diagonalInInches} дюймов - диагональ экрана`                                              
        
        if (input && input > 0) {
            bot.sendMessage(chatId, answer) 
        }
        */                        
    } else if (howSideInput === HEIGHT) {
        const sideFromInput = Math.round(input * aspectRatio)  
        /* const diagonal = Math.round(Math.sqrt(Math.pow(input, 2) + Math.pow(sideFromInput, 2)))
        const inputInInches = Math.round(input / 2.54)
        const sideFromInputInInches = Math.round(sideFromInput / 2.54)
        const diagonalInInches = Math.round(diagonal / 2.54)
        const answer = `${sideFromInput} x ${input} см - ширина и высота экрана, формат ${formatOfscreen}
                        \n${diagonal} см - диагональ экрана
                        \n${sideFromInputInInches} x ${inputInInches} дюймов - ширина и высота экрана, формат ${formatOfscreen}
                        \n${diagonalInInches} дюймов - диагональ экрана`                                                
        if (input && input > 0) {
            bot.sendMessage(chatId, answer)                         
        }   */      

    } else if (howSideInput === DIAGONAL_INPUT) {
        const widthFromInput = Math.round(Math.sqrt(Math.pow(input, 2) * Math.pow(aspectRatio, 2) / (Math.pow(aspectRatio, 2) + 1)))
        const heigtFromWidth = Math.round(widthFromInput / aspectRatio)       
        const diagonalInInches = Math.round(input / 2.54)
        const widthFromInputInInches = Math.round(widthFromInput / 2.54)
        const heigtFromWidthInInches = Math.round(heigtFromWidth / 2.54)
        answer = `${widthFromInput} x ${heigtFromWidth} см - ширина и высота экрана, формат ${formatOfscreen}
                        \n${input} см - диагональ экрана
                        \n${widthFromInputInInches} x ${heigtFromWidthInInches} дюймов - ширина и высота экрана, формат ${formatOfscreen}
                        \n${diagonalInInches} дюймов - диагональ экрана`                                                

        /* if (input && input > 0) {
            bot.sendMessage(chatId, answer)                         
        }  */

    } else {
        console.log('Введите одно из трех значений: width или height, или diagonalInput')
    }

    if (input && input > 0) {
        bot.sendMessage(chatId, answer)                         
    }
}



/* 
function screenCalculation (msg, aspectRatio, howSideInput) {
    //const input = msg;  
    const input = Number(msg.text)    
    const chatId = helper.getChatId(msg)
    
    if (howSideInput === 'width') {
        const sideFromInput = Math.round(input / aspectRatio) 
        const diagonal = Math.round(Math.sqrt(Math.pow(input, 2) + Math.pow(sideFromInput, 2)))
        const inputInInches = Math.round(input / 2.54)
        const sideFromInputInInches = Math.round(sideFromInput / 2.54)
        const diagonalInInches = Math.round(diagonal / 2.54)
        const answer = `${input} x ${sideFromInput} см - ширина и высота экрана, формат 16:9
                        \n${diagonal} см - диагональ экрана
                        \n${inputInInches} x ${sideFromInputInInches} дюймов - ширина и высота экрана, формат 16:9
                        \n${diagonalInInches} дюймов - диагональ экрана`                                              
        
        //return answer
        if (input && input > 0) {
            bot.sendMessage(chatId, answer)                         
        } 
        else {           
            bot.removeListener('message', screenCalculation());
        }
    } else if (howSideInput === 'height') {
        const sideFromInput = Math.round(input * aspectRatio)  
        const diagonal = Math.round(Math.sqrt(Math.pow(input, 2) + Math.pow(sideFromInput, 2)))
        const inputInInches = Math.round(input / 2.54)
        const sideFromInputInInches = Math.round(sideFromInput / 2.54)
        const diagonalInInches = Math.round(diagonal / 2.54)
        const answer = `${sideFromInput} x ${input} см - ширина и высота экрана, формат 16:9
                        \n${diagonal} см - диагональ экрана
                        \n${sideFromInputInInches} x ${inputInInches} дюймов - ширина и высота экрана, формат 16:9
                        \n${diagonalInInches} дюймов - диагональ экрана`                                                
        //return answer
        if (input && input > 0) {
            bot.sendMessage(chatId, answer)                         
        } 
        else {           
            bot.removeListener('message', screenCalculation());
        }
    } else if (howSideInput === 'diagonalInput') {
        const widthFromInput = Math.round(Math.sqrt(Math.pow(input, 2) * Math.pow(aspectRatio, 2) / (Math.pow(aspectRatio, 2) + 1)))
        const heigtFromWidth = Math.round(widthFromInput / aspectRatio) 
        
        const diagonalInInches = Math.round(input / 2.54)
        const widthFromInputInInches = Math.round(widthFromInput / 2.54)
        const heigtFromWidthInInches = Math.round(heigtFromWidth / 2.54)
        const answer = `${widthFromInput} x ${heigtFromWidth} см - ширина и высота экрана, формат 16:9
                        \n${input} см - диагональ экрана
                        \n${widthFromInputInInches} x ${heigtFromWidthInInches} дюймов - ширина и высота экрана, формат 16:9
                        \n${diagonalInInches} дюймов - диагональ экрана`                                                
        //return answer
        if (input && input > 0) {
            bot.sendMessage(chatId, answer)                         
        } 
        else {           
            bot.removeListener('message', screenCalculation());
        }
    } else {
        console.log('Введите одно из трех значений: width или height, или diagonalInput')
        console.log(howSideInput)
        console.log(msg)
    }
} 
*/
 


/*
    if (input && input > 0) {
        bot.sendMessage(chatId, answer)                         
    } 
    else {           
        bot.removeListener('message', screenCalculation);
    }
*/




//console.log(screenCalculation (msg, 1.77777, 'diagonalInput'))



 /*   
  screenCalculation (msg, 1.77777, 'width') 
  */