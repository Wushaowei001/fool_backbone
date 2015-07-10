var History = function (history) {
    var index = 0;
    var old_index = null;
    var playing = null;
    var callback = null;

    this.without_animation = false;

    var me = client.getPlayer().userId;

    this.enablePrev = function () {
    };
    this.enableNext = function () {
    };
    this.disablePrev = function () {
    };
    this.disableNext = function () {
    };
    this.disablePlay = function () {
    };

    this.getIndex = function () {
        return index;
    };

    this.getHistory = function () {
        return history;
    };

    this.getHistoryToCurrentIndex = function () {
        var result = [];
        for (var i in history) {
            result.push(history[i]);
            if (i == index - 1)
                break;
        }
        return result;
    };

    this.reset = function () {
    };

    var self = this;

    var steps_only_for_me = [];

    for (var i in history) {
        var obj = history[i];
        if (obj) {
            if ((obj.target && obj.target != me) ||
                (typeof obj.opponent_cards != 'undefined' && !obj.opponent_cards) ||
                (typeof obj.cards != 'undefined' && !obj.cards) ||
                obj.result) {

                delete history[i];
                continue;
            }
        }
        steps_only_for_me.push(history[i]);
    }
    history = steps_only_for_me;
    console.log(history);

    this.play = function (fn) {
        console.log('play!!!!');
        callback = fn;
        if (playing == null || !history[index]) {
            self.disablePrev();
            self.reset();
            index = 0;
            playing = true;
        }
        if (playing === true && index > 0) {
            playing = false;
            return false;
        }
        if (playing === false) {
            playing = true;
        }
        forward();
    };

    this.next = function () {
        self.disablePlay();
        playing = true;
        forward('next');
        playing = false;
    };

    this.prev = function () {
        playing = true;
        forward('prev');
        playing = false;
    };

    var forward = function (action) {

        if (playing === false)
            return;

        if (action && action == 'prev') {
            if (old_index == null) {
                old_index = index > 0 ? index - 1 : 0;

                index = 0;
            }
            else {
                if (index == old_index) {
                    old_index = null;
                    return false;
                }
            }
        }

        var obj = history[index];
        console.log(index);
        console.log(obj);
        if (!obj) {
            if (action && action == 'prev' && index > 0) {
                old_index = null;
                index--;
                self.prev();
                return;
            }
            else {
                if (typeof callback == 'function')
                    callback();
//            self.disablePrev(); // TODO запихнуть в callback
                self.disableNext();
                playing = null;

                return false;
            }

        }
        if (index == 0) {
            self.disablePrev();
            self.enableNext();
        }
        if (obj.target) {
            if (obj.type == 'getCards') {

                if (obj.opponent_cards) {
                    App.opponent.addCards(obj.opponent_cards);
                    if (App.game_with_comp && !App.view_only)
                        App.game_with_comp.removeCardsFromBegin(obj.opponent_cards);
                }
                else {
                    App.human.addCards(obj.cards, App.without_animation ? false : true);
                    App.human.renderCards(App.without_animation, true); // а надо ли?
                    if (App.game_with_comp && !App.view_only)
                        App.game_with_comp.removeCardsFromBegin(obj.cards);
                }
            }
        }
        if (obj.nextPlayer) {
            if (obj.card) {
                if (obj.nextPlayer != me) {
                    App.human.step(obj.card);
                    App.human.setCanStep(false);
                }
                else {
                    App.opponent.step(obj.card);
                    App.human.setCanStep(true);
                }
            }
            if (obj.type == 'takeCards') {
                App.table.clearTable();
                if (obj.nextPlayer != me) {
                    App.human.addCards(obj.cards, false);
                    App.human.renderCards(App.without_animation);
                    App.human.setCanStep(false);
                }
                else {
                    App.opponent.takeCardsFromTable(obj.cards);
                    App.human.setCanStep(true);
                }
            }
            if (obj.type == 'addToPile') {
                App.table.addToPile();
                if (obj.nextPlayer != me) {
                    App.human.setCanStep(false);
                }
                else {
                    App.human.setCanStep(true);
                }
            }
        }
        // если следующего шага нет
        if (action && action == 'next' && !history[index + 1]) {
            self.disableNext();
        }
        index++;
        self.enablePrev();
        if (action || self.without_animation) {
            if (action == 'next') {
                return false;
            }
            if (action == 'prev' || self.without_animation) {
                if (old_index == 0) {
                    index = 0;
                    self.disablePrev();
                    self.reset();
                    return false;
                }
                forward(action);
            }
        }
        else {
            setTimeout(forward, 500);
        }
    };
};