
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var database = require('./routes/loaddatabase');

var http = require('http');
var path = require('path');

var app = express();

var mongoClient = require('mongodb').MongoClient;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static('public'));
app.use(app.router);

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// Products Display
app.get('/products', function(req, res){
	mongoClient.connect("mongodb://localhost:27017/Catalogue", function(err, db){
		db.collection('Products').find({}).toArray( function (err, docs){
			console.log(docs);
			//res.json(docs);
			res.render('index',{products:docs, header:'All Products'});
			db.close();
		})
	})
})


//Get a particular product info

app.get('/product/:id/info',function(req,res){
var id= Number(req.params.id);
mongoClient.connect("mongodb://localhost:27017/Catalogue", function(err, db){
		db.collection('Products').find({productid:id}).toArray( function (err, docs){
			console.log(docs);
			//res.json(docs);

			res.render('productinfo',{products:docs, header:"Product Info"});
			db.close();
		})
	})
})

//Get products based on category

app.get('/category/:category',function(req,res){
var category= req.params.category;
mongoClient.connect("mongodb://localhost:27017/Catalogue", function(err, db){
		db.collection('Products').find({Category:category}).toArray( function (err, docs){
			console.log(docs);
			res.render('index',{products:docs, header:category});
			db.close();
		})
	})
})

app.get('/loaddatabase', database.loaddatabase);

//Search

app.post('/search',function(req,res){
var search= req.body.searchstring;
var category = req.body.category;
console.log(category);
console.log(search);
mongoClient.connect("mongodb://localhost:27017/Catalogue", function(err, db){
	if (category == 'All Products' || category == 'Searched Products'){
		db.collection('Products').find({Name: {"$regex" : search}}).toArray( function (err, docs){
			console.log(docs);
			res.render('index',{products:docs, header:'Searched Products'});
			db.close();
		})
	} else {
		db.collection('Products').find({Name: {"$regex" : search}, Category:category}).toArray( function (err, docs){
			console.log(docs);
			res.render('index',{products:docs, header:category});
			db.close();
		})
	}
	})

}) 


var about = require('./routes/about');
app.get('/about', about.about);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//