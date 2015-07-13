//window.take_cards = function (threw, allow_throw) {
////    App.temporaryBlockUI(3000);
//    if (App.game_with_comp && App.history && !App.without_animation && !App.view_only) {
////        App.game_with_comp.update_history();
//    }
//    if (threw) {
//        $('#threw').fadeIn('fast');
//        $('#threw').fadeOut(2000);
//    }
//    App.human.setCanStep(false);
//    var cards = App.table.getCards(true);
//    var timestamp = App.new_game_started;
//    App.human.takeCardsFromTable(cards, function () {
//        if (!App.game_with_comp) {
//            setTimeout(function () {
//                App.safeTimeOutAction(timestamp, function () {
//                    client.gameManager.sendTurn(
//                        {
//                            type: 'takeCards',
//                            cards: cards,
//                            through_throw: threw,
//                            allow_throw: allow_throw !== false
//                        });
//                });
//            }, 1000);
//        }
//        else {
//            App.game_with_comp.addCards(true, function () {
//                App.updateDeckRemains();
//            });
//            if (!App.view_only) {
//                setTimeout(function () {
//                    App.safeTimeOutAction(timestamp, function () {
//                        App.opponent.step();
//                    });
//                }, 800);
//            }
//        }
//    });
//};

//window.onMyStepCall = function () {
//    var timestamp = App.new_game_started;
//    if (!App.view_only && App.human.noCards()) {
//        return;
//    }
//    hide_action_buttons();
//
//    myStepTextShow();
//    $('#opponent_step_text').hide();
//    if (App.table.getCardForBeat() && !App.view_only && !App.table.human_attack)
//        $('#take_cards').show();
//    else {
//        if (App.table.getCards() && !App.view_only)
//            $('#put_tu_pile').show();
//    }
//    if (App.table.getCards() && !App.view_only && !App.without_animation) {
//        if (!App.table.getCardForBeat() && !App.table.getCardsForThrow() && !App.human.isHaveCardForPut()) {
//            App.human.setCanStep(false);
//            $('#beaten').fadeIn(300);
//            setTimeout(function () {
//                App.safeTimeOutAction(timestamp, function () {
//                    App.table.addToPile();
//                    setTimeout(function () {
//                        App.safeTimeOutAction(timestamp, function () {
//                            if (!App.game_with_comp) {
//                                client.gameManager.sendTurn({type: 'addToPile'});
//                                client.gameManager.sendEvent('event', {data: 'getCards'});
//                            }
//                            else {
//                                App.game_with_comp.addCards(true, function () {
//                                    App.updateDeckRemains();
//                                });
//                                if (!App.view_only) {
//                                    setTimeout(function () {
//                                        App.safeTimeOutAction(timestamp, function () {
//                                            App.opponent.step();
//                                        });
//                                    }, 800);
//                                }
//                            }
//                            $('#beaten').fadeOut(1500);
//                        });
//                    }, 1000);
//                });
//            }, 800);
//            return;
//        }
//        else {
//            if (App.table.getCardForBeat() && !App.table.human_attack && !App.human.getMinCard(App.table.getCardForBeatID())) {
//                App.human.unBindCards();
////                App.temporaryBlockUI(1000);
//                $('#take_cards').hide();
//                $('#my_step_text').hide();
//                $('#nothing_to_beat').fadeIn(300);
//                $('#nothing_to_beat').fadeOut(4000);
//                if (!App.view_only)
//                    setTimeout(function () {
//                        App.safeTimeOutAction(timestamp, function () {
//                            App.humanTakeCards();
////                            take_cards();
//                        });
//                    }, 1000);
//                return;
//            }
//        }
//    }
//    if (App.game_with_comp && !App.without_update_history) {
//        console.log('UPDATE HISTORY!!!');
//        App.game_with_comp.history.update_history();
//    }
//    App.human.bindCards();
//};
window.myStepTextShow = function () {
    $('#my_step_text').show();
};
window.myStepTextHide = function () {
    $('#my_step_text').hide();
};
window.loadTextShow = function(){
  $('#load_text').show();
};
window.loadTextHide = function(){
    $('#load_text').hide();
};
//App.setMyStepCallback(onMyStepCall);
//App.setOpponentStepCallback(function () {
//    $('#my_step_text').hide();
//    $('#opponent_step_text').show();
//
//    $('#take_cards').hide();
//    $('#put_tu_pile').hide();
//});
//App.setWinFunc(function (computer) {
//    if (!App.game_with_comp)
//        client.gameManager.sendTurn({result: 1});
//    else {
////        if (computer) {
////            $('#loose_message').show();
////        }
//        else
//            $('#win_message').show();
//        $('#my_step_text').hide();
//        $('#opponent_step_text').hide();
//    }
//});

//App.setDrawFunc(function () {
//    if (App.game_with_comp) {
//        $('#draw_message').show();
//    }
//});

//App.onStartCall(function () {
//    $('#my_step_text').hide();
//    $('#opponent_step_text').hide();
//
//    $('#take_cards').hide();
//    $('#put_tu_pile').hide();
//
//    $('#win_message').hide();
//    $('#loose_message').hide();
//    $('#draw_message').hide();
//    $('#timer').hide();
//    $('#repControls').hide();
//    $('#trump #trump_icon').removeClass('s d h c');
//    $('#trump').hide();
//    $('#gameArea .real_game .cpButton').each(function () {
//        if (this.id != 'tbLeave')
//            $(this).removeClass('disable');
//    });
//    $('#deck_remain').show();
//    $('#deck_remain .count').text('');
//    $('#switch_game').hide();
//    $('#end_throw').hide();
//    $('#can_throw').hide();
//
//    $('.name_and_rating').show();
//    $('#my_name').text(client.getPlayer().userName);
//    $('#my_rating').text(client.getPlayer().getRank());
//
//    var mode = App.mode_cards_count;
//    $('.modes').removeClass('activeSelector');
//    switch (mode) {
//        case 36:
//            $('#mode_36_cards').addClass('activeSelector');
//            break;
//        case 52:
//            $('#mode_52_cards').addClass('activeSelector');
//            break;
//    }
//});

//App.applyClientSettings = function(){
//    var settings = client.settings;
//
//    App.changeSettings({
//        sort: settings.sort,
//        card_design: settings.card_design,
//        trump_mapping: settings.trump_mapping
//    });
//};

//App.onEndGame = function () {
//    $('#my_step_text').hide();
//    $('#opponent_step_text').hide();
//    $('#take_cards').hide();
//    $('#put_tu_pile').hide();
//    $('#timer').hide();
//    $('#deck_remain').hide();
//    $('#end_throw').hide();
//    $('#can_throw').hide();
//};

//App.onTakeCards = function () {
//    var opponent_take_cards = $('#opponent_take_cards');
//    opponent_take_cards.fadeIn(300);
//    opponent_take_cards.fadeOut(4000);
//};

//App.turnSound = function () {
//    client.soundManager.playSound("turn");
//};
//App.addToPileSound = function () {
//    client.soundManager.playSound("add_to_pile");
//};
//App.addCardSound = function () {
//    client.soundManager.playSound("add_card");
//};
//App.blockUI = function () {
//    var width = $('body').innerWidth();
//
//    $('#gameArea').prepend(
//        '<div id="blocker" style="width:' + width + 'px; height:682px; position:fixed; left:0;top: 42px;">' +
//            '</div>'
//    );
//};
//App.unBlockUI = function () {
//    $('#blocker').remove();
//};

//App.showTrumpValueOnDeck = function () {
//    $('#trump').show();
//
//    var trump = App.getTrump();
//    var suit_mapped = App.settings.trump_mapping[trump];
//    if (suit_mapped) {
//        trump = suit_mapped;
//    }
//    $('#trump #trump_icon').removeClass('h c d s');
//    $('#trump #trump_icon').addClass(trump);
//};

//App.hideTrumpValueOnDeck = function () {
//    $('#trump').hide();
//};

//App.updateDeckRemains = function (count) {
//    if (!count) {
//        if (App.game_with_comp)
//            var count = App.game_with_comp.remainsInDeck();
//    }
//    if (count === 0)
//        $('#deck_remain').hide();
//    else
//        $('#deck_remain').show();
//    $('#deck_remain .count').text(count);
//};

//window.buttons_for_real_game = function () {
//    $('.controlPanelLayout .real_game').show();
//    $('.controlPanelLayout .game_with_comp').hide();
//};
//window.buttons_for_game_with_comp = function () {
//    $('.controlPanelLayout .game_with_comp').show();
//    $('.controlPanelLayout .real_game').hide();
//    $('#tbLeaveReview').hide();
//    $('.controlPanel .game_with_comp td').each(function () {
//        $(this).removeClass('disable');
//    });
//    $('#tbPrev').addClass('disable').show();
//    $('#tbNext').addClass('disable').show();
//};

//window.play_with_comp = function () {
//    $('#score').hide();
//    $('#my_timer').hide();
//    $('#opponent_timer').hide();
//    $('.name_and_rating').show();
////    $('#my_name').text(client.getPlayer().userName);
//    AppView.showButtonsForGameWithComp();
//    $('#opponent_name').text('Компьютер');
//    $('#opponent_rating').text('');
//    $('#switch_game').hide();
////    App.temporaryBlockUI(4000);
//
//    App.start(true);
//};

//window.InvertPossibleCards = function () {
//    var timestamp = App.new_game_started;
//    var cards = App.human.getAllPossibleCardsForBeat();
//    var callback = function () {
//        if (!cards.length)
//            return false;
//        var id = cards.pop();
//        var card = App.stage.findOne('#' + id);
//        card.cache();
//        card.filters([Konva.Filters.Invert]);
//        App.MyCards.batchDraw();
//        callback();
//        setTimeout(function () {
//            App.safeTimeOutAction(timestamp, function () {
//                card.filters([]);
//                App.MyCards.batchDraw();
//            });
//        }, 200);
//    };
//    callback();
//};

//window.liftPossibleCards = function (without_hiding, cards) {
//    var timestamp = App.new_game_started;
//    if (!cards)
//        cards = App.human.getAllPossibleCardsForBeat();
//    if (!cards.length)
//        return false;
//    for (var i in cards) {
//        var id = cards[i];
//        var card = App.stage.findOne('#' + id);
//
//        var tween = new Konva.Tween({
//            node: card,
//            duration: 0.3,
//            y: App.getMyCardsCoords().y - 15,
//            onFinish: function () {
//                if (without_hiding)
//                    return false;
//                setTimeout(function () {
//                    App.safeTimeOutAction(timestamp, function () {
//                        App.human.renderCards();
//                    });
//                }, 3000);
//            }
//        });
//        tween.play();
//    }
//};

//window.lightPossibleCards = function () {
//    var cards = App.human.getAllPossibleCardsForBeat();
//    if (!cards.length)
//        return false;
//    for (var i in cards) {
//        var id = cards[i];
//        var card = App.stage.findOne('#' + id);
//        var zIndex = card.getZIndex();
//
//        var rect = new Konva.Rect({
//            x: card.getX(),
//            y: card.getY(),
//            width: App.card_width,
//            height: App.card_height,
//            fill: 'yellow',
//            opacity: 0.5,
//            zIndex: zIndex
//        });
//        App.PossibleCards.add(rect);
//        App.PossibleCards.draw();
//    }
//};
//
//window.hide_action_buttons = function () {
//    $('#buttons button').hide();
//};

//window.graphPlayPauseMovieReplay = function () {
//    $('#pause_spectate_game').toggleClass('playing');
//    App.history.play(function () {
//        $('#pause_spectate_game').toggleClass('playing');
//    });
//};
//
//window.graphMovieNextStage = function () {
//    if (!$('#next_spectate_game').hasClass('disable'))
//        App.history.next();
//};
//
//window.graphMoviePrevStage = function () {
//    if ($('#prev_spectate_game').hasClass('disable'))
//        return false;
//    App.without_animation = true;
//    App.history.reset();
//    App.history.prev();
//    App.human.renderCards(true);
//    App.opponent.renderCards(true);
//    App.table.render();
//    App.without_animation = false;
//};

//window.hide_action_buttons = function () {
//    $('#take_cards').hide();
//    $('#put_tu_pile').hide();
//};

getSettingsTemplate = function () {
    return $('#settings_template').html();
};

var cloner = {
    _clone: function _clone(obj) {
        if (obj instanceof Array) {
            var out = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                var value = obj[i];
                out[i] = (value !== null && typeof value === "object") ? _clone(value) : value;
            }
        } else {
            var out = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var value = obj[key];
                    out[key] = (value !== null && typeof value === "object") ? _clone(value) : value;
                }
            }
        }
        return out;
    },

    clone: function (it) {
        return this._clone({
            it: it
        }).it;
    }
};

//App.initializeHistoryStepButtons = function () {
//    App.game_with_comp.history.disableNext = function () {
//        console.log('disableNext ');
//
//        $('#tbNext').css('opacity', '0.6').
//            addClass('disable');
//    };
//
//    App.game_with_comp.history.disablePrev = function () {
//        console.log('disablePrev ');
//
//        $('#tbPrev').css('opacity', '0.6').
//            addClass('disable');
//    };
//
//    App.game_with_comp.history.enableNext = function () {
//        console.log('enableNext ');
//
//        $('#tbNext').css('opacity', '1').
//            removeClass('disable');
//    };
//
//    App.game_with_comp.history.enablePrev = function () {
//        console.log('enablePrev ');
//        $('#tbPrev').css('opacity', '1').
//            removeClass('disable');
//    };
//};

//window.throwButtonHide = function () {
//    $('#end_throw').hide();
//};

window.throwButtonShow = function () {
    $('#end_throw').show();
};

window.canThrowMessageShow = function () {
    $('#can_throw').show();
};

//window.canThrowMessageHide = function () {
//    $('#can_throw').hide();
//};

//window.endThrow = function () {
//    throwButtonHide();
//    canThrowMessageHide();
//    App.get('human').unBindCards();
//    App.get('human').bindCards();
//    myStepTextShow();
//    var cards = App.get('table').getCardsForThrow();
//    if (cards) {
//        client.gameManager.sendTurn(
//            {
//                cards: cards,
//                type: 'throw',
//                allow_throw: false
//            }
//        );
//        App.get('table').clearCardsForThrow();
//    }
//    setTimeout(function () {
//        client.gameManager.sendEvent('event', {data: 'getCards'});
//    }, 1500);
//};