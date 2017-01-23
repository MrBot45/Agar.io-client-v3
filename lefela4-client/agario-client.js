var WebSocket    = require('ws');
var Packet       = require('./packet.js');
var servers      = require('./servers.js');
var Account      = require('./account.js');
var EventEmitter = require('events').EventEmitter;

var c = {};

var BinaryReader = require('./BinaryReader');
function uncompress(input, output, sIdx, eIdx) {
	sIdx = sIdx || 0
	eIdx = eIdx || (input.length - sIdx)
	// Process each sequence in the incoming data
	for (var i = sIdx, n = eIdx, j = 0; i < n;) {
		var token = input[i++]

		// Literals
		var literals_length = (token >> 4)
		if (literals_length > 0) {
			// length of literals
			var l = literals_length + 240
			while (l === 255) {
				l = input[i++]
				literals_length += l
			}

			// Copy the literals
			var end = i + literals_length
			while (i < end) output[j++] = input[i++]

			// End of buffer?
			if (i === n) return j
		}

		// Match copy
		// 2 bytes offset (little endian)
		var offset = input[i++] | (input[i++] << 8)

		// 0 is an invalid offset value
		if (offset === 0 || offset > j) return -(i-2)

		// length of match copy
		var match_length = (token & 0xf)
		var l = match_length + 240
		while (l === 255) {
			l = input[i++]
			match_length += l
		}

		// Copy the match
		var pos = j - offset // position of the match copy in the current output
		var end = j + match_length + 4 // minmatch = 4
		while (j < end) output[j++] = output[pos++]
	}

	return j
}
function Client(client_name, a, b, c, d, e) {
    //you can change these values
    this.client_name      = client_name; //name used for log
    this.debug            = 5;           //debug level, 0-5 (5 will output extremely lots of data)
    this.inactive_destroy = 5*60*1000;   //time in ms when to destroy inactive balls
    this.inactive_check   = 10*1000;     //time in ms when to search inactive balls
    this.spawn_interval   = 200;         //time in ms for respawn interval. 0 to disable (if your custom server don't have spawn problems)
    this.spawn_attempts   = 25;          //how much attempts to spawn before give up (official servers do have unstable spawn problems)
    this.agent            = null;        //agent for connection. Check additional info in README.md
    this.local_address    = null;        //local interface to bind to for network connections (IP address of interface)
    this.headers          = {            //headers for WebSocket connection.
        'Origin': 'http://agar.io'
    };

    //don't change things below if you don't understand what you're doing

    this.tick_counter      = 0;    //number of ticks (packet ID 16 counter)
    this.inactive_interval = 0;    //ID of setInterval()
    this.balls             = {};   //all balls
    this.my_balls          = [];   //IDs of my balls
    this.score             = 0;    //my score
    this.leaders           = [];   //IDs of leaders in FFA mode
    this.teams_scores      = [];   //scores of teams in Teams mode
    this.auth_token        = '';   //auth token. Check README.md for how to get it
    this.auth_provider     = 1;    //auth provider. 1 = facebook, 2 = google
    this.spawn_attempt     = 0;    //attempt to spawn
    this.spawn_interval_id = 0;    //ID of setInterval()
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.e = e;
	//Skin
	this.skin = false;
	this.skin_name = "";
	
	//Name
	this.name = "";
	
	//ID 
	this.ball_id = 0;
}

Client.prototype = {
    connect: function(server, key) {
        var opt = {
            headers: this.headers
        };
        if(this.agent) opt.agent = this.agent;
        if(this.local_address) opt.localAddress = this.local_address;

        this.ws            = new WebSocket(server, null, opt);
        this.ws.binaryType = "arraybuffer";
        this.ws.onopen     = this.onConnect.bind(this);
        this.ws.onmessage  = this.onMessage.bind(this);
        this.ws.onclose    = this.onDisconnect.bind(this);
        this.ws.onerror    = this.onError.bind(this);
        this.server        = server;
        this.key           = key;

        if(this.debug >= 1) {
            this.log('connecting');
        }

        this.emitEvent('connecting');
    },

    disconnect: function() {
     //   if(this.debug >= 1)
            console.log('disconnect() called');

        if(!this.ws) {
        //    if(this.debug >= 1)
                console.log('[warning] disconnect() called before connect(), ignoring this call');
            return false;
        }

        this.ws.close();
        return true;
    },

    onConnect: function() {
        var client = this;

        if(this.debug >= 1)
            this.log('connected to server');

        this.inactive_interval = setInterval(this.destroyInactive.bind(this), this.inactive_check);

        var buf = new Buffer(5);
        buf.writeUInt8(254, 0);
        buf.writeUInt32LE(11, 1);


		
        if(this.ws.readyState !== WebSocket.OPEN) { //`ws` bug https://github.com/websockets/ws/issues/669 `Crash 2`
            this.onPacketError(new Packet(buf), new Error('ws bug #669:crash2 detected, `onopen` called with not established connection'));
            return;
        }

        this.send(buf);
		
		console.log(this.a, this.b, this.c, this.d, this.e);
		
    buf = new Buffer(5);
        buf.writeUInt8(this.a, 0);
		buf.writeUInt8(this.b, 1);
		buf.writeUInt8(this.c, 2);
		buf.writeUInt8(this.d, 3);
		buf.writeUInt8(this.e, 4);
		
	
        client.emitEvent('connected');
    },

    onError: function(e) {
        if(this.debug >= 1)
            console.log('connection error: ' + e);

        this.emitEvent('connectionError', e);
        this.reset();
    },

    onDisconnect: function() {
        //if(this.debug >= 1)
            console.log('disconnected');

        this.emitEvent('disconnect');
        this.reset();
    },

    onMessage: function(e) {
		
		 var packet    = new Packet(e);
        if(!packet.length) {
            return this.onPacketError(packet, new Error('Empty packet received'));
        }
		
		var str = packet.toString();
			var d = str.replace(/\s/g, '');
			var buffer_compressed = new Buffer(d, "hex");
		
	/*	const crypto = require('crypto');
		const decipher = crypto.createDecipher('aes192', 'a password');

		
		var decrypted = decipher.update(buffer_compressed, 'hex', 'hex');
		
		decrypted += decipher.final();
		console.log(decrypted);
		
       */
        var packet_id = packet.readUInt8();
	//	if (packet_id != 255) return;
        var processor = this.processors[packet_id];
        if(!processor) return this.log('[warning] unknown packet ID(' + packet_id + '): ' + packet.toString());
		

       // if(this.debug >= 4)
            this.log('RECV packet ID=' + packet_id + ' LEN=' + packet.length);
        //if(this.debug >= 5)
        console.log('dump: ' + packet.toString());

        this.emitEvent('message', packet);

        try {
			
            processor(this, packet, e);
			
			
        }catch(err){
            this.onPacketError(packet, err);
        }
    },

    // Had to do this because sometimes packets somehow get moving by 1 byte
    // https://github.com/pulviscriptor/agario-client/issues/46#issuecomment-169764771
    onPacketError: function(packet, err) {
        var crash = true;
		console.log(err);
        this.emitEvent('packetError', packet, err, function() {
            crash = false;
        });

        if(crash) {
            if(this.debug >= 1)
                //this.log('Packet error detected! Check packetError event in README.md');
            throw err;
        }
    },

    send: function(buf) {
        if(this.debug >= 4)
            this.log('SEND packet ID=' + buf.readUInt8(0) + ' LEN=' + buf.length);

        if(this.debug >= 5)
            this.log('dump: ' + (new Packet(buf).toString()));

        this.ws.send(buf);
    },

    reset: function() {
        if(this.debug >= 3)
            this.log('reset()');

        clearInterval(this.inactive_interval);
        clearInterval(this.spawn_interval_id);
        this.spawn_interval_id = 0;
        this.leaders           = [];
        this.teams_scores      = [];
        this.my_balls          = [];
        this.spawn_attempt     = 0;

        for(var k in this.balls) if(this.balls.hasOwnProperty(k)) this.balls[k].destroy({'reason':'reset'});
        this.emitEvent('reset');
    },

    destroyInactive: function() {
        var time = (+new Date);

        if(this.debug >= 3)
            this.log('destroying inactive balls');

        for(var k in this.balls) {
            if(!this.balls.hasOwnProperty(k)) continue;
            var ball = this.balls[k];
            if(time - ball.last_update < this.inactive_destroy) continue;
            if(ball.visible) continue;

            if(this.debug >= 3)
                this.log('destroying inactive ' + ball);

            ball.destroy({reason: 'inactive'});
        }
    },

    processors: {
        //tick
        '16': function(client, packet, type) {
		if (packet.toString('hex') == '10 00 00 00 00 00 00 00 00') {
			
			console.log("Clearning...");
			
			return;
			
			
		} 
	//	if (packet.length < 21) return; 
			console.log(packet.toString('hex'));
			console.log("Packet 16 :D");
			packet.offset = 1;
            var eaters_count = packet.readUInt16LE(1);
			var offset = 3;
			packet.offset = 3;
			
            client.tick_counter++;
		//	console.log(eaters_count);
            //reading eat events
            for(var i=0;i<eaters_count;i++) {
                var eater_id = packet.readUInt32LE(offset);
				//packet.offset2 += 4;
                var eaten_id = packet.readUInt32LE(offset + 4);
				//packet.offset2 += 4;
				offset = offset + 8;
                if(client.debug >= 4)
                 console.log(eater_id + ' ate ' + eaten_id + ' (' + client.balls[eater_id] + '>' + client.balls[eaten_id] + ')');

                if(!client.balls[eater_id]) new Ball(client, eater_id);
                client.balls[eater_id].update();
                if(client.balls[eaten_id]) client.balls[eaten_id].destroy({'reason':'eaten', 'by':eater_id});

                client.emitEvent('somebodyAteSomething', eater_id, eaten_id);
            }

            //reading actions of balls
            while(1) {
                var is_ejected_food_or_virus = false;
                var ball_id;
                var coordinate_x;
                var coordinate_y;
                var size;
                var color;
                var nick = null;
				var Skin_name = ''; //Premium skin ^^
				var isEjecting = false;
				var isAgitated = false;
				var lvl = 0;
				if (packet.length < offset + 4) break;
					
				
                ball_id = packet.readUInt32LE(offset);

                if(ball_id == 0)  {
					
					//offset += 4;
					console.log("Ball_ID = 0");
					break;
				}
					
				offset += 4;
				
                coordinate_x = packet.readSInt32LE(offset);
				offset += 4;

                coordinate_y = packet.readSInt32LE(offset);
				offset += 4;

                size = packet.readUInt16LE(offset);
				offset += 2;

				 var maxLen = 15;
				 var lon = -1;
				 var s = 0;
				 
				 
				 
				 var flags = packet.readUInt8(offset);
				 offset += 1;
				 console.log("Flags: " + flags);
				 
				 				
				is_ejected_food_or_virus = !!(flags & 1);
				
				var isColorPresent = !!(flags & 2);	
				
				var isSkinPresent = !!(flags & 4);
				
				var isPlayerName = !!(flags & 8);	
								
				isAgitated = !!(flags & 10);
				
				 if (isColorPresent == true) {
					 
					console.log("Color Present");
					
					var color_R = packet.readUInt8(offset);

					offset += 1;
					var color_G = packet.readUInt8(offset);

					offset += 1;
					var color_B = packet.readUInt8(offset);

					offset += 1;

					color = (color_R << 16 | color_G << 8 | color_B).toString(16);
					color = '#' + ('000000' + color).substr(-6);

					
					console.log(color);
					 
				 }
			
				if (flags == 130) {
				
					console.log("is_ejected_food_or_virus " + is_ejected_food_or_virus);
					
					var what_is_ejected_food_or_virus = packet.readUInt8(offset);
					
					offset += 1;
					
					if (what_is_ejected_food_or_virus == 0x1d) {
						
						console.log("IS a ????");
						
					} else if (what_is_ejected_food_or_virus == 0xff) {
						
						console.log("IS an EJECTED MASS !!!");
						
					} else if (what_is_ejected_food_or_virus == 0x07) {
						
						console.log("IS a ????");
						
					} else if (what_is_ejected_food_or_virus == 0x28) {
						
						console.log("IS a ????");
						
					} else if (what_is_ejected_food_or_virus == 0x88) {
						
						console.log("IS a ????");
						
					} else if (what_is_ejected_food_or_virus == 0x46) {
						
						console.log("IS a ????");
						
					}else if (what_is_ejected_food_or_virus == 0x01) {
						
						console.log("IS a virus !");
						
					}else{
						
						console.log("Null type pls add : " + what_is_ejected_food_or_virus);
						
					}
					
					
				}
				
				
				if (isAgitated) {
					
					console.log("This player or virus or food ejected is moving !");
					
				}
				
				
				if (isSkinPresent) {
                    while(1) {
                        var char = packet.readUInt8(offset); 
						offset++;
						packet.offset = offset;
						
                        if(char == 0) {
							break;
						}else{
							
							if(!Skin_name) Skin_name = '';
							Skin_name += String.fromCharCode(char);
						}
                       
                    }
					if (Skin_name != '') {
						
						console.log(Skin_name);
					}
				 }
				 
				 if (isPlayerName) {
					// offset = 18;
					 while(1) {
					 if (s < maxLen) {
						 
						 
						 var char = packet.readUInt8(offset); 
						offset++;
						packet.offset = offset;
						
                        if(char == 0) {
							console.log("NICK_NAME OF THIS PLAYER: "+ nick);
							break;
						}else{
							
							if(!nick) nick = '';
							nick += String.fromCharCode(char);
						}
                       
						 
					 }else{
						 
						 console.log("[ERROR] [PACKET_16] [NICKNAME DECODING] at line 449++ code = 6");
						 
					 }

                    }
					if (nick != '' && nick != null) {
						
						console.log(nick);
					}
					 
				 }
				  
                var ball = client.balls[ball_id] || new Ball(client, ball_id);
                ball.color = color;
                ball.virus = is_ejected_food_or_virus;
                ball.setCords(coordinate_x, coordinate_y);
                ball.setSize(size);
                if(nick) ball.setName(nick);
				//if(Skin_name) ball.setSkin(Skin_name);
                ball.update_tick = client.tick_counter;
                ball.appear();
                ball.update();

                //if(client.debug >= 5)
                console.log('action: ball_id=' + ball_id + ' coordinate_x=' + coordinate_x + ' coordinate_y=' + coordinate_y + ' size=' + size + ' is_ejected_food_or_virus=' + is_ejected_food_or_virus + ' nick=' + nick + ' Skin name=' + Skin_name);
				packet.offset = offset;
                client.emitEvent('ballAction', ball_id, coordinate_x, coordinate_y, size, is_ejected_food_or_virus, nick);
				//offset -= 4;
				//break;
            }
			
			
			
		    //if (offset2 + 8 < packet.length) {
				
			var balls_on_screen_count = packet.readUInt32LE(offset);
			offset = offset + 4;
			
			console.log(balls_on_screen_count);
				//disappear events
				for (i=0;i<balls_on_screen_count;i++) {
					offset = packet.length;
					packet.offset = packet.length;
					break;
					ball_id = packet.readUInt32LE(offset2);
					offset2 = offset2 + 4;
					
					ball = client.balls[ball_id] || new Ball(client, ball_id);
					if (ball.mine) {
						ball.destroy({reason: 'merge'});
						client.emitEvent('merge', ball.id);
					} else {
						ball.disappear();
						ball.update_tick = client.tick_counter;
						ball.update();
					}
				}
				
			//}
			

        },

        //update spectating coordinates in "spectate" mode
        '17': function(client, packet) {
            var x    = packet.readFloat32LE(1);
            var y    = packet.readFloat32LE(5);
            var zoom = packet.readFloat32LE(9);

            if(client.debug >= 4)
                client.log('spectate FOV update: x=' + x + ' y=' + y + ' zoom=' + zoom);

            client.emitEvent('spectateFieldUpdate', x, y, zoom);
        },

        '18': function() {
            for(var k in this.balls) if(this.balls.hasOwnProperty(k)) this.balls[k].destroy({'reason':'server-forced'});
        },

        '20': function() {
            
			console.log("Packet 20");
			
        },

        //debug line drawn from the player to the specified point
        '21': function (client, packet) {
            var line_x = packet.readSInt16LE(1);
            var line_y = packet.readSInt16LE(3);

            if (client.debug >= 4)
                client.log('debug line drawn from x=' + line_x + ' y=' + line_y);
            client.emitEvent('debugLine', line_x, line_y);
        },

        //new ID of your ball (when you join or press space)
        '32': function(client, packet) {
            var ball_id = packet.readUInt32LE(1);
            var ball    = client.balls[ball_id] || new Ball(client, ball_id);
            ball.mine   = true;
            if(!client.my_balls.length) client.score = 0;
            client.my_balls.push(ball_id);

           // if(client.debug >= 2)
                client.log('my new ball: ' + ball_id);

            if(client.spawn_interval_id) {
                if(client.debug >= 4)
                    client.log('detected new ball, disabling spawn() interval');
                client.spawn_attempt = 0;
                clearInterval(client.spawn_interval_id);
                client.spawn_interval_id = 0;
            }

            client.emitEvent('myNewBall', ball_id);
        },

        //leaderboard update in FFA mode
        '49': function(client, packet) {
				var str = packet.toString();
				var d = str.replace(/\s/g, '');
				var data = new Buffer(d, "hex");
			   // var data = packet;
                let entries = [];
                let offset = 1;
                let count = data.readUInt32LE(offset);

                offset += 4;

                for (let i = 0; i < count; ++i) {
                    let highlight = data.readUInt32LE(offset);

                    offset += 4;

                    let len = 0;

                    // looking for the null terminated string
                    while (data.readUInt8(offset + len) !== 0) {
                        ++len;
                    }

                    let strBuf = data.slice(offset, offset + len);

                    entries.push([highlight, String.fromCharCode.apply(null, new Uint8Array(strBuf))]);

                    offset += len + 1;
                }
		
            client.emitEvent('leaderBoardUpdate', entries);
        },

        //teams scored update in teams mode
        '50': function(client, packet) {
            var teams_count  = packet.readUInt32LE(1);
            var teams_scores = [];

            for (var i=0;i<teams_count;++i) {
                teams_scores.push(packet.readFloat32LE());
            }

            if(JSON.stringify(client.teams_scores) == JSON.stringify(teams_scores)) return;
            var old_scores = client.teams_scores;

            if(client.debug >= 3)
                client.log('teams scores update: ' + JSON.stringify(teams_scores));

            client.teams_scores = teams_scores;

            client.emitEvent('teamsScoresUpdate', old_scores, teams_scores);
        },

        //map size load
        '64': function(client, packet) {
			var offset = 1;		
			var min_x = packet.readFloat64LE(1);
            var min_y = packet.readFloat64LE(9);
            var max_x = packet.readFloat64LE(17);
            var max_y = packet.readFloat64LE(25);
			packet.offset = 33;
			offset = 33;
			
			var type = packet.readSInt32LE(33);
			
			offset += 4;
			
			var v;
			
			 while(1) {
                        var char = packet.readUInt8(offset);
						//console.log(char);
                        if(char == 0) {
							offset = offset + 1;
							break;
						}
                        if(!v) v = '';
                        v += String.fromCharCode(char);
						offset = offset + 1;
             }
			
			
			
			packet.offset = offset;
			
			
			
			// console.log(packet.toString());
			/*var name = "null";
			
			//if (packet.length != 33) {
				
					var str = packet.toString();
					var d = str.replace(/\s/g, '');
					var buf = new Buffer(d, "hex");
					
					
					
                    let len = 0;

                    // looking for the null terminated string
                    while (buf.readUInt8(offset + len) !== 0) {
                        ++len;
                    }

                    let strBuf = buf.slice(offset, offset + len);
console.log(strBuf);
                    var name = String.fromCharCode.apply(null, new Uint8Array(strBuf));

                    offset += len + 1;
				
					
				
				
		//	}
			*/
	
			
          //  if(client.debug >= 2)
                client.log('Server Info: [MAP]: ' + [min_x, min_y, max_x, max_y].join(',') + " [TYPE]: " + type + " [VERSION]: " + v);

            client.emitEvent('mapSizeLoad', min_x, min_y, max_x, max_y);
        },

        //another unknown packet
        '72': function() {
            //packet is sent by server but not used in original code
        },

        '81': function(client, packet) {
            var level       = packet.readUInt32LE(1);
            var curernt_exp = packet.readUInt32LE(5);
            var need_exp    = packet.readUInt32LE(9);

       //     if(client.debug >= 2)
                client.log('experience update: ' + [level, curernt_exp, need_exp].join(','));

            client.emitEvent('experienceUpdate', level, curernt_exp, need_exp);
        },

        '102': function() {
            // This packet used for some shop server wss://web-live-v3-0.agario.miniclippt.com/ws
            // There is some "reserved" code for it in "account.js" that you can check. But it is not used since this server is useless for client
            // https://github.com/pulviscriptor/agario-client/issues/78
        },

        '103': function(client) {
            // Processor for that packet is missing in official client but @SzAmmi reports that he receives it
            // https://github.com/pulviscriptor/agario-client/issues/94
            client.emit('gotLogin');
        },

        //server forces client to logout
        '104': function(client, packet) {
            client.emitEvent('logoutRequest');
        },

        '240': function(client, packet) {
			console.log("Packet: 240");

	
        },

		'241': function(client, packet) {
			
			console.log("Packet: 241");
			
			//packet.offset += 4;
            var packet_id = packet.readUInt8();
            var processor = client.processors[packet_id];
            if(!processor) return client.log('[warning] unknown packet ID(240->' + packet_id + '): ' + packet.toString());
            processor(client, packet);
			
		},
        //somebody won, end of the game (server restart)
        '254': function(client) {
            if(client.debug >= 1)
                client.log(client.balls[client.leaders[0]] + ' WON THE GAME! Server going for restart');

            client.emitEvent('winner', client.leaders[0]);
        },
		
		'255': function(client, packet, buf) {
		//	var patternLength = (0xFF & 0x0F) + 4;
					
			function readBytes(buffer, offset, length) {
				
				var offset = (typeof length) == 'number' ? length : offset;
				
				return buffer.slice(offset, offset + length);
				
				offset = offset + length;
				
			}
			
			function decimalToHexString(number)
			{
				if (number < 0)
				{
					number = 0xFFFFFFFF + number + 1;
				}

				return number.toString(16).toUpperCase();
			}
			var message_id = 255;

			var offset = packet.offset;
			
			var packet_id = message_id;
			
			var Uncompressed_Length = packet.readUInt32LE(1);
			
			packet.offset += 4;
			
			var type = packet.readBytes(1); //packet.readUInt8(packet.offset);
			
			packet.offset += 4;
			
			var Compression_Offset = packet.readBytes(1);  //packet.readBytes(2); //packet.readUInt8(packet.offset);
			
			packet.offset += 4;
			
			//console.log("Packet offset: " + packet.offset);
			
			if (parseInt(Compression_Offset.toString('hex'), 16) >= 255) {
				
					var Extended_Compression_Offset = packet.readBytes(1);
					
					packet.offset += 1;
					console.log("Extended_Compression_Offset: " + Extended_Compression_Offset);
			}
		
			var ca = packet.length - 1;
			
			var message_compressed = packet.readBytes(ca, true);
			
			//console.log("Message id: " + packet_id + " Uncompressed Length: " + Uncompressed_Length, "Compression Type: " + type.toString('hex'), "Compression Offset: " + parseInt(Compression_Offset.toString('hex'), 16));  //, "Extended Compression Offset: " + Extended_Compression_Offset.toString('hex'));
			//console.log("Message Compressed: ", packet.toString());
			
			var sa = parseInt(type.toString('hex'), 16);
			
			var tid = decimalToHexString(sa);
			
			var patternLength = (type.toString('hex') & 0x0f) + 4;
			
			//console.log("Pattern Length: " + patternLength, "Formule: ("+tid+" & 0x0f) + 4");
			
			var str = message_compressed.toString('hex');
			var d = str.replace(/\s/g, '');
			var buffer_compressed = new Buffer(d, "hex");
		//	console.log(buffer_compressed);
			//console.log(buffer_compressed);
			
			//buffer_compressed.offset = patternLength;
			var lz4 = require("node-lz4");
			//var input = "";
			
			var input = new Uint8Array(buffer_compressed);
			
			var output = new Buffer(Uncompressed_Length);
			
			var uncompressedSize = lz4.decodeBlock(input, output);
			
			//console.log(Uncompressed_Length);
			
			output = output.slice(0, uncompressedSize);

			//console.log( "Uncompressed data:", output );
			var packet2    = new Packet(output);
			if(!packet2.length) {
				return this.onPacketError(packet2, new Error('Empty packet received'));
			}
			
			var packet_id = packet2.readUInt8();
		//	console.log("New packet: " + packet_id);
			
			/*if (sa == 0xf1) {
				
				
				var processor = client.processors[packet_id];
				if(!processor) return client.log('[warning] unknown packet ID(255->' + packet_id + '): ' + packet2.toString());
				processor(client, packet2, type);
			
			}
			else if (sa == 0xf2) {
				
				
				var processor = client.processors[packet_id];
				if(!processor) return client.log('[warning] unknown packet ID(255->' + packet_id + '): ' + packet2.toString());
				processor(client, packet2, type);
			
			

			if (packet_id == 64) {
				
				var processor = client.processors[packet_id];
				if(!processor) return client.log('[warning] unknown packet ID(255->' + packet_id + '): ' + packet2.toString());
				processor(client, packet2, type);

			} else {
				
				//console.log("[WARN] UNDEFINED TYPE OR SKIPED : " + sa);
				return;
				
			}*/
			
			var processor = client.processors[packet_id];
				if(!processor) return client.log('[warning] unknown packet ID(255->' + packet_id + '): ' + packet2.toString());
				processor(client, packet2, type);
        }
    },

    updateScore: function() {
        var potential_score = 0;
        for (var i=0;i<this.my_balls.length;i++) {
            var ball_id = this.my_balls[i];
            var ball    = this.balls[ball_id];
            potential_score += Math.pow(ball.size, 2);
        }
        var old_score = this.score;
        var new_score = Math.max(this.score, Math.floor(potential_score / 100));

        if (this.score == new_score) return;
        this.score = new_score;
        this.emitEvent('scoreUpdate', old_score, new_score);

        if(this.debug >= 2)
            this.log('score: ' + new_score);

    },

    log: function(msg) {
        console.log(this.client_name + ': ' + msg);
    },

    // Fix https://github.com/pulviscriptor/agario-client/issues/95
    emitEvent: function() {
        var args = [];
        for(var i=0;i<arguments.length;i++) args.push(arguments[i]);
        try {
            this.emit.apply(this, args);
        } catch(e) {
            process.nextTick(function() {
                throw e;
            });
        }
    },

    //functions that you can call to control your balls

    spawn: function(name) {
       // if(this.debug >= 3)
            this.log('spawn() called, name=' + name);

        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if(this.debug >= 1)
                this.log('[warning] spawn() was called when connection was not established, packet will be dropped');
            return false;
        }
		var buffer_compressed = new Buffer([0,201,190,22,79,100,213,209,79,76,199,22,173,2,122,115,52,56,181,51,120], "hex");

         //   let buf = new Buffer(2 + 1 * name.length);
            
			/*buf.writeUInt8(0, 0);
			
            for (let i = 0; i < name.length; i++) {
                buf.writeUInt8(name.charCodeAt(i), 1 + i * 1);
            }
			
			buf.writeUInt8(0, 0);
           // buf.writeUInt8(0, 0);*/
			
            this.send(buffer_compressed);
           // console.log("Test");

        //fix for unstable spawn on official servers
      /*  if(!this.spawn_attempt && this.spawn_interval) {
          //  if(this.debug >= 4)
                console.log('Starting spawn() interval');

            var that = this;
            this.spawn_attempt = 1;
            this.spawn_interval_id = setInterval(function() {
                if(that.debug >= 4)
                    console.log('spawn() interval tick, attempt ' + that.spawn_attempt + '/' + that.spawn_attempts);

                if(that.spawn_attempt >= that.spawn_attempts) {
                    //if(that.debug >= 1)
                        console.log('[warning] spawn() interval gave up! Disconnecting from server!');
                    that.spawn_attempt = 0;
                    clearInterval(that.spawn_interval_id);
                    that.spawn_interval_id = 0;
                  //  that.disconnect();
                    return;
                }
                that.spawn_attempt++;
                that.spawn(name);
            }, that.spawn_interval);
        }*/

        return true;
    },

    //activate spectate mode
    spectate: function() {
        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if(this.debug >= 1)
                this.log('[warning] spectate() was called when connection was not established, packet will be dropped');
            return false;
        }

        var buf = new Buffer([1]);
        this.send(buf);

        return true;
    },

    //switch spectate mode (toggle between free look view and leader view)
    spectateModeToggle: function() {
        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if(this.debug >= 1)
                this.log('[warning] spectateModeToggle() was called when connection was not established, packet will be dropped');
            return false;
        }

        var buf = new Buffer([18]);
		this.send(buf);
        var buf = new Buffer([19]);
		this.send(buf);

        return true;
    },

    moveTo: function(x, y) {
        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if(this.debug >= 1)
                this.log('[warning] moveTo() was called when connection was not established, packet will be dropped');
            return false;
        }
        var buf = new Buffer(13);
        buf.writeUInt8(16, 0);
        buf.writeInt32LE(Math.round(x), 1);
        buf.writeInt32LE(Math.round(y), 5);
		
		/*if (this.ball_id == 0) {
			
			console.log("[ERROR] [MOVETO] : Ball_ID is not defined ! (Check packet 32 or else moveto packet error)");
			
			return false;
			
		}else{*/
			
			 buf.writeUInt32LE(this.ball_id, 9);
			 this.send(buf);
			 return true;
		
       
        


    },

    //split your balls
    //they will split in direction that you have set with moveTo()
    split: function() {
        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if(this.debug >= 1)
                this.log('[warning] split() was called when connection was not established, packet will be dropped');
            return false;
        }
        var buf = new Buffer(1);
		buf.writeUInt8(17, 0);
        this.send(buf);

        return true;
    },

    //eject some mass
    //mass will eject in direction that you have set with moveTo()
    eject: function() {
        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if(this.debug >= 1)
                this.log('[warning] eject() was called when connection was not established, packet will be dropped');
            return false;
        }
		
        var buf = new Buffer(1);
		buf.writeUInt8(18, 0);
		
		this.send(buf);
		
		buf = new Buffer(1);
		buf.writeUInt8(21, 0);
		
        this.send(buf);
		
		buf = new Buffer(1);
		buf.writeUInt8(19, 0);

		this.send(buf);
		
        return true;
    },

    //deprecated
    set facebook_key(_) {
        console.trace('Property "facebook_key" is deprecated. Please check in README.md how new authorization works');
    }
};

function Ball(client, id) {
    if(client.balls[id]) return client.balls[id];

    this.id    = id;
    this.name  = null;
    this.x     = 0;
    this.y     = 0;
    this.size  = 0;
    this.mass  = 0;
    this.virus = false;
    this.mine  = false;

    this.client      = client;
    this.destroyed   = false;
    this.visible     = false;
    this.last_update = (+new Date);
    this.update_tick = 0;

    client.balls[id] = this;
    return this;
}
Ball.prototype = {
    destroy: function(reason) {
        this.destroyed = reason;
        delete this.client.balls[this.id];
        var mine_ball_index = this.client.my_balls.indexOf(this.id);
        if(mine_ball_index > -1) {
            this.client.my_balls.splice(mine_ball_index, 1);
            this.client.emitEvent('mineBallDestroy', this.id, reason);
            if(!this.client.my_balls.length) this.client.emitEvent('lostMyBalls');
        }

        this.emitEvent('destroy', reason);
        this.client.emitEvent('ballDestroy', this.id, reason);
    },

    setCords: function(new_x, new_y) {
        if(this.x == new_x && this.y == new_y) return;
        var old_x = this.x;
        var old_y = this.y;
        this.x    = new_x;
        this.y    = new_y;

        if(!old_x && !old_y) return;
        this.emitEvent('move', old_x, old_y, new_x, new_y);
        this.client.emitEvent('ballMove', this.id, old_x, old_y, new_x, new_y);
    },

    setSize: function(new_size) {
        if(this.size == new_size) return;
        var old_size = this.size;
        this.size    = new_size;
        this.mass    = parseInt(Math.pow(new_size/10, 2));

        if(!old_size) return;
        this.emitEvent('resize', old_size, new_size);
        this.client.emitEvent('ballResize', this.id, old_size, new_size);
        if(this.mine) this.client.updateScore();
    },

    setName: function(name) {
        if(this.name == name) return;
        var old_name = this.name;
        this.name    = name;

        this.emitEvent('rename', old_name, name);
        this.client.emitEvent('ballRename', this.id, old_name, name);
    },

    update: function() {
        var old_time     = this.last_update;
        this.last_update = (+new Date);

        this.emitEvent('update', old_time, this.last_update);
        this.client.emitEvent('ballUpdate', this.id, old_time, this.last_update);
    },

    appear: function() {
        if(this.visible) return;
        this.visible = true;
        this.emitEvent('appear');
        this.client.emitEvent('ballAppear', this.id);

        if(this.mine) this.client.updateScore();
    },

    disappear: function() {
        if(!this.visible) return;
        this.visible = false;
        this.emitEvent('disappear');
        this.client.emitEvent('ballDisppear', this.id); //typo https://github.com/pulviscriptor/agario-client/pull/144
        this.client.emitEvent('ballDisappear', this.id);
    },

    toString: function() {
        if(this.name) return this.id + '(' + this.name + ')';
        return this.id.toString();
    },

    // Fix https://github.com/pulviscriptor/agario-client/issues/95
    emitEvent: function() {
        var args = [];
        for(var i=0;i<arguments.length;i++) args.push(arguments[i]);
        try {
            this.emit.apply(this, args);
        } catch(e) {
            process.nextTick(function() {
                throw e;
            });
        }
    }
};

// Inherit from EventEmitter
for (var key in EventEmitter.prototype) {
    if(!EventEmitter.prototype.hasOwnProperty(key)) continue;
    Client.prototype[key] = Ball.prototype[key] = EventEmitter.prototype[key];
}

Client.servers = servers;
Client.Packet  = Packet;
Client.Account = Account;
Client.Ball    = Ball;
module.exports = Client;
