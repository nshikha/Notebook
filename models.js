module.exports = (function () {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var models = {};


    var NotebookSchema = new Schema({
        name        : {type: String, required: true},
        tags        : [{type: ObjectId, ref: 'Tag'}],
        entries     : [(type: ObjectId, ref: 'Entry'}],
        dateCreated : Date
    });
    models.Notebook = mongoose.model('Notebook', NotebookSchema);

    var TagSchema = new Schema({
        tag : {type: String, required: true}
    });
    models.Tag = mongoose.model('Tag', TagSchema);

    var EntrySchema = new Schema({
        link         : String,
        tags         : [{type: ObjectId, ref: 'Tag', required: true}],
        description  : String,
        dateCreated  : Date,
        dateAccessed : Date
    });
    models.Entry = mongoose.model('Entry', EntrySchema);

    return models;

})();
