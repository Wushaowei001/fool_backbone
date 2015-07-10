var Computer = Player.extend({
    defaults: {
        _cards: [],
        tweens: [],
        lastTakedcards: []
    },
    initialize: function (options) {
        for (var i in options) {
            this.defaults[i] = options[i];
        }
        this.on('opponent:cards_added opponent:take_cards', function (without_animation, from_deck) {
            this.renderCards(without_animation, from_deck);
        }.bind(this));
    },
    addCards: function (cards) {

        this.setCards(this.getCards().concat(cards));

        this._super('_addCards', cards);

        this.trigger('opponent:cards_added', true, App.without_animation, false);
    },
    getCards: function () {
        return this.get('_cards');
    },
    setCards: function (cards) {
        this.set('_cards', cards);
    },

    takeCardsFromTable: function (cards) {
        this._super('_destroyLastTakedCards');
        this.set('lastTakedcards', App.table.getLastState());
        this.setCards(this.getCards().concat(cards));
//        for (var i in cards) {
//            this._cards.push(cards[i]);
//        }
        this._super('_takeCardsFromTable', cards);
        this.trigger('opponent:take_cards');
    },

    getLastTakedCards: function () {
        return this.get('lastTakedcards');
    },

    renderLastTakedCardsIfVisible: function () {
        this._super('_renderLastTakedCardsIfVisible');
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

    renderCards: function (without_animation, from_deck) {
        this._super('_renderCards', true, without_animation, from_deck);
    },

    noCards: function () {
        return !this.getCards().length && App.game_with_comp.deckIsEmpty();
    },

    step: function (id) {
        var timestamp = App.new_game_started;
        if (!App.human.noCards() && this.noCards()) {
            // computer win
            this.trigger('win');
            return false;
        }
        if (App.human.noCards() && this.noCards()) {
            this.trigger('draw');
            return false;
        }
        if (App.human.noCards() && !this.noCards()) {
            // human win
            App.get('human').trigger('win');
            return false;
        }
        if (!id) {
            var card_on_table = App.table.getCardForBeatID();
            var id = '';
            if (card_on_table) {
                id = this.getMinCard(card_on_table);
                if (!id) {
                    var cards = App.table.getCards(true);
                    this.takeCardsFromTable(cards);
                    App.onTakeCards();
                    if (App.human.noCards()) {
                        // human wins
                        App.get('human').trigger('win');
                        return false;
                    }
                    setTimeout(function () {
                        App.safeTimeOutAction(timestamp, function () {
                            App.game_with_comp.addCards(false, function () {
                                App.trigger('update_deck_remain');
                            });
                            App.human.setCanStep(true);
                        });
                    }, 1000);
                }
            }
            else {
                if (App.table.getCards()) {
                    var count_cards_on_table = App.table.getCountCards();
                    if (count_cards_on_table < 6) {
                        id = this._super('_getCardForThrow');
                    }
                    if (!id) {
                        App.table.addToPile();
                        App.game_with_comp.addCards(true, function () {
                            App.trigger('update_deck_remain');
                        });
                        App.human.setCanStep(true);
                    }
                }
                else {
                    id = this.getMinCard();
                }
            }
            if (id) {
                setTimeout(function () {
                    App.safeTimeOutAction(timestamp, function () {
                        this.removeCard(id);
                        App.turnSound();
                        App.table.addCard(id, true);
                        if (App.human.noCards() && this.noCards()) {
                            this.trigger('draw');
                            return false;
                        }
                        if (App.human.noCards() && !this.noCards()) {
                            // human win
                            App.get('human').trigger('win');
                            return false;
                        }
                        App.human.setCanStep(true);
                    }.bind(this));
                }.bind(this), 800);
            }
        }
        else {
            App.turnSound();
            this.removeCard(id);
            App.table.addCard(id, true);
        }

    }
});
//var Computer = function () {
//    this._cards = [];
//    this.tweens = [];
//    this.lastTakedcards = [];
//
//    var that = this;
//
//    this.addCards = function (cards) {
//        for (var i in cards) {
//            that._cards.push(cards[i]);
//        }
//
//        that._addCards(cards);
//
//        that._renderCards(true, App.without_animation, true);
//    };
//
//    this.takeCardsFromTable = function (cards) {
//        that._destroyLastTakedCards();
//        that.lastTakedcards = App.table.getLastState();
//        for (var i in cards) {
//            that._cards.push(cards[i]);
//        }
//        that._takeCardsFromTable(cards);
//    };
//
//    this.getLastTakedCards = function () {
//        return that.lastTakedcards;
//    };
//
//    this.renderLastTakedCardsIfVisible = function () {
//        that._renderLastTakedCardsIfVisible();
//    };
//
//    var removeCard = function (id) {
//        that._removeCard(id);
//    };
//
//    this.getMinTrump = function () {
//        return that._getMinTrump();
//    };
//
//    var getMinCard = function (card) {
//        return that._getMinCard(card);
//    };
//
//    this.needCards = function () {
//        return that._needCards();
//    };
//
//    this.renderCards = function (without_animation, from_deck) {
//        that._renderCards(true, without_animation, from_deck);
//    };
//
//    var noCards = function () {
//        return !that._cards.length && App.game_with_comp.deckIsEmpty();
//    };
//
//    this.step = function (id) {
//        var timestamp = App.new_game_started;
//        if (!App.human.noCards() && noCards()) {
//            // computer win
//            App.win(true);
//            return false;
//        }
//        if (App.human.noCards() && noCards()) {
//            App.draw();
//            return false;
//        }
//        if (App.human.noCards() && !noCards()) {
//            // human win
//            App.win();
//            return false;
//        }
//        if (!id) {
//            var card_on_table = App.table.getCardForBeatID();
//            var id = '';
//            if (card_on_table) {
//                id = getMinCard(card_on_table);
//                if (!id) {
//                    var cards = App.table.getCards(true);
//                    that.takeCardsFromTable(cards);
//                    App.onTakeCards();
//                    if (App.human.noCards()) {
//                        // human wins
//                        App.win();
//                        return false;
//                    }
//                    setTimeout(function () {
//                        App.safeTimeOutAction(timestamp, function () {
//                            App.game_with_comp.addCards(false, App.updateDeckRemains);
//                            App.human.setCanStep(true);
//                        });
//                    }, 1000);
//                }
//            }
//            else {
//                if (App.table.getCards()) {
//                    var count_cards_on_table = App.table.getCountCards();
//                    if (count_cards_on_table < 6) {
//                        id = that._getCardForThrow();
//                    }
//                    if (!id) {
//                        App.table.addToPile();
//                        App.game_with_comp.addCards(true, App.updateDeckRemains);
//                        App.human.setCanStep(true);
//                    }
//                }
//                else {
//                    id = getMinCard();
//                }
//            }
//            if (id) {
//                setTimeout(function () {
//                    App.safeTimeOutAction(timestamp, function () {
//                        removeCard(id);
//                        App.turnSound();
//                        App.table.addCard(id, true);
//                        if (App.human.noCards() && noCards()) {
//                            App.draw();
//                            return false;
//                        }
//                        if (App.human.noCards() && !noCards()) {
//                            // human win
//                            App.win();
//                            return false;
//                        }
//                        App.human.setCanStep(true);
//                    });
//                }, 800);
//            }
//        }
//        else {
//            App.turnSound();
//            removeCard(id);
//            App.table.addCard(id, true);
//        }
//
//    };
//};
//
//Computer.prototype = new Player();