var dispatcher = require('engine/engine').dispatcher;

var dispatcherEvents = {
    "ABC": function() {
        dispatcher.send("download_abc");
    },
    "PDF": function() {
        dispatcher.send("download_pdf");
    }
};

var createToolbar = function() {
    var t1 = new goog.ui.Toolbar();
    t1.addChild(new goog.ui.ToolbarButton('Button'), true);
    t1.getChildAt(0).setTooltip('This is a tooltip for a button');
    t1.addChild(new goog.ui.ToolbarButton('AnotherButton'), true);
    t1.addChild(new goog.ui.ToolbarSeparator(), true);
    t1.addChild(new goog.ui.ToolbarButton('Disabled'), true);
    t1.getChildAt(3).setEnabled(false);
    t1.addChild(new goog.ui.ToolbarButton('YetAnotherButton'), true);
    var toggleButton = new goog.ui.ToolbarToggleButton(goog.dom.createDom('div',
        'icon goog-edit-bold'));
    toggleButton.setChecked(true);
    t1.addChild(toggleButton, true);
    var btnLeft = new goog.ui.ToolbarButton('Left');
    btnLeft.setCollapsed(goog.ui.ButtonSide.END);
    t1.addChild(btnLeft, true);
    var btnCenter = new goog.ui.ToolbarButton('Center');
    btnCenter.setCollapsed(goog.ui.ButtonSide.END | goog.ui.ButtonSide.START);
    t1.addChild(btnCenter, true);
    var btnRight = new goog.ui.ToolbarButton('Right');
    btnRight.setCollapsed(goog.ui.ButtonSide.START);
    t1.addChild(btnRight, true);
    t1.render(goog.dom.getElement('t1'));
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

    var EVENTS = goog.object.getValues(goog.ui.Component.EventType);

    goog.events.listen(menu1, EVENTS, logEvent);

    function logEvent(e) {
        if (e.type === "action") {
            var name = e.target.getCaption ? e.target.getCaption() : 'Menu';
            console.log('"' + name + '" dispatched: ' + e.type);
            dispatcherEvents[name] !== undefined ? dispatcherEvents[name]() : false;
        }
    };

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