var Util = {
    countDownsInProgress: [],
    countDown: function (count, onStep, onFinal, name) {
        if (!_.contains(this.countDownsInProgress, name))
            this.countDownsInProgress.push(name);
        onStep(count);
        if (count == 0) {
            this.countDownsInProgress = _.without(this.countDownsInProgress, name);
            onFinal();
        }
        else {
            setTimeout(function () {
                count--;
                Util.countDown(count, onStep, onFinal, name);
            }, 1000);
        }
    },
    actionInProgress: function (name) {
        return _.indexOf(this.countDownsInProgress, name) != -1;
    }
};