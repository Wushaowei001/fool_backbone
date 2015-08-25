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
        this.on('cards_added take_cards', function (without_animation) {
            this.renderCards(without_animation);
        }.bind(this));
        this.on('change:_cards', function () {
            console.log(this.get('_cards'));
        }.bind(this));
    },
    addCards: function (cards) {

        this.setCards(this.getCards().concat(cards));

        this._super('_addCards', cards);

        this.trigger('cards_added', false);
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
    getCountCards: function () {
        return this.getCards().length;
    },
    getCardsEquals: function (id) {
        return this._super('_getCardsEquals', id);
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

    getMinCard: function (card, forbidden_ids) {
        return this._super('_getMinCard', card, forbidden_ids);
    },

    needCards: function () {
        return this._super('_needCards');
    },

    renderCards: function (without_animation) {
        this._super('_renderCards', true, without_animation);
    },

    noCards: function () {
        return !this.getCards().length && App.get('game_with_comp').deckIsEmpty();
    },

    step: function (id) {
        var table = App.get('table');
        var human = App.get('human');
        var game_with_comp = App.get('game_with_comp');
        if (!human.noCards() && this.noCards()) {
            // computer win
            this.trigger('win');
            return false;
        }
        if (human.noCards() && this.noCards()) {
            this.trigger('draw');
            return false;
        }
        if (human.noCards() && !this.noCards()) {
            // human win
            human.trigger('win');
            return false;
        }
        if (!id) {

            var card_on_table = table.getCardForBeatID();
            var id = '';
            var can_not_beat = false;
            if (card_on_table) {
                if (App.isTransfarable() && !App.isFirstHand()) {
                    // attempt to transfer
                    var cards_for_transfer = this.getCardsEquals(card_on_table);
                    if (table.possibleTransfer() && cards_for_transfer) {
                        var allow_transfer = human.getCountCards() >= table.getCardsForBeat().length + 1;
                        if (allow_transfer) {
                            id = cards_for_transfer[0];
                            this.removeCard(id);
                            table.addTransferCard(id);
                            human.setCanStep(true);
                            return;
                        }
                    }
                    // attempt to beat
                    var cards_for_beat_on_table = table.getCardsForBeat();
                    var attacking_cards = [];
                    for (var i in cards_for_beat_on_table) {
                        id = this.getMinCard(cards_for_beat_on_table[i], attacking_cards);
                        if (id)
                            attacking_cards.push(id);
                        else
                            can_not_beat = true;
                    }
                    id = attacking_cards[0];
                }
                else
                    id = this.getMinCard(card_on_table);
                if (!id || can_not_beat) {
                    this.trigger('take_cards');
                    var cards = table.getCards(true);
                    this.takeCardsFromTable(cards);
                    if (human.noCards()) {
                        // human wins
                        human.trigger('win');
                        return false;
                    }
                    App.safeTimeOutAction(1000, function () {
                        game_with_comp.addCards(false, function () {
//                            App.trigger('update_deck_remain');
                            human.setCanStep(true);
                        });
                    });
                    return false;
                }
            }
            else {
                if (table.getCards()) {
                    var count_cards_on_table = table.getCountCards();
                    var count_human_cards = human.getCountCards();
                    if (!(App.isFirstHand() && table.getCountCards() == Config.table.max_count_cards_in_first_hand) &&
                        count_cards_on_table < Config.table.max_count_cards && count_human_cards > 0)
                        id = this._super('_getCardForThrow');
                    if (!id) {
                        table.addToPile();
                        game_with_comp.addCards(true, function () {
                            App.trigger('update_deck_remain');
                            human.setCanStep(true);
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
                    table.addCard(id, this.get('bottom_player'));
                    if (human.noCards() && this.noCards()) {
                        this.trigger('draw');
                        return false;
                    }
                    if (human.noCards() && !this.noCards()) {
                        // human win
                        human.trigger('win');
                        return false;
                    }
                    if (this.noCards() && human.getCountCards() > 1) {
                        // computer win
                        this.trigger('win');
                        return false;
                    }
                    if (App.isTransfarable() && table.getCardForBeatID() && table.human_attack) {
                        // beat next card
                        this.step();
                    }
                    else
                        human.setCanStep(true);
                }.bind(this));
            }
        }
        else {
            App.turnSound();
            this.removeCard(id);
            table.addCard(id, this.get('bottom_player'));
        }

    }
});