// Test generate userId
window.LogicGame = {isSuperUser: function () {
    return true;
},
    init: function (fn) {
        $(document).ready(function () {
            fn();
        });
    }};
//var _userId = Math.floor(Math.random() * 100000000000000);
var _userId = 100000000000000;
var _username = 'guest' + _userId;
var _sign = '1111111111111';