var GameWithComputer = function () {
    var mode = App.get('mode_cards_count');
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
        },
        disablePrev: function () {
        },
        enableNext: function () {
        },
        enablePrev: function () {
        }
    };

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
                App.get('Deck').destroy();
                App.get('Trump').destroy();
//                App.showTrumpValueOnDeck();
            }
        }
        if (typeof callback === 'function')
            callback(cards, true);
        return cards;
    };

    this.addCards = function (computer_first, callback) {
        var h_need_cards = App.get('human').needCards();
        var c_need_cards = App.get('opponent').needCards();
        var cards = [];
        if (computer_first) {
            if (c_need_cards > 0) {
                cards = self.getCards(c_need_cards);
                if (cards)
                    App.get('opponent').addCards(cards);
            }
            if (h_need_cards > 0) {
                cards = self.getCards(h_need_cards);
                if (cards)
                    App.get('human').addCards(cards, true);
            }
        }
        else {
            if (h_need_cards > 0) {
                cards = self.getCards(h_need_cards);
                if (cards)
                    App.get('human').addCards(cards, true);
            }
            if (c_need_cards > 0) {
                cards = self.getCards(c_need_cards);
                if (cards)
                    App.get('opponent').addCards(cards)
            }
        }
        if (!App.get('without_animation') && h_need_cards <= 0) {
            App.get('human').renderCards();
            App.get('opponent').renderCards();
        }
        App.set('deck_remain', this.remainsInDeck());
        //TODO: trigger
        if (typeof callback == 'function') {
            callback();
        }
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
};