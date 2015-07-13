var Deck = function (count) {
    var suits = ['c', 'd', 'h', 's'];

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

    var deck = function () {
        var deck = [];
        for (var i in suits) {
            for (var j in cards) {
                deck.push(suits[i] + cards[j]);
            }
        }
        deck = _.shuffle(deck);

        return deck;
    };

    return deck();

};