/*
	Issues:
		-Css Looks weird on buttons
		-Don't know the difference between Sold and Delete - do the same thing
		-Don't know the expected behavior
		-Don't know what to use as an ID?
			Maybe the date?
		-What is the edit call for?
*/

var g_notebook;
var g_searchResults;

//Takes the user to the notebook's url
function toNotebook() {
    var name = $('#notebook-name-input').val()

}

// Adds a notebook to the database
function addNotebook(name) {
    $.ajax({
        type: "post",
        data: {"name": name, "dateCreated": new Date()},
        url: "/create",
        success: function(data) {
            g_notebook = data.notebook;
        }
    });
}


// Gets a notebook header from the database
function getNotebookHeader(name, callback) {
    $.ajax({
        type: "get",
        url: "/loadHeader/" + name,
        success: function(data) {
            g_notebook = data.notebook_header;
            if(callback !== undefined && typeof(callback) === "function")
                callback();
	      }
    });
}

// Gets a notebook from the database
function getNotebook(name) {
    $.ajax({
        type: "get",
        url: "/load/" + name,
        success: function(data) {
            g_notebook = data.notebook;
		        //console.log(g_notebook);
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

// Adds a notebook to the database
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
function searchNotebook(name, tag) {
    $.ajax({
        type: "get",
        url: "/search/" + name + "/" + tag,
        success: function(data) {
		        g_searchResults = data.results;
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
