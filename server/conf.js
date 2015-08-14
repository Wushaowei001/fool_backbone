module.exports = {
    game: 'fool', // required, game name
    port: 8028,
    pingTimeout: 100000,
    pingInterval: 10000,
    logLevel: 1,
    turnTime: 60,   // user turn time in seconds
    maxTimeouts: 1, // count user timeouts in game to lose
    minTurns: 3,
    ratingElo: true,
    sounds: false,
    loseOnLeave: false,     // player lose game or not after leave
    reconnectOldGame: true, // continue old game on reconnect or auto leave
    spectateEnable: true,   // on/off spectate games
    mode: 'develop', // set developing mode, db isn't required
    penalties: true,
    gameModes: ['default', 'deck_52'], // game modes, with different history, ratings, games, default is one mode ['default']
    modesAlias: {'default': '36 карт', 'deck_52': '52 карты'},
    enableIpGames: false,
    mongo: {
        host: '192.168.250.40', port: '27001'
    },
//    httpsKey: '/etc/apache2/ssl/serv.key',
//    httpsCert: '/etc/apache2/ssl/serv.crt',
//    httpsCa: ["/etc/apache2/ssl/sub.class1.server.ca.pem", "/etc/apache2/ssl/ca.pem"],
    https: false,
    adminList: ['85505', '460981', '448039', '40', '144'],
    closeOldConnection: true
};