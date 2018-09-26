var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')

app.use(bodyParser.json())

var listOfUsers = [];

app.get('/', function(req, res){
    res.send('Hello World');
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('initUserList', function(msg){
        console.log('user list is initialized.');
        io.emit('initUserList-'+msg.from.id, listOfUsers);
    });

    socket.on('sendmessageOnEnter', function(msg){
        console.log('send message to .', JSON.stringify(msg));
        io.emit('recieveMessageOnEnter-'+msg.to.id, msg);
    });

    socket.on('sendmessage', function(msg){
        console.log('send message to .', JSON.stringify(msg));
        io.emit('recieveMessage-'+msg.to.id, msg);
    });

    socket.on('sendTypings', function(msg){
        console.log('send message to .', JSON.stringify(msg));
        io.emit('recieveTypings-'+msg.to.id, msg);
    });

    socket.on('joined', function(msg){
        //console.log('User is joined. ', JSON.stringify(msg));
        listOfUsers.push(msg.from);
        //console.log('msg.from ', msg.from)
        io.emit('newUserAdded', msg.from);
    });

    socket.on('disconnect', function(){
        console.log('User is disconnected.');
        // io.emit('chat message', msg);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});