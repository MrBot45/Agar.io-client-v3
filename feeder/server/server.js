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
	  console.log(data);
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
