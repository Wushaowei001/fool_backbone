var SettingObj = Backbone.Model.extend({
    defaults: {
        back_image: null,
        card_design: null,
        sort: null,
        trump_mapping: null,
        step: null
    },
    initialize: function () {
        this.on('change', function (p) {
            console.log(p.changed);
        });
        this.on('change:back_image', function () {
            App.changeBackImage();
        });
        this.on('change:card_design', function () {
//            App.trigger('load_images_start');
            App.loadImages2(this.get('card_design'));
//                function () {
//                    loadTextShow();
//                },
//                function () {
//                    loadTextHide();
//                    App.trigger('load_images_end');
//                    if (App.get('human')) {
//                        App.get('human').updateCardImages(function () {
//                            App.renderTrump();
//                            if (App.get('table').getCards())
//                                App.get('table').render();
//                        });
//                    }
//                });
        });
        this.on('change:sort', function () {
            if (App.get('human')) {
                App.get('human').renderCards();
            }
        });
        this.on('change:trump_mapping', function () {
            if (App.get('human')) {
                App.get('human').updateCardImages();
                App.renderTrump();
                App.get('table').updateCardImages();
                App.get('table').renderLastPileIfVisible();
                if (App.get('opponent') && App.get('opponent') instanceof Opponent)
                    App.get('opponent').renderLastTakenCardsIfVisible();
            }
        });
        this.on('change:step', function () {
            if (App.get('human')) {
                App.get('human').unBindCards();
                App.get('human').bindCards();
            }
        });
    }
});