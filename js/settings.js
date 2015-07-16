var Settings = {
    cards: {
        height: 96,
        width: 71
    },
    player: {
        MAX_COUNT_CARDS: 6,
        LAST_TAKED_CARDS_X: 100,
        LAST_TAKED_CARDS_Y: 100
    },
    card_stroke_color: 'black',
    timer: {
        color: '#ffffc2',
        color_ending_soon: '#ff6533',
        width: 10,
        height: 96,
        id: 'timer',
        ending_soon: 0.25,
        x: 10,
        vertical: true,
        opponent: {
            y: 70, // App.getOpponentCoords().y
            x: 10
        },
        my: {
            y: 524, //App.getMyCardsCoords().y,
            x: 10
        }
    },
    loader: {
        x: 100,
        y: 300,
        color: '#ffffc2',
        color_ending_soon: '#ffffc2',
        width: 550,
        height: 20,
        id: 'loader',
        horizontal: true
    },
    tooltip: {
        for_pile: {
            tooltip: {
                x: 650,
                y: 270,
                opacity: 0.75
            },
            tag: {
                fill: 'black',
                pointerDirection: 'right',
                pointerWidth: 20,
                pointerHeight: 20,
                lineJoin: 'round',
                shadowColor: 'black',
                shadowBlur: 10,
                shadowOffset: 10,
                shadowOpacity: 0.5
            },
            text: {
                text: 'Щелкните для просмотра последнего отбоя',
                fontFamily: 'Calibri',
                fontSize: 18,
                padding: 5,
                fill: 'white'
            }
        }
    },
    text: {
        attack_phrase: 'Атакуйте',
        protect_phrase: 'Отбивайтесь'
    }
};