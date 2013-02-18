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

function Notebook(){
	this.alltags = [];
	this.entries = [];
}

function Entry(){
	this.name = "";
	this.content = "";
	this.desc = "";
	this.tags = [];
	this.dateAccessed = "";
}

function initServer() {
  // When we start the server, we must load the stored data
  var defaultList = "[]";
  readFile("database/notebooks.txt", defaultList, function(err, data) {
	g_notebookList = JSON.parse(data);
  });
}

function initNotebook(name) {
	//Create notebook object
	var notes = new Notebook();
	
	//Create file for notebook object
	writeFile("database/" + name + ".txt", JSON.stringify(notes));
	
	//Add to appropriate places 
	addToNotebookList(name);
	
	return notes;
}

// Updates the database and the global notebooks object with the information.
function addToNotebookList(name){
	g_notebookList.push(name);
	g_notebookList.sort();
	writeFile("database/notebooks.txt", 
		JSON.stringify(g_notebookList));
}

// Checks if the submitted notebook name is valid
// TODO: check if notebook name is well-formed
function validNotebookName(name){
	console.log(typeof(name));
	if(typeof(name) != 'string'){
		return false;
	}

	// Checks if the notebook already exists.
	var inList = g_notebookList.indexOf(name);
	if(inList >= 0){
		console.log("Notebook " + name + " already exists!");
		return false;
	}

	return true;
}

// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

// Creates a new notebook
app.post('/create', function (request, response) {
	var name = 	request.body.name;
	
	// Checks if the notebook name already exists and if its well-formed
	if(!validNotebookName(name)){
		response.send({"success": false});
	}
	else{
		var note = initNotebook(name);
		response.send({"notebook": note,
					   "success": true
					  });
	}
});

// Loads an existing notebook
app.get('/notebooks', function (request, response) {
	response.send({"list": g_notebookList,
				   "success": true
	});	
});

// Loads an existing notebook
app.get('/load/:name', function (request, response) {
	var name = 	request.params.name;
	var notebook;
	var inList = g_notebookList.indexOf(name);
	if(inList >= 0){
		readFile(name + ".txt", {}, function(err, data) {
			notebook = JSON.parse(data);
		});		
	}
	response.send(notebook);	
});

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);

/* Important code design questions:
	Should we only persist the data back to the server once the file write is complete, or should we add it first to the server, and then write it to file?
*/

/* TODO:
	-Discuss the format of a notebook name?
		-All lowercase?
		-No numbers?
		-Must be something that can be written to a filename
*/