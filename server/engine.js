var App = require('./fool.js');


module.exports = {
    getGameResult: function (room, user, turn) {
        switch (turn.result) {
            case 0: // win second player, white
                for (var i = 0; i < room.players.length; i++) {
                    if (room.players[i] != user) {
                        return {
                            winner: room.players[i]
                        };
                    }
                }
                break;
            case 1: // win first player, black
                return {
                    winner: user
                };
                break;
            case 2: // draw
                return {
                    winner: null
                };
                break;
            default:
                return false;
        }
        throw new Error('can not compute winner! room:' + room.id + ' result: ' + turn.result);
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
            room.app.end();
            user.cards = null;
            opponent.cards = null;
            return turn;
        }
        if (turn.type == 'addToPile') {
            return turn;
        }
        if (turn.type == 'takeCards') {
            for (var i in turn.cards) {
                user.cards.push(turn.cards[i]);
            }
        }
        else {
            if (turn.cards) {
                for (var i in turn.cards) {
                    user.cards.pop();
                }
            }
            else
                user.cards.pop();
        }
        return turn;
    },
    userEvent: function (room, user, event) {
        var data = [];
        var opponent = room.players[0] == user ? room.players[1] : room.players[0];
        var last_turn = room.game.history.length ? room.game.history[room.game.history.length - 1] : null;

        if (event.data == 'getCards') {
            if (last_turn && last_turn.card)
                return false;
            var need_cards = !user.cards ? 6 : 6 - user.cards.length;
            if (need_cards > 0) {
                if (!user.cards)
                    user.cards = [];
                var cards = room.app.deck.getCards(need_cards);
                var deckIsEmpty = false;
                var onlyTrumpRemain = false;
                var cardsRemain = room.app.deck.cardsRemain();
                if (room.app.deck.isEmpty())
                    deckIsEmpty = true;
                if (cardsRemain == 1)
                    onlyTrumpRemain = true;

                for (var i in cards) {
                    user.cards.push(cards[i]);
                }
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
                        from: user
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
            room.players[i].cards = null;
        }

        return {
            inviteData: room.inviteData
        }
    }
};