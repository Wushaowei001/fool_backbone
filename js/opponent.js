var Opponent = function () {
    this._cards = [];
    this.tweens = [];
    this.lastTakedcards = {};

    var that = this;

    var addCardBeforeStep = function (id) {

        var card = App.stage.findOne('#' + that._cards[0]);
        that._cards[0] = id;
        card.setAttr('id', id);
    };

    var addCard = function () {
        var id = 0;
        if (that._cards.length)
            id = that._cards[that._cards.length - 1] + 1;
        else
            id = 1;
        that._cards.push(id);
        return id;
    };

    var addCards = function (count) {
        var cards = [];
        for (var i = 0; i < count; i++) {
            var id = addCard();
            cards.push(id);
        }
        that._addCards(cards);

        if (!App.without_animation)
            that._renderCards(true, true);
    };

    var takeCardsFromTable = function (cards_from_table, through_throw) {
        if (!through_throw) {
            that._destroyLastTakedCards();
            that.lastTakedcards = App.table.getState();
        }
        var cards = [];
        for (var i in cards_from_table) {
            var id = addCard();
            cards.push(id);
        }
        App.table.clearTable();
        if (App.without_animation)
            return false;

        that._takeCardsFromTable(cards_from_table);
        this.trigger('take_cards');
    };

    var removeCard = function (id) {
        that._removeCard(id);
    };

    var getMinTrump = function () {
        return that._getMinTrump();
    };

    this.getLastTakedCards = function () {
        return that.lastTakedcards;
    };

    var renderLastTakedCardsIfVisible = function () {
        that._renderLastTakedCardsIfVisible();
    };

    var needCards = function () {
        return that._needCards();
    };

    var countCards = function () {
        return that._cards.length;
    };

    var renderCards = function (without_animation) {
        that._renderCards(true, without_animation);
    };

    var getMinCard = function (card) {
        return that._getMinCard(card);
    };

    var isHaveCardForPut = function () {
        return that._getCardsForThrow();
    };

    var step = function (card) {
        if (card) {
            addCardBeforeStep(card);
            App.table.addCard(card, true);
            removeCard(card);
            that._renderCards(true, App.without_animation);
        }
    };

    return {
        removeCard: removeCard,
        renderCards: renderCards,
        addCards: addCards,
        getMinTrump: getMinTrump,
        step: step,
        needCards: needCards,
        countCards: countCards,
        takeCardsFromTable: takeCardsFromTable,
        renderLastTakedCardsIfVisible: renderLastTakedCardsIfVisible
    };
};

Opponent.prototype = new Player();