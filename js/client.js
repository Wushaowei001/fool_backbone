LogicGame.init(onInit);

function onInit() {
    var settingsTemplate = getSettingsTemplate();
    var mode = 'real';
    window.client = new Client({
        https: Config.client[mode].https,
        domain: Config.client[mode].domain,
        game: 'fool',
        port: Config.client[mode].port,
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
        new ClientManager();
        var you = client.getPlayer();
        App.applyClientSettings(client.settings);
        App.set('my_name', you.userName);
        App.set('my_rating', you.getRank());
        App.initStage();
        App.renderDeck(true);
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
            App.startSpectate(players[0], players[1], data.mode);
        }
    });

    client.gameManager.on('round_start', function (data) {
        console.log('round_start: ');
        console.log(data);
        var players = data.players;
        var opponent_name = null;
        var my_rating, opponent_rating, score, my_score, my_name, opponent_score;
        var spectate = true;
        for (var i in players) {
            if (players[i].isPlayer) {
                spectate = false;
                my_rating = players[i].getRank();
                my_score = data.score[players[i].userId];
                my_name = players[i].userName;
            }
            else {
                opponent_name = players[i].userName;
                opponent_rating = players[i].getRank();
                opponent_score = data.score[players[i].userId];
            }
        }
        var init_name_ratings_and_score = function () {
            App.set('score', my_score + ':' + opponent_score);
            App.set('opponent_name', opponent_name);
            App.set('my_name', my_name);
            App.set('my_rating', my_rating);
            App.set('opponent_rating', opponent_rating);
        };
        if (App.get('spectate') || spectate) {
            my_score = data.score[players[0].userId];
            my_rating = players[0].getRank();
            App.startSpectate(players[0], players[1], data.inviteData.mode);
            App.setTrump(data.inviteData.trumpVal);
            App.renderTrump();
            init_name_ratings_and_score();
            return;
        }
        App.setTrump(data.inviteData.trumpVal);
        if (data.inviteData.mode == 'transferable')
            App.set('mode', 'transferable');
        var round_start = function () {

            App.set('mode', data.inviteData.mode);

            App.applyTrumMapping();
            App.start(false, function () {
                App.renderTrump();
                client.gameManager.sendEvent('event', {data: 'getCards'});
                setTimeout(function () {
                    App.get('human').setCanStep(data.first == client.getPlayer());
                }, 1000);
                init_name_ratings_and_score();
            });
            App.set('in_round', true);
        };

        if (data.loading) {
            if (!spectate) {
                // reload
                App.start(false, function () {
                    init_name_ratings_and_score();
                });
            }
        }
        else
            round_start();
    });

    client.gameManager.on('turn', function (data) {
        var your_turn;
        var turn = data.turn;
        var opponent = App.get('opponent');
        var human = App.get('human');
        var table = App.get('table');
        if (App.get('spectate')) {
            your_turn = data.nextPlayer.userId != App.get('humanId');
            if (turn.turn_type == 'takeCards') {
                if (your_turn)
                    human.takeCardsFromTable(turn.cards);
                else
                    opponent.takeCardsFromTable(turn.cards);
                App.trigger('spectate:taken');
                return;
            }
            if (turn.turn_type == 'addToPile') {
                table.addToPile();
                App.trigger('spectate:beaten');
                return;
            }
            if (turn.turn_type == 'throw') {
                var cards = turn.cards;
                for (var i in cards) {
                    if (your_turn)
                        human.step(cards[i]);
                    else
                        opponent.step(cards[i]);
                }
                App.trigger('spectate:threw');
                return;
            }
            if (your_turn)
                human.step(turn.card);
            else
                opponent.step(turn.card);
            return;
        }
        your_turn = data.user.isPlayer;
        if (your_turn) {
            if (!turn.turn_type/* && !turn.automatic_throw*/) {
                human.step(turn.card);
                return;
            }
            if (turn.turn_type == 'transfer') {
                human.transferCard(turn.card);
                human.setCanStep(false);
                return;
            }
            // show opponent cards at the end of the game
            if (typeof turn.result != 'undefined' && turn.opponent_cards.length) {
                opponent.destroyCards();
                opponent.showCards(turn.opponent_cards);
            }
        }
        else {
            if (turn.turn_type == 'takeCards') {
//                App.temporaryBlockUI(2000);
                opponent.takeCardsFromTable(turn.cards, turn.through_throw);
                return;
            }
            if (turn.turn_type == 'addToPile') {
                table.addToPile();
                App.trigger('addToPile');
                return;
            }
            if (turn.turn_type == 'transfer') {
                opponent.transferCard(turn.card);
//                human.setCanStep(false);
                return;
            }

            opponent.step(turn.card);
        }
    });

    client.gameManager.on('switch_player', function (user) {
        if (App.get('spectate'))
            return;
        var your_turn = user.isPlayer;
        var length = client.gameManager.currentRoom.history.length;
        var last_turn = client.gameManager.currentRoom.history[length - 1];
        if (last_turn)
            last_turn = last_turn.turn;
        var human = App.get('human');
        var opponent = App.get('opponent');
        var table = App.get('table');

        if (your_turn) {
            if (human) {
                if (last_turn && (last_turn.turn_type == 'addToPile' || last_turn.turn_type == 'takeCards')) {
                    var needed_count_cards = Config.player.MAX_COUNT_CARDS;
                    var unbind;
                    // запрещаем ходить если игроку еще не выдали все карты
                    // (разрешим в евенте по факту выдачи)
                    if ((human.getCountCards() < needed_count_cards || opponent.getCountCards < needed_count_cards)
                        && !App.deckIsEmpty()) {
                        unbind = true;
                        human.unBindCards();
                    }
                }
                human.setCanStep(true, unbind);
            }

            var cards_for_throw_on_table, cards_for_throw;


            if (last_turn && last_turn.turn_type == 'takeCards') {
                if (last_turn.allow_throw) {
                    cards_for_throw = human.getCardsForThrow(last_turn.cards);
                    if (cards_for_throw) {
                        var count = 0;
                        var opponent_had_cards_before_take = opponent.getCountCards() - last_turn.cards.length + 1;
                        if (opponent_had_cards_before_take > Config.table.max_count_cards) {
                            count = Config.table.max_count_cards - (last_turn.cards.length + 1) / 2;
                        }
                        else {
                            count = opponent_had_cards_before_take;
                        }
                        if (count > 0) {
                            App.trigger('can_throw');
                            App.liftPossibleCards(true, cards_for_throw);
                            human.unBindCards();
                            human.bindCardsForThrow(cards_for_throw, count);
                            if (!Util.countDown.actionInProgress('timer_for_throw')) {
                                Util.countDown.go(Config.interval_actions.throw.time,
                                    function (count) {
                                        App.trigger('timer_for_throw_tick', count);
                                    }, function () {
                                        App.trigger('timer_for_throw_stop');
                                        App.endThrow();
                                    },
                                    'timer_for_throw'
                                );
                            }
                        }
                        else {
                            setTimeout(function () {
                                client.gameManager.sendEvent('event', {data: 'getCards'});
                            }, 500);
                        }
                    }
                    else {
                        setTimeout(function () {
                            client.gameManager.sendEvent('event', {data: 'getCards'});
                        }, 500);
                    }
                }
                else {
                    setTimeout(function () {
                        client.gameManager.sendEvent('event', {data: 'getCards'});
                    }, 500);
                }
                cards_for_throw_on_table = table.getCardsForThrow();
                var allow_throw = human.getCardsForThrow(cards_for_throw_on_table);
                if (cards_for_throw_on_table) {
                    table.clearCardsForThrow();
                    App.Throw({
                        cards: cards_for_throw_on_table,
                        allow_throw: allow_throw
                    });
                    return false;
                }
                return;
            }

            if (last_turn && last_turn.turn_type == 'throw') {
                human.unBindCards();
                var cards = last_turn.cards;
                for (var i in cards) {
                    opponent.step(cards[i]);
                }
                setTimeout(function () {
                    App.humanTakeCards(true, last_turn.allow_throw);
//                    take_cards(true, last_turn.allow_throw);
                }, 1000);
                return;
            }

            cards_for_throw = table.getCardsForThrow();

            if (cards_for_throw) {
                var card = table.shiftCardForThrow();
                App.ThrowTurn({
                    card: card,
                    last_card: human.noCards(),
                    automatic_throw: true
                });
                return;
            }
            if (opponent.getCountCards() == 0 && !App.deckIsEmpty()) {
                if (table.human_attack) {
                    App.putToPile();
                }
            }
        }
        else {
            if (last_turn && last_turn.turn_type == 'throw') {
                human.unBindCards();
                return false;
            }
            if (human && !table.getCardsForThrow())
                human.setCanStep(false);
        }
    });

    client.gameManager.on('event', function (data) {
        var human = App.get('human');
        var opponent = App.get('opponent');
        if (data.event.type == 'addCards') {
            if (data.event.cards) {
                if (App.get('spectate')) {
                    if (data.event.for == App.get('humanId'))
                        human.addCards(data.event.cards, 'bottom');
                    if (data.event.for == App.get('opponentId'))
                        opponent.addCards(data.event.cards, 'top');
                }
                else {
                    if (data.event.target && data.event.target.isPlayer)
                        Util.sequentialActions.add(function () {
                            human.addCards(data.event.cards, true);
                            human.bindCards();
                        }, 500);
                }
            }
            if (data.event.opponent_cards) {
                Util.sequentialActions.add(function () {
                    opponent.addCards(data.event.opponent_cards);
                    human.bindCards();
                }, 500);
            }
            if (data.event.deckIsEmpty) {
                App.set('deck_is_empty', true);
                App.get('Deck').destroy();
                App.get('Trump').hide();
            }
            if (data.event.onlyTrumpRemain) {
                App.get('Deck').destroy();
            }
            if (data.event.cardsRemain != undefined) {
                App.set('deck_remain', data.event.cardsRemain);
                App.renderTrump();
            }
            if (human)
                human.renderCards();
        }
    });

    client.gameManager.on('timeout', function (data) {
        console.log('main;', 'timeout', 'user: ', data.user, 'is your timeout: ', data.user == client.getPlayer().userId);
    });

    client.gameManager.on('round_end', function (data) {
        App.end();
        App.set('in_round', false);
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
        if (!is_opponent)
            App.trigger('my_timer_tick', data.userTimeS);
        else
            App.trigger('opponent_timer_tick', data.userTimeS);
        App.renderKonvaTimer(data.userTimePer, is_opponent, Config.timer);
    });

    client.historyManager.on('game_load', function (game) {
        console.log('historyManager game_load');
        console.log(game);

        if (App.get('spectate') || App.get('in_round'))
            return false;

        var historyUserId = client.historyManager.userId;
        var myId = client.getPlayer().userId;
        var historyResult;
        if (game.winner == null)
            historyResult = Config.text.history.draw;
        else {
            if (+game.winner.userId == +historyUserId)
                historyResult = Config.text.history.win;
            else
                historyResult = Config.text.history.loose;
        }
        App.trigger('history_load_start');
        App.reset();
        App.setTrump(game.initData.inviteData.trumpVal);
        var players = game.players;
        var not_my_story = myId != historyUserId;

        App.set({
            not_my_story: not_my_story,
            humanId: historyUserId,
            my_name: game.userData[historyUserId].userName
        });
        for (var i in players) {
            if (players[i].userId != historyUserId) {
                App.set({
                    opponentId: players[i].userId,
                    opponent_name: players[i].userName
                });
            }
        }
        App.set({
            human: new Human(Config.human),
            opponent: new Human(Config.opponent)
        });
//        if (not_my_story) {
//            App.set({
//                human: new Human(Config.human),
//                opponent: new Human(Config.opponent)
//            });
//        }
//        else {
//            App.set({
//                human: new Human(Config.human),
//                opponent: new Opponent(Config.opponent)
//            });
//        }
        var score = JSON.parse(game.score);
        var mode = game.mode;
        App.set({
            score: score[+App.get('humanId')] + ':' + score[+App.get('opponentId')],
            my_rating: game.userData[App.get('humanId')][mode].rank,
            opponent_rating: game.userData[App.get('opponentId')][mode].rank
        });
        App.renderFromHistory(game.history, true);
        App.trigger('history_load_end', historyResult);
    });

    client.gameManager.on('game_load', function (game) {
        console.log(game);
        App.renderFromHistory(game, false);
    });
//
    client.on('settings_changed', function (data) {
        App.changeProperty(data, true);
    });

    client.on('settings_saved', function (data) {
        App.changeSettings(data, true);
    });

};