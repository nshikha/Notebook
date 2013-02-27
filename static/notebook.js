var g_notebook;
var g_searchResults;
var g_parsedName; // notebook name we get from url
var g_parsedQuery;

// Adds a notebook to the database
// 'status' field indicates 'created', 'existing', or 'invalid'
function addNotebook(name, callback) {
    $.ajax({
        type: "post",
        data: {"name": name, "dateCreated": new Date()},
        url: "/create",
        success: function(data) {
            g_notebook = data.notebook;
            if(callback !== undefined && typeof(callback) === "function")
                callback();
        }
    });
}


// Gets a notebook header from the database
function getNotebookHeader(name, callback, err_callback) {
    $.ajax({
        type: "get",
        url: "/loadHeader/" + name,
        success: function(data) {
            console.log(typeof(data.success));
            if(data.success) {
                g_notebook = data.notebook_header;
                if(callback !== undefined && typeof(callback) === "function")
                    callback();
            } else {
                if(err_callback !== undefined &&
                   typeof(err_callback) === "function")
                    err_callback();
            }
	      }
    });
}

//----------------------------------------
var g_notebook;
var g_parseTokens;
var g_searchResults;

//Takes the user to the notebook's url
function toNotebook() {
    var name = $('#notebook-name-input').val()

}

// Gets a notebook from the database
function getNotebook(name, callback) {
    $.ajax({
        type: "get",
        url: "/load/" + name,
        success: function(data) {
            g_notebook = data.notebook;
            if(callback !== undefined && typeof(callback) === "function")
                callback();
	      }
    });
}

// Gets a notebook header from the database
function getNotebookHeader(name, callback, err_callback) {
    $.ajax({
        type: "get",
        url: "/loadHeader/" + name,
        success: function(data) {
            if(data.success) {
                g_notebook = data.notebook_header;
		            g_parseTokens = data.parsing_delimeters;
                if(callback !== undefined && typeof(callback) === "function")
                    callback();
            } else {
                if (err_callback !== undefined &&
                    typeof(err_callback) === "function")
                    err_callback();
            }
	      }
    });
}

// Add entry with given content, tag name
function addEntryWithData(name, link, listOfTags, text, callback){
	  date = new Date();
	  if(!name || !listOfTags){
	  }
	  else{
		    addEntry(name, {"content": link, "tags": listOfTags,
                        "desc" : text,
			                  "dateAccessed": date, "dateAdded": date}, callback);
	  }
}

// Adds an entry to the database
function addEntry(name, entry, callback) {
    $.ajax({
        type: "post",
        data: {"name": name, "entry": entry},
        url: "/addEntry",
        success: function(data) {
		        console.log(data.notebook);
            if(callback !== undefined && typeof(callback) === "function")
                callback();
            //g_notebook = data.notebook;
        }
    });
}

// Edits an entry in the the database
function editEntry(name, newEntry, callback) {
	newEntry.dateAccessed = new Date();
    $.ajax({
        type: "post",
        data: {"name": name, "entry": newEntry},
        url: "/editEntry",
        success: function(data) {
		        console.log(data.notebook);
            if(callback !== undefined && typeof(callback) === "function")
                callback();
            //g_notebook = data.notebook;
        }
    });
}

// Updates the dateAccessed
function upDate(name, entryIndex, dateAccessed) {
    $.ajax({
        type: "post",
        data: {"name": name, "entryIndex": entryIndex,
			         "dateAccessed": dateAccessed},
        url: "/upDate",
        success: function(data) {
		        console.log(data.notebook);
            //g_notebook = data.notebook;
        }
    });
}

// Remove an entry
function removeEntry(name, entryIndex) {
    $.ajax({
        type: "post",
        data: {"name": name, "entryIndex": entryIndex},
        url: "/removeEntry",
        success: function(data) {
		        console.log(data.notebook);
            //g_notebook = data.notebook;
        }
    });
}

// Searches a notebook for a tag
// Use g_parseTokens to make search queries properly.
// If a malformed request is sent, then it will fail!
function searchNotebook(name, tagString, callback) {
    $.ajax({
        type: "get",
        url: "/search/" + name + "/" + tagString,
        success: function(data) {
		        console.log(data.results);
		        g_searchResults = data.results;
            if(callback !== undefined && typeof(callback) === "function")
                callback()
	      }
    });
}


// Logs the list of notebooks from the database.
// This is supposed to be a secret function.
function getNotebooks() {
    $.ajax({
        type: "get",
        url: "/notebooks",
        success: function(data) {
            console.log(data.list);
        }
    });
}


function checkNotebook(notebook){
	  if(notebook.name === "notebooks"){
		    console.log("checkNotebook: notebook name can't be notebooks.");
		    return false;
	  }

	  for(var j = 0; j < notebook.entries.length; j++){
		    var entry = notebook.entries[j];

		    if(!entry.deleted){
			      // Add any tags to master list of tags
			      // Add to access_database
			      for(var i = 0; i < entry.tags.length; i++){
				        var tag = entry.tags[i];
				        // If tag isn't present in all tags
				        if(notebook.alltags.indexOf(tag) < 0){
					          console.log( "checkNotebook: Tag not found in all tags.");
					          return false;
				        }
				        // If tag isn't present in proper place in access
				        if(notebook.access_database[tag].indexOf(j) < 0){
					          console.log("checkNotebook: Tag not found in access database");
					          return false;
				        }
			      }
		    }
	  }

	  console.log("checkNotebook: success");
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

// Checks if the submitted notebook name is valid
// TODO: check if notebook name is well-formed
function validTagName(name){
	if(typeof(name) !== "string"){
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