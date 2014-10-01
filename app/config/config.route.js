define(["home/home", "editor/editor"],
    function(home, editor) {
        return {
            "": {
                template: "/home/home.htm",
                model: home
            },
            editor: {
                template: "/editor/editor.htm",
                model: editor
            },
            dog: {
                template: "/home/home.htm",
                model: {
                    title: "Test Title 2",
                    body: "WOOOOOOOOOOOOOOOOOOOOOOOooooooooooooooooooooooooooooWWWWWWWWWWWWWWWWoooooooooooooooo"
                }
            }
        };
    });