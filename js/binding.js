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

    $('#tbLeaveSpectate').on('click', function () {
        client.gameManager.leaveGame();
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
        App.start(true);
    });

//    $('#gameArea').on('click', '#tbPrev', function () {
//
//        if ($('#tbPrev').hasClass('disable'))
//            return false;
//        if (App.get('game_with_comp') && App.get('game_with_comp').history) {
//            App.get('game_with_comp').history.moveBack();
//        }
//        else {
//
//        }
//
//    });

//    $('#gameArea').on('click', '#tbNext', function () {
//        if ($('#tbNext').hasClass('disable'))
//            return false;
//        App.get('game_with_comp').history.moveForward();
//    });

    $('.game_with_comp #default').on('click', function () {
        if (App.canStart()) {
            App.set('mode_cards_count', 'default');
            client.setMode('default');
        }
        if (App.get('game_with_comp')) {
            App.start(true);
        }
    });
    $('.game_with_comp #deck_52').on('click', function () {
        if (App.canStart()) {
            App.set('mode_cards_count', 'deck_52');
            client.setMode('deck_52');
        }
        if (App.get('game_with_comp')) {
            App.start(true);
        }
    });
});
