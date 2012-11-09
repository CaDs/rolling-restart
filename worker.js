var express = require('express'),
		cluster = require('cluster');		


app.get('/index', function(req, res){
	res.send(200, "Hello world!\n");
	res.end();
	return
})

app.listen(3001);
console.log('NodePPC INFO: Listening on port 3001');