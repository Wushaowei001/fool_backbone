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
        this.listenTo(App, 'win', this.win);
        this.listenTo(App, 'draw', this.draw);
        this.listenTo(App, 'loose', this.loose);
    },
    addToPile: function () {
        this.doTurn({turn_type: 'addToPile'});
        client.gameManager.sendEvent('event', {data: 'getCards'});
    },
    doTurn: function (turn) {
        turn.state = {
//            opponent_cards: cloner.clone(App.get('opponent').getCards()),
            table_state: Util.cloner.clone(App.get('table').getState())
//            trump_value: App.getTrumpValue()
//            deck_remain: App.get('deck_remain')
        };
        client.gameManager.sendTurn(turn);
    },
    draw: function () {
        this.doTurn({result: 2});
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
    loose: function () {
        this.doTurn({result: 0});
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
    },
    win: function () {
        this.doTurn({result: 1});
    }
});