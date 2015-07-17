$(function () {
//var WebManager = Backbone.Model.extend({
//    initialize: function () {
//        this.listenTo(App, 'human:addToPile', function () {
//            this.addToPile();
//        }.bind(this));
//        this.listenTo(App, 'endThrow', function (cards) {
//            if (cards)
//                this.endThrow(cards);
//        }.bind(this));
//        this.listenTo(App, 'getCards', function () {
//            this.getCards();
//        }.bind(this));
//    },
//    addToPile: function () {
//        client.gameManager.sendTurn({type: 'addToPile'});
//        client.gameManager.sendEvent('event', {data: 'getCards'});
//    },
//    endThrow: function (cards) {
//        if (cards)
//            client.gameManager.sendTurn(
//                {
//                    cards: cards,
//                    type: 'throw',
//                    allow_throw: false
//                }
//            );
//    },
//    getCards: function () {
//        client.gameManager.sendEvent('event', {data: 'getCards'});
//    }
//});
    var WebManager = {
        addToPile: function () {
            client.gameManager.sendTurn({type: 'addToPile'});
            client.gameManager.sendEvent('event', {data: 'getCards'});
        },
        endThrow: function (cards) {
            if (cards)
                client.gameManager.sendTurn(
                    {
                        cards: cards,
                        type: 'throw',
                        allow_throw: false
                    }
                );
        },
        getCards: function () {
            client.gameManager.sendEvent('event', {data: 'getCards'});
        }
    };
    _.extend(WebManager, Backbone.Events);

    WebManager.listenTo(App, 'human:addToPile', function () {
        WebManager.addToPile();
    });
    WebManager.listenTo(App, 'endThrow', function (cards) {
        if (cards)
            WebManager.endThrow(cards);
    });
    WebManager.listenTo(App, 'getCards', function () {
        WebManager.getCards();
    });
});
