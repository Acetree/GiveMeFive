
let express = require('express');

let app = express();

app.use('/', express.static('public'));


let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;


server.listen(port, () => {
    console.log("Server listening at port: " + port);
});



let io = require('socket.io');
io = new io.Server(server);

let allClients = [];

class Hand {
    constructor(_sid, _x, _y, _name) {
        this.sid = _sid,
            this.x = _x,
            this.y = _y,
            this.name = _name
    }
}


io.sockets.on('connection', function (socket) {
    console.log("---- new client: " + socket.id + " ----");
    let newClient = new Hand(socket.id, 0, 0);
    allClients.push(newClient);
    console.log("---- current online client: " + allClients.length + " ----");

    socket.on('mousePos', function (mousePos) {
        let hand = new Hand(socket.id, mousePos.x, mousePos.y, mousePos.name);
        for (let i = 0; i < allClients.length; i++) {
            if (hand.sid == allClients[i].sid) {
                allClients[i].x = hand.x;
                allClients[i].y = hand.y;
                allClients[i].name = hand.name;
                break;
            }
        }
        socket.broadcast.emit('hand', hand);
    });

    socket.on('disconnect', function () {
        console.log("---- client left " + socket.id + " ----");
        for (let i = 0; i < allClients.length; i++) {
            if (socket.id == allClients[i].sid) {
                allClients.splice(i, 1);
                break;
            }
        }
        socket.broadcast.emit('clientLeft', socket.id);
    });
});
