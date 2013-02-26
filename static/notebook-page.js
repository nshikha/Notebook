function submitEntry() {
    var link = $("#link").val();
    var tags = $("#tag").val();
    var text = $("#text").val();
    var info = $('#information');

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
        }, 5000);
    } else {
        // ready to add
        var tagList = tags.split(",").map(function (s) { return s.trim();});
        tagList = tagList.map(function(s) { if(s[0] === "#") return s.split('#')[1];
                                            return s;
                                          });
        addEntryWithData(g_notebook.name, link, tagList, text,
                         function() {
                             info.append($("<p>").html("Entry Added Successfully!"));
                             info.addClass("success");
                             window.setTimeout(function() {
                                 info.html("");
                                 info.removeClass("success");
                             }, 5000);
                             $("#link").val("");
                             $("#tag").val("");
                             $("#text").val("");
                         });
    }
}


function displayNotebookName() {
    $("#notebook-name").html(g_notebook.name);
}


function showCreateNotebook() {
    $("#spotlight").show();
    $("#cancel-new").click(function() {
        var origin = window.location.origin;
        window.location = origin+"/static/index.html";
    });
    $("#create-new").click(function() {
        addNotebook(g_parsedName, function () {
            var info = $("#information");
            displayNotebookName();
            info.append($("<p>").html("Created new notebook!"));
            info.addClass("success");
            window.setTimeout(function() {
                info.html("");
                info.removeClass("success");
            }, 5000);
            $("#spotlight").hide();
        });
    });
}

$(document).ready(function() {
	  console.log("Some functions: ");
	  console.log("getNotebooks(), addNotebook(name), getNotebook(name), addEntryWithData(name, content, listOfTags), removeEntry(name, entryIndex), upDate(name, entryIndex, dateAccessed), checkNotebook(notebook), searchNotebook(name, tag)");


    var urlSegments = window.location.pathname.split('/');
    var origin = window.location.origin;
    urlSegments.splice(0,1); // removes "" from the beginning of list
    if(urlSegments[0] === "notebook" && urlSegments.length > 1){
        g_parsedName = urlSegments[1];
        console.log("getting notebook: " + g_parsedName);
        getNotebookHeader(g_parsedName, displayNotebookName, showCreateNotebook);
    }

    //setup submit button
    $("#submit-entry").click(submitEntry);

    //search form
    $("#go").click(function () {
        console.log("herp");
        if($("#search").val() === "") {
            console.log("everything");
            window.location = origin + "/notebook/" + g_parsedName +
                "/all/entries";
        } else {
            window.location = origin + "/notebook/" + g_parsedName +
                "/search/" + $("#search").val();
        }
    });

});
