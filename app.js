var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

// Asynchronously read file contents, then call callbackFn
function readFile(filename, defaultData, callbackFn) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log("Error reading file: ", filename);
      data = defaultData;
    } else {
      console.log("Success reading file: ", filename);
    }
    if (callbackFn) callbackFn(err, data);
  });
}

// Asynchronously write file contents, then call callbackFn
function writeFile(filename, data, callbackFn) {
  fs.writeFile(filename, data, function(err) {
    if (err) {
      console.log("Error writing file: ", filename);
    } else {
      console.log("Success writing file: ", filename);
    }
    if (callbackFn) callbackFn(err);
  });
}


// -------------------------------------------------------------------
//Set of global variables
var g_notebookList = [];
//List of static files
var g_staticFiles = [];

function Notebook(name, date){

	// The name of the notebook to be added
	this.name = name;

	// The date the notebook was created
	this.dateCreated = date;

	// A list of all the entries in a given notebook
	this.entries = [];

	// An object where the keys are the tag names,
	// The values are an array of indices into entries[] which have the tag that was used as the key.
	this.access_database = {};
}

function Entry(entry, index){
	this.content = "";
	this.desc = "";
	this.tags = [];
	this.dateAdded = "";
	this.dateAccessed = "";

	// This is more backend data.
	// Index is specifically used to identify entries between the front and back end.
	this.index = -1;
	this.deleted = false;

	if(entry.content){ this.content = entry.content}
	if(entry.desc){ this.desc = entry.desc}
	if(entry.tags){ this.tags = entry.tags}
	if(entry.dateAdded){ this.dateAdded = entry.dateAdded}
	if(entry.dateAccessed){ this.dateAccessed = entry.dateAccessed}
	if(index !== undefined){ this.index = index}
}

function initServer() {
  // When we start the server, we must load the stored data
  var defaultList = "[]";
  readFile(getDBFilename("notebooks"), defaultList, function(err, data) {
	g_notebookList = JSON.parse(data);
  });
  //get list of static files
  fs.readdir("static/", function(err, files) {
      g_staticFiles = files;
  });
}


// ----------------------------------------------------------------------
// All the functions for managing the Notebooks

function initNotebook(name, date) {
	//Create notebook object
	var notebook = new Notebook(name, date);

	//Create file for notebook object
	writeNotebookToFile(notebook);

	//Add to appropriate places
	addToNotebookList(name);

	return notebook;
}

// Extracts the notebook header to send back to the client.
function getNotebookHeader(notebook){
	var alltags = [];

	for(var tag in notebook.access_database){
		var listlength = notebook.access_database[tag].length;
		alltags.push({"tag": tag, "numEntries": listlength});
	}

	/*
	alltags = {};
	for(var tag in notebook.access_database){
		var listlength = notebook.access_database[tag].length;
		alltags[tag] = listlength;
	}
	*/
	//Object.keys(notebook.access_database)

    return	{"notebook_header": {	"name": notebook.name,
									"dateCreated": notebook.dateCreated,
									"alltags": alltags,
									"numEntries" : notebook.entries.length
					            },
					 "parsing_delimeters": getParseTokens(),
					 "success": true}
}

// Persists a notebooks contents to file
function writeNotebookToFile(notebook){
	writeFile(getDBFilename(notebook.name), JSON.stringify(notebook));
}

// Updates the database and the global notebooks object with the information.
function addToNotebookList(name){
	g_notebookList.push(name);
	g_notebookList.sort();
	writeFile(getDBFilename("notebooks"),
		JSON.stringify(g_notebookList));
}

// Checks if the submitted notebook name is valid
// TODO: check if notebook name is well-formed
function validNotebookName(name){
	if(typeof(name) !== "string"){
		return false;
	}

	if(name === "notebooks"){
		return false;
	}

	return true;
}

// Checks if the submitted notebook name is valid
// TODO: check if notebook name is well-formed
function existingNotebookName(name){
	if(typeof(name) != 'string'){
		return false;
	}

	// Checks if the notebook already exists.
	var inList = g_notebookList.indexOf(name);
	if(inList >= 0){
		console.log("Notebook " + name + " already exists!");
		return true;
	}

	return false;
}

// Checks if the given name is a static file
function staticFile(name) {
    var inList = g_staticFiles.indexOf(name);
    if(inList < 0) return false;
    else return true;

}


// Given the name of a file, returns filepath string.
function getDBFilename(name){
	return "database/" + name + ".txt";
}

// ----------------------------------------------------------------------
// All the functions for managing the notebook entries

// Checks whether a notebook entry is valid
function validNotebookEntry(entry){
	return /*(entry.tags !== [] && dateAccessed !==)*/ true;
}


// ----------------------------------------------------------------------
// Server writes and responses


// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

// This route is hit when a specific notebook is requested
app.get("/notebook/:name", function (request, response) {
    var name = request.params.name
    console.log(name);
    if(existingNotebookName(name) || !staticFile(name)) {
        response.sendfile("static/notebook.html");
    } else {
        response.sendfile("static/" + request.params.name);
    }
});


app.get("/notebook/:name/all/:herp", function(request, response) {
    var name = request.params.name
    var herp = request.params.herp;
    if(existingNotebookName(name) && !staticFile(herp)) {
        response.sendfile("static/search.html");
    } else {
        response.sendfile("static/" + request.params.herp);
    }
});

app.get("/notebook/:name/search/:query", function (request, response) {
    var name = request.params.name;
    var query = request.params.query;
    if(existingNotebookName(name) && !staticFile(query)) {
        response.sendfile("static/search.html");
    } else {
        response.sendfile("static/" + request.params.query);
    }
});

// Creates a new notebook
app.post('/create', function (request, response) {
	var name = 	request.body.name;
	var date = request.body.dateCreated;

	// Checks if the notebook name already exists and if its well-formed and that a date is provided
	if(!validNotebookName(name) || existingNotebookName(name) || !date){
		response.send({"success": false});
	}
	else{
		var notebook = initNotebook(name, date);
		response.send({"notebook": notebook,
					   "success": true
					  });
	}
});

// Updates a date in a notebook
app.post('/upDate', function (request, response) {
	var name = 	request.body.name;
	var index = request.body.entryIndex;
	var dateAccessed = request.body.dateAccessed;

	if(!existingNotebookName(name)){
		console.log("Removes entry from non-existent entry.");
		response.send({"success": false});
	}
	else{
		readFile(getDBFilename(name), {}, function(err, data) {
			notebook = JSON.parse(data);
			console.log(notebook);

			if(index >= notebook.entries.length){
				response.send({"success": false});
			}

			notebook.entries[index].dateAccessed = dateAccessed;
			// Persist changes to notebook
			writeNotebookToFile(notebook);

			// Send back the updated notebook
			response.send({"notebook": notebook,
						   "success": true
					  });
		});
	}
});

function addEntryTags(notebook, dbEntry){
	var index = dbEntry.index;

	// Add any tags to master list of tags
	// Add to access_database
	for(var i = 0; i < dbEntry.tags.length; i++){
		var tag = dbEntry.tags[i];
		if(notebook.access_database[tag] === undefined){
			notebook.access_database[tag] = [index];
		}
		else{
			notebook.access_database[tag].push(index);
		}
	}
}

function deleteEntryTags(notebook, index){
	var oldEntry = notebook.entries[index];

	// Removes all of the oldEntry tags.
	for(var i = 0; i < oldEntry.tags.length; i++){
		var tag = oldEntry.tags[i];
		var accessDBList = notebook.access_database[tag];
		// use this (removes the index from tag list)
		accessDBList.splice(accessDBList.indexOf(index), 1);

		// Remove this tag from the database if the database is empty.
		if(accessDBList.length === 0){
			delete notebook.access_database[tag];
		}
	}
}

// Removes an entry from a notebook
app.post('/removeEntry', function (request, response) {
	var name = 	request.body.name;
	var index = request.body.entryIndex;

	// Checks if the notebook name already exists and if its well-formed
	if(!existingNotebookName(name)){
		console.log("Removes entry from non-existent entry.");
		response.send({"success": false});
	}
	else{
		readFile(getDBFilename(name), {}, function(err, data) {
			notebook = JSON.parse(data);
			console.log(notebook);

			if(index >= notebook.entries.length){
				response.send({"success": false});
			}
			else{
				var entry = notebook.entries[index];
				entry.deleted = true;

				// Remove associated tags from access_database
				deleteEntryTags(notebook, index);

				// Persist changes to notebook
				writeNotebookToFile(notebook);

				// Send back the updated notebook
				response.send({"notebook": notebook,
							   "success": true
						  });
			}

		});
	}
});

// Edits an entry in the existing notebook
app.post('/editEntry', function (request, response) {
	var name = 	request.body.name;
	var entry = request.body.entry;

	// Checks if the notebook name already exists and if its well-formed
	if(!validNotebookName(name) || !existingNotebookName(name) || !validNotebookEntry(entry)){
		console.log("Something went wrong");
		response.send({"success": false});
	}
	else{
		readFile(getDBFilename(name), {}, function(err, data) {
			notebook = JSON.parse(data);
			console.log(notebook);

			var index = entry.index;

			var dbEntry = new Entry(entry, index);

			if(index >= notebook.entries.length){
				response.send({"success":false});
			}
			else{
				// Removes the old tags from the notebook
				deleteEntryTags(notebook, index);

				notebook.entries[index] = dbEntry;

				// Adds the tags into the appropriate place in the notebook.
				addEntryTags(notebook, dbEntry);

				// Persist changes to notebook
				writeNotebookToFile(notebook);

				// Send back the formatted databaseEntry
				response.send({"notebook": notebook,
								"entry" : dbEntry,
							   "success": true
						  });
			}
		});
	}
});

// Adds a new entry to an existing notebook
app.post('/addEntry', function (request, response) {
	var name = 	request.body.name;
	var entry = request.body.entry;

	// Checks if the notebook name already exists and if its well-formed
	if(!validNotebookName(name) || !existingNotebookName(name) || !validNotebookEntry(entry)){
		console.log("Something went wrong");
		response.send({"success": false});
	}
	else{
		readFile(getDBFilename(name), {}, function(err, data) {
			notebook = JSON.parse(data);
			console.log(notebook);

			var index = notebook.entries.length;

			var dbEntry = new Entry(entry, index);

			// Add entry to list of entries in notebook, get its index
		    notebook.entries.push(dbEntry);


			// Adds the tags into the appropriate place in the notebook.
			addEntryTags(notebook, dbEntry);


			// Persist changes to notebook
			writeNotebookToFile(notebook);

			// Send back the formatted databaseEntry
			response.send({"notebook": notebook,
							"entry" : dbEntry,
						   "success": true
					  });
		});
	}
});

// Loads the list of notebooks for someone to look at.
app.get('/notebooks', function (request, response) {
	response.send({"list": g_notebookList,
				   "success": true
	});
});

// Loads an existing notebook header
app.get('/loadHeader/:name', function (request, response) {
	var name = request.params.name;
	var notebook;

	if(existingNotebookName(name)){
		readFile(getDBFilename(name), {}, function(err, data) {
			notebook = JSON.parse(data);
			console.log(notebook);

			// Send back the header for the notebook, but not the entries
			response.send(getNotebookHeader(notebook));
		});
	}
	else{
		response.send({"success": false});
	}
});

// Loads an existing notebook
app.get('/load/:name', function (request, response) {
	var name = request.params.name;
	var notebook;

	if(existingNotebookName(name)){
		readFile(getDBFilename(name), {}, function(err, data) {
			notebook = JSON.parse(data);
			console.log(notebook);

			// Send back the header for the notebook, but not the entries
			//response.send(getNotebookHeader(notebook));
			response.send({"notebook": notebook, "success": true});
		});
	}
	else{
		response.send({"success": false});
	}
});

/*2.2. Reserved Characters

Many URI include components consisting of or delimited by, certain special
characters. These characters are called "reserved", since their usage within the
URI component is limited to their reserved purpose. If the data for a URI
component would conflict with the reserved purpose, then the conflicting data
must be escaped before forming the URI.

 reserved    = ";" | "/" | "?" | ":" | "@" | "&" | "=" | "+" |
                "$" | ","
The "reserved" syntax class above refers to those characters that are allowed
 within a URI, but which may not be allowed within a particular component of
 the generic URI syntax

*/

// Parse tokens
function getParseTokens(){
	return {
		'union' : "+",
		'intersection' : "^"
	};
}

// Fetch the union of all the tags
function unionTags(notebook, tags){
	var list = [];
	for(var i = 0; i < tags.length; i++){
		var tag = tags[i];

		var tagList = notebook.access_database[tag];
		if(tagList !== undefined){
			list = list.concat(tagList);
		}
	}
	list = list.filter(function(elem, ind){
		return list.indexOf(elem) === ind;
	})
	return list;
}

// Fetch the intersect of all the tags
function intersectTags(notebook, tags){
	var count = {};
	var list =[];
	for(var i = 0; i < tags.length; i++){
		var tag = tags[i];

		var tagList = notebook.access_database[tag];

		// Check whether the tag has anything yet.
		if(tagList !== undefined){
			tagList.forEach(
			function(elem){
				var index = elem + "";
				var curr = count[index];
				if(curr === undefined){
					count[index] = 1;
				}
				else{
					count[index] = curr + 1;
				}
			})
		}
	}

	console.log(count);

	for(prop in count){
		if(count[prop] === tags.length){
			list.push(parseInt(prop));
		}
	}
	return list;
}

// Parses a tag search request and returns the list of entries.
function parseSearch(notebook, tagString){
	var tokens = getParseTokens();
	var tags = [];
	var type;
	var searchResults;

	if(tagString.indexOf(tokens.union) >= 0){
		tags = tagString.split(tokens.union);
		searchResults = unionTags(notebook, tags);
	}
	else if(tagString.indexOf(tokens.intersection) >= 0){
		tags = tagString.split(tokens.intersection);
		searchResults = intersectTags(notebook, tags);
	}
	else{
		searchResults = notebook.access_database[tagString];
	}

	// This is to denote a malformed request.
	if(searchResults === undefined){
		return undefined;
	}

	var returnEntries = [];

	// Actually fetch the entries from the determined indices.
	for(var i = 0; i < searchResults.length; i++){
		returnEntries.push(notebook.entries[searchResults[i]]);
	}

	return returnEntries;
}

// Searches an existing notebook for a tag
app.get('/search/:name/:tags', function (request, response) {
	var name = request.params.name;
	var tags = request.params.tags;

	if(existingNotebookName(name)){
		readFile(getDBFilename(name), {}, function(err, data) {
			var notebook = JSON.parse(data);

			var entries = parseSearch(notebook, tags);
			if(entries === undefined){
				response.send({"success": false});
			}

			response.send({"results": entries, "success": true});
		});
	}
	else{
		response.send({"success": false});
	}
});

// ---------------------------------------------------------------------
// Some basic checks to make sure our database stays sanitary

function generateAccessDatabase(notebook){
	var new_access = {};
	for(j = 0; j < notebook.entries.length; j++){
		var entry = notebook.entries[j];

		if(!entry.deleted){
			// Add any tags to master list of tags
			// Add to access_database
			for(var i = 0; i < entry.tags.length; i++){
				var tag = entry.tags[i];
				if(new_access[tag] === undefined){
					new_access[tag] = [j];
				}
				else{
					new_access[tag].push(j);
				}
			}
		}
	}

	notebook.access_database = new_access;
}



// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);
console.log("created server on port 8889");
