//globals
var addLinkE, addTagE, addTextE, addInfoE;
var editLinkE, editTagE, editTextE, editInfoE;


function flash_message(info, cls, msgs, timeout, timeoutfn) {
    console.log("flashing message")
    info.html("");
    info.removeClass();
    msgs.forEach(function (e) {
        info.append($('<span>').html(e));
    });
    info.addClass(cls);

    if(timeout) {
        if(timeoutfn) {
            window.setTimeout(timeoutfn, timeout);
        } else {
            window.setTimeout(function() {
                info.html("");
                info.removeClass(cls);
            }, timeout);
        }
    }
}


function reSearch(tagList) {
    //should we reSearch? check query
    if(g_searchQuery) {
        var reSearch = false;
        tagList.forEach(function(t) {
            reSearch = g_searchQuery.indexOf(t) < 0 ?
                false : true;
        })
        if(reSearch) {
            searchNotebook(g_notebook.name, g_searchQuery,
                           function() {
                               generateEntries(g_searchResults);
                           });
        }
    }

    //sould we reSearch? check all
    if(g_searchResults && g_searchResults.all) {
        getEntries(g_notebook.name, function() {
            generateEntries(g_searchResults);
        });
    }

}

//function that does the adding API call
function submitAddFunction(linkE, tagsE, textE, info, tagList) {
    var link = linkE.val();
    var text = textE.val();
    addEntryWithData(g_notebook.name, link, tagList, text,
                     function() {
                         flash_message(info, "success",
                                       ["Entry added successfully!"], 1500);

                         linkE.val("");
                         tagsE.val("");
                         textE.val("");

                         reSearch(tagList);
                     });

}


function submitEntry(linkE, tagsE, textE, info, submitFunction) {
    var link = linkE.val();
    var tags = tagsE.val();
    var text = textE.val();
//    var info = $('#information');

    //error checking
    var errors = [];
    if(tags === "") {
        errors.push("You must input at least one tag!");
    }
    if(link === "" && text === "") {
        errors.push("You must input either a link or some notes!");
    }

    if(errors.length > 0) {
        flash_message(info, "error", errors, 5000);
    } else {
        // split on space, remove commas if exists
        // this means both of these work
        // #css #herp stuff
        // #css, herp, #stuff
        var tagList = tags.split(" ").map(function (s) {
            return s.replace(/,/g, '');
        });
        // no hashtags
        tagList = tagList.map(function(s) { if(s[0] === "#") return s.split('#')[1];
                                            return s;
                                          });

        submitFunction(linkE, tagsE, textE, info, tagList);

    }
}


function createSubmitEditFunction(entry) {
    return function (linkE, tagsE, textE, info, tagList) {
        newEntry = {
            content : linkE.val(),
            desc : textE.val(),
            dateAdded: entry.dateAdded,
            dateAccessed: new Date(),
            tags: tagList,
            index: entry.index
        }
        editEntry(g_notebook.name, newEntry, function() {
            flash_message(info, "success", ["Entry edited Successfully!"], 1000,
                         function() {
                             info.html("");
                             info.removeClass("success");
                             $("#spotlight").fadeOut(100);
                         });
            linkE.val("");
            tagsE.val("");
            textE.val("");

            reSearch(tagList);
        });

    };

}


function editEntryDialog(entry) {
    $("#stage-edit").show();
    $("#stage-del").hide();
    $("#spotlight").fadeIn(200);
    editLinkE.val(entry.content);
    editTagE.val(entry.tags.join(' '));
    editTextE.val(entry.desc);
    $('#edit-entry').click( function() {

        fn = createSubmitEditFunction(entry);
        submitEntry(editLinkE, editTagE, editTextE, editInfoE, fn);
    });
}

function delEntryDialog(entry) {
    $("#stage-edit").hide();
    $("#stage-del").show();
    $("#spotlight").fadeIn(200);


    $("#cancel-del").click(function() {
        $("#spotlight").fadeOut(200);
    });
    $("#confirm-del").click(function() {
        var tagList = entry.tags;
        var info = $("#del-info");
        removeEntry(g_notebook.name, entry.index, function() {
            console.log("removed");
            flash_message(info, "success", ["Entry Deleted Successfully"],
                          1500, function() {
                              info.html("");
                              info.removeClass("success");
                              $("#spotlight").fadeOut(150);
                          });
            reSearch(tagList);
        });
    });


}


function search() {
    var notebookHeader = g_notebook;
    if($("#search").val() === "") {
        console.log("everything");
        getEntries(g_notebook.name, function() {
            generateEntries(g_searchResults);
        });
    } else {
        var input = $("#search").val();
        var output = "";
        //remove hashtags
        input = input.replace(/#/g, '');
        //replace commas with whitespace
        input = input.replace(/,/g, ' ');
        if(input.indexOf("+") >= 0) { // intersection query
            output = input.replace(/\+/g, g_parseTokens.intersection);
        } else { //union query
            output  = input.replace(/ +/g, g_parseTokens.union);
        }
        console.log("search:",  output);
        searchNotebook(g_notebook.name, output, function() {
            g_searchQuery = output;
            generateEntries(g_searchResults);
        });
    }
}


function displayNotebookName() {
    $("#notebook-name").html(g_notebook.name);
    var fn = setupDrawTags("graph", g_notebook.alltags);
    $("#graph").click(fn);
}

function generateEntries(entries) {
    $("#entries").html("");
    if(entries && entries.length > 0) {
        //sort entries correctly
        if($("#sort-accessed").hasClass("selected"))
            sortEntriesMRU(entries);
        if($("#sort-oldest").hasClass("selected"))
            sortEntriesOldest(entries);
        if($("#sort-newest").hasClass("selected"))
            sortEntriesNewest(entries);

        entries.forEach(function (e) {
            var link, tags, text;
            if(e.content === undefined || e.content === "") {
                text = $("<p>").html($("<pre>").html(e.desc));
            } else {
                link = $("<h3>").html($('<a href="'+e.content+'">')
                                      .html(e.content));
                text = $("<p>").html($("<pre>").html(e.desc));
            }
            var prepareTags = e.tags.map(function(s) { return "#"+s;});
            var tags = $('<p class="tags">').html(prepareTags.join("   "));
            var date = $("<span>").html(e.dateAdded)
            var edit = $('<a href="#" class="edit">edit</a>').click(function () {
                editEntryDialog(e);
            });
            var del = $('<a href="#" class="delete">del</a>').click(function() {
                delEntryDialog(e);
            });
            var entry = $('<div class="entry">');
            entry.append(link, date);
            if(text !== undefined)
                entry.append(text);
            entry.append(tags);
            entry.append($('<div class="operations">').append(edit, del));

            if(!entry.deleted)
                $("#entries").append(entry);
        });
    } else {
        $("#entries").append($('<p class="no-entry-msg">').html("No entries found."),
                             $('<p class="hint">').html("Hint: Searching with no tags returns all entries"));
    }
    console.log(entries);
}


/* Code derived from http://onpub.com/index.php?s=7&a=109*/
// Sorts the entries of a list of entries by the date created,
// Oldest first.
function sortEntriesOldest(entries){
	// Comparison function for sort
	var date_sort = function (entry1, entry2) {
		var date1 = Date.parse(entry1.dateAdded);
		var date2 = Date.parse(entry2.dateAdded);
		if (date1 > date2) return 1;
		if (date1 < date2) return -1;
		return 0;
	};
  console.log("sort oldest!");
	entries.sort(date_sort);
}
/* Code derived from http://onpub.com/index.php?s=7&a=109*/
// Sorts the entries of a list of entries by the date created,
// Newest first.
function sortEntriesNewest(entries){
	// Comparison function for sort
	var date_sort = function (entry1, entry2) {
		var date1 = Date.parse(entry1.dateAdded);
		var date2 = Date.parse(entry2.dateAdded);
		if (date1 > date2) return -1;
		if (date1 < date2) return 1;
		return 0;
	};
  console.log("sort newest");
	entries.sort(date_sort);
}

/* Code derived from http://onpub.com/index.php?s=7&a=109*/
// Sorts the entries of a list of entries by the dateAccessed,
// Most Recent First.
function sortEntriesMRU(entries){
	// Comparison function for sort
	var date_sort_desc = function (entry1, entry2) {
		var date1 = Date.parse(entry1.dateAccessed);
		var date2 = Date.parse(entry2.dateAccessed);
		if (date1 > date2) return -1;
		if (date1 < date2) return 1;
		return 0;
	};
  console.log("sort mru");
	entries.sort(date_sort_desc);
}

$(document).ready(function() {
	  console.log("Some functions: ");
	  console.log("getNotebooks(), addNotebook(name), getNotebook(name), addEntryWithData(name, content, listOfTags), removeEntry(name, entryIndex), upDate(name, entryIndex, dateAccessed), checkNotebook(notebook), searchNotebook(name, tag)");
    //initialize globals
    addLinkE = $("#link");
    addTagE = $("#tag");
    addTextE = $("#text");
    addInfoE = $("#information");
    editLinkE = $("#edit-link");
    editTagE = $("#edit-tag");
    editTextE = $("#edit-text");
    editInfoE = $("#edit-info");

    var urlSegments = window.location.pathname.split('/');
    var origin = window.location.origin;
    urlSegments.splice(0,1); // removes "" from the beginning of list
    if(urlSegments[0] === "notebook" && urlSegments.length > 1){
        g_parsedName = urlSegments[1];
        console.log("getting notebook: " + g_parsedName);
        getNotebookHeader(g_parsedName, displayNotebookName, function() {
            flash_message(addInfoE, "error", [
                "The notebook "+g_parsedName+" from the url does not exist!"]);
        });
    }
    generateEntries(); // show no entries found

    //setup submit button
    addLinkE.keypress(function(event) {
        if(event.keyCode === 13) { //hit enter
            if(addTagE.val() === "") {
                addTagE.focus();
            } else if(addLinkE.val() === "" && addTextE.val() === "") {
                addTextE.focus();
            } else {
                submitEntry(addLinkE, addTagE, addTextE, addInfoE, submitAddFunction);
            }
        }
    });
    addTagE.keypress(function(event) {
        if(event.keyCode === 13) { //hit enter
            if(addLinkE.val() === "" && addTextE.val() === "") {
                addTextE.focus();
            } else {
                submitEntry(addLinkE, addTagE, addTextE, addInfoE, submitAddFunction);
            }
        }
    });



    $("#submit-entry").click(function() {
        submitEntry(addLinkE, addTagE, addTextE, addInfoE, submitAddFunction);
    });

    //search form
    $("#go").click(search)
    $("#search").keypress(function(event) {
        if(event.keyCode === 13) //hit enter
            search();
    });

    //entry sorting links
    $("#sort-accessed").click(function() {
        $(".selected").removeClass("selected");
        $("#sort-accessed").addClass("selected");
        sortEntriesMRU(g_searchResults);
        generateEntries(g_searchResults);
    });

    $("#sort-oldest").click(function() {
        $(".selected").removeClass("selected");
        $("#sort-oldest").addClass("selected");
        sortEntriesOldest(g_searchResults);
        generateEntries(g_searchResults);
    });

    $("#sort-newest").click(function() {
        $(".selected").removeClass("selected");
        $("#sort-newest").addClass("selected");
        sortEntriesNewest(g_searchResults);
        generateEntries(g_searchResults);
    });

    //setup dialog
    $("#stage-edit").click(function(event) {
        event.stopPropagation();
    });
    $("#stage-del").click(function(event) {
        event.stopPropagation();
    });
    $("#spotlight").click(function() {
        $(this).fadeOut(200);
    });

});
