var inBrowser = typeof window !== 'undefined';

module.exports = {
    "/": {
        name: "HomePage",
        model: inBrowser ? require('./home/home') : null
    },
    "/editor": {
        name: "EditorPage",
        model: inBrowser ? require('./editor/editor') : null
    },
    "/user": {
        name: "UserPage",
        model: inBrowser ? require('./user/user') : null
    },
    "/viewer": {
        name: "ViewerPage",
        model: inBrowser ? require('./viewer/viewer') : null
    },
    "/tutorial": {
        name: "TutorialPage",
        model: inBrowser ? require('./tutorial/tutorial') : null
    },
    "/tunebook": {
        name: "TunebookPage",
        model: inBrowser ? require('./tunebook/tunebook_edit') : null
    },
    "/tunebook/view": {
        name: "TunebookViewerPage",
        model: inBrowser ? require('./tunebook/tunebook_view')  : null
    }
};