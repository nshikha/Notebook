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

// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

function initServer() {
  // When we start the server, we must load the stored data
  var defaultList = "{}";
  readFile("data.txt", defaultList, function(err, data) {
    datastore = JSON.parse(data);
  });
}

// -------------------------------------------------------------------
//Set of global variables
var g_idList = [];

// Serves back a valid clientid.
app.get("/clientid", function (request, response) {
	var nextId = g_idList.length;
	g_idList.push(nextId);

	response.send({
		"newid": nextId,
		"success": true
	});
});

// create new answer
app.post("/postcode", function(request, response) {
  response.send({ answer: eval(request.body.code), success: true });
});

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);
