const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.rate, kb.home.price],
        [kb.home.sale, kb.home.promo],
        [kb.home.screen_calc]
        //[kb.home.favourite],
        //[kb.home.films, kb.home.cinemas]
    ],
    films: [
        [kb.film.random],
        [kb.film.action, kb.film.comedy],
        [kb.back]
    ],
    cinemas:[
        [
            {
                text: 'Отправить местоположение',
                request_location: true
            }
        ],
        [
            kb.back
        ]
    ]

}




