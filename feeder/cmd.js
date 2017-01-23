const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function change (uu) {
		
	var fs  = require("fs");

	fs.readFileSync('./config.js').toString().split('config.client_uuid =').forEach(function (line) { 
		console.log(line);
		fs.appendFileSync("./config.js", "config.client_uuid = '"+uu+"'" + "\n");
	});
	
}


rl.on('line', (line) => {
    if (line.split(' ')[0]==='uuid') {
        change(line.split(' ')[1]);
        console.log('UUID set to: ' + uuid);
    }
	    if (line.split(' ')[0]==='UUID') {
        change(line.split(' ')[1]);
        console.log('UUID set to: ' + uuid);
    }
	if (line.split(' ')[0]==='v') {
        console.log(('[VERSION]').green + (' Current client version is 1.0.0').white);
    }
	if (line.split(' ')[0]==='V') {
        console.log(('[VERSION]').green + (' Current client version is 1.0.0').white);
    }
	
	if (line.split(' ')[0]==='version') {
        console.log(('[VERSION]').green + (' Current client version is 1.0.0').white);
    }
	if (line.split(' ')[0]==='about') {
        console.log(('[VERSION]').green + (' Current client version is 1.0.0').white);
		console.log(('[CREATOR]').green + (' Made by lefela4').white);
		console.log(('[PROTOCOL]').green + (' This client is made for protocol v11').white);
		console.log(('[HELP]').green + (' Need help ? GO here : https://github.com/lefela4/Agar.io-client-v3/issues and post an issue').white);
    }
    if (line==='clear') {
        process.stdout.write('\x1B[2J\x1B[0f');
        load();
    }
    if (line==='help') {
        console.log(('Current list of commands:').yellow);
		
        console.log("")
		
		console.log(('[HELP]').green + ('  Clear - Clears Console').white);
		console.log(('[HELP]').green + ('  UUID - sets UUID').white);
		console.log(('[HELP]').green + ('  V - Current Version').white);
		console.log(('[HELP]').green + ('  About - About the client').white);
		console.log(('[HELP]').green + ('  Help - Shows help').white);
		
		
		
		
		
    }
});