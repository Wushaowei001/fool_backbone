var AppView = Backbone.View.extend({
    el: '#gameArea',
    events: {
        'click #switch_game a': 'playWithComp',
        'click #take_cards': 'takeCards',
        'click #put_tu_pile': 'putToPile',
        'click #tbNewGame': 'playWithComp',// do not working
        'click #end_throw': 'endThrow',
        'click #history_move_back': 'onHistoryMoveBack',
        'click #tbPrev': 'onPrev',
        'mousedown #tbPrev': 'onPrevDown',
        'mouseleave #tbPrev': 'stopMoveBack',
        'mouseup #tbPrev': 'stopMoveBack',

        'click #tbNext': 'onNext',
        'mousedown #tbNext': 'onNextDown',
        'mouseleave #tbNext': 'stopMoveForward',
        'mouseup #tbNext': 'stopMoveForward'
//        'mousedown #history_move_back': 'onHistoryMoveBackInterval',
//        'mouseleave #history_move_back': 'onHistoryMoveBackStop',
//        'mouseup #history_move_back': 'onHistoryMoveBackStop',
//        'click #history_play_stop': 'onHistoryPlayStop',
//        'click #history_move_forward': 'onHistoryMoveForward',
//        'mousedown #history_move_forward': 'onHistoryMoveForwardInterval',
//        'mouseleave #history_move_forward': 'onHistoryMoveForwardStop',
//        'mouseup #history_move_forward': 'onHistoryMoveForwardStop'
    },
    moveBackTimeOutId: null,
    moveForwardTimeOutId: null,
    moveBackInterval: null,
    moveForwardInterval: null,
    initialize: function () {
        this.$prev = this.$('#tbPrev');
        this.$next = this.$('#tbNext');
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
        this.$timer_for_throw = this.$('#timer_for_throw');
        this.$my_timer = this.$('#my_timer');
        this.$opponent_timer = this.$('#opponent_timer');
        this.$historyLoadControls = this.$('#historyLoadControls');
        this.$historyMoveBack = this.$('#history_move_back');
        this.$historyMoveForward = this.$('#history_move_forward');
        this.$historyPlayStop = this.$('#history_play_stop');
        this.$resultOfHistory = this.$('#result_of_history');


        this.listenTo(App, 'start', this.onStart);
        this.listenTo(App, 'default_screen', this.showDefaultScreen);
        this.listenTo(App, 'change_mode_cards_count', function (mode) {
            this.changeModeCardsCount(mode);
        });
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
            if (can == null)
                return;
            if (can)
                this.beforeMyStep();
            else
                this.beforeOpponentStep();
        });
        this.listenTo(App, 'deck_is_empty show_trump', function (trump) {
            this.showTrumpValueOnDeck(trump)
        });
        this.listenTo(App, 'internal_history:moveBack', this.onMoveBack);
        this.listenTo(App, 'internal_history:moveForward', this.onMoveForward);
        this.listenTo(App, 'renderFromInternalHistory', function (human_attack, table_not_empty) {
            this.onRenderFromHistory(human_attack, table_not_empty);
        });
        this.listenTo(App, 'table:addToPile', this.onAddToPile);
//        this.listenTo(App, 'table:renderLastPile', this.hideTooltips);
//        this.listenTo(App, 'renderLastTakenCards', this.hideTooltips);
        this.listenTo(App, 'load_images_start', function () {
            this.blockUI();
        });
        this.listenTo(App, 'load_images_end', function () {
            if (!App.get('human'))
                this.showDefaultScreen();
            this.unBlockUI();
        });
        this.listenTo(App, 'leave_spectate', this.showButtonsForGameWithComp);
        this.listenTo(App, 'join_spectate', function (mode) {
            this.onSpectate(mode)
        });
        this.listenTo(App, 'timer_for_throw_tick', function (count) {
            this.$timer_for_throw.text(count);
        });
        this.listenTo(App, 'timer_for_throw_stop', function () {
            this.$timer_for_throw.text('');
        });
        this.listenTo(App, 'my_timer_tick', function (time) {
            this.$my_timer.show().text('(' + time + ')');
        });
        this.listenTo(App, 'opponent_timer_tick', function (time) {
            this.$opponent_timer.show().text('(' + time + ')');
        });
        this.listenTo(App, 'history_load_start', this.onHistoryLoadStart);
        this.listenTo(App, 'history_load_end', function (result) {
            this.onHistoryLoadEnd(result);
        });
        this.listenTo(App, 'local_history_disableNext', function () {
            this.$next.addClass('disable');
        });
        this.listenTo(App, 'local_history_disablePrev', function () {
            this.$prev.addClass('disable');
        });
        this.listenTo(App, 'local_history_enableNext', function () {
            this.$next.removeClass('disable');
        });
        this.listenTo(App, 'local_history_enablePrev', function () {
            this.$prev.removeClass('disable');
        });

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
            phrase = Config.text.attack_phrase;
        this.$myStepText.show().find('span').text(phrase);
        this.$opponentStepText.hide();
        this.hideActionButtons();
    },
    beforeOpponentStep: function () {
        console.log('beforeOpponentStep');
        this.$opponentStepText.show();
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
        this.$opponentStepText.hide();
    },
    changeMyName: function (name) {
        console.log('changeMyName: ' + name);
//        this.$myName.show();
        if (name) {
            this.$myName.text(name);
        }
    },
    changeModeCardsCount: function (mode) {
        console.log(mode);
        $('.modes').removeClass('activeSelector');
        $('.spectate_game #' + mode).addClass('activeSelector');
        $('.game_with_comp #' + mode).addClass('activeSelector');
    },
    endThrow: function () {
        App.endThrow();
    },
    getSettingsTemplate: function () {
        return $('#settings_template').html();
    },
//    hideTooltips: function () {
//        if (App.get('tooltipLayer')) {
//            App.destroyLayer('tooltipLayer');
//            App.get('stage').draw();
//        }
//    },
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
    onAfterStart: function () {
        this.listenTo(App.get('human'), 'before_my_step', this.beforeMyStep);
        this.listenTo(App.get('human'), 'before_opponent_step', this.beforeOpponentStep);
        this.listenTo(App.get('human'), 'win', this.onWinHuman);
        this.listenTo(App.get('opponent'), 'win', this.onWinComputer);
        this.listenTo(App.get('opponent'), 'draw', this.onDraw);
        this.listenTo(App.get('opponent'), 'take_cards', this.onOpponentTakeCards);
    },
    onAddToPile: function () {
        this.myStepTextHide();
        if (!localStorage.getItem('tooltip_for_pile_showed')) {
            App.renderTooltip(Config.tooltips.for_pile);
            localStorage.setItem('tooltip_for_pile_showed', true);
        }
    },
    onBeaten: function (css_class) {
        if (css_class)
            this.$beaten.addClass(css_class);
        this.$beaten.fadeIn(300);
        this.$beaten.fadeOut(300, function () {
            if (css_class)
                this.$beaten.removeClass(css_class);
        }.bind(this));
    },
    onBeforeStart: function () {
        console.log('onBeforeStart');
        this.reset();

        $('#gameArea .real_game .cpButton').each(function () {
            if (this.id != 'tbLeave')
                $(this).removeClass('disable');
        });
        this.$deckRemain.show();
        $('#deck_remain .count').text('');

        this.$nameAndRating.show();
        this.showMyName(App.get('my_name'));
    },
    onCanPutToPile: function () {
        this.beforeMyStep(Config.text.attack_phrase);
        this.$putToPile.show();
    },
    onCanTakeCards: function () {
        this.beforeMyStep(Config.text.protect_phrase);
        this.$takeCards.show();
    },
    onCompStepFirst: function (first) {
        if (first) {
            this.beforeOpponentStep();
        }
        else
            this.beforeMyStep(Config.text.attack_phrase);
    },
    onDraw: function () {
        this.$drawMessage.show();
    },
    onEndGame: function () {
        console.log('onEndGame');
        this.$myStepText.hide();
        this.$opponentStepText.hide();
        this.$takeCards.hide();
        this.$putToPile.hide();
        this.$endThrow.hide();
        this.$canThrow.hide();
        this.$deckRemain.hide();
        this.$my_timer.hide().text('');
        this.$opponent_timer.hide().text('');
        this.hideActionButtons();
    },
    onEndThrow: function () {
        this.throwButtonHide();
        this.canThrowMessageHide();
        this.beforeMyStep(Config.text.attack_phrase);
    },
    onPrev: function () {
        if (this.$prev.hasClass('disable'))
            return false;
        if (App.get('game_with_comp') && App.get('game_with_comp').history) {
            App.get('game_with_comp').history.moveBack();
        }
        else {
            this.$next.removeClass('disable');
            App.get('history').moveBack();
        }
    },
    onPrevDown: function () {
        this.moveBackTimeOutId = setTimeout(function () {
            this.moveBackInterval = setInterval(function () {
                App.get('history').moveBack();
            }.bind(this), Config.interval_actions.moveBackInterval.interval);
        }.bind(this), Config.interval_actions.moveBackInterval.timeout);
    },
    onNext: function () {
        if (this.$next.hasClass('disable'))
            return;
        if (App.get('game_with_comp') && App.get('game_with_comp').history) {
            App.get('game_with_comp').history.moveForward();
        }
        else {
            this.$prev.removeClass('disable');
            App.get('history').moveForward();
        }
    },
    onNextDown: function () {
        this.moveForwardTimeOutId = setTimeout(function () {
            this.moveForwardInterval = setInterval(function () {
                App.get('history').moveForward();
            }.bind(this), Config.interval_actions.moveForwardInterval.interval);
        }.bind(this), Config.interval_actions.moveForwardInterval.timeout);
    },
    onHistoryLoadStart: function () {
        this.reset();
    },
    onHistoryLoadEnd: function (result) {
        this.$nameAndRating.show();
        this.showMyName();
        this.showResultOfHistory(result);
//        this.$historyLoadControls.show();
        this.$prev.removeClass('disable');
        this.$next.addClass('disable');
//        this.$historyPlayStop.addClass('disable');
        this.stopListening(false, 'cursor_at_the_beginning cursor_at_the_end');
        this.listenTo(App.get('history'), 'cursor_at_the_beginning', function () {
            this.$prev.addClass('disable');
            this.$next.removeClass('disable');
//            this.$historyPlayStop.removeClass('disable');
        }.bind(this));
        this.listenTo(App.get('history'), 'cursor_at_the_end', function () {
            this.$next.addClass('disable');
//            this.$historyPlayStop.addClass('disable');
            this.$prev.removeClass('disable');
        }.bind(this));
    },
    onHistoryMoveBack: function () {
        if (!this.$historyMoveBack.hasClass('disable')) {
            this.$historyMoveForward.removeClass('disable');
            this.$historyPlayStop.removeClass('disable');
//            this.listenTo(App.get('history'), 'cursor_at_the_beginning', function () {
//                this.$historyMoveBack.addClass('disable');
//                this.$historyMoveForward.removeClass('disable');
//                this.$historyPlayStop.removeClass('disable');
//            }.bind(this));
//            this.listenTo(App.get('history'), 'cursor_at_the_end', function () {
//                this.$historyMoveForward.addClass('disable');
//                this.$historyPlayStop.addClass('disable');
//                this.$historyMoveBack.removeClass('disable');
//            }.bind(this));
//            this.listenTo(App.get('history'), 'play_history_stop', function () {
//                this.$historyPlayStop.removeClass('playing');
//            }.bind(this));
//            this.listenTo(App.get('history'), 'play_history_tick', function () {
//                this.$historyMoveBack.removeClass('disable');
//            }.bind(this));
            App.get('history').moveBack().stop();
        }
    },
    onHistoryMoveBackInterval: function () {
        if (!this.$historyMoveBack.hasClass('disable')) {
            this.moveBackInterval = setInterval(function () {
                this.onHistoryMoveBack();
            }.bind(this), Config.interval_actions.moveBackInterval.time);
        }
    },
    onHistoryMoveBackStop: function () {
        clearInterval(this.moveBackInterval);
    },
    onHistoryMoveForward: function () {
        if (!this.$historyMoveForward.hasClass('disable')) {
            this.$historyMoveBack.removeClass('disable');
            App.get('history').moveForward().stop();
        }
    },
    onHistoryMoveForwardInterval: function () {
        if (!this.$historyMoveForward.hasClass('disable')) {
            this.moveForwardInterval = setInterval(function () {
                this.onHistoryMoveForward();
            }.bind(this), Config.interval_actions.moveForwardInterval.time);
        }
    },
    onHistoryMoveForwardStop: function () {
        clearInterval(this.moveForwardInterval);
    },
    onHistoryPlayStop: function () {
        if (this.$historyPlayStop.hasClass('playing')) {
            App.get('history').stop();
        }
        else {
            App.get('history').play();
            this.$historyPlayStop.addClass('playing');
        }
    },
    myStepTextHide: function () {
        this.$myStepText.hide();
    },

    onStart: function () {
    },
    onPlayWithComp: function () {
        this.$score.hide();
        this.$nameAndRating.show();
        this.showButtonsForGameWithComp();
        this.$opponentName.text(Config.text.computer_name);
        this.$opponentRating.text('');
        this.$switchGame.hide();
//        this.initializeHistoryStepButtons();
    },
    onPlayWithOpponent: function () {
        this.showScore();
        this.showButtonsForRealGame();
        this.$switchGame.hide();
    },
    onRenderFromHistory: function (human_attack, table_not_empty) {
        if (human_attack || human_attack === null) {
            this.beforeMyStep(Config.text.attack_phrase);
            if (table_not_empty)
                this.$putToPile.show();
        }
        else {
            this.beforeMyStep(Config.text.protect_phrase);
            this.$takeCards.show();
        }
    },
    onWinComputer: function () {
        this.$looseMessage.show();
    },
    onWinHuman: function () {
        this.$winMessage.show();
        this.$myStepText.hide();
        this.$opponentStepText.hide();
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
            App.renderTooltip(Config.tooltips.for_taken_cards);
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
    reset: function () {
        console.log('reset!!!');
        this.hideActionButtons();
        this.hideDefaultScreen();
        this.$myStepText.hide();
        this.$opponentStepText.hide();
        this.$takeCards.hide();
        this.$putToPile.hide();
        this.$winMessage.hide();
        this.$looseMessage.hide();
        this.$drawMessage.hide();
        $('#repControls').hide();
        $('#trump #trump_icon').removeClass('s d h c');
        this.$trump.hide();

        this.$deckRemain.show();
        $('#deck_remain .count').text('');
        this.$switchGame.hide();
        this.$endThrow.hide();
        this.$canThrow.hide();
        this.$historyLoadControls.hide();
        this.$resultOfHistory.hide();
    },
    showDefaultScreen: function () {
        this.myStepTextHide();
        this.$opponentStepText.hide();
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
        this.$prev.addClass('disable');
        this.$next.addClass('disable');
    },
    showButtonsForSpectate: function () {
        $('.controlPanelLayout .game_with_comp').hide();
        $('.controlPanelLayout .real_game').hide();
        $('.controlPanelLayout .spectate_game').show();
    },
    stopMoveBack: function () {
        clearInterval(this.moveBackInterval);
        clearTimeout(this.moveBackTimeOutId);
    },
    stopMoveForward: function () {
        clearInterval(this.moveForwardInterval);
        clearTimeout(this.moveForwardTimeOutId);
    },
    onSpectate: function (mode) {
        this.reset();
        this.changeModeCardsCount(mode);
        this.showButtonsForSpectate();
//        this.hideDefaultScreen();
//        this.$historyLoadControls.hide();
//        this.$opponentStepText.hide();
        this.$nameAndRating.show();
        this.showMyName();
    },
    showScore: function (score) {
        this.$score.show();
        if (score) {
            var $span = this.$score.find('span');
            $span.text(score);
//            var split = $span.html().split("/");
//            if (split.length == 2) {
//                $span.html(
//                    '<span class="top">' + split[0] + '</span>' +
//                        '<span class="bottom">' + split[1] + '</span>'
//                );
//            }
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
    showResultOfHistory: function (result) {
        this.$resultOfHistory.show();
        if (result) {
            this.$resultOfHistory.text(result);
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
        console.log('updateDeckRemains: ' + count);
        if (count === 0)
            this.$deckRemain.hide();
        else
            this.$deckRemain.show();
        $('#deck_remain .count').text(count);
    }
});