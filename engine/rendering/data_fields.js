'use strict';

var data = {};

var informationFieldFunctions = {
    "title": function(a, draw) {
        if (data.title) data.title.remove();
        data.title = draw.text(a.parsed[0].data).font({
            family: 'Georgia',
            size: 32,
            anchor: 'middle',
            leading: '1.5em'
        }).move(draw.bbox().width/2, 0);
    },
    "rhythm": function(a, draw) {
        if (data.rhythm) data.rhythm.remove();
        data.rhythm = draw.text(a.parsed[0].data).font({
            family: 'Georgia',
            size: 16,
            anchor: 'middle',
            leading: '1.5em'
        }).move(20, 60);
    }
}

var delInformationFieldFunctions = {
    "title": function(a) {
        data.title.remove();
        data.title = null;
    },
    "rhythm": function(a) {
        data.rhythm.remove();
        data.rhythm = null;
    }
}

module.exports = {
    add: informationFieldFunctions,
    remove: delInformationFieldFunctions
};