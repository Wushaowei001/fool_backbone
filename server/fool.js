var Deck = require('./deck.js');
var Player = require('./player');
var Table = require('./table');

var deck, trump, mode;

var Config = {
    modes: {
        default: {
            cards_in_deck: 36,
            cards_in_hand: 6
        },
        transferable: {
            cards_in_deck: 36,
            cards_in_hand: 6
        },
        deck_52: {
            cards_in_deck: 52,
            cards_in_hand: 6
        }
    }
};

module.exports = function () {

    this.setTrump = function () {
        var index = deck.cards.length - 1;
        trump = deck.cards[index];
    };

    this.getTrump = function () {
        return trump;
    };
    this.getMinTrump = function (cards) {
        var min_trump = '';
        var trump = this.getTrump();
        for (var i in cards) {
            if (cards[i][0] == trump) {
                var current_val = +cards[i].slice(1);
                if (!min_trump) {
                    min_trump = cards[i];
                }
                else {
                    if (+min_trump.slice(1) > current_val)
                        min_trump = cards[i];
                }
            }
        }
        return min_trump;
    };

    this.setMode = function (m) {
        mode = m;
        switch (m) {
            case 'default':
            case 'transferable':
                this.setDeckCount(Config.modes.default.cards_in_deck);
                break;
            case 'deck_52':
                this.setDeckCount(Config.modes.deck_52.cards_in_deck);
                break;
        }
    };

    this.createDeck = function () {
        deck = new Deck();
    };

    this.iniDeck = function () {
        deck.init();
        this.setTrump();
    };

    this.setDeckCount = function (count) {
        deck.setCountCards(count);
    };

    this.getDeck = function () {
        return deck;
    };

    this.end = function () {
        deck = null;
    };

    this.initPlayer = function () {
        return new Player();
    };

    this.initTable = function () {
        return new Table();
    };

    this.isTransfarable = function () {
        return mode == 'transferable';
    };

    this.isFirstHand = function () {
        var deck = this.getDeck();
        if (deck) {
            var deck_remain = deck.cardsRemain();
            return Config.modes[mode].cards_in_deck == Config.modes[mode].cards_in_hand * 2 + deck_remain;
        }
        return false;
    };
};