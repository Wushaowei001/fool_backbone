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
        history: [],
        view_only: false,
        without_animation: false,
        without_update_history: false,
        settings: null,
        new_game_started: false,
        mode_cards_count: 'default',
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
        deck_remain: null,
        spectate: null,
        deferred_actions: [],
        in_round: false
    },

    initialize: function () {
        this.set('settings', new SettingObj());
        this.set('base_url', window.location.origin + '/' + this.get('app_name'));
        this.set('imgs_url', this.get('base_url') + '/img/');
        this.set('imgs_cards_url', this.get('imgs_url') + '/cards/');
        this.set('imgs_simple_cards_url', this.get('imgs_url') + '/simple_cards/');
        this.set('imgs_sprite', this.get('imgs_url') + '/sprites/cards_sprite.png');
        this.set('simple_imgs_sprite', this.get('imgs_url') + '/sprites/simple_cards_sprite.png');
        this.set('imgs_sprite_color', this.get('imgs_url') + '/sprites/simple_cards_sprite_color.png');

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
            if (this.get('can_step') == null)
                return;
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
        });
        this.on('change:spectate', function (self) {
            if (self.changed.spectate)
                this.trigger('join_spectate', self.changed.spectate);
            else {
                this.trigger('leave_spectate');
                this.trigger('change_mode_cards_count', this.get('mode_cards_count'));
            }
        });
        this.on('change:mode_cards_count', function (self) {
            this.trigger('change_mode_cards_count', self.changed.mode_cards_count);
        });
        this.on('change:history', function (self) {
            if (this.get('history')) {
                this.listenTo(this.get('history'), 'data_from_history', function (state) {
                    if (state) {
                        this.clearCardsLayer();
                        this.renderFromState(state, true);
                    }
                    console.log(state);
                }.bind(this));
            }
            else {
                if (Util.countDown.actionInProgress('play_history')) {
                    Util.countDown.stop('play_history');
                }
            }
        });
        this.on('change:game_with_comp', function () {
            if (this.get('game_with_comp') != null) {
                this.trigger('game_with_comp_started');
            }
        });
    },

    addCardSound: function () {
    },
    addCardToLayer: function (attributeObject, inverted, onload) {
        var id = attributeObject.id;
        var card = new Konva.Image({
            width: Config.cards.width,
            height: Config.cards.height,
            id: id,
            rotation: 0
        });

        if (inverted) {
            card.setAttrs({
                image: this.get('backImage'),
                name: 'inverted',
                crop: {x: 0, y: 0, width: 0, height: 0} // important
            });
        }
        else {
            card = this.getImageById(id).clone(attributeObject);
        }
        this.get('MyCards').add(card);
        this.get('MyCards').draw();
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
        if (Util.countDown.actionInProgress('timer_for_throw')) {
            Util.countDown.stop('timer_for_throw');
            return;
        }
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
    canStart: function () {
        var old_game = this.get('new_game_started');
        return (Date.now() - old_game > 1000);
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
        return this.get('deck_remain') == 0 || this.get('deck_is_empty');
//        return this.get('game_with_comp') ? this.get('game_with_comp').deckIsEmpty() : this.get('deck_is_empty');
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
    getPileCoords: function () {
        return {
            x: this.get('game_area').width - this.get('card_width') - 40,
            y: this.get('game_area').height / 2 - this.get('card_height') / 2
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
    getSpriteUrlByType: function (type) {
        var url;
        switch (type) {
            case 'base':
                url = this.get('imgs_sprite');
                break;
            case 'simple':
                url = this.get('simple_imgs_sprite');
                break;
            case 'color':
                url = this.get('imgs_sprite_color');
                break;
            default:
                url = this.get('imgs_sprite');
        }
        return url;
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
            case 'default':
                value = 6;
                break;
            case 'deck_52':
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
    initHistory: function (history) {
        var human = App.get('human');
        var opponent = App.get('opponent');
        var my_name = App.get('my_name');
        var opponent_name = App.get('opponent_name');
        var humanId = App.get('humanId');
        var prefix;

        var history_list = [];
        var table_state = {};
        var deck_remain;
        table_state.human_attack = false;
        var player;

        var pushToHistory = function () {
            if (table_state && table_state.cards_for_throw)
                table_state.cards_for_throw = null;
            var obj = {
                deck_remain: deck_remain,
                human_cards: Util.cloner.clone(human.getCards()),
                opponent_cards: Util.cloner.clone(opponent.getCards()),
                table_state: Util.cloner.clone(table_state)
            };
            history_list.push(obj);
        }.bind(this);

        for (var i in history) {
            if (history[i].event) {
                var event = history[i].event;
                if (event.type == 'addCards') {
                    if (!event.target)
                        continue;
                    var is_opponent = event.target.userId != humanId;

                    if (event.for || (is_opponent && !App.get('not_my_story'))
                        || (!event.cards && !event.opponent_cards))
                        continue;
                    if (event.opponent_cards && App.get('not_my_story'))
                        continue;

                    if (event.cards && event.cards.length && !event.for && !is_opponent) {
                        if (App.get('spectate')) {
                            prefix = human.get('prefix_for_cards');
                            // in spectate case human == Opponent class
                            human.addCards(event.cards.length, prefix, true);
                        }
                        else
                            human.setCards(human.getCards().concat(event.cards));
                    }
                    if (event.opponent_cards && !is_opponent && !App.get('not_my_story')) {
                        opponent.addCards(event.opponent_cards, false, true);
                    }
                    // for not my history
                    if (is_opponent && App.get('not_my_story') && event.cards) {
                        opponent.setCards(opponent.getCards().concat(event.cards));
                    }
                    if (event.cardsRemain || event.cardsRemain === 0)
                        deck_remain = event.cardsRemain;
                }
            }
            if (history[i].turn) {
                var turn = history[i].turn;
                var is_my_turn = history[i].user.userId == humanId;
                table_state = turn.state.table_state;
                table_state.human_attack = is_my_turn ?
                    turn.state.table_state.human_attack : !turn.state.table_state.human_attack;
                player = is_my_turn ? human : opponent;
                prefix = player.get('prefix_for_cards');
                if (turn.turn_type == 'takeCards') {
                    if (App.get('spectate')) {
                        player.addCards(turn.cards.length, prefix, true);
                    }
                    else {
                        if (is_my_turn)
                            human.setCards(human.getCards().concat(turn.cards));
                        else {
                            if (App.get('not_my_story')) {
                                opponent.setCards(opponent.getCards().concat(turn.cards));
                            }
                            else {
                                opponent.addCards(turn.cards.length, false, true);
                            }
                        }
                    }
                    pushToHistory();
                    continue;
                }
                if (turn.turn_type == 'throw') {
                    table_state.cards = [];
                    for (var i in turn.cards) {
                        table_state.cards.push({
                            id: turn.cards[i],
                            over: ''
                        })
                    }
                }
                if (turn.turn_type == 'addToPile') {
                    table_state = {};
                    pushToHistory();
                    continue;
                }
                if (turn.card)
                    player.removeCard(turn.card);
                if (turn.cards) {
                    for (var j in turn.cards) {
                        player.removeCard(turn.cards[j]);
                    }
                }
            }
            pushToHistory();
        }
        this.set('history', new History({list: history_list}));
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
        var begin = Config.cards.min_value, end = Config.cards.max_value;
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
    loadImages2: function (type) {
        console.log(type);
        App.trigger('load_images_start');
        var min = Config.cards.min_value;
        var max = Config.cards.max_value;
        var BigImage = new Image();
        var x = 0, y = 0;
        var width = Config.cards.width;
        var stroke_width = Config.cards.stroke_width;
        var height = Config.cards.height;
        BigImage.src = this.getSpriteUrlByType(type);
        BigImage.onload = function () {
            for (var i = max; i >= min; i--) {
                y = 0;
                for (var j in this.get('sequence')) {
                    var id = this.get('sequence')[j] + i;
                    this.get('images')[id] = new Konva.Image({
                        image: BigImage,
                        width: width,
                        height: height,
                        cropHeight: height,
                        cropWidth: width,
                        cropX: x,
                        cropY: y,
                        stroke: 'black',
                        strokeWidth: stroke_width
                    });
                    y += height;
                }
                x += width;
            }
            App.trigger('load_images_end');
            if (App.get('human')) {
                App.get('human').updateCardImages(function () {
                    App.renderTrump();
                    if (App.get('table').getCards())
                        App.get('table').render();
                });
            }
            App.get('stage').draw();
        }.bind(this);
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

        if (if_not_empty && this.deckIsEmpty()) {
            return false;
        }

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
        var already_on_table = this.get('stage').findOne('#' + trump_val) != undefined;
        if (this.deckIsEmpty()) {
//            if (card) {
//                card.remove();
//                this.get('MyCards').add(card);
//            }
            this.set('deck_is_empty', true);

            var trump = this.getTrump();
            this.get('Trump').destroy();
            var trump_mapping = this.getProperty('trump_mapping');
            if (trump_mapping && trump_mapping[trump]) {
                trump = trump_mapping[trump];
            }
//            this.trigger('show_trump', trump);
            return false;
        }
        else {
            this.set('deck_is_empty', false);
//            this.trigger('deck_is_not_empty');
        }
        var card = this.getImageById(trump_val).clone({
            x: Config.trump.x,
            y: App.getDeckCoords().y + 15,
            id: trump_val,
            rotation: 90
        });
        console.log(card);
        if (!already_on_table) {
//            card = new Konva.Image({
//                x: 136,
//                y: this.getDeckCoords().y + 15,
//                width: this.get('card_width'),
//                height: this.get('card_height'),
//                id: trump_val,
//                rotation: 90
//            });

            this.get('MyCards').add(card);
            this.get('Trump').add(card);
            this.get('stage').add(this.get('Trump'));
            this.get('Trump').moveDown();
            this.get('stage').draw();
        }
        else {
//            card = this.getImageById(trump_val).clone({
//
//            });
//            card.setX(136);
//            card.setRotation(90);
//            card.setY(this.getDeckCoords().y + 15);
            this.get('Trump').add(card);
            this.get('stage').draw();
        }
//        card.setImage(this.getImageById(trump_val));
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
        if (settings.show) {
            setTimeout(function () {
                if (App.get('tooltipLayer')) {
                    App.destroyLayer('tooltipLayer');
                    App.get('stage').draw();
                }
            }, settings.show);
        }
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
        this.get('TimerLayer').batchDraw();
    },
    renderFromInternalHistory: function (history) {
        this.clearCardsLayer();
        this.initGameStartTime();
        this.set('opponent', new Computer(Config.opponent));
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
        this.trigger('renderFromInternalHistory',
            history.table_state.human_attack,
            history.table_state.cards.length
        );
    },
    renderFromHistory: function (history, without_animation) {
        this.initGameStartTime(); // if user play with computer
        this.initHistory(history);
        var lastState = this.get('history').getLastItem();
        this.renderFromState(lastState, without_animation);
    },
    renderFromState: function (state, without_animation) {
        if (state.deck_remain != undefined) {
            App.set('deck_remain', state.deck_remain);
            App.set('deck_is_empty', state.deck_remain == 0);
        }
        if (state.table_state) {
            state.table_state.without_animation = without_animation;
            App.get('table').setState(state.table_state);
        }
        if (state.human_cards) {
            App.get('human').setCards(state.human_cards);
        }
        if (state.opponent_cards) {
            App.get('opponent').setCards(state.opponent_cards);
        }
        App.renderDeck(true);
        App.renderTrump();
        App.get('human').renderCards(without_animation);
        App.get('opponent').renderCards(without_animation);
        App.get('table').render();
    },
    renderCardsByClassName: function (name, image) {
        var cards = this.get('stage').find('.' + name);
        for (var i = 0; i < cards.length; i++) {
            cards[i].setImage(image);
            cards[i].height(Config.cards.height);
            cards[i].width(Config.cards.width);
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
        if (this.get('history'))
            this.get('history').destroy();
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
                deck_is_empty: null,
                deck_remain: null,
                spectate: null,
                deferred_actions: [],
                history: null,
                not_my_story: false,
                game_with_comp: null
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
    setUsersId: function (humanId, opponentId) {
        App.set('humanId', humanId);
        App.set('opponentId', opponentId);
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
    setProperty: function (property, value) {
        this.get('settings').set(property, value);
    },

    start: function (with_comp, onStart) {
        if (!this.canStart())
            return false;
        this.initGameStartTime();

        this.trigger('before_start');
        this.reset();
        this.set('human', new Human(Config.human));

        if (with_comp) {

            this.set('game_with_comp', new GameWithComputer());
            this.trigger('play_with_comp');

            var lastCard = this.get('game_with_comp').getLastCard();
            this.setTrump(lastCard);
            this.applyTrumMapping();
            this.set('opponent', new Computer(Config.opponent));
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

            this.set('opponent', new Opponent(Config.opponent));
        }
        if (onStart) {
            onStart();
        }
        this.trigger('after:start');
        return true;
    },
    startSpectate: function (user1, user2, mode) {
        App.reset();
        this.initGameStartTime();
        this.set('spectate', mode);
        App.set('human', new Opponent(Config.bottom_opponent));
        App.set('opponent', new Opponent(Config.opponent));
        this.setUsersId(user1.userId, user2.userId);
        App.set('my_name', user1.userName);
        App.set('opponent_name', user2.userName);
    },
    Throw: function (obj) {
        this.trigger('human:throw', obj);
    },
    ThrowTurn: function (obj) {
        this.trigger('human:throw_turn', obj);
    },
    turnSound: function () {
    },
    updateCardImages: function (cards, onload) {
//        this.loadImages(
//            function (percent) {
//                loadTextShow();
//                this.renderKonvaTimer(percent, false, Config.loader);
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
        if (card) {
            var clone_card = this.getImageById(id).clone();

            card.setAttrs({
                image: clone_card.getImage(),
                crop: clone_card.crop()
            });
            this.get('stage').draw();
            return card;
        }
    },
    win: function () {
        this.trigger('win');
    }

});