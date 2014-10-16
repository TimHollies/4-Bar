define(["home/home", "editor/editor"],
    function(home, editor) {
        return {
            "": {
                template: "home",
                model: home
            },
            editor: {
                template: "editor",
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
    });