var HumanView = Backbone.View.extend({
    initialize: function(){
        this.$myStepText = this.$('#my_step_text');
        this.$opponentStepText = this.$('#opponent_step_text');
        this.$takeCards = this.$('#take_cards');
        this.$putToPile = this.$('#put_tu_pile');

        this.listenTo(this.model, 'before_my_step', this.beforeMyStep);
        this.listenTo(this.model, 'before_opponent_step', this.beforeOpponentStep);
        this.listenTo(this.model, 'win', this.onWinHuman);
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
    hideActionButtons: function () {
        this.$takeCards.hide();
        this.$putToPile.hide();
    },
    onWinHuman: function () {
        this.$winMessage.show();
        this.$myStepText.hide();
        this.$opponentStepText.hide();
    },
});