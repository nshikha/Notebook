var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

// The global datastore for this example
var datastore;

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

// Implement findQuestion(query)
//    return the question if found, undefined otherwise
function findQuestion(query){
	for(var prop in datastore){
		var index = prop.indexOf(query);
		if(index >= 0){
			return prop;
		}
	}
	var no_answer;
	return no_answer;
}


// Implement computeAnswer(query)
//    try to find the question return a successful response (see spec)
//    otherwise return an unssuccessful response
function computeAnswer(query){
	// Takes out metadata and placeholders like %20
	var que = decodeURI(query);

	// Determine if question is already in datastore
	var question = findQuestion(que);
	var answer;

	// Not in the datastore
	if(typeof(question) == 'undefined'){
		// Check if its a math request
		if(que.indexOf('Math:') == 0){
			question = query.slice(5);
			answer = eval(question);

			datastore[que] = {
								"answer": answer,
								"date": new Date()
							};

			// Persist the file to the datastore if not already there
			writeFile("data.txt", JSON.stringify(datastore));

			return {
				"interpreted": que,
				"answer": datastore[que].answer,
				"date": datastore[que].date,
				"success": true
			};
		}
		return {"success": false};
	}
	// In the datastore!
	else{
		return {
			"interpreted": question,
			"answer": datastore[question].answer,
			"date": datastore[question].date,
			"success": true
		};
	}
}
// get an answer
app.get('/answer/:question', function (request, response) {
	var answer = computeAnswer(request.params.question);
	response.send(answer);
});

// get all answers
// This is for serving answers
app.get("/answer", function (request, response) {
	json_datastore = JSON.stringify(datastore);
	response.send({
		"answers": json_datastore,
		"success": true
	});
});


// create new answer
app.post("/answer", function(request, response) {
  datastore[request.body.question] = {
    "answer": request.body.answer,
    "date": new Date()
  };
  writeFile("data.txt", JSON.stringify(datastore));
  response.send({ success: true });
});


// -------------------------------------------------------------------
//Set of global variables
var g_notebookList = [];

function Notebook(name){
	
	// The name of the notebook to be added
	this.name = name;
	
	// A list of all the available tags in a given notebook
	this.alltags = [];
	
	// A list of all the entries in a given notebook
	this.entries = [];
	
	// An object where the keys are the tag names, 
	// The values are an array of indices into entries[] which have the tag that was used as the key.
	this.access_database = {};
}

function Entry(entry){
	this.content = "";
	this.desc = "";
	this.tags = [];
	this.dateAdded = "";
	this.dateAccessed = "";
	this.deleted = false;
	
	if(entry.content){ this.content = entry.content}
	if(entry.desc){ this.desc = entry.desc}
	if(entry.tags){ this.tags = entry.tags}
	if(entry.dateAdded){ this.dateAdded = entry.dateAdded}
	if(entry.dateAccessed){ this.dateAccessed = entry.dateAccessed}	
}

function initServer() {
  // When we start the server, we must load the stored data
  var defaultList = "[]";
  readFile(getDBFilename("notebooks"), defaultList, function(err, data) {
	g_notebookList = JSON.parse(data);
  });
}


// ----------------------------------------------------------------------
// All the functions for managing the Notebooks

function initNotebook(name) {
	//Create notebook object
	var notebook = new Notebook(name);

	//Create file for notebook object
	writeNotebookToFile(notebook);
	
	//Add to appropriate places
	addToNotebookList(name);

	return notebook;
}

// Extracts the notebook header to send back to the client.
function getNotebookHeader(notebook){
    return	{"notebook_header": {	"name": notebook.name,
									"alltags": notebook.alltags,
									"numEntries" : entries.length
					            },
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
    if(existingNotebookName(request.params.name)) {
        response.sendfile("static/index.html");
    } else {
        response.sendfile("static/" + request.params.name);
    }


});

// Creates a new notebook
app.post('/create', function (request, response) {
	var name = 	request.body.name;

	// Checks if the notebook name already exists and if its well-formed
	if(!validNotebookName(name) || existingNotebookName(name)){
		response.send({"success": false});
	}
	else{
		var notebook = initNotebook(name);
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
						
			notebook.entries[index].deleted = true;			
			
			// Persist changes to notebook
			writeNotebookToFile(notebook);
			
			// Send back the updated notebook
			response.send({"notebook": notebook,
						   "success": true
					  });
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
			var dbEntry = new Entry(entry);
			
			// Add entry to list of entries in notebook, get its index
			var index = notebook.entries.push(dbEntry) - 1;
			
			// Add any tags to master list of tags
			// Add to access_database
			for(var i = 0; i < dbEntry.tags.length; i++){
				var tag = dbEntry.tags[i];
				if(notebook.alltags.indexOf(tag) < 0){
					notebook.alltags.push(tag);
					notebook.access_database[tag] = [index];
				}
				else{
					notebook.access_database[tag].push(index);
				}
			}
			
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
			response.send({"notebook_header": notebook, "success": true});
		});
	}
	else{
		response.send({"success": false});
	}
});

// Searches an existing notebook for a tag
app.get('/search/:name/:tag', function (request, response) {
	var name = request.params.name;
	var tag = request.params.tag;

	if(existingNotebookName(name)){
		readFile(getDBFilename(name), {}, function(err, data) {
			var notebook = JSON.parse(data);
			console.log(notebook);
			
			var searchResults = notebook.access_database[tag];
			
			if(!searchResults){
				response.send({"found": false, "success": true});				
			}
			
			var returnEntries = [];
			var newSearchResults = [];
			var writeToFile = false;
			
			// As we search. condense the database with deleted entries.
			for(var i = 0; i < searchResults.length; i++){
				var entry = notebook.entries[searchResults[i]];
				if(!entry.deleted){
					returnEntries.push(entry);
					newSearchResults.push(searchResults[i]);
					writeToFile = true;
				}
			}
			
			notebook.access_database[tag] = newSearchResults;
			
			// If the notebook has been condensed by the results
			if(writeToFile){
				writeNotebookToFile(notebook);
			}
			
			// Send back the header for the notebook, but not the entries
			//response.send(getNotebookHeader(notebook));
			response.send({"results": returnEntries, "found": true, "success": true});
		});
	}
	else{
		response.send({"found": false, "success": false});
	}
});

// ---------------------------------------------------------------------
// Some basic checks to make sure our database stays sanitary

function generateAccessDatabase(notebook){
	var new_access = {};
	var new_alltags = [];
	for(j = 0; j < notebook.entries.length; j++){
		var entry = notebook.entries[j];

		if(!entry.deleted){
			// Add any tags to master list of tags
			// Add to access_database
			for(var i = 0; i < entry.tags.length; i++){
				var tag = entry.tags[i];
				if(new_alltags.indexOf(tag) < 0){
					new_alltags.push(tag);
					new_access[tag] = [j];
				}
				else{
					new_access[tag].push(j);
				}
			}		
		}
	}
	
	notebook.alltags = new_alltags;
	notebook.access_database = new_access;
}

/*
function checkNotebook(name){
	if(name === "notebooks"){ return false; }
	
	// Check that each tag in the access database is present in all tags
	// Check that 
	readFile(getDBFilename(name), {}, function(err, data) {
		var notebook = JSON.parse(data);
		
		for(var j = 0; j < notebook.entries.length; j++){
			var entry = notebook.entries[j];
			
			if(!entry.deleted){
				// Add any tags to master list of tags
				// Add to access_database
				for(var i = 0; i < entry.tags.length; i++){
					var tag = entry.tags[i];
					// If tag isn't present in all tags
					if(notebook.alltags.indexOf(tag) < 0){
						console.log( "Tag not found in all tags.");
						return false;
					}
					// If tag isn't present in proper place in access
					if(notebook.access_database[tag].indexOf(j) < 0){
						console.log("Tag not found in access database");
						return false;
					}
				}
			}
		}
	}
}*/



// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);
console.log("created server on port 8889");
