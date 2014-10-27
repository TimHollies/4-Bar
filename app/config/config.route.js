var
    home = require('../home/home'),
    editor = require('../editor/editor');

module.exports = {
    "": {
        template: require("../home/home.html"),
        model: home
    },
    editor: {
        template: require("../editor/editor.html"),
        model: editor
    },
    dog: {
        template: "home",
        model: {
            title: "Test Title 2",
            body: "WOOOOOOOOOOOOOOOOOOOOOOOooooooooooooooooooooooooooooWWWWWWWWWWWWWWWWoooooooooooooooo"
        }
    }
};