$(function () {
    var WebManager = {
        addToPile: function () {
            client.gameManager.sendTurn({type: 'addToPile'});
            client.gameManager.sendEvent('event', {data: 'getCards'});
        },
        endThrow: function (cards) {
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

    WebManager.listenTo(App, 'addToPile', function () {
        WebManager.addToPile();
    });
    WebManager.listenTo(App, 'endThrow', function (cards) {
        WebManager.endThrow(cards);
    });
    WebManager.listenTo(App, 'getCards', function () {
        WebManager.getCards();
    });
});
