module.exports = function () {
    var priority = [
        6, 7, 8, 9, 10, 11, 12, 13, 14
    ];
    var suits = ['c', 'd', 'h', 's'];
    var _cards = [];

    var deck = function () {
        var init = function () {
            for (var i in suits) {
                for (var j in priority) {
                    _cards.push(suits[i] + priority[j]);
                }
            }
            var counter = _cards.length, temp, index;

            while (counter > 0) {
                index = Math.floor(Math.random() * counter);

                counter--;

                temp = _cards[counter];
                _cards[counter] = _cards[index];
                _cards[index] = temp;
            }
        };
        var getCards = function (count, callback) {
            if (!_cards.length)
                return false;
            var cards = [];
            for (var i = 0; i < count; i++) {
                var card = _cards.shift();
                if (card) {
                    cards.push(card);
                }
            }
            if (typeof callback === 'function')
                callback(cards);
            return cards;
        };
        var isEmpty = function () {
            return !_cards.length;
        };
        var cardsRemain = function () {
            return _cards.length;
        };

        var setCountCards = function (count) {
            var cards = [];
            var begin;
            switch (count) {
                case 36:
                    begin = 6;
                    break;
                case 52:
                    begin = 2;
                    break;
            }
            for (var i = begin, j = 0; j < count / suits.length; i++, j++) {
                cards.push(i);
            }
            priority = cards;
            return cards;
        };

        return {
            init: init,
            cards: _cards,
            getCards: getCards,
            isEmpty: isEmpty,
            cardsRemain: cardsRemain,
            setCountCards: setCountCards
        };
    };
    return deck();
};