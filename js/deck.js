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
//    var priority = [
//        6, 7, 8, 9, 10, 11, 12, 13, 14
//    ];


    var deck = function () {
        var deck = [];
        for (var i in suits) {
            for (var j in cards) {
                deck.push(suits[i] + cards[j]);
            }
        }
        var counter = deck.length, temp, index;

        while (counter > 0) {
            index = Math.floor(Math.random() * counter);

            counter--;

            temp = deck[counter];
            deck[counter] = deck[index];
            deck[index] = temp;
        }

        return deck;
    };

    return deck();

};