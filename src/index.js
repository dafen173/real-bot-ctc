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

const COEF16TO9 = 1.77777
const COEF16TO10 = 1.6
const COEF21TO9 = 2.35
const SM_TO_INCHES = 2.54
const WIDTH = 'width'
const HEIGHT = 'height'
const DIAGONAL_INPUT = 'diagonalInput'
const INPUT_WIDTH_SM = `Укажите ширину в сантиметрах`
const INPUT_HEIGHT_SM = `Укажите высоту в сантиметрах`
const INPUT_DIADONAL_INCHES = `Укажите диагональ в дюймах`

// =========================================================================

/* const bot = new TelegramBot (config.TOKEN, {
    polling: true
}) */


const bot = new TelegramBot (process.env.BOT_TOKEN, {
    polling: true
})


bot.on('message', msg => {
    const chatId = helper.getChatId(msg)

    switch (msg.text) {
        case kb.home.rate:
            //bot.sendMessage(chatId, config.EXCHANGE_RATE)
            const now = new Date().toLocaleString()
            bot.sendMessage(chatId, now)
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
            bot.sendMessage(chatId, INPUT_WIDTH_SM)                      
            const w16on9Handler = (msg) => {                   
                screenInput(msg, COEF16TO9, WIDTH, w16on9Handler)               
            }          
            bot.on('message', w16on9Handler)           
            break
        case kb.screen.h16to9:
            bot.sendMessage(chatId, INPUT_HEIGHT_SM)           
            const h16on9Handler = (msg) => {
                screenInput(msg, COEF16TO9, HEIGHT, h16on9Handler) 
            }           
            bot.on('message', h16on9Handler)  
            break
        case kb.screen.d16to9:
            bot.sendMessage(chatId, INPUT_DIADONAL_INCHES)                      
            const d16on9Handler = (msg) => {                   
                screenInput(msg, COEF16TO9, DIAGONAL_INPUT, d16on9Handler)               
            }          
            bot.on('message', d16on9Handler)           
            break
        case kb.screen.w16to10:
            bot.sendMessage(chatId, INPUT_WIDTH_SM)                      
            const w16on10Handler = (msg) => {                   
                screenInput(msg, COEF16TO10, WIDTH, w16on10Handler)               
            }     
            bot.on('message', w16on10Handler)           
            break
        case kb.screen.h16to10:
            bot.sendMessage(chatId, INPUT_HEIGHT_SM)                      
            const h16on10Handler = (msg) => {                   
                screenInput(msg, COEF16TO10, HEIGHT, h16on10Handler)               
            }
            bot.on('message', h16on10Handler)           
            break
        case kb.screen.d16to10:
            bot.sendMessage(chatId, INPUT_DIADONAL_INCHES)                      
            const d16on10Handler = (msg) => {                   
                screenInput(msg, COEF16TO10, DIAGONAL_INPUT, d16on10Handler)               
            }
            bot.on('message', d16on10Handler)           
            break
        case kb.screen.w21to9:
            bot.sendMessage(chatId, INPUT_WIDTH_SM)                      
            const w21on9Handler = (msg) => {                   
                screenInput(msg, COEF21TO9, WIDTH, w21on9Handler)               
            }     
            bot.on('message', w21on9Handler)           
            break
        case kb.screen.h21to9:
            bot.sendMessage(chatId, INPUT_HEIGHT_SM)                      
            const h21on9Handler = (msg) => {                   
                screenInput(msg, COEF21TO9, HEIGHT, h21on9Handler)               
            }     
            bot.on('message', h21on9Handler)           
            break
        case kb.screen.d21to9:
            bot.sendMessage(chatId, INPUT_DIADONAL_INCHES)                      
            const d21on9Handler = (msg) => {                   
                screenInput(msg, COEF21TO9, DIAGONAL_INPUT, d21on9Handler)               
            }     
            bot.on('message', d21on9Handler)           
            break
        case kb.back:
            bot.sendMessage(chatId, `Выберите команду для начала работы:`, {
                reply_markup: {keyboard: keyboard.home}
            })
            break


        case kb.home.contacts:
            bot.sendMessage(chatId, config.CONTACTS_ANSWER)
            break
        case kb.home.arrival:
            bot.sendMessage(chatId, config.ARRIVAL_ANSWER)
            break
        case kb.home.review:
            bot.sendMessage(chatId, config.REVIEW_ANSWER)
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


//==================================================================================================

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
        bot.sendMessage(chatId, `Вводите данные только в цифрах больше нуля`)                                          
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
    let widthScreen, 
        heightScreen, 
        diagonalScreen
                                                 
    if (howSideInput === WIDTH) {
        widthScreen = input
        heightScreen = Math.round(input / aspectRatio) 
        diagonalScreen = Math.round(Math.sqrt(Math.pow(widthScreen, 2) + Math.pow(heightScreen, 2)))                     
    } else if (howSideInput === HEIGHT) {
        heightScreen = input
        widthScreen = Math.round(input * aspectRatio)
        diagonalScreen = Math.round(Math.sqrt(Math.pow(widthScreen, 2) + Math.pow(heightScreen, 2)))     
    } /* else if (howSideInput === DIAGONAL_INPUT) {
        diagonalInInches = input
        widthInInches = Math.round(Math.sqrt(Math.pow(input, 2) * Math.pow(aspectRatio, 2) / (Math.pow(aspectRatio, 2) + 1)))
        heightInInches = Math.round(widthInInches / aspectRatio)
        widthScreen = widthInInches * SM_TO_INCHES
        heightScreen = heightInInches * SM_TO_INCHES
        diagonalScreen = diagonalInInches * SM_TO_INCHES
    } */ 
    
    /* else {
        console.log('Передайте функции screenCalculation одно из трех значений: width или height, или diagonalInput')
    } */

    let widthInInches = Math.round(widthScreen / SM_TO_INCHES)
    let heightInInches = Math.round(heightScreen / SM_TO_INCHES)
    let diagonalInInches = Math.round(diagonalScreen / SM_TO_INCHES)  

    if (howSideInput === DIAGONAL_INPUT) {
        diagonalInInches = input
        widthInInches = Math.round(Math.sqrt(Math.pow(input, 2) * Math.pow(aspectRatio, 2) / (Math.pow(aspectRatio, 2) + 1)))
        heightInInches = Math.round(widthInInches / aspectRatio)
        widthScreen = Math.round(widthInInches * SM_TO_INCHES)
        heightScreen = Math.round(heightInInches * SM_TO_INCHES)
        diagonalScreen = Math.round(diagonalInInches * SM_TO_INCHES)
    }

    const answer = `${widthScreen} x ${heightScreen} см - ширина и высота экрана, формат ${formatOfscreen}
                    \n${diagonalScreen} см - диагональ экрана
                    \n${widthInInches} x ${heightInInches} дюймов - ширина и высота экрана, формат ${formatOfscreen}
                    \n${diagonalInInches} дюймов - диагональ экрана`

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

