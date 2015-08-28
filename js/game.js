var GameWithComputer = function () {
    var mode = App.get('mode');
    var count = Config.decks[mode].count;

    var deck = new Deck(count);

    var saved_deck = deck.slice();

    this.resetDeck = function () {
        deck = saved_deck.slice();
    };

    this.remainsInDeck = function () {
        return deck.length;
    };

    this.onlyTrumpRemain = function () {
        return this.remainsInDeck() == 1;
    };

    this.getDeck = function () {
        return deck;
    };

    this.setDeck = function (new_deck) {
        deck = Util.cloner.clone(new_deck);
    };

    this.removeCardsFromBegin = function (cards) {
        var count;
        if (Array.isArray(cards)) {
            count = cards.length;
        }
        else
            count = cards;
        if (count > 0)
            deck = deck.slice(count);
    };

    var self = this;

    this.getCards = function (count, callback) {
        if (!deck.length)
            return false;
        var cards = [];
        for (var i = 0; i < count; i++) {
            var card = deck.shift();
            if (card) {
                cards.push(card);
            }
            if (!deck.length) {
                App.set('deck_is_empty', true);
                App.renderDeck();
                App.get('Trump').destroy();
            }
        }
        if (typeof callback === 'function')
            callback(cards, true);
        return cards;
    };

    this.addCards = function (computer_first, callback) {
        var human = App.get('human');
        var opponent = App.get('opponent');
        var h_need_cards = human.needCards();
        var c_need_cards = opponent.needCards();
        var cards = [];
        // при первой раздаче раздаем карты по одной
        if (this.remainsInDeck() == Config.decks[App.get('mode')].count) {
            cards = this.getCards(h_need_cards + c_need_cards);
            var add_cards = function () {
                var card;
                if (cards.length) {
                    card = cards.pop();
                    (function (card) {
                        Util.sequentialActions.add(function () {
                            human.addCards([card], true);
                        }, 100);
                    })(card);
                }
                if (cards.length) {
                    card = cards.pop();
                    (function (card) {
                        Util.sequentialActions.add(function () {
                            opponent.addCards([card]);
                        }, 100);
                    })(card);
                }
                if (cards.length) {
                    add_cards();
                }
            };
            add_cards();
        }
        else {
            if (computer_first) {

                if (c_need_cards > 0) {

                    Util.sequentialActions.add(function () {
                        cards = self.getCards(c_need_cards);
                        if (cards)
                            opponent.addCards(cards);
                    }, 500);
                }
                if (h_need_cards > 0) {
                    Util.sequentialActions.add(function () {
                        cards = self.getCards(h_need_cards);
                        if (cards)
                            human.addCards(cards, true);
                    }, 500);
                }
            }
            else {
                if (h_need_cards > 0) {
                    Util.sequentialActions.add(function () {
                        cards = self.getCards(h_need_cards);
                        if (cards)
                            human.addCards(cards, true);
                    }, 500);
                }
                if (c_need_cards > 0) {
                    Util.sequentialActions.add(function () {
                        cards = self.getCards(c_need_cards);
                        if (cards)
                            opponent.addCards(cards)
                    }, 500);
                }
            }
            if (!App.get('without_animation') && h_need_cards <= 0) {
                human.renderCards();
                opponent.renderCards(false);
            }
        }
        Util.sequentialActions.add(function () {
            App.set('deck_remain', this.remainsInDeck());
            //TODO: trigger
            if (typeof callback == 'function') {
                callback();
            }
        }.bind(this), 500);
    };

    this.getLastCard = function () {
        return deck[deck.length - 1];
    };

    this.deckIsEmpty = function () {
        return !deck.length;
    };

    this.ifComputerStepFirst = function () {
        var h_min_trump = App.get('human').getMinTrump();
        var c_min_trump = App.get('opponent').getMinTrump();

        return c_min_trump > h_min_trump;
    };

    this.history = {
        list: [],
        index: null,
        getHistoryIndex: function () {
            return this.index;
        },
        getCurrentHistory: function () {
            return this.list[this.index];
        },
        update_history: function () {
            if (this.index != this.list.length - 1) {
                this.slice_history();
                this.disableNext();
            }
            this.list.push({
                human_cards: Util.cloner.clone(App.get('human').getCards()),
                opponent_cards: Util.cloner.clone(App.get('opponent').getCards()),
                table_state: Util.cloner.clone(App.get('table').getState()),
                trump_value: App.getTrumpValue(),
                deck: Util.cloner.clone(self.getDeck())
            });
            if (this.index == null)
                this.index = 0;
            else {
                this.index++;
                this.enablePrev();
            }
        },
        slice_history: function () {
            this.list = this.list.slice(0, this.index + 1);
        },
        moveBack: function () {
            App.trigger('internal_history:moveBack');
            if (this.index > 0) {
                App.renderFromInternalHistory(Util.cloner.clone(this.list[--this.index]));
                this.enableNext();
            }
            if (this.index == 0)
                this.disablePrev();
        },
        moveForward: function () {
            App.trigger('internal_history:moveForward');
            if (this.index + 1 < this.list.length) {
                App.renderFromInternalHistory(Util.cloner.clone(this.list[++this.index]));
                this.enablePrev();
                if (this.index == this.list.length - 1)
                    this.disableNext();
            }
            else {
                this.disableNext();
            }
        },
        temporaryDisableMoves: function (time) {
            if (!time)
                time = 1000;
            this.disableMoves();
            App.safeTimeOutAction(time, function () {
                self.history.enableMoves();
            });
        },
        disableMoves: function () {
            this.disableNext();
            this.disablePrev();
        },
        enableMoves: function () {
            if (this.index != 0) {
                this.enablePrev();
            }
            if (this.index == this.list.length - 1)
                return;
            this.enableNext();

        },
        disableNext: function () {
            App.trigger('local_history_disableNext');
        },
        disablePrev: function () {
            App.trigger('local_history_disablePrev');
        },
        enableNext: function () {
            App.trigger('local_history_enableNext');
        },
        enablePrev: function () {
            App.trigger('local_history_enablePrev');
        }
    };
};