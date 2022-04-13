//var express = require('express');
//const { SocketAddress } = require('net');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const { SocketAddress } = require("net");
//var app = express();
//var server = require('http').createServer(app);
//var io = require('socket.io')(server) 
const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
  });

instrument(io, {
    auth: false
  });
  var connections = [];
  var servers = [1,2,3,4,5];
  var lobbies = [[],[],[],[],[]];
  var active = [false,false,false,false,false]



httpServer.listen(11328);
//server.listen(process.env.PORT || 11328);
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
        //socket.emit('ActiveGames',{GInfo: active});
    });
    socket.on('joinAckName', function(data){
        
            var game = parseInt(data[0])
            if(lobbies[game].length==2){
            lobbies[game][1].emit('ConnectedPlayerName', {Pname : data[1]});
        }
    });
    socket.on('lobbyInfo', function(data){
        if(lobbies[data[0]].length==2){
            lobbies[data[0]][1].emit('LobbyInfo', {info : [data[1],data[2]]});
        }
        
        
    });
    socket.on('GameStart', function(data){
        if(lobbies[data[0]].length==2){
            lobbies[data[0]][1].emit('GameStart', {start : [data[1]]});
            lobbies[data[0]][0].emit('GameStartAck');
            active[data[0]] = true;
        }
        
    });
    socket.on('ready', function(data){
        if(lobbies[data[0]].length==2){
            var index = lobbies[data[0]].indexOf(socket)
            if(index == 0){
             index = 1
         }
         else{
             index = 0
         }

         lobbies[data[0]][index].emit('Ready', {Rstatus : data[1]});
        }
    });

    socket.on('host', function(data){
        socket.close();
        socket = io.connect('/1'); 
        socket.join(lobbyNum);
        socket.emit('PlayerNum', {Pnum: 1});
    });

 
    socket.on('join', function(data){
        var game = parseInt(data[0])
        if(lobbies[game].length == 0){
            
            lobbies[game].push(socket);
            socket.emit('PlayerNum', {Pnum: lobbies[game].length});
            
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

    socket.on('ConnectedPlayerInfo', function(data){
        if(lobbies[data[0]].length > 1){
            lobbies[data[0]][0].emit('ConnectedPlayerInfo', {CPinfo : data[1]});
        }

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

// socket.on('join', function(data) {
//     var rooms = roomNames();
//     var players = findRooms();
//     if(data[0] == "rand"){  
//         for(var i = 0; i< rooms.length-1; i++){
//             if(players[i] == 1){
//                 socket.close();
//                 socket = io.connect('/2');
//                 socket.join(room[i]);
//                 socket.emit('PlayerNum', {Pnum: 2});
//                 io.of("/1").to(rooms[i]).emit('ConnectedPlayerName', {Pname : data[1]});
//                 return;
//             }
//         }
//         socket.emit('noGames');
//     }
//     else{
//         for(var i = 0; i< rooms.length-1; i++){
//             if(data[0]==rooms[i]){
//                 if(player[i]==1){
//                     socket.close();
//                     socket = io.connect('/2');
//                     socket.emit('PlayerNum', {Pnum: 2});
//                     io.of("/1").to(rooms[i]).emit('ConnectedPlayerName', {Pname : data[1]});
//                     return;
//                 }
//                 else{
//                     socket.emit('noGames');
//                     return;
//                 }
//             }
//         }
//     }

// });








        