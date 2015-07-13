var Opponent = Player.extend({
    defaults: {
        _cards: [],
        tweens: [],
        lastTakedcards: []
    },
    initialize: function (options) {
        for (var i in options) {
            this.set(i, options[i]);
//            this.defaults[i] = options[i];
        }
    },
    getCards: function () {
        return this.get('_cards');
    },
    addCardBeforeStep: function (id) {

        var card = App.get('stage').findOne('#' + this.getCards()[0]);
        var cards = this.getCards();
        cards[0] = id;
        this.set('_cards', cards);
        card.setAttr('id', id);
    },

    addCard: function () {
        var id = 0;
        if (this.getCards().length)
            id = this.getCards()[this.getCards().length - 1] + 1;
        else
            id = 1;
        var cards = this.getCards();
        cards.push(id);
        this.set('_cards', cards);
        return id;
    },

    addCards: function (count) {
        var cards = [];
        for (var i = 0; i < count; i++) {
            var id = this.addCard();
            cards.push(id);
        }
        this._super('_addCards', cards);

        if (!App.get('without_animation'))
            this._super('_renderCards', true, true);
    },

    takeCardsFromTable: function (cards_from_table, through_throw) {
        if (!through_throw) {
            this._super('_destroyLastTakedCards');
            this.set('lastTakedcards', App.get('table').getState());
//            this.lastTakedcards = App.table.getState();
        }
        var cards = [];
        for (var i in cards_from_table) {
            var id = this.addCard();
            cards.push(id);
        }
        App.get('table').clearTable();
        if (App.get('without_animation'))
            return false;

        this._super('_takeCardsFromTable', cards_from_table);
        this.trigger('take_cards');
    },

    removeCard: function (id) {
        this._super('_removeCard', id);
    },

    getMinTrump: function () {
        return this._super('_getMinTrump');
    },

    getLastTakedCards: function () {
        return this.get('lastTakedcards');
    },

    renderLastTakedCardsIfVisible: function () {
        this._super('_renderLastTakedCardsIfVisible');
    },

    needCards: function () {
        return this._super('_needCards');
    },

    countCards: function () {
        return this.getCards().length;
    },

    renderCards: function (without_animation) {
        this._super('_renderCards', true, without_animation);
    },

    getMinCard: function (card) {
        return this._super('_getMinCard', card);
    },

    getCardsForThrow: function () {
        return this._super('_getCardsForThrow');
    },

    step: function (card) {
        if (card) {
            this.addCardBeforeStep(card);
            App.get('table').addCard(card, true);
            this.removeCard(card);
            this._super('_renderCards', true, App.get('without_animation'));
        }
    }
});

//var Opponent = function () {
//    this._cards = [];
//    this.tweens = [];
//    this.lastTakedcards = {};
//
//    var this = this;
//
//    var addCardBeforeStep = function (id) {
//
//        var card = App.stage.findOne('#' + this._cards[0]);
//        this._cards[0] = id;
//        card.setAttr('id', id);
//    };
//
//    var addCard = function () {
//        var id = 0;
//        if (this._cards.length)
//            id = this._cards[this._cards.length - 1] + 1;
//        else
//            id = 1;
//        this._cards.push(id);
//        return id;
//    };
//
//    var addCards = function (count) {
//        var cards = [];
//        for (var i = 0; i < count; i++) {
//            var id = addCard();
//            cards.push(id);
//        }
//        this._addCards(cards);
//
//        if (!App.without_animation)
//            this._renderCards(true, true);
//    };
//
//    var takeCardsFromTable = function (cards_from_table, through_throw) {
//        if (!through_throw) {
//            this._destroyLastTakedCards();
//            this.lastTakedcards = App.table.getState();
//        }
//        var cards = [];
//        for (var i in cards_from_table) {
//            var id = addCard();
//            cards.push(id);
//        }
//        App.table.clearTable();
//        if (App.without_animation)
//            return false;
//
//        this._takeCardsFromTable(cards_from_table);
//        this.trigger('take_cards');
//    };
//
//    var removeCard = function (id) {
//        this._removeCard(id);
//    };
//
//    var getMinTrump = function () {
//        return this._getMinTrump();
//    };
//
//    this.getLastTakedCards = function () {
//        return this.lastTakedcards;
//    };
//
//    var renderLastTakedCardsIfVisible = function () {
//        this._renderLastTakedCardsIfVisible();
//    };
//
//    var needCards = function () {
//        return this._needCards();
//    };
//
//    var countCards = function () {
//        return this._cards.length;
//    };
//
//    var renderCards = function (without_animation) {
//        this._renderCards(true, without_animation);
//    };
//
//    var getMinCard = function (card) {
//        return this._getMinCard(card);
//    };
//
//    var isHaveCardForPut = function () {
//        return this._getCardsForThrow();
//    };
//
//    var step = function (card) {
//        if (card) {
//            addCardBeforeStep(card);
//            App.table.addCard(card, true);
//            removeCard(card);
//            this._renderCards(true, App.without_animation);
//        }
//    };
//
//    return {
//        removeCard: removeCard,
//        renderCards: renderCards,
//        addCards: addCards,
//        getMinTrump: getMinTrump,
//        step: step,
//        needCards: needCards,
//        countCards: countCards,
//        takeCardsFromTable: takeCardsFromTable,
//        renderLastTakedCardsIfVisible: renderLastTakedCardsIfVisible
//    };
//};
//
//Opponent.prototype = new Player();