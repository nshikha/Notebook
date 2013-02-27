//globals
var addLinkE, addTagE, addTextE, addInfoE;
var editLinkE, editTagE, editTextE, editInfoE;


//function that does the adding API call
function submitAddFunction(linkE, tagsE, textE, info, tagList) {
    var link = linkE.val();
    var text = textE.val();
    addEntryWithData(g_notebook.name, link, tagList, text,
                     function() {
                         info.append($("<p>").html("Entry Added Successfully!"));
                         info.addClass("success");
                         window.setTimeout(function() {
                             info.html("");
                             info.removeClass("success");
                         }, 1500);
                         linkE.val("");
                         tagsE.val("");
                         textE.val("");

                         //should we reSearch because we added something
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

                         //should we reload because we added something
                         if(g_searchResults && g_searchResults.all) {
                             getNotebook(g_notebook.name, function() {
                                 g_searchResults = g_notebook.entries;
                                 generateEntries(g_searchResults);
                                 g_searchResults.all = true;
                                 getNotebookHeader(g_notebook.name);
                             });
                         }
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
        errors.push($('<p>').html("You must input at least one tag!"));
    }
    if(link === "" && text === "") {
        errors.push($('<p>').html("You must input either a link or some notes!"));
    }

    if(errors.length > 0) {
        errors.forEach( function (elem) { elem.appendTo(info)});
        info.addClass("error");
        window.setTimeout(function() {
            info.html("");
            info.removeClass("error");
        }, 1500);
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
            info.append($("<p>").html("Entry Added Successfully!"));
            info.addClass("success");
            window.setTimeout(function() {
                info.html("");
                info.removeClass("success");
                $("#spotlight").fadeOut();
            }, 1500);
            linkE.val("");
            tagsE.val("");
            textE.val("");

            //should we reSearch because we added something
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

            //should we reload because we added something
            if(g_searchResults.all) {
                getNotebook(g_notebook.name, function() {
                    g_searchResults = g_notebook.entries;
                    generateEntries(g_searchResults);
                    g_searchResults.all = true;
                    getNotebookHeader(g_notebook.name);
                });
            }
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
        var info = addInfoE;
        removeEntry(g_notebook.name, entry.index, function() {
            $("#spotlight").fadeOut(100);
            console.log("removed");
            info.append($("<p>").html("Entry Deleted Successfully!"));
            info.addClass("success");
            window.setTimeout(function() {
                info.html("");
                info.removeClass("success");
            }, 1500);
            //should we reSearch because we added something
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

            //should we reload because we added something
            if(g_searchResults.all) {
                getNotebook(g_notebook.name, function() {
                    g_searchResults = g_notebook.entries;
                    generateEntries(g_searchResults);
                    g_searchResults.all = true;
                    getNotebookHeader(g_notebook.name);
                });
            }
        });
    });


}


function search() {
    var notebookHeader = g_notebook;
    if($("#search").val() === "") {
        console.log("everything");
        getNotebook(g_notebook.name, function() {
            g_searchResults = g_notebook.entries;
            g_notebook = notebookHeader;
            generateEntries(g_searchResults);
            g_searchResults.all = true;
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
}

function generateEntries(entries) {
    //sort entries correctly
    if($("#sort-accessed").hasClass("selected"))
        sortEntriesMRU(entries);
    if($("#sort-oldest").hasClass("selected"))
        sortEntriesOldest(entries);
    if($("#sort-newest").hasClass("selected"))
        sortEntriesNewest(entries);

    $("#entries").html("");
    entries.forEach(function (e) {
        var link, tags, text;
        if(e.content === undefined || e.content === "") {
            link = $("<h3>").html("Note:");
            text = $("<p>").html($("<pre>").html(e.desc));
        } else {
            link = $("<h3>").html($('<a href="'+e.content+'">').html(e.content));
        }
        var tags = $('<p class="tags">').html(String(e.tags));
        var date = $("<span>").html(e.dateAdded)
        var edit = $('<a href="#" class="edit">edit</a>').click(function () {
            editEntryDialog(e);
        });
        var del = $('<a href="#" class="delete">del</a>').click(function() {
            delEntryDialog(e);
        });
        var entry = $('<div class="entry">');
        entry.append(link, date, tags);
        if(text !== undefined)
            entry.append(text);
        entry.append(edit, del);

        if(!entry.deleted)
            $("#entries").append(entry);
    });
    console.log("yay");
}


/* Code derived from http://onpub.com/index.php?s=7&a=109*/
// Sorts the entries of a list of entries by the latest dateAccessed,
// Least recent first.
function sortEntriesLRU(entries){
	// Comparison function for sort
	var date_sort_asc = function (entry1, entry2) {
		var date1 = entry1.dateAccessed;
		var date2 = entry2.dateAccessed;
		if (date1 > date2) return 1;
		if (date1 < date2) return -1;
		return 0;
	};

	entries.sort(date_sort_asc);
}

/* Code derived from http://onpub.com/index.php?s=7&a=109*/
// Sorts the entries of a list of entries by the date created,
// Oldest first.
function sortEntriesOldest(entries){
	// Comparison function for sort
	var date_sort_asc = function (entry1, entry2) {
		var date1 = entry1.dateAccessed;
		var date2 = entry2.dateAccessed;
		if (date1 > date2) return 1;
		if (date1 < date2) return -1;
		return 0;
	};

	entries.sort(date_sort_asc);
}
/* Code derived from http://onpub.com/index.php?s=7&a=109*/
// Sorts the entries of a list of entries by the date created,
// Newest first.
function sortEntriesNewest(entries){
	// Comparison function for sort
	var date_sort_asc = function (entry1, entry2) {
		var date1 = entry1.dateAccessed;
		var date2 = entry2.dateAccessed;
		if (date1 > date2) return -1;
		if (date1 < date2) return 1;
		return 0;
	};

	entries.sort(date_sort_asc);
}

/* Code derived from http://onpub.com/index.php?s=7&a=109*/
// Sorts the entries of a list of entries by the dateAccessed,
// Most Recent First.
function sortEntriesMRU(entries){
	// Comparison function for sort
	var date_sort_desc = function (entry1, entry2) {
		var date1 = entry1.dateAccessed;
		var date2 = entry2.dateAccessed;
		if (date1 > date2) return -1;
		if (date1 < date2) return 1;
		return 0;
	};

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
        getNotebookHeader(g_parsedName, displayNotebookName);
    }

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
                addLinkE.focus();
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
        $("#sort-accessed").addClass("selected");
        sortEntriesOldest(g_searchResults);
        generateEntries(g_searchResults);
    });

    $("#sort-newest").click(function() {
        $(".selected").removeClass("selected");
        $("#sort-accessed").addClass("selected");
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
