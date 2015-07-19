Backbone.Model.prototype._super = function (funcName) {
    return this.constructor.__super__[funcName].apply(this, _.rest(arguments));
};

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
        this.on('change:_cards', function () {
        }.bind(this));
    },
    animate_cards: function () {
        this._super('animate_cards');
    },
    getCards: function () {
        return this._super('getCards');
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
    canStep: function () {
        return App.get('can_step');
//        return this.get('can_step');
    },
    canStartStep: function (id) {
        if (!id)
            return false;
        if (!this._isMyCard(id))
            return false;
        var count_cards_on_table = App.get('table').getCountCards() + App.get('table').getCountCardsForThrow();
        if (App.get('table').human_attack) {
            if (count_cards_on_table == App.get('human').get('MAX_COUNT_CARDS'))
                return false;
            if (!App.get('game_with_comp') && App.get('opponent').countCards() == App.get('table').getCountCardsNotYetBeatenWithThrow())
                return false;

        }
        if (this.canThrowCard(id))
            return true;
        var card_on_table = App.get('table').getCardForBeatID();
        var cards_on_table = App.get('table').getCards();

        var card_val = +id.slice(1);
        if (card_on_table) {
            return App.get('human').isCardCanCoverCardOnTable(id) && this.canStep();
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
        if (App.get('table').human_attack) {
            var cards = App.get('table').getCards();
            for (var i in cards) {
                if (cards[i].slice(1) == card.slice(1))
                    return true;
            }
            return false;
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
        if (App.get('table').getCardForBeat() && !App.get('view_only') && !App.get('table').human_attack)
            App.trigger('can_take_cards');
        else {
            if (App.get('table').getCards() && !App.get('view_only'))
                App.trigger('can_put_to_pile');
        }
        if (App.get('table').getCards() && !App.get('view_only') && !App.get('without_animation')) {
            if (!App.get('table').getCardForBeat() && !App.get('table').getCardsForThrow() && !this.getCardsForThrow()) {
                App.get('human').setCanStep(false);
                App.trigger('beaten');
                App.safeTimeOutAction(800, function () {
                    App.get('table').addToPile();
                    App.safeTimeOutAction(1000, function () {
                        if (!App.get('game_with_comp')) {
                            App.trigger('human:addToPile');
                        }
                        else {
                            App.get('game_with_comp').addCards(true, function () {
//                                App.trigger('update_deck_remain');
                            });
                            if (!App.get('view_only')) {
                                App.safeTimeOutAction(800, function () {
                                    App.get('opponent').step();
                                });
                            }
                        }
                    });
                });
                return;
            }
            else {
                if (App.get('table').getCardForBeat() && !App.get('table').human_attack && !this.getMinCard(App.get('table').getCardForBeatID())) {
                    this.unBindCards();
                    App.trigger('nothing_to_beat');
//                App.temporaryBlockUI(1000);
//                    $('#take_cards').hide();
//                    $('#my_step_text').hide();
//                    $('#nothing_to_beat').fadeIn(300);
//                    $('#nothing_to_beat').fadeOut(4000);
                    if (!App.get('view_only'))
                        App.safeTimeOutAction(1000, function () {
                            App.humanTakeCards();
                        });
                    return;
                }
            }
        }
        if (App.get('game_with_comp') && !App.get('without_update_history')) {
            console.log('UPDATE HISTORY!!!');
            App.get('game_with_comp').history.update_history();
            App.set('without_update_history', false);
        }
        this.bindCards();
    },
    bindCards: function () {
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
            this.step(id);
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
            var card = App.addCardToLayer(id);
            card.setX(20);
            card.setY(App.getDeckCoords().y);
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
        if (App.get('game_with_comp')) {
            App.get('game_with_comp').history.disableMoves();
        }

        this.removeCard(id);

        if (!this.canStep()) {
            App.get('table').addCardForThrow(id);
            return false;
        }
        else
            App.get('table').addCard(id, false);

        App.turnSound();


        if (App.get('game_with_comp') && !App.get('without_animation')) {
            App.safeTimeOutAction(800, function () {
                App.get('opponent').step();
            });
        }

        var last_card = App.get('human').noCards();
        if (!App.get('game_with_comp')) {
            App.trigger('human:step', {
                card: id,
                last_card: last_card
            });
        }
        this.trigger('stepped', {last_card: last_card});
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
    getMinCard: function (card) {
        return this._super('_getMinCard', card);
    },
    getMinTrump: function () {
        return this._super('_getMinTrump');
    },
    needCards: function () {
        return this._super('_needCards');
    },
    getAllPossibleCardsForBeat: function () {
        return this._super('_getAllPossibleCardsForBeat');
    }
});