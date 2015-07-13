var SettingObj = Backbone.Model.extend({
    defaults: {
        back_image: 'back',
        card_design: 'base',
        sort: null,
        trump_mapping: {},
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
            if (App.get('human')) {
                App.get('human').updateCardImages(function () {
                    App.renderTrump();
                    if (App.get('table').getCards())
                        App.get('table').render();
                });
            }
        });
        this.on('change:sort', function () {
            if (App.get('human')) {
                App.get('human').renderCards();
            }
        });
        this.on('change:trump_mapping', function (self) {
            if (!App.getTrump() || !App.get('opponent'))
                return;
            var value = self.changed.trump_mapping;
            if (value == '') return false;

            if (value == 'without' || value == App.getTrump()) {
                this.set('trump_mapping', '');
            }
            else {
                var trump_mapping = {};
                trump_mapping[App.getTrump()] = value;
                trump_mapping[value] = App.getTrump();
                this.set('trump_mapping', trump_mapping, {silent: true});
//                this.settings.trump_mapping = value;
            }
            if (App.get('human')) {
                App.get('human').updateCardImages();
                App.renderTrump();
                App.get('table').updateCardImages();
                App.get('table').renderLastPileIfVisible();
                App.get('opponent').renderLastTakedCardsIfVisible();
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
        app_name: 'fool_backbone',
        players: {},
        human: null,
        opponent: null,
        game_area: {},
        card_height: 96,
        card_width: 71,
        game_with_comp: false,
        sequence: ['d', 'c', 'h', 's'],
        wait_when_can_throw: 3000,
        onStart: null,
//        onTakeCards: null,
        history: null,
        view_only: false,
        without_animation: false,
        without_update_history: false,
        settings: new SettingObj(),
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
        can_step: null
    },

    initialize: function () {
        this.set('base_url', window.location.origin + '/' + this.get('app_name'));
        this.set('imgs_url', this.get('base_url') + '/img/');
        this.set('imgs_cards_url', this.get('imgs_url') + '/cards/');
        this.set('imgs_simple_cards_url', this.get('imgs_url') + '/simple_cards/');
        this.set('imgs_backs_url', this.get('imgs_url') + '/deck/');

        this.on('change:score', function (self) {
            this.trigger('score_changed', self.changed.score);
        });
//        this.on('change:my_name', function () {
//            this.trigger('my_name_changed');
//        });
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
    },

    addCardSound: function () {
    },
    addCardToLayer: function (id, inverted, onload) {
        var card = new Konva.Image({
            width: this.card_width,
            height: this.card_height,
            id: id,
            rotation: 0
        });
        this.get('MyCards').add(card);
        if (inverted) {
            card.setImage(this.get('backImage'));
//            card.strokeEnabled(true);
//            card.stroke('white');
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
    applyClientSettings: function () {
        var settings = client.settings;

        App.changeSettings({
            sort: settings.sort,
            card_design: settings.card_design,
            trump_mapping: settings.trump_mapping
        });
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
        App.get('human').unBindCards();
    },
    humanTakeCards: function (threw, allow_throw) {
        this.trigger('human_take_cards');
        if (this.get('game_with_comp') && this.get('history') && !this.get('without_animation') && !this.get('view_only')) {
//        App.game_with_comp.update_history();
        }
        if (threw) {
            this.trigger('threw');
//            $('#threw').fadeIn('fast');
//            $('#threw').fadeOut(2000);
        }
        this.get('human').setCanStep(false);
        var cards = this.get('table').getCards(true);
        var timestamp = this.get('new_game_started');
        this.get('human').takeCardsFromTable(cards, function () {
            if (!this.get('game_with_comp')) {
                setTimeout(function () {
                    this.safeTimeOutAction(timestamp, function () {
                        client.gameManager.sendTurn(
                            {
                                type: 'takeCards',
                                cards: cards,
                                through_throw: threw,
                                allow_throw: allow_throw !== false
                            });
                    }.bind(this));
                }.bind(this), 1000);
            }
            else {
                this.get('game_with_comp').addCards(true, function () {
                    this.trigger('update_deck_remain');
                }.bind(this));
                if (!this.get('view_only')) {
                    setTimeout(function () {
                        this.safeTimeOutAction(timestamp, function () {
                            this.get('opponent').step();
                        }.bind(this));
                    }.bind(this), 800);
                }
            }
        }.bind(this));
    },
    changeProperty: function (setting, apply) {
        var settingObj = this.get('settings');
        var human = this.get('human');
        var table = this.get('table');
        var property = {};
        property[setting.property] = setting.value;
        settingObj.set(property);
//        switch (setting.property) {
//            case 'sort':
//                settingObj.set('sort', setting.value);
//                if (apply && human)
//                    human.renderCards();
//                break;
//            case 'card_design':
//                settingObj.set('card_design', setting.value);
//                if (apply && human) {
//                    human.updateCardImages(function () {
//                        this.renderTrump();
//                        if (table.getCards())
//                            table.render();
//                    });
//
//                }
//                break;
//            case 'back_image':
//                settingObj.set('sort', setting.value);
//                this.settings.back_image = setting.value;
//                if (apply)
//                    App.changeBackImage();
//                break;
//            case 'step':
//                this.settings.step = setting.value;
//                if (apply && App.human) {
//                    App.human.unBindCards();
//                    App.human.bindCards();
//                }
//                break;
//            case 'trump_mapping':
//                if (setting.value == 'without' || setting.value == App.getTrump()) {
//                    this.settings.trump_mapping = '';
//                }
//                else {
//                    var value = {};
//                    value[App.getTrump()] = setting.value;
//                    value[setting.value] = App.getTrump();
//                    this.settings.trump_mapping = value;
//                }
//                if (apply && App.human) {
//                    App.human.updateCardImages();
//                    App.renderTrump();
//                    App.table.updateCardImages();
//                    App.table.renderLastPileIfVisible();
//                    App.opponent.renderLastTakedCardsIfVisible();
//                }
//                break;
//        }
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
        if (this.get('TackedCardsLayer'))
            this.get('TackedCardsLayer').destroy();
        if (this.get('lastPileLayer'))
            this.get('lastPileLayer').destroy();
        this.get('stage').draw();
    },

    deckIsEmpty: function () {
        return this.get('game_with_comp') ? this.get('game_with_comp').deckIsEmpty() : this.get('empty_deck');
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
        var suit_mapped = this.get('settings').get('trump_mapping')[suit];
        if (suit_mapped) {
            id = suit_mapped + id.slice(1);
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
        var timestamp = App.get('new_game_started');
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
                y: App.getMyCardsCoords().y - 15,
                onFinish: function () {
                    if (without_hiding)
                        return false;
                    setTimeout(function () {
                        App.safeTimeOutAction(timestamp, function () {
                            App.get('human').renderCards();
                        });
                    }, 3000);
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
    putToPile: function () {
        if (!this.get('human').canStep())
            return false;

        if (this.get('table').getCards()) {
            if (this.get('table').getCardForBeat())
                return false;
            this.get('table').addToPile();

            if (!this.get('game_with_comp')) {
                client.gameManager.sendTurn({type: 'addToPile'});
                client.gameManager.sendEvent('event', {data: 'getCards'});
            }
            else {
                this.get('game_with_comp').history.disableMoves();
                this.get('game_with_comp').addCards(true, function () {
                    this.trigger('update_deck_remain');
                }.bind(this));
            }
            this.get('human').setCanStep(false);
            if (this.get('game_with_comp') && !this.get('view_only')) {
                var timestamp = this.get('new_game_started');
                setTimeout(function () {
                    this.safeTimeOutAction(timestamp, function () {
                        this.get('opponent').step();
                    }.bind(this));
                }.bind(this), 800);
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
//        this.Deck = new Konva.Layer();
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
//            App.get('backImage') = DeckImage;
        }.bind(this);
    },
    renderTrump: function () {
        var trump = this.getTrumpValue();
        var card = this.get('stage').findOne('#' + trump);
        if (this.deckIsEmpty()) {
            if (card) {
                card.remove();
                this.get('MyCards').add(card);
            }
            this.trigger('deck_is_empty');
//            this.get('view').showTrumpValueOnDeck();
            return false;
        }
        else
            this.trigger('deck_is_not_empty');
//            this.hideTrumpValueOnDeck();

        if (!card) {
            card = new Konva.Image({
                x: 140,
                y: this.getDeckCoords().y + 15,
                width: this.get('card_width'),
                height: this.get('card_height'),
                id: trump,
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
        card.setImage(this.getImageById(trump));
        this.get('stage').draw();
    },
    renderKonvaTimer: function (percent, opponent, config) {
        if (!this.get('TimerLayer')) {
            this.set('TimerLayer', new Konva.Layer());
//            this.get('TimerLayer') = new Konva.Layer();
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
        this.set('opponent', new Computer());
//        this.opponent = new Computer();
        this.get('human').setCards(history.human_cards);
        this.get('opponent').setCards(history.opponent_cards);
        this.get('table').setState(history.table_state);
        this.get('game_with_comp').setDeck(history.deck);

        this.renderDeck(true);
        this.renderTrump();

        this.get('table').render();

        this.trigger('update_deck_remain');

        this.get('human').renderCards();
        this.get('opponent').renderCards();
        this.set('without_update_history', true);
//        this.get('without_update_history' = true;
        this.get('human').setCanStep(true);
        this.set('without_update_history', false);
//        this.get('without_update_history = false;

    },
    renderCardsByClassName: function (name, image) {
        var cards = this.get('stage').find('.' + name);
        for (var i = 0; i < cards.length; i++) {
            cards[i].setImage(image);
        }
        this.get('stage').draw();
    },

    reset: function () {
        this.destroyStage();
        this.initStage();

//        if (typeof this.get('onStart') == 'function')
//            this.onStart();
        this.set({
            empty_deck: false,
            view_only: false,
            history: null
        });
//        this.empty_deck = false;
//        this.view_only = false;
//        this.history = null;
        this.renderTrump.trump = null;

        if (this.get('MyCards')) {
            this.get('MyCards').destroy();
        }
        this.set('MyCards', new Konva.Layer());
//        this.MyCards = new Konva.Layer();
        this.set(
            {
                Trump: new Konva.Layer(),
                Throw: new Konva.Layer(),
                PossibleCards: new Konva.Layer(),
                TimerLayer: new Konva.Layer()
            }
        );
//        this.Trump = new Konva.Layer();
//        this.Throw = new Konva.Layer();
//        this.PossibleCards = new Konva.Layer();
//        this.TimerLayer = new Konva.Layer();
        this.get('stage').add(this.get('MyCards'));
        this.get('stage').add(this.get('Throw'));
        this.get('stage').add(this.get('TimerLayer'));
        this.renderDeck();

//        this.table = new Table();
//        this.human = new Human(player.defaults);
//        this.opponent = null;

//        var player = new Player();
        this.set({
            table: new Table(),
            human: new Human(Settings.player),
            opponent: null
        });
    },

    setGameArea: function (params) {
        this.get('game_area').height = params.height;
        this.get('game_area').width = params.width;
//        this.game_area.height = params.height;
//        this.game_area.width = params.width;
    },
    setTrump: function (trump) {
        this.set({
            trump: trump[0],
            trump_val: trump
        });
//        this.trump = trump[0];
//        this.trump_val = trump;
    },
    safeTimeOutAction: function (timestamp, fn) {
        if (timestamp != this.get('new_game_started')) {
            return;
        }
        else
            fn();
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
//    setProperty: function (property) {
//        var settings = this.get('settings');
//        settings.get(_.keys(property).pop()).set()
//    },
//    showTrumpValueOnDeck: function () {
//    },
    start: function (with_comp, onStart) {
//        var self = this;
        this.trigger('before_start');
        this.reset();
        this.applyClientSettings();
        this.loadImages(
            function (percent) {
                loadTextShow();
//                this.renderKonvaTimer(percent, false, Settings.loader);
            }.bind(this),
            function () {
                loadTextHide();
//                this.destroyKonvaById(Settings.loader.id);
                this.reset();
                this.initGameStartTime();

                if (with_comp) {
                    this.set('game_with_comp', new GameWithComputer());
                    this.trigger('play_with_comp');

//                    self.game_with_comp = new GameWithComputer();
//                    this.initializeHistoryStepButtons();
                    var lastCard = this.get('game_with_comp').getLastCard();
                    this.setTrump(lastCard);
                    this.applyClientSettings();
//                    var player = new Player();
                    this.set('opponent', new Computer(Settings.player));
//                    self.opponent = new Computer(player.defaults);
                    this.renderTrump();

                    var timestamp = this.get('new_game_started');

                    this.get('game_with_comp').history.disablePrev();
                    this.get('game_with_comp').history.disableNext();

                    this.get('game_with_comp').addCards(true, function () {
                        this.trigger('update_deck_remain');
                        var comp_step_first = this.get('game_with_comp').ifComputerStepFirst();
                        this.trigger('comp_step_first', comp_step_first);
                        this.get('human').setCanStep(!comp_step_first);
                        if (comp_step_first) {
                            setTimeout(function () {
                                this.safeTimeOutAction(timestamp, function () {
                                    console.log('comp step');
                                    this.get('opponent').step();
                                }.bind(this));
                            }.bind(this), 1500);
                        }
                    }.bind(this));
                }
                else {
                    this.trigger('play_with_opponent');
                    this.applyClientSettings();
                    this.set('game_with_comp', null);

                    this.set('opponent', new Opponent(Settings.player));
//                    this.game_with_comp = null;
//                    var player = new Player();
//                    this.opponent = new Opponent(player.defaults);
                    if (this.get('awaiting_opponent_cards')) {
                        this.get('opponent').addCards(this.get('awaiting_opponent_cards'));
                        this.set('awaiting_opponent_cards', []);
//                        this.awaiting_opponent_cards = [];
                    }
                }
                if (onStart) {
                    onStart();
                }
                this.trigger('after_start');
            }.bind(this)
        );
    },
    turnSound: function () {
    },
    updateCardImages: function (cards, onload) {
        this.loadImages(
            function (percent) {
                loadTextShow();
//                this.renderKonvaTimer(percent, false, Settings.loader);
            },
            function () {
                loadTextHide();
                for (var i in cards) {
                    var id = cards[i];
                    var card = this.get('stage').findOne('#' + id);
                    this.updateCardImage(card, id);
                }
                if (onload) {
                    onload();
                }
            }.bind(this));
    },
    updateCardImage: function (card, id) {
        if (card) {
            card.setImage(this.getImageById(id));
            this.get('stage').draw();
        }
    },
    win: function () {
    }

});