var WebManager = Backbone.Model.extend({
    initialize: function () {
        this.on('destroy', function () {
            this.off();
            this.stopListening();
        });
        this.listenTo(App, 'human:addToPile', function () {
            this.addToPile();
        });
        this.listenTo(App, 'addToPile', function () {
            client.gameManager.sendEvent('event', {data: 'getCards'});
        });
        this.listenTo(App, 'endThrow', function (cards) {
            if (cards)
                this.endThrow(cards);
        });
        this.listenTo(App, 'getCards', function () {
            this.getCards();
        });
        this.listenTo(App, 'takeCards', function (obj) {
            this.takeCards(obj);
        });
        this.listenTo(App, 'human:step', function (turn) {
            this.doTurn(turn);
        });
        this.listenTo(App, 'human:throw', function (obj) {
            this.Throw(obj);
        });
        this.listenTo(App, 'human:throw_turn', function (obj) {
            this.ThrowTurn(obj);
        });
    },
    addToPile: function () {
        this.doTurn({turn_type: 'addToPile'});
        client.gameManager.sendEvent('event', {data: 'getCards'});
    },
    doTurn: function (turn) {
        client.gameManager.sendTurn(turn);
    },
    endThrow: function (cards) {
        if (cards)
            this.doTurn({
                cards: cards,
                turn_type: 'throw',
                allow_throw: false
            });
    },
    getCards: function () {
        client.gameManager.sendEvent('event', {data: 'getCards'});
    },
    takeCards: function (obj) {
        obj.turn_type = 'takeCards';
        this.doTurn(obj);
    },
    Throw: function (obj) {
        obj.turn_type = 'throw';
        this.doTurn(obj);
    },
    ThrowTurn: function (obj) {
        this.doTurn(obj);
    }
});