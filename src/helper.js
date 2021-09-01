module.exports = {
    
    logStart() {
        console.log('Bot has been started...')
    },

    getChatId(msg) {
        return msg.chat.id
    },

    getItemUuid(source) {
        return source.substr(2, source.length)
    }

}

//=======================================================================================================


const handler = (msg, aspectRatio) => {
    const input = Number(msg.text)                
    const sideFromInput = Math.round(input / aspectRatio)  
    const diagonal = Math.round(Math.sqrt(Math.pow(input, 2) + Math.pow(sideFromInput, 2)))
    const inputInInches = Math.round(input / 2.54)
    const sideFromInputInInches = Math.round(sideFromInput / 2.54)
    const diagonalInInches = Math.round(diagonal / 2.54)
    const answer = `${input} x ${sideFromInput} см - ширина и высота экрана, формат 16:9
                    \n${diagonal} см - диагональ экрана
                    \n${inputInInches} x ${sideFromInputInInches} дюймов - ширина и высота экрана, формат 16:9
                    \n${diagonalInInches} дюймов - диагональ экрана`                             
                    
    if (input && input > 0) {
        bot.sendMessage(chatId, answer)                         
    } 
    else {           
        bot.removeListener('message', handler);
    }
}




/*

function loco (msg, aspectRatio) {
    const input = msg;                
    const sideFromInput = Math.round(input / aspectRatio)  ;
    const diagonal = Math.round(Math.sqrt(Math.pow(input, 2) + Math.pow(sideFromInput, 2)));
    const inputInInches = Math.round(input / 2.54);
    const sideFromInputInInches = Math.round(sideFromInput / 2.54);
    const diagonalInInches = Math.round(diagonal / 2.54);
    const answer = `${input} x ${sideFromInput} см - ширина и высота экрана, формат 16:9
                    \n${diagonal} см - диагональ экрана
                    \n${inputInInches} x ${sideFromInputInInches} дюймов - ширина и высота экрана, формат 16:9
                    \n${diagonalInInches} дюймов - диагональ экрана`   ;                          
                    
   return answer
}

loco (333, 1.77777)


*/






