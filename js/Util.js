var Util = {
    countDown: {
        countDownsInProgress: [],
        countDownsToStop: [],
        finals: {},
        go: function (count, onStep, onFinal, name) {
            if (_.contains(this.countDownsToStop, name)) {
                this.countDownsToStop = _.without(this.countDownsToStop, name);
                this.countDownsInProgress = _.without(this.countDownsInProgress, name);
                return;
            }
            if (!_.contains(this.countDownsInProgress, name))
                this.countDownsInProgress.push(name);

            this.finals[name] = onFinal;
            onStep(count);
            if (count == 0) {
                this.countDownsInProgress = _.without(this.countDownsInProgress, name);
                onFinal();
            }
            else {
                setTimeout(function () {
                    count--;
                    Util.countDown.go(count, onStep, onFinal, name);
                }, 1000);
            }
        },
        actionInProgress: function (name) {
            return _.indexOf(this.countDownsInProgress, name) != -1;
        },
        stop: function (name) {
            if (!this.actionInProgress(name))
                return;
            this.countDownsToStop.push(name);
            this.countDownsInProgress = _.without(this.countDownsInProgress, name);
            this.finals[name]();
        }
    },
    sequentialActions: {
        list: [],
        add: function (action, timeout) {
            this.list.push(
                {
                    action: action,
                    timeout: timeout
                }
            );
            if (this.list.length == 1) {
                this.go();
            }
        },
        go: function () {
            if (this.list.length) {
                setTimeout(function () {
                    this.list[0].action();
                    this.list.shift();
                    this.go();
                }.bind(this), this.list[0].timeout)
            }
        },
        reset: function () {
            this.list = [];
        }
    },
    cloner: {
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
    }
};