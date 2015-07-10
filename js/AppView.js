var AppView = Backbone.View.extend({
    el: '#field',
    events: {
        'click #switch_game a': 'playWithComp',
        'click #take_cards': 'takeCards',
        'click #put_tu_pile': 'putToPile'

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
//        this.listenTo(App.get('human'), 'before_my_step', this.beforeMyStep);
//        this.listenTo(App.get('human'), 'before_opponent_step', this.beforeOpponentStep);
//        this.listenTo(App.get('human'), 'win', this.onWinHuman);
//        this.listenTo(App.get('opponent'), 'win', this.onWinComputer);
//        this.listenTo(App.get('opponent'), 'draw', this.onDraw);
//        this.listenTo(App.get('opponent'), 'take_cards', this.onOpponentTakeCards);
        this.listenTo(App, 'can_take_cards', this.onCanTakeCards);
        this.listenTo(App, 'human_take_cards', this.onTakeCards);
        this.listenTo(App, 'can_put_to_pile', this.onCanPutToPile);
        this.listenTo(App, 'beaten', this.onBeaten);
        this.listenTo(App, 'nothing_to_beat', this.onNothingToBeat);
        this.listenTo(App, 'threw', this.onThrew);
        this.listenTo(App, 'end_game', this.onEndGame);
        this.listenTo(App, 'deck_is_empty', this.showTrumpValueOnDeck);
        this.listenTo(App, 'deck_is_not_empty', this.hideTrumpValueOnDeck);
        this.listenTo(App, 'update_deck_remain', function (obj) {
            this.updateDeckRemains(obj);
        }.bind(this));
        this.listenTo(App, 'play_with_comp', this.onPlayWithComp);

        App.setGameArea(
            {
                height: $('#field').height(),
                width: $('#field').width()
            }
        );
    },
    beforeMyStep: function () {
        this.$myStepText.show();
        this.$opponentStepText.hide();
        hide_action_buttons();
    },
    beforeOpponentStep: function () {
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
    getSettingsTemplate: function () {
        return $('#settings_template').html();
    },
    hideTrumpValueOnDeck: function () {
        this.$trump.hide();
    },
    hideActionButtons: function () {
        this.$takeCards.hide();
        this.$putToPile.hide();
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
            console.log('enableNext ');

            $('#tbNext').css('opacity', '1').
                removeClass('disable');
        };

        App.get('game_with_comp').history.enablePrev = function () {
            console.log('enablePrev ');
            $('#tbPrev').css('opacity', '1').
                removeClass('disable');
        };
    },
    onStart: function () {
        this.listenTo(App.get('human'), 'before_my_step', this.beforeMyStep);
        this.listenTo(App.get('human'), 'before_opponent_step', this.beforeOpponentStep);
        this.listenTo(App.get('human'), 'win', this.onWinHuman);
        this.listenTo(App.get('opponent'), 'win', this.onWinComputer);
        this.listenTo(App.get('opponent'), 'draw', this.onDraw);
        this.$myStepText.hide();
        this.$opponentStepText.hide();

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
        this.$myName.text(client.getPlayer().userName);
        this.$myRating.text(client.getPlayer().getRank());

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
    },
    onPlayWithComp: function () {
        this.$score.hide();
        this.$nameAndRating.show();
        this.showButtonsForGameWithComp();
        this.$opponentName.text('Компьютер');
        this.$opponentRating.text('');
        this.$switchGame.hide();
        this.initializeHistoryStepButtons();
    },
    onWinComputer: function () {
        this.$looseMessage.show();
    },
    onWinHuman: function () {
        this.$winMessage.show();
        this.$myStepText.hide();
        this.$opponentStepText.hide();
    },
    onDraw: function () {
        this.$drawMessage.show();
    },
    onCanTakeCards: function () {
        this.$takeCards.show();
    },
    onTakeCards: function () {
        this.$opponentTakeCards.fadeIn(300);
        this.$opponentTakeCards.fadeOut(4000);
    },
    onCanPutToPile: function () {
        this.$putToPile.show();
    },
    onBeaten: function () {
        this.$beaten.fadeIn(300);
        this.$beaten.fadeOut(300);
    },
    onNothingToBeat: function () {
        this.$takeCards.hide();
        this.$myStepText.hide();
        this.$nothingToBeat.fadeIn(300);
        this.$nothingToBeat.fadeOut(4000);
    },
    onThrew: function () {
        this.$threw.fadeIn('fast');
        this.$threw.fadeOut(2000);
    },
    onEndGame: function () {
        $('#my_step_text').hide();
        $('#opponent_step_text').hide();
        $('#take_cards').hide();
        $('#put_tu_pile').hide();
        $('#timer').hide();
        $('#deck_remain').hide();
        $('#end_throw').hide();
        $('#can_throw').hide();
        this.hideActionButtons();
    },
    onOpponentTakeCards: function () {
        this.temporaryBlockUI(2000);
    },
    playWithComp: function () {
        App.start(true);
    },
    putToPile: function () {
        App.putToPile();
    },
    showTrumpValueOnDeck: function () {
        this.$trump.show();

        var trump = App.getTrump();
        var suit_mapped = App.getProperty('trump_mapping')[trump];
        if (suit_mapped) {
            trump = suit_mapped;
        }
        $('#trump #trump_icon').removeClass('h c d s');
        $('#trump #trump_icon').addClass(trump);
    },
    showButtonsForRealGame: function () {
        $('.controlPanelLayout .real_game').show();
        $('.controlPanelLayout .game_with_comp').hide();
    },
    showButtonsForGameWithComp: function () {
        $('.controlPanelLayout .game_with_comp').show();
        $('.controlPanelLayout .real_game').hide();
        $('#tbLeaveReview').hide();
        $('.controlPanel .game_with_comp td').each(function () {
            $(this).removeClass('disable');
        });
        $('#tbPrev').addClass('disable').show();
        $('#tbNext').addClass('disable').show();
    },
    takeCards: function () {
        if (!App.human.canStep())
            return false;
        if (App.table.getCardForBeat()) {
            App.humanTakeCards();
        }
        return false;
    },
    temporaryBlockUI: function (time) {
        this.blockUI();
        setTimeout(this.unBlockUI, time);
    },
    unBlockUI: function () {
        $('#blocker').remove();
    },
    updateDeckRemains: function (count) {
        if (!count) {
            if (App.get('game_with_comp'))
                var count = App.get('game_with_comp').remainsInDeck();
        }
        if (count === 0)
            $('#deck_remain').hide();
        else
            $('#deck_remain').show();
        $('#deck_remain .count').text(count);
    }
});