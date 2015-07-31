var Computer = Player.extend({
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
        this.on('cards_added take_cards', function (from_deck) {
            this.renderCards(from_deck);
        }.bind(this));
        this.on('change:_cards', function () {
            console.log(this.get('_cards'));
        }.bind(this));
    },
    addCards: function (cards) {

        this.setCards(this.getCards().concat(cards));

        this._super('_addCards', cards);

        this.trigger('cards_added', true);
    },
    bindCard: function (card) {
        card.on('click tap', function () {
            this._activateLastTakenCards();
        }.bind(this));
    },
    getCards: function () {
        return this.get('_cards');
    },
    getCardsCoords: function () {
        return this._super('_getCardsCoords');
    },
    setCards: function (cards) {
        this.set('_cards', cards);
    },

    takeCardsFromTable: function (cards) {
        this._super('_destroyLastTakenCards');
        this.set('lastTakenCards', App.get('table').getLastState());
        this.setCards(this.getCards().concat(cards));
//        for (var i in cards) {
//            this._cards.push(cards[i]);
//        }
        this._super('_takeCardsFromTable', cards);
        this.trigger('take_cards');
    },

    getLastTakenCards: function () {
        return this.get('lastTakenCards');
    },

    renderLastTakenCardsIfVisible: function () {
        this._super('_renderLastTakenCardsIfVisible');
    },

    removeCard: function (id) {
        this._super('_removeCard', id);
    },
    getMinTrump: function () {
        return this._super('_getMinTrump');
    },

    getMinCard: function (card) {
        return this._super('_getMinCard', card);
    },

    needCards: function () {
        return this._super('_needCards');
    },

    renderCards: function (from_deck) {
        this._super('_renderCards', true, false, from_deck);
    },

    noCards: function () {
        return !this.getCards().length && App.get('game_with_comp').deckIsEmpty();
    },

    step: function (id) {
//        var timestamp = App.get('new_game_started');
        if (!App.get('human').noCards() && this.noCards()) {
            // computer win
            this.trigger('win');
            return false;
        }
        if (App.get('human').noCards() && this.noCards()) {
            this.trigger('draw');
            return false;
        }
        if (App.get('human').noCards() && !this.noCards()) {
            // human win
            App.get('human').trigger('win');
            return false;
        }
        if (!id) {
            var card_on_table = App.get('table').getCardForBeatID();
            var id = '';
            if (card_on_table) {
                id = this.getMinCard(card_on_table);
                if (!id) {
                    this.trigger('take_cards');
                    var cards = App.get('table').getCards(true);
                    this.takeCardsFromTable(cards);
                    if (App.get('human').noCards()) {
                        // human wins
                        App.get('human').trigger('win');
                        return false;
                    }
                    App.safeTimeOutAction(1000, function () {
                        App.get('game_with_comp').addCards(false, function () {
//                            App.trigger('update_deck_remain');
                            App.get('human').setCanStep(true);
                        });
                    });
                }
            }
            else {
                if (App.get('table').getCards()) {
                    var count_cards_on_table = App.get('table').getCountCards();
                    if (count_cards_on_table < 6) {
                        id = this._super('_getCardForThrow');
                    }
                    if (!id) {
                        App.get('table').addToPile();
                        App.get('game_with_comp').addCards(true, function () {
                            App.trigger('update_deck_remain');
                            App.get('human').setCanStep(true);
                        });
                    }
                }
                else {
                    id = this.getMinCard();
                }
            }
            if (id) {
                App.safeTimeOutAction(800, function () {
                    this.removeCard(id);
                    App.turnSound();
                    App.get('table').addCard(id, this.get('bottom_player'));
                    if (App.get('human').noCards() && this.noCards()) {
                        this.trigger('draw');
                        return false;
                    }
                    if (App.get('human').noCards() && !this.noCards()) {
                        // human win
                        App.get('human').trigger('win');
                        return false;
                    }
                    App.get('human').setCanStep(true);
                }.bind(this));
            }
        }
        else {
            App.turnSound();
            this.removeCard(id);
            App.get('table').addCard(id, this.get('bottom_player'));
        }

    }
});