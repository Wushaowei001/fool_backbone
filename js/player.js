var Player = Backbone.Model.extend({
    defaults: {
    },

    getCards: function () {
        return this.get('_cards');
    },
    setCards: function (cards) {
        this.set('_cards', cards);
    },
    animate_cards: function (callback) {
        if (!this.tweens || !this.tweens.length) {
            if (callback && typeof callback === 'function')
                callback();
            return false;
        }

        var tween = this.tweens.shift();
        tween.play();
    },
    _removeCard: function (id) {
        for (var i in this.getCards()) {
            if (this.getCards()[i] == id) {
                this.getCards().splice(i, 1);
//                var card = App.get('stage').findOne('#' + id);
//                card.off('click');
            }
        }
        this._destroyLastTakenCards();
    },
    _sortBySuit: function (cards) {
        var result = [];
        var temp = [];
        var trumps = [];
        for (var index in App.get('sequence')) {
            temp = [];
            var suit = App.get('sequence')[index];
            for (var card in cards) {
                if (suit === cards[card][0]) {
                    if (suit == App.getTrump())
                        trumps.push(cards[card]);
                    else
                        temp.push(cards[card]);
                }
            }
            if (temp.length) {
                temp = temp.sort(function (a, b) {
                    return a.slice(1) - b.slice(1);
                });
                result = result.concat(temp);
            }
            if (trumps.length) {
                trumps = trumps.sort(function (a, b) {
                    return a.slice(1) - b.slice(1);
                });
            }
        }
        return result.concat(trumps);
    },
    _sortByValue_TrumpAfterValue: function (cards) {
        var result = [];
        var trumps = [];
        var min_value = App.getMinCardValue();

        for (var i = min_value; i < 15; i++) {
            for (var index in App.get('sequence')) {
                var suit = App.get('sequence')[index];
                if (cards.indexOf(suit + i) !== -1) {
                    if (suit === App.getTrump()) {
                        trumps.push(suit + i);
                    }
                    else
                        result.push(suit + i);
                }
            }
            if (trumps.length) {
                result.push(trumps.pop());
            }
        }
        return result;
    },

    _sortByValue_TrumpToRight: function (cards) {
        var result = [];
        var trumps = [];
        var min_value = App.getMinCardValue();

        for (var i = min_value; i < 15; i++) {
            for (var index in App.get('sequence')) {
                var suit = App.get('sequence')[index];
                if (cards.indexOf(suit + i) !== -1) {
                    if (suit === App.getTrump()) {
                        trumps.push(suit + i);
                    }
                    else
                        result.push(suit + i);
                }
            }
        }
        return result.concat(trumps);
    },
    _renderCards: function (opponent, without_animation, from_deck) {
        var default_y = App.getMyCardsCoords().y;
        if (opponent)
            default_y = App.getOpponentCoords().y;
        else {
            var sort = App.getProperty('sort');
            switch (sort) {
                case 'without':
                    break;
                case 'by_suit':
                    this.setCards(this._sortBySuit(this.getCards()));
                    break;
                case 'by_value':
                    this.setCards(this._sortByValue_TrumpAfterValue(this.getCards()));
                    break;
                case 'by_value_trump_to_right':
                    this.setCards(this._sortByValue_TrumpToRight(this.getCards()));
                    break;
            }
        }
        var interval = 30;
        var x = App.get('game_area').width / 2 - (interval * (this.getCards().length + 1)) / 2;

        var zIndex = 1;

        var that = this;

        for (var i in this.getCards()) {
            var id = this.getCards()[i];
            var y = default_y;

//            var up_new_card = false;
            if (this.get('cards_need_up') && this.get('cards_need_up').length) {
                var index_card_need_up = this.get('cards_need_up').indexOf(id);
                if (!opponent && this.get('cards_need_up') && index_card_need_up !== -1) {
//                    up_new_card = true;
                    y = App.getMyCardsCoords().y - 15;
                    App.safeTimeOutAction(1000, function () {
                        that._renderCards();
                    });
                }
            }
            var card = App.get('stage').findOne('#' + id);
            if (!card) {
                card = App.addCardToLayer(id, opponent);
            }
            else {
                if (opponent) {
                    card.setImage(App.get('backImage'));
                    card.name('inverted');
                }
            }
            card.setZIndex(zIndex);
            if (without_animation) {
                card.setX(x);
                card.setY(y);
                card.setRotation(0);
                App.get('MyCards').draw();
            }
            else {
                var tween = new Konva.Tween({
                    node: card,
                    duration: 0.2,
                    rotation: 0,
                    x: x,
                    y: y,
                    onFinish: function () {
                        if (from_deck)
                            that.animate_cards();
                    }
                });
                tween.play();
            }
            if (this.getCards()[+i + 1] && !opponent) {
                if (id.slice(1) == this.getCards()[+i + 1].slice(1))
                    x += (interval - 10);
                else
                    x += interval;
            }
            else
                x += interval;

            zIndex += 1;
        }
        App.get('stage').draw();
        this.set('cards_need_up', []);
        if (!without_animation)
            this.animate_cards();
    },
    _needCards: function () {
        console.log(this);
        return this.get('MAX_COUNT_CARDS') - this.getCards().length;
    },
    _addCards: function (cards) {
        var that = this;
        for (var i in cards) {
            var id = cards[i];

            var card = new Konva.Image({
                x: 20,
                y: App.getDeckCoords().y,
                image: App.get('backImage'),
                width: App.get('card_width'),
                height: App.get('card_height'),
                id: id,
                name: 'inverted',
                rotation: 0
            });
            App.get('MyCards').add(card);
            card.on('click tap', function () {
                that._activateLastTakenCards();
            });
            App.get('MyCards').draw();
        }
    },
    _takeCardsFromTable: function (cards_from_table) {
        App.get('table').clearTable();
        var x = this.getCards().length * 20 + 60;
        var that = this;
        var clone_cards = this.getCards().slice('');
        for (var i = cards_from_table.length - 1; i >= 0; i--) {
            var id = clone_cards.pop();
            x += 30;
            var card = App.get('stage').findOne('#' + cards_from_table[i]);
            card.setId(id);
            card.setImage(App.get('backImage'));
            card.name('inverted');
            card.on('click tap', function () {
                that._activateLastTakenCards();
            });
            App.get('MyCards').draw();

            var tween = new Konva.Tween({
                node: card,
                duration: 0.1,
                x: x,
                y: 20,
                onFinish: function () {
                    that._renderCards(true);
                }
            });
            tween.play();
        }
    },
    _getMinTrump: function () {
        var min_trump = '';
        var trump = App.getTrump();
        for (var i in this.getCards()) {
            if (this.getCards()[i][0] == trump) {
                var current_val = +this.getCards()[i].split(trump)[1];
                if (!min_trump) {
                    min_trump = this.getCards()[i];
                }
                else {
                    if (+min_trump.split(trump)[1] > current_val)
                        min_trump = this.getCards()[i];
                }
            }
        }
        return min_trump;
    },
    _getMinCard: function (card) {
        var min = '';
        if (!card) {
            for (var i in this.getCards()) {
                if (!min) {
                    if (this.getCards()[i][0] != App.getTrump()) {
                        min = this.getCards()[i];
                    }
                }
                var current = +this.getCards()[i].substring(1);
                var min_val = +min.substring(1);
                if (current < min_val && this.getCards()[i][0] != App.getTrump())
                    min = this.getCards()[i];
            }
            if (!min)
                min = this._getMinTrump();
        }
        else {
            var suit = card[0];
            var card_val = +card.split(suit)[1];
            for (var i in this.getCards()) {
                if (this.getCards()[i][0] == suit) {
                    var current_val = +this.getCards()[i].split(suit)[1];

                    if (!min) {
                        if (current_val > card_val)
                            min = this.getCards()[i];
                    }
                    else {
                        if (current_val > card_val && current_val < +min.split(suit)[1])
                            min = this.getCards()[i];
                    }
                }
            }
            if (!min && suit != App.getTrump()) {
                min = this._getMinTrump();
            }
        }
        return min;
    },
    _getAllPossibleCardsForBeat: function () {
        var card_on_table = App.get('table').getCardForBeatID();
        var cards = [];

        for (var i in this.getCards()) {
            if (this.getCards()[i][0] === card_on_table[0] && +this.getCards()[i].slice(1) > +card_on_table.slice(1))
                cards.push(this.getCards()[i]);
        }
        if (card_on_table[0] !== App.getTrump()) {
            for (var i in this.getCards()) {
                if (this.getCards()[i][0] === App.getTrump())
                    cards.push(this.getCards()[i]);
            }
        }
        return cards;
    },
    _getCardsForThrow: function (cards) {
        if (!cards) {
            cards = App.get('table').getCards();
        }
        var result = [];
        for (var i in cards) {
            for (var j in this.getCards()) {
                if (this.getCards()[j].slice(1) == cards[i].slice(1)) {
                    result.push(this.getCards()[j]);
                }
            }
        }
        return result.length ? result : false;
    },
    _getCardForThrow: function () {
        var cards = this._getCardsForThrow();
        return cards.length ? cards[0] : null;
    },
    _activateLastTakenCards: function (cards) {
        if (App.get('TakenCardsLayer')) {
            if (App.get('TakenCardsLayer').isVisible())
                App.get('TakenCardsLayer').hide();
            else
                App.get('TakenCardsLayer').show();
            App.get('stage').draw();
            return false;
        }

        this._renderLastTakenCards();
    },
    _renderLastTakenCards: function () {
        App.get('table').renderLastTakenCards(
            this.get('lastTakenCards'),
            this.get('LAST_TAKEN_CARDS_X'),
            this.get('LAST_TAKEN_CARDS_Y')
        );
    },
    _renderLastTakenCardsIfVisible: function () {
        if (App.get('TakenCardsLayer') && App.get('TakenCardsLayer').isVisible()) {
            this._renderLastTakenCards();
        }
    },
    _destroyLastTakenCards: function () {
        this.set('lastTakenCards', {});
        if (App.get('TakenCardsLayer')) {
            App.get('TakenCardsLayer').destroy();
            App.set('TakenCardsLayer', null);
        }
    },
    _isMyCard: function (id) {
        return this.getCards().indexOf(id) != -1;
    }
});