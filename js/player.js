var Player = Backbone.Model.extend({
    defaults: {
//        MAX_COUNT_CARDS: 6,
//        LAST_TAKED_CARDS_X: 100,
//        LAST_TAKED_CARDS_Y: 100
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
                var card = App.get('stage').findOne('#' + id);
                card.off('click');
            }
        }
        this._destroyLastTakedCards();
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
        var timestamp = App.get('new_game_started');
        var default_y = App.getMyCardsCoords().y;
        if (opponent)
            default_y = App.getOpponentCoords().y;
        else {
            var settings = App.getSettings();
            switch (settings.sort) {
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
        if (this.getCards().length > 15)
            interval = 25;
        if (this.getCards().length > 25)
            interval = 20;
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
                    setTimeout(function () {
                        App.safeTimeOutAction(timestamp, function () {
                            that._renderCards();
                        });
                    }, 1000);
                }
            }


            var card = App.get('stage').findOne('#' + id);
            if (!card) {
                card = App.addCardToLayer(id, opponent);
            }
            else {
                if (opponent) {
                    card.setImage(App.get('backImage'));
                    //                card.strokeEnabled(true);
                    //                card.stroke(Settings.card_stroke_color);
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
                if (from_deck)
                    this.tweens.push(tween);
                else {
                    tween.play();
                }
            }

            x += interval;
            zIndex += 1;
            //        if (!opponent)
            //            App.mappingCard(id, card);
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

            card.on('click', function () {
                that._activateLastTakedCards();
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
            card.on('click', function () {
                that._activateLastTakedCards();
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
    _activateLastTakedCards: function (cards) {
        if (App.get('TackedCardsLayer')) {
            if (App.get('TackedCardsLayer').isVisible())
                App.get('TackedCardsLayer').hide();
            else
                App.get('TackedCardsLayer').show();
            App.get('stage').draw();
            return false;
        }

        this._renderLastTakedCards();
    },
    _renderLastTakedCards: function () {
        App.get('table').renderLastTakedCards(this.get('lastTakedcards'), this.get('LAST_TAKED_CARDS_X'), this.get('LAST_TAKED_CARDS_Y'));
    },
    _renderLastTakedCardsIfVisible: function () {
        if (App.get('TackedCardsLayer') && App.get('TackedCardsLayer').isVisible()) {
            this._renderLastTakedCards();
        }
    },
    _destroyLastTakedCards: function () {
        this.set('lastTakedcards', {});
//        this.lastTakedcards = {};
        if (App.get('TackedCardsLayer')) {
            App.get('TackedCardsLayer').destroy();
            App.set('TackedCardsLayer', null);
//            App.TackedCardsLayer = null;
        }
    },
    _isMyCard: function (id) {
        return this.getCards().indexOf(id) != -1;
    }
});

//var Player = function () {
//    this.MAX_COUNT_CARDS = 6;
//    this.LAST_TAKED_CARDS_X = 100;
//    this.LAST_TAKED_CARDS_Y = 100;
//};

/*

 Player.prototype.getCards = function () {
 return this._cards;
 };

 Player.prototype.setCards = function (cards) {
 this._cards = cloner.clone(cards);
 };

 Player.prototype.animate_cards = function (callback) {
 if (!this.tweens || !this.tweens.length) {
 if (callback && typeof callback === 'function')
 callback();
 return false;
 }

 var tween = this.tweens.shift();
 tween.play();
 };

 Player.prototype._removeCard = function (id) {
 for (var i in this._cards) {
 if (this._cards[i] == id) {
 this._cards.splice(i, 1);
 var card = App.stage.findOne('#' + id);
 card.off('click');
 }
 }
 this._destroyLastTakedCards();
 };

 Player.prototype._sortBySuit = function (cards) {
 var result = [];
 var temp = [];
 var trumps = [];
 for (var index in App.sequence) {
 temp = [];
 var suit = App.sequence[index];
 for (var card in cards) {
 if (suit === cards[card][0]) {
 if (suit == App.trump)
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
 };

 Player.prototype._sortByValue_TrumpAfterValue = function (cards) {
 var result = [];
 var trumps = [];
 var min_value = App.getMinCardValue();

 for (var i = min_value; i < 15; i++) {
 for (var index in App.sequence) {
 var suit = App.sequence[index];
 if (cards.indexOf(suit + i) !== -1) {
 if (suit === App.trump) {
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
 };

 Player.prototype._sortByValue_TrumpToRight = function (cards) {
 var result = [];
 var trumps = [];
 var min_value = App.getMinCardValue();

 for (var i = min_value; i < 15; i++) {
 for (var index in App.sequence) {
 var suit = App.sequence[index];
 if (cards.indexOf(suit + i) !== -1) {
 if (suit === App.trump) {
 trumps.push(suit + i);
 }
 else
 result.push(suit + i);
 }
 }
 }
 return result.concat(trumps);
 };

 Player.prototype._renderCards = function (opponent, without_animation, from_deck) {
 var timestamp = App.new_game_started;
 var default_y = App.getMyCardsCoords().y;
 if (opponent)
 default_y = App.getOpponentCoords().y;
 else {
 var settings = App.getSettings();
 switch (settings.sort) {
 case 'without':
 break;
 case 'by_suit':
 this._cards = this._sortBySuit(this._cards);
 break;
 case 'by_value':
 this._cards = this._sortByValue_TrumpAfterValue(this._cards);
 break;
 case 'by_value_trump_to_right':
 this._cards = this._sortByValue_TrumpToRight(this._cards);
 break;
 }
 }
 var interval = 30;
 if (this._cards.length > 15)
 interval = 25;
 if (this._cards.length > 25)
 interval = 20;
 var x = App.game_area.width / 2 - (interval * (this._cards.length + 1)) / 2;

 var zIndex = 1;

 var that = this;

 for (var i in this._cards) {
 var id = this._cards[i];
 var y = default_y;

 var up_new_card = false;
 if (this.cards_need_up && this.cards_need_up.length) {
 var index_card_need_up = this.cards_need_up.indexOf(id);
 if (!opponent && this.cards_need_up && index_card_need_up !== -1) {
 up_new_card = true;
 y = App.getMyCardsCoords().y - 15;
 setTimeout(function () {
 App.safeTimeOutAction(timestamp, function () {
 that._renderCards();
 });
 }, 1000);
 }
 }


 var card = App.stage.findOne('#' + id);
 if (!card) {
 card = App.addCardToLayer(id, opponent);
 }
 else {
 if (opponent) {
 card.setImage(App.backImage);
 //                card.strokeEnabled(true);
 //                card.stroke(Settings.card_stroke_color);
 card.name('inverted');
 }
 }

 card.setZIndex(zIndex);
 if (without_animation) {
 card.setX(x);
 card.setY(y);
 card.setRotation(0);
 App.MyCards.draw();
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
 if (from_deck)
 this.tweens.push(tween);
 else {
 tween.play();
 }
 }

 x += interval;
 zIndex += 1;
 //        if (!opponent)
 //            App.mappingCard(id, card);
 }
 App.stage.draw();
 this.cards_need_up = [];
 if (!without_animation)
 this.animate_cards();
 };

 Player.prototype._needCards = function () {
 return this.MAX_COUNT_CARDS - this._cards.length;
 };

 Player.prototype._addCards = function (cards) {
 var that = this;
 for (var i in cards) {
 var id = cards[i];

 var card = new Konva.Image({
 x: 20,
 y: App.getDeckCoords().y,
 image: App.backImage,
 width: App.card_width,
 height: App.card_height,
 id: id,
 name: 'inverted',
 rotation: 0
 });
 App.MyCards.add(card);

 card.on('click', function () {
 that._activateLastTakedCards();
 });
 App.MyCards.draw();
 }
 };

 Player.prototype._takeCardsFromTable = function (cards_from_table) {
 App.table.clearTable();
 var x = this._cards.length * 20 + 60;
 var that = this;
 var clone_cards = this._cards.slice('');
 for (var i = cards_from_table.length - 1; i >= 0; i--) {
 var id = clone_cards.pop();
 x += 30;
 var card = App.stage.findOne('#' + cards_from_table[i]);
 card.setId(id);
 card.setImage(App.backImage);
 card.name('inverted');
 card.on('click', function () {
 that._activateLastTakedCards();
 });
 App.MyCards.draw();

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
 };

 Player.prototype._getMinTrump = function () {
 var min_trump = '';
 var trump = App.getTrump();
 for (var i in this._cards) {
 if (this._cards[i][0] == trump) {
 var current_val = +this._cards[i].split(trump)[1];
 if (!min_trump) {
 min_trump = this._cards[i];
 }
 else {
 if (+min_trump.split(trump)[1] > current_val)
 min_trump = this._cards[i];
 }
 }
 }
 return min_trump;
 };

 Player.prototype._getMinCard = function (card) {
 var min = '';
 if (!card) {
 for (var i in this._cards) {
 if (!min) {
 if (this._cards[i][0] != App.getTrump()) {
 min = this._cards[i];
 }
 }
 var current = +this._cards[i].substring(1);
 var min_val = +min.substring(1);
 if (current < min_val && this._cards[i][0] != App.getTrump())
 min = this._cards[i];
 }
 if (!min)
 min = this._getMinTrump();
 }
 else {
 var suit = card[0];
 var card_val = +card.split(suit)[1];
 for (var i in this._cards) {
 if (this._cards[i][0] == suit) {
 var current_val = +this._cards[i].split(suit)[1];

 if (!min) {
 if (current_val > card_val)
 min = this._cards[i];
 }
 else {
 if (current_val > card_val && current_val < +min.split(suit)[1])
 min = this._cards[i];
 }
 }
 }
 if (!min && suit != App.getTrump()) {
 min = this._getMinTrump();
 }
 }
 return min;
 };

 Player.prototype._getAllPossibleCardsForBeat = function () {
 var card_on_table = App.table.getCardForBeatID();
 var cards = [];

 for (var i in this._cards) {
 if (this._cards[i][0] === card_on_table[0] && +this._cards[i].slice(1) > +card_on_table.slice(1))
 cards.push(this._cards[i]);
 }
 if (card_on_table[0] !== App.getTrump()) {
 for (var i in this._cards) {
 if (this._cards[i][0] === App.getTrump())
 cards.push(this._cards[i]);
 }
 }
 return cards;
 };

 //Player.prototype._isHaveCardForPut = function (cards) {
 //    if (!cards) {
 //        cards = App.table.getCards();
 //    }
 //    for (var i in cards) {
 //        for (var j in this._cards) {
 //            if (this._cards[j].slice(1) == cards[i].slice(1)) {
 //                return this._cards[j];
 //            }
 //        }
 //    }
 //    return false;
 //};

 Player.prototype._getCardsForThrow = function (cards) {
 if (!cards) {
 cards = App.table.getCards();
 }
 var result = [];
 for (var i in cards) {
 for (var j in this._cards) {
 if (this._cards[j].slice(1) == cards[i].slice(1)) {
 result.push(this._cards[j]);
 }
 }
 }
 return result.length ? result : false;
 };

 Player.prototype._getCardForThrow = function () {
 var cards = this._getCardsForThrow();
 return cards.length ? cards[0] : null;
 };

 Player.prototype._activateLastTakedCards = function (cards) {
 if (App.TackedCardsLayer) {
 if (App.TackedCardsLayer.isVisible())
 App.TackedCardsLayer.hide();
 else
 App.TackedCardsLayer.show();
 App.stage.draw();
 return false;
 }

 this._renderLastTakedCards();
 };

 Player.prototype._renderLastTakedCards = function () {
 App.table.renderLastTakedCards(this.lastTakedcards, this.LAST_TAKED_CARDS_X, this.LAST_TAKED_CARDS_Y);
 };

 Player.prototype._renderLastTakedCardsIfVisible = function () {
 if (App.TackedCardsLayer && App.TackedCardsLayer.isVisible()) {
 this._renderLastTakedCards();
 }
 };

 Player.prototype._destroyLastTakedCards = function () {
 this.lastTakedcards = {};
 if (App.TackedCardsLayer) {
 App.TackedCardsLayer.destroy();
 App.TackedCardsLayer = null;
 }
 };

 Player.prototype._isMyCard = function (id) {
 return this._cards.indexOf(id) != -1;
 };
 */