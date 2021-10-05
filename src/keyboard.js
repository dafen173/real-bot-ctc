const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.rate, kb.home.price],
        [kb.home.sale, kb.home.promo],
        [kb.home.screen_calc]
        //[kb.home.favourite],
        //[kb.home.films, kb.home.cinemas]
    ],
    screens: [
        [kb.screen.w16to9],
        [kb.screen.h16to9],
        [kb.screen.d16to9],
        [kb.screen.w16to10],
        [kb.screen.h16to10],
        [kb.screen.d16to10],
        [kb.screen.w21to9],
        [kb.screen.h21to9],
        [kb.screen.d21to9],
        [kb.back]
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




