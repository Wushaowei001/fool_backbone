var Human = Player.extend({
    defaults: {
        _cards: [],
        tweens: [],
        can_step: false,
        cards_need_up: []
    },
    initialize: function (options) {
        for (var i in options) {
            this.set(i, options[i]);
        }
        this.on('destroy', function () {
            this.off();
            this.stopListening();
        });
        this.on('cards_added take_cards', function (without_animation, from_deck) {
            this.renderCards(without_animation, from_deck);
        }.bind(this));
        this.on('change', function (p) {
            console.log(p.changed);
        });
    },
    animate_cards: function () {
        this._super('animate_cards');
    },
    getCards: function () {
        return this._super('getCards');
    },
    getCardsCoords: function () {
        return this._super('_getCardsCoords');
    },
    getCountCards: function () {
        return this.getCards().length;
    },
    setCards: function (cards) {
        this._super('setCards', cards);
    },
    setCanStep: function (can) {
        App.set('can_step', can);
//        this.set('can_step', can);
        console.log('setCanStep: ' + can);
        if (can) {
            this.beforeMyStep();
        }
    },
    cardValuesEquals: function (id1, id2) {
        return +id1.slice(1) == +id2.slice(1);
    },
    canStep: function () {
        return App.get('can_step') && !App.get('spectate');
//        return this.get('can_step');
    },
    canStartStep: function (id) {
        if (!id)
            return false;
        if (!this._isMyCard(id))
            return false;
        var table = App.get('table');
        var opponent = App.get('opponent');
        var count_cards_on_table = table.getCountCards() + table.getCountCardsForThrow();
        if (table.human_attack) {
            if (count_cards_on_table == this.get('MAX_COUNT_CARDS'))
                return false;
            if (!App.get('game_with_comp') && opponent.getCountCards() == table.getCountCardsNotYetBeatenWithThrow())
                return false;

        }
        if (this.canThrowCard(id))
            return true;
        if (this.canTransferByCard(id))
            return true;
        var card_on_table = table.getCardForBeatID();
        var cards_on_table = table.getCards();

        var card_val = +id.slice(1);
        if (card_on_table) {
            return this.isCardCanCoverCardOnTable(id) && this.canStep();
        }
        else {
            if (cards_on_table) {
                for (var i in cards_on_table) {
                    if (+cards_on_table[i].slice(1) == card_val)
                        return this.canStep();
                }
                return false;
            }
        }
        return this.canStep();
    },
    canThrowCard: function (card) {
        if (App.get('game_with_comp'))
            return false;
        var table = App.get('table');
        if (table.human_attack) {
            var cards = table.getCards();
            for (var i in cards) {
                if (cards[i].slice(1) == card.slice(1))
                    return true;
            }
            return false;
        }
        return false;
    },
    canTransferByCard: function (id) {
        if (!App.isTransferable() || !this.canStep() || App.isFirstHand())
            return false;
        var table = App.get('table');
        var opponent = App.get('opponent');
        if (!table.possibleTransfer())
            return false;
        if (table.human_attack)
            return false;
        var allow_transfer = opponent.getCountCards() >= table.getCardsForBeat().length + 1;
        if (allow_transfer) {
            var cards_on_table = table.getCards();
            for (var i in cards_on_table) {
                if (this.cardValuesEquals(id, cards_on_table[i]))
                    return true;
            }
        }
        return false;
    },
    canTransfer: function () {
        if (App.isTransferable() && !App.isFirstHand()) {
            var table = App.get('table');
            var opponent = App.get('opponent');
            if (table.possibleTransfer()) {
                var allow_transfer = opponent.getCountCards() >= table.getCardsForBeat().length + 1;
                if (allow_transfer) {
                    var card_on_table = table.getCardForBeatID();
                    var cards_for_throw = table.getCardsForThrow();
                    var my_cards = this.getCards();
                    if (cards_for_throw)
                        my_cards = my_cards.concat(cards_for_throw);
                    for (var i in my_cards) {
                        if (this.cardValuesEquals(card_on_table, my_cards[i]))
                            return true;
                    }
                }
            }
        }
        return false;

    },
    unBindCardEvents: function (card) {
        if (card) {
            card.off(
                'mouseover dblclick dragstart mousedown mouseup dbltap touchstart touchend click'
            );
        }
    },
    unBindCards: function () {
        for (var i in this.getCards()) {
            var card = App.get('stage').findOne('#' + this.get('_cards')[i]);
            this.unBindCardEvents(card);
        }
    },
    beforeMyStep: function () {
        if (!App.get('view_only') && this.noCards()) {
            return;
        }
        var table = App.get('table');
        var game_with_comp = App.get('game_with_comp');
        var opponent = App.get('opponent');
        if (table.getCardForBeat() && !App.get('view_only') && !table.human_attack)
            App.trigger('can_take_cards');
        else {
            if (table.getCards() && !App.get('view_only'))
                App.trigger('can_put_to_pile');
        }
        if (table.getCards() && !App.get('view_only') && !App.get('without_animation')) {
            if (!table.getCardForBeat()) {
                if (!table.getCardsForThrow() && !this.getCardsForThrow() ||
                    opponent.getCountCards() <= 0 ||
                    (App.isFirstHand() && table.getCountCards() == Config.table.max_count_cards_in_first_hand)) {
                    this.setCanStep(false); // because user can step before add to pile
                    App.trigger('beaten');
                    App.safeTimeOutAction(800, function () {
                        table.addToPile();
                        App.safeTimeOutAction(1000, function () {
                            if (!game_with_comp) {
                                App.trigger('human:addToPile');
                            }
                            else {
                                game_with_comp.addCards(false, function () {
//                                App.trigger('update_deck_remain');
                                });
                                if (!App.get('view_only')) {

                                    App.safeTimeOutAction(800, function () {
                                        Util.sequentialActions.add(function () {
                                            opponent.step();
                                        }, 400);

                                    });
                                }
                            }
                        });
                    });
                    return;
                }
            }
            var can_transfer = false;
            var can_not_beat = false;
            if (App.isTransferable()) {
                can_transfer = this.canTransfer();
                var cards_for_beat = table.getCardsForBeat();
                var forbidden_ids = [];
                var id;
                for (var i in cards_for_beat) {
                    id = this.getMinCard(cards_for_beat[i], forbidden_ids);
                    if (id)
                        forbidden_ids.push(id);
                    else
                        can_not_beat = true;
                }
            }
            else {
                if (table.getCardForBeat() && !table.human_attack && !this.getMinCard(table.getCardForBeatID()))
                    can_not_beat = true;
            }
            if (can_not_beat && !can_transfer) {
                this.unBindCards();
                App.trigger('nothing_to_beat');
                if (!App.get('view_only'))
                    App.safeTimeOutAction(1000, function () {
                        App.humanTakeCards();
                    });
                return;
            }
        }
        if (game_with_comp && !App.get('without_update_history')) {
            game_with_comp.history.update_history();
            App.set('without_update_history', false);
        }
        this.bindCards();
    },
    bindCards: function () {
        this.unBindCards();
        for (var i in this.getCards()) {
            var id = this.get('_cards')[i];
            var card = App.get('stage').findOne('#' + id);
            this.bindCardEvents(card, id);
        }
    },
    bindCardsForThrow: function (cards, count) {
        for (var i in cards) {
            var id = cards[i];
            var card = App.get('stage').findOne('#' + id);
            this.bindCardForThrow.count = count; // мемоизация кол-ва карт для подкидывания
            this.bindCardForThrow(card, id, cards);
        }
    },
    temporaryUnbindCardEvents: function (time) {
        var timestamp = App.get('new_game_started');
        this.unBindCards();
        App.safeTimeOutAction(time, function () {
            this.bindCards();
        });
    },
    bindCardEvents: function (card, id) {
        var action_step = App.getProperty('step');

        card.on(action_step + ' dbltap', function () {
            if (!this.canStartStep(id))
                return false;
            var last_card = this.noCards();
            if (!App.get('game_with_comp')) {
                if (!this.canStep() && !App.get('spectate')) {
                    this.removeCard(id);
                    App.get('table').addCardForThrow(id);
                    return false;
                }
                App.trigger('human:step', {
                    card: id,
                    last_card: last_card
                });
            }
            else {
                if (this.canTransferByCard(id)) {
                    this.transferCard(id);
                    this.setCanStep(false);
                    return;
                }
                this.step(id);
            }
        }.bind(this));
    },
    bindCardForThrow: function (card, id, cards) {
        var action_step = App.getProperty('step');

        card.on(action_step + ' dbltap', function () {
            if (!this.canStartStep(id))
                return false;
            this.bindCardForThrow.count--;
            this.removeCard(id);
            App.get('table').addCardForThrow(id);
            var cards_for_throw = this._getCardsForThrow(cards);
            if (!cards_for_throw || !this.bindCardForThrow.count)
                App.endThrow();
        }.bind(this));
    },
    updateCardImages: function (onload) {
        App.updateCardImages(this.getCards(), onload);
    },
    turnCards: function (cards) {
        for (var i in cards) {
            var id = cards[i];
            App.addCardToLayer({
                id: id,
                x: 20,
                y: App.getDeckCoords().y
            });
        }
    },
    addCard: function (id) {
        if (!id)
            return false;
        var card = App.get('stage').findOne('#' + id);
//        if (up_new_cards) {
//            this.cards_need_up.push(id);
//        }

        if (!App.get('without_animation') && (!App.get('view_only'))) {
            setTimeout(function () {
                App.addCardSound();
            }, 300);
        }

        if (!App.get('view_only')) {
            this.bindCardEvents(card, id);
        }
    },
    addCards: function (new_cards, need_turn, callback) {
        var up_new_cards = this.getCards().length ? true : false;
        if (up_new_cards)
            this.set('cards_need_up', new_cards);
        this.setCards(this.getCards().concat(new_cards));
        if (need_turn) {
            this.turnCards(new_cards);
        }
        for (var i in new_cards) {
            this.addCard(new_cards[i]);
        }
        if (typeof callback == 'function')
            callback();
        this.trigger('cards_added');
    },
    noCards: function () {
        return !this.getCards().length && App.deckIsEmpty();
    },
    takeCardsFromTable: function (cards, callback) {
        if (App.get('game_with_comp')) {
            App.get('game_with_comp').history.disableMoves();
        }
        this.setCards(this.getCards().concat(cards));
        this.set('cards_need_up', cards);
        for (var i in cards) {
            this.addCard(cards[i]);
        }
        this.trigger('take_cards');
        if (typeof callback == 'function')
            callback();
    },
    transferCard: function (id) {
        this.removeCard(id);
        App.get('table').addTransferCard(id);
        if (App.get('game_with_comp')) {
            App.safeTimeOutAction(800, function () {
                App.get('opponent').step();
            });
        }
    },

    removeCard: function (id) {

        this._super('_removeCard', id);
        if (App.get('spectate'))
            return;
        var card = App.get('stage').findOne('#' + id);
        if (card)
            this.unBindCardEvents(card);
    },
    renderCards: function (without_animation, from_deck) {
        this._renderCards(false, without_animation, from_deck);
    },
    step: function (id) {
        var table = App.get('table');
        var game_with_comp = App.get('game_with_comp');
        if (game_with_comp) {
            game_with_comp.history.disableMoves();
        }

        this.removeCard(id);

        table.addCard(id, this.get('bottom_player'));
        if (App.get('spectate'))
            return;

        App.turnSound();

        if (App.isTransferable() && table.getCardForBeatID() && !table.human_attack) {
            this.setCanStep(true);
            return;
        }

        if (game_with_comp && !App.get('without_animation')) {
            App.safeTimeOutAction(800, function () {
                App.get('opponent').step();
            });
        }

        this.setCanStep(false);
    },
    getCardsForThrow: function (cards) {
        return this._super('_getCardsForThrow', cards);
    },
    isCardCanCoverCardOnTable: function (card) {
        var card_on_table = App.get('table').getCardForBeatID();
        if (!card_on_table)
            return false;
        if (card_on_table[0] == card[0]) {
            var card_val = +card.slice(1);
            var card_on_table_val = card_on_table.slice(1);

            if (card_val > card_on_table_val)
                return true;
        }
        else {
            if (card[0] == App.getTrump())
                return true;
        }
        return false;
    },
    isLastCard: function (id) {
        return this.getCards()[this.getCards().length - 1] == id;
    },
    getMinCard: function (card, forbidden_ids) {
        return this._super('_getMinCard', card, forbidden_ids);
    },
    getMinTrump: function () {
        return this._super('_getMinTrump');
    },
    needCards: function () {
        return this._super('_needCards');
    },
    getAllPossibleCardsForBeat: function () {
        return this._super('_getAllPossibleCardsForBeat');
    },
    getCardsEquals: function (id) {
        return this._super('_getCardsEquals', id);
    }
});