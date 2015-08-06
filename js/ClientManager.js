var ClientManager = Backbone.Model.extend({
        initialize: function () {
            this.on('destroy', function () {
                this.off();
                this.stopListening();
            });
            this.listenTo(App, 'game_with_comp_started', this.setClientNameAndRating);
        },
        setClientNameAndRating: function () {
            var you = client.getPlayer();
            App.set({
                my_name: you.userName,
                my_rating: you.getRank()
            });
        }
    }
);