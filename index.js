var mongo = require('mongodb').MongoClient;
var app = require('express')();
var http = require('http').Server(app);
var client = require('socket.io')(http);

app.get('/', function(req,res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/main.css', function(req,res) {
	res.sendFile(__dirname + '/main.css');
});

// app.get('/socket.io/socket.io.js', function(req,res) {
// 	res.sendFile(__dirname + 'node_modules/socket.io/socket.io.js');
// });

var url= "mongodb://localhost:27017/";
mongo.connect(url, function(err, db) {
	if(err)
		throw err;
	console.log("connected to db");
	var dbase=db.db("chatapp");
	client.on('connection',function(socket) {
		console.log("a user is connected");
		
		dbase.collection("messages").find().limit(100).sort({_id:1}).toArray(function (err,res) {
			if(err)
				throw err;
			socket.emit('output',res);
		});

		socket.on('input',function(data){
			var name = data.name;
			var message = data.message;

			if(name && message) {
				dbase.collection("messages").insert({name : name, message : message}, function(){
					if (err) throw err;

					client.emit('output',[data]);
					console.log("Message Inserted into the db");
				});	
			} else {
				console.log("Invalid input! Name and message is required.");
			}
			

		});
	});	

	
});

http.listen(3000, function() {
	console.log("Listening to port 3000");
});

