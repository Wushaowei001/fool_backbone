var Backbone = window.Backbone;

Backbone.Model.prototype._super = function (funcName) {
    return this.constructor.__super__[funcName].apply(this, _.rest(arguments));
};

var App = {};
var appView = {};

$(function () {
    App = new AppModel();
    appView = new AppView();
});