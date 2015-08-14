var History = Backbone.Model.extend({
    defaults: {
        list: [],
        index: 0,
        min_index: 1
    },
    initialize: function (opt) {
        this.set('list', opt.list);
//        this.set('index', opt.list.length - 1);
        this.set('index', this.get('min_index'));
        this.on('change:index', function (self) {
            var index = this.get('index');
            console.log(index);
            var length = this.get('list').length;
            if (index == this.get('min_index')) {
                this.trigger('cursor_at_the_beginning');
            }
            if (index == length - 1) {
                this.trigger('cursor_at_the_end');
            }
            this.trigger('data_from_history', this.get('list')[index]);
        }.bind(this));
        this.on('destroy', function () {
            this.off();
            this.stopListening();
            if (Util.countDown.actionInProgress('play_history')) {
                Util.countDown.stop('play_history');
            }
        });
    },
    moveBack: function () {
        var index = this.get('index');
        if (index > this.get('min_index')) {
            index--;
            this.set('index', index);
        }
        return this;
    },
    moveForward: function () {
        var index = this.get('index');
        if (index < this.get('list').length - 1) {
            index++;
            this.set('index', index);
        }
        return this;
    },
    play: function () {
        var count = this.get('list').length - this.get('index');
        if (!Util.countDown.actionInProgress('play_history')) {
            Util.countDown.go(count,
                function () {
                    this.moveForward();
                    this.trigger('play_history_tick');
                }.bind(this),
                function () {
                    this.trigger('play_history_stop');
                }.bind(this),
                'play_history'
            );
        }
    },
    stop: function () {
        Util.countDown.stop('play_history');
    },
    getFirstItem: function () {
        return this.get('list')[this.get('min_index')];
    },
    getLastItem: function () {
        var list = this.get('list');
        var length = list.length;
        return list[length - 1];
    }
});