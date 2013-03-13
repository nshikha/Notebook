function flash_message(info, cls, msgs) {
    info.html("");
    info.removeClass();
    msgs.forEach(function (e) {
        info.append($('<p>').html(e));
    });
    info.addClass(cls);
}

function openNotebook() {
    var notebookName = $("#open").val();
    var info = $("#open-info");
    if(notebookName === "") {
        flash_message(info, "error", ["Please enter a notebook name"]);
    } else {
        getNotebookHeader(
            notebookName,
            function() {
                var origin = window.location.origin;
                window.location = origin+"/notebook/"+notebookName;
            }, function() {
                flash_message(info, "error", ["That notebook doesn't exist"]);
            });
    }
}


function createNotebook() {
    var notebookName = $("#new").val();
    var info = $("#new-info");

    if(notebookName === "") {
        flash_message(info, "error", ["Please enter a notebook name"]);
    } else {
        addNotebook(notebookName, function() {
            var origin = window.location.origin;
            window.location = origin+"/notebook/"+notebookName;
        }, function(err_message, d) {
            var msg = "";
            if (err_message === "existing") {
                msg = "This notebook already exists!";
            } else {
                console.log(d);
                msg = "This notebook name is invalid";
            }
            flash_message(info, "error", [msg]);
        });

    }
}


function toNotebook() {
    var notebookName = $("#name").val();
    var info = $("#information");
    if(notebookName === "") {
        flash_message(info, "error", ["Please enter a notebook name"]);
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
