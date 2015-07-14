window.myStepTextShow = function () {
    $('#my_step_text').show();
};
window.myStepTextHide = function () {
    $('#my_step_text').hide();
};
window.loadTextShow = function(){
  $('#load_text').show();
};
window.loadTextHide = function(){
    $('#load_text').hide();
};

getSettingsTemplate = function () {
    return $('#settings_template').html();
};

var cloner = {
    _clone: function _clone(obj) {
        if (obj instanceof Array) {
            var out = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                var value = obj[i];
                out[i] = (value !== null && typeof value === "object") ? _clone(value) : value;
            }
        } else {
            var out = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var value = obj[key];
                    out[key] = (value !== null && typeof value === "object") ? _clone(value) : value;
                }
            }
        }
        return out;
    },

    clone: function (it) {
        return this._clone({
            it: it
        }).it;
    }
};

window.throwButtonShow = function () {
    $('#end_throw').show();
};

window.canThrowMessageShow = function () {
    $('#can_throw').show();
};