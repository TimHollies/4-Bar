var inBrowser = typeof window !== 'undefined';

module.exports = {
    "/": {
        name: "HomePage",
        model: inBrowser ? require('app/home/home') : null
    },
    "/editor": {
        name: "EditorPage",
        model: inBrowser ? require('app/editor/editor') : null
    },
    "/user": {
        name: "UserPage",
        model: inBrowser ? require('app/user/user') : null
    },
    "/viewer": {
        name: "ViewerPage",
        model: inBrowser ? require('app/viewer/viewer') : null
    },
    "/tutorial": {
        name: "TutorialPage",
        model: inBrowser ? require('app/tutorial/tutorial') : null
    },
    "/tunebook": {
        name: "TunebookPage",
        model: inBrowser ? require('app/tunebook/tunebook_edit') : null
    },
    "/tunebook/view": {
        name: "TunebookViewerPage",
        model: inBrowser ? require('app/tunebook/tunebook_view')  : null
    }
};