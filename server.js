var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server) 



var connections = [];
var servers = [1,2,3,4,5];
//var lobbies = servers.map(e => ({server: e ,sockets: []}));
var lobbies = [[],[],[],[],[]];
var active = [false,false,false,false,false]



server.listen(process.env.PORT || 11328);
console.log("server running...");


io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log("%s sockets", connections.length);

    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        console.log("dis, %s sockets", connections.length);

    });
    socket.on('CheckPlayers', function(data){
        socket.emit('ActivePlayers', {PInfo: connections.length});


    });
    socket.on('CheckServers', function(data){
        socket.emit('ActiveServers', {SInfo: lobbyInfo()});


    });
    socket.on('leave', function(data){
        lobby.splice(connections.indexOf(socket),1);
    });
    
    
});

function test2(){
    if(connections.length==1){
        var sender = connections[0];
        //var recv = connections[1];
    
        sender.on('lo', function(data){
            console.log(data[0], data[1]);
           // io.recv.emit('position',{newp: data});
        });
    
    };
}

function lobbyInfo(){
    var players = [];
     for(i in lobbies){
         players.push(i.length);
     }
     return players;

}

// if(connections.length == 2){
//     var sender = connections[0];
//     var recv = connections[1];

//     sender.on('lo', function(data){
//         console.log(data[0], data[1]);
//         recv.emit('position',{newp: data});
//     });
// }








        