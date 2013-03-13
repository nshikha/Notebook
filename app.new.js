var express = require("express");
var Sequelize = require("sequelize");
var app = express();
app.use(express.bodyParser());
app.use(express.logger());

var sequelize = new Sequelize('mynotebook', 'postgres', null, {
    dialect: 'postgres',
    port: 5432
});

var Notebook = sequelize.define('notebook', {
    name: { type: Sequelize.STRING, unique: true, allowNull: false,
            validate: {
                isAlphanumeric: true,
                notEmpty: true
            }
          }
});

var Tag = sequelize.define('tag', {
    name: { type: Sequelize.STRING, allowNull: false,
            validate: {
                isAlphanumeric: true,
                notEmpty: true
            }
          }
});

var Entry = sequelize.define('entry', {
    link: { type: Sequelize.STRING },
    desc: { type: Sequelize.STRING },
    dateAccessed: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
});

Notebook.hasMany(Tag, {as: 'Tags'});
Notebook.hasMany(Entry, {as: 'Entries'});
Tag.hasMany(Entry, {as: 'Entries'});
Entry.hasMany(Tag, {as: 'Tags'});

sequelize.sync().success(function() {
    console.log("database sync complete");
}).error(function(e) {
    console.log("ERROR: "+e);
});




// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

// This route is hit when a specific notebook is requested
app.get("/notebook/:name", function (request, response) {
    var name = request.params.name
    if(existingNotebookName(name) || !staticFile(name)) {
        response.sendfile("static/notebook.html");
    } else {
        response.sendfile("static/" + request.params.name);
    }
});


// Creates a new notebook
app.post('/create', function (request, response) {
	  var name = 	request.body.name;
    var n = Notebook.build({name: name});
    console.log("create hit: name = "+name);
    function returnError(e) {
        response.send({success:false, status: "unknown", message: e});
    }

    if(n.validate() === null) {
        n.save().success(function(n) {
            n.getEntries().success(function(entries) {
                n.getTags().success(function(tags) {
                    response.send({name: n.name,
                                   dateCreated: n.createdAt,
                                   entries: entries,
                                   tags: tags,
                                   success: true});
                }).error(returnError);
            }).error(returnError);
        }).error(function(e) {
            if(String(e).indexOf("unique")) {
                response.send({ success: false, status: 'existing'});
            }
            response.send({success: false, status: 'unknown',
                           message: e});
        });
    } else {
        console.log(n.validate());
        response.send({ success: false, status: 'invalid'});
    }

/* {success: false, status: invalid | existing }
or {success: true, statis: created, notebook: notebook} */
});

// Updates a date in a notebook
app.post('/upDate', function (request, response) {
	var name = 	request.body.name;
	var index = request.body.entryIndex;
	var dateAccessed = request.body.dateAccessed;
/* {success: false}
or {success: true, notebook: notebook} */

});

// Removes an entry from a notebook
app.post('/removeEntry', function (request, response) {
	  var name = 	request.body.name;
    var notebookId = request.body.notebookId;
	  var id = request.body.entryId;
    Entry.find(id).success(function(entry) {
        if(entry.notebookId === notebookId){
            entry.setNotebook().success(function(n) {
                response.send({success: true});
            });
        } else {
            response.send({success: false,
                           message: 'notebook mismatch'});
        }
    }).error(function(e){
        response.send({success: false,
                       message: 'cannot get entry',
                       error: e});
    });
    /*{success: false} or {success: true} */
});

// Edits an entry in the existing notebook
app.post('/editEntry', function (request, response) {
	  var name = 	request.body.name;
    var notebookId = request.body.notebookId;
	  var entry = request.body.entry;

    Entry.find(entry.id).success(e) {
        e.update(attributes
    }).error();
/* {success: false}
or {success: true, notebook: notebook, entry: entry} */

});

// Adds a new entry to an existing notebook
app.post('/addEntry', function (request, response) {
	var name = 	request.body.name;
	var entry = request.body.entry;

    /* {success: false}
       {success: true,
        notebook: notebook,
        entries: entry,
        status: ""}
     */

});

// Loads the list of notebooks for someone to look at.
app.get('/notebooks', function (request, response) {
    /* {list: list of all notebooks
        success: true } */

});

// Loads an existing notebook header
app.get('/loadHeader/:name', function (request, response) {
	var name = request.params.name;
	var notebook;
/* {success: false}
or {notebook_header: {name, dateCreated, allTags, numEntries},
    parsing_delimeters: parseing delimeters,
    success: true}
*/

});

// Loads an existing notebook
app.get('/load/:name', function (request, response) {
	var name = request.params.name;
	var notebook;
/* {success: false}
or {notebook: notebook}*/

});

// Sends back a list of all of the entries.
app.get('/loadEntries/:name', function (request, response) {
	var name = request.params.name;
	var notebook;
/* {success: false}
or {success: true, entries: entries} */

});

// Searches an existing notebook for a tag
app.get('/search/:name/:tags', function (request, response) {
	var name = request.params.name;
	var tags = request.params.tags;


/* {success: false}
or {success: true, results: entries} */

});


app.get('/', function(request, response) {
    Notebook.findAll().success(function(n) {
        Tag.findAll().success(function(t) {
            Entry.findAll().success(function(e) {
                response.send({
                    notebooks: n,
                    tags: t,
                    entries: e
                });
            });
        });
    });
});

var port = 8080;
app.listen(port, function() {
    console.log('Listening on port:', port);
});


module.exports = (function () {
    return {
        models: { Notebook: Notebook,
                  Tag: Tag,
                  Entry: Entry },
        db: sequelize,
        libs: { express: express,
                Sequelize: Sequelize }
    };
})();
