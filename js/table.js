var Table = function () {
    this.human_attack = null;
    this.INTERVAL_BETWEEN_CARDS = 1;
    this.POS_FOR_CARDS_OPPONENT = App.getDeckCoords().y + 40;
    this.POS_FOR_CARDS_OVER_OPPONENT = App.getDeckCoords().y - 90;
    this.POS_FOR_CARDS = App.getDeckCoords().y - 40;
    this.POS_FOR_CARDS_OVER = App.getDeckCoords().y + 90;
    this.LEFT_POSITION_START = 160;
    this.LAST_PILE_LEFT_POSITION = App.getPileCoords().x - Config.cards.width / 1.5;
    this.SMALL_CARD_WIDTH = Config.cards.width / 1.5;
    this.SMALL_CARD_HEIGHT = Config.cards.height / 1.5;
    this.LAST_PILE_POS_FOR_CARDS = App.getPileCoords().y + 30;
    this.SMALL_CARD_VERTICAL_INTERVAL = 40;
    this.last_pile = {
        all_cards: [],
        cards_over: [],
        human_attack: false
    };
    this.last_state = {
        all_cards: [],
        cards_over: [],
        human_attack: false
    };
    this.all_cards = {
        cards: [],
        cards_for_throw: []
    };
    this.without_animation = false;

    var that = this;

    this.setState = function (state) {
        this.all_cards.cards = state.cards != undefined ? Util.cloner.clone(state.cards) : [];
        this.all_cards.cards_for_throw = state.cards_for_throw != undefined ? Util.cloner.clone(state.cards_for_throw) : [];
        this.human_attack = state.human_attack;
        this.without_animation = state.without_animation != undefined ? state.without_animation : false
    };

    this.getState = function (without_cards_for_throw) {
        var state = Util.cloner.clone(this.all_cards);
        if (without_cards_for_throw)
            state.cards_for_throw = null;
        state.human_attack = this.human_attack;
        state.without_animation = this.without_animation;
        return state;
    };

    this.getLastState = function () {
        return this.last_state;
    };

    this.getCardForBeat = function () {
        var all_cards = this.all_cards.cards;
        for (var i in all_cards) {
            if (!all_cards[i].over)
                return all_cards[i];
        }
        return false;
    };

    this.getCardForBeatID = function () {
        var card = this.getCardForBeat();
        return card ? card.id : false;
    };

    this.getCardsForBeat = function () {
        var result = [];
        var cards = this.all_cards.cards;
        for (var i in cards) {
            if (!cards[i].over) {
                result.push(cards[i].id);
            }
        }
        return result.length ? result : false;
    };

    this.addCard = function (id, bottom_player) {
        var all_cards = this.all_cards.cards;

        if (this.human_attack == null) {
            this.human_attack = bottom_player;
        }
        if (all_cards.indexOf(id) == -1) {
            var card_for_beat = this.getCardForBeat();
            if (!card_for_beat) {
                all_cards.push({id: id, over: ''});
            }
            else {
                card_for_beat.over = id;
            }
        }

        this.render();
    };

    this.addTransferCard = function (id) {
        this.all_cards.cards.push({
            id: id,
            over: ''
        });
        this.human_attack = !this.human_attack;
        this.render();
    };

    this.addCardForThrow = function (id) {
        this.all_cards.cards_for_throw.push(id);
        this.render();
    };

    this.render = function () {
        var all_cards = this.all_cards.cards;
        var x = this.LEFT_POSITION_START;
        var y = this.human_attack ? this.POS_FOR_CARDS : this.POS_FOR_CARDS_OPPONENT;
        var zIndex;
        for (var i in all_cards) {
            var id = all_cards[i].id;
            y = this.human_attack ? this.POS_FOR_CARDS : this.POS_FOR_CARDS_OPPONENT;
            zIndex = renderCard_(id, x, y);
            if (all_cards[i].over) {
                y = this.human_attack ? this.POS_FOR_CARDS_OVER_OPPONENT : this.POS_FOR_CARDS_OVER;
                renderCard_(all_cards[i].over, x, y, zIndex + 1);
            }
            x = x + Config.cards.width + this.INTERVAL_BETWEEN_CARDS;
        }
        var cards_for_throw = this.all_cards.cards_for_throw;
        for (var i in cards_for_throw) {
            renderCard_(cards_for_throw[i], x, this.POS_FOR_CARDS);
            x = x + Config.cards.width + this.INTERVAL_BETWEEN_CARDS;
        }
    };

    this.renderLastPile = function () {
        if (!this.last_pile.cards)
            return false;
        if (App.get('lastPileLayer'))
            App.get('lastPileLayer').destroy();
        var lastPileLayer = new Konva.Layer();
        App.set('lastPileLayer', lastPileLayer);
        App.get('stage').add(lastPileLayer);

        var x = this.LAST_PILE_LEFT_POSITION -
            (this.SMALL_CARD_WIDTH + this.INTERVAL_BETWEEN_CARDS)
                * (this.last_pile.cards.length - 1);
        var y = this.LAST_PILE_POS_FOR_CARDS;
        this.renderSmallCards(this.last_pile, x, y, lastPileLayer);
        App.trigger('table:renderLastPile');
    };

    this.renderLastPileIfVisible = function () {
        if (App.get('lastPileLayer') && App.get('lastPileLayer').isVisible()) {
            App.get('table').renderLastPile();
        }
    };

    this.renderSmallCards = function (cards_object, x, y, layer) {
        var cards = cards_object.cards;
        var top = y;
        for (var i in cards) {
            var id = cards[i].id;
            y = top;
            renderSmallCard(id, x, y, layer);
            if (cards[i].over) {
                y = cards_object.human_attack ? top - this.SMALL_CARD_VERTICAL_INTERVAL : top + this.SMALL_CARD_VERTICAL_INTERVAL;
                renderSmallCard(cards[i].over, x, y, layer);
            }
            x = x + this.SMALL_CARD_WIDTH + this.INTERVAL_BETWEEN_CARDS;
        }
        var cards_for_throw = cards_object.cards_for_throw;
        for (var i in cards_for_throw) {
            renderSmallCard(cards_for_throw[i], x, top, layer);
            x = x + this.SMALL_CARD_WIDTH + this.INTERVAL_BETWEEN_CARDS;
        }
    };

    this.toggleLastPile = function () {
        if (App.get('lastPileLayer')) {
            if (App.get('lastPileLayer').isVisible())
                App.get('lastPileLayer').hide();
            else
                App.get('lastPileLayer').show();
            App.get('stage').draw();
        }
        else {
            this.renderLastPile();
        }
    };

    this.destroyLastPile = function () {
        if (App.get('lastPileLayer')) {
            App.get('lastPileLayer').destroy();
            App.set('lastPileLayer', null);
//            App.lastPileLayer = null;
        }
    };

    var renderSmallCard = function (id, x, y, layer) {
        var card_from_pile = App.get('stage').findOne('#' + id);
        var zIndex = card_from_pile ? card_from_pile.getZIndex() : 1;

        var card = App.getImageById(id).clone({
            x: x,
            y: y,
            zIndex: zIndex,
            width: that.SMALL_CARD_WIDTH,
            height: that.SMALL_CARD_HEIGHT,
            name: 'smallCard'
        });
        layer.add(card);
        App.get('stage').draw();
    };

    var renderCard_ = function (id, x, y, zIndex) {
        var card = App.get('stage').findOne('#' + id);
        var attributeObject = {
            id: id,
            rotation: 0
        };
        if (card) {
            attributeObject.x = card.getX();
            attributeObject.y = card.getY();
            card.remove();
        }

        card = App.addCardToLayer(attributeObject);

        if (!zIndex)
            zIndex = card.getZIndex();
        else
            card.setZIndex(zIndex);
        var render = function () {
//            card.setImage(App.getImageById(id));
            App.get('stage').draw();
            if (that.getState().without_animation) {
                card.setX(x);
                card.setY(y);
                card.setRotation(0);
            }
            else {
                var tween = new Konva.Tween({
                    node: card,
                    duration: 0.2,
                    rotation: 0,
                    x: x,
                    y: y
                });
                tween.play();
            }
        };
        if (card.hasName('inverted')) {
            card.removeName('inverted');
        }
        render();
        App.get('stage').draw();
        return zIndex;

    };

    this.addCards = function (cards) {
        for (var i in cards) {
            this.addCard(cards[i]);
        }
    };

    this.getCards = function (from_table) {
        if (!this.all_cards || !this.all_cards.cards)
            return false;
        var all_cards = this.all_cards.cards.slice('');

        var cards = all_cards.map(function (obj) {
            return obj.id;
        });
        all_cards = cards.concat(this.getCardsOver());
        if (from_table) {
            this.clearTable();
        }

        return all_cards.length ? all_cards : false;
    };

    this.getCardsOver = function () {
        var all_cards = this.all_cards.cards;
        var cards = [];
        all_cards.map(function (card) {
            if (card.over)
                cards.push(card.over);
        });
        return cards;
    };

    this.getCountCards = function () {
        return this.all_cards.cards.length;
    };

    this.getCardsForThrow = function () {
        return this.all_cards.cards_for_throw.length ? this.all_cards.cards_for_throw : false;
    };

    this.getCountCardsForThrow = function () {
        var cards = this.getCardsForThrow();
        return cards ? cards.length : 0;
    };

    this.getCountCardsNotYetBeatenWithoutThrow = function () {
        return this.getCountCards() - this.getCountCardsOver() + this.getCountCardsForThrow();
    };

    this.getCountCardsNotYetBeatenWithThrow = function () {
        return this.getCountCards() - this.getCountCardsOver();
    };

    this.getCountCardsOver = function () {
        var cards = this.getCardsOver();
        return cards ? cards.length : 0;
    };

    this.shiftCardForThrow = function () {
        var id = this.all_cards.cards_for_throw.length ? this.all_cards.cards_for_throw.shift() : false;
        return id;
    };
    this.clearTable = function () {
        this.last_state = this.getState();
        this.human_attack = null;
        this.all_cards.cards = [];
    };

    this.clearCardsForThrow = function () {
        this.all_cards.cards_for_throw = [];
    };

    this.addToPile = function () {
        App.trigger('table:addToPile');
        this.destroyLastPile();
        var cards = this.getCards();
        this.last_pile = this.getState();

        if (!App.get('without_animation')) {
            App.addToPileSound();
        }
        for (var i in cards) {

            var id = cards[i];
            var card = App.get('stage').findOne('#' + id);
            console.log(card.parent);

            card.on('click', function () {
                that.toggleLastPile();
            });

            card.setAttrs({
                image: App.get('backImage'),
                name: 'inverted',
                crop: {x: 0, y: 0, width: 0, height: 0} // important
            });
            card.strokeEnabled(false); // because stroke already on image

            var rotation = -Math.floor(Math.random() * 30);
//            rotation = rotation % 2 == 0 ? rotation + 90: rotation;

            if (App.get('without_animation')) {
                card.setX(App.getPileCoords().x);
                card.setY(App.getPileCoords().y);
                card.rotation(rotation);
            }
            else {
                var tween = new Konva.Tween({
                    node: card,
                    x: App.getPileCoords().x,
                    y: App.getPileCoords().y,
                    duration: 0.2,
                    rotation: rotation
                });
                tween.play();
            }

            App.get('MyCards').draw();
        }
        this.clearTable();
    };

    this.updateCardImages = function () {
        var cards = this.getCards();
        if (cards) {
            cards.concat(this.getCardsForThrow());
        }
        App.updateCardImages(cards);
    };

    this.possibleTransfer = function () {
        return !this.getCountCardsOver();
    };

    this.toggleAttacker = function () {
        this.human_attack = !this.human_attack;
    }

};