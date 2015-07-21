var Opponent = Player.extend({
    defaults: {
        _cards: [],
        tweens: [],
        lastTakenCards: []
    },
    initialize: function (options) {
        for (var i in options) {
            this.set(i, options[i]);
        }
        this.on('destroy', function () {
            this.off();
            this.stopListening();
        });
        this.on('change', function (p) {
            console.log(p.changed);
        });
    },
    getCards: function () {
        return this.get('_cards');
    },
    getCardsCoords: function () {
        return this._super('_getCardsCoords');
    },

    addCardBeforeStep: function (id) {

        var card = App.get('stage').findOne('#' + this.getCards()[0]);
        var cards = this.getCards();
        cards[0] = id;
        this.set('_cards', cards);
        card.setAttr('id', id);
    },
    setCards: function (cards) {
        this.set('_cards', cards);
    },
    addCards: function (count) {
        var cards = [];
        var id;
        for (var i = 0; i < count; i++) {
            id = this.calculateId();
            cards.push(id);
            this.setCards(this.getCards().concat(id));
        }

        this._super('_addCards', cards);

        if (!App.get('without_animation'))
            this._super('_renderCards', true, true);
    },

    takeCardsFromTable: function (cards_from_table, through_throw) {
        if (!through_throw) {
            this._super('_destroyLastTakenCards');
            this.set('lastTakenCards', App.get('table').getState());
        }
        var cards = [];
        var id;
        for (var i in cards_from_table) {
            id = this.calculateId();
            this.setCards(this.getCards().concat(id));
        }

        App.get('table').clearTable();
        if (App.get('without_animation'))
            return false;

        this._super('_takeCardsFromTable', cards_from_table);
        this.trigger('take_cards');
    },

    calculateId: function () {
        var id = 0;
        var cards = this.getCards();
        if (cards.length)
            id = cards[cards.length - 1] + 1;
        else
            id = 1;
        return id;
    },

    removeCard: function (id) {
        this._super('_removeCard', id);
    },

    getMinTrump: function () {
        return this._super('_getMinTrump');
    },

    getLastTakenCards: function () {
        return this.get('lastTakenCards');
    },

    renderLastTakenCardsIfVisible: function () {
        this._super('_renderLastTakenCardsIfVisible');
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