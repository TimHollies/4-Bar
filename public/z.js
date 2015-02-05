require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./app/app.js":[function(require,module,exports){
"use strict";
console.log("NOT READY");

var consoleKeeper = console;

require.ensure("vendor", function () {
    console.log("ALMOST");

    var Ractive = require('./../engine/vendor.js').Ractive,
        routingConfig = require("../routes/config.route"),
        page = require('./../engine/vendor.js').page,
        _ = require('./../engine/vendor.js').lodash,
        domready = require('./../engine/vendor.js').domready;

    console = consoleKeeper;

    console.log("ALMOST");

    domready(function () {
        console.log("READY");

        function route(currentRoute, context) {
            if (routingConfig[currentRoute] !== undefined) {
                var currentRouteConfig = routingConfig[currentRoute];

                var dummyData = {};
                var partials = [];
                var partialviews = {};

                if (currentRouteConfig.partials !== undefined) {
                    partials = currentRouteConfig.partials;
                    partialviews = partials.reduce(function (a, b) {
                        a[b.name] = b.view;
                        return a;
                    }, {});
                }

                var ractive = new Ractive({
                    el: "#stage",
                    template: currentRouteConfig.template,
                    data: dummyData,
                    lazy: false,
                    partials: partialviews
                });

                currentRouteConfig.model(ractive, dummyData, page, context);

                _(partials).each(function (partial) {
                    partial.model(ractive);
                });
            } else {}
        }

        //forcs the request to go to the server rather than the client
        page.serverMap = function (url) {
            page(url, function (context) {
                window.location = url;
            });
        };

        page("", function (context) {
            route("", context);
        });

        page("/editor", function (context) {
            route("editor", context);
        });

        page("/user", function (context) {
            route("user", context);
        });

        page("/viewer", function (context) {
            route("viewer", context);
        });

        page("/viewer/:tuneid", function (context) {
            route("viewer", context);
        });

        page("/tutorial", function (context) {
            route("tutorial", context);
        });

        page("/tunebook", function (context) {
            route("tunebook", context);
        });

        page("/tunebook/view", function (context) {
            route("tunebooks", context);
        });

        page("editor/:tuneid", function (context) {
            route("editor", context);
        });

        page.serverMap("/auth/google");
        page.serverMap("/logout");

        page("*", function (context) {
            console.log("BAD");
        });

        //route();

        //window.onhashchange = route;

        page.start();
    });
});

},{"../routes/config.route":"D:\\TimTech\\WebABC\\routes\\config.route.js","./../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\routes\\config.route.js":[function(require,module,exports){
"use strict";

module.exports = {
    "": {
        template: require('./../app/home/home.html'),
        partials: [require('./../app/partials/userbox')],
        model: require('./../app/home/home')
    },
    editor: {
        template: require('./../app/editor/editor.html'),
        partials: [require('./../app/partials/userbox')],
        model: require('./../app/editor/editor')
    },
    user: {
        template: require('./../app/user/user.html'),
        partials: [require('./../app/partials/userbox')],
        model: require('./../app/user/user')
    },
    viewer: {
        template: require('./../app/viewer/viewer.html'),
        partials: [require('./../app/partials/userbox')],
        model: require('./../app/viewer/viewer')
    },
    tutorial: {
        template: require('./../app/tutorial/tutorial.html'),
        partials: [require('./../app/partials/userbox')],
        model: require('./../app/tutorial/tutorial')
    },
    tunebook: {
        template: require('./../app/tunebook/tunebook_edit.html'),
        partials: [require('./../app/partials/userbox')],
        model: require('./../app/tunebook/tunebook_edit')
    },
    tunebooks: {
        template: require('./../app/tunebook/tunebook_view.html'),
        partials: [require('./../app/partials/userbox')],
        model: require('./../app/tunebook/tunebook_view')
    }
};

},{"./../app/editor/editor":"D:\\TimTech\\WebABC\\app\\editor\\editor.js","./../app/editor/editor.html":"D:\\TimTech\\WebABC\\app\\editor\\editor.html","./../app/home/home":"D:\\TimTech\\WebABC\\app\\home\\home.js","./../app/home/home.html":"D:\\TimTech\\WebABC\\app\\home\\home.html","./../app/partials/userbox":"D:\\TimTech\\WebABC\\app\\partials\\userbox.js","./../app/tunebook/tunebook_edit":"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_edit.js","./../app/tunebook/tunebook_edit.html":"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_edit.html","./../app/tunebook/tunebook_view":"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_view.js","./../app/tunebook/tunebook_view.html":"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_view.html","./../app/tutorial/tutorial":"D:\\TimTech\\WebABC\\app\\tutorial\\tutorial.js","./../app/tutorial/tutorial.html":"D:\\TimTech\\WebABC\\app\\tutorial\\tutorial.html","./../app/user/user":"D:\\TimTech\\WebABC\\app\\user\\user.js","./../app/user/user.html":"D:\\TimTech\\WebABC\\app\\user\\user.html","./../app/viewer/viewer":"D:\\TimTech\\WebABC\\app\\viewer\\viewer.js","./../app/viewer/viewer.html":"D:\\TimTech\\WebABC\\app\\viewer\\viewer.html"}],"D:\\TimTech\\WebABC\\app\\viewer\\viewer.js":[function(require,module,exports){
"use strict";

var fade = require('./../../engine/scripts/transitions/ractive.transitions.fade'),
    fly = require('./../../engine/scripts/transitions/ractive.transitions.fly'),
    screenfull = require('./../../engine/vendor.js').screenfull,
    queryString = require('./../../engine/vendor.js').queryString,
    engine = require('./../../engine/engine'),
    ABCParser = engine.parser,
    ABCRenderer = engine.render,
    diff = engine.diff,
    dispatcher = engine.dispatcher,
    ABCLayout = engine.layout,
    AudioRenderer = engine.audioRender,
    AudioEngine = engine.audio;


module.exports = function (ractive, context, page, urlcontext, user) {
    var parameters = queryString.parse(urlcontext.querystring);

    var parser = ABCParser(),
        layout = ABCLayout(),
        renderer = ABCRenderer();

    ractive.set("playing", false);

    dispatcher.on({
        edit_tune: function () {
            page("/editor?tuneid=" + parameters.tuneid);
        },
        show_fullscreen: function () {
            var elem = document.getElementById("fullscreenZone");
            if (screenfull.enabled) {
                screenfull.request(elem);
            }
        },
        publish_tune: function () {
            $.ajax({
                type: "POST",
                url: "/api/tunes/publish",
                data: {
                    tuneId: ractive.get("tune")._id
                }
            }).then(function () {
                dispatcher.send("tune_publish_success");
                toastr.success("Tune published", "Success!");
            });
        },
        "end-of-tune": function () {
            ractive.set("playing", false);
        }
    });

    ractive.on({
        navigate_back: function () {
            window.history.back();
        },
        edit_tune: function () {
            page("/editor?tuneid=" + ractive.get("tune")._id);
        },
        "toggle-stop-tune": function () {
            AudioEngine.stop();
            ractive.set("playing", false);
        },
        "toggle-play-tune": function () {
            AudioEngine.play(AudioRenderer(doneThing));

            ractive.set("playing", true);
        }
    });

    ractive.set("filterTuneNames", function (tuneNames, filter) {
        if (filter.length <= 0) return tuneNames;
        return tuneNames.filter(function (a) {
            return a.name.toLowerCase().lastIndexOf(filter.toLowerCase(), 0) === 0;
        });
    });

    var doneThing = null;

    if (parameters.tuneid) {
        fetch("/api/tune/" + parameters.tuneid).then(function (response) {
            return response.json();
        }).then(function (res) {
            ractive.set("tune", res);

            var done = diff({
                newValue: res.raw,
                oldValue: ""
            }).map(parser).reduce(layout, 0);

            doneThing = done;

            renderer(done);


        })["catch"](function (ex) {
            console.log("parsing failed", ex);
        });
    }

    if (parameters.transpose) {
        dispatcher.send("transpose_change", parseInt(parameters.transpose));
    }

    window.getTune = function () {
        var tune = doneThing;

        var outTune = [];

        tune.scoreLines.forEach(function (line) {
            line.symbols.filter(function (symbol) {
                return symbol.type === "note";
            }).forEach(function (note) {
                outTune.push([note.pitch + (note.octave - 4) * 12, note.noteLength * 16]);
            });
        });

        return outTune;
    };
};

},{"./../../engine/engine":"D:\\TimTech\\WebABC\\engine\\engine.js","./../../engine/scripts/transitions/ractive.transitions.fade":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js","./../../engine/scripts/transitions/ractive.transitions.fly":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js","./../../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\app\\viewer\\viewer.html":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"section",
      a:{ "class":"page-view",
        id:"view-viewer" },
      f:[ { t:7,
          e:"div",
          a:{ "class":"header row coloured" },
          t1:"fade",
          f:[ { t:7,
              e:"div",
              a:{ "class":"central-menu" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"app-name" },
                  f:[ { t:7,
                      e:"img",
                      v:{ click:"navigate_back" },
                      a:{ src:"/images/logo.png",
                        "class":"app-logo",
                        height:"32px" } } ] } ] },
            " ",
            { t:8,
              r:"userbox" } ] },
        " ",
        { t:7,
          e:"div",
          a:{ "class":"viewer-area" },
          f:[ { t:7,
              e:"div",
              a:{ "class":"tune-information-card" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"card" },
                  f:[ { t:7,
                      e:"h1",
                      f:[ { t:2,
                          r:"tune.name" } ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ style:" float: right; position: static; margin-top: -42px;" },
                      f:[ { t:4,
                          n:50,
                          r:"playing",
                          f:[ { t:7,
                              e:"i",
                              v:{ click:"toggle-stop-tune" },
                              a:{ "class":"fa fa-stop",
                                style:"cursor: pointer" } } ] },
                        { t:4,
                          n:51,
                          f:[ { t:7,
                              e:"i",
                              v:{ click:"toggle-play-tune" },
                              a:{ "class":"fa fa-play",
                                style:"cursor: pointer" } } ],
                          r:"playing" } ] },
                    " ",
                    { t:7,
                      e:"h2",
                      f:[ { t:2,
                          r:"tune.settings.type" },
                        " ",
                        { t:2,
                          r:"tune.settings.key" } ] },
                    " ",
                    { t:7,
                      e:"p",
                      f:[ "Added by ",
                        { t:7,
                          e:"strong",
                          f:[ "Tim Hollies" ] },
                        " on ",
                        { t:2,
                          r:"tune.metadata.createdOn" } ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ "class":"icon-button-panel" },
                      f:[ { t:7,
                          e:"i",
                          v:{ click:"edit_tune" },
                          a:{ "class":"fa fa-pencil-square-o" } },
                        " ",
                        { t:7,
                          e:"i",
                          a:{ "class":"fa fa-floppy-o" } },
                        " ",
                        { t:7,
                          e:"i",
                          a:{ "class":"fa fa-download" } } ] } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"row editor viewer",
                id:"fullscreenZone" },
              t1:"fade",
              f:[ { t:7,
                  e:"div",
                  a:{ id:"canvas" },
                  f:[  ] } ] } ] } ] } ] }
},{}],"D:\\TimTech\\WebABC\\app\\user\\user.js":[function(require,module,exports){
"use strict";

var $ = require('./../../engine/vendor.js').jquery;

var fade = require('./../../engine/scripts/transitions/ractive.transitions.fade'),
    fly = require('./../../engine/scripts/transitions/ractive.transitions.fly'),
    toastr = require('./../../engine/vendor.js').toastr;


module.exports = function (ractive, context, page, urlcontext, user) {
    ractive.on({
        new_tune: function (event) {
            page("/editor");
        },
        navigate_back: function (event) {
            page.show("/");
        }
    });

    ractive.on("view_tune", function (event) {
        var tuneId = event.node.attributes["tune-id"].value;
        console.log(tuneId);
        page("/editor?tuneid=" + tuneId);
    });

    $.getJSON("/api/tunes").then(function (data) {
        ractive.set("tuneNames", data);
    });

    ractive.set("filterTuneNames", function (tuneNames, filter) {
        if (filter.length <= 0) return tuneNames;
        return tuneNames.filter(function (a) {
            return a.name.toLowerCase().lastIndexOf(filter.toLowerCase(), 0) === 0;
        });
    });

    // toastr.success("YAY");
};

},{"./../../engine/scripts/transitions/ractive.transitions.fade":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js","./../../engine/scripts/transitions/ractive.transitions.fly":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js","./../../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\app\\user\\user.html":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"section",
      a:{ "class":"page-view",
        id:"view-user" },
      f:[ { t:7,
          e:"div",
          a:{ "class":"header row coloured" },
          t1:"fade",
          f:[ { t:7,
              e:"div",
              a:{ "class":"back-button" },
              v:{ click:"navigate_back" },
              f:[ { t:7,
                  e:"p",
                  f:[ { t:7,
                      e:"i",
                      a:{ "class":"fa fa-arrow-left" } } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"central-menu" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"app-name" },
                  f:[ { t:7,
                      e:"h1",
                      f:[ "WebABC" ] },
                    { t:7,
                      e:"small",
                      f:[ "Version 0.0.1" ] } ] } ] },
            " ",
            { t:8,
              r:"userbox" } ] },
        " ",
        { t:7,
          e:"div",
          a:{ "class":"row editor" },
          f:[ { t:7,
              e:"div",
              a:{ "class":"column quarter right-divide" },
              t1:{ n:"fade",
                a:[ { delay:100 } ] },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"text-area-padding" },
                  f:[  ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"column three-quarters",
                id:"task-pane" },
              t1:{ n:"fade",
                a:[ { delay:200 } ] },
              f:[ { t:7,
                  e:"h1",
                  f:[ "Yay User!" ] } ] } ] } ] } ] }
},{}],"D:\\TimTech\\WebABC\\app\\tutorial\\tutorial.js":[function(require,module,exports){
"use strict";

var fade = require('./../../engine/scripts/transitions/ractive.transitions.fade'),
    fly = require('./../../engine/scripts/transitions/ractive.transitions.fly'),


//well these work... but are they useful?
tut01 = require('./tut/tut01.htm'),
    tut02 = require('./tut/tut02.htm');


module.exports = function (ractive, context, page, urlcontext, user) {
    ractive.on({
        new_tune: function (event) {
            page("/editor");
        },
        navigate_back: function (event) {
            window.history.back();
        },
        goto_p1: function (event) {
            console.log("p1");
        },
        goto_p2: function (event) {
            console.log("p2");
        }
    });

    ractive.on("view_tune", function (event) {
        var tuneId = event.node.attributes["tune-id"].value;
        console.log(tuneId);
        page("/editor?tuneid=" + tuneId);
    });

    ractive.set("filterTuneNames", function (tuneNames, filter) {
        if (filter.length <= 0) return tuneNames;
        return tuneNames.filter(function (a) {
            return a.name.toLowerCase().lastIndexOf(filter.toLowerCase(), 0) === 0;
        });
    });

    // toastr.success("YAY");
};

},{"./../../engine/scripts/transitions/ractive.transitions.fade":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js","./../../engine/scripts/transitions/ractive.transitions.fly":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js","./tut/tut01.htm":"D:\\TimTech\\WebABC\\app\\tutorial\\tut\\tut01.htm","./tut/tut02.htm":"D:\\TimTech\\WebABC\\app\\tutorial\\tut\\tut02.htm"}],"D:\\TimTech\\WebABC\\app\\tutorial\\tut\\tut02.htm":[function(require,module,exports){
arguments[4]["D:\\TimTech\\WebABC\\app\\tutorial\\tut\\tut01.htm"][0].apply(exports,arguments)
},{}],"D:\\TimTech\\WebABC\\app\\tutorial\\tut\\tut01.htm":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"section",
      a:{ "class":"tutorial",
        id:"tut01" },
      f:[ { t:7,
          e:"h1",
          f:[ "Tutorial 1" ] } ] } ] }
},{}],"D:\\TimTech\\WebABC\\app\\tutorial\\tutorial.html":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"section",
      a:{ "class":"page-view",
        id:"view-tutorial" },
      f:[ { t:7,
          e:"div",
          a:{ "class":"header row coloured" },
          t1:"fade",
          f:[ { t:7,
              e:"div",
              a:{ "class":"central-menu" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"app-name" },
                  f:[ { t:7,
                      e:"img",
                      a:{ src:"/images/logo.png",
                        "class":"app-logo",
                        height:"32px" },
                      v:{ click:"navigate_back" } } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"page-title" },
              f:[ { t:7,
                  e:"h1",
                  f:[ "Tutorial" ] } ] },
            " ",
            { t:8,
              r:"userbox" } ] },
        " ",
        { t:7,
          e:"div",
          a:{ "class":"row editor" },
          f:[ { t:7,
              e:"div",
              a:{ "class":"column quarter right-divide" },
              t1:{ n:"fade",
                a:[ { delay:100 } ] },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"text-area-padding" },
                  f:[ { t:7,
                      e:"ol",
                      f:[ { t:7,
                          e:"li",
                          v:{ click:"goto_p1" },
                          f:[ "Getting started" ] },
                        " ",
                        { t:7,
                          e:"li",
                          v:{ click:"goto_p2" },
                          f:[ "More things" ] } ] } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"column three-quarters",
                id:"task-pane" },
              t1:{ n:"fade",
                a:[ { delay:200 } ] },
              f:[ { t:7,
                  e:"h1",
                  f:[ "Yay Tutorial!" ] } ] } ] } ] } ] }
},{}],"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_view.js":[function(require,module,exports){
"use strict";

var fade = require('./../../engine/scripts/transitions/ractive.transitions.fade'),
    fly = require('./../../engine/scripts/transitions/ractive.transitions.fly'),
    Sortable = require('./../../engine/vendor.js').sortable,
    siz = require('./../../engine/vendor.js').sizzle;


module.exports = function (ractive, context, page, urlcontext, user) {
    var selectedTuneCount = 0;

    var getSelectedTunes = function () {
        return siz(".tunebook-tunes .tune-list-item").map(function (item) {
            return item.attributes.tuneId.value;
        });
    };

    ractive.set("selectedTuneCount", selectedTuneCount);
    ractive.set("tunebookName", "Untitled Tunebook");

    ractive.on({
        new_tune: function (event) {
            page("/editor");
        },
        navigate_back: function (event) {
            page.show("/");
        },
        "save-tunebook": function (event) {
            fetch("/api/tunebook/add", {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: ractive.get("tunebookName"),
                    tunes: getSelectedTunes()
                })
            });

            page.show("/");
        }
    });

    fetch("/api/tunes").then(function (response) {
        return response.json();
    }).then(function (data) {
        ractive.set("publicTuneNames", data);
    })["catch"](function (ex) {
        console.log("parsing failed", ex);
    });

    Sortable.create(siz("#allTunes")[0], {
        group: "omega",
        sort: false,
        animation: 150
    });

    Sortable.create(siz("#selectedTunes")[0], {
        group: "omega",
        animation: 150,
        onAdd: function (evt) {
            selectedTuneCount++;
            ractive.set("selectedTuneCount", selectedTuneCount);
        },
        onRemove: function (evt) {
            selectedTuneCount--;
            ractive.set("selectedTuneCount", selectedTuneCount);
        }
    });
};

},{"./../../engine/scripts/transitions/ractive.transitions.fade":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js","./../../engine/scripts/transitions/ractive.transitions.fly":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js","./../../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_view.html":[function(require,module,exports){
arguments[4]["D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_edit.html"][0].apply(exports,arguments)
},{}],"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_edit.js":[function(require,module,exports){
"use strict";

var fade = require('./../../engine/scripts/transitions/ractive.transitions.fade'),
    fly = require('./../../engine/scripts/transitions/ractive.transitions.fly'),
    Sortable = require('./../../engine/vendor.js').sortable,
    siz = require('./../../engine/vendor.js').sizzle;


module.exports = function (ractive, context, page, urlcontext, user) {
    var selectedTuneCount = 0;

    var getSelectedTunes = function () {
        return siz(".tunebook-tunes .tune-list-item").map(function (item) {
            return item.attributes.tuneId.value;
        });
    };

    ractive.set("selectedTuneCount", selectedTuneCount);
    ractive.set("tunebookName", "Untitled Tunebook");

    ractive.on({
        new_tune: function (event) {
            page("/editor");
        },
        navigate_back: function (event) {
            page.show("/");
        },
        "save-tunebook": function (event) {
            fetch("/api/tunebook/add", {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: ractive.get("tunebookName"),
                    tunes: getSelectedTunes()
                })
            });

            page.show("/");
        }
    });

    fetch("/api/tunes").then(function (response) {
        return response.json();
    }).then(function (data) {
        ractive.set("publicTuneNames", data);
    })["catch"](function (ex) {
        console.log("parsing failed", ex);
    });

    Sortable.create(siz("#allTunes")[0], {
        group: "omega",
        sort: false,
        animation: 150
    });

    Sortable.create(siz("#selectedTunes")[0], {
        group: "omega",
        animation: 150,
        onAdd: function (evt) {
            selectedTuneCount++;
            ractive.set("selectedTuneCount", selectedTuneCount);
        },
        onRemove: function (evt) {
            selectedTuneCount--;
            ractive.set("selectedTuneCount", selectedTuneCount);
        }
    });
};

},{"./../../engine/scripts/transitions/ractive.transitions.fade":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js","./../../engine/scripts/transitions/ractive.transitions.fly":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js","./../../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\app\\tunebook\\tunebook_edit.html":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"section",
      a:{ "class":"page-view",
        id:"view-tunebook" },
      f:[ { t:7,
          e:"div",
          a:{ "class":"header row coloured" },
          t1:"fade",
          f:[ { t:7,
              e:"div",
              a:{ "class":"central-menu" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"app-name" },
                  f:[ { t:7,
                      e:"img",
                      a:{ src:"/images/logo.png",
                        "class":"app-logo",
                        height:"32px" },
                      v:{ click:"navigate_back" } } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"page-title" },
              f:[ { t:7,
                  e:"h1",
                  f:[ "Create Tunebook" ] } ] },
            " ",
            { t:8,
              r:"userbox" } ] },
        " ",
        { t:7,
          e:"div",
          a:{ "class":"row editor" },
          f:[ { t:7,
              e:"div",
              a:{ "class":"column half flex-column" },
              t1:{ n:"fade",
                a:[ { delay:100 } ] },
              f:[ { t:7,
                  e:"div",
                  a:{ id:"search-box" },
                  f:[ { t:7,
                      e:"i",
                      a:{ "class":"fa fa-search" } },
                    " ",
                    { t:7,
                      e:"input",
                      v:{ keyup:"updated_search" },
                      a:{ type:"text",
                        value:[ { t:2,
                            r:"search_filter" } ] } } ] },
                " ",
                { t:7,
                  e:"div",
                  a:{ id:"search-options-box" },
                  f:[  ] },
                " ",
                { t:7,
                  e:"div",
                  a:{ "class":"scrollable flex-column" },
                  f:[ { t:7,
                      e:"ul",
                      a:{ "class":"item-list tune-list",
                        id:"allTunes" },
                      f:[ { t:4,
                          n:52,
                          r:"publicTuneNames",
                          f:[ { t:7,
                              e:"li",
                              a:{ "class":"drag tune-list-item",
                                tuneId:[ { t:2,
                                    r:"_id" } ] },
                              f:[ { t:7,
                                  e:"h3",
                                  f:[ { t:2,
                                      r:"settings.type" },
                                    " - ",
                                    { t:2,
                                      r:"settings.key" },
                                    " - ",
                                    { t:2,
                                      r:"name" } ] },
                                " " ] } ] } ] } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"column half",
                id:"tunebook-editor-pane" },
              t1:{ n:"fade",
                a:[ { delay:200 } ] },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"tunebook-card-full card flex-column" },
                  f:[ { t:7,
                      e:"div",
                      a:{ "class":"tunebook-settings" },
                      f:[ { t:7,
                          e:"input",
                          a:{ "class":"title-box",
                            type:"text",
                            value:[ { t:2,
                                r:"tunebookName" } ] } } ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ "class":"tunebook-tunes flex-column" },
                      f:[ { t:7,
                          e:"ul",
                          a:{ "class":"item-list tune-list",
                            id:"selectedTunes" },
                          f:[  ] } ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ "class":"tunebook-footer" },
                      f:[ { t:7,
                          e:"div",
                          a:{ "class":"footer-stats" },
                          f:[ { t:7,
                              e:"span",
                              f:[ { t:2,
                                  r:"selectedTuneCount" },
                                " tune",
                                { t:4,
                                  n:50,
                                  x:{ r:[ "selectedTuneCount" ],
                                    s:"_0!==1" },
                                  f:[ "s" ] },
                                " added" ] } ] },
                        " ",
                        { t:7,
                          e:"div",
                          a:{ "class":"footer-buttons" },
                          f:[ { t:7,
                              e:"button",
                              v:{ click:"save-tunebook" },
                              f:[ "Save" ] } ] } ] } ] } ] } ] } ] } ] }
},{}],"D:\\TimTech\\WebABC\\app\\partials\\userbox.js":[function(require,module,exports){
"use strict";

var page = require('./../../engine/vendor.js').page;

var loggedIn = false,
    userData = {};

module.exports = {

    name: "userbox",

    view: require("./userbox.html"),

    model: function (ractive) {
        if (loggedIn) {
            ractive.set("loggedIn", true);
            ractive.set("user", userData);
        } else {
            ractive.set("loggedIn", false);


            fetch("/api/user").then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log("CURRENT USER", data);

                ractive.set("loggedIn", true);
                loggedIn = true;

                ractive.set("user", data);
                userData = data;
            })["catch"](function (ex) {
                console.log("parsing failed", ex);
            });
        }

        ractive.on("log_in", function () {
            page("/auth/google");
        });

        ractive.on("goto_account", function () {
            page("/user");
        });
    }
};

},{"./../../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js","./userbox.html":"D:\\TimTech\\WebABC\\app\\partials\\userbox.html"}],"D:\\TimTech\\WebABC\\app\\partials\\userbox.html":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"div",
      a:{ "class":"user-box" },
      f:[ { t:4,
          n:50,
          x:{ r:[ "loggedIn" ],
            s:"_0===false" },
          f:[ { t:7,
              e:"button",
              a:{ "class":"google-button" },
              v:{ click:"log_in" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"left" },
                  f:[ { t:7,
                      e:"i",
                      a:{ "class":"fa fa-google-plus" } } ] },
                { t:7,
                  e:"div",
                  a:{ "class":"right" },
                  f:[ "Sign in with Google+" ] } ] } ] },
        { t:4,
          n:51,
          f:[ { t:7,
              e:"div",
              a:{ "class":"logged-in-user-box" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"left" },
                  f:[ { t:7,
                      e:"span",
                      v:{ click:"goto_account" },
                      f:[ "Hi ",
                        { t:2,
                          r:"user.name" } ] },
                    " ",
                    { t:7,
                      e:"a",
                      a:{ href:"/logout" },
                      f:[ "Log out" ] } ] },
                " ",
                { t:7,
                  e:"div",
                  a:{ "class":"right" },
                  f:[ { t:7,
                      e:"img",
                      v:{ click:"goto_account" },
                      a:{ "class":"user-picture",
                        src:[ { t:2,
                            r:"user.picture" } ] } } ] } ] } ],
          x:{ r:[ "loggedIn" ],
            s:"_0===false" } } ] } ] }
},{}],"D:\\TimTech\\WebABC\\app\\home\\home.js":[function(require,module,exports){
"use strict";

var fade = require('./../../engine/scripts/transitions/ractive.transitions.fade'),
    fly = require('./../../engine/scripts/transitions/ractive.transitions.fly'),
    toastr = require('./../../engine/vendor.js').toastr;


module.exports = function (ractive, context, page, urlcontext, user) {
    window.ractive = ractive;

    ractive.on({
        new_tune: function (event) {
            page("/editor");
        },
        view_tutorial: function (event) {
            page("/tutorial");
        },
        view_new_tunebook: function () {
            page("/tunebook");
        },
        updated_search: function (event, data) {
            console.log("EVENT", event.context.search_filter);

            fetch("/api/tunes?name=" + event.context.search_filter).then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log("DONE", data);
                ractive.set("publicTuneNames", data);
                ractive.update("publicTuneNames");
            })["catch"](function (ex) {
                console.log("parsing failed", ex);
            });
        }
    });

    ractive.on("view_tune", function (event) {
        var tuneId = event.node.attributes["tune-id"].value;
        console.log(tuneId);
        page("/viewer?tuneid=" + tuneId);
    });

    fetch("/api/tunes").then(function (response) {
        return response.json();
    }).then(function (data) {
        ractive.set("publicTuneNames", data);
    })["catch"](function (ex) {
        console.log("parsing failed", ex);
    });


    fetch("/api/tunebooks").then(function (response) {
        return response.json();
    }).then(function (data) {
        ractive.set("myTunebookNames", data);
    })["catch"](function (ex) {
        console.log("parsing failed", ex);
    });

    ractive.set("keynote", ["A", "B", "C", "D", "E", "F", "G"]);
    ractive.set("rhythm", ["Jig", "Reel"]);
};

},{"./../../engine/scripts/transitions/ractive.transitions.fade":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js","./../../engine/scripts/transitions/ractive.transitions.fly":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js","./../../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\app\\home\\home.html":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"section",
      a:{ "class":"page-view",
        id:"view-home" },
      f:[ { t:7,
          e:"div",
          a:{ "class":"header row coloured" },
          t1:"fade",
          f:[ { t:7,
              e:"div",
              a:{ "class":"central-menu" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"app-name" },
                  f:[ { t:7,
                      e:"img",
                      a:{ src:"/images/logo.png",
                        "class":"app-logo",
                        height:"32px" } } ] } ] },
            " ",
            { t:8,
              r:"userbox" } ] },
        " ",
        { t:7,
          e:"div",
          a:{ "class":"row" },
          f:[ { t:7,
              e:"div",
              a:{ "class":"column quarter right-divide" },
              t1:{ n:"fade",
                a:[ { delay:100 } ] },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"tile-button-container" },
                  f:[ { t:7,
                      e:"h3",
                      f:[ "Welcome to 4|Bar" ] },
                    " ",
                    { t:7,
                      e:"p",
                      f:[ "Choose a tune from the right or one of the options below!" ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ "class":"tile-button" },
                      v:{ click:"new_tune" },
                      f:[ { t:7,
                          e:"h4",
                          f:[ "+ New Tune" ] } ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ "class":"tile-button" },
                      v:{ click:"view_tutorial" },
                      f:[ { t:7,
                          e:"h4",
                          f:[ { t:7,
                              e:"i",
                              a:{ "class":"fa fa-book" } },
                            " Tutorial" ] } ] } ] },
                " ",
                { t:7,
                  e:"div",
                  a:{ "class":"text-area-padding" },
                  f:[ { t:7,
                      e:"h3",
                      f:[ "My Tunes" ] },
                    " ",
                    { t:4,
                      n:50,
                      x:{ r:[ "loggedIn" ],
                        s:"!_0" },
                      f:[ { t:7,
                          e:"p",
                          f:[ "Login to use these features!" ] } ] },
                    { t:4,
                      n:51,
                      f:[ { t:4,
                          n:52,
                          r:"myTunebookNames",
                          f:[ { t:7,
                              e:"div",
                              a:{ "class":"tile-button" },
                              f:[ { t:7,
                                  e:"h4",
                                  f:[ { t:2,
                                      r:"name" } ] } ] } ] },
                        " ",
                        { t:7,
                          e:"div",
                          a:{ "class":"tile-button" },
                          v:{ click:"view_new_tunebook" },
                          f:[ { t:7,
                              e:"h4",
                              f:[ { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-plus" } },
                                " New Tunebook" ] } ] } ],
                      x:{ r:[ "loggedIn" ],
                        s:"!_0" } } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"column three-quarters",
                id:"task-pane" },
              t1:{ n:"fade",
                a:[ { delay:200 } ] },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"text-area-padding scroll-list" },
                  f:[ { t:7,
                      e:"h3",
                      f:[ "Public Tunes" ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ id:"search-box" },
                      f:[ { t:7,
                          e:"i",
                          a:{ "class":"fa fa-search" } },
                        " ",
                        { t:7,
                          e:"input",
                          v:{ keyup:"updated_search" },
                          a:{ type:"text",
                            value:[ { t:2,
                                r:"search_filter" } ] } } ] },
                    " ",
                    { t:7,
                      e:"div",
                      a:{ "class":"search-options-bar" },
                      f:[ { t:7,
                          e:"div",
                          a:{ "class":"search-option" },
                          f:[ { t:7,
                              e:"label",
                              f:[ "Key" ] },
                            " ",
                            { t:7,
                              e:"select",
                              f:[ { t:7,
                                  e:"option",
                                  f:[ "All" ] },
                                " ",
                                { t:4,
                                  n:52,
                                  r:"keynote",
                                  f:[ { t:7,
                                      e:"option",
                                      f:[ { t:2,
                                          r:"." } ] } ] } ] } ] },
                        " ",
                        { t:7,
                          e:"div",
                          a:{ "class":"search-option" },
                          f:[ { t:7,
                              e:"label",
                              f:[ "Rhythm" ] },
                            " ",
                            { t:7,
                              e:"select",
                              f:[ { t:7,
                                  e:"option",
                                  f:[ "All" ] },
                                " ",
                                { t:4,
                                  n:52,
                                  r:"rhythm",
                                  f:[ { t:7,
                                      e:"option",
                                      f:[ { t:2,
                                          r:"." } ] } ] } ] } ] },
                        " ",
                        { t:7,
                          e:"div",
                          a:{ "class":"search-option" },
                          f:[ { t:7,
                              e:"label",
                              f:[ "Type" ] },
                            " ",
                            { t:7,
                              e:"select",
                              f:[ { t:7,
                                  e:"option",
                                  f:[ "All" ] } ] } ] },
                        " ",
                        { t:7,
                          e:"div",
                          a:{ "class":"search-option" },
                          f:[ { t:7,
                              e:"label",
                              f:[ "Time Signature" ] },
                            " ",
                            { t:7,
                              e:"select",
                              f:[ { t:7,
                                  e:"option",
                                  f:[ "All" ] } ] } ] } ] },
                    " ",
                    { t:7,
                      e:"ul",
                      a:{ "class":"item-list" },
                      f:[ { t:4,
                          n:52,
                          r:"publicTuneNames",
                          f:[ { t:7,
                              e:"li",
                              v:{ click:"view_tune" },
                              a:{ "tune-id":[ { t:2,
                                    r:"_id" } ] },
                              f:[ { t:2,
                                  r:"name" },
                                { t:7,
                                  e:"br" },
                                { t:7,
                                  e:"small",
                                  f:[ { t:2,
                                      r:"metadata.createdOn" },
                                    " - ",
                                    { t:2,
                                      r:"settings.type" },
                                    " - ",
                                    { t:2,
                                      r:"settings.key" } ] } ] } ] } ] } ] } ] } ] } ] } ] }
},{}],"D:\\TimTech\\WebABC\\app\\editor\\editor.js":[function(require,module,exports){
"use strict";

var _ = require('./../../engine/vendor.js').lodash,
    engine = require('./../../engine/engine'),
    ABCParser = engine.parser,
    diff = engine.diff,
    dispatcher = engine.dispatcher,
    ABCLayout = engine.layout,
    ABCRenderer = engine.render,
    AudioRenderer = engine.audioRender,
    AudioEngine = engine.audio,
    enums = require('./../../engine/types'),
    CodeMirrorABCMode = require('./../../engine/abc_mode'),
    CodeMirror = require('./../../engine/vendor.js').codeMirror,
    CodeMirrorLint = require('./../../engine/vendor.js').codeMirrorLint,
    siz = require('./../../engine/vendor.js').sizzle,
    queryString = require('./../../engine/vendor.js').queryString,
    FileSaver = require('./../../engine/vendor.js').filesaver,
    toastr = require('./../../engine/vendor.js').toastr,
    Combokeys = require('./../../engine/vendor.js').combokeys,
    Divvy = require('./../../engine/scripts/divvy/divvy.js');

require('./../../engine/scripts/transitions/ractive.transitions.fade');
require('./../../engine/scripts/transitions/ractive.transitions.fly');

var emptyTuneName = "Untitled Tune";

var textFile = null,
    makeTextFile = function (text) {
    var data = new Blob([text], {
        type: "text/plain"
    });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
};

module.exports = function (ractive, context, page, urlcontext, user) {
    var parser = ABCParser(),
        layout = ABCLayout(),
        renderer = ABCRenderer();

    var transposeAmount = 0;

    var errors = [];
    var processedTune = null;

    var parameters = queryString.parse(urlcontext.querystring);

    ractive.set("errors", errors);

    ractive.set("showingTranspositionDropdown", false);
    ractive.set("selectedTransposition", "No Transposition");

    /*var divvy = new Divvy({
         el: document.getElementById("editor-section"), // this is a reference to the container DOM element
         columns: [     // or you can have rows instead
             'left',
             'right'
         ]
     });*/

    var editor = CodeMirror.fromTextArea(document.getElementById("abc"), {
        lineNumbers: true,
        mode: "abc",
        gutters: ["error-markers"] });

    editor.setSize("100%", "100%");

    editor.on("change", function (instance, changeObj) {
        var endPos = CodeMirror.changeEnd(changeObj);

        console.log("CHANGED", changeObj);
        console.log("CHANGED", endPos);

        var linesRemoved = changeObj.removed.length,
            linesAdded = changeObj.text.length;

        var deletions = {
            startId: changeObj.from.line,
            count: linesRemoved,
            action: "DEL",
            lines: []
        };

        for (var i = 0; i < linesRemoved; i++) {
            deletions.lines[i] = new AbcLine("", changeObj.from.line + i);
        }

        var count = endPos.line - changeObj.from.line + 1;

        var additions = {
            startId: changeObj.from.line,
            count: linesAdded,
            lines: [],
            action: "ADD"
        };

        for (var i = 0; i < count; i++) {
            additions.lines[i] = new AbcLine(instance.getLine(additions.startId + i), changeObj.from.line + i);
        }

        console.log("CHANGE    ADDED: ", additions, "  REMOVED: ", deletions);

        var diffed = [deletions, additions];

        rerenderScore(diffed);
        ractive.set("inputValue", instance.getValue());
    });

    editor.on("cursorActivity", function (instance) {
        dispatcher.send("selection-changed", {
            start: instance.getCursor(true).line,
            stop: instance.getCursor(false).line
        });
    });

    dispatcher.on({
        abc_error: function (data) {
            data.markers = [];


            data.markers.push(editor.markText({ line: data.line, ch: data.char - 1 }, { line: data.line, ch: data.char }, { className: "styled-background" }));
            data.markers.push(editor.markText({ line: data.line, ch: data.char }, { line: data.line, ch: editor.getLine(data.line).length }, { className: "error-not-drawn" }));

            editor.setGutterMarker(data.line, "error-markers", document.createRange().createContextualFragment("<i class=\"fa fa-times-circle\" style=\"color:red;padding-left: 4px;\"></i>"));

            errors.push(data);

            //ractive.update( 'errors' );
            ractive.set("errors", errors);
        },
        remove_abc_error: function (data) {
            errors = errors.filter(function (c) {
                return c.type !== data;
            });
            ractive.set("errors", errors);
        }
    });

    console.log("CTX", parameters);

    var dialog = document.getElementById("window");

    ractive.set("title", emptyTuneName);

    //incorporates an elements index into its object
    function addIndexToObject(element, index) {
        return {
            raw: element,
            i: index
        };
    }

    function rerenderScore(diffed) {
        diffed.filter(function (c) {
            return c.action === "DEL";
        }).forEach(function (item) {
            errors = errors.filter(function (err) {
                if (err.line < item.startId || err.line >= item.startId + item.count) {
                    return true;
                }
                if (err.markers) err.markers.forEach(function (marker) {
                    return marker.clear();
                });
                editor.setGutterMarker(err.line, "error-markers", null);
                return false;
            });
        });

        //ractive.update( 'errors' );
        ractive.set("errors", errors);

        var done = diffed.map(parser).reduce(layout, 0);


        renderer(done);

        processedTune = done;

        console.log("done", done);
    }

    function completelyRerenderScore() {
        siz("#canvas")[0].innerHTML = "";
        errors = [];
        ractive.set("errors", errors);

        parser = ABCParser(transposeAmount);
        layout = ABCLayout();
        renderer = ABCRenderer();

        var done = diff({
            newValue: ractive.get("inputValue"),
            oldValue: ""
        }).map(parser).reduce(layout, 0);

        renderer(done);

        processedTune = done;
        console.log("done", done);
    }

    dispatcher.after("transpose_change", completelyRerenderScore);

    var oldStart = -1,
        oldStop = -1;

    //handle events
    ractive.on({
        navigate_back: function (event) {
            window.history.back();
        },
        share_url_modal_close: function () {
            dialog.close();
        },
        "silly-save": function () {
            dispatcher.send("save_tune");
        },
        "show-transposition-menu": function () {
            ractive.set("showingTranspositionDropdown", !ractive.get("showingTranspositionDropdown"));
        },
        selectTransposition: function (event) {
            console.log("EVT", event);
            var intValue = parseInt(event.node.attributes.val.value);
            transposeAmount = intValue;
            dispatcher.send("transpose_change", intValue);

            ractive.set("selectedTransposition", event.node.innerText);
            ractive.set("showingTranspositionDropdown", false);
        },
        "toggle-play-tune": function () {
            AudioEngine.play(AudioRenderer(processedTune));
        }
    });

    dispatcher.on({
        download_abc: function () {
            var blob = new Blob([ractive.get("inputValue")], {
                type: "text/plain;charset=utf-8"
            });
            FileSaver(blob, ractive.get("title") + ".abc");
        },
        change_tune_title: function (data) {
            ractive.set("title", data);
        },
        show_share_dialog: function () {
            ractive.set("quick_url", "localhost:3000/editor?tune=" + encodeURIComponent(ractive.get("inputValue")));
            dialog.show();
        },
        save_tune: function () {
            $.ajax({
                type: "POST",
                url: "/api/tunes/add",
                data: {
                    tune: ractive.get("inputValue")
                }
            }).then(function () {
                toastr.success("Tune saved", "Success!");
            });
        }
    });

    if (parameters.tuneid) {
        fetch("/api/tune/" + parameters.tuneid).then(function (response) {
            return response.json();
        }).then(function (res) {
            editor.setValue(res.raw);
        })["catch"](function (ex) {
            console.log("parsing failed", ex);
        });
    }

    if (parameters.tune) {
        editor.setValue(parameters.tune);
    }

    if (parameters.transpose) {
        dispatcher.send("transpose_change", parseInt(parameters.transpose));
    }

    var combokeys = new Combokeys(document.getElementById("view-editor"));

    combokeys.bind("ctrl+s", function () {
        dispatcher.send("save_tune");
        return false;
    });

    editor.setValue("X: 1\nT: " + emptyTuneName);
};

},{"./../../engine/abc_mode":"D:\\TimTech\\WebABC\\engine\\abc_mode.js","./../../engine/engine":"D:\\TimTech\\WebABC\\engine\\engine.js","./../../engine/scripts/divvy/divvy.js":"D:\\TimTech\\WebABC\\engine\\scripts\\divvy\\divvy.js","./../../engine/scripts/transitions/ractive.transitions.fade":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js","./../../engine/scripts/transitions/ractive.transitions.fly":"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js","./../../engine/types":"D:\\TimTech\\WebABC\\engine\\types.js","./../../engine/vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fly.js":[function(require,module,exports){
"use strict";

/*

	ractive-transitions-fly
	=======================

	Version 0.1.3.

	This transition uses CSS transforms to 'fly' elements to their
	natural location on the page, fading in from transparent as they go.
	By default, they will fly in from left.

	==========================

	Troubleshooting: If you're using a module system in your app (AMD or
	something more nodey) then you may need to change the paths below,
	where it says `require( 'ractive' )` or `define([ 'ractive' ]...)`.

	==========================

	Usage: Include this file on your page below Ractive, e.g:

	    <script src='lib/ractive.js'></script>
	    <script src='lib/ractive-transitions-fly.js'></script>

	Or, if you're using a module loader, require this module:

	    // requiring the plugin will 'activate' it - no need to use
	    // the return value
	    require( 'ractive-transitions-fly' );

	You can adjust the following parameters: `x`, `y`, `duration`,
	`delay` and `easing`.

*/

(function (global, factory) {
	"use strict";

	// Common JS (i.e. browserify) environment
	if (typeof module !== "undefined" && module.exports && typeof require === "function") {
		factory(require('./../../vendor.js').Ractive);
	}

	// AMD?
	else if (typeof define === "function" && define.amd) {
		define(["ractive"], factory);
	}

	// browser global
	else if (global.Ractive) {
		factory(global.Ractive);
	} else {
		throw new Error("Could not find Ractive! It must be loaded before the ractive-transitions-fly plugin");
	}
})(typeof window !== "undefined" ? window : undefined, function (Ractive) {
	"use strict";

	var fly, addPx, defaults;

	defaults = {
		duration: 400,
		easing: "easeOut",
		opacity: 0,
		x: -500,
		y: 0
	};

	addPx = function (num) {
		if (num === 0 || typeof num === "string") {
			return num;
		}

		return num + "px";
	};

	fly = function (t, params) {
		var x, y, offscreen, target;

		params = t.processParams(params, defaults);

		x = addPx(params.x);
		y = addPx(params.y);

		offscreen = {
			transform: "translate(" + x + "," + y + ")",
			opacity: 0
		};

		if (t.isIntro) {
			// animate to the current style
			target = t.getStyle(["opacity", "transform"]);

			// set offscreen style
			t.setStyle(offscreen);
		} else {
			target = offscreen;
		}

		t.animateStyle(target, params).then(t.complete);
	};

	Ractive.transitions.fly = fly;
});

},{"./../../vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\scripts\\transitions\\ractive.transitions.fade.js":[function(require,module,exports){
"use strict";

/*

	ractive-transitions-fade
	========================

	Version 0.1.2.

	This plugin does exactly what it says on the tin - it fades elements
	in and out, using CSS transitions. You can control the following
	properties: `duration`, `delay` and `easing` (which must be a valid
	CSS transition timing function, and defaults to `linear`).

	The `duration` property is in milliseconds, and defaults to 300 (you
	can also use `fast` or `slow` instead of a millisecond value, which
	equate to 200 and 600 respectively). As a shorthand, you can use
	`intro='fade:500'` instead of `intro='fade:{"duration":500}'` - this
	applies to many other transition plugins as well.

	If an element has an opacity other than 1 (whether directly, because
	of an inline style, or indirectly because of a CSS rule), it will be
	respected. You can override the target opacity of an intro fade by
	specifying a `to` property between 0 and 1.

	==========================

	Troubleshooting: If you're using a module system in your app (AMD or
	something more nodey) then you may need to change the paths below,
	where it says `require( 'Ractive' )` or `define([ 'Ractive' ]...)`.

	==========================

	Usage: Include this file on your page below Ractive, e.g:

	    <script src='lib/ractive.js'></script>
	    <script src='lib/ractive-transitions-fade.js'></script>

	Or, if you're using a module loader, require this module:

	    // requiring the plugin will 'activate' it - no need to use
	    // the return value
	    require( 'ractive-transitions-fade' );

	Add a fade transition like so:

	    <div intro='fade'>this will fade in</div>

*/

(function (global, factory) {
	"use strict";

	// Common JS (i.e. browserify) environment
	if (typeof module !== "undefined" && module.exports && typeof require === "function") {
		factory(require('./../../vendor.js').Ractive);
	}

	// AMD?
	else if (typeof define === "function" && define.amd) {
		define(["ractive"], factory);
	}

	// browser global
	else if (global.Ractive) {
		factory(global.Ractive);
	} else {
		throw new Error("Could not find Ractive! It must be loaded before the ractive-transitions-fade plugin");
	}
})(typeof window !== "undefined" ? window : undefined, function (Ractive) {
	"use strict";

	var fade, defaults;

	defaults = {
		delay: 0,
		duration: 300,
		easing: "linear"
	};

	fade = function (t, params) {
		var targetOpacity;

		params = t.processParams(params, defaults);

		if (t.isIntro) {
			targetOpacity = t.getStyle("opacity");
			t.setStyle("opacity", 0);
		} else {
			targetOpacity = 0;
		}

		t.animateStyle("opacity", targetOpacity, params).then(t.complete);
	};

	Ractive.transitions.fade = fade;
});

},{"./../../vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\scripts\\divvy\\divvy.js":[function(require,module,exports){
"use strict";

// Divvy v0.1.7
// Copyright (2013) Rich Harris
// Released under the MIT License

// https://github.com/Rich-Harris/Divvy

;(function (global) {
	"use strict";

	var Divvy;

	(function () {
		"use strict";

		var Block,
		    Control,
		   

		// touch support?
		touch = ("ontouchstart" in document),
		   

		// shims for shit browsers
		indexOf,
		    addClass,
		    removeClass,
		    trim,
		   

		// internal helper functions
		getState,
		    setState,
		    cursor,
		    fire,
		    throttle,
		   

		// a few string constants
		ROW = "row",
		    COLUMN = "column",
		    LEFT = "left",
		    TOP = "top",
		    WIDTH = "width",
		    HEIGHT = "height",
		    VERTICAL = "vertical",
		    HORIZONTAL = "horizontal",
		    CLIENTX = "clientX",
		    CLIENTY = "clientY";



		Divvy = function (options) {
			var self = this,
			    fragment,
			    i,
			    blocks,
			    type,
			    resizeHandler;

			this.el = options.el;
			fragment = document.createDocumentFragment();

			if (options.columns && options.rows) {
				throw new Error("You can't have top level rows and top level columns - one or the other");
			}

			if (options.columns) {
				this.type = ROW;
				blocks = options.columns;
			} else if (options.rows) {
				this.type = COLUMN;
				blocks = options.rows;
			}

			this.blocks = {};
			this.subs = {}; // events

			this.min = options.min || 10;

			this.root = new Block(this, this, fragment, "divvy-0", { children: blocks }, 0, 100, this.type, { top: true, right: true, bottom: true, left: true });
			addClass(this.root.node, "divvy-root");
			this.el.appendChild(fragment);

			if (options.shakeOnResize !== false) {
				resizeHandler = function () {
					self._changedSinceLastResize = {};
					self.shake();
					fire(self, "resize", self._changedSinceLastResize);
				};

				if (window.addEventListener) {
					window.addEventListener("resize", resizeHandler);
				} else if (window.attachEvent) {
					window.attachEvent("onresize", resizeHandler);
				}
			}

			this._changed = {};
			this._changedSinceLastResize = {};
			this.shake();
		};

		Divvy.prototype = {
			shake: function () {
				var bcr = this.el.getBoundingClientRect();

				this.bcr = {
					left: bcr.left,
					right: bcr.right,
					top: bcr.top,
					bottom: bcr.bottom,
					width: bcr.right - bcr.left,
					height: bcr.bottom - bcr.top
				};

				if (this.bcr.width === this.width && this.bcr.height === this.height) {
					return; // nothing to do
				}

				this.width = this.bcr.width;
				this.height = this.bcr.height;

				this.pixelSize = this[this.type === COLUMN ? HEIGHT : WIDTH];

				this.root.shake();

				return this;
			},

			changed: function () {
				var changed = this._changed;
				this._changed = {};

				return changed;
			},

			getState: function () {
				var state = {};

				getState(this.root, state);
				return state;
			},

			setState: function (state) {
				var changed = {},
				    key;

				setState(this, this.root, state, changed);

				// if any of the sizes have changed, fire a resize event...
				for (key in changed) {
					if (changed.hasOwnProperty(key)) {
						fire(this, "resize", changed);

						// ...but only the one
						break;
					}
				}
				return this;
			},

			save: function (id) {
				var key, value;

				if (!localStorage) {
					return;
				}

				key = id ? "divvy_" + id : "divvy";
				value = JSON.stringify(this.getState());

				localStorage.setItem(key, value);

				return this;
			},

			restore: function (id) {
				var key, value;

				if (!localStorage) {
					return;
				}

				key = id ? "divvy_" + id : "divvy";
				value = JSON.parse(localStorage.getItem(key));

				if (value) {
					this.setState(value);
				}

				return this;
			},

			on: function (eventName, callback) {
				var self = this,
				    subs;

				if (!(subs = this.subs[eventName])) {
					this.subs[eventName] = [callback];
				} else {
					subs[subs.length] = callback;
				}

				return {
					cancel: function () {
						self.off(eventName, callback);
					}
				};
			},

			off: function (eventName, callback) {
				var index, subs;

				if (!eventName) {
					// remove all listeners
					this.subs = {};
					return this;
				}

				if (!callback) {
					// remove all listeners of eventName
					delete this.subs[eventName];
					return this;
				}

				if (!(subs = this.subs[eventName])) {
					return this;
				}

				index = subs.indexOf(callback);

				if (index !== -1) {
					subs.splice(index, 1);
					if (!subs.length) {
						delete this.subs[eventName];
					}
				}

				return this;
			}
		};


		// internal helpers
		fire = function (divvy, eventName) {
			var args, subs, i, len;

			subs = divvy.subs[eventName];

			if (!subs) {
				return;
			}

			args = Array.prototype.slice.call(arguments, 2);

			// call is faster if we can use it instead of apply
			if (!args.length) {
				for (i = 0, len = subs.length; i < len; i += 1) {
					subs[i].call(divvy);
				}
				return;
			}

			for (i = 0, len = subs.length; i < len; i += 1) {
				subs[i].apply(divvy, args);
			}
			return divvy;
		};

		getState = function (block, state) {
			var i;

			state[block.id] = [block.start, block.size];

			if (!block.children) {
				return;
			}

			i = block.children.length;
			while (i--) {
				getState(block.children[i], state);
			}
		};

		setState = function (divvy, block, state, changed, noShake) {
			var i, len, child, totalSize, blockState;

			blockState = state[block.id];

			if (!blockState) {
				return; // something went wrong...
			}

			if (block.start !== blockState[0] || block.size !== blockState[1]) {
				divvy._changed[block.id] = changed[block.id] = true;
			}

			block.start = blockState[0];
			block.size = blockState[1];
			block.end = block.start + block.size;

			block.node.style[block.type === COLUMN ? LEFT : TOP] = block.start + "%";
			block.node.style[block.type === COLUMN ? WIDTH : HEIGHT] = block.size + "%";

			if (block.children) {
				totalSize = 0;
				len = block.children.length;

				for (i = 0; i < len; i += 1) {
					child = block.children[i];

					setState(divvy, child, state, changed, true);
					totalSize += child.size;

					if (block.controls[i]) {
						block.controls[i].setPosition(totalSize);
					}
				}

				i = block.children.length;
				while (i--) {
					setState(divvy, block.children[i], state, changed, true);
				}
			}

			//if ( !noShake ) {
			block.shake();
			//}
		};

		cursor = function (divvy, direction) {
			if (!direction) {
				divvy.el.style.cursor = divvy._cursor;
				return;
			}

			divvy._cursor = divvy.el.style.cursor;
			divvy.el.style.cursor = direction + "-resize";
		};


		// internal constructors
		Block = function (divvy, parent, parentNode, id, data, start, size, type, edges) {
			var totalSize, i, total, childData, childSize, node, before, after, childEdges;

			this.start = start;
			this.size = size;
			this.end = this.start + this.size;

			this.type = type;
			this.divvy = divvy;
			this.parent = parent;
			this.edges = edges;

			this.min = data.min || divvy.min;
			this.max = data.max;

			// were we given an existing node?
			if (data.nodeType === 1) {
				// duck typing, blech. But of course IE fucks up if you do data instanceof Element...
				data = { node: data };
			}

			// or an ID string?
			if (typeof data === "string") {
				data = { id: data };
			}

			// ...or an array of children?
			if (Object.prototype.toString.call(data) === "[object Array]") {
				data = { children: data };
			}

			this.id = data.id || id;


			if (data.children && data.children.length) {
				// Branch block
				this.node = document.createElement("div");
				addClass(this.node, "divvy-block");
				addClass(this.node, "divvy-branch");

				this.node.id = this.id;
			} else {
				// Leaf block
				this.node = document.createElement("div");
				addClass(this.node, "divvy-block");
				addClass(this.node, "divvy-leaf");

				// do we have an ID that references an existing node?
				if (!data.node && data.id && (node = document.getElementById(data.id))) {
					data.node = node;
				}

				if (data.node) {
					this.inner = data.node;
				} else {
					this.inner = document.createElement("div");
				}

				addClass(this.inner, "divvy-inner");
				this.node.appendChild(this.inner);

				divvy.blocks[this.id] = this.inner;

				this.inner.id = this.id;
			}

			if (edges.top) {
				addClass(this.node, "divvy-top");
			}
			if (edges.right) {
				addClass(this.node, "divvy-right");
			}
			if (edges.bottom) {
				addClass(this.node, "divvy-bottom");
			}
			if (edges.left) {
				addClass(this.node, "divvy-left");
			}

			this.node.style[type === COLUMN ? LEFT : TOP] = start + "%";
			this.node.style[type === COLUMN ? WIDTH : HEIGHT] = size + "%";

			if (data.children) {
				// find total size of children
				totalSize = 0;

				i = data.children.length;
				while (i--) {
					totalSize += data.children[i].size || 1;
				}

				this.children = [];
				this.controls = [];

				total = 0;
				for (i = 0; i < data.children.length; i += 1) {
					childData = data.children[i];
					childSize = 100 * ((childData.size || 1) / totalSize);

					childEdges = {};
					if (type === COLUMN) {
						childEdges.top = edges.top && i === 0;
						childEdges.bottom = edges.bottom && i === data.children.length - 1;
						childEdges.left = edges.left;
						childEdges.right = edges.right;
					} else {
						childEdges.left = edges.left && i === 0;
						childEdges.right = edges.right && i === data.children.length - 1;
						childEdges.top = edges.top;
						childEdges.bottom = edges.bottom;
					}



					this.children[i] = new Block(divvy, this, this.node, id + i, childData, total, childSize, type === COLUMN ? ROW : COLUMN, childEdges);

					total += childSize;
				}

				for (i = 0; i < data.children.length - 1; i += 1) {
					before = this.children[i];
					after = this.children[i + 1];
					this.controls[i] = new Control(divvy, this, this.node, before, after, type === ROW ? VERTICAL : HORIZONTAL);
				}
			}

			parentNode.appendChild(this.node);
		};

		Block.prototype = {
			setStart: function (start) {
				var previousStart, previousSize, change, size;

				previousStart = this.start;
				previousSize = this.size;

				change = start - previousStart;
				size = previousSize - change;

				this.node.style[this.type === COLUMN ? LEFT : TOP] = start + "%";
				this.node.style[this.type === COLUMN ? WIDTH : HEIGHT] = size + "%";

				this.start = start;
				this.size = size;

				this.shake();
			},

			setEnd: function (end) {
				var previousEnd, previousSize, change, size;

				previousEnd = this.end;
				previousSize = this.size;

				change = end - previousEnd;
				size = previousSize + change;

				//this.node.style[ this.type === COLUMN ? LEFT : TOP ] = start + '%';
				this.node.style[this.type === COLUMN ? WIDTH : HEIGHT] = size + "%";

				this.end = end;
				this.size = size;

				this.shake();
			},

			shake: function () {
				var i, len, a, b, control, size, bcr;

				bcr = this.node.getBoundingClientRect();

				this.bcr = {
					left: bcr.left,
					right: bcr.right,
					top: bcr.top,
					bottom: bcr.bottom,
					width: bcr.right - bcr.left,
					height: bcr.bottom - bcr.top
				};

				if (this.bcr.width === this.width && this.bcr.height === this.height) {
					return; // nothing to do, no need to shake children
				}

				this.width = this.bcr.width;
				this.height = this.bcr.height;
				this.divvy._changed[this.id] = this.divvy._changedSinceLastResize[this.id] = true;

				// if we don't have any children, we don't need to go any further
				if (!this.children) {
					return;
				}

				this.pixelSize = this.bcr[this.type === COLUMN ? HEIGHT : WIDTH];

				// enforce minima and maxima - first go forwards
				len = this.children.length;
				for (i = 0; i < len - 1; i += 1) {
					a = this.children[i];
					b = this.children[i + 1];
					control = this.controls[i];

					size = a.minPc();
					if (a.size < size) {
						a.setEnd(a.start + size);
						b.setStart(a.start + size);
						control.setPosition(a.start + size);
					}

					size = a.maxPc();
					if (a.size > size) {
						a.setEnd(a.start + size);
						b.setStart(a.start + size);
						control.setPosition(a.start + size);
					}
				}

				// then backwards
				for (i = len - 1; i > 0; i -= 1) {
					a = this.children[i - 1];
					b = this.children[i];
					control = this.controls[i - 1];

					size = b.minPc();
					if (b.size < size) {
						a.setEnd(b.end - size);
						b.setStart(b.end - size);
						control.setPosition(b.end - size);
					}

					size = b.maxPc();
					if (b.size > size) {
						a.setEnd(b.end - size);
						b.setStart(b.end - size);
						control.setPosition(b.end - size);
					}
				}

				i = this.children.length;
				while (i--) {
					this.children[i].shake();
				}
			},

			minPc: function () {
				var totalPixels;

				// calculate minimum % width from pixels
				totalPixels = this.parent.pixelSize;
				return this.min / totalPixels * 100;
			},

			maxPc: function () {
				var totalPixels;

				if (!this.max) {
					return 100;
				}

				// calculate minimum % width from pixels
				totalPixels = this.parent.pixelSize;
				return this.max / totalPixels * 100;
			}
		};


		Control = function (divvy, parent, parentNode, before, after, type) {
			var self = this,
			    mousedownHandler;

			this.divvy = divvy;
			this.parent = parent;
			this.before = before;
			this.after = after;
			this.type = type;

			this.parentNode = parentNode;

			this.node = document.createElement("div");
			addClass(this.node, "divvy-" + type + "-control");

			if (touch) {
				addClass(this.node, "divvy-touch-control");
			}

			// initialise position to the start of the next block
			this.setPosition(after.start);

			mousedownHandler = function (event) {
				var start, min, max, afterEnd, move, up, cancel;

				if (event.preventDefault) {
					event.preventDefault();
				}

				// constraints
				min = Math.max(before.start + before.minPc(), after.end - after.maxPc());
				max = Math.min(before.start + before.maxPc(), after.end - after.minPc());

				move = function (event) {
					var position;

					position = self.getPosition(event[type === VERTICAL ? CLIENTX : CLIENTY]);
					position = Math.max(min, Math.min(max, position));

					before.setEnd(position);
					after.setStart(position);

					self.setPosition(position);

					fire(self.divvy, "resize", self.divvy._changedSinceLastResize);
					self.divvy._changedSinceLastResize = {};
				};

				up = function (event) {
					self.setInactive();
					cancel();
				};

				cancel = function () {
					if (document.removeEventListener) {
						document.removeEventListener("mousemove", move);
						document.removeEventListener("mouseup", up);
					} else if (document.detachEvent) {
						document.detachEvent("onmousemove", move);
						document.detachEvent("onmouseup", up);
					}
				};

				if (document.addEventListener) {
					document.addEventListener("mousemove", move);
					document.addEventListener("mouseup", up);
				} else if (document.attachEvent) {
					document.attachEvent("onmousemove", move = throttle(move));
					document.attachEvent("onmouseup", up);
				}
			};

			if (this.node.addEventListener) {
				this.node.addEventListener("mousedown", mousedownHandler);
			} else if (this.node.attachEvent) {
				this.node.attachEvent("onmousedown", mousedownHandler);
			}

			if (touch) {
				this.node.addEventListener("touchstart", function (event) {
					var touch, pos, finger, start, min, max, afterEnd, move, up, cancel;

					if (event.touches.length !== 1) {
						return;
					}

					event.preventDefault();

					touch = event.touches[0];
					finger = touch.identifier;

					self.setActive();

					// constraints
					min = Math.max(before.start + before.minPc(), after.end - after.maxPc());
					max = Math.min(before.start + before.maxPc(), after.end - after.minPc());

					move = function (event) {
						var position, touch;

						if (event.touches.length !== 1 || event.touches[0].identifier !== finger) {
							cancel();
						}

						touch = event.touches[0];

						position = self.getPosition(touch[type === VERTICAL ? CLIENTX : CLIENTY]);
						position = Math.max(min, Math.min(max, position));

						before.setEnd(position);
						after.setStart(position);

						self.setPosition(position);

						fire(self.divvy, "resize", self.divvy._changedSinceLastResize);
						self.divvy._changedSinceLastResize = {};
					};

					up = function (event) {
						self.setInactive();
						cancel();
					};

					cancel = function () {
						window.removeEventListener("touchmove", move);
						window.removeEventListener("touchend", up);
						window.removeEventListener("touchcancel", up);
					};

					window.addEventListener("touchmove", move);
					window.addEventListener("touchend", up);
					window.addEventListener("touchcancel", up);
				});
			}

			parentNode.appendChild(this.node);
		};

		Control.prototype = {
			setActive: function (pos) {
				addClass(this.node, "divvy-active");
				cursor(this.divvy, this.type === VERTICAL ? "ew" : "ns");
			},

			setInactive: function (pos) {
				removeClass(this.node, "divvy-active");
				cursor(this.divvy, false);
			},

			getPosition: function (px) {
				var bcr, bcrStart, bcrSize, position;

				bcr = this.parent.bcr;
				bcrStart = bcr[this.type === VERTICAL ? LEFT : TOP];
				bcrSize = bcr[this.type === VERTICAL ? WIDTH : HEIGHT];

				position = 100 * (px - bcrStart) / bcrSize;

				return position;
			},

			setPosition: function (pos) {
				this.node.style[this.type === VERTICAL ? LEFT : TOP] = pos + "%";
				this.pos = pos;
			}
		};


		// shims
		indexOf = function (needle, haystack) {
			var i, len;

			for (i = 0, len = haystack.length; i < len; i += 1) {
				if (haystack[i] === needle) {
					return needle;
				}
			}

			return -1;
		};

		trim = function (str) {
			return str.replace(/^\s*/, "").replace(/\s*$/, "");
		};

		addClass = function (node, className) {
			if (node.classList && node.classList.add) {
				addClass = function (node, className) {
					node.classList.add(className);
				};
			} else {
				addClass = function (node, className) {
					var classNames, index, i;

					classNames = (node.getAttribute("class") || "").split(" ");

					i = classNames.length;
					while (i--) {
						classNames[i] = trim(classNames[i]);
					}

					if (classNames.indexOf) {
						index = classNames.indexOf(className);
					} else {
						index = indexOf(className, classNames);
					}

					if (index === -1) {
						node.setAttribute("class", classNames.concat(className).join(" "));
					}
				};
			}

			addClass(node, className);
		};

		removeClass = function (node, className) {
			if (node.classList && node.classList.remove) {
				removeClass = function (node, className) {
					node.classList.remove(className);
				};
			} else {
				removeClass = function (node, className) {
					var classNames, index, i;

					classNames = (node.getAttribute("class") || "").split(" ");

					i = classNames.length;
					while (i--) {
						classNames[i] = trim(classNames[i]);
					}

					if (classNames.indexOf) {
						index = classNames.indexOf(className);
					} else {
						index = indexOf(className, classNames);
					}

					if (index !== -1) {
						classNames.splice(index, 1);
						node.setAttribute("class", classNames.join(" "));
					}
				};
			}

			removeClass(node, className);
		};

		throttle = function (fn, wait) {
			var throttled, lastCalled;

			wait = wait || 500;

			throttled = function () {
				var timeNow;

				timeNow = new Date();

				if (!lastCalled || timeNow - lastCalled > wait) {
					return fn.apply(this, arguments);
					lastCalled = timeNow;
				}
			};

			return throttled;
		};
	})();
	// export as AMD
	if (typeof define === "function" && define.amd) {
		define(function () {
			return Divvy;
		});
	}

	// export as CJS
	else if (typeof module !== "undefined" && module.exports) {
		module.exports = Divvy;
	}

	// export as browser global
	else {
		global.Divvy = Divvy;
	}
})(undefined);

},{}],"D:\\TimTech\\WebABC\\engine\\abc_mode.js":[function(require,module,exports){
"use strict";

/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */
var CodeMirror = require('./vendor.js').codeMirror,
    CodeMirrorSimple = require("./scripts/codemirror_simple");

CodeMirror.defineSimpleMode("abc", {
  // The start state contains the rules that are intially used
  start: [
  // The regex matches the token, the token property contains the type
  { regex: /\|/, token: "barline" }, { regex: /(X|T|Z|S|R|M|L|K):/, token: "header-indicator", next: "header" }, { regex: /[0-9]+/, token: "note-length" }, { regex: /`/, token: "backtick" }],
  // The multi-line comment state.
  //comment: [
  //  {regex: /.*?\*\//, token: "comment", next: "start"},
  //  {regex: /.*/, token: "comment"}
  //],
  header: [{ regex: /.*/, token: "header-text", next: "start" }],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    //dontIndentStates: ["comment"],
    lineComment: "//"
  }
});
// You can match multiple tokens at once. Note that the captured
// groups must span the whole string in this case
//{regex: /(function)(\s+)([a-z$][\w$]*)/,
//token: ["keyword", null, "variable-2"]},
// Rules are matched in the order in which they appear, so there is
// no ambiguity between this one and the one above
//{regex: /(?:function|var|return|if|for|while|else|do|this)\b/,
// token: "keyword"},
//{regex: /true|false|null|undefined/, token: "atom"},
//{regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
// token: "number"},
//{regex: /\/\/.*/, token: "comment"},
//{regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
// A next property will cause the mode to move to a different state
// {regex: /\/\*/, token: "comment", next: "comment"},
//{regex: /[-+\/*=<>!]+/, token: "operator"},
// indent and dedent properties guide autoindentation
//{regex: /[\{\[\(]/, indent: true},
//{regex: /[\}\]\)]/, dedent: true},
//{regex: /[a-z$][\w$]*/, token: "variable"},
// You can embed other modes with the mode property. This rule
// causes all code between << and >> to be highlighted with the XML
// mode.
//{regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}

},{"./scripts/codemirror_simple":"D:\\TimTech\\WebABC\\engine\\scripts\\codemirror_simple.js","./vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\scripts\\codemirror_simple.js":[function(require,module,exports){
"use strict";

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require('./../vendor.js').codeMirror);else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineSimpleMode = function (name, states) {
    CodeMirror.defineMode(name, function (config) {
      return CodeMirror.simpleMode(config, states);
    });
  };

  CodeMirror.simpleMode = function (config, states) {
    ensureState(states, "start");
    var states_ = {},
        meta = states.meta || {},
        hasIndentation = false;
    for (var state in states) if (state != meta && states.hasOwnProperty(state)) {
      var list = states_[state] = [],
          orig = states[state];
      for (var i = 0; i < orig.length; i++) {
        var data = orig[i];
        list.push(new Rule(data, states));
        if (data.indent || data.dedent) hasIndentation = true;
      }
    }
    var mode = {
      startState: function () {
        return { state: "start", pending: null,
          local: null, localState: null,
          indent: hasIndentation ? [] : null };
      },
      copyState: function (state) {
        var s = { state: state.state, pending: state.pending,
          local: state.local, localState: null,
          indent: state.indent && state.indent.slice(0) };
        if (state.localState) s.localState = CodeMirror.copyState(state.local.mode, state.localState);
        if (state.stack) s.stack = state.stack.slice(0);
        for (var pers = state.persistentStates; pers; pers = pers.next) s.persistentStates = { mode: pers.mode,
          spec: pers.spec,
          state: pers.state == state.localState ? s.localState : CodeMirror.copyState(pers.mode, pers.state),
          next: s.persistentStates };
        return s;
      },
      token: tokenFunction(states_, config),
      innerMode: function (state) {
        return state.local && { mode: state.local.mode, state: state.localState };
      },
      indent: indentFunction(states_, meta)
    };
    if (meta) for (var prop in meta) if (meta.hasOwnProperty(prop)) mode[prop] = meta[prop];
    return mode;
  };

  function ensureState(states, name) {
    if (!states.hasOwnProperty(name)) throw new Error("Undefined state " + name + "in simple mode");
  }

  function toRegex(val, caret) {
    if (!val) return /(?:)/;
    var flags = "";
    if (val instanceof RegExp) {
      if (val.ignoreCase) flags = "i";
      val = val.source;
    } else {
      val = String(val);
    }
    return new RegExp((caret === false ? "" : "^") + "(?:" + val + ")", flags);
  }

  function asToken(val) {
    if (!val) return null;
    if (typeof val == "string") return val.replace(/\./g, " ");
    var result = [];
    for (var i = 0; i < val.length; i++) result.push(val[i] && val[i].replace(/\./g, " "));
    return result;
  }

  function Rule(data, states) {
    if (data.next || data.push) ensureState(states, data.next || data.push);
    this.regex = toRegex(data.regex);
    this.token = asToken(data.token);
    this.data = data;
  }

  function tokenFunction(states, config) {
    return function (stream, state) {
      if (state.pending) {
        var pend = state.pending.shift();
        if (state.pending.length == 0) state.pending = null;
        stream.pos += pend.text.length;
        return pend.token;
      }

      if (state.local) {
        if (state.local.end && stream.match(state.local.end)) {
          var tok = state.local.endToken || null;
          state.local = state.localState = null;
          return tok;
        } else {
          var tok = state.local.mode.token(stream, state.localState),
              m;
          if (state.local.endScan && (m = state.local.endScan.exec(stream.current()))) stream.pos = stream.start + m.index;
          return tok;
        }
      }

      var curState = states[state.state];
      for (var i = 0; i < curState.length; i++) {
        var rule = curState[i];
        var matches = (!rule.data.sol || stream.sol()) && stream.match(rule.regex);
        if (matches) {
          if (rule.data.next) {
            state.state = rule.data.next;
          } else if (rule.data.push) {
            (state.stack || (state.stack = [])).push(state.state);
            state.state = rule.data.push;
          } else if (rule.data.pop && state.stack && state.stack.length) {
            state.state = state.stack.pop();
          }

          if (rule.data.mode) enterLocalMode(config, state, rule.data.mode, rule.token);
          if (rule.data.indent) state.indent.push(stream.indentation() + config.indentUnit);
          if (rule.data.dedent) state.indent.pop();
          if (matches.length > 2) {
            state.pending = [];
            for (var j = 2; j < matches.length; j++) if (matches[j]) state.pending.push({ text: matches[j], token: rule.token[j - 1] });
            stream.backUp(matches[0].length - (matches[1] ? matches[1].length : 0));
            return rule.token[0];
          } else if (rule.token && rule.token.join) {
            return rule.token[0];
          } else {
            return rule.token;
          }
        }
      }
      stream.next();
      return null;
    };
  }

  function cmp(a, b) {
    if (a === b) return true;
    if (!a || typeof a != "object" || !b || typeof b != "object") return false;
    var props = 0;
    for (var prop in a) if (a.hasOwnProperty(prop)) {
      if (!b.hasOwnProperty(prop) || !cmp(a[prop], b[prop])) return false;
      props++;
    }
    for (var prop in b) if (b.hasOwnProperty(prop)) props--;
    return props == 0;
  }

  function enterLocalMode(config, state, spec, token) {
    var pers;
    if (spec.persistent) for (var p = state.persistentStates; p && !pers; p = p.next) if (spec.spec ? cmp(spec.spec, p.spec) : spec.mode == p.mode) pers = p;
    var mode = pers ? pers.mode : spec.mode || CodeMirror.getMode(config, spec.spec);
    var lState = pers ? pers.state : CodeMirror.startState(mode);
    if (spec.persistent && !pers) state.persistentStates = { mode: mode, spec: spec.spec, state: lState, next: state.persistentStates };

    state.localState = lState;
    state.local = { mode: mode,
      end: spec.end && toRegex(spec.end),
      endScan: spec.end && spec.forceEnd !== false && toRegex(spec.end, false),
      endToken: token && token.join ? token[token.length - 1] : token };
  }

  function indexOf(val, arr) {
    for (var i = 0; i < arr.length; i++) if (arr[i] === val) return true;
  }

  function indentFunction(states, meta) {
    return function (state, textAfter, line) {
      if (state.local && state.local.mode.indent) return state.local.mode.indent(state.localState, textAfter, line);
      if (state.indent == null || state.local || meta.dontIndentStates && indexOf(state.state, meta.dontIndentStates) > -1) return CodeMirror.Pass;

      var pos = state.indent.length - 1,
          rules = states[state.state];
      scan: for (;;) {
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i];
          if (rule.data.dedent && rule.data.dedentIfLineStart !== false) {
            var m = rule.regex.exec(textAfter);
            if (m && m[0]) {
              pos--;
              if (rule.next || rule.push) rules = states[rule.next || rule.push];
              textAfter = textAfter.slice(m[0].length);
              continue scan;
            }
          }
        }
        break;
      }
      return pos < 0 ? 0 : state.indent[pos];
    };
  }
});

},{"./../vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\app\\editor\\editor.html":[function(require,module,exports){
var component = module;



component.exports.template = { v:1,
  t:[ { t:7,
      e:"section",
      a:{ "class":"page-view",
        id:"view-editor" },
      f:[ { t:7,
          e:"div",
          a:{ "class":"header row" },
          t1:"fade",
          v:{ mouseup:"app_mouseup" },
          f:[ { t:7,
              e:"div",
              a:{ "class":"back-button" },
              v:{ click:"navigate_back" },
              f:[ { t:7,
                  e:"p",
                  f:[ { t:7,
                      e:"i",
                      a:{ "class":"fa fa-arrow-left" } } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"central-menu" },
              f:[ { t:7,
                  e:"h3",
                  a:{ "class":"tune-title" },
                  f:[ { t:2,
                      r:"title" } ] },
                " ",
                { t:7,
                  e:"br" },
                " ",
                { t:7,
                  e:"div",
                  a:{ id:"menuButtons" } } ] },
            " ",
            { t:8,
              r:"userbox" },
            " ",
            { t:4,
              n:50,
              x:{ r:[ "loggedIn" ],
                s:"!_0" },
              f:[ { t:7,
                  e:"p",
                  f:[ "Your tune cannot be saved unless you are logged in" ] } ] } ] },
        " ",
        { t:7,
          e:"div",
          a:{ "class":"row toolbar" },
          t1:"fade",
          f:[ { t:7,
              e:"div",
              a:{ "class":"toolbar-item" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"dropdown-selected-value" },
                  v:{ click:"show-transposition-menu" },
                  f:[ { t:7,
                      e:"span",
                      a:{ "class":"selected-span" },
                      f:[ { t:2,
                          r:"selectedTransposition" } ] },
                    { t:7,
                      e:"span",
                      a:{ "class":"arrow-span" },
                      f:[ { t:7,
                          e:"i",
                          a:{ "class":"fa fa-arrow-down" } } ] } ] },
                " ",
                { t:4,
                  n:50,
                  r:"showingTranspositionDropdown",
                  f:[ { t:7,
                      e:"table",
                      a:{ "class":"table-to-dropdown" },
                      f:[ { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"-7" },
                              v:{ click:"selectTransposition" },
                              f:[ "-7 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"-6" },
                              v:{ click:"selectTransposition" },
                              f:[ "-6 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" },
                              f:[ { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-minus" } },
                                " ",
                                { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-minus" } } ] },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"-5" },
                              v:{ click:"selectTransposition" },
                              f:[ "-5 Semitone" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"-4" },
                              v:{ click:"selectTransposition" },
                              f:[ "-4 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"-3" },
                              v:{ click:"selectTransposition" },
                              f:[ "-3 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" },
                              f:[ { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-minus" } } ] },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"-2" },
                              v:{ click:"selectTransposition" },
                              f:[ "-2 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"-1" },
                              v:{ click:"selectTransposition" },
                              f:[ "-1 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" },
                              f:[ { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-circle" } } ] },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"0" },
                              v:{ click:"selectTransposition" },
                              f:[ "No Tranposition" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"1" },
                              v:{ click:"selectTransposition" },
                              f:[ "+1 Semitone" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" },
                              f:[ { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-plus" } } ] },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"2" },
                              v:{ click:"selectTransposition" },
                              f:[ "+2 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"3" },
                              v:{ click:"selectTransposition" },
                              f:[ "+3 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"4" },
                              v:{ click:"selectTransposition" },
                              f:[ "+4 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" },
                              f:[ { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-plus" } },
                                " ",
                                { t:7,
                                  e:"i",
                                  a:{ "class":"fa fa-plus" } } ] },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"5" },
                              v:{ click:"selectTransposition" },
                              f:[ "+5 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"6" },
                              v:{ click:"selectTransposition" },
                              f:[ "+6 Semitones" ] } ] },
                        " ",
                        { t:7,
                          e:"tr",
                          f:[ { t:7,
                              e:"td",
                              a:{ "class":"dropdown-icon" } },
                            { t:7,
                              e:"td",
                              a:{ "class":"dropdown-option",
                                val:"7" },
                              v:{ click:"selectTransposition" },
                              f:[ "+7 Semitones" ] } ] } ] } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"toolbar-item" },
              f:[ { t:7,
                  e:"i",
                  v:{ click:"toggle-play-tune" },
                  a:{ "class":"fa fa-play",
                    style:"cursor: pointer" } } ] } ] },
        " ",
        { t:7,
          e:"div",
          a:{ "class":"row editor",
            id:"editor-section" },
          t1:"fade",
          f:[ { t:7,
              e:"dialog",
              a:{ id:"window" },
              f:[ { t:7,
                  e:"h3",
                  f:[ "URL" ] },
                " ",
                { t:7,
                  e:"p",
                  a:{ style:"width: 480px;word-break: break-all;" },
                  f:[ { t:2,
                      r:"quick_url" } ] },
                " ",
                { t:7,
                  e:"button",
                  v:{ click:"share_url_modal_close" },
                  f:[ "Done" ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"column",
                id:"abc-container" },
              f:[ { t:7,
                  e:"div",
                  a:{ "class":"abc-editor" },
                  f:[ { t:7,
                      e:"textarea",
                      a:{ id:"abc" } } ] },
                " ",
                { t:7,
                  e:"div",
                  a:{ "class":"abc-log" },
                  f:[ { t:4,
                      n:50,
                      x:{ r:[ "errors.length" ],
                        s:"_0>0" },
                      f:[ { t:7,
                          e:"table",
                          f:[ { t:7,
                              e:"thead",
                              f:[ { t:7,
                                  e:"th" },
                                " ",
                                { t:7,
                                  e:"th",
                                  f:[ "Line" ] },
                                " ",
                                { t:7,
                                  e:"th",
                                  f:[ "Message" ] } ] },
                            " ",
                            { t:7,
                              e:"tbody",
                              f:[ { t:4,
                                  n:52,
                                  r:"errors",
                                  f:[ { t:7,
                                      e:"tr",
                                      f:[ { t:7,
                                          e:"td",
                                          a:{ "class":"centered-column" },
                                          f:[ { t:4,
                                              n:50,
                                              x:{ r:[ "severity" ],
                                                s:"_0===1" },
                                              f:[ { t:7,
                                                  e:"i",
                                                  a:{ "class":"fa fa-times-circle",
                                                    style:"color:red" } } ] },
                                            { t:4,
                                              n:51,
                                              f:[ { t:7,
                                                  e:"i",
                                                  a:{ "class":"fa fa-exclamation-triangle",
                                                    style:"color:orange" } } ],
                                              x:{ r:[ "severity" ],
                                                s:"_0===1" } } ] },
                                        " ",
                                        { t:7,
                                          e:"td",
                                          a:{ "class":"centered-column" },
                                          f:[ { t:2,
                                              x:{ r:[ "line" ],
                                                s:"_0+1" } } ] },
                                        " ",
                                        { t:7,
                                          e:"td",
                                          f:[ { t:2,
                                              r:"message" } ] } ] } ] } ] } ] } ] },
                    { t:4,
                      n:51,
                      f:[ { t:7,
                          e:"p",
                          a:{ "class":"all-is-well-box" },
                          f:[ "No errors detected :D" ] } ],
                      x:{ r:[ "errors.length" ],
                        s:"_0>0" } } ] } ] },
            " ",
            { t:7,
              e:"div",
              a:{ "class":"column",
                id:"canvas" },
              f:[  ] } ] } ] } ] }
},{}]},{},["./app/app.js"]);
