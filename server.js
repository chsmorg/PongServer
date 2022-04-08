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
        removeFromLobby(socket);
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
    socket.on('host', function(data){
        if(lobbies[data].length < 1){
            lobbies[data].push(socket);
            socket.emit('PlayerNum', {Pnum: lobbies[data].length});
            console.log("hosted")
        }
        else{
           // socket.emit('CannotHost', {Pnum: lobbies[data].length});
        }
        
    });
    socket.on('join', function(data){
        var game = parseInt(data[0])
        if(lobbies[game].length == 0){
            lobbies[game].push(socket);
            socket.emit('PlayerNum', {Pnum: lobbies[game].length});
            //lobbies[game][0].emit('ConnectedPlayerName', {pName : data[1]});
        }
        else if(lobbies[game].length == 1){
            lobbies[game].push(socket);
            socket.emit('PlayerNum', {Pnum: lobbies[game].length});
            lobbies[game][0].emit('ConnectedPlayerName', {Pname : data[1]});
            //socket.emit('CannotJoin', {Pnum: lobbies[data].length});
        }
        
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
         players.push(lobbies[i].length);
         
     }
     return players;

}
function removeFromLobby(socket){
    for(i in lobbies){
        if(lobbies[i].indexOf(socket) != -1){
            lobbies[i].splice(lobbies[i].indexOf(socket),1);
            return;
        }
    }
}

// if(connections.length == 2){
//     var sender = connections[0];
//     var recv = connections[1];

//     sender.on('lo', function(data){
//         console.log(data[0], data[1]);
//         recv.emit('position',{newp: data});
//     });
// }








        