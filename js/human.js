Backbone.Model.prototype._super = function (funcName) {
    return this.constructor.__super__[funcName].apply(this, _.rest(arguments));
};

var Human = Player.extend({
    defaults: {
        _cards: ['human_cards'],
        tweens: [],
        can_step: false,
        cards_need_up: []
    },
    initialize: function (options) {
        for (var i in options) {
            this.defaults[i] = options[i];
        }
        this.on('human:cards_added human:take_cards', function (without_animation, from_deck) {
            this.renderCards(without_animation, from_deck);
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
        this.set('can_step', can);
        if (can)
            this.trigger('before_my_step');
//        App.myStepText();
        else
            this.trigger('before_opponent_step');
//        App.opponentStepText();
    },
    canStep: function () {
        return this.get('can_step');
    },
    canStartStep: function (id) {
        if (!id)
            return false;
        if (!this._isMyCard(id))
            return false;
        var count_cards_on_table = App.table.getCountCards() + App.table.getCountCardsForThrow();
        if (App.table.human_attack) {
            if (count_cards_on_table == App.human.MAX_COUNT_CARDS)
                return false;
            if (!App.game_with_comp && App.opponent.countCards() == App.table.getCountCardsNotYetBeatenWithThrow())
                return false;

        }
        if (this.canThrowCard(id))
            return true;
        var card_on_table = App.table.getCardForBeatID();
        var cards_on_table = App.table.getCards();

        var card_val = +id.slice(1);
        if (card_on_table) {
            return App.human.isCardCanCoverCardOnTable(id) && this.canStep();
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
        if (App.game_with_comp)
            return false;
        if (App.table.human_attack) {
            var cards = App.table.getCards();
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
            var card = App.stage.findOne('#' + this.get('_cards')[i]);
            this.unBindCardEvents(card);
        }
    },

    bindCards: function () {
        for (var i in this.getCards()) {
            var id = this.get('_cards')[i];
            var card = App.stage.findOne('#' + id);
            this.bindCardEvents(card, id);
        }
    },

    bindCardsForThrow: function (cards, count) {
        for (var i in cards) {
            var id = cards[i];
            var card = App.stage.findOne('#' + id);
            this.bindCardForThrow.count = count; // мемоизация кол-ва карт для подкидывания
            this.bindCardForThrow(card, id, cards);
        }
    },

    temporaryUnbindCardEvents: function (time) {
        var timestamp = App.new_game_started;
        this.unBindCards();
        setTimeout(function () {
            App.safeTimeOutAction(timestamp, function () {
                this.bindCards();
            });
        }, time);
    },

    bindCardEvents: function (card, id) {
        var settings = App.getSettings();

        var action_step = settings.step;

        card.on(action_step + ' dbltap', function () {
            if (!this.canStartStep(id))
                return false;
            this.step(id);
        }.bind(this));
    },
    bindCardForThrow: function (card, id, cards) {
        var settings = App.getSettings();

        var action_step = settings.step;

        card.on(action_step + ' dbltap', function () {
            if (!this.canStartStep(id))
                return false;
            this.bindCardForThrow.count--;
            this.removeCard(id);
            App.table.addCardForThrow(id);
            var cards_for_throw = this._getCardsForThrow(cards);
            if (!cards_for_throw || !this.bindCardForThrow.count)
                endThrow();
        });
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
        var card = App.stage.findOne('#' + id);
//        if (up_new_cards) {
//            this.cards_need_up.push(id);
//        }

        if (!App.without_animation && (!App.view_only)) {
            setTimeout(function () {
                App.addCardSound();
            }, 300);
        }

        if (!App.view_only) {
            this.bindCardEvents(card, id);
        }
    },
    noCards: function () {
        return !this.getCards().length && App.deckIsEmpty();
    },
    takeCardsFromTable: function (cards, callback) {
        if (App.game_with_comp) {
            App.game_with_comp.history.disableMoves();
        }
        this.setCards(this.getCards().concat(cards));
        this.set('cards_need_up', cards);
        for (var i in cards) {
            this.addCard(cards[i]);
        }
        this.trigger('human:take_cards');
        if (typeof callback == 'function')
            callback();
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
        this.trigger('human:cards_added');
    },
    removeCard: function (id) {

        this._super('_removeCard', id);
        var card = App.stage.findOne('#' + id);
        if (card)
            this.unBindCardEvents(card);
    },
    renderCards: function (without_animation, from_deck) {
        this._renderCards(false, without_animation, from_deck);
    },
    step: function (id) {
        var timestamp = App.new_game_started;

        if (App.game_with_comp) {
            App.game_with_comp.history.disableMoves();
        }

        this.removeCard(id);

        if (!this.canStep()) {
            App.table.addCardForThrow(id);
            return false;
        }
        else
            App.table.addCard(id, false);

        App.turnSound();


        if (App.game_with_comp && !App.without_animation) {
            setTimeout(
                function () {
                    App.safeTimeOutAction(timestamp, function () {
                        App.opponent.step();
                    });
                }, 800);
        }

        var last_card = App.human.noCards();
        if (!App.game_with_comp) {
            client.gameManager.sendTurn({card: id, last_card: last_card});
        }
        this.trigger('stepped', {last_card: last_card});
        this.setCanStep(false);
    },
    isHaveCardForPut: function (cards) {
        return this._getCardsForThrow(cards);
    },
    isCardCanCoverCardOnTable: function (card) {
        var card_on_table = App.table.getCardForBeatID();
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


//var Human = function () {
//    this._cards = [];
//    this.tweens = [];
//    this.can_step = false;
//    this.cards_need_up = [];
//    var that = this;
//
//    this.setCanStep = function (can) {
//        that.can_step = can;
//        if (can)
//            App.myStepText();
//        else
//            App.opponentStepText();
//    };
//
//    this.canStep = function () {
//        return that.can_step;
//    };
//
//    var canStartStep = function (id) {
//        if (!id)
//            return false;
//        if (!that._isMyCard(id))
//            return false;
//        var count_cards_on_table = App.table.getCountCards() + App.table.getCountCardsForThrow();
//        if (App.table.human_attack) {
//            if (count_cards_on_table == App.human.MAX_COUNT_CARDS)
//                return false;
//            if (!App.game_with_comp && App.opponent.countCards() == App.table.getCountCardsNotYetBeatenWithThrow())
//                return false;
//
//        }
//        if (canThrowCard(id))
//            return true;
//        var card_on_table = App.table.getCardForBeatID();
//        var cards_on_table = App.table.getCards();
//
//        var card_val = +id.slice(1);
//        if (card_on_table) {
//            return App.human.isCardCanCoverCardOnTable(id) && that.canStep();
//        }
//        else {
//            if (cards_on_table) {
//                for (var i in cards_on_table) {
//                    if (+cards_on_table[i].slice(1) == card_val)
//                        return that.canStep();
//                }
//                return false;
//            }
//        }
//        return that.canStep();
//    };
//
//    var canThrowCard = function (card) {
//        if (App.game_with_comp)
//            return false;
//        if (App.table.human_attack) {
//            var cards = App.table.getCards();
//            for (var i in cards) {
//                if (cards[i].slice(1) == card.slice(1))
//                    return true;
//            }
//            return false;
//        }
//        return false;
//    };
//
//    var unBindCardEvents = function (card) {
//        if (card) {
//            card.off(
//                'mouseover dblclick dragstart mousedown mouseup dbltap touchstart touchend click'
//            );
//        }
//    };
//
//    this.unBindCards = function () {
//        for (var i in that._cards) {
//            var card = App.stage.findOne('#' + that._cards[i]);
//            unBindCardEvents(card);
//        }
//    };
//
//    this.bindCards = function () {
//        for (var i in that._cards) {
//            var id = that._cards[i];
//            var card = App.stage.findOne('#' + id);
//            bindCardEvents(card, id);
//        }
//    };
//
//    this.bindCardsForThrow = function (cards, count) {
//        for (var i in cards) {
//            var id = cards[i];
//            var card = App.stage.findOne('#' + id);
//            bindCardForThrow.count = count; // мемоизация кол-ва карт для подкидывания
//            bindCardForThrow(card, id, cards);
//        }
//    };
//
//    this.temporaryUnbindCardEvents = function (time) {
//        var timestamp = App.new_game_started;
//        that.unBindCards();
//        setTimeout(function () {
//            App.safeTimeOutAction(timestamp, function () {
//                that.bindCards();
//            });
//        }, time);
//    };
//
//    var bindCardEvents = function (card, id) {
//        var settings = App.getSettings();
//
//        var action_step = settings.step;
//
//        card.on(action_step + ' dbltap', function () {
//            if (!canStartStep(id))
//                return false;
//            that.step(id);
//        });
//    };
//
//    var bindCardForThrow = function (card, id, cards) {
//        var settings = App.getSettings();
//
//        var action_step = settings.step;
//
//        card.on(action_step + ' dbltap', function () {
//            if (!canStartStep(id))
//                return false;
//            bindCardForThrow.count--;
//            removeCard(id);
//            App.table.addCardForThrow(id);
//            var cards_for_throw = that._getCardsForThrow(cards);
//            if (!cards_for_throw || !bindCardForThrow.count)
//                endThrow();
//        });
//    };
//
//    this.updateCardImages = function (onload) {
//        App.updateCardImages(that._cards, onload);
//    };
//
//    var turnCards = function (cards) {
//        for (var i in cards) {
//            var id = cards[i];
//            var card = App.addCardToLayer(id);
//            card.setX(20);
//            card.setY(App.getDeckCoords().y);
//        }
//    };
//
//    var addCard = function (id, up_new_cards) {
//        if (!id)
//            return false;
//        var card = App.stage.findOne('#' + id);
//        if (up_new_cards) {
//            that.cards_need_up.push(id);
//        }
//
//        if (!App.without_animation && (!App.view_only)) {
//            setTimeout(function () {
//                App.addCardSound();
//            }, 300);
//        }
//
//        if (!App.view_only) {
//            bindCardEvents(card, id);
//        }
//    };
//
//    this.noCards = function () {
//        return !that._cards.length && App.deckIsEmpty();
//    };
//
//    this.takeCardsFromTable = function (cards, callback) {
//        if (App.game_with_comp) {
//            App.game_with_comp.history.disableMoves();
//        }
//        for (var i in cards) {
//            that._cards.push(cards[i]);
//            addCard(cards[i], true);
//        }
//        that._renderCards(false, false, false);
//        if (typeof callback == 'function')
//            callback();
//    };
//
//    this.addCards = function (new_cards, need_turn, callback) {
//        var up_new_cards = that._cards.length ? true : false;
//        for (var i in new_cards) {
//            that._cards.push(new_cards[i]);
//        }
//        if (need_turn) {
//            turnCards(new_cards);
//        }
//        for (var i in new_cards) {
//            addCard(new_cards[i], up_new_cards);
//        }
//        if (typeof callback == 'function')
//            callback();
//        that._renderCards(false, false, false);
//    };
//
//    var removeCard = function (id) {
//
//        that._removeCard(id);
//        var card = App.stage.findOne('#' + id);
//        if (card)
//            unBindCardEvents(card);
//    };
//
//    this.renderCards = function (without_animation, from_deck) {
//        that._renderCards(false, without_animation, from_deck);
//    };
//
//    this.step = function (id) {
//        var timestamp = App.new_game_started;
//
//        if (App.game_with_comp) {
//            App.game_with_comp.history.disableMoves();
//        }
//
//        removeCard(id);
//
//        if (!that.canStep()) {
//            App.table.addCardForThrow(id);
//            return false;
//        }
//        else
//            App.table.addCard(id, false);
//
//        App.turnSound();
//
//        that.setCanStep(false);
//        if (App.game_with_comp && !App.without_animation) {
//            setTimeout(
//                function () {
//                    App.safeTimeOutAction(timestamp, function () {
//                        App.opponent.step();
//                    });
//                }, 800);
//        }
//
//        var last_card = App.human.noCards();
//        if (!App.game_with_comp) {
//            client.gameManager.sendTurn({card: id, last_card: last_card});
//        }
//    };
//
//    this.isHaveCardForPut = function (cards) {
//        return that._getCardsForThrow(cards);
//    };
//
//    this.isCardCanCoverCardOnTable = function (card) {
//        var card_on_table = App.table.getCardForBeatID();
//        if (!card_on_table)
//            return false;
//        if (card_on_table[0] == card[0]) {
//            var card_val = +card.slice(1);
//            var card_on_table_val = card_on_table.slice(1);
//
//            if (card_val > card_on_table_val)
//                return true;
//        }
//        else {
//            if (card[0] == App.getTrump())
//                return true;
//        }
//        return false;
//    };
//
//    this.getMinCard = function (card) {
//        return that._getMinCard(card);
//    };
//
//    this.getMinTrump = function () {
//        return that._getMinTrump();
//    };
//
//    this.needCards = function () {
//        return that._needCards();
//    };
//
//    this.getAllPossibleCardsForBeat = function () {
//        return that._getAllPossibleCardsForBeat();
//    };
//};
//
//Human.prototype = new Player();