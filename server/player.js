var _ = require('underscore');
module.exports = function () {

    var MAX_COUNT_CARDS = 6;
    var _cards = [];

    this.addCards = function (cards) {
        if (cards && cards.length)
            _cards = _cards.concat(cards);
    };

    this.getCards = function () {
        return _cards;
    };

    this.getCountCards = function () {
        return this.getCards().length;
    };

    this.hasCard = function (id) {
        return _.contains(this.getCards(), id);
    };

    this.setCards = function (cards) {
        _cards = _.map(cards, function (id) {
            return id;
        });
    };

    this.removeCard = function (id) {
        _cards = _.without(this.getCards(), id);
    };

    this.removeCards = function (cards) {
        for (var i in cards) {
            _cards = _.without(this.getCards(), cards[i]);
        }
    };

    this.getCountCardsNeeded = function () {
        return MAX_COUNT_CARDS - this.getCountCards();
    }
};