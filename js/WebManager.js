var WebManager = Backbone.Model.extend({
    initialize: function () {
        this.on('destroy', function () {
            this.off();
            this.stopListening();
        });
        this.listenTo(App, 'human:addToPile', function () {
            this.addToPile();
        });
        this.listenTo(App, 'endThrow', function (cards) {
            if (cards)
                this.endThrow(cards);
        });
        this.listenTo(App, 'getCards', function () {
            this.getCards();
        });
        this.listenTo(App, 'takeCards', function (obj) {
            this.doTurn(obj);
        });
        this.listenTo(App, 'human:step', function (turn) {
            this.doTurn(turn);
        });
        this.listenTo(App, 'human:throw', function (obj) {
            this.doTurn(obj);
        });
        this.listenTo(App, 'win', this.win);
        this.listenTo(App, 'draw', this.draw);
        this.listenTo(App, 'loose', this.loose);
    },
    addToPile: function () {
        this.doTurn({type: 'addToPile'});
        client.gameManager.sendEvent('event', {data: 'getCards'});
    },
    doTurn: function (turn) {
        turn.state = {
//            human_cards: cloner.clone(App.get('human').getCards()),
            opponent_cards: cloner.clone(App.get('opponent').getCards()),
            table_state: cloner.clone(App.get('table').getState()),
            trump_value: App.getTrumpValue(),
            deck_remain: App.get('deck_remain')
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
                type: 'throw',
                allow_throw: false
            });
    },
    getCards: function () {
        client.gameManager.sendEvent('event', {data: 'getCards'});
    },
    loose: function () {
        this.doTurn({result: 0});
    },
    win: function () {
        this.doTurn({result: 1});
    }
});