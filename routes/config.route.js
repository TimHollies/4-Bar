module.exports = {
    "": {
        template: require("app/home/home.html"),
        partials: [
            require("app/partials/userbox")    
        ],
        model: require('app/home/home')
    },
    "editor": {
        template: require("app/editor/editor.html"),
        partials: [
            require("app/partials/userbox") 
        ],
        model: require('app/editor/editor')
    },
    "user": {
        template: require("app/user/user.html"),
        partials: [
            require("app/partials/userbox") 
        ],
        model: require('app/user/user')
    },
    "viewer": {
        template: require("app/viewer/viewer.html"),
        partials: [
            require("app/partials/userbox") 
        ],
        model: require('app/viewer/viewer')
    },
    "tutorial": {
        template: require("app/tutorial/tutorial.html"),
        partials: [
            require("app/partials/userbox") 
        ],
        model: require('app/tutorial/tutorial')
    }
};