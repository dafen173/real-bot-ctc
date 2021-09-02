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

function screenCalculation (msg, aspectRatio, howSideInput) {
    const input = msg;    
    
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
        return answer
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
        return answer
    } else if (howSideInput === 'diagonalInput') {

        const widthFromInput = Math.round(Math.sqrt(Math.pow(input, 2) * Math.pow(aspectRatio, 2) / 2))
        const heigtFromWidth = Math.round(input / aspectRatio) 
        
        const diagonalInInches = Math.round(input / 2.54)
        const widthFromInputInInches = Math.round(widthFromInput / 2.54)
        const heigtFromWidthInInches = Math.round(heigtFromWidth / 2.54)

        const answer = `${widthFromInput} x ${heigtFromWidth} см - ширина и высота экрана, формат 16:9
                        \n${input} см - диагональ экрана
                        \n${widthFromInputInInches} x ${heigtFromWidthInInches} дюймов - ширина и высота экрана, формат 16:9
                        \n${diagonalInInches} дюймов - диагональ экрана`                                                
        return answer


    } else {
        console.log('Введите одно из трех значений: width или height, или diagonalInput')
    }

}

screenCalculation (381, 1.77777, 'diagonalInput')
*/









