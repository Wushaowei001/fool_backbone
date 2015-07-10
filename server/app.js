var Server = require('v6-game-server'),
    engine = require('./engine.js'),
    conf = require('./conf.js'),
    server = new Server(conf, engine);

server.start();

