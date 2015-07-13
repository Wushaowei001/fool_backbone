var Table = function () {
    this.human_attack = null;
    this.INTERVAL_BETWEEN_CARDS = 3;
    this.POS_FOR_CARDS_OPPONENT = App.getDeckCoords().y + 40;
    this.POS_FOR_CARDS_OVER_OPPONENT = App.getDeckCoords().y - 90;
    this.POS_FOR_CARDS = App.getDeckCoords().y - 40;
    this.POS_FOR_CARDS_OVER = App.getDeckCoords().y + 90;
    this.LEFT_POSITION_START = 160;
    this.LAST_PILE_LEFT_POSITION = App.getPileCoords().x - App.get('card_width') / 1.5;
    this.SMALL_CARD_WIDTH = App.get('card_width') / 1.5;
    this.SMALL_CARD_HEIGHT = App.get('card_height') / 1.5;
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

    var that = this;

    this.setState = function (state) {
        that.all_cards.cards = cloner.clone(state.cards);
        that.all_cards.cards_for_throw = cloner.clone(state.cards_for_throw);
        that.human_attack = state.human_attack;
    };

    this.getState = function () {
        var state = cloner.clone(that.all_cards);
        state.human_attack = that.human_attack;
        return state;
    };

    this.getLastState = function () {
        return that.last_state;
    };

    this.getCardForBeat = function () {
        var all_cards = that.all_cards.cards;
        var card = null;
        for (var i in all_cards) {
            if (!all_cards[i].over)
                card = all_cards[i];
        }
        return card;
    };

    this.getCardForBeatID = function () {
        var card = that.getCardForBeat();
        return card ? card.id : false;
    };

    this.addCard = function (id, opponent) {
        var all_cards = that.all_cards.cards;

        if (!that.card) {
            if (that.human_attack == null) {
                that.human_attack = opponent ? false : true;
            }
        }
        if (all_cards.indexOf(id) == -1) {
            var card_for_beat = that.getCardForBeat();
            if (!card_for_beat) {
                all_cards.push({id: id, over: ''});
            }
            else {
                card_for_beat.over = id;
            }
        }

        that.render();
    };

    this.addCardForThrow = function (id) {
        that.all_cards.cards_for_throw.push(id);
        that.render();
    };

    this.render = function () {
        var all_cards = that.all_cards.cards;
        var x = that.LEFT_POSITION_START;
        var y = that.human_attack ? that.POS_FOR_CARDS : that.POS_FOR_CARDS_OPPONENT;
        var zIndex;
        for (var i in all_cards) {
            var id = all_cards[i].id;
            y = that.human_attack ? that.POS_FOR_CARDS : that.POS_FOR_CARDS_OPPONENT;
            zIndex = renderCard_(id, x, y);
            if (all_cards[i].over) {
                y = that.human_attack ? that.POS_FOR_CARDS_OVER_OPPONENT : that.POS_FOR_CARDS_OVER;
                renderCard_(all_cards[i].over, x, y, zIndex + 1);
            }
            x = x + App.get('card_width') + that.INTERVAL_BETWEEN_CARDS;
        }
        var cards_for_throw = that.all_cards.cards_for_throw;
        for (var i in cards_for_throw) {
            renderCard_(cards_for_throw[i], x, that.POS_FOR_CARDS);
            x = x + App.get('card_width') + that.INTERVAL_BETWEEN_CARDS;
        }
    };

    this.renderLastPile = function () {
        if (!that.last_pile.cards)
            return false;
        if (App.get('lastPileLayer'))
            App.get('lastPileLayer').destroy();
        var lastPileLayer = new Konva.Layer();
        App.set('lastPileLayer', lastPileLayer);
//        App.lastPileLayer = lastPileLayer;
        App.get('stage').add(lastPileLayer);

        var x = that.LAST_PILE_LEFT_POSITION -
            (that.SMALL_CARD_WIDTH + that.INTERVAL_BETWEEN_CARDS)
                * (that.last_pile.cards.length - 1);
        var y = that.LAST_PILE_POS_FOR_CARDS;
        that.renderSmallCards(that.last_pile, x, y, lastPileLayer);
    };

    this.renderLastTakedCards = function (cards_object, x, y) {
        if (!cards_object)
            return false;
        if (App.get('TackedCardsLayer'))
            App.get('TackedCardsLayer').destroy();
        var TackedCardsLayer = new Konva.Layer();
        App.set('TackedCardsLayer', TackedCardsLayer);
//        App.TackedCardsLayer = TackedCardsLayer;
        App.get('stage').add(TackedCardsLayer);
        that.renderSmallCards(cards_object, x, y, TackedCardsLayer);
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
                y = cards_object.human_attack ? top - that.SMALL_CARD_VERTICAL_INTERVAL : top + that.SMALL_CARD_VERTICAL_INTERVAL;
                renderSmallCard(cards[i].over, x, y, layer);
            }
            x = x + that.SMALL_CARD_WIDTH + that.INTERVAL_BETWEEN_CARDS;
        }
        var cards_for_throw = cards_object.cards_for_throw;
        for (var i in cards_for_throw) {
            renderSmallCard(cards_for_throw[i], x, top, layer);
            x = x + that.SMALL_CARD_WIDTH + that.INTERVAL_BETWEEN_CARDS;
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
            that.renderLastPile();
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

        var card = new Konva.Image({
            x: x,
            y: y,
            zIndex: zIndex,
            image: App.getImageById(id),
            width: that.SMALL_CARD_WIDTH,
            height: that.SMALL_CARD_HEIGHT,
            name: 'smallCard'
        });
        layer.add(card);
        App.get('stage').draw();
    };

    var renderCard_ = function (id, x, y, zIndex) {
        var card = App.get('stage').findOne('#' + id);
        if (!card) {
            card = App.addCardToLayer(id);
        }
        if (!zIndex)
            zIndex = card.getZIndex();
        else
            card.setZIndex(zIndex);
        var render = function () {
            card.setImage(App.getImageById(id));
            App.get('stage').draw();
            if (App.get('without_animation')) {
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
            that.addCard(cards[i]);
        }
    };

    this.getCards = function (from_table) {
        var all_cards = that.all_cards.cards.slice('');

        var cards = all_cards.map(function (obj) {
            return obj.id;
        });
        all_cards = cards.concat(that.getCardsOver());
        if (from_table) {
            that.clearTable();
        }

        return all_cards.length ? all_cards : false;
    };

    this.getCardsOver = function () {
        var all_cards = that.all_cards.cards;
        var cards = [];
        all_cards.map(function (card) {
            if (card.over)
                cards.push(card.over);
        });
        return cards;
    };

    this.getCountCards = function () {
        return that.all_cards.cards.length;
    };

    this.getCardsForThrow = function () {
        return that.all_cards.cards_for_throw.length ? that.all_cards.cards_for_throw : false;
    };

    this.getCountCardsForThrow = function () {
        var cards = that.getCardsForThrow();
        return cards ? cards.length : 0;
    };

    this.getCountCardsNotYetBeatenWithoutThrow = function () {
        return that.getCountCards() - that.getCountCardsOver() + that.getCountCardsForThrow();
    };

    this.getCountCardsNotYetBeatenWithThrow = function () {
        return that.getCountCards() - that.getCountCardsOver();
    };

    this.getCountCardsOver = function () {
        var cards = that.getCardsOver();
        return cards ? cards.length : 0;
    };

    this.shiftCardForThrow = function () {
        var id = that.all_cards.cards_for_throw.length ? that.all_cards.cards_for_throw.shift() : false;
        if (id) {
            that.all_cards.cards.push({id: id, over: ''});
        }
        return id;
    };
    this.clearTable = function () {
        that.last_state = that.getState();
        that.human_attack = null;
        that.all_cards.cards = [];
    };

    this.clearCardsForThrow = function () {
        that.all_cards.cards_for_throw = [];
    };

    this.addToPile = function () {
        that.destroyLastPile();
        var cards = that.getCards();
        that.last_pile = that.getState();

        if (!App.get('without_animation')) {
            App.addToPileSound();
        }
        for (var i in cards) {

            var id = cards[i];
            var card = App.get('stage').findOne('#' + id).setImage(App.get('backImage'));

            card.on('click', function () {
                that.toggleLastPile();
            });

            card.addName('inverted');

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
        that.clearTable();
    };

    this.updateCardImages = function () {
        var cards = that.getCards();
        if (cards) {
            cards.concat(that.getCardsForThrow());
        }
        App.updateCardImages(cards);
    };

};