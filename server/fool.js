var Deck = require('./deck.js');

module.exports = function () {
    var deck, trump;

    var setTrump = function () {
        var index = deck.cards.length - 1;
        trump = deck.cards[index];
    };

    var getTrump = function () {
        return trump;
    };
    var getMinTrump = function (cards) {
        var min_trump = '';
        var trump = getTrump();
        for (var i in cards) {
            if (cards[i][0] == trump) {
                var current_val = +cards[i].split(trump)[1];
                if (!min_trump) {
                    min_trump = cards[i];
                }
                else {
                    if (+min_trump.split(trump)[1] > current_val)
                        min_trump = cards[i];
                }
            }
        }
        return min_trump;
    };

    var setMode = function (mode) {
        switch (mode) {
            case 'default':
                setDeckCount(36);
                break;
            case 'deck_52':
                setDeckCount(52);
                break;
        }
    };

    var createDeck = function () {
        deck = new Deck();
    };

    var iniDeck = function () {
        deck.init();
        setTrump();
    };

    var setDeckCount = function (count) {
        deck.setCountCards(count);
    };

    var getDeck = function () {
        return deck;
    };

    var end = function () {
        deck = null;
    };

    return {
        getTrump: getTrump,
        trump: trump,
        getMinTrump: getMinTrump,
        end: end,
        getDeck: getDeck,
        setMode: setMode,
        iniDeck: iniDeck,
        createDeck: createDeck
    };
};