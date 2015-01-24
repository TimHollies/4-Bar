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
    "Save": function() {
        dispatcher.send("save_tune");
    }, 


    "+7" : () => { dispatcher.send("transpose_change", 7); },
    "+6" : () => { dispatcher.send("transpose_change", 6); },
    "+5" : () => { dispatcher.send("transpose_change", 5); },
    "+4" : () => { dispatcher.send("transpose_change", 4); },
    "+3" : () => { dispatcher.send("transpose_change", 3); },
    "+2" : () => { dispatcher.send("transpose_change", 2); },
    "+1" : () => { dispatcher.send("transpose_change", 1); },

    "No Transposition" : () => { dispatcher.send("transpose_change", 0); },

    "-1" : () => { dispatcher.send("transpose_change", -1); },
    "-2" : () => { dispatcher.send("transpose_change", -2); },
    "-3" : () => { dispatcher.send("transpose_change", -3); },
    "-4" : () => { dispatcher.send("transpose_change", -4); },
    "-5" : () => { dispatcher.send("transpose_change", -5); },
    "-6" : () => { dispatcher.send("transpose_change", -6); },
    "-7" : () => { dispatcher.send("transpose_change", -7); }
};

function logEvent(e) {
    if (e.type === "action") {
        var name = e.target.getCaption ? e.target.getCaption() : 'Menu';
        console.log('"' + name + '" dispatched: ' + e.type);
        dispatcherEvents[name] !== undefined ? dispatcherEvents[name]() : false;
    }
};

var EVENTS = goog.object.getValues(goog.ui.Component.EventType);

var createToolbar = function() {
    var t1 = new goog.ui.Toolbar();

    var button1 = goog.dom.htmlToDocumentFragment('<span><i class="fa fa-save"></i> Save</span>');

    console.log(button1);

    var tbutton1 = new goog.ui.ToolbarButton(button1);
    tbutton1.setTooltip('This is a tooltip for a button');
    t1.addChild(tbutton1, true);

    t1.addChild(new goog.ui.ToolbarButton('AnotherButton'), true);
    t1.addChild(new goog.ui.ToolbarSeparator(), true);
    t1.addChild(new goog.ui.ToolbarButton('Disabled'), true);
    t1.getChildAt(3).setEnabled(false);
    t1.addChild(new goog.ui.ToolbarButton('YetAnotherButton'), true);
    var toggleButton = new goog.ui.ToolbarToggleButton(goog.dom.createDom('div',
        'icon goog-edit-bold'));
    toggleButton.setChecked(true);
    t1.addChild(toggleButton, true);

    var menu1 = new goog.ui.Menu();
    menu1.setId("transposeMenu");

    [
        '+7',
        '+6',
        '+5',
        '+4',
        '+3',
        '+2',
        '+1',
        'No Transposition',
        '-1',
        '-2',
        '-3',
        '-4',
        '-5',
        '-6',
        '-7',
    ].forEach((item)=>{
        menu1.addItem(new goog.ui.MenuItem(item));
    });

    //menu1.addItem(new goog.ui.MenuItem('No Transposition'));
    //menu1.addItem(new goog.ui.MenuItem('Trumpet/Clarinet Bb'));
    //menu1.addItem(new goog.ui.MenuItem('Sax Eb'));

    t1.addChild(new goog.ui.ToolbarSelect("No Transposition", menu1), true);

    t1.render(goog.dom.getElement('t1'));

    goog.events.listen(t1, EVENTS, logEvent);
}

function createMenu() {
    var a = new goog.ui.SubMenu('Download as');
    a.addItem(new goog.ui.MenuItem('ABC'));
    a.addItem(new goog.ui.MenuItem('PDF'));

    var menu1 = new goog.ui.Menu();
    menu1.setId("FileMenu");

    var m1, m2, m3, m4, m5, m6;
    menu1.addItem(m1 = new goog.ui.MenuItem('Share'));
    menu1.addItem(new goog.ui.MenuSeparator());
    menu1.addItem(m2 = new goog.ui.MenuItem('New'));
    menu1.addItem(m3 = new goog.ui.MenuItem('Publish'));

    menu1.addItem(a);

    var menu2 = new goog.ui.Menu();
    menu2.addItem(m1 = new goog.ui.MenuItem('Undo'));
    menu2.addItem(m1 = new goog.ui.MenuItem('Redo'));    

    goog.events.listen(menu1, EVENTS, logEvent);

    var b1 = new goog.ui.MenuButton('File', menu1);
    b1.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
    b1.setId('FileButton');
    b1.render(goog.dom.getElement('menuButtons'));
    b1.setTooltip('File menu demo');

    var b2 = new goog.ui.MenuButton('Edit', menu2);
    b2.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
    b2.setId('FileButton');
    b2.render(goog.dom.getElement('menuButtons'));
    b2.setTooltip('File menu demo');
}

module.exports = function() {
    createToolbar();
    createMenu();
}