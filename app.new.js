var express = require('express');
var mongoose = require('mongoose');
var m = require('./models');

var app = express();

var CONNECTIONURL = 'mongodb://localhost/mynotebook';

mongoose.connect(CONNECTIONURL);

app.use(express.bodyParser());

//-----------------------------
// Utilities
//-----------------------------
function errorObj(message, status) {
    var obj = {success: false,
               message: message
              };
    if(status) obj.status = status;
    return obj
}

function validNotebookName(name){
	if(typeof(name) !== "string"){
		return false;
	}

	if(name === "notebooks"){
		return false;
	}

	if(name.indexOf(" ") >= 0){
		return false;
	}

	// Check if alphanumeric notebook name
	// stackoverflow.com
    if( /[^a-zA-Z0-9]/.test(name) ) {
       return false;
    }

	return true;
}

function existingNotebookName(name) {
    return m.Notebook.find({name: name})
        .exec( function(err, nb) {
            if(err === null) return false;
            return true;
        });
}


//-----------------------------
// Functionality
//-----------------------------

function createNotebook(name, date) {
    var notebook = new m.Notebook({ name: name, dateCreated : date });
    notebook.save(function(err) {
        if(err) return errorObj("Notebook failed to save: " + err,
                                'failed');
        return {success: true, data: notebook};
    });
}

//-----------------------------
// Routes
//-----------------------------


// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

// This route is hit when a specific notebook is requested
app.get("/notebook/:name", function (request, response) {
    var name = request.params.name
    if(existingNotebookName(name) || !staticFile(name)) {
        response.sendfile("static/notebook.html");
    } else {
        response.sendfile("static/" + request.params.name);
    }
});



// Creates a new notebook
app.post('/create', function (request, response) {
	  var name = 	request.body.name;
	  var date = request.body.dateCreated;
    if(!validNotebookName(name)) {
        response.send(errorObj('Invalid Notebook Name', 'invalid'));
    } else {

}



 if (existingNotebookName(name)) {
        console.log("Notebook exists: "+name);
        response.send(errorObj('Noptebook exists', 'existing'));
    } else {
        var result = createNotebook(name, date);
        if(result.success = false) {
            response.send(result);
        } else {
            result.status = 'created';
            response.send(result);
        }
    }
});

// Updates an entry
app.post('/upDate', function (request, response) {
	  var name = 	request.body.name;
	  var index = request.body.entryIndex;
	  var dateAccessed = request.body.dateAccessed;

});


// Removes an entry from a notebook
app.post('/removeEntry', function (request, response) {
	  var name = 	request.body.name;
	  var index = request.body.entryIndex;

});


// Edits an entry in the existing notebook
app.post('/editEntry', function (request, response) {
    var name = 	request.body.name;
	  var entry = request.body.entry;

});


// Adds a new entry to an existing notebook
app.post('/addEntry', function (request, response) {
	  var name = 	request.body.name;
	  var entry = request.body.entry;

});

// Loads the list of notebooks for someone to look at.
app.get('/notebooks', function (request, response) {

});


// Loads an existing notebook header
app.get('/loadHeader/:name', function (request, response) {

});

// Loads an existing notebook
app.get('/load/:name', function (request, response) {

});


// Sends back a list of all of the entries.

app.get('/loadEntries/:name', function (request, response) {

});


// Searchs an existing notebook for a tag
/* success:
   { 'success': true,
     'results': entries
   }
   fail:
   { 'success': false }
*/
app.get('/serach/:name/:tags', function (request, response) {

});

function initServer() {


}

initServer();
app.listen(8889);
console.log("created server on port 8889");
