module.exports = (server) => {
    const io = require('socket.io')(server);
    let tokengen = require('rand-token');
    const Engine = require('./engine.js');
    let tokens = {};
    let worlds = {};
    io.on('connection', (socket) => {
        socket.on('create-game', (callback) => {
            let tok = "";
            while(((tok = tokengen.generate(4)) in tokens));//Generate token that doesn't already exist
            tokens[tok] = {"playerOne" : socket.id};
            callback(tok);
            socket.join(tok);
        });

        socket.on('join-game', (token, callback) => {
            if(token in tokens){
                //Join Room
                socket.join(token);
                tokens[token].playerTwo = socket.id;
                //create World
                let playerOne = tokens[token].playerOne;
                let playerTwo = socket.id;
                worlds[token] = new Engine(playerOne, playerTwo);

                //Start game cycle
                setInterval(() => {
                    //step game
                    let gameData = worlds[token].step(1/60);
                    socket.to(tokens[token].playerOne).emit("game-state", gameData);
                    socket.emit('game-state', gameData);
                    //export game data
                }, 100/6);
                
                //alert client
                callback(true);
                
            } else {
                callback(false);
            }
        });

        socket.on('create-block', (data, callback) => {
            if(!data.token || !(data.token in tokens)){
                callback(false);
                return;
            }

            let x = data.x;
            let y = data.y;
            if(!worlds[token].addBlock(socket.id, x, y)){
                callback(false);
            }
            callback(true);
        });

        console.log("connection!");
    });
}