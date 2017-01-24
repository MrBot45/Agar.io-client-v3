var config = require('../config');
var app = require('http').createServer()
var io = require('socket.io')(app);
var fs = require('fs');
var change = false;
var databuf = null;
var s = null;
var idf = 0;
require("colors");
app.listen(config.serverPort);

console.log(("[SERVER] ").green + ("Starting server on port " + config.serverPort).white);



function load() {
    var figlet = require('figlet');
    figlet('lefela4-Client', function (err, data) {
        console.log(data);
        console.log('               Agar.io bots made by lefela4');
		
            console.log('');
			console.log(('[INFO] ').cyan + ('Made by lefela4').white);
            console.log(('[INFO] ').cyan + ('Feeder is started !').white);
			console.log(('[INFO] ').cyan + ('Current version : ').white+('1.0.0').green);
			console.log(('[VERSION] ').cyan + ('Please look each 2 or 3 days for comming update !').white);
			console.log(('[STATUS] ').green + ('Max tested: 500. (500 = 60 Lefela4 config value)').green);
            
			
			function a () {
				
					console.log(('[ERROR] ').red + ('THIS VERSION IS UNSTABLE PLEASE DONT ABUSE.').red);
					console.log('');
			}
			
			setTimeout(a, 1000);
			
			
    });
}



io.on('connection', function(socket) {

	var cli = {};

  socket.on('login', function(data) {
	
	cli = data
	
    console.log(("[SERVER] ").green + ("User connected with id:" + data.uuid).white);
    socket.room = data.uuid;
    socket.join(data.uuid);

    if (data.type == "server") {      
      io.sockets.in(socket.room).emit("force-login", "server-booted-up");
	  idf = 0;
    }

  });

  socket.on('pos', function(data) {

    io.sockets.in(socket.room).emit('pos', data);
	
  });
  
    socket.on('size', function(data) {
	  
    io.sockets.in(socket.room).emit('pos', data);
	
  });
  
  socket.on('close', function(data) {
    
	clearInterval(s);
	socket.room = null;
    socket.leave();
	socket.conn.close();

	s = null;
	
  });
  
  socket.on('disconnect', function(data) {
    
	clearInterval(s);
	socket.room = null;
    socket.leave();
	socket.conn.close();

	s = null;
	
  });
  

  
  function send(val) {
	  
	  idf++;
	  console.log(idf);
	  if (idf == 1) { // 2 <= 1
		  s = setInterval(function() {
			if (change == false) {
				
				io.sockets.in(socket.room).emit('buf', databuf);
				
			}else{
				
				change = true;
				clearInterval(s);
				
			}
			
		}, 1000);
		
	}  
	
}
  
  
  socket.on('buf', function(data) {
    
	databuf = data;
	console.log(data);
	send(1);
	
  });

  socket.on('cmd', function(data) {
    console.log(data);
    io.sockets.in(socket.room).emit('cmd', data);
  });
  
  socket.on("spawn-count", function(data) {
    io.sockets.in(socket.room).emit("spawn-count", data);
    });

  socket.emit("force-login", "startup");

  
  
});


load();

require("./cmd.js");

