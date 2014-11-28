var dispatcher = require('engine/engine').dispatcher;

var dispatcherEvents = {
    "ABC": function() {
        dispatcher.send("download_abc");
    },
    "PDF": function() {
        dispatcher.send("download_pdf");
    },
    "Share": function() {
        dispatcher.send("show_share_dialog");
    },
    "Edit tune": function() {
        dispatcher.send("edit_tune");
    },
    "Fullscreen": function() {
        dispatcher.send("show_fullscreen");
    },
    "Publish" : function() {
        dispatcher.send("publish_tune");
    }
};

var createButtonWithContent = function(content) {
    return new goog.ui.ToolbarButton(goog.dom.htmlToDocumentFragment(content));
};

var createToolbar = function(privateTune) {
    var t1 = new goog.ui.Toolbar();

    t1.addChild(createButtonWithContent('<span><i class="fa fa-pencil-square-o"></i> Edit tune</span>'), true);
    t1.getChildAt(0).setTooltip('This is a tooltip for a button');

    t1.addChild(createButtonWithContent('<span><i class="fa fa-expand"></i> Fullscreen</span>'), true);
    //t1.addChild(new goog.ui.ToolbarSeparator(), true);
    
    var publishTuneButton = createButtonWithContent('<span><i class="fa fa-paper-plane-o"></i> Publish</span>');
    t1.addChild(publishTuneButton, true);

    if(!privateTune) {
        publishTuneButton.setEnabled(false)
    } else {
        dispatcher.on("tune_publish_success", function() {
            publishTuneButton.setEnabled(false);
        });
    }
    
    t1.render(goog.dom.getElement('t1'));

    var EVENTS = goog.object.getValues(goog.ui.Component.EventType);

    function logEvent(e) {
        if(e.type === "action") {
            var name = e.target.getCaption ? e.target.getCaption() : 'Menu';
            console.log('"' + name + '" dispatched: ' + e.type);
            dispatcherEvents[name] !== undefined ? dispatcherEvents[name]() : false;
        }
    }

    goog.events.listen(t1, EVENTS, logEvent);
}

module.exports = function(privateTune) {
    createToolbar(privateTune);
}