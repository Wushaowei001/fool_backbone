LogicGame.init(onInit);

function onInit() {
    var settingsTemplate = getSettingsTemplate();
    window.client = new Client({
        https: true,
        domain: 'logic-games.spb.ru',
//        domain: 'localhost',
        game: 'fool',
        port: 8028,
        resultDialogDelay: 1000,
        reload: true,
        autoShowProfile: true,
        newGameFormat: true,
        getUserParams: function () {
            return {gameType: 'Main Mode'}
        },
        generateInviteText: function (invite) {
            return 'Вас пригласил пользователь ' +
                invite.from.userName + '(' +
                invite.from.getRank(invite.data.mode) +
                ' место в рейтинге)' +
                ' в ' + window.client.getModeAlias(invite.data.mode);
        },
        settingsTemplate: settingsTemplate,
        settings: {
            sort: 'by_value',
            back_image: 'checkered_1',
            card_design: 'base',
            step: 'dblclick',
            trump_mapping: 'without'
        },
        blocks: {
            userListId: 'userListDiv',
            chatId: 'chatDiv',
            ratingId: 'ratingDiv',
            historyId: 'historyDiv',
            profileId: 'profileDiv'
        },
        images: {
            close: 'https://logic-games.spb.ru/v6-game-client/app/i/close.png',
            spin: 'https://logic-games.spb.ru/v6-game-client/app/i/spin.gif',
            sortAsc: 'https://logic-games.spb.ru/v6-game-client/app/i/sort-asc.png',
            sortDesc: 'https://logic-games.spb.ru/v6-game-client/app/i/sort-desc.png',
            sortBoth: 'https://logic-games.spb.ru/v6-game-client/app/i/sort-both.png',
            del: 'https://logic-games.spb.ru/v6-game-client/app/i/delete.png'
        },
        sounds: {
            start: {
                src: '//logic-games.spb.ru/v6-game-client/app/audio/v6-game-start.ogg'
            },
            turn: {
                src: '/fool/audio/card_start.wav'
            },
            add_to_pile: {
                src: '/fool/audio/card_table.wav',
                volume: 0.5
            },
            add_card: {
                src: '/fool/audio/card_show.wav'
            },
            win: {
                src: '//logic-games.spb.ru/v6-game-client/app/audio/v6-game-win.ogg'
            },
            lose: {
                src: '//logic-games.spb.ru/v6-game-client/app/audio/v6-game-lose.ogg'
            },
            invite: {
                src: '//logic-games.spb.ru/v6-game-client/app/audio/v6-invite.ogg'
            },
            timeout: {
                src: '//logic-games.spb.ru/v6-game-client/app/audio/v6-timeout.ogg'
            }
        },
        vk: {
            title: 'Дурак',
            photo: 'photo20536400_371554623',
            url: 'https://vk.com/app4961242'
        }
    }).init();

    var client = window.client;


    client.on('login', function (data) {
        console.log('main;', 'login', data.userId, data.userName);
        var you = client.getPlayer();
        App.applyClientSettings(client.settings);
        App.set('my_name', you.userName);
        App.initStage();
        App.renderDeck();
        App.trigger('after:login');
    });

    client.gameManager.on('game_start', function (data) {

        console.log('main;', 'game_start, room: ', data);
        var players = data.players;
        var humanId, opponentId, spectate = true;
        for (var i in players) {
            if (players[i].isPlayer) {
                humanId = players[i].userId;
                spectate = false;
            }
            else
                opponentId = players[i].userId;
        }
        App.setUsersId(humanId, opponentId);
        if (spectate) {
            // spectate mode begin
            App.startSpectate(players[0], players[1]);
        }
    });

    client.gameManager.on('round_start', function (data) {
        console.log('round_start: ');
        console.log(data);
        var players = data.players;
        var spectate = true;
        for (var i in players) {
            if (players[i].isPlayer)
                spectate = false;
        }
        if (App.get('spectate') || spectate) {
            App.startSpectate(players[0], players[1]);
            App.setTrump(data.inviteData.trumpVal);
            App.renderTrump();
            return;
        }
        App.setTrump(data.inviteData.trumpVal);
        var round_start = function () {

            App.setMode(data.inviteData.mode);

            App.applyTrumMapping();
            App.start(false, function () {
                App.renderTrump();
                client.gameManager.sendEvent('event', {data: 'getCards'});
                App.get('human').setCanStep(data.first == client.getPlayer());
//                $('#buttons').show();

                var opponent_name = null;
                var my_rating, opponent_rating, score, my_score, opponent_score;
                var players = data.players;
                for (var i in players) {
                    if (players[i].isPlayer) {
                        my_rating = players[i].getRank();
                        my_score = data.score[players[i].userId];
                    }
                    else {
                        opponent_name = players[i].userName;
                        opponent_rating = players[i].getRank();
                        opponent_score = data.score[players[i].userId];
                    }
                }
                App.set('score', my_score + ':' + opponent_score);
                App.set('opponent_name', opponent_name);
                App.set('my_rating', my_rating);
                App.set('opponent_rating', opponent_rating);
            });
        };

        if (data.loading) {
//            App.set('game_load', true);
            return false;
            setTimeout(function () {
                if (!App.get('opponent')) {
                    round_start();
                }
            }, 2000);
        }
        else
            round_start();
    });

    client.gameManager.on('turn', function (data) {
        var your_turn;
        if (App.get('spectate')) {
            your_turn = data.nextPlayer.userId != App.get('humanId');
            if (data.turn.turn_type == 'takeCards') {
                if (your_turn)
                    App.get('human').takeCardsFromTable(data.turn.cards);
                else
                    App.get('opponent').takeCardsFromTable(data.turn.cards);
                App.trigger('spectate:taken');
                return;
            }
            if (data.turn.turn_type == 'addToPile') {
                App.get('table').addToPile();
                App.trigger('spectate:beaten');
                return;
            }
            if (data.turn.turn_type == 'throw') {
                var cards = data.turn.cards;
                for (var i in cards) {
                    if (your_turn)
                        App.get('human').step(cards[i]);
                    else
                        App.get('opponent').step(cards[i]);
                }
                App.trigger('spectate:threw');
                return;
            }
            if (your_turn)
                App.get('human').step(data.turn.card);
            else
                App.get('opponent').step(data.turn.card);
            return;
        }
        your_turn = data.user.isPlayer;

        App.get('human').setCanStep(false);

        if (!your_turn) {
            if (data.turn.turn_type == 'takeCards') {
//                App.temporaryBlockUI(2000);
                App.get('opponent').takeCardsFromTable(data.turn.cards, data.turn.through_throw);
                if (App.get('human').noCards()) {
                    App.win();
                    return false;
                }
            }
            if (data.turn.turn_type == 'addToPile') {
                App.get('table').addToPile();
                App.trigger('addToPile');
                return;
            }

            App.get('opponent').step(data.turn.card);
        }
    });

    client.gameManager.on('switch_player', function (user) {
        if (App.get('spectate'))
            return;
        var your_turn = user.isPlayer;
        if (your_turn) {
            if (App.get('human'))
                App.get('human').setCanStep(true);
            else
                App.deferred_actions.push({can_step: true});
            var cards_for_throw_on_table, cards_for_throw;
            var length = client.gameManager.currentRoom.history.length;
            var last_turn = client.gameManager.currentRoom.history[length - 1];
            if (last_turn)
                last_turn = last_turn.turn;

            if (last_turn && last_turn.turn_type == 'takeCards') {
                if (App.get('human').noCards()) {
                    // win
                    App.win();
//                    client.gameManager.sendTurn({result: 1});
                    return;
                }
                if (last_turn.allow_throw) {
                    cards_for_throw = App.get('human').getCardsForThrow(last_turn.cards);
                    if (cards_for_throw) {
                        var count = App.get('opponent').countCards() - last_turn.cards.length * 2;
                        if (count > 0) {
                            App.trigger('can_throw');
//                            canThrowMessageShow();
//                            throwButtonShow();
                            App.liftPossibleCards(true, cards_for_throw);
//                            myStepTextHide();
                            App.get('human').unBindCards();
                            App.get('human').bindCardsForThrow(cards_for_throw, count);
                        }
                        else {
                            setTimeout(function () {
                                client.gameManager.sendEvent('event', {data: 'getCards'});
                            }, 2000);
                        }
                    }
                    else {
                        setTimeout(function () {
                            client.gameManager.sendEvent('event', {data: 'getCards'});
                        }, 2000);
                    }
                }
                else {
                    setTimeout(function () {
                        client.gameManager.sendEvent('event', {data: 'getCards'});
                    }, 2000);
                }
                cards_for_throw_on_table = App.get('table').getCardsForThrow();
                if (cards_for_throw_on_table) {
                    App.Throw({
                        cards: cards_for_throw_on_table,
                        allow_throw: true
                    });
                    App.get('table').clearCardsForThrow();
                    return false;
                }
                return;
            }

            if (last_turn && last_turn.turn_type == 'throw') {
                App.get('human').unBindCards();
                var cards = last_turn.cards;
                for (var i in cards) {
                    App.get('opponent').step(cards[i]);
                }
                setTimeout(function () {
                    App.humanTakeCards(true, last_turn.allow_throw);
//                    take_cards(true, last_turn.allow_throw);
                }, 1000);
                return;
            }

            cards_for_throw = App.get('table').getCardsForThrow();

            if (cards_for_throw) {
                var card = App.get('table').shiftCardForThrow();
                App.ThrowTurn({
                    card: card,
                    last_card: App.get('human').noCards()
                });
                return;
            }

            if (last_turn && last_turn.last_card && App.get('human').noCards()) {
                // draw
                App.draw();
                return;
            }
            if (last_turn && last_turn.last_card && !App.get('table').getCardForBeat()) {
                // loose
                App.loose();
                return;
            }
            if (last_turn && !last_turn.last_card && App.get('human').noCards()) {
                // win
                App.win();
                return;
            }

            if (App.get('opponent').countCards() == 0 && !App.deckIsEmpty()) {
                if (App.get('table').human_attack) {
                    App.putToPile();
                }
            }
        }
        else {
            if (App.get('human'))
                App.get('human').setCanStep(false);
            else {
                App.deferred_actions.push({can_step: false});
            }
        }
    });

    client.gameManager.on('event', function (data) {
        if (data.event.type == 'addCards') {
            if (data.event.cards) {
                if (App.get('spectate')) {
                    if (data.event.for == App.get('humanId'))
                        App.get('human').addCards(data.event.cards, 'bottom');
                    if (data.event.for == App.get('opponentId'))
                        App.get('opponent').addCards(data.event.cards, 'top');
                }
                else
                    App.get('human').addCards(data.event.cards, true);
            }
            if (data.event.opponent_cards) {
                App.get('opponent').addCards(data.event.opponent_cards);
            }
            if (data.event.deckIsEmpty) {
                App.set('deck_is_empty', true);
//                App.empty_deck = true;
                App.get('Deck').destroy();
                App.get('Trump').hide();
            }
            if (data.event.onlyTrumpRemain) {
                App.get('Deck').destroy();
            }
            if (data.event.cardsRemain != undefined) {
                App.set('deck_remain', data.event.cardsRemain);
            }
            if (App.get('human'))
                App.get('human').renderCards();
        }
    });

    client.gameManager.on('timeout', function (data) {
        console.log('main;', 'timeout', 'user: ', data.user, 'is your timeout: ', data.user == client.getPlayer().userId);
    });

    client.gameManager.on('round_end', function (data) {
        App.end();
        $('#gameArea .real_game .cpButton').each(function () {
            if (this.id != 'tbLeave')
                $(this).addClass('disable');
        });
        App.get('human').unBindCards();
    });

    client.gameManager.on('end_game', function (data) {
        App.reset();
        App.end();
    });

    client.gameManager.on('game_leave', function (data) {
        console.log('main;', 'game_leave room:', data);
        App.end();
        App.reset();
        App.trigger('default_screen')
        App.set('my_name', client.getPlayer().userName);
    });

    client.gameManager.on('time', function (data) {
        var is_opponent;
        if (App.get('spectate')) {
            is_opponent = data.user.userId == App.get('opponentId');
        }
        else {
            is_opponent = !data.user.isPlayer;
        }
        App.renderKonvaTimer(data.userTimePer, is_opponent, Settings.timer);
    });

    client.historyManager.on('game_load', function (game) {
        console.log(game);

        return false;
        if (!App.get('game_with_comp'))
            return false;
        App.reset();
        App.opponent = new Opponent(Settings.player);
        $('#repControls').show();
        $('#tbLeaveReview').show();
        $('#tbPrev').hide();
        $('#tbNext').hide();
        $('.controlPanel .game_with_comp td').each(function () {
            if ($(this).attr('id') != 'tbLeaveReview')
                $(this).addClass('disable');
        });
        App.setTrump(game.initData.inviteData.trumpVal);
        App.history = new History(game.history);
        App.history.enablePrev = function () {
            $('#prev_spectate_game').css('opacity', '1').
                removeClass('disable');
        };
        App.history.disablePrev = function () {
            $('#prev_spectate_game').css('opacity', '0.6').
                addClass('disable');
        };
        App.history.enableNext = function () {
            $('#next_spectate_game').css('opacity', '1').
                removeClass('disable');
        };
        App.history.disableNext = function () {
            $('#next_spectate_game').css('opacity', '0.6').
                addClass('disable');
        };
        App.history.disablePlay = function () {
            $('#pause_spectate_game').removeClass('playing');
        };

        App.history.reset = function () {
            App.MyCards.destroy();
            App.MyCards = new Konva.Layer();
            App.stage.add(App.MyCards);
            App.human = new Human(Settings.player);
            App.opponent = new Opponent(Settings.player);
            App.table.clearTable();
            App.history.disablePrev();
        };
        App.game_with_comp = true;
        App.view_only = true;

        console.log('main;', 'history game loaded, game:', game);
    });

    client.gameManager.on('game_load', function (game) {
        console.log(game);
//        if (App.get('spectate')) {

        var state = {};
        var player;

        var human = App.get('human');
        var opponent = App.get('opponent');
        var my_name = App.get('my_name');
        var opponent_name = App.get('opponent_name');
        var humanId = App.get('humanId');

        for (var i in game) {
            if (game[i].event) {
                var event = game[i].event;
                if (event.type == 'addCards' && event.target) {
                    player = event.target.userId == humanId ? human : opponent;

                    if (event.cards && event.cards.length && !event.for) {
                        var cards = event.cards.map(function (card) {
                            return card + 'sold';
                        });
                        player.setCards(player.getCards().concat(cards));
                    }
                    if (event.cardsRemain || event.cardsRemain === 0)
                        state.deck_remain = event.cardsRemain;
                }
            }
            if (game[i].turn) {
                var turn = game[i].turn;
                state.table_state = turn.state.table_state;
                state.table_state.human_attack = game[i].user.userId == humanId && state.table_state.human_attack;
                player = game[i].user.userId == humanId ? human : opponent;
                if (turn.turn_type == 'takeCards') {
                    var cards = turn.cards.map(function (card) {
                        return card + 'sold';
                    });
                    player.setCards(player.getCards().concat(cards));
                    continue;
                }
                if (turn.turn_type == 'addToPile') {
                    state.table_state = null;
                    continue;
                }
                if (turn.card)
                    player.removeCard(turn.card + 'sold');
                if (turn.cards) {
                    for (var j in turn.cards) {
                        player.removeCard(turn.cards[j] + 'sold');
                    }
                }
            }
        }
        App.set('deck_remain', state.deck_remain);
        App.renderTrump();
        human.renderCards();
        opponent.renderCards();
        if (state.table_state) {

            App.get('table').setState(state.table_state);
            App.get('table').render();
        }
//        }
    });
//
    client.on('settings_changed', function (data) {
        App.changeProperty(data, true);
    });

    client.on('settings_saved', function (data) {
        App.changeSettings(data, true);
    });

};