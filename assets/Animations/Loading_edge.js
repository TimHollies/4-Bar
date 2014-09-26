/**
 * Adobe Edge: symbol definitions
 */
(function($, Edge, compId){
//images folder
var im='images/';

var fonts = {};
var opts = {
    'gAudioPreloadPreference': 'auto',

    'gVideoPreloadPreference': 'auto'
};
var resources = [
];
var symbols = {
"stage": {
    version: "4.0.1",
    minimumCompatibleVersion: "4.0.1",
    build: "4.0.1.365",
    baseState: "Base State",
    scaleToFit: "none",
    centerStage: "none",
    initialState: "Base State",
    gpuAccelerate: false,
    resizeInstances: false,
    content: {
            dom: [
            {
                id: 'WebABC_Title',
                type: 'image',
                rect: ['121px', '204px','308px','81px','auto', 'auto'],
                fill: ["rgba(0,0,0,0)",im+"WebABC%20Title.svg",'0px','0px']
            },
            {
                id: 'WebABC_Stems',
                type: 'image',
                rect: ['215px', '24px','159px','165px','auto', 'auto'],
                fill: ["rgba(0,0,0,0)",im+"WebABC%20Stems.svg",'0px','0px']
            },
            {
                id: 'Ellipse',
                type: 'ellipse',
                rect: ['177px', '170px','45px','34px','auto', 'auto'],
                borderRadius: ["50%", "50%", "50%", "50%"],
                fill: ["rgba(0,0,0,1.00)"],
                stroke: [0,"rgba(0,0,0,1)","none"]
            },
            {
                id: 'EllipseCopy',
                type: 'ellipse',
                rect: ['254px', '151px','45px','34px','auto', 'auto'],
                borderRadius: ["50%", "50%", "50%", "50%"],
                fill: ["rgba(0,0,0,1.00)"],
                stroke: [0,"rgba(0,0,0,1)","none"]
            },
            {
                id: 'EllipseCopy2',
                type: 'ellipse',
                rect: ['329px', '131px','45px','34px','auto', 'auto'],
                borderRadius: ["50%", "50%", "50%", "50%"],
                fill: ["rgba(0,0,0,1.00)"],
                stroke: [0,"rgba(0,0,0,1)","none"]
            },
            {
                id: 'Text',
                type: 'text',
                rect: ['227px', '298px','auto','auto','auto', 'auto'],
                text: "Loading...",
                font: ['Verdana, Geneva, sans-serif', 24, "rgba(0,0,0,1)", "normal", "none", ""]
            }],
            symbolInstances: [

            ]
        },
    states: {
        "Base State": {
            "${_Text}": [
                ["style", "top", '298px'],
                ["style", "font-family", 'Verdana, Geneva, sans-serif'],
                ["style", "left", '227px']
            ],
            "${_Ellipse}": [
                ["style", "top", '170px'],
                ["color", "background-color", 'rgba(0,0,0,1.00)'],
                ["style", "left", '177px'],
                ["style", "width", '45px']
            ],
            "${_Stage}": [
                ["color", "background-color", 'rgba(255,255,255,1)'],
                ["style", "overflow", 'hidden'],
                ["style", "height", '400px'],
                ["style", "width", '550px']
            ],
            "${_WebABC_Stems}": [
                ["style", "left", '215px'],
                ["style", "top", '24px']
            ],
            "${_EllipseCopy}": [
                ["color", "background-color", 'rgba(0,0,0,1)'],
                ["style", "top", '151px'],
                ["style", "left", '254px'],
                ["style", "width", '45px']
            ],
            "${_EllipseCopy2}": [
                ["style", "top", '131px'],
                ["color", "background-color", 'rgba(0,0,0,1)'],
                ["style", "left", '329px'],
                ["style", "width", '45px']
            ],
            "${_WebABC_Title}": [
                ["style", "left", '121px'],
                ["style", "top", '204px']
            ]
        }
    },
    timelines: {
        "Default Timeline": {
            fromState: "Base State",
            toState: "",
            duration: 700,
            autoPlay: true,
            timeline: [
                { id: "eid8", tween: [ "color", "${_EllipseCopy2}", "background-color", 'rgba(255,0,0,1.00)', { animationColorSpace: 'RGB', valueTemplate: undefined, fromValue: 'rgba(0,0,0,1)'}], position: 402, duration: 147 },
                { id: "eid9", tween: [ "color", "${_EllipseCopy2}", "background-color", 'rgba(0,0,0,1.00)', { animationColorSpace: 'RGB', valueTemplate: undefined, fromValue: 'rgba(255,0,0,1)'}], position: 549, duration: 151 },
                { id: "eid5", tween: [ "color", "${_EllipseCopy}", "background-color", 'rgba(255,0,0,1.00)', { animationColorSpace: 'RGB', valueTemplate: undefined, fromValue: 'rgba(0,0,0,1)'}], position: 202, duration: 155 },
                { id: "eid6", tween: [ "color", "${_EllipseCopy}", "background-color", 'rgba(0,0,0,1.00)', { animationColorSpace: 'RGB', valueTemplate: undefined, fromValue: 'rgba(255,0,0,1)'}], position: 357, duration: 145 },
                { id: "eid2", tween: [ "color", "${_Ellipse}", "background-color", 'rgba(255,0,0,1.00)', { animationColorSpace: 'RGB', valueTemplate: undefined, fromValue: 'rgba(0,0,0,1.00)'}], position: 0, duration: 156 },
                { id: "eid3", tween: [ "color", "${_Ellipse}", "background-color", 'rgba(0,0,0,1.00)', { animationColorSpace: 'RGB', valueTemplate: undefined, fromValue: 'rgba(255,0,0,1)'}], position: 156, duration: 146 }            ]
        }
    }
}
};


Edge.registerCompositionDefn(compId, symbols, fonts, resources, opts);

/**
 * Adobe Edge DOM Ready Event Handler
 */
$(window).ready(function() {
     Edge.launchComposition(compId);
});
})(jQuery, AdobeEdge, "EDGE-34139844");
