// ==UserScript==
// @name         lefela-mod v1
// @namespace    lefela4
// @version      0.02
// @description  to be writen
// @author       lefela4
// @license      MIT
// @match        http://agar.io/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
setTimeout(function(){

    var s = 0;
window.MC.setNick("I")
setInterval(function(){

	if (s == 0) {
		window.MC.setNick("I")
		window.core.loadSkin("%spy");
     	window.core.sendNick("I");
		s = 1;
	
	} else if (s == 1) {
	
		window.core.loadSkin("%spider");
		window.core.sendNick("love");
		s = 2;
		
		
	
	}else if (s == 2) {
		window.core.loadSkin("%fly");
		window.core.sendNick("lefela4");
		s = 3;
	
	}else if (s == 3) {
		window.core.loadSkin("%space_dog");
		window.core.sendNick("<3");
		s = 0;
	
	}

}, 500);

    
    
}, 8000);


