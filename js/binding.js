$(function () {

    $('#gameArea').on('click', '#tbHelp', function () {
        if (!App.human.canStep())
            return false;
        if (App.table.getCardForBeat()) {
            App.liftPossibleCards();
//            InvertPossibleCards();
//            setTimeout(InvertPossibleCards, 300);
        }
    });

    $('#bbRatings').on('click', function () {
        if (!$('#v6Rating').is(':visible')) {
            LogicGame.hidePanels();
            client.viewsManager.closeAll();
            client.ratingManager.getRatings();
        }
        else {
            client.viewsManager.closeAll();
            LogicGame.hidePanels();
        }

    });

    $('#bbHistory').on('click', function () {
        if (!$('#v6History').is(':visible')) {
            LogicGame.hidePanels();
            client.viewsManager.closeAll();
            client.historyManager.getHistory(false, false, false);
        }
        else {
            client.viewsManager.closeAll();
            LogicGame.hidePanels();
        }
    });

    $('#bbParameters').on('click', function () {
        if (!$('#v6-settings').is(':visible')) {
            LogicGame.hidePanels();
            client.viewsManager.closeAll();
            client.viewsManager.showSettings();
            $('#v6-settings').css('left', '540px');
        }
        else {
            client.viewsManager.closeAll();
            LogicGame.hidePanels();
        }
    });

    $('#tbDraw').on('click', function () {
        client.gameManager.sendDraw();
    });

    $('#tbLetDown').on('click', function () {
        if ($(this).hasClass('disable'))
            return false;
        client.gameManager.sendThrow();
    });

    $('#showDescription').on('click', function () {
        $('#Description').show();
    });

    $('#gameArea').on('click', '#tbNewGame', function () {
        if ($(this).hasClass('disable'))
            return false;
        App.start(true);
    });

    $('#gameArea').on('click', '#tbLeave', function () {
        if ($(this).hasClass('disable'))
            return false;
        appView.showButtonsForGameWithComp();
//        $('#my_step_text').hide();
//        $('#opponent_step_text').hide();
        client.gameManager.leaveGame();
    });

    $('#gameArea').on('click', '#tbLeaveReview', function () {
//        AppView.showButtonsForGameWithComp();
        App.start(true);
    });

    $('#gameArea').on('click', '#tbPrev', function () {

        if ($('#tbPrev').hasClass('disable'))
            return false;
        App.get('game_with_comp').history.moveBack();

    });

    $('#gameArea').on('click', '#tbNext', function () {
        if ($('#tbNext').hasClass('disable'))
            return false;
        App.get('game_with_comp').history.moveForward();
    });

    $('#mode_36_cards').on('click', function () {
        $('.modes').removeClass('activeSelector');
        $(this).addClass('activeSelector');
        App.setMode('default');
        client.setMode('default');
        if (App.get('game_with_comp'))
            App.start(true);
    });
    $('#mode_52_cards').on('click', function () {
        $('.modes').removeClass('activeSelector');
        $(this).addClass('activeSelector');
        App.setMode('deck_52');
        client.setMode('deck_52');
        if (App.get('game_with_comp'))
            App.start(true);
    });
});
