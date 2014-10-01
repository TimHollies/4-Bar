var monk = require("monk");

function out() {
    
    var db = monk('localhost/webabc');
    
    var tunes = db.get("tunes");
    tunes.insert({name: 'Tam Lin'});
    tunes.drop();
    
    db.close();
    return "cat";
}

module.exports = out;
