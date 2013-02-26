function displayNotebookName() {
    $("#notebook-name").html(g_notebook.name);
}

function displayNotebookNameAndSetAll () {
    displayNotebookName();
    g_notebook.all = true;
    displayEntries();
}

function generateEntries(entries) {
    entries.forEach(function (e) {
        var link, tags, text;
        if(e.content === undefined || e.content === "") {
            link = $("<h3>").html("Note:");
            text = $("<p>").html(e.desc);
        } else {
            link = $("<h3>").html(e.content);
        }
        var tags = $('<p class="tags">').html(String(e.tags));
        var date = $("<span>").html(e.dateAdded)
        var edit = $('<a href="#" class="edit">').click(function () {
            editEntryDialog(e);
        });
        var del = $('<a href="#" class="delete">').click(function() {
            removeEntry(g_notebook.name, e.index);
            displayEntries();
        });
        var entry = $('<div class="entry">');
        entry.append(link, date, tags);
        if(text !== undefined)
            entry.append(text);
        entry.append(edit, del);
        $("#entries").append(entry);
    });
    console.log("yay");
}

function displayEntries() {
    $("#entries").html("");

    if(g_searchResults === undefined && g_notebook.all === true) {
        generateEntries(g_notebook.entries);
    } else {
        generateEntries(g_searchResults);
    }


}


$(document).ready(function() {
	  console.log("Some functions: ");
	  console.log("getNotebooks(), addNotebook(name), getNotebook(name), addEntryWithData(name, content, listOfTags), removeEntry(name, entryIndex), upDate(name, entryIndex, dateAccessed), checkNotebook(notebook), searchNotebook(name, tag)");


    var urlSegments = window.location.pathname.split('/');
    urlSegments.splice(0,1); // removes "" from the beginning of list
    if(urlSegments[0] === "notebook" && urlSegments.length > 1){
        g_parsedName = urlSegments[1];
        if(urlSegments[2] === "all") {
            console.log("getting whole notebook: " + g_parsedName);
            getNotebook(g_parsedName, displayNotebookNameAndSetAll);
        } else {
            console.log("getting notebook: " + g_parsedName);
            getNotebookHeader(g_parsedName, displayNotebookName);
            g_parsedQuery = urlSegments[3];
            console.log("searching: " + g_parsedQuery);
            searchNotebook(g_parsedName, g_parsedQuery, displayEntries);
        }
    }

});
