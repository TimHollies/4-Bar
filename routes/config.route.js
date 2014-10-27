var
    home = require('app/home/home'),
    editor = require('app/editor/editor');

module.exports = {
    "": {
        template: require("app/home/home.html"),
        model: home
    },
    editor: {
        template: require("app/editor/editor.html"),
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