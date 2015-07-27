var AppView = Backbone.View.extend({
    el: '#field',
    events: {
        'click #switch_game a': 'playWithComp',
        'click #take_cards': 'takeCards',
        'click #put_tu_pile': 'putToPile',
        'click #tbNewGame': 'playWithComp',// do not working
        'click #end_throw': 'endThrow'
    },
    initialize: function () {
        this.$myStepText = this.$('#my_step_text');
        this.$opponentStepText = this.$('#opponent_step_text');
        this.$winMessage = this.$('#win_message');
        this.$looseMessage = this.$('#loose_message');
        this.$drawMessage = this.$('#draw_message');
        this.$score = this.$('#score');
        this.$deckRemain = this.$('#deck_remain');
        this.$nothingToBeat = this.$('#nothing_to_beat');
        this.$takeCards = this.$('#take_cards');
        this.$taken = this.$('#taken');
        this.$putToPile = this.$('#put_tu_pile');
        this.$endThrow = this.$('#end_throw');
        this.$nameAndRating = this.$('.name_and_rating');
        this.$opponentName = this.$('#opponent_name');
        this.$myName = this.$('#my_name');
        this.$opponentRating = this.$('#opponent_rating');
        this.$myRating = this.$('#my_rating');
        this.$beaten = this.$('#beaten');
        this.$threw = this.$('#threw');
        this.$opponentTakeCards = this.$('#opponent_take_cards');
        this.$trump = this.$('#trump');
        this.$trumpIcon = this.$('#trump_icon');
        this.$canThrow = this.$('#can_throw');
        this.$switchGame = this.$('#switch_game');
        this.$load_text = this.$('#load_text');


        this.listenTo(App, 'start', this.onStart);
        this.listenTo(App, 'default_screen', this.showDefaultScreen);
        this.listenTo(App, 'comp_step_first', function (first) {
            this.onCompStepFirst(first)
        });
        this.listenTo(App, 'before_start', this.onBeforeStart);
        this.listenTo(App, 'after:start', this.onAfterStart);
//        this.listenTo(App, 'after:login', this.onAfterLogin);
        this.listenTo(App, 'can_take_cards', this.onCanTakeCards);
        this.listenTo(App, 'human_take_cards', this.onTakeCards);
        this.listenTo(App, 'can_put_to_pile', this.onCanPutToPile);
        this.listenTo(App, 'beaten', this.onBeaten);
        this.listenTo(App, 'spectate:beaten', function () {
            this.onBeaten('spectate');
        });
        this.listenTo(App, 'nothing_to_beat', this.onNothingToBeat);
        this.listenTo(App, 'threw', this.onThrew);
        this.listenTo(App, 'spectate:threw', function () {
            this.onThrew('spectate');
        });
        this.listenTo(App, 'spectate:taken', function () {
            this.onTaken('spectate');
        });
        this.listenTo(App, 'end_game', this.onEndGame);
        this.listenTo(App, 'deck_is_not_empty', this.hideTrumpValueOnDeck);
        this.listenTo(App, 'can_throw', this.canThrow);
        this.listenTo(App, 'update_deck_remain', function (obj) {
            this.updateDeckRemains(obj);
        }.bind(this));
        this.listenTo(App, 'play_with_comp', this.onPlayWithComp);
        this.listenTo(App, 'play_with_opponent', this.onPlayWithOpponent);
        this.listenTo(App, 'endThrow', this.onEndThrow);
        this.listenTo(App, 'score_changed', function (score) {
            this.showScore(score)
        });
        this.listenTo(App, 'my_name_changed', function (name) {
            this.changeMyName(name);
        });
        this.listenTo(App, 'opponent_name_changed', function (name) {
            this.showOpponentName(name);
        });
        this.listenTo(App, 'my_rating_changed', function (rating) {
            this.showMyRating(rating);
        });
        this.listenTo(App, 'opponent_rating_changed', function (rating) {
            this.showOpponentRating(rating);
        });
        this.listenTo(App, 'can_step', function (can) {
            if (can)
                this.beforeMyStep();
            else
                this.beforeOpponentStep();
        });
        this.listenTo(App, 'deck_is_empty show_trump', function (trump) {
            this.showTrumpValueOnDeck(trump)
        });
        this.listenTo(App, 'moveBack', this.onMoveBack);
        this.listenTo(App, 'moveForward', this.onMoveForward);
        this.listenTo(App, 'renderFromHistory', function (human_attack, table_not_empty) {
            this.onRenderFromHistory(human_attack, table_not_empty);
        });
        this.listenTo(App, 'table:addToPile', this.onAddToPile);
        this.listenTo(App, 'table:renderLastPile', this.hideTooltips);
        this.listenTo(App, 'renderLastTakenCards', this.hideTooltips);
        this.listenTo(App, 'load_images_start', function () {
            this.blockUI();
        });
        this.listenTo(App, 'load_images_end', function () {
            if (!App.get('human'))
                this.showDefaultScreen();
            this.unBlockUI();
        });
        this.listenTo(App, 'leave_spectate', this.showButtonsForGameWithComp);
        this.listenTo(App, 'join_spectate', this.onSpectate);

        App.setGameArea(
            {
                height: $('#field').height(),
                width: $('#field').width()
            }
        );
    },
    beforeMyStep: function (phrase) {
        console.log('beforeMyStep');
        if (!phrase)
            phrase = Settings.text.attack_phrase;
        this.$myStepText.show().text(phrase);
//        this.$opponentStepText.hide();
        this.hideActionButtons();
    },
    beforeOpponentStep: function () {
        console.log('beforeOpponentStep');
//        this.$opponentStepText.show();
        this.$myStepText.hide();
        this.$takeCards.hide();
        this.$putToPile.hide();
    },
    blockUI: function () {
        var width = $('body').innerWidth();

        $('#gameArea').prepend(
            '<div id="blocker" style="width:' + width + 'px; height:682px; position:fixed; left:0;top: 42px;">' +
                '</div>'
        );
    },
    canThrowMessageHide: function () {
        this.$canThrow.hide();
    },
    canThrowMessageShow: function () {
        this.$canThrow.show();
    },
    canThrow: function () {
        this.canThrowMessageShow();
        this.throwButtonShow();
        this.myStepTextHide();
    },
    changeMyName: function (name) {
        console.log('changeMyName: ' + name);
//        this.$myName.show();
        if (name) {
            this.$myName.text(name);
        }
    },
    endThrow: function () {
        App.endThrow();
    },
    getSettingsTemplate: function () {
        return $('#settings_template').html();
    },
    hideTooltips: function () {
        if (App.get('tooltipLayer')) {
            App.destroyLayer('tooltipLayer');
            App.get('stage').draw();
        }
    },
    hideTrumpValueOnDeck: function () {
        this.$trump.hide();
    },
    hideActionButtons: function () {
        this.$takeCards.hide();
        this.$putToPile.hide();
    },
    hideDefaultScreen: function () {
        this.$switchGame.hide();
    },
    hideOpponentName: function () {
        this.$opponentName.hide();
    },
    hideScore: function () {
        this.$score.find('span').text('');
        this.$score.hide();
    },
    initializeHistoryStepButtons: function () {
        App.get('game_with_comp').history.disableNext = function () {
            console.log('disableNext ');

            $('#tbNext').css('opacity', '0.6').
                addClass('disable');
        };

        App.get('game_with_comp').history.disablePrev = function () {
            console.log('disablePrev ');

            $('#tbPrev').css('opacity', '0.6').
                addClass('disable');
        };

        App.get('game_with_comp').history.enableNext = function () {
            $('#tbNext').css('opacity', '1').
                removeClass('disable');
        };

        App.get('game_with_comp').history.enablePrev = function () {
            $('#tbPrev').css('opacity', '1').
                removeClass('disable');
        };
    },
    onAfterStart: function () {
        this.listenTo(App.get('human'), 'before_my_step', this.beforeMyStep);
        this.listenTo(App.get('human'), 'before_opponent_step', this.beforeOpponentStep);
        this.listenTo(App.get('human'), 'win', this.onWinHuman);
        this.listenTo(App.get('opponent'), 'win', this.onWinComputer);
        this.listenTo(App.get('opponent'), 'draw', this.onDraw);
        this.listenTo(App.get('opponent'), 'take_cards', this.onOpponentTakeCards);
    },
//    onAfterLogin: function () {
//        this.showDefaultScreen();
//    },
    onBeaten: function (css_class) {
        if (css_class)
            this.$beaten.addClass(css_class);
        this.$beaten.fadeIn(300);
        this.$beaten.fadeOut(300, function () {
            if (css_class)
                this.$beaten.removeClass(css_class);
        }.bind(this));
    },
    onEndGame: function () {
        $('#my_step_text').hide();
//        $('#opponent_step_text').hide();
        $('#take_cards').hide();
        $('#put_tu_pile').hide();
        $('#timer').hide();
        $('#deck_remain').hide();
        $('#end_throw').hide();
        $('#can_throw').hide();
        this.hideActionButtons();
    },
    onEndThrow: function () {
        this.throwButtonHide();
        this.canThrowMessageHide();
        this.beforeMyStep(Settings.text.attack_phrase);
    },
    myStepTextHide: function () {
        this.$myStepText.hide();
    },
    onAddToPile: function () {
        if (!localStorage.getItem('tooltip_for_pile_showed')) {
            App.renderTooltip(Settings.tooltip.for_pile);
            localStorage.setItem('tooltip_for_pile_showed', true);
        }
    },
    onStart: function () {
    },
    onBeforeStart: function () {
        console.log('onBeforeStart');
        this.$myStepText.hide();
//        this.$opponentStepText.hide();

        this.$takeCards.hide();
        this.$putToPile.hide();

        this.$winMessage.hide();
        this.$looseMessage.hide();
        this.$drawMessage.hide();
//        $('#timer').hide();
        $('#repControls').hide();
        $('#trump #trump_icon').removeClass('s d h c');
        this.$trump.hide();
        $('#gameArea .real_game .cpButton').each(function () {
            if (this.id != 'tbLeave')
                $(this).removeClass('disable');
        });
        this.$deckRemain.show();
        $('#deck_remain .count').text('');
        this.$switchGame.hide();
        this.$endThrow.hide();
        this.$canThrow.hide();

        this.$nameAndRating.show();
//        this.$myName.text(client.getPlayer().userName);
//        this.$myRating.text(client.getPlayer().getRank());

        var mode = App.get('mode_cards_count');
        $('.modes').removeClass('activeSelector');
        switch (mode) {
            case 36:
                $('#mode_36_cards').addClass('activeSelector');
                break;
            case 52:
                $('#mode_52_cards').addClass('activeSelector');
                break;
        }
        this.showMyName(App.get('my_name'));

    },
    onCompStepFirst: function (first) {
        if (first) {
            this.beforeOpponentStep();
        }
        else
            this.beforeMyStep(Settings.text.attack_phrase);
    },
    onPlayWithComp: function () {
        this.$score.hide();
        this.$nameAndRating.show();
        this.showButtonsForGameWithComp();
        this.$opponentName.text(Settings.text.computer_name);
        this.$opponentRating.text('');
        this.$switchGame.hide();
        this.initializeHistoryStepButtons();
    },
    onPlayWithOpponent: function () {
        this.showScore();
        this.showButtonsForRealGame();
        this.$switchGame.hide();
    },
    onRenderFromHistory: function (human_attack, table_not_empty) {
        if (human_attack || human_attack === null) {
            this.beforeMyStep(Settings.text.attack_phrase);
            if (table_not_empty)
                this.$putToPile.show();
        }
        else {
            this.beforeMyStep(Settings.text.protect_phrase);
            this.$takeCards.show();
        }
    },
    onWinComputer: function () {
        this.$looseMessage.show();
    },
    onWinHuman: function () {
        this.$winMessage.show();
        this.$myStepText.hide();
//        this.$opponentStepText.hide();
    },
    onDraw: function () {
        this.$drawMessage.show();
    },
    onCanTakeCards: function () {
        this.beforeMyStep(Settings.text.protect_phrase);
        this.$takeCards.show();
    },
    onTakeCards: function () {
//        this.$opponentTakeCards.fadeIn(300);
//        this.$opponentTakeCards.fadeOut(4000);
    },
    onTaken: function (css_class) {
        if (css_class)
            this.$taken.addClass(css_class);
        this.$taken.fadeIn('fast');
        this.$taken.fadeOut(300, function () {
            if (css_class)
                this.$taken.removeClass(css_class);
        }.bind(this));
    },
    onOpponentTakeCards: function () {

    },
    onCanPutToPile: function () {
        this.beforeMyStep(Settings.text.attack_phrase);
        this.$putToPile.show();
    },
    onMoveBack: function () {
        this.hideActionButtons();
        this.myStepTextHide();
    },
    onMoveForward: function () {
        this.hideActionButtons();
        this.myStepTextHide();
    },
    onNothingToBeat: function () {
        this.$takeCards.hide();
        this.$myStepText.hide();
        this.$nothingToBeat.fadeIn(300);
        this.$nothingToBeat.fadeOut(4000);
    },
    onThrew: function (css_class) {
        if (css_class)
            this.$threw.addClass(css_class);
        this.$threw.fadeIn('fast');
        this.$threw.fadeOut(2000, function () {
            if (css_class)
                this.$threw.removeClass(css_class);
        }.bind(this));
    },
    onOpponentTakeCards: function () {
        this.temporaryBlockUI(2000);
        if (!localStorage.getItem('tooltip_for_taken_cards_showed')) {
            App.renderTooltip(Settings.tooltip.for_taken_cards);
            localStorage.setItem('tooltip_for_taken_cards_showed', true);
        }
    },
    playWithComp: function () {
        console.log('playWithComp');
        App.start(true);
    },
    putToPile: function () {
        App.putToPile();
    },
    showDefaultScreen: function () {
        this.myStepTextHide();
//        this.$opponentStepText.hide();
        this.$nameAndRating.hide();
        this.hideScore();
        this.hideTrumpValueOnDeck();
        this.hideActionButtons();
        this.showButtonsForGameWithComp();
        this.updateDeckRemains(0);
        this.$switchGame.show();
    },
    showTrumpValueOnDeck: function (trump) {
        this.$trump.show();

        $('#trump #trump_icon').removeClass('h c d s');
        $('#trump #trump_icon').addClass(trump);
    },
    showButtonsForRealGame: function () {
        $('.controlPanelLayout .real_game').show();
        $('.controlPanelLayout .game_with_comp').hide();
        $('.controlPanelLayout .spectate_game').hide();
    },
    showButtonsForGameWithComp: function () {
        $('.controlPanelLayout .game_with_comp').show();
        $('.controlPanelLayout .real_game').hide();
        $('.controlPanelLayout .spectate_game').hide();
        $('#tbLeaveReview').hide();
        $('.controlPanel .game_with_comp td').each(function () {
            $(this).removeClass('disable');
        });
        $('#tbPrev').addClass('disable').show();
        $('#tbNext').addClass('disable').show();
    },
    showButtonsForSpectate: function () {
        $('.controlPanelLayout .game_with_comp').hide();
        $('.controlPanelLayout .real_game').hide();
        $('.controlPanelLayout .spectate_game').show();
    },
    onSpectate: function () {
        this.showButtonsForSpectate();
        this.hideDefaultScreen();
        this.$nameAndRating.show();
        this.showMyName();
    },
    showScore: function (score) {
        this.$score.show();
        if (score) {
            this.$score.find('span').text(score);
        }
    },
    showMyName: function (name) {
        this.$myName.show();
        if (name) {
            this.$myName.text(name);
        }
    },
    showOpponentName: function (name) {
        this.$opponentName.show();
        if (name) {
            this.$opponentName.text(name);
        }
    },
    showMyRating: function (rating) {
        this.$myRating.show();
        if (rating) {
            this.$myRating.text(rating);
        }
    },
    showOpponentRating: function (rating) {
        this.$opponentRating.show();
        if (rating) {
            this.$opponentRating.text(rating);
        }
    },
    takeCards: function () {
        App.humanTakeCards();
    },
    temporaryBlockUI: function (time) {
        this.blockUI();
        setTimeout(this.unBlockUI, time);
    },
    throwButtonHide: function () {
        this.$endThrow.hide();
    },
    throwButtonShow: function () {
        this.$endThrow.show();
    },
    unBlockUI: function () {
        $('#blocker').remove();
    },
    updateDeckRemains: function (count) {
//        if (!count) {
//            if (App.get('game_with_comp'))
//                var count = App.get('game_with_comp').remainsInDeck();
//        }
        if (count === 0)
            $('#deck_remain').hide();
        else
            $('#deck_remain').show();
        $('#deck_remain .count').text(count);
    }
});