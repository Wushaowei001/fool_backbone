var Config = {
    client: {
        local: {
            https: false,
            domain: 'localhost',
            port: 8028
        },
        test: {
            https: false,
            domain: 'logic-games.spb.ru',
            port: 8128
        },
        real: {
            https: true,
            domain: 'logic-games.spb.ru',
            port: 8028
        }
    },
    cards: {
        height: 96,
        width: 71,
        min_value: 2,
        max_value: 14,
        stroke_width: 1
    },
    player: {
        MAX_COUNT_CARDS: 6,
        LAST_TAKEN_CARDS_X: 100,
        LAST_TAKEN_CARDS_Y: 100
    },
    opponent: {
        MAX_COUNT_CARDS: 6,
        LAST_TAKEN_CARDS_X: 100,
        LAST_TAKEN_CARDS_Y: 100,
        y: 10,
        x: 170,
        sortable: false,
        bottom_player: false,
        prefix_for_cards: 10
    },
    bottom_opponent: {
        MAX_COUNT_CARDS: 6,
        LAST_TAKEN_CARDS_X: 100,
        LAST_TAKEN_CARDS_Y: 550,
        y: 584,
        x: 170,
        sortable: false,
        bottom_player: true,
        prefix_for_cards: 20
    },
    human: {
        MAX_COUNT_CARDS: 6,
        LAST_TAKEN_CARDS_X: 100,
        LAST_TAKEN_CARDS_Y: 100,
        y: 584,
        x: 170,
        sortable: true,
        bottom_player: true
    },
    table: {
        for_opponent: {
            first_line: 337,
            second_line: 207
        },
        for_bottom: {
            first_line: 207,
            second_line: 337
        }
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
            y: 10, // App.getOpponentCoords().y
            x: 10
        },
        my: {
            y: 584, //App.getMyCardsCoords().y,
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
    tooltips: {
        for_pile: {
            tooltip: {
                x: 650,
                y: 340,
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
                text: 'Нажмите для просмотра последних отбитых карт',
                fontFamily: 'Calibri',
                fontSize: 18,
                padding: 5,
                fill: 'white'
            },
            show: 5000
        },
        for_taken_cards: {
            tooltip: {
                x: 400,
                y: 90,
                opacity: 0.75
            },
            tag: {
                fill: 'black',
                pointerDirection: 'up',
                pointerWidth: 20,
                pointerHeight: 20,
                lineJoin: 'round',
                shadowColor: 'black',
                shadowBlur: 10,
                shadowOffset: 10,
                shadowOpacity: 0.5
            },
            text: {
                text: 'Нажмите для просмотра последних взятых соперником карт',
                fontFamily: 'Calibri',
                fontSize: 18,
                padding: 5,
                fill: 'white'
            },
            show: 5000
        }
    },
    text: {
        attack_phrase: 'Ваш ход',
        protect_phrase: 'Ваш ход',
        computer_name: 'Компьютер',
        history: {
            win: 'Победа',
            loose: 'Поражение',
            draw: 'Ничья'
        }
    },
    interval_actions: {
        throw: {
            time: 5 // in sec
        },
        moveBackInterval: {
            interval: 100, // milliseconds
            timeout: 1000
        },
        moveForwardInterval: {
            interval: 100, // milliseconds
            timeout: 1000
        }
    },
    decks: {
        default: {
            count: 36
        },
        deck_52: {
            count: 52
        }
    },
    trump: {
        x: 136
    }
};