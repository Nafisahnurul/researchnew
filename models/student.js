var mongoose = require('mongoose')

var studentSchema = new mongoose.Schema({
    name    : String,
    nim     : String,
    prodi   : String,
    email   : String,
    message : String
});

module.exports = mongoose.model("Student", studentSchema);