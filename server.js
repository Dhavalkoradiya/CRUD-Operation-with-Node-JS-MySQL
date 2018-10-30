/*
*****************************
*	Import all node modules
*****************************
*/

/*
****	core modules
*/
var express 		= require('express');
var http 			= require('http');
var mysql 			= require('mysql');
var bodyParser 		= require('body-parser');
var upload 			= require('express-fileupload');


var app = express();
/*
*****	Parse all form data
*/
app.use(bodyParser.urlencoded({	extended: true }));
app.use(upload());

/*
*****	Initialize data format
*/
var dateFormat = require('dateformat');
var now = new Date();

/*
*	This is view engine
*	Template parseing
*	We are using ejs templataing
*/
app.set('view engine',	'ejs')

/*
*	Import all related JS and CSS files to inject in your app
*/
app.use('/js',	express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js',	express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js',	express.static(__dirname + '/node_modules/jquery/dist/js'));
app.use('/css',	express.static(__dirname + '/node_modules/bootstrap/dist/css'));


/*
*****	Database Connection
*/
const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "dev",
	database: "nodejs_p1"
});

/*
*****	Set Default Global Variable
*/
const siteTitle 	= "Nodejs APP";
const baseURL	 	= "http://localhost:3000/";

/*
*****	Render Default root page
*/
app.get('/', function(req,	res){
	con.query("select * from dk_events order by start_date DESC", function(err,result){
		res.render('pages/index',{
			siteTitle: siteTitle,
			pageTitle: 'First Page',
			baseURL: baseURL,
			items: result
		});
	});
});

/*
*****	Add new event
*/
app.get('/event/add', function(req,	res){
	res.render('pages/add-event.ejs',{
		siteTitle: siteTitle,
		pageTitle: 'First Page'
	});
});

/*
*****	Insert Event
*/
app.post('/event/add', function(req, res){
	
	if (req.files) {
		var file = req.files.foo,
			filename = now.getTime() + '_' + file.name;
		filename = filename.toLowerCase();
		file.mv("./upload/"+filename,function(err){
			if(err){
				console.log(err);
			}
		});
	}

	var query = "INSERT INTO `dk_events`(`name`, `start_date`, `end_date`, `file_upload`, `date_added`, `description`, `location`) VALUES (";
		query += " '"+req.body.name+"', ";
		query += " '"+dateFormat(req.body.start_date,"yyyy-mm-dd")+"', ";
		query += " '"+dateFormat(req.body.end_date,"yyyy-mm-dd")+"', ";
		query += " '"+filename+"', ";
		query += " '"+dateFormat(now,"yyyy-mm-dd HH:MM:ss")+"', ";
		query += " '"+req.body.description+"', ";
		query += " '"+req.body.location+"') ";
	con.query(query, function(err, result){
		req.flash('info', 'Data saved successfully!');
		res.redirect(baseURL);
	});
});

/*
*****	Edit event
*/
app.get('/event/edit/:event_id', function(req, res){
	con.query("SELECT * FROM `dk_events` WHERE `id` = '"+req.params.event_id+"' ", function(err,result){

		result[0].start_date = dateFormat(result[0].start_date,"yyyy-mm-dd");
		result[0].end_date	 = dateFormat(result[0].end_date,"yyyy-mm-dd");

		res.render('pages/edit-event.ejs',{
			siteTitle: siteTitle,
			pageTitle: 'Edit Event Page',
			item: result
		});
	});
});

/*
*****	Update Event 
*/
app.post('/event/edit/:event_id', function(req, res){
	
	var query = "UPDATE `dk_events` SET ";
		query += " name='"+req.body.name+"', ";
		query += " start_date='"+dateFormat(req.body.start_date,"yyyy-mm-dd")+"', ";
		query += " end_date='"+dateFormat(req.body.end_date,"yyyy-mm-dd")+"', ";
		query += " date_modified='"+dateFormat(now,"yyyy-mm-dd HH:MM:ss")+"', ";
		query += " description='"+req.body.description+"', ";
		query += " location='"+req.body.location+"' WHERE ";
		query += " id ='"+req.body.event_id+"'";
		
	con.query(query, function(err, result){
		if (result.affectedRows) {
			res.redirect(baseURL);
		}
	});
});

/*
*****	Delete event
*/
app.get('/event/delete/:event_id', function(req, res){
	var query = "DELETE FROM `dk_events` WHERE id='"+req.params.event_id+"'";
	con.query(query, function(err, result){
		if (result.affectedRows) {
			res.redirect(baseURL);
		}
	});
});

/*
*****	Download
*/
app.get('/download/:event_id', function(req, res){
	con.query("SELECT * FROM `dk_events` WHERE `id` = '"+req.params.event_id+"' ", function(err,result){
		var filename =  result[0].file_upload;
		res.download(__dirname + '/upload/' + filename, filename);
	});
});


/*
*****	connect to the server
*/
var server = app.listen(3000,function() {
	console.log("Server Started on 3000.....");
});