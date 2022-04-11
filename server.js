var express = require('express');
const { SocketAddress } = require('net');
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
    socket.on('joinAckName', function(data){
        var game = parseInt(data[0])
        lobbies[game][1].emit('ConnectedPlayerName', {Pname : data[1]});
    });
    socket.on('lobbyInfo', function(data){
        lobbies[data[0]][1].emit('LobbyInfo', {info : [data[1],data[2]]});
        
        
    });
    socket.on('ready', function(data){
        var index = lobbies[data[0]].indexOf(socket)
        if(index == 0){
            index = 1
        }
        else{
            index = 0
        }

        lobbies[data[0]][index].emit('Ready', {Rstatus : data[1]});
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

    socket.on('leave', function(data){
        removeFromLobby(socket);
    });
  
});


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
            if(lobbies[i].length>0){
                lobbies[i][0].emit("playerLeft");
            }
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








        