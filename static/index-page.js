function toNotebook() {
    var notebookName = $("#name").val();
    var info = $("#information");
    if(notebookName === "") {
        info.append($('<p>').html("Please enter a notebook name"));
        info.addClass("error");
        window.setTimeout(function() {
            info.html("");
            info.removeClass("error");
        }, 2000);
    } else {
        var origin = window.location.origin;
        window.location = origin+"/notebook/"+notebookName;
    }
}

$(document).ready(function() {
	  console.log("Some functions: ");
	  console.log("getNotebooks(), addNotebook(name), getNotebook(name), addEntryWithData(name, content, listOfTags), removeEntry(name, entryIndex), upDate(name, entryIndex, dateAccessed), checkNotebook(notebook), searchNotebook(name, tag)");

    $('#go').click(function() {
        toNotebook();
    });
    $('#cover form').submit(function() {
        toNotebook();
    });
});
