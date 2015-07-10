$(function(){
    var WebManager = {
        addToPile: function () {
            client.gameManager.sendTurn({type: 'addToPile'});
            client.gameManager.sendEvent('event', {data: 'getCards'});
        }
    };
    _.extend(WebManager, Backbone.Events);

    WebManager.listenTo(App, 'addToPile', function () {
        WebManager.addToPile();
    });
});
