var _ = require('underscore');
module.exports = function () {
    this.state = {
        cards: [],
        attacker: null
    };

    this.addCard = function (id, userId) {
        var cards = this.state.cards;
        if (!this.state.attacker)
            this.state.attacker = userId;
        if (cards.length) {
            var inserted = false;
            for (var i in cards) {
                if (!cards[i].over) {
                    cards[i].over = id;
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                cards.push({id: id, over: ''});
            }
        }
        else {
            cards.push({id: id, over: ''});
        }
    };

    this.addTransferableCard = function (id) {
        this.state.cards.push({id: id, over: ''});
    };

    this.addCards = function (ids, userId) {
        this.state.attacker = userId;
        var cards = this.state.cards;
        for (var i in ids) {
            cards.push({id: ids[i], over: ''});
        }
    };

    this.clear = function () {
        this.state = {
            cards: [],
            attacker: null
        }
    };
    this.getState = function () {
        return {
            cards: this.state.cards.slice(''),
            attacker: this.state.attacker
        }
    };
};