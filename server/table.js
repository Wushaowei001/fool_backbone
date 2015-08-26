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

    this.addTransferableCard = function (id, userId) {
        this.state.cards.push({id: id, over: ''});
        this.state.attacker = userId;
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

    this.getCardsOver = function () {
        var all_cards = this.state.cards;
        var cards = [];
        all_cards.map(function (card) {
            if (card.over)
                cards.push(card.over);
        });
        return cards;
    };

    this.getCardForBeat = function () {
        var all_cards = this.state.cards;
        for (var i in all_cards) {
            if (!all_cards[i].over)
                return all_cards[i].id;
        }
        return false;
    };

    this.getCountCardsOver = function () {
        var cards = this.getCardsOver();
        return cards ? cards.length : 0;
    };

    this.possibleTransfer = function (id) {
        if (id) {
            var card_for_beat = this.getCardForBeat();
            if (card_for_beat && card_for_beat.slice(1) != id.slice(1))
                return false;
        }
        return card_for_beat && !this.getCountCardsOver();
    };
};