/*
	Issues:
		-Css Looks weird on buttons
		-Don't know the difference between Sold and Delete - do the same thing
		-Don't know the expected behavior
		-Don't know what to use as an ID?
			Maybe the date?
		-What is the edit call for?
*/


  // ------------
  // IMPLEMENT ME
  // ------------

  // Global datastore
  var listings;

  // Implement addListing()
 function addListing(){
	var author = $("#author-input").val();
	var desc = $("#desc-input").val();
	var price = parseFloat($("#price-input").val());

	if(!!author && !!desc && !!price){
	 	/*console.log(author);
		console.log(desc);
		console.log(price); */

		// Send an add request
		add(desc, author, price);

		// Reset the input fields.
		$("#author-input").val("");
		$("#desc-input").val("");
		$("#price-input").val("");
	}
	else{
		console.log("Missing input field.");
	}
 }


  // Implement refreshDOM()
  function refreshDOM(){
	// Identify the DOM element where we pt things
	var contentblock = $(".listings");
	contentblock.empty();

	for(var i = 0; i < listings.length; i++){
		var f = function(){
			var elem = listings[i];
			var newItem = $("<li>");

			// Put all of the content into the listings element.
			var authorDiv = $("<div class = 'row'></div>");
			authorDiv.append($("<h3>" + elem.author + "</h3>"));
			var dateDiv = $("<div class = 'row'></div>");
			dateDiv.append($("<h6>" + elem.date + "</h6>"));
			var descDiv = $("<div class = 'row'></div>");
			descDiv.append($("<h3>" + elem.desc + "</h3>"));
			var priceDiv = $("<div class = 'row'></div>");
			priceDiv.append($("<h3>" + "$" + elem.price + "</h3>"));

			// Create the buttons
			var buttonDiv = $("<div>");
			var delButton = $("<a> Delete </a>");
			delButton.click(function(event){
								var j = listings.indexOf(elem);
								newItem.remove();
								del(j);
							});
			buttonDiv.append(delButton);

			// Add a click event only if it is not sold.
			var soldButton = ($("<a> Sold! </a>"));
			if(elem.sold){
				newItem.addClass('sold');
			}
			else{
				soldButton.click(function(event){
								var j = listings.indexOf(elem);
								edit(j, elem.desc, elem.author, elem.price, true)
								listings[j].sold = true;
								newItem.addClass('sold');
							});
			}
			buttonDiv.append(soldButton);

			// Attach all the proper elements together.
			newItem.append(authorDiv);
			newItem.append(dateDiv);
			newItem.append(descDiv);
			newItem.append(priceDiv);
			newItem.append(buttonDiv);
			contentblock.append(newItem);
		}();
	}
  }

  // Implement the get() function
  function get() {
    $.ajax({
      type: "get",
      url: "/listings",
      success: function(data) {
        listings = data.listings;
        //console.log(listings);
        refreshDOM();
      }
    });
  }

  // Implement the add(desc, author, price) function
  function add(desc, author, price) {
    $.ajax({
      type: "post",
      data: {"desc": desc, "author": author, "price": price},
      url: "/listings",
      success: function(data) {
		//console.log(data);
		listings.push(data.item);
		refreshDOM();
	  }
    });
  }

  function edit(id, desc, author, price, sold) {
    $.ajax({
      type: "put",
      data: {desc: desc, author: author, price: price, sold: sold},
      url: "/listings/" + id,
      success: function(data) {}
    });
  }

  function del(id) {
    $.ajax({
      type: "delete",
      url: "/listings/" + id,
      success: function(data) {
        //console.log(data);
		listings.splice(id,1);
      }
    });
  }

  function delAll() {
    $.ajax({
      type: "delete",
      url: "/listings",
      success: function(data) {}
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
  function getNotebookHeader(name) {
    $.ajax({
      type: "get",
      url: "/loadHeader/" + name,
      success: function(data) {
        g_notebook = data.notebook_header;
		g_parseTokens = data.parsing_delimeters;
		console.log(g_notebook);
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
		console.log(g_notebook);
	  }
    });
  }

  // Add entry with given content, tag name
  function addEntryWithData(name, content, listOfTags){
	date = new Date();
	if(!name || !listOfTags){
	}
	else{
		addEntry(name, {"content": content, "tags": listOfTags, 
			"dateAccessed": date, "dateAdded": date});
	}
  }
  
  // Adds a notebook to the database
  function addEntry(name, entry) {
    $.ajax({
      type: "post",
      data: {"name": name, "entry": entry},
      url: "/addEntry",
      success: function(data) {
		console.log(data.notebook);
        g_notebook = data.notebook;
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
        g_notebook = data.notebook;
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
        g_notebook = data.notebook;
      }
    });
  }    
  
  // Searches a notebook for a tag
  // Use g_parseTokens to make search queries properly.
  // If a malformed request is sent, then it will fail!
  function searchNotebook(name, tagString) {
    $.ajax({
      type: "get",
      url: "/search/" + name + "/" + tagString,
      success: function(data) {
		console.log(data.results);
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
  
  $(document).ready(function() {
	    console.log("Some functions: ");
	    console.log("getNotebooks(), addNotebook(name), getNotebook(name), addEntryWithData(name, content, listOfTags), removeEntry(name, entryIndex), upDate(name, entryIndex, dateAccessed), checkNotebook(notebook), searchNotebook(name, tag)");
      var urlSegments = window.location.pathname.split('/');
      urlSegments.splice(0,1); // removes "" from the beginning of list
      if(urlSegments[0] === "notebook" && urlSegments.length > 1){
          console.log("getting notebook: " + urlSegments[1]);
          getNotebookHeader(urlSegments[1]);
      }
  });
