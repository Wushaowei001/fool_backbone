var Util = {
    countDown: {
        countDownsInProgress: [],
        countDownsToStop: [],
        go: function (count, onStep, onFinal, name) {
            if (!_.contains(this.countDownsInProgress, name))
                this.countDownsInProgress.push(name);
            if (_.contains(this.countDownsToStop, name)) {
                this.countDownsToStop = _.without(this.countDownsToStop, name);
                this.countDownsInProgress = _.without(this.countDownsInProgress, name);
                return;
            }
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
            this.countDownsToStop.push(name);
            App.trigger('timer_for_throw_stop');
        }
    }
};