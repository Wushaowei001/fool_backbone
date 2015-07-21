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
            App.trigger('load_images_start');
            App.loadImages(
                function () {
                    loadTextShow();
                },
                function () {
                    loadTextHide();
                    App.trigger('load_images_end');
                    if (App.get('human')) {
                        App.get('human').updateCardImages(function () {
                            App.renderTrump();
                            if (App.get('table').getCards())
                                App.get('table').render();
                        });
                    }
                });
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
                if (App.get('opponent'))
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
var AppModel = Backbone.Model.extend({
    defaults: {
        app_name: 'fool',
        players: {},
        human: null,
        opponent: null,
        game_area: {},
        card_height: 96,
        card_width: 71,
        game_with_comp: false,
        sequence: ['d', 'c', 'h', 's'],
        wait_when_can_throw: 3000,
        history: null,
        view_only: false,
        without_animation: false,
        without_update_history: false,
        settings: null,
        new_game_started: false,
        mode_cards_count: 36,
        MAX_COUNT_CARDS: 52,
        images: {},
        awaiting_opponent_cards: [],
        view: null,
        score: null,
        my_name: null,
        opponent_name: null,
        my_rating: null,
        opponent_rating: null,
        can_step: null,
        deck_is_empty: null,
        deck_remain: null
    },

    initialize: function () {
        this.set('settings', new SettingObj());
        this.set('base_url', window.location.origin + '/' + this.get('app_name'));
        this.set('imgs_url', this.get('base_url') + '/img/');
        this.set('imgs_cards_url', this.get('imgs_url') + '/cards/');
        this.set('imgs_simple_cards_url', this.get('imgs_url') + '/simple_cards/');
        this.set('imgs_backs_url', this.get('imgs_url') + '/deck/');

        this.on('change:score', function (self) {
            this.trigger('score_changed', self.changed.score);
        });
        this.on('change:opponent_name', function (self) {
            this.trigger('opponent_name_changed', self.changed.opponent_name);
        });
        this.on('change:my_rating', function (self) {
            this.trigger('my_rating_changed', self.changed.my_rating);
        });
        this.on('change:opponent_rating', function (self) {
            this.trigger('opponent_rating_changed', self.changed.opponent_rating);
        });
        this.on('change:can_step', function (self) {
            this.trigger('can_step', self.changed.can_step);
        });

        this.on('change:deck_is_empty', function (self) {
            if (self.changed.deck_is_empty) {
                var trump = this.getTrump();
                var trump_mapping = this.getProperty('trump_mapping');
                if (trump_mapping && trump_mapping[trump]) {
                    trump = trump_mapping[trump];
                }
                this.trigger('deck_is_empty', trump);
            }
            else
                this.trigger('deck_is_not_empty');

        });
        this.on('change:deck_remain', function (self) {
            this.trigger('update_deck_remain', self.changed.deck_remain);
        });
        this.on('change:my_name', function (self) {
            this.trigger('my_name_changed', self.changed.my_name);
        })
    },

    addCardSound: function () {
    },
    addCardToLayer: function (id, inverted, onload) {
        var card = new Konva.Image({
            width: Settings.cards.width,
            height: Settings.cards.height,
            id: id,
            rotation: 0
        });
        this.get('MyCards').add(card);
        if (inverted) {
            card.setImage(this.get('backImage'));
            card.name('inverted');
        }
        else {
            card.setImage(this.getImageById(id));
            this.get('MyCards').draw();
        }
        return card;
    },
    addToPileSound: function () {
    },
    applyClientSettings: function (settings) {
        this.changeSettings({
            sort: settings.sort,
            card_design: settings.card_design,
            back_image: settings.back_image,
            step: settings.step
//            trump_mapping: settings.trump_mapping
        });
    },
    applyTrumMapping: function () {
        var settings = client.settings;
        this.changeSettings({
            trump_mapping: settings.trump_mapping
        });
    },
    destroyLayer: function (layer) {
        if (this.get(layer)) {
            this.get(layer).destroy();
        }
    },
    endThrow: function () {
        App.get('human').unBindCards();
        App.get('human').bindCards();
        var cards = App.get('table').getCardsForThrow();
        if (cards) {
            App.get('table').clearCardsForThrow();
        }
        setTimeout(function () {
            this.trigger('getCards');
        }.bind(this), 1500);
        this.trigger('endThrow', cards);
    },
    end: function () {
        this.trigger('end_game');
    },
    humanTakeCards: function (threw, allow_throw) {
        this.trigger('human_take_cards');
        if (this.get('game_with_comp') && this.get('history') && !this.get('without_animation') && !this.get('view_only')) {
//        App.game_with_comp.update_history();
        }
        if (threw) {
            this.trigger('threw');
        }
        this.get('human').setCanStep(false);
        var cards = this.get('table').getCards(true);
        this.get('human').takeCardsFromTable(cards, function () {
            if (!this.get('game_with_comp')) {
                this.safeTimeOutAction(1000, function () {
                    this.trigger('takeCards', {
                        cards: cards,
                        through_throw: threw,
                        allow_throw: allow_throw !== false
                    });
                }.bind(this));
            }
            else {
                this.get('game_with_comp').addCards(true, function () {
//                    this.trigger('update_deck_remain');
                }.bind(this));
                if (!this.get('view_only')) {
                    this.safeTimeOutAction(800, function () {
                        this.get('opponent').step();
                    }.bind(this));
                }
            }
        }.bind(this));
    },
    changeProperty: function (setting) {
        var value = setting.value;
        if (setting.property == 'trump_mapping') {
            if (!this.getTrump())
                return false;
            if (setting.value == 'without' || setting.value == this.getTrump())
                value = null;
            else {
                value = {};
                value[this.getTrump()] = setting.value;
                value[setting.value] = this.getTrump();
            }
        }
        var settingObj = this.get('settings');
        settingObj.set(setting.property, value, {validate: true});
    },
    changeSettings: function (settings, apply) {
        for (var i in settings) {
            var property = {
                property: i,
                value: settings[i]
            };
            this.changeProperty(property, apply);
        }
    },
    changeBackImage: function () {
        var BackImage = new Image();
        BackImage.src = this.getBackImgUrl();
        BackImage.onload = function () {
            this.renderCardsByClassName('inverted', BackImage);
            this.renderDeck(true);
        }.bind(this);
    },
    clear: function () {
        this.get('stage').destroy();
    },
    clearCardsLayer: function () {
        this.get('MyCards').destroy();
        this.set('MyCards', new Konva.Layer());
//        this.MyCards = new Konva.Layer();
        this.get('stage').add(this.get('MyCards'));
        if (this.get('TakenCardsLayer'))
            this.get('TakenCardsLayer').destroy();
        if (this.get('lastPileLayer'))
            this.get('lastPileLayer').destroy();
        this.get('stage').draw();
    },

    deckIsEmpty: function () {
        return this.get('game_with_comp') ? this.get('game_with_comp').deckIsEmpty() : this.get('deck_is_empty');
    },
    destroyKonvaById: function (id) {
        this.get('stage').findOne('#' + id).destroy();
        this.get('stage').draw();
    },
    destroyStage: function () {
        if (this.get('stage'))
            this.get('stage').destroy();
    },
    draw: function () {
        this.trigger('draw');
    },
    getDeckCoords: function () {
        return {
            y: this.get('game_area').height / 2 - this.get('card_height') / 2,
            x: 10
        };
    },
    getMyCardsCoords: function () {
        return {
            y: this.get('game_area').height - this.get('card_height') - 70,
            x: 170
        }
    },

    getOpponentCoords: function () {
        return {
            y: 70
        }
    },
    getPileCoords: function () {
        return {
            x: this.get('game_area').width - this.get('card_width') - 40,
            y: 220
        }
    },
    getImgUrlByCardId: function (card_id) {
        if (card_id[2] && card_id[2] > 0) {
            switch (+card_id[2]) {
                case 1:
                    card_id = card_id.slice(0, 1) + 'j';
                    break;
                case 2:
                    card_id = card_id.slice(0, 1) + 'q';
                    break;
                case 3:
                    card_id = card_id.slice(0, 1) + 'k';
                    break;
                case 4:
                    card_id = card_id.slice(0, 1) + '1';
            }
        }
        var url;
        switch (this.get('settings').get('card_design')) {
            case 'base':
                url = this.get('imgs_cards_url');
                break;
            case 'simple':
                url = this.get('imgs_simple_cards_url');
                break;
            default :
                url = this.get('imgs_cards_url');
        }
        return url + card_id + '.png';
    },
    getImageById: function (id) {
        var suit = id[0];
        var trump_mapping = this.getProperty('trump_mapping');
        if (trump_mapping && trump_mapping[suit]) {
            id = trump_mapping[suit] + id.slice(1);
        }
        return this.get('images')[id];
    },
    getBackImgUrl: function () {
        var image = this.getProperty('back_image');
        return this.get('imgs_backs_url') + image + '.png';
    },
    getMinCardValue: function () {
        var value;
        switch (this.get('mode_cards_count')) {
            case 36:
                value = 6;
                break;
            case 52:
                value = 2;
                break;
        }
        return value;
    },
    getTrump: function () {
        return this.get('trump');
    },
    getTrumpValue: function () {
        return this.get('trump_val');
    },
    getSettings: function () {
        return this.get('settings');
    },
    getProperty: function (property) {
        return this.get('settings').get(property);
    },
//    hideTrumpValueOnDeck: function () {
//    },
    initStage: function () {
        var area = this.get('game_area');
        this.set('stage', new Konva.Stage({
            container: 'konva_container',
            width: area.width,
            height: area.height
        }));
//        this.stage = new Konva.Stage({
//            container: 'konva_container',
//            width: area.width,
//            height: area.height
//        });
    },
    initGameStartTime: function () {
        this.set('new_game_started', Date.now());
//        this.new_game_started = Date.now();
    },
    liftPossibleCards: function (without_hiding, cards) {
        if (!cards)
            cards = App.get('human').getAllPossibleCardsForBeat();
        if (!cards.length)
            return false;
        for (var i in cards) {
            var id = cards[i];
            var card = App.get('stage').findOne('#' + id);

            var tween = new Konva.Tween({
                node: card,
                duration: 0.3,
                y: App.get('human').getCardsCoords().y - 15,
                onFinish: function () {
                    if (without_hiding)
                        return false;
                    App.safeTimeOutAction(3000, function () {
                        App.get('human').renderCards();
                    });
                }
            });
            tween.play();
        }
    },

    loadImages: function (onstep, onload) {
        var begin = 2, end = 14;
        var count = 0;
        for (var i = begin; i <= end; i++) {
            for (var j in this.get('sequence')) {
                var id = this.get('sequence')[j] + i;
                this.loadImageByID(id,
                    function (id, image) {
                        this.get('images')[id] = image;
                        count++;
                        var percent = count / this.get('MAX_COUNT_CARDS');
                        if (onstep)
                            onstep(percent);
                        if (count == this.get('MAX_COUNT_CARDS')) {
                            if (onload) {
                                onload();
                            }
                        }
                    }.bind(this));
            }
        }
    },

    loadImageByID: function (id, onload) {
        var CurrentCard = new Image();
        CurrentCard.src = this.getImgUrlByCardId(id);
        CurrentCard.onload = function () {
            if (onload)
                onload(id, CurrentCard);
        };
    },
    loose: function () {
        this.trigger('loose');
    },
    putToPile: function () {
        if (!this.get('human').canStep())
            return false;

        if (this.get('table').getCards()) {
            if (this.get('table').getCardForBeat())
                return false;
            this.get('table').addToPile();

            if (!this.get('game_with_comp')) {
                this.trigger('human:addToPile');
            }
            else {
                this.get('game_with_comp').history.disableMoves();
                this.get('game_with_comp').addCards(true, function () {
//                    this.trigger('update_deck_remain');
                }.bind(this));
            }
            this.get('human').setCanStep(false);
            if (this.get('game_with_comp') && !this.get('view_only')) {
                this.safeTimeOutAction(800, function () {
                    this.get('opponent').step();
                }.bind(this));
            }
        }
        return false;
    },
    renderDeck: function (if_not_empty) {
        if (this.get('Deck')) this.get('Deck').destroy();

        if (this.get('game_with_comp') && if_not_empty &&
            (this.deckIsEmpty() || this.get('game_with_comp').onlyTrumpRemain())) {
            return false;
        }
        this.set('Deck', new Konva.Layer());
        this.get('stage').add(this.get('Deck'));

        var DeckImage = new Image();
        DeckImage.src = this.getBackImgUrl();

        DeckImage.onload = function () {
            var Deck = new Konva.Image({
                x: this.getDeckCoords().x,
                y: this.getDeckCoords().y,
                image: DeckImage,
                width: this.get('card_width'),
                height: this.get('card_height'),
                id: 'deck'
            });
            var DeckAdd = new Konva.Image({
                x: this.getDeckCoords().x + 2,
                y: this.getDeckCoords().y + 2,
                image: DeckImage,
                width: this.get('card_width'),
                height: this.get('card_height'),
                id: 'deck_add'
            });
            this.get('Deck').add(Deck);
            this.get('Deck').add(DeckAdd);
            this.get('Deck').setZIndex(99);
            this.get('Deck').draw();
            this.set('backImage', DeckImage);
        }.bind(this);
    },
    renderTrump: function () {
        var trump_val = this.getTrumpValue();
        var card = this.get('stage').findOne('#' + trump_val);
        if (this.deckIsEmpty()) {
            if (card) {
                card.remove();
                this.get('MyCards').add(card);
            }
            this.set('deck_is_empty', true);
            var trump = this.getTrump();
            var trump_mapping = this.getProperty('trump_mapping');
            if (trump_mapping && trump_mapping[trump]) {
                trump = trump_mapping[trump];
            }
            this.trigger('show_trump', trump);
            return false;
        }
        else {
            this.set('deck_is_empty', false);
//            this.trigger('deck_is_not_empty');
        }

        if (!card) {
            card = new Konva.Image({
                x: 140,
                y: this.getDeckCoords().y + 15,
                width: this.get('card_width'),
                height: this.get('card_height'),
                id: trump_val,
                rotation: 90
            });
            this.get('MyCards').add(card);
            this.get('Trump').add(card);
            this.get('stage').add(this.get('Trump'));
            this.get('Trump').moveDown();
            this.get('stage').draw();
        }
        else {
            card.setX(140);
            card.setRotation(90);
            card.setY(this.getDeckCoords().y + 15);
            this.get('Trump').add(card);
            this.get('stage').draw();
        }
        card.setImage(this.getImageById(trump_val));
        this.get('stage').draw();
    },
    renderTooltip: function (settings) {
        if (!this.get('tooltipLayer'))
            this.set('tooltipLayer', new Konva.Layer());
        var tooltip = new Konva.Label(settings.tooltip);
        tooltip.add(new Konva.Tag(settings.tag));
        tooltip.add(new Konva.Text(settings.text));
        this.get('tooltipLayer').add(tooltip);
        this.get('stage').add(this.get('tooltipLayer'));
        this.get('stage').draw();
    },
    renderKonvaTimer: function (percent, opponent, config) {
        if (!this.get('TimerLayer')) {
            this.set('TimerLayer', new Konva.Layer());
            this.get('stage').add(this.get('TimerLayer'));
        }
        var id = config.id;
        var y;
        if (config.vertical)
            y = opponent ? config.opponent.y : config.my.y;
        else
            y = config.y;
        if (config.vertical)
            var changed_y = y + config.height - (config.height * percent);
        var height = config.vertical ? config.height * percent : config.height;
        var width = config.horizontal ? config.width * percent : config.width;
        var rect;
        rect = this.get('stage').findOne('#' + id);
        if (!rect) {
            rect = new Konva.Rect({
                x: config.x,
                y: config.vertical ? changed_y : y,
                width: width,
                height: height,
                fill: config.color,
                id: id
            });
            this.get('TimerLayer').add(rect);
        }
        else {
            rect.height(height);
            rect.width(width);
            if (config.vertical)
                rect.setY(changed_y);
            if (percent < config.ending_soon) {
                rect.fill(config.color_ending_soon);
            }
            else {
                rect.fill(config.color);
            }
        }
        this.get('stage').draw();
    },
    renderFromHistory: function (history) {
        this.clearCardsLayer();
        this.initGameStartTime();
        this.set('opponent', new Computer(Settings.opponent));
        this.get('human').setCards(history.human_cards);
        this.get('opponent').setCards(history.opponent_cards);
        this.get('table').setState(history.table_state);
        this.get('game_with_comp').setDeck(history.deck);

        this.renderDeck(true);
        this.set('deck_remain', this.get('game_with_comp').remainsInDeck());
        this.renderTrump();

        this.get('table').render();

//        this.trigger('update_deck_remain');

        this.get('human').renderCards();
        this.get('opponent').renderCards();
        this.set('without_update_history', true);
        this.get('human').setCanStep(true);
        this.set('without_update_history', false);
        this.trigger('renderFromHistory',
            history.table_state.human_attack,
            history.table_state.cards.length
        );
    },
    renderCardsByClassName: function (name, image) {
        var cards = this.get('stage').find('.' + name);
        for (var i = 0; i < cards.length; i++) {
            cards[i].setImage(image);
            cards[i].height(Settings.cards.height);
            cards[i].width(Settings.cards.width);
        }
        this.get('stage').draw();
    },

    reset: function () {
        this.destroyStage();
        this.initStage();
        this.set({
            empty_deck: false,
            view_only: false,
            history: null
        });
        this.renderTrump.trump = null;

        if (this.get('MyCards')) {
            this.get('MyCards').destroy();
        }
        if (this.get('opponent'))
            this.get('opponent').destroy();
        if (this.get('webManager'))
            this.get('webManager').destroy();
        this.set(
            {
                MyCards: new Konva.Layer(),
                Trump: new Konva.Layer(),
                Throw: new Konva.Layer(),
                PossibleCards: new Konva.Layer(),
                TimerLayer: new Konva.Layer(),
                table: new Table(),
                human: null,
                score: null,
                my_name: null,
                opponent_name: null,
                my_rating: null,
                opponent_rating: null,
                can_step: null,
                deck_is_empty: null
            }
        );
        this.get('stage').add(this.get('MyCards'));
        this.get('stage').add(this.get('Throw'));
        this.get('stage').add(this.get('TimerLayer'));
        this.renderDeck();
    },

    setGameArea: function (params) {
        this.get('game_area').height = params.height;
        this.get('game_area').width = params.width;
    },
    setTrump: function (trump) {
        this.set({
            trump: trump[0],
            trump_val: trump
        });
    },
    safeTimeOutAction: function (time, fn) {
        var timestamp = this.get('new_game_started');
        setTimeout(function () {
            if (timestamp != this.get('new_game_started')) {
                return;
            }
            else
                fn();
        }.bind(this), time);
    },
    setMode: function (mode) {
        switch (mode) {
            case 'default':
                this.set('mode_cards_count', 36);
//                this.mode_cards_count = 36;
                break;
            case 'deck_52':
                this.set('mode_cards_count', 52);
//                this.mode_cards_count = 52;
                break;
        }
    },
    setProperty: function (property, value) {
        this.get('settings').set(property, value);
    },
    start: function (with_comp, onStart) {
        var old_game = this.get('new_game_started');
        if (Date.now() - old_game < 1000)
            return false;
        this.initGameStartTime();

        this.trigger('before_start');
        this.reset();
        this.set('human', new Human(Settings.human));

        if (with_comp) {
            this.set('game_with_comp', new GameWithComputer());
            this.trigger('play_with_comp');

            var lastCard = this.get('game_with_comp').getLastCard();
            this.setTrump(lastCard);
            this.applyTrumMapping();
            this.set('opponent', new Computer(Settings.opponent));
            this.renderTrump();

            this.get('game_with_comp').history.disablePrev();
            this.get('game_with_comp').history.disableNext();

            this.get('game_with_comp').addCards(true, function () {
//                this.trigger('update_deck_remain');
                var comp_step_first = this.get('game_with_comp').ifComputerStepFirst();
                this.trigger('comp_step_first', comp_step_first);
                this.get('human').setCanStep(!comp_step_first);
                if (comp_step_first) {
                    this.safeTimeOutAction(1500, function () {
                        this.get('opponent').step();
                    }.bind(this));
                }
            }.bind(this));
        }
        else {
            this.set('webManager', new WebManager());
//            var webManager = new WebManager();
            this.trigger('play_with_opponent');
            this.set('game_with_comp', null);

            this.set('opponent', new Opponent(Settings.opponent));
        }
        if (onStart) {
            onStart();
        }
        this.trigger('after:start');
    },
    Throw: function (obj) {
        this.trigger('human:throw', obj);
    },
    ThrowTurn: function(obj){
        this.trigger('human:throw_turn', obj);
    },
    turnSound: function () {
    },
    updateCardImages: function (cards, onload) {
//        this.loadImages(
//            function (percent) {
//                loadTextShow();
//                this.renderKonvaTimer(percent, false, Settings.loader);
//            },
//            function () {
//                loadTextHide();
        for (var i in cards) {
            var id = cards[i];
            var card = this.get('stage').findOne('#' + id);
            this.updateCardImage(card, id);
        }
        if (onload) {
            onload();
        }
//            }.bind(this));
    },
    updateCardImage: function (card, id) {
        console.log(card);
        if (card) {
            card.setImage(this.getImageById(id));
            this.get('stage').draw();
        }
    },
    win: function () {
        this.trigger('win');
    }

});