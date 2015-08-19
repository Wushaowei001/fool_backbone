var App = require('./fool.js');


module.exports = {
    getGameResult: function (room, user, turn, type) {
        switch (type) {
            case 'timeout':
                if (type == 'timeout') {
                    // if user have max timeouts, other win
                    if (room.data[user.userId].timeouts == room.maxTimeouts) {
                        return {
                            winner: room.getOpponent(user),
                            action: 'timeout'
                        };
                    } else return false;
                }
                break;
            case 'event':
                if (turn.type) {
                    return false;
                }
                break;
            case 'turn':
                switch (turn.result) {
                    case 0: // win other player
                        for (var i = 0; i < room.players.length; i++) {
                            if (room.players[i] != user) {
                                return {
                                    winner: room.players[i]
                                };
                            }
                        }
                        break;
                    case 1: // win current player
                        return {
                            winner: user
                        };
                        break;
                    case 2: // draw
                        return {
                            winner: null
                        };
                        break;
                    default: // game isn't end
                        return false;
                }
                break;
        }
    },
    setFirst: function (room) {
        if (!room.game.first) return room.owner;
        if (room.players[0] == room.game.first)
            return room.players[1];
        else
            return room.players[0];
    },
    switchPlayer: function (room, user, turn) {
        if (turn.switch) {
            if (room.players[0] == user) return room.players[1];
            else return room.players[0];
        }
    },
    doTurn: function (room, user, turn) {
        var opponent = room.players[0] == user ? room.players[1] : room.players[0];
        if (typeof turn.result != 'undefined') {
            turn.result = false;
//            room.app.end();
//            user.cards = null;
//            opponent.cards = null;
            return turn;
        }
        if (turn.turn_type == 'addToPile') {
            return turn;
        }
        if (turn.turn_type == 'takeCards') {
            user.foolPlayer.addCards(turn.cards);
//            for (var i in turn.cards) {
//                user.cards.push(turn.cards[i]);
//            }
        }
        else {
            if (turn.cards) {
                for (var i in turn.cards) {
                    if (!user.foolPlayer.hasCard(turn.cards[i]))
                        return false;
                }
                user.foolPlayer.removeCards(turn.cards);
//                for (var i in turn.cards) {
//                    user.cards.pop();
//                }
            }
            else {
                if (!user.foolPlayer.hasCard(turn.card)) {
                    return false;
                }
                user.foolPlayer.removeCard(turn.card);
            }
//            user.cards.pop();
        }
        if (room.app.deck.isEmpty()) {
            if (user.foolPlayer.getCountCards() == 0) {
                // draw
                if (room.getOpponent(user).foolPlayer.getCountCards() == 0) {
                    turn.result = 2;
                }
                // win
                if (room.getOpponent(user).foolPlayer.getCountCards() > 1) {
                    turn.result = 1;
                    turn.opponent_cards = room.getOpponent(user).foolPlayer.getCards();
                }
            }
            if (user.foolPlayer.getCountCards() > 0 && room.getOpponent(user).foolPlayer.getCountCards() == 0) {
                // loose
                turn.result = 0;
            }
        }

        return turn;
    },
    userEvent: function (room, user, event) {
        var data = [];
        var opponent = room.players[0] == user ? room.players[1] : room.players[0];
        var last_turn = room.game.history.length ? room.game.history[room.game.history.length - 1] : null;

        if (event.data == 'getCards') {
            if (last_turn) {
                if (last_turn.card || (last_turn.turn_type && last_turn.turn_type == 'throw'))
                    return false;
            }
            var need_cards = user.foolPlayer.getCountCardsNeeded();
            if (need_cards > 0) {
//                if (!user.cards)
//                    user.cards = [];
                var cards = room.app.deck.getCards(need_cards);
                var deckIsEmpty = false;
                var onlyTrumpRemain = false;
                var cardsRemain = room.app.deck.cardsRemain();
                if (room.app.deck.isEmpty())
                    deckIsEmpty = true;
                if (cardsRemain == 1)
                    onlyTrumpRemain = true;

                if (cards && cards.length)
                    user.foolPlayer.addCards(cards);

//                for (var i in cards) {
//                    user.cards.push(cards[i]);
//                }
                data.push({
                    target: user,
                    event: {
                        type: 'addCards',
                        cards: cards,
                        deckIsEmpty: deckIsEmpty,
                        onlyTrumpRemain: onlyTrumpRemain,
                        cardsRemain: cardsRemain
                    }
                });
                data.push({
                    target: opponent,
                    event: {
                        type: 'addCards',
                        opponent_cards: cards.length,
                        deckIsEmpty: deckIsEmpty,
                        onlyTrumpRemain: onlyTrumpRemain,
                        cardsRemain: cardsRemain
                    }
                });
                data.push({
                    target: room,
                    event: {
                        type: 'addCards',
                        cards: cards.length,
                        for: user.userId,
                        deckIsEmpty: deckIsEmpty,
                        onlyTrumpRemain: onlyTrumpRemain,
                        cardsRemain: cardsRemain
                    }
                });
            }
            else {
                data.push({
                    target: user,
                    event: {
                        type: 'addCards'
                    }
                });
            }
        }
        if (event.data == 'canTurn') {
            var canTurn = user.foolPlayer.hasCard(event.id);
            data.push({
                target: user,
                event: {
                    type: 'canTurn',
                    canTurn: canTurn,
                    id: event.id
                }
            });
        }
        return data;
    },
    gameEvent: function (room, user, turn, flagRoundStart) {
        if (flagRoundStart) {

            return turn;
        }
    },

    initGame: function (room) {
        room.app = new App();
        var mode = room.mode;
        room.app.createDeck();
        room.app.setMode(mode);
        room.app.iniDeck();
        room.app.deck = room.app.getDeck();
        room.inviteData.trumpVal = room.app.getTrump();
        for (var i in room.players) {
            room.players[i].foolPlayer = room.app.initPlayer();
//            room.players[i].cards = null;
        }

        return {
            inviteData: room.inviteData
        }
    }
};