var inBrowser = typeof window !== 'undefined';

module.exports = {
    "/": {
        name: "EditorPage",
        model: inBrowser ? require('app/editor/editor') : null
    }
};