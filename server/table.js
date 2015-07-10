module.exports = function () {
    this._cards = [];
    this.cards_over = [];
    this.card = '';

    var that = this;

    var addCard = function (id) {
        var konva_card = App.stage.find('#' + id)[0];
        var x = 200;
        if (that._cards.length) {
            x = App.stage.find('#' + that._cards[that._cards.length - 1])[0].getAttr('x');
            x += 80;
        }
        var Card = new Image();
        Card.src = App.getImgUrlByCardId(id);
        Card.onload = function () {
            konva_card.setImage(Card);
            App.MyCards.draw();
            var tween = new Konva.Tween({
                node: konva_card,
                duration: 0.1,
                x: x,
                y: 300
            });
            tween.play();
        };
        that.card = id;
        that._cards.push(id);

    };

    var addCardOver = function (id, opponent) {
        var card_on_table = App.stage.find('#' + that.card)[0];
        var card = App.stage.find('#' + id)[0];
        var zIndex = card_on_table.getZIndex();
        card.setZIndex(zIndex + 1);
        var x = card_on_table.getAttr('x');
        var y = 350;
        if (opponent)
            y = 250;

        var Card = new Image();
        Card.src = App.getImgUrlByCardId(id);
        Card.onload = function () {
            card.setImage(Card);
            App.MyCards.draw();
            var tween = new Konva.Tween({
                node: card,
                duration: 0.1,
                x: x,
                y: y
            });
            tween.play();
        };

        that.cards_over.push(id);
        that.card = ''
    };

    var getCard = function () {
        return that.card;
    };
    var getCards = function (from_table) {
        var cards = [];
        for (var i in that.cards_over) {
            if (that.cards_over[i])
                cards.push(that.cards_over[i]);
        }
        for (var i in that._cards) {
            if (that._cards[i])
                cards.push(that._cards[i]);
        }
        if (from_table) {
            clearTable();
        }
        return cards;
    };

    var clearTable = function () {
        that._cards = [];
        that.cards_over = [];
        that.card = '';
    };

    var addToPile = function () {
        var cards = getCards();
        for (var i in cards) {
            var id = cards[i];
            var card = App.stage.find('#' + id)[0];
            card.setImage(App.backImage);

            var rotation = Math.floor(Math.random() * 30);
//            rotation = rotation % 2 == 0 ? rotation + 90: rotation;

            var tween = new Konva.Tween({
                node: card,
                x: 650,
                y: 50,
                duration: 0.1,
                rotation: rotation
            });
            tween.play();
        }
        clearTable();
        App.addCards();
    };

    return {
        addCard: addCard,
        getCard: getCard,
        getCards: getCards,
        addCardOver: addCardOver,
        addToPile: addToPile
    }
};