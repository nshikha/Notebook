function openNotebook() {
    var notebookName = $("#open").val();
    var info = $("#open-info");
    if(notebookName === "") {
        info.append($('<p>').html("Please enter a notebook name"));
        info.addClass("error");
        window.setTimeout(function() {
            info.html("");
            info.removeClass("error");
        }, 1500);
    } else {
        getNotebookHeader(
            notebookName,
            function() {
                var origin = window.location.origin;
                window.location = origin+"/notebook/"+notebookName;
            }, function() {
                info.append($('<p>').html("That notebook doesn't exist!"));
                info.addClass("error");
                window.setTimeout(function() {
                    info.html("");
                    info.removeClass("error");
                }, 1500);
            });
    }
}


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
        openNotebook();
    });
    $("#open").keypress(function(event) {
        if(event.keyCode === 13) //hit enter
            openNotebook();
    });

    $('#create').click(function() {
        createNotebook();
    });
    $("#new").keypress(function(event) {
        if(event.keyCode === 13) //hit enter
            createNotebook();
    });
});
