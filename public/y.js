require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./engine/engine.js":[function(require,module,exports){
"use strict";

module.exports = {
	parser: require("./parser"),
	diff: require("./diff"),
	render: require("./render"),
	layout: require("./layout"),
	dispatcher: require("./dispatcher"),
	audio: require("./audio/audio"),
	audioRender: require("./audio_render")
};

},{"./audio/audio":"D:\\TimTech\\WebABC\\engine\\audio\\audio.js","./audio_render":"D:\\TimTech\\WebABC\\engine\\audio_render.js","./diff":"D:\\TimTech\\WebABC\\engine\\diff.js","./dispatcher":"D:\\TimTech\\WebABC\\engine\\dispatcher.js","./layout":"D:\\TimTech\\WebABC\\engine\\layout.js","./parser":"D:\\TimTech\\WebABC\\engine\\parser.js","./render":"D:\\TimTech\\WebABC\\engine\\render.js"}],"D:\\TimTech\\WebABC\\engine\\render.js":[function(require,module,exports){
"use strict";

var s = require("virtual-dom/virtual-hyperscript/svg"),
    h = require("virtual-dom/h"),
    createElement = require("virtual-dom/create-element"),
    draw = require("./rendering/stave_symbols.js"),
    diff = require("virtual-dom/diff"),
    patch = require("virtual-dom/patch");

var ABCRenderer = function () {
    var previousNodeTree = null,
        settings = null,
        nextLineStartsWithEnding = false;

    var renderLine = function (line, lineIndex) {
        var lineGroup = s("g", {
            transform: "translate(100," + (32 + lineIndex * 96) + ")"
        });

        var leadInGroup = s("g");
        lineGroup.children.push(draw.stave(), leadInGroup);

        var clef = draw.treble_clef();
        var keySig = draw.keysig(settings.key, clef.width, line.id);

        if (keySig === false) return;

        leadInGroup.children.push(clef.node, keySig.node);

        var leadInWidth = clef.width + keySig.width;

        if (lineIndex === 0) {
            var timeSig = draw.timesig(settings.measure.top, settings.measure.bottom, clef.width + keySig.width);
            leadInGroup.children.push(timeSig.node);
            leadInWidth += timeSig.width;
        }

        var symbolsGroup = s("g", { transform: "translate(" + leadInWidth + ",0)" });


        var noteAreaWidth = 800 - leadInWidth;

        for (var i = 0; i < line.symbols.length; i++) {
            if (line.symbols[i].type === "tie") console.log("WAY");
            symbolsGroup.children.push(draw[line.symbols[i].type](line.symbols[i], line.symbols[i].xp * noteAreaWidth, noteAreaWidth));
        }

        for (var i = 0; i < line.endings.length; i++) {
            symbolsGroup.children.push(draw.varientEndings(line.endings[i], noteAreaWidth, false));
        }

        if (nextLineStartsWithEnding) {
            symbolsGroup.children.push(draw.varientEndings({
                name: "",
                start: {
                    xp: 0
                },
                end: line.firstEndingEnder
            }, noteAreaWidth, true));
        }

        nextLineStartsWithEnding = line.endWithEndingBar;

        lineGroup.children.push(symbolsGroup);

        return lineGroup;
    };

    return function (tuneData) {
        settings = tuneData.tuneSettings;

        var doc = s("svg", {
            viewBox: "0 0 1000 800",
            width: "100%" }),
            nextLineStartsWithEnding = false;

        tuneData.scoreLines.map(renderLine).forEach(function (renderedLine) {
            doc.children.push(renderedLine);
        });

        var topDiv = h("div.render-div", [h("div.tune-header", [h("h2", [settings.title]), h("p.abc-tune-rhythm", [settings.rhythm])]), h("div.tune-body", [doc])]);

        if (previousNodeTree === undefined) {
            document.getElementById("canvas").innerHTML = "";
            document.getElementById("canvas").appendChild(createElement(topDiv));
        } else {
            document.getElementById("canvas").innerHTML = "";
            document.getElementById("canvas").appendChild(createElement(topDiv));
            //var patchData = diff(previousNodeTree, topDiv);
            //patch(document.getElementById("canvas").firstChild, patchData);
        }

        previousNodeTree = topDiv;
    };
};



module.exports = ABCRenderer;
//height: "100%"

},{"./rendering/stave_symbols.js":"D:\\TimTech\\WebABC\\engine\\rendering\\stave_symbols.js","virtual-dom/create-element":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\create-element.js","virtual-dom/diff":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\diff.js","virtual-dom/h":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\h.js","virtual-dom/patch":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\patch.js","virtual-dom/virtual-hyperscript/svg":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\svg.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\patch.js":[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\patch.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\patch.js":[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches) {
    return patchRecursive(rootNode, patches)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions) {
        renderOptions = { patch: patchRecursive }
        if (ownerDocument !== document) {
            renderOptions.document = ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\dom-index.js","./patch-op":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\patch-op.js","global/document":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\global\\document.js","x-is-array":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\x-is-array\\index.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\patch-op.js":[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, bIndex) {
    var children = []
    var childNodes = domNode.childNodes
    var len = childNodes.length
    var i
    var reverseIndex = bIndex.reverse

    for (i = 0; i < len; i++) {
        children.push(domNode.childNodes[i])
    }

    var insertOffset = 0
    var move
    var node
    var insertNode
    for (i = 0; i < len; i++) {
        move = bIndex[i]
        if (move !== undefined && move !== i) {
            // the element currently at this index will be moved later so increase the insert offset
            if (reverseIndex[i] > i) {
                insertOffset++
            }

            node = children[move]
            insertNode = childNodes[i + insertOffset] || null
            if (node !== insertNode) {
                domNode.insertBefore(node, insertNode)
            }

            // the moved element came from the front of the array so reduce the insert offset
            if (move < i) {
                insertOffset--
            }
        }

        // element at this index is scheduled to be removed so increase insert offset
        if (i in bIndex.removes) {
            insertOffset++
        }
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        console.log(oldRoot)
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js","../vnode/vpatch.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\vpatch.js","./apply-properties":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\apply-properties.js","./create-element":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\create-element.js","./update-widget":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\update-widget.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\update-widget.js":[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\dom-index.js":[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\h.js":[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\index.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\diff.js":[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vtree\\diff.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vtree\\diff.js":[function(require,module,exports){
var isArray = require("x-is-array")
var isObject = require("is-object")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var isHook = require("../vnode/is-vhook")
var handleThunk = require("../vnode/handle-thunk")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                clearState(a, patch, index)
                apply = patch[index]
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            }
        } else {
            clearState(a, patch, index)
            apply = patch[index]
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            clearState(a, patch, index)
            apply = patch[index]
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }
}

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = reorder(aChildren, b.children)

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (bChildren.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, bChildren.moves))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b);
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true;
        }
    }

    return false;
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {

    var bKeys = keyIndex(bChildren)

    if (!bKeys) {
        return bChildren
    }

    var aKeys = keyIndex(aChildren)

    if (!aKeys) {
        return bChildren
    }

    var bMatch = {}, aMatch = {}

    for (var aKey in bKeys) {
        bMatch[bKeys[aKey]] = aKeys[aKey]
    }

    for (var bKey in aKeys) {
        aMatch[aKeys[bKey]] = bKeys[bKey]
    }

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen
    var shuffle = []
    var freeIndex = 0
    var i = 0
    var moveIndex = 0
    var moves = {}
    var removes = moves.removes = {}
    var reverse = moves.reverse = {}
    var hasMoves = false

    while (freeIndex < len) {
        var move = aMatch[i]
        if (move !== undefined) {
            shuffle[i] = bChildren[move]
            if (move !== moveIndex) {
                moves[move] = moveIndex
                reverse[moveIndex] = move
                hasMoves = true
            }
            moveIndex++
        } else if (i in aMatch) {
            shuffle[i] = undefined
            removes[i] = moveIndex++
            hasMoves = true
        } else {
            while (bMatch[freeIndex] !== undefined) {
                freeIndex++
            }

            if (freeIndex < len) {
                var freeChild = bChildren[freeIndex]
                if (freeChild) {
                    shuffle[i] = freeChild
                    if (freeIndex !== moveIndex) {
                        hasMoves = true
                        moves[freeIndex] = moveIndex
                        reverse[moveIndex] = freeIndex
                    }
                    moveIndex++
                }
                freeIndex++
            }
        }
        i++
    }

    if (hasMoves) {
        shuffle.moves = moves
    }

    return shuffle
}

function keyIndex(children) {
    var i, keys

    for (i = 0; i < children.length; i++) {
        var child = children[i]

        if (child.key !== undefined) {
            keys = keys || {}
            keys[child.key] = i
        }
    }

    return keys
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\handle-thunk.js","../vnode/is-thunk":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-thunk.js","../vnode/is-vhook":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vhook.js","../vnode/is-vnode":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vnode.js","../vnode/is-vtext":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vtext.js","../vnode/is-widget":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js","../vnode/vpatch":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\vpatch.js","is-object":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\is-object\\index.js","x-is-array":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\x-is-array\\index.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\vpatch.js":[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\version.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\x-is-array\\index.js":[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\create-element.js":[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\create-element.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\create-element.js":[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\handle-thunk.js","../vnode/is-vnode.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vnode.js","../vnode/is-vtext.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vtext.js","../vnode/is-widget.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js","./apply-properties":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\apply-properties.js","global/document":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\global\\document.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\handle-thunk.js":[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-thunk.js","./is-vnode":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vnode.js","./is-vtext":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vtext.js","./is-widget":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vdom\\apply-properties.js":[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, props, previous, propName);
        } else if (isHook(propValue)) {
            propValue.hook(node,
                propName,
                previous ? previous[propName] : undefined)
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else if (propValue !== undefined) {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, props, previous, propName) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vhook.js","is-object":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\is-object\\index.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\is-object\\index.js":[function(require,module,exports){
module.exports = isObject

function isObject(x) {
    return typeof x === "object" && x !== null
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\global\\document.js":[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":"D:\\TimTech\\WebABC\\node_modules\\browserify\\node_modules\\browser-resolve\\empty.js"}],"D:\\TimTech\\WebABC\\node_modules\\browserify\\node_modules\\browser-resolve\\empty.js":[function(require,module,exports){

},{}],"D:\\TimTech\\WebABC\\engine\\rendering\\stave_symbols.js":[function(require,module,exports){
"use strict";

var s = require("virtual-dom/virtual-hyperscript/svg");

var drawing_functions = {},
    randomColor = require("randomcolor"),
    glyphs = require("./glyphs"),
    _ = require('./../vendor.js').lodash,
    SVG = require('./../vendor.js').svgjs,
    data_tables = require("../data_tables"),
    dispatcher = require("../dispatcher");

var POS_SWITCH = 6,
    MAX_GRAD = 0.05,
    STEM_LENGTH = 28;

var transpose = 0;
dispatcher.on("transpose_change", function (data) {
    transpose = data;
});

/**
 * Draws a stave of width 'width'
 * @param  {SVG.Group} line  [line group to draw the stave in]
 * @param  {Number} width [width of line]
 * @return {Undefined}
 */

var staveObject = s("path", {
    stroke: "black",
    d: glyphs.stave.d
});

drawing_functions.stave = function () {
    return staveObject;
};

function ledgerLineCount(a) {
    return (Math.abs(a) / 2 >> 0) + 1;
}

function drawLedgerLines(currentNote, offset, colGroup) {
    if (currentNote.truepos < 1) {
        for (var i = 0, tar = ledgerLineCount(currentNote.truepos); i < tar; i++) {
            colGroup.children.push(s("path", {
                stroke: "black",
                d: "M0 0L14 0",
                transform: "translate(-2, " + (32 + 8 * (i + 1)) + ")"
            }));
        }
    }

    if (currentNote.truepos > 11) {
        for (var i = 0, tar = ledgerLineCount(currentNote.truepos - 12); i < tar; i++) {
            colGroup.children.push(s("path", {
                stroke: "black",
                d: "M0 0L14 0",
                //transform: `translate(6, ${0 - (8 * (i + 1))})`
                transform: "translate(-2, " + (0 - 8 * (i + 1)) + ")"
            }));
        }
    }
}

drawing_functions.note = function (currentNote, offset, noteAreaWidth) {
    //return;  

    var colGroup = s("g", {
        transform: "translate(" + offset + ",0)"
    });

    /*
    var color = '#000',
        stem_end = {
            x: 0,
            y: 0
        },
        stem_tail = null,
        stem = null;
      //invalid note length?
    if (data_tables.allowed_note_lengths.indexOf(currentNote.notelength) === -1) {
        console.log("INVALID NOTE LENGTH");
        for (var i = 0; i < data_tables.allowed_note_lengths.length; i++) {
            if (currentNote.notelength > data_tables.allowed_note_lengths[i]) {
                currentNote.notelength = data_tables.allowed_note_lengths[i - 1];
                break;
            }
        }
    }*/

    if (currentNote.chord !== "") {
        colGroup.children.push(s("text", {
            x: 0,
            y: -20,
            fill: "black",
            transform: "scale(0.8, 0.8)"
        }, [currentNote.chord.getText(transpose)]));
    }

    //ledger line
    drawLedgerLines(currentNote, offset, colGroup);

    var downstem = (currentNote.truepos >= POS_SWITCH || currentNote.forceStem === 1) && !(currentNote.forceStem === -1);


    var noteDot, stem, accidental;

    //noteDot = downstem ? s("g", { class: "noteHead", transform: "translate(10,0)"}) : s("g", { class: "noteHead"});
    noteDot = downstem ? s("g", { "class": "noteHead", transform: "translate(0,0)" }) : s("g", { "class": "noteHead" });

    //dotted note?
    if (2 * currentNote.noteLength % 3 === 0) {
        noteDot.children.push(s("ellipse", {
            rx: 2,
            ry: 2,
            cx: 14,
            cy: currentNote.truepos % 2 === 0 ? -4 : 0,
            fill: "black"
        }));
    }

    //double dotted note?
    if (4 * currentNote.noteLength % 7 === 0) {
        noteDot.children.push(s("ellipse", {
            rx: 2,
            ry: 2,
            cx: 14,
            cy: 0,
            fill: "black"
        }));
        noteDot.children.push(s("ellipse", {
            rx: 2,
            ry: 2,
            cx: 18,
            cy: 0,
            fill: "black"
        }));
    }

    var dotType;
    //dot type
    if (currentNote.noteLength < 4) {
        dotType = glyphs["noteheads.quarter"].d;
    } else {
        if (currentNote.noteLength < 8) {
            dotType = glyphs["noteheads.half"].d;
        } else {
            dotType = glyphs["noteheads.whole"].d;
        }
    }

    noteDot.children.push(s("path", {
        d: dotType,
        fill: "black"
    }));


    if (currentNote.noteLength < 8) {
        if (downstem) {
            //basic stem
            stem = s("g", {
                transform: "translate(0, 0)"
            });

            if (!currentNote.beamed) {
                stem.children.push(s("path", {
                    stroke: "black",
                    d: "M0 " + (currentNote.y + 2) + "L0 " + (currentNote.y + 28)
                }));

                if (currentNote.noteLength === 1) {
                    stem.children.push(s("path", {
                        d: glyphs["flags.d8th"].d,
                        fill: "black",
                        transform: "translate(0," + (currentNote.y + 28) + ")"
                    }));
                }
            } else {
                stem.children.push(s("path", {
                    stroke: "black",
                    d: "M0 " + currentNote.y + "L0 " + currentNote.beamOffsetFactor
                }));
            }
        } else {
            stem = s("g", {
                transform: "translate(10, 0)"
            });

            if (!currentNote.beamed) {
                stem.children.push(s("path", {
                    stroke: "black",
                    d: "M0 " + (currentNote.y - 3) + "L0 " + (currentNote.y - 32)
                }));

                if (currentNote.noteLength === 1) {
                    stem.children.push(s("path", {
                        d: glyphs["flags.u8th"].d,
                        fill: "black",
                        transform: "translate(0," + (currentNote.y - 34) + ")"
                    }));
                }
            } else {
                stem.children.push(s("path", {
                    stroke: "black",
                    d: "M0 " + (currentNote.y - 3) + "L0 " + currentNote.beamOffsetFactor
                }));
            }

            /*
            //curly bit for quavers            
            if (currentNote.notelength == 1) {
                stem_tail = noteGroup.path(glyphs["flags.u8th"].d).attr({
                    fill: 'black'
                }).move(0, -24).scale(1);
            }
              //store point
            stem_end.y = -24;*/
        }
    }

    //accidentals

    switch (currentNote.accidental) {
        case "_":
            accidental = s("path", {
                d: glyphs["accidentals.flat"].d,
                fill: "black",
                transform: "translate(-8, 0)"
            });
            break;
        case "^":
            accidental = s("path", {
                d: glyphs["accidentals.sharp"].d,
                fill: "black",
                transform: "translate(-10, 0)"
            });
            break;
        case "=":
            accidental = s("path", {
                d: glyphs["accidentals.nat"].d,
                fill: "black",
                transform: "translate(-7, 0)"
            });
            break;
        case "__":
            accidental = s("path", {
                d: glyphs["accidentals.dblflat"].d,
                fill: "black",
                transform: "translate(-6,-12)"
            });
            break;
        case "^^":
            accidental = s("path", {
                d: glyphs["accidentals.dblsharp"].d,
                fill: "black",
                transform: "translate(-6,-12)"
            });
            break;
        default:
    } /*
       currentNote.stem_end = stem_end;
       noteGroup.stem_tail = stem_tail;
      noteGroup.stem = stem;
      noteGroup.dot = noteDot;
      currentNote.truepos = truepos;
         currentNote.x = totalOffset;
      currentNote.y = 28 - (truepos * 4);
       noteGroup.move(currentNote.x, currentNote.y);*/

    var noteGroup = s("g", {
        transform: "translate(0," + currentNote.y + ")"
    }, [noteDot, accidental]);

    colGroup.children.push(noteGroup, stem);

    if (currentNote.beams.length > 0) {
        for (var i = 0; i < currentNote.beams.length; i++) {
            drawing_functions.beam(currentNote.beams[i], colGroup, noteAreaWidth);
        }
    }

    return colGroup;
};

drawing_functions.barline = function (currentSymbol, offset) {
    var barlineGroup = s("g");

    switch (currentSymbol.subType) {
        case "normal":
            barlineGroup.children.push(s("rect", {
                x: offset,
                width: 1,
                height: 32,
                fill: "black"
            }));
            break;
        case "double":
            var alignment = currentSymbol.align === 2 ? -2 : 0;
            barlineGroup.children.push(s("rect", {
                x: offset - 2 + alignment,
                width: 1,
                height: 32,
                fill: "black"
            }));
            barlineGroup.children.push(s("rect", {
                x: offset + 2 + alignment,
                width: 1,
                height: 32,
                fill: "black"
            }));
            break;

        case "repeat_start":


            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 12,
                fill: "black"
            }));

            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 20,
                fill: "black"
            }));

        case "heavy_start":


            barlineGroup.children.push(s("rect", {
                x: offset - 2,
                width: 4,
                height: 32,
                fill: "black"
            }));
            barlineGroup.children.push(s("rect", {
                x: offset + 6,
                width: 1,
                height: 32,
                fill: "black"
            }));
            break;

        case "repeat_end":


            var alignment = currentSymbol.align === 2 ? -6 : 0;

            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset - 12,
                cy: 12,
                fill: "black"
            }));

            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset - 12,
                cy: 20,
                fill: "black"
            }));

        case "heavy_end":


            var alignment = currentSymbol.align === 2 ? -6 : 0;

            barlineGroup.children.push(s("rect", {
                x: offset + 2 + alignment,
                width: 4,
                height: 32,
                fill: "black"
            }));
            barlineGroup.children.push(s("rect", {
                x: offset - 2 + alignment,
                width: 1,
                height: 32,
                fill: "black"
            }));
            break;

        case "double_repeat":
            barlineGroup.children.push(s("rect", {
                x: offset - 2,
                width: 4,
                height: 32,
                fill: "black"
            }));
            barlineGroup.children.push(s("rect", {
                x: offset + 5,
                width: 1,
                height: 32,
                fill: "black"
            }));
            barlineGroup.children.push(s("rect", {
                x: offset - 6,
                width: 1,
                height: 32,
                fill: "black"
            }));

            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 12,
                fill: "black"
            }));

            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 20,
                fill: "black"
            }));

            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset - 12,
                cy: 12,
                fill: "black"
            }));

            barlineGroup.children.push(s("ellipse", {
                rx: 2,
                ry: 2,
                cx: offset - 12,
                cy: 20,
                fill: "black"
            }));
            break;

        default:
    }

    return barlineGroup;
};

drawing_functions.chord_annotation = function (line, currentSymbol, totalOffset) {};

drawing_functions.tie = function (currentSymbol, ignore, noteAreaWidth) {
    var startX = currentSymbol.start.xp * noteAreaWidth + 4,
        startY = currentSymbol.start.y + 8,
        endX = currentSymbol.end.xp * noteAreaWidth + 4,
        endY = currentSymbol.end.y + 8;

    var path = "M" + startX + " " + startY + "C" + (startX + 4) + " " + (startY + 14) + ", " + (endX - 4) + " " + (endY + 14) + ", " + endX + " " + endY + "C" + (endX + 4) + " " + (endY + 12) + ", " + (startX - 4) + " " + (startY + 12) + ", " + startX + " " + startY;

    return s("path", {
        d: path,
        stroke: "black"
    });
};

drawing_functions.space = _.noop;

/**
 * [beat_rest description]
 * @param  {[type]} line          [description]
 * @param  {[type]} currentSymbol [description]
 * @param  {[type]} totalOffset   [description]
 * @return {[type]}               [description]
 */
drawing_functions.beat_rest = function (line, currentSymbol, totalOffset) {
    return line.path(glyphs["rests.quarter"].d).attr({
        fill: "black"
    }).move(totalOffset, 6);
};

/**
 * [treble_clef description]
 * @param  {[type]} line [description]
 * @return {[type]}      [description]
 */

var trebleClefObject = s("path", {
    fill: "black",
    d: glyphs["clefs.G"].d,
    transform: "translate(8, 24)"
});

drawing_functions.treble_clef = function (line) {
    return {
        node: trebleClefObject,
        width: 40
    };
};

/**
 * [timesig description]
 * @param  {[type]} line   [description]
 * @param  {[type]} top    [description]
 * @param  {[type]} bottom [description]
 * @return {[type]}        [description]
 */
drawing_functions.timesig = function (top, bottom, xoffset) {
    var top_group = s("g"),
        bottom_group = s("g"),
        timeSig = s("g", [top_group, bottom_group]);
    //top

    top.toString().split("").forEach(function (num, i) {
        top_group.children.push(s("path", {
            fill: "black",
            d: glyphs[num].d,
            transform: ["translate(", xoffset + i * 10, ",16)"].join("")
        }));
    });

    bottom.toString().split("").forEach(function (num, i) {
        bottom_group.children.push(s("path", {
            fill: "black",
            d: glyphs[num].d,
            transform: ["translate(", xoffset + i * 10, ",32)"].join("")
        }));
    });
    /*
    var top_width = top_group.bbox().width,
        bottom_width = bottom_group.bbox().width;
      if (top_width > bottom_width) {
        bottom_group.move((top_width - bottom_width) / 2, 0);
    } else {
        top_group.move((bottom_width - top_width) / 2, 0);
    }
    */
    return {
        node: timeSig,
        width: 24
    };
};

function sigmoid(a) {
    return 1 / (Math.exp(0.05 * (14 - a)) + 1) * 96 - 32;
}

/**
 * [beam description]
 * @param  {[type]} line         [description]
 * @param  {[type]} beamed_notes [description]
 * @return {[type]}              [description]
 */
drawing_functions.beam = function (beam, group, noteAreaWidth) {
    var startX = -((beam.notes[beam.count - 1].xp - beam.notes[0].xp) * noteAreaWidth) + (beam.downBeam ? 0 : 10);
    var endY = beam.notes[beam.count - 1].beamOffsetFactor;
    var startY = beam.notes[0].beamOffsetFactor;

    if (beam.downBeam) {
        group.children.push(s("path", {
            //d: `M${startX} ${startY}L10 ${endY}L10 ${endY-4}L${startX} ${startY-4}L${startX} ${startY}Z`
            d: "M" + startX + " " + startY + "L0 " + endY + "L0 " + (endY - 4) + "L" + startX + " " + (startY - 4) + "L" + startX + " " + startY + "Z"
        }));
    } else {
        group.children.push(s("path", {
            d: "M" + startX + " " + startY + "L10 " + endY + "L10 " + (endY + 4) + "L" + startX + " " + (startY + 4) + "L" + startX + " " + startY + "Z"
        }));
    }
};

/**
 * [keysig description]
 * @param  {[type]} draw   [description]
 * @param  {[type]} keysig [description]
 * @return {[type]}        [description]
 */
drawing_functions.keysig = function (keysig, xoffset, lineId) {
    var keySigGroup = s("g");
    var undefined;

    var accidentals = data_tables.getKeySig(keysig.note, keysig.mode) + transpose;


    dispatcher.send("remove_abc_error", "KEYSIG");

    if (_.isNaN(accidentals)) {
        var error = {
            line: lineId,
            message: "Malformed key signature: " + (keysig.note + keysig.mode),
            severity: 1,
            type: "KEYSIG"
        };

        console.log(error);

        dispatcher.send("abc_error", error);

        return false;
    }

    if (accidentals === 0) return {
        node: keySigGroup,
        width: 0
    };

    var dataset = accidentals > 0 ? data_tables.sharps : data_tables.flats;
    var symbol = accidentals > 0 ? glyphs["accidentals.sharp"].d : glyphs["accidentals.flat"].d;

    for (var i = 0; i < Math.abs(accidentals); i++) {
        keySigGroup.children.push(s("path", {
            d: symbol,
            fill: "black",
            transform: "translate(" + (xoffset + i * 8) + ", " + (44 - (dataset[i] + 1) * 4) + ")"
        }));
    }

    return {
        node: keySigGroup,
        width: Math.abs(accidentals) * 10 + 12
    };
};

drawing_functions.varientEndings = function (currentEnding, noteAreaWidth, continuation) {
    var startX = currentEnding.start.xp * noteAreaWidth - 8,
        endX = currentEnding.end === null ? noteAreaWidth : currentEnding.end.xp * noteAreaWidth,
        path = "";
    //path = `M${startX} -25L${startX} -40L${endX} -40L${endX} -25`;

    path = continuation ? "M" + startX + " -40" : "M" + startX + " -25L" + startX + " -40";
    path = path + ("L" + endX + " -40");
    path = currentEnding.end === null ? path : path + ("L" + endX + " -25");

    var endingGroup = s("g");

    endingGroup.children.push(s("path", {
        d: path,
        stroke: "black",
        fill: "none"
    }));

    endingGroup.children.push(s("text", {
        x: startX + 4,
        y: -60,
        fill: "black",
        transform: "scale(0.5, 0.5)"
    }, [currentEnding.name]));

    return endingGroup;
};

drawing_functions.slur = function (currentSymbol, ignore, noteAreaWidth) {
    var startX = currentSymbol.notes[0].xp * noteAreaWidth + 4,
        startY = currentSymbol.notes[0].y + 8,
        endX = currentSymbol.notes[currentSymbol.notes.length - 1].xp * noteAreaWidth + 4,
        endY = currentSymbol.notes[currentSymbol.notes.length - 1].y + 8;

    var path = "M" + startX + " " + startY + "C" + (startX + 4) + " " + (startY + 14) + ", " + (endX - 4) + " " + (endY + 14) + ", " + endX + " " + endY + "C" + (endX + 4) + " " + (endY + 12) + ", " + (startX - 4) + " " + (startY + 12) + ", " + startX + " " + startY;

    return s("path", {
        d: path,
        stroke: "black"
    });
};

var restLengthMap = {
    "0.125": "rests.64th",
    "0.25": "rests.32th",
    "0.5": "rests.16th",
    "1": "rests.8th",
    "2": "rests.quarter",
    "4": "rests.half",
    "8": "rests.whole" };

drawing_functions.rest = function (currentNote, offset, noteAreaWidth) {
    var restLength = currentNote.restLength === undefined ? 1 : currentNote.restLength;

    var colGroup = s("g", {
        transform: "translate(" + offset + ",16)"
    });

    if (!currentNote.visible) return colGroup;

    colGroup.children.push(s("path", {
        d: glyphs[restLengthMap[restLength]].d
    }));

    return colGroup;
};

module.exports = drawing_functions;
/* return line.text(currentSymbol.text).font({
     family: 'Helvetica',
     size: 16,
     anchor: 'middle',
     leading: '1.5em'
 }).move(totalOffset, -30).attr({
     fill: 'black'
 });*/

},{"../data_tables":"D:\\TimTech\\WebABC\\engine\\data_tables.js","../dispatcher":"D:\\TimTech\\WebABC\\engine\\dispatcher.js","./../vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js","./glyphs":"D:\\TimTech\\WebABC\\engine\\rendering\\glyphs.js","randomcolor":"D:\\TimTech\\WebABC\\node_modules\\randomcolor\\randomColor.js","virtual-dom/virtual-hyperscript/svg":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\svg.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\svg.js":[function(require,module,exports){
var h = require("./index.js")

var BLACKLISTED_KEYS = {
    "style": true,
    "namespace": true,
    "key": true
}
var SVG_NAMESPACE = "http://www.w3.org/2000/svg"

module.exports = svg

function svg(tagName, properties, children) {
    if (!children && isChildren(properties)) {
        children = properties
        properties = {}
    }

    properties = properties || {}

    // set namespace for svg
    properties.namespace = SVG_NAMESPACE

    var attributes = properties.attributes || (properties.attributes = {})

    // for each key, if attribute & string, bool or number then
    // convert it into a setAttribute hook
    for (var key in properties) {
        if (!properties.hasOwnProperty(key)) {
            continue
        }

        if (BLACKLISTED_KEYS[key]) {
            continue
        }

        var value = properties[key]
        if (typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            continue
        }

        attributes[key] = value
    }

    return h(tagName, properties, children)
}

function isChildren(x) {
    return typeof x === "string" || Array.isArray(x)
}

},{"./index.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\index.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\index.js":[function(require,module,exports){
var TypedError = require("error/typed")

var VNode = require("../vnode/vnode.js")
var VText = require("../vnode/vtext.js")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isHook = require("../vnode/is-vhook")
var isVThunk = require("../vnode/is-thunk")

var parseTag = require("./parse-tag.js")
var softSetHook = require("./hooks/soft-set-hook.js")
var dataSetHook = require("./hooks/data-set-hook.js")
var evHook = require("./hooks/ev-hook.js")

var UnexpectedVirtualElement = TypedError({
    type: "virtual-hyperscript.unexpected.virtual-element",
    message: "Unexpected virtual child passed to h().\n" +
        "Expected a VNode / Vthunk / VWidget / string but:\n" +
        "got a {foreignObjectStr}.\n" +
        "The parent vnode is {parentVnodeStr}.\n" +
        "Suggested fix: change your `h(..., [ ... ])` callsite.",
    foreignObjectStr: null,
    parentVnodeStr: null,
    foreignObject: null,
    parentVnode: null
})

module.exports = h

function h(tagName, properties, children) {
    var childNodes = []
    var tag, props, key, namespace

    if (!children && isChildren(properties)) {
        children = properties
        props = {}
    }

    props = props || properties || {}
    tag = parseTag(tagName, props)

    // support keys
    if ("key" in props) {
        key = props.key
        props.key = undefined
    }

    // support namespace
    if ("namespace" in props) {
        namespace = props.namespace
        props.namespace = undefined
    }

    // fix cursor bug
    if (tag === "input" &&
        "value" in props &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value)
    }

    var keys = Object.keys(props)
    var propName, value
    for (var j = 0; j < keys.length; j++) {
        propName = keys[j]
        value = props[propName]
        if (isHook(value)) {
            continue
        }

        // add data-foo support
        if (propName.substr(0, 5) === "data-") {
            props[propName] = dataSetHook(value)
        }

        // add ev-foo support
        if (propName.substr(0, 3) === "ev-") {
            props[propName] = evHook(value)
        }
    }

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props)
    }


    var node = new VNode(tag, props, childNodes, key, namespace)

    return node
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === "string") {
        childNodes.push(new VText(c))
    } else if (isChild(c)) {
        childNodes.push(c)
    } else if (Array.isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props)
        }
    } else if (c === null || c === undefined) {
        return
    } else {
        throw UnexpectedVirtualElement({
            foreignObjectStr: JSON.stringify(c),
            foreignObject: c,
            parentVnodeStr: JSON.stringify({
                tagName: tag,
                properties: props
            }),
            parentVnode: {
                tagName: tag,
                properties: props
            }
        })
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x)
}

function isChildren(x) {
    return typeof x === "string" || Array.isArray(x) || isChild(x)
}

},{"../vnode/is-thunk":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-thunk.js","../vnode/is-vhook":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vhook.js","../vnode/is-vnode":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vnode.js","../vnode/is-vtext":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vtext.js","../vnode/is-widget":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js","../vnode/vnode.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\vnode.js","../vnode/vtext.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\vtext.js","./hooks/data-set-hook.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\hooks\\data-set-hook.js","./hooks/ev-hook.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\hooks\\ev-hook.js","./hooks/soft-set-hook.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\hooks\\soft-set-hook.js","./parse-tag.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\parse-tag.js","error/typed":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\typed.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\vtext.js":[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\version.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\vnode.js":[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-thunk.js","./is-vhook":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vhook.js","./is-vnode":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vnode.js","./is-widget":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js","./version":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\version.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-widget.js":[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vtext.js":[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\version.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vnode.js":[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\version.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\version.js":[function(require,module,exports){
module.exports = "1"

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-vhook.js":[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook && typeof hook.hook === "function" &&
        !hook.hasOwnProperty("hook")
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\vnode\\is-thunk.js":[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\parse-tag.js":[function(require,module,exports){
var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/
var notClassId = /^\.|#/

module.exports = parseTag

function parseTag(tag, props) {
    if (!tag) {
        return "div"
    }

    var noId = !("id" in props)

    var tagParts = tag.split(classIdSplit)
    var tagName = null

    if (notClassId.test(tagParts[1])) {
        tagName = "div"
    }

    var classes, part, type, i
    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i]

        if (!part) {
            continue
        }

        type = part.charAt(0)

        if (!tagName) {
            tagName = part
        } else if (type === ".") {
            classes = classes || []
            classes.push(part.substring(1, part.length))
        } else if (type === "#" && noId) {
            props.id = part.substring(1, part.length)
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className)
        }

        props.className = classes.join(" ")
    }

    return tagName ? tagName.toLowerCase() : "div"
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\hooks\\soft-set-hook.js":[function(require,module,exports){
module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\hooks\\ev-hook.js":[function(require,module,exports){
var DataSet = require("data-set")

module.exports = DataSetHook;

function DataSetHook(value) {
    if (!(this instanceof DataSetHook)) {
        return new DataSetHook(value);
    }

    this.value = value;
}

DataSetHook.prototype.hook = function (node, propertyName) {
    var ds = DataSet(node)
    var propName = propertyName.substr(3)

    ds[propName] = this.value;
};

DataSetHook.prototype.unhook = function(node, propertyName) {
    var ds = DataSet(node);
    var propName = propertyName.substr(3);

    ds[propName] = undefined;
}

},{"data-set":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\index.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\virtual-hyperscript\\hooks\\data-set-hook.js":[function(require,module,exports){
var DataSet = require("data-set")

module.exports = DataSetHook;

function DataSetHook(value) {
    if (!(this instanceof DataSetHook)) {
        return new DataSetHook(value);
    }

    this.value = value;
}

DataSetHook.prototype.hook = function (node, propertyName) {
    var ds = DataSet(node)
    var propName = propertyName.substr(5)

    ds[propName] = this.value;
};

},{"data-set":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\index.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\index.js":[function(require,module,exports){
var createStore = require("weakmap-shim/create-store")
var Individual = require("individual")

var createHash = require("./create-hash.js")

var hashStore = Individual("__DATA_SET_WEAKMAP@3", createStore())

module.exports = DataSet

function DataSet(elem) {
    var store = hashStore(elem)

    if (!store.hash) {
        store.hash = createHash(elem)
    }

    return store.hash
}

},{"./create-hash.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\create-hash.js","individual":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\node_modules\\individual\\index.js","weakmap-shim/create-store":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\node_modules\\weakmap-shim\\create-store.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\node_modules\\weakmap-shim\\create-store.js":[function(require,module,exports){
var hiddenStore = require('./hidden-store.js');

module.exports = createStore;

function createStore() {
    var key = {};

    return function (obj) {
        if (typeof obj !== 'object' || obj === null) {
            throw new Error('Weakmap-shim: Key must be object')
        }

        var store = obj.valueOf(key);
        return store && store.identity === key ?
            store : hiddenStore(obj, key);
    };
}

},{"./hidden-store.js":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\node_modules\\weakmap-shim\\hidden-store.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\node_modules\\weakmap-shim\\hidden-store.js":[function(require,module,exports){
module.exports = hiddenStore;

function hiddenStore(obj, key) {
    var store = { identity: key };
    var valueOf = obj.valueOf;

    Object.defineProperty(obj, "valueOf", {
        value: function (value) {
            return value !== key ?
                valueOf.apply(this, arguments) : store;
        },
        writable: true
    });

    return store;
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\node_modules\\individual\\index.js":[function(require,module,exports){
(function (global){
var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual

function Individual(key, value) {
    if (root[key]) {
        return root[key]
    }

    Object.defineProperty(root, key, {
        value: value
        , configurable: true
    })

    return value
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\data-set\\create-hash.js":[function(require,module,exports){
module.exports = createHash

function createHash(elem) {
    var attributes = elem.attributes
    var hash = {}

    if (attributes === null || attributes === undefined) {
        return hash
    }

    for (var i = 0; i < attributes.length; i++) {
        var attr = attributes[i]

        if (attr.name.substr(0,5) !== "data-") {
            continue
        }

        hash[attr.name.substr(5)] = attr.value
    }

    return hash
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\typed.js":[function(require,module,exports){
var camelize = require("camelize")
var template = require("string-template")
var extend = require("xtend/mutable")

module.exports = TypedError

function TypedError(args) {
    if (!args) {
        throw new Error("args is required");
    }
    if (!args.type) {
        throw new Error("args.type is required");
    }
    if (!args.message) {
        throw new Error("args.message is required");
    }

    var message = args.message

    if (args.type && !args.name) {
        var errorName = camelize(args.type) + "Error"
        args.name = errorName[0].toUpperCase() + errorName.substr(1)
    }

    createError.type = args.type;
    createError._name = args.name;

    return createError;

    function createError(opts) {
        var result = new Error()

        Object.defineProperty(result, "type", {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        })

        var options = extend({}, args, opts)

        extend(result, options)
        result.message = template(message, options)

        return result
    }
}


},{"camelize":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\node_modules\\camelize\\index.js","string-template":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\node_modules\\string-template\\index.js","xtend/mutable":"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\node_modules\\xtend\\mutable.js"}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\node_modules\\xtend\\mutable.js":[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\node_modules\\string-template\\index.js":[function(require,module,exports){
var nargs = /\{([0-9a-zA-Z]+)\}/g
var slice = Array.prototype.slice

module.exports = template

function template(string) {
    var args

    if (arguments.length === 2 && typeof arguments[1] === "object") {
        args = arguments[1]
    } else {
        args = slice.call(arguments, 1)
    }

    if (!args || !args.hasOwnProperty) {
        args = {}
    }

    return string.replace(nargs, function replaceArg(match, i, index) {
        var result

        if (string[index - 1] === "{" &&
            string[index + match.length] === "}") {
            return i
        } else {
            result = args.hasOwnProperty(i) ? args[i] : null
            if (result === null || result === undefined) {
                return ""
            }

            return result
        }
    })
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\virtual-dom\\node_modules\\error\\node_modules\\camelize\\index.js":[function(require,module,exports){
module.exports = function(obj) {
    if (typeof obj === 'string') return camelCase(obj);
    return walk(obj);
};

function walk (obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (isDate(obj) || isRegex(obj)) return obj;
    if (isArray(obj)) return map(obj, walk);
    return reduce(objectKeys(obj), function (acc, key) {
        var camel = camelCase(key);
        acc[camel] = walk(obj[key]);
        return acc;
    }, {});
}

function camelCase(str) {
    return str.replace(/[_.-](\w|$)/g, function (_,x) {
        return x.toUpperCase();
    });
}

var isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var isDate = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
};

var isRegex = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var has = Object.prototype.hasOwnProperty;
var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
        if (has.call(obj, key)) keys.push(key);
    }
    return keys;
};

function map (xs, f) {
    if (xs.map) return xs.map(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        res.push(f(xs[i], i));
    }
    return res;
}

function reduce (xs, f, acc) {
    if (xs.reduce) return xs.reduce(f, acc);
    for (var i = 0; i < xs.length; i++) {
        acc = f(acc, xs[i], i);
    }
    return acc;
}

},{}],"D:\\TimTech\\WebABC\\node_modules\\randomcolor\\randomColor.js":[function(require,module,exports){
;(function(root, factory) {

  // Support AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);

  // Support CommonJS
  } else if (typeof exports === 'object') {
    var randomColor = factory();
    
    // Support NodeJS & Component, which allow module.exports to be a function
    if (typeof module === 'object' && module && module.exports) {
      exports = module.exports = randomColor;
    }
    
    // Support CommonJS 1.1.1 spec
    exports.randomColor = randomColor;
  
  // Support vanilla script loading
  } else {
    root.randomColor = factory();
  };

}(this, function() {

  // Shared color dictionary
  var colorDictionary = {};

  // Populate the color dictionary
  loadColorBounds();

  var randomColor = function(options) {
    options = options || {};

    var H,S,B;

    // Check if we need to generate multiple colors
    if (options.count) {

      var totalColors = options.count,
          colors = [];

      options.count = false;

      while (totalColors > colors.length) {
        colors.push(randomColor(options));
      }

      return colors;
    }

    // First we pick a hue (H)
    H = pickHue(options);

    // Then use H to determine saturation (S)
    S = pickSaturation(H, options);

    // Then use S and H to determine brightness (B).
    B = pickBrightness(H, S, options);

    // Then we return the HSB color in the desired format
    return setFormat([H,S,B], options);
  };

  function pickHue (options) {

    var hueRange = getHueRange(options.hue),
        hue = randomWithin(hueRange);

    // Instead of storing red as two seperate ranges,
    // we group them, using negative numbers
    if (hue < 0) {hue = 360 + hue}

    return hue;

  }

  function pickSaturation (hue, options) {

    if (options.luminosity === 'random') {
      return randomWithin([0,100]);
    }

    if (options.hue === 'monochrome') {
      return 0;
    }

    var saturationRange = getSaturationRange(hue);

    var sMin = saturationRange[0],
        sMax = saturationRange[1];

    switch (options.luminosity) {

      case 'bright':
        sMin = 55;
        break;

      case 'dark':
        sMin = sMax - 10;
        break;

      case 'light':
        sMax = 55;
        break;
   }

    return randomWithin([sMin, sMax]);

  }

  function pickBrightness (H, S, options) {

    var brightness,
        bMin = getMinimumBrightness(H, S),
        bMax = 100;

    switch (options.luminosity) {

      case 'dark':
        bMax = bMin + 20;
        break;

      case 'light':
        bMin = (bMax + bMin)/2;
        break;

      case 'random':
        bMin = 0;
        bMax = 100;
        break;
    }

    return randomWithin([bMin, bMax]);

  }

  function setFormat (hsv, options) {

    switch (options.format) {

      case 'hsvArray':
        return hsv;

      case 'hsv':
        return colorString('hsv', hsv);

      case 'rgbArray':
        return HSVtoRGB(hsv);

      case 'rgb':
        return colorString('rgb', HSVtoRGB(hsv));

      default:
        return HSVtoHex(hsv);
    }

  }

  function getMinimumBrightness(H, S) {

    var lowerBounds = getColorInfo(H).lowerBounds;

    for (var i = 0; i < lowerBounds.length - 1; i++) {

      var s1 = lowerBounds[i][0],
          v1 = lowerBounds[i][1];

      var s2 = lowerBounds[i+1][0],
          v2 = lowerBounds[i+1][1];

      if (S >= s1 && S <= s2) {

         var m = (v2 - v1)/(s2 - s1),
             b = v1 - m*s1;

         return m*S + b;
      }

    }

    return 0;
  }

  function getHueRange (colorInput) {

    if (typeof parseInt(colorInput) === 'number') {

      var number = parseInt(colorInput);

      if (number < 360 && number > 0) {
        return [number, number];
      }

    }

    if (typeof colorInput === 'string') {

      if (colorDictionary[colorInput]) {
        var color = colorDictionary[colorInput];
        if (color.hueRange) {return color.hueRange}
      }
    }

    return [0,360];

  }

  function getSaturationRange (hue) {
    return getColorInfo(hue).saturationRange;
  }

  function getColorInfo (hue) {

    // Maps red colors to make picking hue easier
    if (hue >= 334 && hue <= 360) {
      hue-= 360;
    }

    for (var colorName in colorDictionary) {
       var color = colorDictionary[colorName];
       if (color.hueRange &&
           hue >= color.hueRange[0] &&
           hue <= color.hueRange[1]) {
          return colorDictionary[colorName];
       }
    } return 'Color not found';
  }

  function randomWithin (range) {
    return Math.floor(range[0] + Math.random()*(range[1] + 1 - range[0]));
  }

  function shiftHue (h, degrees) {
    return (h + degrees)%360;
  }

  function HSVtoHex (hsv){

    var rgb = HSVtoRGB(hsv);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    var hex = "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

    return hex;

  }

  function defineColor (name, hueRange, lowerBounds) {

    var sMin = lowerBounds[0][0],
        sMax = lowerBounds[lowerBounds.length - 1][0],

        bMin = lowerBounds[lowerBounds.length - 1][1],
        bMax = lowerBounds[0][1];

    colorDictionary[name] = {
      hueRange: hueRange,
      lowerBounds: lowerBounds,
      saturationRange: [sMin, sMax],
      brightnessRange: [bMin, bMax]
    };

  }

  function loadColorBounds () {

    defineColor(
      'monochrome',
      null,
      [[0,0],[100,0]]
    );

    defineColor(
      'red',
      [-26,18],
      [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
    );

    defineColor(
      'orange',
      [19,46],
      [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
    );

    defineColor(
      'yellow',
      [47,62],
      [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
    );

    defineColor(
      'green',
      [63,158],
      [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
    );

    defineColor(
      'blue',
      [159, 257],
      [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
    );

    defineColor(
      'purple',
      [258, 282],
      [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
    );

    defineColor(
      'pink',
      [283, 334],
      [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
    );

  }

  function HSVtoRGB (hsv) {

    // this doesn't work for the values of 0 and 360
    // here's the hacky fix
    var h = hsv[0];
    if (h === 0) {h = 1}
    if (h === 360) {h = 359}

    // Rebase the h,s,v values
    h = h/360;
    var s = hsv[1]/100,
        v = hsv[2]/100;

    var h_i = Math.floor(h*6),
      f = h * 6 - h_i,
      p = v * (1 - s),
      q = v * (1 - f*s),
      t = v * (1 - (1 - f)*s),
      r = 256,
      g = 256,
      b = 256;

    switch(h_i) {
      case 0: r = v, g = t, b = p;  break;
      case 1: r = q, g = v, b = p;  break;
      case 2: r = p, g = v, b = t;  break;
      case 3: r = p, g = q, b = v;  break;
      case 4: r = t, g = p, b = v;  break;
      case 5: r = v, g = p, b = q;  break;
    }
    var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
    return result;
  }

  function colorString (prefix, values) {
    return prefix + '(' + values.join(', ') + ')';
  }

  return randomColor;
}));
},{}],"D:\\TimTech\\WebABC\\engine\\rendering\\glyphs.js":[function(require,module,exports){
"use strict";

module.exports = {
    "0": {
        w: 10.78,
        h: 14.959,
        d: "M4.83,-14.97c0.33,-0.03,1.11,0,1.47,0.06c1.68,0.36,2.97,1.59,3.78,3.6c1.2,2.97,0.81,6.96,-0.9,9.27c-0.78,1.08,-1.71,1.71,-2.91,1.95c-0.45,0.09,-1.32,0.09,-1.77,0c-0.81,-0.18,-1.47,-0.51,-2.07,-1.02c-2.34,-2.07,-3.15,-6.72,-1.74,-10.2c0.87,-2.16,2.28,-3.42,4.14,-3.66zm1.11,0.87c-0.21,-0.06,-0.69,-0.09,-0.87,-0.06c-0.54,0.12,-0.87,0.42,-1.17,0.99c-0.36,0.66,-0.51,1.56,-0.6,3c-0.03,0.75,-0.03,4.59,0,5.31c0.09,1.5,0.27,2.4,0.6,3.06c0.24,0.48,0.57,0.78,0.96,0.9c0.27,0.09,0.78,0.09,1.05,0c0.39,-0.12,0.72,-0.42,0.96,-0.9c0.33,-0.66,0.51,-1.56,0.6,-3.06c0.03,-0.72,0.03,-4.56,0,-5.31c-0.09,-1.47,-0.27,-2.37,-0.6,-3.03c-0.24,-0.48,-0.54,-0.78,-0.93,-0.9z"
    },
    "1": {
        w: 8.94,
        h: 15.058,
        d: "M3.3,-15.06c0.06,-0.06,0.21,-0.03,0.66,0.15c0.81,0.39,1.08,0.39,1.83,0.03c0.21,-0.09,0.39,-0.15,0.42,-0.15c0.12,0,0.21,0.09,0.27,0.21c0.06,0.12,0.06,0.33,0.06,5.94c0,3.93,0,5.85,0.03,6.03c0.06,0.36,0.15,0.69,0.27,0.96c0.36,0.75,0.93,1.17,1.68,1.26c0.3,0.03,0.39,0.09,0.39,0.3c0,0.15,-0.03,0.18,-0.09,0.24c-0.06,0.06,-0.09,0.06,-0.48,0.06c-0.42,0,-0.69,-0.03,-2.1,-0.24c-0.9,-0.15,-1.77,-0.15,-2.67,0c-1.41,0.21,-1.68,0.24,-2.1,0.24c-0.39,0,-0.42,0,-0.48,-0.06c-0.06,-0.06,-0.06,-0.09,-0.06,-0.24c0,-0.21,0.06,-0.27,0.36,-0.3c0.75,-0.09,1.32,-0.51,1.68,-1.26c0.12,-0.27,0.21,-0.6,0.27,-0.96c0.03,-0.18,0.03,-1.59,0.03,-4.29c0,-3.87,0,-4.05,-0.06,-4.14c-0.09,-0.15,-0.18,-0.24,-0.39,-0.24c-0.12,0,-0.15,0.03,-0.21,0.06c-0.03,0.06,-0.45,0.99,-0.96,2.13c-0.48,1.14,-0.9,2.1,-0.93,2.16c-0.06,0.15,-0.21,0.24,-0.33,0.24c-0.24,0,-0.42,-0.18,-0.42,-0.39c0,-0.06,3.27,-7.62,3.33,-7.74z"
    },
    "2": {
        w: 10.764,
        h: 14.993,
        d: "M4.23,-14.97c0.57,-0.06,1.68,0,2.34,0.18c0.69,0.18,1.5,0.54,2.01,0.9c1.35,0.96,1.95,2.25,1.77,3.81c-0.15,1.35,-0.66,2.34,-1.68,3.15c-0.6,0.48,-1.44,0.93,-3.12,1.65c-1.32,0.57,-1.8,0.81,-2.37,1.14c-0.57,0.33,-0.57,0.33,-0.24,0.27c0.39,-0.09,1.26,-0.09,1.68,0c0.72,0.15,1.41,0.45,2.1,0.9c0.99,0.63,1.86,0.87,2.55,0.75c0.24,-0.06,0.42,-0.15,0.57,-0.3c0.12,-0.09,0.3,-0.42,0.3,-0.51c0,-0.09,0.12,-0.21,0.24,-0.24c0.18,-0.03,0.39,0.12,0.39,0.3c0,0.12,-0.15,0.57,-0.3,0.87c-0.54,1.02,-1.56,1.74,-2.79,2.01c-0.42,0.09,-1.23,0.09,-1.62,0.03c-0.81,-0.18,-1.32,-0.45,-2.01,-1.11c-0.45,-0.45,-0.63,-0.57,-0.96,-0.69c-0.84,-0.27,-1.89,0.12,-2.25,0.9c-0.12,0.21,-0.21,0.54,-0.21,0.72c0,0.12,-0.12,0.21,-0.27,0.24c-0.15,0,-0.27,-0.03,-0.33,-0.15c-0.09,-0.21,0.09,-1.08,0.33,-1.71c0.24,-0.66,0.66,-1.26,1.29,-1.89c0.45,-0.45,0.9,-0.81,1.92,-1.56c1.29,-0.93,1.89,-1.44,2.34,-1.98c0.87,-1.05,1.26,-2.19,1.2,-3.63c-0.06,-1.29,-0.39,-2.31,-0.96,-2.91c-0.36,-0.33,-0.72,-0.51,-1.17,-0.54c-0.84,-0.03,-1.53,0.42,-1.59,1.05c-0.03,0.33,0.12,0.6,0.57,1.14c0.45,0.54,0.54,0.87,0.42,1.41c-0.15,0.63,-0.54,1.11,-1.08,1.38c-0.63,0.33,-1.2,0.33,-1.83,0c-0.24,-0.12,-0.33,-0.18,-0.54,-0.39c-0.18,-0.18,-0.27,-0.3,-0.36,-0.51c-0.24,-0.45,-0.27,-0.84,-0.21,-1.38c0.12,-0.75,0.45,-1.41,1.02,-1.98c0.72,-0.72,1.74,-1.17,2.85,-1.32z"
    },
    "3": {
        w: 9.735,
        h: 14.967,
        d: "M3.78,-14.97c0.3,-0.03,1.41,0,1.83,0.06c2.22,0.3,3.51,1.32,3.72,2.91c0.03,0.33,0.03,1.26,-0.03,1.65c-0.12,0.84,-0.48,1.47,-1.05,1.77c-0.27,0.15,-0.36,0.24,-0.45,0.39c-0.09,0.21,-0.09,0.36,0,0.57c0.09,0.15,0.18,0.24,0.51,0.39c0.75,0.42,1.23,1.14,1.41,2.13c0.06,0.42,0.06,1.35,0,1.71c-0.18,0.81,-0.48,1.38,-1.02,1.95c-0.75,0.72,-1.8,1.2,-3.18,1.38c-0.42,0.06,-1.56,0.06,-1.95,0c-1.89,-0.33,-3.18,-1.29,-3.51,-2.64c-0.03,-0.12,-0.03,-0.33,-0.03,-0.6c0,-0.36,0,-0.42,0.06,-0.63c0.12,-0.3,0.27,-0.51,0.51,-0.75c0.24,-0.24,0.45,-0.39,0.75,-0.51c0.21,-0.06,0.27,-0.06,0.6,-0.06c0.33,0,0.39,0,0.6,0.06c0.3,0.12,0.51,0.27,0.75,0.51c0.36,0.33,0.57,0.75,0.6,1.2c0,0.21,0,0.27,-0.06,0.42c-0.09,0.18,-0.12,0.24,-0.54,0.54c-0.51,0.36,-0.63,0.54,-0.6,0.87c0.06,0.54,0.54,0.9,1.38,0.99c0.36,0.06,0.72,0.03,0.96,-0.06c0.81,-0.27,1.29,-1.23,1.44,-2.79c0.03,-0.45,0.03,-1.95,-0.03,-2.37c-0.09,-0.75,-0.33,-1.23,-0.75,-1.44c-0.33,-0.18,-0.45,-0.18,-1.98,-0.18c-1.35,0,-1.41,0,-1.5,-0.06c-0.18,-0.12,-0.24,-0.39,-0.12,-0.6c0.12,-0.15,0.15,-0.15,1.68,-0.15c1.5,0,1.62,0,1.89,-0.15c0.18,-0.09,0.42,-0.36,0.54,-0.57c0.18,-0.42,0.27,-0.9,0.3,-1.95c0.03,-1.2,-0.06,-1.8,-0.36,-2.37c-0.24,-0.48,-0.63,-0.81,-1.14,-0.96c-0.3,-0.06,-1.08,-0.06,-1.38,0.03c-0.6,0.15,-0.9,0.42,-0.96,0.84c-0.03,0.3,0.06,0.45,0.63,0.84c0.33,0.24,0.42,0.39,0.45,0.63c0.03,0.72,-0.57,1.5,-1.32,1.65c-1.05,0.27,-2.1,-0.57,-2.1,-1.65c0,-0.45,0.15,-0.96,0.39,-1.38c0.12,-0.21,0.54,-0.63,0.81,-0.81c0.57,-0.42,1.38,-0.69,2.25,-0.81z"
    },
    "4": {
        w: 11.795,
        h: 14.994,
        d: "M8.64,-14.94c0.27,-0.09,0.42,-0.12,0.54,-0.03c0.09,0.06,0.15,0.21,0.15,0.3c-0.03,0.06,-1.92,2.31,-4.23,5.04c-2.31,2.73,-4.23,4.98,-4.26,5.01c-0.03,0.06,0.12,0.06,2.55,0.06l2.61,0l0,-2.37c0,-2.19,0.03,-2.37,0.06,-2.46c0.03,-0.06,0.21,-0.18,0.57,-0.42c1.08,-0.72,1.38,-1.08,1.86,-2.16c0.12,-0.3,0.24,-0.54,0.27,-0.57c0.12,-0.12,0.39,-0.06,0.45,0.12c0.06,0.09,0.06,0.57,0.06,3.96l0,3.9l1.08,0c1.05,0,1.11,0,1.2,0.06c0.24,0.15,0.24,0.54,0,0.69c-0.09,0.06,-0.15,0.06,-1.2,0.06l-1.08,0l0,0.33c0,0.57,0.09,1.11,0.3,1.53c0.36,0.75,0.93,1.17,1.68,1.26c0.3,0.03,0.39,0.09,0.39,0.3c0,0.15,-0.03,0.18,-0.09,0.24c-0.06,0.06,-0.09,0.06,-0.48,0.06c-0.42,0,-0.69,-0.03,-2.1,-0.24c-0.9,-0.15,-1.77,-0.15,-2.67,0c-1.41,0.21,-1.68,0.24,-2.1,0.24c-0.39,0,-0.42,0,-0.48,-0.06c-0.06,-0.06,-0.06,-0.09,-0.06,-0.24c0,-0.21,0.06,-0.27,0.36,-0.3c0.75,-0.09,1.32,-0.51,1.68,-1.26c0.21,-0.42,0.3,-0.96,0.3,-1.53l0,-0.33l-2.7,0c-2.91,0,-2.85,0,-3.09,-0.15c-0.18,-0.12,-0.3,-0.39,-0.27,-0.54c0.03,-0.06,0.18,-0.24,0.33,-0.45c0.75,-0.9,1.59,-2.07,2.13,-3.03c0.33,-0.54,0.84,-1.62,1.05,-2.16c0.57,-1.41,0.84,-2.64,0.9,-4.05c0.03,-0.63,0.06,-0.72,0.24,-0.81l0.12,-0.06l0.45,0.12c0.66,0.18,1.02,0.24,1.47,0.27c0.6,0.03,1.23,-0.09,2.01,-0.33z"
    },
    "5": {
        w: 10.212,
        h: 14.997,
        d: "M1.02,-14.94c0.12,-0.09,0.03,-0.09,1.08,0.06c2.49,0.36,4.35,0.36,6.96,-0.06c0.57,-0.09,0.66,-0.06,0.81,0.06c0.15,0.18,0.12,0.24,-0.15,0.51c-1.29,1.26,-3.24,2.04,-5.58,2.31c-0.6,0.09,-1.2,0.12,-1.71,0.12c-0.39,0,-0.45,0,-0.57,0.06c-0.09,0.06,-0.15,0.12,-0.21,0.21l-0.06,0.12l0,1.65l0,1.65l0.21,-0.21c0.66,-0.57,1.41,-0.96,2.19,-1.14c0.33,-0.06,1.41,-0.06,1.95,0c2.61,0.36,4.02,1.74,4.26,4.14c0.03,0.45,0.03,1.08,-0.03,1.44c-0.18,1.02,-0.78,2.01,-1.59,2.7c-0.72,0.57,-1.62,1.02,-2.49,1.2c-1.38,0.27,-3.03,0.06,-4.2,-0.54c-1.08,-0.54,-1.71,-1.32,-1.86,-2.28c-0.09,-0.69,0.09,-1.29,0.57,-1.74c0.24,-0.24,0.45,-0.39,0.75,-0.51c0.21,-0.06,0.27,-0.06,0.6,-0.06c0.33,0,0.39,0,0.6,0.06c0.3,0.12,0.51,0.27,0.75,0.51c0.36,0.33,0.57,0.75,0.6,1.2c0,0.21,0,0.27,-0.06,0.42c-0.09,0.18,-0.12,0.24,-0.54,0.54c-0.18,0.12,-0.36,0.3,-0.42,0.33c-0.36,0.42,-0.18,0.99,0.36,1.26c0.51,0.27,1.47,0.36,2.01,0.27c0.93,-0.21,1.47,-1.17,1.65,-2.91c0.06,-0.45,0.06,-1.89,0,-2.31c-0.15,-1.2,-0.51,-2.1,-1.05,-2.55c-0.21,-0.18,-0.54,-0.36,-0.81,-0.39c-0.3,-0.06,-0.84,-0.03,-1.26,0.06c-0.93,0.18,-1.65,0.6,-2.16,1.2c-0.15,0.21,-0.27,0.3,-0.39,0.3c-0.15,0,-0.3,-0.09,-0.36,-0.18c-0.06,-0.09,-0.06,-0.15,-0.06,-3.66c0,-3.39,0,-3.57,0.06,-3.66c0.03,-0.06,0.09,-0.15,0.15,-0.18z"
    },
    "6": {
        w: 9.956,
        h: 14.982,
        d: "M4.98,-14.97c0.36,-0.03,1.2,0,1.59,0.06c0.9,0.15,1.68,0.51,2.25,1.05c0.57,0.51,0.87,1.23,0.84,1.98c-0.03,0.51,-0.21,0.9,-0.6,1.26c-0.24,0.24,-0.45,0.39,-0.75,0.51c-0.21,0.06,-0.27,0.06,-0.6,0.06c-0.33,0,-0.39,0,-0.6,-0.06c-0.3,-0.12,-0.51,-0.27,-0.75,-0.51c-0.39,-0.36,-0.57,-0.78,-0.57,-1.26c0,-0.27,0,-0.3,0.09,-0.42c0.03,-0.09,0.18,-0.21,0.3,-0.3c0.12,-0.09,0.3,-0.21,0.39,-0.27c0.09,-0.06,0.21,-0.18,0.27,-0.24c0.06,-0.12,0.09,-0.15,0.09,-0.33c0,-0.18,-0.03,-0.24,-0.09,-0.36c-0.24,-0.39,-0.75,-0.6,-1.38,-0.57c-0.54,0.03,-0.9,0.18,-1.23,0.48c-0.81,0.72,-1.08,2.16,-0.96,5.37l0,0.63l0.3,-0.12c0.78,-0.27,1.29,-0.33,2.1,-0.27c1.47,0.12,2.49,0.54,3.27,1.29c0.48,0.51,0.81,1.11,0.96,1.89c0.06,0.27,0.06,0.42,0.06,0.93c0,0.54,0,0.69,-0.06,0.96c-0.15,0.78,-0.48,1.38,-0.96,1.89c-0.54,0.51,-1.17,0.87,-1.98,1.08c-1.14,0.3,-2.4,0.33,-3.24,0.03c-1.5,-0.48,-2.64,-1.89,-3.27,-4.02c-0.36,-1.23,-0.51,-2.82,-0.42,-4.08c0.3,-3.66,2.28,-6.3,4.95,-6.66zm0.66,7.41c-0.27,-0.09,-0.81,-0.12,-1.08,-0.06c-0.72,0.18,-1.08,0.69,-1.23,1.71c-0.06,0.54,-0.06,3,0,3.54c0.18,1.26,0.72,1.77,1.8,1.74c0.39,-0.03,0.63,-0.09,0.9,-0.27c0.66,-0.42,0.9,-1.32,0.9,-3.24c0,-2.22,-0.36,-3.12,-1.29,-3.42z"
    },
    "7": {
        w: 10.561,
        h: 15.093,
        d: "M0.21,-14.97c0.21,-0.06,0.45,0,0.54,0.15c0.06,0.09,0.06,0.15,0.06,0.39c0,0.24,0,0.33,0.06,0.42c0.06,0.12,0.21,0.24,0.27,0.24c0.03,0,0.12,-0.12,0.24,-0.21c0.96,-1.2,2.58,-1.35,3.99,-0.42c0.15,0.12,0.42,0.3,0.54,0.45c0.48,0.39,0.81,0.57,1.29,0.6c0.69,0.03,1.5,-0.3,2.13,-0.87c0.09,-0.09,0.27,-0.3,0.39,-0.45c0.12,-0.15,0.24,-0.27,0.3,-0.3c0.18,-0.06,0.39,0.03,0.51,0.21c0.06,0.18,0.06,0.24,-0.27,0.72c-0.18,0.24,-0.54,0.78,-0.78,1.17c-2.37,3.54,-3.54,6.27,-3.87,9c-0.03,0.33,-0.03,0.66,-0.03,1.26c0,0.9,0,1.08,0.15,1.89c0.06,0.45,0.06,0.48,0.03,0.6c-0.06,0.09,-0.21,0.21,-0.3,0.21c-0.03,0,-0.27,-0.06,-0.54,-0.15c-0.84,-0.27,-1.11,-0.3,-1.65,-0.3c-0.57,0,-0.84,0.03,-1.56,0.27c-0.6,0.18,-0.69,0.21,-0.81,0.15c-0.12,-0.06,-0.21,-0.18,-0.21,-0.3c0,-0.15,0.6,-1.44,1.2,-2.61c1.14,-2.22,2.73,-4.68,5.1,-8.01c0.21,-0.27,0.36,-0.48,0.33,-0.48c0,0,-0.12,0.06,-0.27,0.12c-0.54,0.3,-0.99,0.39,-1.56,0.39c-0.75,0.03,-1.2,-0.18,-1.83,-0.75c-0.99,-0.9,-1.83,-1.17,-2.31,-0.72c-0.18,0.15,-0.36,0.51,-0.45,0.84c-0.06,0.24,-0.06,0.33,-0.09,1.98c0,1.62,-0.03,1.74,-0.06,1.8c-0.15,0.24,-0.54,0.24,-0.69,0c-0.06,-0.09,-0.06,-0.15,-0.06,-3.57c0,-3.42,0,-3.48,0.06,-3.57c0.03,-0.06,0.09,-0.12,0.15,-0.15z"
    },
    "8": {
        w: 10.926,
        h: 14.989,
        d: "M4.98,-14.97c0.33,-0.03,1.02,-0.03,1.32,0c1.32,0.12,2.49,0.6,3.21,1.32c0.39,0.39,0.66,0.81,0.78,1.29c0.09,0.36,0.09,1.08,0,1.44c-0.21,0.84,-0.66,1.59,-1.59,2.55l-0.3,0.3l0.27,0.18c1.47,0.93,2.31,2.31,2.25,3.75c-0.03,0.75,-0.24,1.35,-0.63,1.95c-0.45,0.66,-1.02,1.14,-1.83,1.53c-1.8,0.87,-4.2,0.87,-6,0.03c-1.62,-0.78,-2.52,-2.16,-2.46,-3.66c0.06,-0.99,0.54,-1.77,1.8,-2.97c0.54,-0.51,0.54,-0.54,0.48,-0.57c-0.39,-0.27,-0.96,-0.78,-1.2,-1.14c-0.75,-1.11,-0.87,-2.4,-0.3,-3.6c0.69,-1.35,2.25,-2.25,4.2,-2.4zm1.53,0.69c-0.42,-0.09,-1.11,-0.12,-1.38,-0.06c-0.3,0.06,-0.6,0.18,-0.81,0.3c-0.21,0.12,-0.6,0.51,-0.72,0.72c-0.51,0.87,-0.42,1.89,0.21,2.52c0.21,0.21,0.36,0.3,1.95,1.23c0.96,0.54,1.74,0.99,1.77,1.02c0.09,0,0.63,-0.6,0.99,-1.11c0.21,-0.36,0.48,-0.87,0.57,-1.23c0.06,-0.24,0.06,-0.36,0.06,-0.72c0,-0.45,-0.03,-0.66,-0.15,-0.99c-0.39,-0.81,-1.29,-1.44,-2.49,-1.68zm-1.44,8.07l-1.89,-1.08c-0.03,0,-0.18,0.15,-0.39,0.33c-1.2,1.08,-1.65,1.95,-1.59,3c0.09,1.59,1.35,2.85,3.21,3.24c0.33,0.06,0.45,0.06,0.93,0.06c0.63,0,0.81,-0.03,1.29,-0.27c0.9,-0.42,1.47,-1.41,1.41,-2.4c-0.06,-0.66,-0.39,-1.29,-0.9,-1.65c-0.12,-0.09,-1.05,-0.63,-2.07,-1.23z"
    },
    "9": {
        w: 9.959,
        h: 14.986,
        d: "M4.23,-14.97c0.42,-0.03,1.29,0,1.62,0.06c0.51,0.12,0.93,0.3,1.38,0.57c1.53,1.02,2.52,3.24,2.73,5.94c0.18,2.55,-0.48,4.98,-1.83,6.57c-1.05,1.26,-2.4,1.89,-3.93,1.83c-1.23,-0.06,-2.31,-0.45,-3.03,-1.14c-0.57,-0.51,-0.87,-1.23,-0.84,-1.98c0.03,-0.51,0.21,-0.9,0.6,-1.26c0.24,-0.24,0.45,-0.39,0.75,-0.51c0.21,-0.06,0.27,-0.06,0.6,-0.06c0.33,0,0.39,0,0.6,0.06c0.3,0.12,0.51,0.27,0.75,0.51c0.39,0.36,0.57,0.78,0.57,1.26c0,0.27,0,0.3,-0.09,0.42c-0.03,0.09,-0.18,0.21,-0.3,0.3c-0.12,0.09,-0.3,0.21,-0.39,0.27c-0.09,0.06,-0.21,0.18,-0.27,0.24c-0.06,0.12,-0.06,0.15,-0.06,0.33c0,0.18,0,0.24,0.06,0.36c0.24,0.39,0.75,0.6,1.38,0.57c0.54,-0.03,0.9,-0.18,1.23,-0.48c0.81,-0.72,1.08,-2.16,0.96,-5.37l0,-0.63l-0.3,0.12c-0.78,0.27,-1.29,0.33,-2.1,0.27c-1.47,-0.12,-2.49,-0.54,-3.27,-1.29c-0.48,-0.51,-0.81,-1.11,-0.96,-1.89c-0.06,-0.27,-0.06,-0.42,-0.06,-0.96c0,-0.51,0,-0.66,0.06,-0.93c0.15,-0.78,0.48,-1.38,0.96,-1.89c0.15,-0.12,0.33,-0.27,0.42,-0.36c0.69,-0.51,1.62,-0.81,2.76,-0.93zm1.17,0.66c-0.21,-0.06,-0.57,-0.06,-0.81,-0.03c-0.78,0.12,-1.26,0.69,-1.41,1.74c-0.12,0.63,-0.15,1.95,-0.09,2.79c0.12,1.71,0.63,2.4,1.77,2.46c1.08,0.03,1.62,-0.48,1.8,-1.74c0.06,-0.54,0.06,-3,0,-3.54c-0.15,-1.05,-0.51,-1.53,-1.26,-1.68z"
    },
    "rests.whole": {
        w: 11.25,
        h: 4.68,
        d: "M0.06,0.03l0.09,-0.06l5.46,0l5.49,0l0.09,0.06l0.06,0.09l0,2.19l0,2.19l-0.06,0.09l-0.09,0.06l-5.49,0l-5.46,0l-0.09,-0.06l-0.06,-0.09l0,-2.19l0,-2.19z"
    },
    "rests.half": {
        w: 11.25,
        h: 4.68,
        d: "M0.06,-4.62l0.09,-0.06l5.46,0l5.49,0l0.09,0.06l0.06,0.09l0,2.19l0,2.19l-0.06,0.09l-0.09,0.06l-5.49,0l-5.46,0l-0.09,-0.06l-0.06,-0.09l0,-2.19l0,-2.19z"
    },
    "rests.quarter": {
        w: 7.888,
        h: 21.435,
        d: "M1.89,-11.82c0.12,-0.06,0.24,-0.06,0.36,-0.03c0.09,0.06,4.74,5.58,4.86,5.82c0.21,0.39,0.15,0.78,-0.15,1.26c-0.24,0.33,-0.72,0.81,-1.62,1.56c-0.45,0.36,-0.87,0.75,-0.96,0.84c-0.93,0.99,-1.14,2.49,-0.6,3.63c0.18,0.39,0.27,0.48,1.32,1.68c1.92,2.25,1.83,2.16,1.83,2.34c0,0.18,-0.18,0.36,-0.36,0.39c-0.15,0,-0.27,-0.06,-0.48,-0.27c-0.75,-0.75,-2.46,-1.29,-3.39,-1.08c-0.45,0.09,-0.69,0.27,-0.9,0.69c-0.12,0.3,-0.21,0.66,-0.24,1.14c-0.03,0.66,0.09,1.35,0.3,2.01c0.15,0.42,0.24,0.66,0.45,0.96c0.18,0.24,0.18,0.33,0.03,0.42c-0.12,0.06,-0.18,0.03,-0.45,-0.3c-1.08,-1.38,-2.07,-3.36,-2.4,-4.83c-0.27,-1.05,-0.15,-1.77,0.27,-2.07c0.21,-0.12,0.42,-0.15,0.87,-0.15c0.87,0.06,2.1,0.39,3.3,0.9l0.39,0.18l-1.65,-1.95c-2.52,-2.97,-2.61,-3.09,-2.7,-3.27c-0.09,-0.24,-0.12,-0.48,-0.03,-0.75c0.15,-0.48,0.57,-0.96,1.83,-2.01c0.45,-0.36,0.84,-0.72,0.93,-0.78c0.69,-0.75,1.02,-1.8,0.9,-2.79c-0.06,-0.33,-0.21,-0.84,-0.39,-1.11c-0.09,-0.15,-0.45,-0.6,-0.81,-1.05c-0.36,-0.42,-0.69,-0.81,-0.72,-0.87c-0.09,-0.18,0,-0.42,0.21,-0.51z"
    },
    "rests.8th": {
        w: 7.534,
        h: 13.883,
        d: "M1.68,-6.12c0.66,-0.09,1.23,0.09,1.68,0.51c0.27,0.3,0.39,0.54,0.57,1.26c0.09,0.33,0.18,0.66,0.21,0.72c0.12,0.27,0.33,0.45,0.6,0.48c0.12,0,0.18,0,0.33,-0.09c0.39,-0.18,1.32,-1.29,1.68,-1.98c0.09,-0.21,0.24,-0.3,0.39,-0.3c0.12,0,0.27,0.09,0.33,0.18c0.03,0.06,-0.27,1.11,-1.86,6.42c-1.02,3.48,-1.89,6.39,-1.92,6.42c0,0.03,-0.12,0.12,-0.24,0.15c-0.18,0.09,-0.21,0.09,-0.45,0.09c-0.24,0,-0.3,0,-0.48,-0.06c-0.09,-0.06,-0.21,-0.12,-0.21,-0.15c-0.06,-0.03,0.15,-0.57,1.68,-4.92c0.96,-2.67,1.74,-4.89,1.71,-4.89l-0.51,0.15c-1.08,0.36,-1.74,0.48,-2.55,0.48c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.33,-0.45,0.84,-0.81,1.38,-0.9z"
    },
    "rests.16th": {
        w: 9.724,
        h: 21.383,
        d: "M3.33,-6.12c0.66,-0.09,1.23,0.09,1.68,0.51c0.27,0.3,0.39,0.54,0.57,1.26c0.09,0.33,0.18,0.66,0.21,0.72c0.15,0.39,0.57,0.57,0.87,0.42c0.39,-0.18,1.2,-1.23,1.62,-2.07c0.06,-0.15,0.24,-0.24,0.36,-0.24c0.12,0,0.27,0.09,0.33,0.18c0.03,0.06,-0.45,1.86,-2.67,10.17c-1.5,5.55,-2.73,10.14,-2.76,10.17c-0.03,0.03,-0.12,0.12,-0.24,0.15c-0.18,0.09,-0.21,0.09,-0.45,0.09c-0.24,0,-0.3,0,-0.48,-0.06c-0.09,-0.06,-0.21,-0.12,-0.21,-0.15c-0.06,-0.03,0.12,-0.57,1.44,-4.92c0.81,-2.67,1.47,-4.86,1.47,-4.89c-0.03,0,-0.27,0.06,-0.54,0.15c-1.08,0.36,-1.77,0.48,-2.58,0.48c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.72,-1.05,2.22,-1.23,3.06,-0.42c0.3,0.33,0.42,0.6,0.6,1.38c0.09,0.45,0.21,0.78,0.33,0.9c0.09,0.09,0.27,0.18,0.45,0.21c0.12,0,0.18,0,0.33,-0.09c0.33,-0.15,1.02,-0.93,1.41,-1.59c0.12,-0.21,0.18,-0.39,0.39,-1.08c0.66,-2.1,1.17,-3.84,1.17,-3.87c0,0,-0.21,0.06,-0.42,0.15c-0.51,0.15,-1.2,0.33,-1.68,0.42c-0.33,0.06,-0.51,0.06,-0.96,0.06c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.33,-0.45,0.84,-0.81,1.38,-0.9z"
    },
    "rests.32nd": {
        w: 11.373,
        h: 28.883,
        d: "M4.23,-13.62c0.66,-0.09,1.23,0.09,1.68,0.51c0.27,0.3,0.39,0.54,0.57,1.26c0.09,0.33,0.18,0.66,0.21,0.72c0.12,0.27,0.33,0.45,0.6,0.48c0.12,0,0.18,0,0.27,-0.06c0.33,-0.21,0.99,-1.11,1.44,-1.98c0.09,-0.24,0.21,-0.33,0.39,-0.33c0.12,0,0.27,0.09,0.33,0.18c0.03,0.06,-0.57,2.67,-3.21,13.89c-1.8,7.62,-3.3,13.89,-3.3,13.92c-0.03,0.06,-0.12,0.12,-0.24,0.18c-0.21,0.09,-0.24,0.09,-0.48,0.09c-0.24,0,-0.3,0,-0.48,-0.06c-0.09,-0.06,-0.21,-0.12,-0.21,-0.15c-0.06,-0.03,0.09,-0.57,1.23,-4.92c0.69,-2.67,1.26,-4.86,1.29,-4.89c0,-0.03,-0.12,-0.03,-0.48,0.12c-1.17,0.39,-2.22,0.57,-3,0.54c-0.42,-0.03,-0.75,-0.12,-1.11,-0.3c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.72,-1.05,2.22,-1.23,3.06,-0.42c0.3,0.33,0.42,0.6,0.6,1.38c0.09,0.45,0.21,0.78,0.33,0.9c0.12,0.09,0.3,0.18,0.48,0.21c0.12,0,0.18,0,0.3,-0.09c0.42,-0.21,1.29,-1.29,1.56,-1.89c0.03,-0.12,1.23,-4.59,1.23,-4.65c0,-0.03,-0.18,0.03,-0.39,0.12c-0.63,0.18,-1.2,0.36,-1.74,0.45c-0.39,0.06,-0.54,0.06,-1.02,0.06c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.72,-1.05,2.22,-1.23,3.06,-0.42c0.3,0.33,0.42,0.6,0.6,1.38c0.09,0.45,0.21,0.78,0.33,0.9c0.18,0.18,0.51,0.27,0.72,0.15c0.3,-0.12,0.69,-0.57,1.08,-1.17c0.42,-0.6,0.39,-0.51,1.05,-3.03c0.33,-1.26,0.6,-2.31,0.6,-2.34c0,0,-0.21,0.03,-0.45,0.12c-0.57,0.18,-1.14,0.33,-1.62,0.42c-0.33,0.06,-0.51,0.06,-0.96,0.06c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.33,-0.45,0.84,-0.81,1.38,-0.9z"
    },
    "rests.64th": {
        w: 12.453,
        h: 36.383,
        d: "M5.13,-13.62c0.66,-0.09,1.23,0.09,1.68,0.51c0.27,0.3,0.39,0.54,0.57,1.26c0.15,0.63,0.21,0.81,0.33,0.96c0.18,0.21,0.54,0.3,0.75,0.18c0.24,-0.12,0.63,-0.66,1.08,-1.56c0.33,-0.66,0.39,-0.72,0.6,-0.72c0.12,0,0.27,0.09,0.33,0.18c0.03,0.06,-0.69,3.66,-3.54,17.64c-1.95,9.66,-3.57,17.61,-3.57,17.64c-0.03,0.06,-0.12,0.12,-0.24,0.18c-0.21,0.09,-0.24,0.09,-0.48,0.09c-0.24,0,-0.3,0,-0.48,-0.06c-0.09,-0.06,-0.21,-0.12,-0.21,-0.15c-0.06,-0.03,0.06,-0.57,1.05,-4.95c0.6,-2.7,1.08,-4.89,1.08,-4.92c0,0,-0.24,0.06,-0.51,0.15c-0.66,0.24,-1.2,0.36,-1.77,0.48c-0.42,0.06,-0.57,0.06,-1.05,0.06c-0.69,0,-0.87,-0.03,-1.35,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.72,-1.05,2.22,-1.23,3.06,-0.42c0.3,0.33,0.42,0.6,0.6,1.38c0.09,0.45,0.21,0.78,0.33,0.9c0.09,0.09,0.27,0.18,0.45,0.21c0.21,0.03,0.39,-0.09,0.72,-0.42c0.45,-0.45,1.02,-1.26,1.17,-1.65c0.03,-0.09,0.27,-1.14,0.54,-2.34c0.27,-1.2,0.48,-2.19,0.51,-2.22c0,-0.03,-0.09,-0.03,-0.48,0.12c-1.17,0.39,-2.22,0.57,-3,0.54c-0.42,-0.03,-0.75,-0.12,-1.11,-0.3c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.36,-0.54,0.96,-0.87,1.65,-0.93c0.54,-0.03,1.02,0.15,1.41,0.54c0.27,0.3,0.39,0.54,0.57,1.26c0.09,0.33,0.18,0.66,0.21,0.72c0.15,0.39,0.57,0.57,0.9,0.42c0.36,-0.18,1.2,-1.26,1.47,-1.89c0.03,-0.09,0.3,-1.2,0.57,-2.43l0.51,-2.28l-0.54,0.18c-1.11,0.36,-1.8,0.48,-2.61,0.48c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.36,-0.54,0.96,-0.87,1.65,-0.93c0.54,-0.03,1.02,0.15,1.41,0.54c0.27,0.3,0.39,0.54,0.57,1.26c0.15,0.63,0.21,0.81,0.33,0.96c0.21,0.21,0.54,0.3,0.75,0.18c0.36,-0.18,0.93,-0.93,1.29,-1.68c0.12,-0.24,0.18,-0.48,0.63,-2.55l0.51,-2.31c0,-0.03,-0.18,0.03,-0.39,0.12c-1.14,0.36,-2.1,0.54,-2.82,0.51c-0.42,-0.03,-0.75,-0.12,-1.11,-0.3c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.33,-0.45,0.84,-0.81,1.38,-0.9z"
    },
    "rests.128th": {
        w: 12.992,
        h: 43.883,
        d: "M6.03,-21.12c0.66,-0.09,1.23,0.09,1.68,0.51c0.27,0.3,0.39,0.54,0.57,1.26c0.09,0.33,0.18,0.66,0.21,0.72c0.12,0.27,0.33,0.45,0.6,0.48c0.21,0,0.33,-0.06,0.54,-0.36c0.15,-0.21,0.54,-0.93,0.78,-1.47c0.15,-0.33,0.18,-0.39,0.3,-0.48c0.18,-0.09,0.45,0,0.51,0.15c0.03,0.09,-7.11,42.75,-7.17,42.84c-0.03,0.03,-0.15,0.09,-0.24,0.15c-0.18,0.06,-0.24,0.06,-0.45,0.06c-0.24,0,-0.3,0,-0.48,-0.06c-0.09,-0.06,-0.21,-0.12,-0.21,-0.15c-0.06,-0.03,0.03,-0.57,0.84,-4.98c0.51,-2.7,0.93,-4.92,0.9,-4.92c0,0,-0.15,0.06,-0.36,0.12c-0.78,0.27,-1.62,0.48,-2.31,0.57c-0.15,0.03,-0.54,0.03,-0.81,0.03c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.36,-0.54,0.96,-0.87,1.65,-0.93c0.54,-0.03,1.02,0.15,1.41,0.54c0.27,0.3,0.39,0.54,0.57,1.26c0.09,0.33,0.18,0.66,0.21,0.72c0.12,0.27,0.33,0.45,0.63,0.48c0.12,0,0.18,0,0.3,-0.09c0.42,-0.21,1.14,-1.11,1.5,-1.83c0.12,-0.27,0.12,-0.27,0.54,-2.52c0.24,-1.23,0.42,-2.25,0.39,-2.25c0,0,-0.24,0.06,-0.51,0.18c-1.26,0.39,-2.25,0.57,-3.06,0.54c-0.42,-0.03,-0.75,-0.12,-1.11,-0.3c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.36,-0.54,0.96,-0.87,1.65,-0.93c0.54,-0.03,1.02,0.15,1.41,0.54c0.27,0.3,0.39,0.54,0.57,1.26c0.15,0.63,0.21,0.81,0.33,0.96c0.18,0.21,0.51,0.3,0.75,0.18c0.36,-0.15,1.05,-0.99,1.41,-1.77l0.15,-0.3l0.42,-2.25c0.21,-1.26,0.42,-2.28,0.39,-2.28l-0.51,0.15c-1.11,0.39,-1.89,0.51,-2.7,0.51c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.36,-0.54,0.96,-0.87,1.65,-0.93c0.54,-0.03,1.02,0.15,1.41,0.54c0.27,0.3,0.39,0.54,0.57,1.26c0.15,0.63,0.21,0.81,0.33,0.96c0.18,0.18,0.48,0.27,0.72,0.21c0.33,-0.12,1.14,-1.26,1.41,-1.95c0,-0.09,0.21,-1.11,0.45,-2.34c0.21,-1.2,0.39,-2.22,0.39,-2.28c0.03,-0.03,0,-0.03,-0.45,0.12c-0.57,0.18,-1.2,0.33,-1.71,0.42c-0.3,0.06,-0.51,0.06,-0.93,0.06c-0.66,0,-0.84,-0.03,-1.32,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.36,-0.54,0.96,-0.87,1.65,-0.93c0.54,-0.03,1.02,0.15,1.41,0.54c0.27,0.3,0.39,0.54,0.57,1.26c0.09,0.33,0.18,0.66,0.21,0.72c0.12,0.27,0.33,0.45,0.6,0.48c0.18,0,0.36,-0.09,0.57,-0.33c0.33,-0.36,0.78,-1.14,0.93,-1.56c0.03,-0.12,0.24,-1.2,0.45,-2.4c0.24,-1.2,0.42,-2.22,0.42,-2.28c0.03,-0.03,0,-0.03,-0.39,0.09c-1.05,0.36,-1.8,0.48,-2.58,0.48c-0.63,0,-0.84,-0.03,-1.29,-0.27c-1.32,-0.63,-1.77,-2.16,-1.02,-3.3c0.33,-0.45,0.84,-0.81,1.38,-0.9z"
    },
    "accidentals.sharp": {
        w: 8.25,
        h: 22.462,
        d: "M5.73,-11.19c0.21,-0.12,0.54,-0.03,0.66,0.24c0.06,0.12,0.06,0.21,0.06,2.31c0,1.23,0,2.22,0.03,2.22c0,0,0.27,-0.12,0.6,-0.24c0.69,-0.27,0.78,-0.3,0.96,-0.15c0.21,0.15,0.21,0.18,0.21,1.38c0,1.02,0,1.11,-0.06,1.2c-0.03,0.06,-0.09,0.12,-0.12,0.15c-0.06,0.03,-0.42,0.21,-0.84,0.36l-0.75,0.33l-0.03,2.43c0,1.32,0,2.43,0.03,2.43c0,0,0.27,-0.12,0.6,-0.24c0.69,-0.27,0.78,-0.3,0.96,-0.15c0.21,0.15,0.21,0.18,0.21,1.38c0,1.02,0,1.11,-0.06,1.2c-0.03,0.06,-0.09,0.12,-0.12,0.15c-0.06,0.03,-0.42,0.21,-0.84,0.36l-0.75,0.33l-0.03,2.52c0,2.28,-0.03,2.55,-0.06,2.64c-0.21,0.36,-0.72,0.36,-0.93,0c-0.03,-0.09,-0.06,-0.33,-0.06,-2.43l0,-2.31l-1.29,0.51l-1.26,0.51l0,2.43c0,2.58,0,2.52,-0.15,2.67c-0.06,0.09,-0.27,0.18,-0.36,0.18c-0.12,0,-0.33,-0.09,-0.39,-0.18c-0.15,-0.15,-0.15,-0.09,-0.15,-2.43c0,-1.23,0,-2.22,-0.03,-2.22c0,0,-0.27,0.12,-0.6,0.24c-0.69,0.27,-0.78,0.3,-0.96,0.15c-0.21,-0.15,-0.21,-0.18,-0.21,-1.38c0,-1.02,0,-1.11,0.06,-1.2c0.03,-0.06,0.09,-0.12,0.12,-0.15c0.06,-0.03,0.42,-0.21,0.84,-0.36l0.78,-0.33l0,-2.43c0,-1.32,0,-2.43,-0.03,-2.43c0,0,-0.27,0.12,-0.6,0.24c-0.69,0.27,-0.78,0.3,-0.96,0.15c-0.21,-0.15,-0.21,-0.18,-0.21,-1.38c0,-1.02,0,-1.11,0.06,-1.2c0.03,-0.06,0.09,-0.12,0.12,-0.15c0.06,-0.03,0.42,-0.21,0.84,-0.36l0.78,-0.33l0,-2.52c0,-2.28,0.03,-2.55,0.06,-2.64c0.21,-0.36,0.72,-0.36,0.93,0c0.03,0.09,0.06,0.33,0.06,2.43l0.03,2.31l1.26,-0.51l1.26,-0.51l0,-2.43c0,-2.28,0,-2.43,0.06,-2.55c0.06,-0.12,0.12,-0.18,0.27,-0.24zm-0.33,10.65l0,-2.43l-1.29,0.51l-1.26,0.51l0,2.46l0,2.43l0.09,-0.03c0.06,-0.03,0.63,-0.27,1.29,-0.51l1.17,-0.48l0,-2.46z"
    },
    "accidentals.halfsharp": {
        w: 5.25,
        h: 20.174,
        d: "M2.43,-10.05c0.21,-0.12,0.54,-0.03,0.66,0.24c0.06,0.12,0.06,0.21,0.06,2.01c0,1.05,0,1.89,0.03,1.89l0.72,-0.48c0.69,-0.48,0.69,-0.51,0.87,-0.51c0.15,0,0.18,0.03,0.27,0.09c0.21,0.15,0.21,0.18,0.21,1.41c0,1.11,-0.03,1.14,-0.09,1.23c-0.03,0.03,-0.48,0.39,-1.02,0.75l-0.99,0.66l0,2.37c0,1.32,0,2.37,0.03,2.37l0.72,-0.48c0.69,-0.48,0.69,-0.51,0.87,-0.51c0.15,0,0.18,0.03,0.27,0.09c0.21,0.15,0.21,0.18,0.21,1.41c0,1.11,-0.03,1.14,-0.09,1.23c-0.03,0.03,-0.48,0.39,-1.02,0.75l-0.99,0.66l0,2.25c0,1.95,0,2.28,-0.06,2.37c-0.06,0.12,-0.12,0.21,-0.24,0.27c-0.27,0.12,-0.54,0.03,-0.69,-0.24c-0.06,-0.12,-0.06,-0.21,-0.06,-2.01c0,-1.05,0,-1.89,-0.03,-1.89l-0.72,0.48c-0.69,0.48,-0.69,0.48,-0.87,0.48c-0.15,0,-0.18,0,-0.27,-0.06c-0.21,-0.15,-0.21,-0.18,-0.21,-1.41c0,-1.11,0.03,-1.14,0.09,-1.23c0.03,-0.03,0.48,-0.39,1.02,-0.75l0.99,-0.66l0,-2.37c0,-1.32,0,-2.37,-0.03,-2.37l-0.72,0.48c-0.69,0.48,-0.69,0.48,-0.87,0.48c-0.15,0,-0.18,0,-0.27,-0.06c-0.21,-0.15,-0.21,-0.18,-0.21,-1.41c0,-1.11,0.03,-1.14,0.09,-1.23c0.03,-0.03,0.48,-0.39,1.02,-0.75l0.99,-0.66l0,-2.25c0,-2.13,0,-2.28,0.06,-2.4c0.06,-0.12,0.12,-0.18,0.27,-0.24z"
    },
    "accidentals.nat": {
        w: 5.411,
        h: 22.8,
        d: "M0.204,-11.4c0.24,-0.06,0.78,0,0.99,0.15c0.03,0.03,0.03,0.48,0,2.61c-0.03,1.44,-0.03,2.61,-0.03,2.61c0,0.03,0.75,-0.09,1.68,-0.24c0.96,-0.18,1.71,-0.27,1.74,-0.27c0.15,0.03,0.27,0.15,0.36,0.3l0.06,0.12l0.09,8.67c0.09,6.96,0.12,8.67,0.09,8.67c-0.03,0.03,-0.12,0.06,-0.21,0.09c-0.24,0.09,-0.72,0.09,-0.96,0c-0.09,-0.03,-0.18,-0.06,-0.21,-0.09c-0.03,-0.03,-0.03,-0.48,0,-2.61c0.03,-1.44,0.03,-2.61,0.03,-2.61c0,-0.03,-0.75,0.09,-1.68,0.24c-0.96,0.18,-1.71,0.27,-1.74,0.27c-0.15,-0.03,-0.27,-0.15,-0.36,-0.3l-0.06,-0.15l-0.09,-7.53c-0.06,-4.14,-0.09,-8.04,-0.12,-8.67l0,-1.11l0.15,-0.06c0.09,-0.03,0.21,-0.06,0.27,-0.09zm3.75,8.4c0,-0.33,0,-0.42,-0.03,-0.42c-0.12,0,-2.79,0.45,-2.79,0.48c-0.03,0,-0.09,6.3,-0.09,6.33c0.03,0,2.79,-0.45,2.82,-0.48c0,0,0.09,-4.53,0.09,-5.91z"
    },
    "accidentals.flat": {
        w: 6.75,
        h: 18.801,
        d: "M-0.36,-14.07c0.33,-0.06,0.87,0,1.08,0.15c0.06,0.03,0.06,0.36,-0.03,5.25c-0.06,2.85,-0.09,5.19,-0.09,5.19c0,0.03,0.12,-0.03,0.24,-0.12c0.63,-0.42,1.41,-0.66,2.19,-0.72c0.81,-0.03,1.47,0.21,2.04,0.78c0.57,0.54,0.87,1.26,0.93,2.04c0.03,0.57,-0.09,1.08,-0.36,1.62c-0.42,0.81,-1.02,1.38,-2.82,2.61c-1.14,0.78,-1.44,1.02,-1.8,1.44c-0.18,0.18,-0.39,0.39,-0.45,0.42c-0.27,0.18,-0.57,0.15,-0.81,-0.06c-0.06,-0.09,-0.12,-0.18,-0.15,-0.27c-0.03,-0.06,-0.09,-3.27,-0.18,-8.34c-0.09,-4.53,-0.15,-8.58,-0.18,-9.03l0,-0.78l0.12,-0.06c0.06,-0.03,0.18,-0.09,0.27,-0.12zm3.18,11.01c-0.21,-0.12,-0.54,-0.15,-0.81,-0.06c-0.54,0.15,-0.99,0.63,-1.17,1.26c-0.06,0.3,-0.12,2.88,-0.06,3.87c0.03,0.42,0.03,0.81,0.06,0.9l0.03,0.12l0.45,-0.39c0.63,-0.54,1.26,-1.17,1.56,-1.59c0.3,-0.42,0.6,-0.99,0.72,-1.41c0.18,-0.69,0.09,-1.47,-0.18,-2.07c-0.15,-0.3,-0.33,-0.51,-0.6,-0.63z"
    },
    "accidentals.halfflat": {
        w: 6.728,
        h: 18.801,
        d: "M4.83,-14.07c0.33,-0.06,0.87,0,1.08,0.15c0.06,0.03,0.06,0.6,-0.12,9.06c-0.09,5.55,-0.15,9.06,-0.18,9.12c-0.03,0.09,-0.09,0.18,-0.15,0.27c-0.24,0.21,-0.54,0.24,-0.81,0.06c-0.06,-0.03,-0.27,-0.24,-0.45,-0.42c-0.36,-0.42,-0.66,-0.66,-1.8,-1.44c-1.23,-0.84,-1.83,-1.32,-2.25,-1.77c-0.66,-0.78,-0.96,-1.56,-0.93,-2.46c0.09,-1.41,1.11,-2.58,2.4,-2.79c0.3,-0.06,0.84,-0.03,1.23,0.06c0.54,0.12,1.08,0.33,1.53,0.63c0.12,0.09,0.24,0.15,0.24,0.12c0,0,-0.12,-8.37,-0.18,-9.75l0,-0.66l0.12,-0.06c0.06,-0.03,0.18,-0.09,0.27,-0.12zm-1.65,10.95c-0.6,-0.18,-1.08,0.09,-1.38,0.69c-0.27,0.6,-0.36,1.38,-0.18,2.07c0.12,0.42,0.42,0.99,0.72,1.41c0.3,0.42,0.93,1.05,1.56,1.59l0.48,0.39l0,-0.12c0.03,-0.09,0.03,-0.48,0.06,-0.9c0.03,-0.57,0.03,-1.08,0,-2.22c-0.03,-1.62,-0.03,-1.62,-0.24,-2.07c-0.21,-0.42,-0.6,-0.75,-1.02,-0.84z"
    },
    "accidentals.dblflat": {
        w: 11.613,
        h: 18.804,
        d: "M-0.36,-14.07c0.33,-0.06,0.87,0,1.08,0.15c0.06,0.03,0.06,0.33,-0.03,4.89c-0.06,2.67,-0.09,5.01,-0.09,5.22l0,0.36l0.15,-0.15c0.36,-0.3,0.75,-0.51,1.2,-0.63c0.33,-0.09,0.96,-0.09,1.26,-0.03c0.27,0.09,0.63,0.27,0.87,0.45l0.21,0.15l0,-0.27c0,-0.15,-0.03,-2.43,-0.09,-5.1c-0.09,-4.56,-0.09,-4.86,-0.03,-4.89c0.15,-0.12,0.39,-0.15,0.72,-0.15c0.3,0,0.54,0.03,0.69,0.15c0.06,0.03,0.06,0.33,-0.03,4.95c-0.06,2.7,-0.09,5.04,-0.09,5.22l0.03,0.3l0.21,-0.15c0.69,-0.48,1.44,-0.69,2.28,-0.69c0.51,0,0.78,0.03,1.2,0.21c1.32,0.63,2.01,2.28,1.53,3.69c-0.21,0.57,-0.51,1.02,-1.05,1.56c-0.42,0.42,-0.81,0.72,-1.92,1.5c-1.26,0.87,-1.5,1.08,-1.86,1.5c-0.39,0.45,-0.54,0.54,-0.81,0.51c-0.18,0,-0.21,0,-0.33,-0.06l-0.21,-0.21l-0.06,-0.12l-0.03,-0.99c-0.03,-0.54,-0.03,-1.29,-0.06,-1.68l0,-0.69l-0.21,0.24c-0.36,0.42,-0.75,0.75,-1.8,1.62c-1.02,0.84,-1.2,0.99,-1.44,1.38c-0.36,0.51,-0.54,0.6,-0.9,0.51c-0.15,-0.03,-0.39,-0.27,-0.42,-0.42c-0.03,-0.06,-0.09,-3.27,-0.18,-8.34c-0.09,-4.53,-0.15,-8.58,-0.18,-9.03l0,-0.78l0.12,-0.06c0.06,-0.03,0.18,-0.09,0.27,-0.12zm2.52,10.98c-0.18,-0.09,-0.48,-0.12,-0.66,-0.06c-0.39,0.15,-0.69,0.54,-0.84,1.14c-0.06,0.24,-0.06,0.39,-0.09,1.74c-0.03,1.44,0,2.73,0.06,3.18l0.03,0.15l0.27,-0.27c0.93,-0.96,1.5,-1.95,1.74,-3.06c0.06,-0.27,0.06,-0.39,0.06,-0.96c0,-0.54,0,-0.69,-0.06,-0.93c-0.09,-0.51,-0.27,-0.81,-0.51,-0.93zm5.43,0c-0.18,-0.09,-0.51,-0.12,-0.72,-0.06c-0.54,0.12,-0.96,0.63,-1.17,1.26c-0.06,0.3,-0.12,2.88,-0.06,3.9c0.03,0.42,0.03,0.81,0.06,0.9l0.03,0.12l0.36,-0.3c0.42,-0.36,1.02,-0.96,1.29,-1.29c0.36,-0.45,0.66,-0.99,0.81,-1.41c0.42,-1.23,0.15,-2.76,-0.6,-3.12z"
    },
    "accidentals.dblsharp": {
        w: 7.961,
        h: 7.977,
        d: "M-0.186,-3.96c0.06,-0.03,0.12,-0.06,0.15,-0.06c0.09,0,2.76,0.27,2.79,0.3c0.12,0.03,0.15,0.12,0.15,0.51c0.06,0.96,0.24,1.59,0.57,2.1c0.06,0.09,0.15,0.21,0.18,0.24l0.09,0.06l0.09,-0.06c0.03,-0.03,0.12,-0.15,0.18,-0.24c0.33,-0.51,0.51,-1.14,0.57,-2.1c0,-0.39,0.03,-0.45,0.12,-0.51c0.03,0,0.66,-0.09,1.44,-0.15c1.47,-0.15,1.5,-0.15,1.56,-0.03c0.03,0.06,0,0.42,-0.09,1.44c-0.09,0.72,-0.15,1.35,-0.15,1.38c0,0.03,-0.03,0.09,-0.06,0.12c-0.06,0.06,-0.12,0.09,-0.51,0.09c-1.08,0.06,-1.8,0.3,-2.28,0.75l-0.12,0.09l0.09,0.09c0.12,0.15,0.39,0.33,0.63,0.45c0.42,0.18,0.96,0.27,1.68,0.33c0.39,0,0.45,0.03,0.51,0.09c0.03,0.03,0.06,0.09,0.06,0.12c0,0.03,0.06,0.66,0.15,1.38c0.09,1.02,0.12,1.38,0.09,1.44c-0.06,0.12,-0.09,0.12,-1.56,-0.03c-0.78,-0.06,-1.41,-0.15,-1.44,-0.15c-0.09,-0.06,-0.12,-0.12,-0.12,-0.54c-0.06,-0.93,-0.24,-1.56,-0.57,-2.07c-0.06,-0.09,-0.15,-0.21,-0.18,-0.24l-0.09,-0.06l-0.09,0.06c-0.03,0.03,-0.12,0.15,-0.18,0.24c-0.33,0.51,-0.51,1.14,-0.57,2.07c0,0.42,-0.03,0.48,-0.12,0.54c-0.03,0,-0.66,0.09,-1.44,0.15c-1.47,0.15,-1.5,0.15,-1.56,0.03c-0.03,-0.06,0,-0.42,0.09,-1.44c0.09,-0.72,0.15,-1.35,0.15,-1.38c0,-0.03,0.03,-0.09,0.06,-0.12c0.06,-0.06,0.12,-0.09,0.51,-0.09c0.72,-0.06,1.26,-0.15,1.68,-0.33c0.24,-0.12,0.51,-0.3,0.63,-0.45l0.09,-0.09l-0.12,-0.09c-0.48,-0.45,-1.2,-0.69,-2.28,-0.75c-0.39,0,-0.45,-0.03,-0.51,-0.09c-0.03,-0.03,-0.06,-0.09,-0.06,-0.12c0,-0.03,-0.06,-0.63,-0.12,-1.38c-0.09,-0.72,-0.15,-1.35,-0.15,-1.38z"
    },
    "dots.dot": {
        w: 3.45,
        h: 3.45,
        d: "M1.32,-1.68c0.09,-0.03,0.27,-0.06,0.39,-0.06c0.96,0,1.74,0.78,1.74,1.71c0,0.96,-0.78,1.74,-1.71,1.74c-0.96,0,-1.74,-0.78,-1.74,-1.71c0,-0.78,0.54,-1.5,1.32,-1.68z"
    },
    "noteheads.dbl": {
        w: 16.83,
        h: 8.145,
        d: "M-0.69,-4.02c0.18,-0.09,0.36,-0.09,0.54,0c0.18,0.09,0.24,0.15,0.33,0.3c0.06,0.15,0.06,0.18,0.06,1.41l0,1.23l0.12,-0.18c0.72,-1.26,2.64,-2.31,4.86,-2.64c0.81,-0.15,1.11,-0.15,2.13,-0.15c0.99,0,1.29,0,2.1,0.15c0.75,0.12,1.38,0.27,2.04,0.54c1.35,0.51,2.34,1.26,2.82,2.1l0.12,0.18l0,-1.23c0,-1.2,0,-1.26,0.06,-1.38c0.09,-0.18,0.15,-0.24,0.33,-0.33c0.18,-0.09,0.36,-0.09,0.54,0c0.18,0.09,0.24,0.15,0.33,0.3l0.06,0.15l0,3.54l0,3.54l-0.06,0.15c-0.09,0.18,-0.15,0.24,-0.33,0.33c-0.18,0.09,-0.36,0.09,-0.54,0c-0.18,-0.09,-0.24,-0.15,-0.33,-0.33c-0.06,-0.12,-0.06,-0.18,-0.06,-1.38l0,-1.23l-0.12,0.18c-0.48,0.84,-1.47,1.59,-2.82,2.1c-0.84,0.33,-1.71,0.54,-2.85,0.66c-0.45,0.06,-2.16,0.06,-2.61,0c-1.14,-0.12,-2.01,-0.33,-2.85,-0.66c-1.35,-0.51,-2.34,-1.26,-2.82,-2.1l-0.12,-0.18l0,1.23c0,1.23,0,1.26,-0.06,1.38c-0.09,0.18,-0.15,0.24,-0.33,0.33c-0.18,0.09,-0.36,0.09,-0.54,0c-0.18,-0.09,-0.24,-0.15,-0.33,-0.33l-0.06,-0.15l0,-3.54c0,-3.48,0,-3.54,0.06,-3.66c0.09,-0.18,0.15,-0.24,0.33,-0.33zm7.71,0.63c-0.36,-0.06,-0.9,-0.06,-1.14,0c-0.3,0.03,-0.66,0.24,-0.87,0.42c-0.6,0.54,-0.9,1.62,-0.75,2.82c0.12,0.93,0.51,1.68,1.11,2.31c0.75,0.72,1.83,1.2,2.85,1.26c1.05,0.06,1.83,-0.54,2.1,-1.65c0.21,-0.9,0.12,-1.95,-0.24,-2.82c-0.36,-0.81,-1.08,-1.53,-1.95,-1.95c-0.3,-0.15,-0.78,-0.3,-1.11,-0.39z"
    },
    "noteheads.whole": {
        w: 14.985,
        h: 8.097,
        d: "M6.51,-4.05c0.51,-0.03,2.01,0,2.52,0.03c1.41,0.18,2.64,0.51,3.72,1.08c1.2,0.63,1.95,1.41,2.19,2.31c0.09,0.33,0.09,0.9,0,1.23c-0.24,0.9,-0.99,1.68,-2.19,2.31c-1.08,0.57,-2.28,0.9,-3.75,1.08c-0.66,0.06,-2.31,0.06,-2.97,0c-1.47,-0.18,-2.67,-0.51,-3.75,-1.08c-1.2,-0.63,-1.95,-1.41,-2.19,-2.31c-0.09,-0.33,-0.09,-0.9,0,-1.23c0.24,-0.9,0.99,-1.68,2.19,-2.31c1.2,-0.63,2.61,-0.99,4.23,-1.11zm0.57,0.66c-0.87,-0.15,-1.53,0,-2.04,0.51c-0.15,0.15,-0.24,0.27,-0.33,0.48c-0.24,0.51,-0.36,1.08,-0.33,1.77c0.03,0.69,0.18,1.26,0.42,1.77c0.6,1.17,1.74,1.98,3.18,2.22c1.11,0.21,1.95,-0.15,2.34,-0.99c0.24,-0.51,0.36,-1.08,0.33,-1.8c-0.06,-1.11,-0.45,-2.04,-1.17,-2.76c-0.63,-0.63,-1.47,-1.05,-2.4,-1.2z"
    },
    "noteheads.half": {
        w: 10.37,
        h: 8.132,
        d: "M7.44,-4.05c0.06,-0.03,0.27,-0.03,0.48,-0.03c1.05,0,1.71,0.24,2.1,0.81c0.42,0.6,0.45,1.35,0.18,2.4c-0.42,1.59,-1.14,2.73,-2.16,3.39c-1.41,0.93,-3.18,1.44,-5.4,1.53c-1.17,0.03,-1.89,-0.21,-2.28,-0.81c-0.42,-0.6,-0.45,-1.35,-0.18,-2.4c0.42,-1.59,1.14,-2.73,2.16,-3.39c0.63,-0.42,1.23,-0.72,1.98,-0.96c0.9,-0.3,1.65,-0.42,3.12,-0.54zm1.29,0.87c-0.27,-0.09,-0.63,-0.12,-0.9,-0.03c-0.72,0.24,-1.53,0.69,-3.27,1.8c-2.34,1.5,-3.3,2.25,-3.57,2.79c-0.36,0.72,-0.06,1.5,0.66,1.77c0.24,0.12,0.69,0.09,0.99,0c0.84,-0.3,1.92,-0.93,4.14,-2.37c1.62,-1.08,2.37,-1.71,2.61,-2.19c0.36,-0.72,0.06,-1.5,-0.66,-1.77z"
    },
    "noteheads.quarter": {
        w: 9.81,
        h: 8.094,
        d: "M6.09,-4.05c0.36,-0.03,1.2,0,1.53,0.06c1.17,0.24,1.89,0.84,2.16,1.83c0.06,0.18,0.06,0.3,0.06,0.66c0,0.45,0,0.63,-0.15,1.08c-0.66,2.04,-3.06,3.93,-5.52,4.38c-0.54,0.09,-1.44,0.09,-1.83,0.03c-1.23,-0.27,-1.98,-0.87,-2.25,-1.86c-0.06,-0.18,-0.06,-0.3,-0.06,-0.66c0,-0.45,0,-0.63,0.15,-1.08c0.24,-0.78,0.75,-1.53,1.44,-2.22c1.2,-1.2,2.85,-2.01,4.47,-2.22z"
    },
    "scripts.ufermata": {
        w: 19.748,
        h: 11.289,
        d: "M-0.75,-10.77c0.12,0,0.45,-0.03,0.69,-0.03c2.91,-0.03,5.55,1.53,7.41,4.35c1.17,1.71,1.95,3.72,2.43,6.03c0.12,0.51,0.12,0.57,0.03,0.69c-0.12,0.21,-0.48,0.27,-0.69,0.12c-0.12,-0.09,-0.18,-0.24,-0.27,-0.69c-0.78,-3.63,-3.42,-6.54,-6.78,-7.38c-0.78,-0.21,-1.2,-0.24,-2.07,-0.24c-0.63,0,-0.84,0,-1.2,0.06c-1.83,0.27,-3.42,1.08,-4.8,2.37c-1.41,1.35,-2.4,3.21,-2.85,5.19c-0.09,0.45,-0.15,0.6,-0.27,0.69c-0.21,0.15,-0.57,0.09,-0.69,-0.12c-0.09,-0.12,-0.09,-0.18,0.03,-0.69c0.33,-1.62,0.78,-3,1.47,-4.38c1.77,-3.54,4.44,-5.67,7.56,-5.97zm0.33,7.47c1.38,-0.3,2.58,0.9,2.31,2.25c-0.15,0.72,-0.78,1.35,-1.47,1.5c-1.38,0.27,-2.58,-0.93,-2.31,-2.31c0.15,-0.69,0.78,-1.29,1.47,-1.44z"
    },
    "scripts.dfermata": {
        w: 19.744,
        h: 11.274,
        d: "M-9.63,-0.42c0.15,-0.09,0.36,-0.06,0.51,0.03c0.12,0.09,0.18,0.24,0.27,0.66c0.78,3.66,3.42,6.57,6.78,7.41c0.78,0.21,1.2,0.24,2.07,0.24c0.63,0,0.84,0,1.2,-0.06c1.83,-0.27,3.42,-1.08,4.8,-2.37c1.41,-1.35,2.4,-3.21,2.85,-5.22c0.09,-0.42,0.15,-0.57,0.27,-0.66c0.21,-0.15,0.57,-0.09,0.69,0.12c0.09,0.12,0.09,0.18,-0.03,0.69c-0.33,1.62,-0.78,3,-1.47,4.38c-1.92,3.84,-4.89,6,-8.31,6c-3.42,0,-6.39,-2.16,-8.31,-6c-0.48,-0.96,-0.84,-1.92,-1.14,-2.97c-0.18,-0.69,-0.42,-1.74,-0.42,-1.92c0,-0.12,0.09,-0.27,0.24,-0.33zm9.21,0c1.2,-0.27,2.34,0.63,2.34,1.86c0,0.9,-0.66,1.68,-1.5,1.89c-1.38,0.27,-2.58,-0.93,-2.31,-2.31c0.15,-0.69,0.78,-1.29,1.47,-1.44z"
    },
    "scripts.sforzato": {
        w: 13.5,
        h: 7.5,
        d: "M-6.45,-3.69c0.06,-0.03,0.15,-0.06,0.18,-0.06c0.06,0,2.85,0.72,6.24,1.59l6.33,1.65c0.33,0.06,0.45,0.21,0.45,0.51c0,0.3,-0.12,0.45,-0.45,0.51l-6.33,1.65c-3.39,0.87,-6.18,1.59,-6.21,1.59c-0.21,0,-0.48,-0.24,-0.51,-0.45c0,-0.15,0.06,-0.36,0.18,-0.45c0.09,-0.06,0.87,-0.27,3.84,-1.05c2.04,-0.54,3.84,-0.99,4.02,-1.02c0.15,-0.06,1.14,-0.24,2.22,-0.42c1.05,-0.18,1.92,-0.36,1.92,-0.36c0,0,-0.87,-0.18,-1.92,-0.36c-1.08,-0.18,-2.07,-0.36,-2.22,-0.42c-0.18,-0.03,-1.98,-0.48,-4.02,-1.02c-2.97,-0.78,-3.75,-0.99,-3.84,-1.05c-0.12,-0.09,-0.18,-0.3,-0.18,-0.45c0.03,-0.15,0.15,-0.3,0.3,-0.39z"
    },
    "scripts.staccato": {
        w: 2.989,
        h: 3.004,
        d: "M-0.36,-1.47c0.93,-0.21,1.86,0.51,1.86,1.47c0,0.93,-0.87,1.65,-1.8,1.47c-0.54,-0.12,-1.02,-0.57,-1.14,-1.08c-0.21,-0.81,0.27,-1.65,1.08,-1.86z"
    },
    "scripts.tenuto": {
        w: 8.985,
        h: 1.08,
        d: "M-4.2,-0.48l0.12,-0.06l4.08,0l4.08,0l0.12,0.06c0.39,0.21,0.39,0.75,0,0.96l-0.12,0.06l-4.08,0l-4.08,0l-0.12,-0.06c-0.39,-0.21,-0.39,-0.75,0,-0.96z"
    },
    "scripts.umarcato": {
        w: 7.5,
        h: 8.245,
        d: "M-0.15,-8.19c0.15,-0.12,0.36,-0.03,0.45,0.15c0.21,0.42,3.45,7.65,3.45,7.71c0,0.12,-0.12,0.27,-0.21,0.3c-0.03,0.03,-0.51,0.03,-1.14,0.03c-1.05,0,-1.08,0,-1.17,-0.06c-0.09,-0.06,-0.24,-0.36,-1.17,-2.4c-0.57,-1.29,-1.05,-2.34,-1.08,-2.34c0,-0.03,-0.51,1.02,-1.08,2.34c-0.93,2.07,-1.08,2.34,-1.14,2.4c-0.06,0.03,-0.15,0.06,-0.18,0.06c-0.15,0,-0.33,-0.18,-0.33,-0.33c0,-0.06,3.24,-7.32,3.45,-7.71c0.03,-0.06,0.09,-0.15,0.15,-0.15z"
    },
    "scripts.dmarcato": {
        w: 7.5,
        h: 8.25,
        d: "M-3.57,0.03c0.03,0,0.57,-0.03,1.17,-0.03c1.05,0,1.08,0,1.17,0.06c0.09,0.06,0.24,0.36,1.17,2.4c0.57,1.29,1.05,2.34,1.08,2.34c0,0.03,0.51,-1.02,1.08,-2.34c0.93,-2.07,1.08,-2.34,1.14,-2.4c0.06,-0.03,0.15,-0.06,0.18,-0.06c0.15,0,0.33,0.18,0.33,0.33c0,0.09,-3.45,7.74,-3.54,7.83c-0.12,0.12,-0.3,0.12,-0.42,0c-0.09,-0.09,-3.54,-7.74,-3.54,-7.83c0,-0.09,0.12,-0.27,0.18,-0.3z"
    },
    "scripts.stopped": {
        w: 8.295,
        h: 8.295,
        d: "M-0.27,-4.08c0.18,-0.09,0.36,-0.09,0.54,0c0.18,0.09,0.24,0.15,0.33,0.3l0.06,0.15l0,1.5l0,1.47l1.47,0l1.5,0l0.15,0.06c0.15,0.09,0.21,0.15,0.3,0.33c0.09,0.18,0.09,0.36,0,0.54c-0.09,0.18,-0.15,0.24,-0.33,0.33c-0.12,0.06,-0.18,0.06,-1.62,0.06l-1.47,0l0,1.47l0,1.47l-0.06,0.15c-0.09,0.18,-0.15,0.24,-0.33,0.33c-0.18,0.09,-0.36,0.09,-0.54,0c-0.18,-0.09,-0.24,-0.15,-0.33,-0.33l-0.06,-0.15l0,-1.47l0,-1.47l-1.47,0c-1.44,0,-1.5,0,-1.62,-0.06c-0.18,-0.09,-0.24,-0.15,-0.33,-0.33c-0.09,-0.18,-0.09,-0.36,0,-0.54c0.09,-0.18,0.15,-0.24,0.33,-0.33l0.15,-0.06l1.47,0l1.47,0l0,-1.47c0,-1.44,0,-1.5,0.06,-1.62c0.09,-0.18,0.15,-0.24,0.33,-0.33z"
    },
    "scripts.upbow": {
        w: 9.73,
        h: 15.608,
        d: "M-4.65,-15.54c0.12,-0.09,0.36,-0.06,0.48,0.03c0.03,0.03,0.09,0.09,0.12,0.15c0.03,0.06,0.66,2.13,1.41,4.62c1.35,4.41,1.38,4.56,2.01,6.96l0.63,2.46l0.63,-2.46c0.63,-2.4,0.66,-2.55,2.01,-6.96c0.75,-2.49,1.38,-4.56,1.41,-4.62c0.06,-0.15,0.18,-0.21,0.36,-0.24c0.15,0,0.3,0.06,0.39,0.18c0.15,0.21,0.24,-0.18,-2.1,7.56c-1.2,3.96,-2.22,7.32,-2.25,7.41c0,0.12,-0.06,0.27,-0.09,0.3c-0.12,0.21,-0.6,0.21,-0.72,0c-0.03,-0.03,-0.09,-0.18,-0.09,-0.3c-0.03,-0.09,-1.05,-3.45,-2.25,-7.41c-2.34,-7.74,-2.25,-7.35,-2.1,-7.56c0.03,-0.03,0.09,-0.09,0.15,-0.12z"
    },
    "scripts.downbow": {
        w: 11.22,
        h: 9.992,
        d: "M-5.55,-9.93l0.09,-0.06l5.46,0l5.46,0l0.09,0.06l0.06,0.09l0,4.77c0,5.28,0,4.89,-0.18,5.01c-0.18,0.12,-0.42,0.06,-0.54,-0.12c-0.06,-0.09,-0.06,-0.18,-0.06,-2.97l0,-2.85l-4.83,0l-4.83,0l0,2.85c0,2.79,0,2.88,-0.06,2.97c-0.15,0.24,-0.51,0.24,-0.66,0c-0.06,-0.09,-0.06,-0.21,-0.06,-4.89l0,-4.77z"
    },
    "scripts.turn": {
        w: 16.366,
        h: 7.893,
        d: "M-4.77,-3.9c0.36,-0.06,1.05,-0.06,1.44,0.03c0.78,0.15,1.5,0.51,2.34,1.14c0.6,0.45,1.05,0.87,2.22,2.01c1.11,1.08,1.62,1.5,2.22,1.86c0.6,0.36,1.32,0.57,1.92,0.57c0.9,0,1.71,-0.57,1.89,-1.35c0.24,-0.93,-0.39,-1.89,-1.35,-2.1l-0.15,-0.06l-0.09,0.15c-0.03,0.09,-0.15,0.24,-0.24,0.33c-0.72,0.72,-2.04,0.54,-2.49,-0.36c-0.48,-0.93,0.03,-1.86,1.17,-2.19c0.3,-0.09,1.02,-0.09,1.35,0c0.99,0.27,1.74,0.87,2.25,1.83c0.69,1.41,0.63,3,-0.21,4.26c-0.21,0.3,-0.69,0.81,-0.99,1.02c-0.3,0.21,-0.84,0.45,-1.17,0.54c-1.23,0.36,-2.49,0.15,-3.72,-0.6c-0.75,-0.48,-1.41,-1.02,-2.85,-2.46c-1.11,-1.08,-1.62,-1.5,-2.22,-1.86c-0.6,-0.36,-1.32,-0.57,-1.92,-0.57c-0.9,0,-1.71,0.57,-1.89,1.35c-0.24,0.93,0.39,1.89,1.35,2.1l0.15,0.06l0.09,-0.15c0.03,-0.09,0.15,-0.24,0.24,-0.33c0.72,-0.72,2.04,-0.54,2.49,0.36c0.48,0.93,-0.03,1.86,-1.17,2.19c-0.3,0.09,-1.02,0.09,-1.35,0c-0.99,-0.27,-1.74,-0.87,-2.25,-1.83c-0.69,-1.41,-0.63,-3,0.21,-4.26c0.21,-0.3,0.69,-0.81,0.99,-1.02c0.48,-0.33,1.11,-0.57,1.74,-0.66z"
    },
    "scripts.trill": {
        w: 17.963,
        h: 16.49,
        d: "M-0.51,-16.02c0.12,-0.09,0.21,-0.18,0.21,-0.18l-0.81,4.02l-0.81,4.02c0.03,0,0.51,-0.27,1.08,-0.6c0.6,-0.3,1.14,-0.63,1.26,-0.66c1.14,-0.54,2.31,-0.6,3.09,-0.18c0.27,0.15,0.54,0.36,0.6,0.51l0.06,0.12l0.21,-0.21c0.9,-0.81,2.22,-0.99,3.12,-0.42c0.6,0.42,0.9,1.14,0.78,2.07c-0.15,1.29,-1.05,2.31,-1.95,2.25c-0.48,-0.03,-0.78,-0.3,-0.96,-0.81c-0.09,-0.27,-0.09,-0.9,-0.03,-1.2c0.21,-0.75,0.81,-1.23,1.59,-1.32l0.24,-0.03l-0.09,-0.12c-0.51,-0.66,-1.62,-0.63,-2.31,0.03c-0.39,0.42,-0.3,0.09,-1.23,4.77l-0.81,4.14c-0.03,0,-0.12,-0.03,-0.21,-0.09c-0.33,-0.15,-0.54,-0.18,-0.99,-0.18c-0.42,0,-0.66,0.03,-1.05,0.18c-0.12,0.06,-0.21,0.09,-0.21,0.09c0,-0.03,0.36,-1.86,0.81,-4.11c0.9,-4.47,0.87,-4.26,0.69,-4.53c-0.21,-0.36,-0.66,-0.51,-1.17,-0.36c-0.15,0.06,-2.22,1.14,-2.58,1.38c-0.12,0.09,-0.12,0.09,-0.21,0.6l-0.09,0.51l0.21,0.24c0.63,0.75,1.02,1.47,1.2,2.19c0.06,0.27,0.06,0.36,0.06,0.81c0,0.42,0,0.54,-0.06,0.78c-0.15,0.54,-0.33,0.93,-0.63,1.35c-0.18,0.24,-0.57,0.63,-0.81,0.78c-0.24,0.15,-0.63,0.36,-0.84,0.42c-0.27,0.06,-0.66,0.06,-0.87,0.03c-0.81,-0.18,-1.32,-1.05,-1.38,-2.46c-0.03,-0.6,0.03,-0.99,0.33,-2.46c0.21,-1.08,0.24,-1.32,0.21,-1.29c-1.2,0.48,-2.4,0.75,-3.21,0.72c-0.69,-0.06,-1.17,-0.3,-1.41,-0.72c-0.39,-0.75,-0.12,-1.8,0.66,-2.46c0.24,-0.18,0.69,-0.42,1.02,-0.51c0.69,-0.18,1.53,-0.15,2.31,0.09c0.3,0.09,0.75,0.3,0.99,0.45c0.12,0.09,0.15,0.09,0.15,0.03c0.03,-0.03,0.33,-1.59,0.72,-3.45c0.36,-1.86,0.66,-3.42,0.69,-3.45c0,-0.03,0.03,-0.03,0.21,0.03c0.21,0.06,0.27,0.06,0.48,0.06c0.42,-0.03,0.78,-0.18,1.26,-0.48c0.15,-0.12,0.36,-0.27,0.48,-0.39zm-5.73,7.68c-0.27,-0.03,-0.96,-0.06,-1.2,-0.03c-0.81,0.12,-1.35,0.57,-1.5,1.2c-0.18,0.66,0.12,1.14,0.75,1.29c0.66,0.12,1.92,-0.12,3.18,-0.66l0.33,-0.15l0.09,-0.39c0.06,-0.21,0.09,-0.42,0.09,-0.45c0,-0.03,-0.45,-0.3,-0.75,-0.45c-0.27,-0.15,-0.66,-0.27,-0.99,-0.36zm4.29,3.63c-0.24,-0.39,-0.51,-0.75,-0.51,-0.69c-0.06,0.12,-0.39,1.92,-0.45,2.28c-0.09,0.54,-0.12,1.14,-0.06,1.38c0.06,0.42,0.21,0.6,0.51,0.57c0.39,-0.06,0.75,-0.48,0.93,-1.14c0.09,-0.33,0.09,-1.05,0,-1.38c-0.09,-0.39,-0.24,-0.69,-0.42,-1.02z"
    },
    "scripts.segno": {
        w: 15,
        h: 22.504,
        d: "M-3.72,-11.22c0.78,-0.09,1.59,0.03,2.31,0.42c1.2,0.6,2.01,1.71,2.31,3.09c0.09,0.42,0.09,1.2,0.03,1.5c-0.15,0.45,-0.39,0.81,-0.66,0.93c-0.33,0.18,-0.84,0.21,-1.23,0.15c-0.81,-0.18,-1.32,-0.93,-1.26,-1.89c0.03,-0.36,0.09,-0.57,0.24,-0.9c0.15,-0.33,0.45,-0.6,0.72,-0.75c0.12,-0.06,0.18,-0.09,0.18,-0.12c0,-0.03,-0.03,-0.15,-0.09,-0.24c-0.18,-0.45,-0.54,-0.87,-0.96,-1.08c-1.11,-0.57,-2.34,-0.18,-2.88,0.9c-0.24,0.51,-0.33,1.11,-0.24,1.83c0.27,1.92,1.5,3.54,3.93,5.13c0.48,0.33,1.26,0.78,1.29,0.78c0.03,0,1.35,-2.19,2.94,-4.89l2.88,-4.89l0.84,0l0.87,0l-0.03,0.06c-0.15,0.21,-6.15,10.41,-6.15,10.44c0,0,0.21,0.15,0.48,0.27c2.61,1.47,4.35,3.03,5.13,4.65c1.14,2.34,0.51,5.07,-1.44,6.39c-0.66,0.42,-1.32,0.63,-2.13,0.69c-2.01,0.09,-3.81,-1.41,-4.26,-3.54c-0.09,-0.42,-0.09,-1.2,-0.03,-1.5c0.15,-0.45,0.39,-0.81,0.66,-0.93c0.33,-0.18,0.84,-0.21,1.23,-0.15c0.81,0.18,1.32,0.93,1.26,1.89c-0.03,0.36,-0.09,0.57,-0.24,0.9c-0.15,0.33,-0.45,0.6,-0.72,0.75c-0.12,0.06,-0.18,0.09,-0.18,0.12c0,0.03,0.03,0.15,0.09,0.24c0.18,0.45,0.54,0.87,0.96,1.08c1.11,0.57,2.34,0.18,2.88,-0.9c0.24,-0.51,0.33,-1.11,0.24,-1.83c-0.27,-1.92,-1.5,-3.54,-3.93,-5.13c-0.48,-0.33,-1.26,-0.78,-1.29,-0.78c-0.03,0,-1.35,2.19,-2.91,4.89l-2.88,4.89l-0.87,0l-0.87,0l0.03,-0.06c0.15,-0.21,6.15,-10.41,6.15,-10.44c0,0,-0.21,-0.15,-0.48,-0.3c-2.61,-1.44,-4.35,-3,-5.13,-4.62c-0.9,-1.89,-0.72,-4.02,0.48,-5.52c0.69,-0.84,1.68,-1.41,2.73,-1.53zm8.76,9.09c0.03,-0.03,0.15,-0.03,0.27,-0.03c0.33,0.03,0.57,0.18,0.72,0.48c0.09,0.18,0.09,0.57,0,0.75c-0.09,0.18,-0.21,0.3,-0.36,0.39c-0.15,0.06,-0.21,0.06,-0.39,0.06c-0.21,0,-0.27,0,-0.39,-0.06c-0.3,-0.15,-0.48,-0.45,-0.48,-0.75c0,-0.39,0.24,-0.72,0.63,-0.84zm-10.53,2.61c0.03,-0.03,0.15,-0.03,0.27,-0.03c0.33,0.03,0.57,0.18,0.72,0.48c0.09,0.18,0.09,0.57,0,0.75c-0.09,0.18,-0.21,0.3,-0.36,0.39c-0.15,0.06,-0.21,0.06,-0.39,0.06c-0.21,0,-0.27,0,-0.39,-0.06c-0.3,-0.15,-0.48,-0.45,-0.48,-0.75c0,-0.39,0.24,-0.72,0.63,-0.84z"
    },
    "scripts.coda": {
        w: 16.035,
        h: 21.062,
        d: "M-0.21,-10.47c0.18,-0.12,0.42,-0.06,0.54,0.12c0.06,0.09,0.06,0.18,0.06,1.5l0,1.38l0.18,0c0.39,0.06,0.96,0.24,1.38,0.48c1.68,0.93,2.82,3.24,3.03,6.12c0.03,0.24,0.03,0.45,0.03,0.45c0,0.03,0.6,0.03,1.35,0.03c1.5,0,1.47,0,1.59,0.18c0.09,0.12,0.09,0.3,0,0.42c-0.12,0.18,-0.09,0.18,-1.59,0.18c-0.75,0,-1.35,0,-1.35,0.03c0,0,0,0.21,-0.03,0.42c-0.24,3.15,-1.53,5.58,-3.45,6.36c-0.27,0.12,-0.72,0.24,-0.96,0.27l-0.18,0l0,1.38c0,1.32,0,1.41,-0.06,1.5c-0.15,0.24,-0.51,0.24,-0.66,0c-0.06,-0.09,-0.06,-0.18,-0.06,-1.5l0,-1.38l-0.18,0c-0.39,-0.06,-0.96,-0.24,-1.38,-0.48c-1.68,-0.93,-2.82,-3.24,-3.03,-6.15c-0.03,-0.21,-0.03,-0.42,-0.03,-0.42c0,-0.03,-0.6,-0.03,-1.35,-0.03c-1.5,0,-1.47,0,-1.59,-0.18c-0.09,-0.12,-0.09,-0.3,0,-0.42c0.12,-0.18,0.09,-0.18,1.59,-0.18c0.75,0,1.35,0,1.35,-0.03c0,0,0,-0.21,0.03,-0.45c0.24,-3.12,1.53,-5.55,3.45,-6.33c0.27,-0.12,0.72,-0.24,0.96,-0.27l0.18,0l0,-1.38c0,-1.53,0,-1.5,0.18,-1.62zm-0.18,6.93c0,-2.97,0,-3.15,-0.06,-3.15c-0.09,0,-0.51,0.15,-0.66,0.21c-0.87,0.51,-1.38,1.62,-1.56,3.51c-0.06,0.54,-0.12,1.59,-0.12,2.16l0,0.42l1.2,0l1.2,0l0,-3.15zm1.17,-3.06c-0.09,-0.03,-0.21,-0.06,-0.27,-0.09l-0.12,0l0,3.15l0,3.15l1.2,0l1.2,0l0,-0.81c-0.06,-2.4,-0.33,-3.69,-0.93,-4.59c-0.27,-0.39,-0.66,-0.69,-1.08,-0.81zm-1.17,10.14l0,-3.15l-1.2,0l-1.2,0l0,0.81c0.03,0.96,0.06,1.47,0.15,2.13c0.24,2.04,0.96,3.12,2.13,3.36l0.12,0l0,-3.15zm3.18,-2.34l0,-0.81l-1.2,0l-1.2,0l0,3.15l0,3.15l0.12,0c1.17,-0.24,1.89,-1.32,2.13,-3.36c0.09,-0.66,0.12,-1.17,0.15,-2.13z"
    },
    "scripts.comma": {
        w: 3.042,
        h: 9.237,
        d: "M1.14,-4.62c0.3,-0.12,0.69,-0.03,0.93,0.15c0.12,0.12,0.36,0.45,0.51,0.78c0.9,1.77,0.54,4.05,-1.08,6.75c-0.36,0.63,-0.87,1.38,-0.96,1.44c-0.18,0.12,-0.42,0.06,-0.54,-0.12c-0.09,-0.18,-0.09,-0.3,0.12,-0.6c0.96,-1.44,1.44,-2.97,1.38,-4.35c-0.06,-0.93,-0.3,-1.68,-0.78,-2.46c-0.27,-0.39,-0.33,-0.63,-0.24,-0.96c0.09,-0.27,0.36,-0.54,0.66,-0.63z"
    },
    "scripts.roll": {
        w: 10.817,
        h: 6.125,
        d: "M1.95,-6c0.21,-0.09,0.36,-0.09,0.57,0c0.39,0.15,0.63,0.39,1.47,1.35c0.66,0.75,0.78,0.87,1.08,1.05c0.75,0.45,1.65,0.42,2.4,-0.06c0.12,-0.09,0.27,-0.27,0.54,-0.6c0.42,-0.54,0.51,-0.63,0.69,-0.63c0.09,0,0.3,0.12,0.36,0.21c0.09,0.12,0.12,0.3,0.03,0.42c-0.06,0.12,-3.15,3.9,-3.3,4.08c-0.06,0.06,-0.18,0.12,-0.27,0.18c-0.27,0.12,-0.6,0.06,-0.99,-0.27c-0.27,-0.21,-0.42,-0.39,-1.08,-1.14c-0.63,-0.72,-0.81,-0.9,-1.17,-1.08c-0.36,-0.18,-0.57,-0.21,-0.99,-0.21c-0.39,0,-0.63,0.03,-0.93,0.18c-0.36,0.15,-0.51,0.27,-0.9,0.81c-0.24,0.27,-0.45,0.51,-0.48,0.54c-0.12,0.09,-0.27,0.06,-0.39,0c-0.24,-0.15,-0.33,-0.39,-0.21,-0.6c0.09,-0.12,3.18,-3.87,3.33,-4.02c0.06,-0.06,0.18,-0.15,0.24,-0.21z"
    },
    "scripts.prall": {
        w: 15.011,
        h: 7.5,
        d: "M-4.38,-3.69c0.06,-0.03,0.18,-0.06,0.24,-0.06c0.3,0,0.27,-0.03,1.89,1.95l1.53,1.83c0.03,0,0.57,-0.84,1.23,-1.83c1.14,-1.68,1.23,-1.83,1.35,-1.89c0.06,-0.03,0.18,-0.06,0.24,-0.06c0.3,0,0.27,-0.03,1.89,1.95l1.53,1.83l0.48,-0.69c0.51,-0.78,0.54,-0.84,0.69,-0.9c0.42,-0.18,0.87,0.15,0.81,0.6c-0.03,0.12,-0.3,0.51,-1.5,2.37c-1.38,2.07,-1.5,2.22,-1.62,2.28c-0.06,0.03,-0.18,0.06,-0.24,0.06c-0.3,0,-0.27,0.03,-1.89,-1.95l-1.53,-1.83c-0.03,0,-0.57,0.84,-1.23,1.83c-1.14,1.68,-1.23,1.83,-1.35,1.89c-0.06,0.03,-0.18,0.06,-0.24,0.06c-0.3,0,-0.27,0.03,-1.89,-1.95l-1.53,-1.83l-0.48,0.69c-0.51,0.78,-0.54,0.84,-0.69,0.9c-0.42,0.18,-0.87,-0.15,-0.81,-0.6c0.03,-0.12,0.3,-0.51,1.5,-2.37c1.38,-2.07,1.5,-2.22,1.62,-2.28z"
    },
    "scripts.mordent": {
        w: 15.011,
        h: 10.012,
        d: "M-0.21,-4.95c0.27,-0.15,0.63,0,0.75,0.27c0.06,0.12,0.06,0.24,0.06,1.44l0,1.29l0.57,-0.84c0.51,-0.75,0.57,-0.84,0.69,-0.9c0.06,-0.03,0.18,-0.06,0.24,-0.06c0.3,0,0.27,-0.03,1.89,1.95l1.53,1.83l0.48,-0.69c0.51,-0.78,0.54,-0.84,0.69,-0.9c0.42,-0.18,0.87,0.15,0.81,0.6c-0.03,0.12,-0.3,0.51,-1.5,2.37c-1.38,2.07,-1.5,2.22,-1.62,2.28c-0.06,0.03,-0.18,0.06,-0.24,0.06c-0.3,0,-0.27,0.03,-1.83,-1.89c-0.81,-0.99,-1.5,-1.8,-1.53,-1.86c-0.06,-0.03,-0.06,-0.03,-0.12,0.03c-0.06,0.06,-0.06,0.15,-0.06,2.28c0,1.95,0,2.25,-0.06,2.34c-0.18,0.45,-0.81,0.48,-1.05,0.03c-0.03,-0.06,-0.06,-0.24,-0.06,-1.41l0,-1.35l-0.57,0.84c-0.54,0.78,-0.6,0.87,-0.72,0.93c-0.06,0.03,-0.18,0.06,-0.24,0.06c-0.3,0,-0.27,0.03,-1.89,-1.95l-1.53,-1.83l-0.48,0.69c-0.51,0.78,-0.54,0.84,-0.69,0.9c-0.42,0.18,-0.87,-0.15,-0.81,-0.6c0.03,-0.12,0.3,-0.51,1.5,-2.37c1.38,-2.07,1.5,-2.22,1.62,-2.28c0.06,-0.03,0.18,-0.06,0.24,-0.06c0.3,0,0.27,-0.03,1.89,1.95l1.53,1.83c0.03,0,0.06,-0.06,0.09,-0.09c0.06,-0.12,0.06,-0.15,0.06,-2.28c0,-1.92,0,-2.22,0.06,-2.31c0.06,-0.15,0.15,-0.24,0.3,-0.3z"
    },
    "flags.u8th": {
        w: 6.692,
        h: 22.59,
        d: "M-0.42,3.75l0,-3.75l0.21,0l0.21,0l0,0.18c0,0.3,0.06,0.84,0.12,1.23c0.24,1.53,0.9,3.12,2.13,5.16l0.99,1.59c0.87,1.44,1.38,2.34,1.77,3.09c0.81,1.68,1.2,3.06,1.26,4.53c0.03,1.53,-0.21,3.27,-0.75,5.01c-0.21,0.69,-0.51,1.5,-0.6,1.59c-0.09,0.12,-0.27,0.21,-0.42,0.21c-0.15,0,-0.42,-0.12,-0.51,-0.21c-0.15,-0.18,-0.18,-0.42,-0.09,-0.66c0.15,-0.33,0.45,-1.2,0.57,-1.62c0.42,-1.38,0.6,-2.58,0.6,-3.9c0,-0.66,0,-0.81,-0.06,-1.11c-0.39,-2.07,-1.8,-4.26,-4.59,-7.14l-0.42,-0.45l-0.21,0l-0.21,0l0,-3.75z"
    },
    "flags.u16th": {
        w: 6.693,
        h: 26.337,
        d: "M-0.42,7.5l0,-7.5l0.21,0l0.21,0l0,0.39c0.06,1.08,0.39,2.19,0.99,3.39c0.45,0.9,0.87,1.59,1.95,3.12c1.29,1.86,1.77,2.64,2.22,3.57c0.45,0.93,0.72,1.8,0.87,2.64c0.06,0.51,0.06,1.5,0,1.92c-0.12,0.6,-0.3,1.2,-0.54,1.71l-0.09,0.24l0.18,0.45c0.51,1.2,0.72,2.22,0.69,3.42c-0.06,1.53,-0.39,3.03,-0.99,4.53c-0.3,0.75,-0.36,0.81,-0.57,0.9c-0.15,0.09,-0.33,0.06,-0.48,0c-0.18,-0.09,-0.27,-0.18,-0.33,-0.33c-0.09,-0.18,-0.06,-0.3,0.12,-0.75c0.66,-1.41,1.02,-2.88,1.08,-4.32c0,-0.6,-0.03,-1.05,-0.18,-1.59c-0.3,-1.2,-0.99,-2.4,-2.25,-3.87c-0.42,-0.48,-1.53,-1.62,-2.19,-2.22l-0.45,-0.42l-0.03,1.11l0,1.11l-0.21,0l-0.21,0l0,-7.5zm1.65,0.09c-0.3,-0.3,-0.69,-0.72,-0.9,-0.87l-0.33,-0.33l0,0.15c0,0.3,0.06,0.81,0.15,1.26c0.27,1.29,0.87,2.61,2.04,4.29c0.15,0.24,0.6,0.87,0.96,1.38l1.08,1.53l0.42,0.63c0.03,0,0.12,-0.36,0.21,-0.72c0.06,-0.33,0.06,-1.2,0,-1.62c-0.33,-1.71,-1.44,-3.48,-3.63,-5.7z"
    },
    "flags.u32nd": {
        w: 6.697,
        h: 32.145,
        d: "M-0.42,11.247l0,-11.25l0.21,0l0.21,0l0,0.36c0.09,1.68,0.69,3.27,2.07,5.46l0.87,1.35c1.02,1.62,1.47,2.37,1.86,3.18c0.48,1.02,0.78,1.92,0.93,2.88c0.06,0.48,0.06,1.5,0,1.89c-0.09,0.42,-0.21,0.87,-0.36,1.26l-0.12,0.3l0.15,0.39c0.69,1.56,0.84,2.88,0.54,4.38c-0.09,0.45,-0.27,1.08,-0.45,1.47l-0.12,0.24l0.18,0.36c0.33,0.72,0.57,1.56,0.69,2.34c0.12,1.02,-0.06,2.52,-0.42,3.84c-0.27,0.93,-0.75,2.13,-0.93,2.31c-0.18,0.15,-0.45,0.18,-0.66,0.09c-0.18,-0.09,-0.27,-0.18,-0.33,-0.33c-0.09,-0.18,-0.06,-0.3,0.06,-0.6c0.21,-0.36,0.42,-0.9,0.57,-1.38c0.51,-1.41,0.69,-3.06,0.48,-4.08c-0.15,-0.81,-0.57,-1.68,-1.2,-2.55c-0.72,-0.99,-1.83,-2.13,-3.3,-3.33l-0.48,-0.42l-0.03,1.53l0,1.56l-0.21,0l-0.21,0l0,-11.25zm1.26,-3.96c-0.27,-0.3,-0.54,-0.6,-0.66,-0.72l-0.18,-0.21l0,0.42c0.06,0.87,0.24,1.74,0.66,2.67c0.36,0.87,0.96,1.86,1.92,3.18c0.21,0.33,0.63,0.87,0.87,1.23c0.27,0.39,0.6,0.84,0.75,1.08l0.27,0.39l0.03,-0.12c0.12,-0.45,0.15,-1.05,0.09,-1.59c-0.27,-1.86,-1.38,-3.78,-3.75,-6.33zm-0.27,6.09c-0.27,-0.21,-0.48,-0.42,-0.51,-0.45c-0.06,-0.03,-0.06,-0.03,-0.06,0.21c0,0.9,0.3,2.04,0.81,3.09c0.48,1.02,0.96,1.77,2.37,3.63c0.6,0.78,1.05,1.44,1.29,1.77c0.06,0.12,0.15,0.21,0.15,0.18c0.03,-0.03,0.18,-0.57,0.24,-0.87c0.06,-0.45,0.06,-1.32,-0.03,-1.74c-0.09,-0.48,-0.24,-0.9,-0.51,-1.44c-0.66,-1.35,-1.83,-2.7,-3.75,-4.38z"
    },
    "flags.u64th": {
        w: 6.682,
        h: 39.694,
        d: "M-0.42,15l0,-15l0.21,0l0.21,0l0,0.36c0.06,1.2,0.39,2.37,1.02,3.66c0.39,0.81,0.84,1.56,1.8,3.09c0.81,1.26,1.05,1.68,1.35,2.22c0.87,1.5,1.35,2.79,1.56,4.08c0.06,0.54,0.06,1.56,-0.03,2.04c-0.09,0.48,-0.21,0.99,-0.36,1.35l-0.12,0.27l0.12,0.27c0.09,0.15,0.21,0.45,0.27,0.66c0.69,1.89,0.63,3.66,-0.18,5.46l-0.18,0.39l0.15,0.33c0.3,0.66,0.51,1.44,0.63,2.1c0.06,0.48,0.06,1.35,0,1.71c-0.15,0.57,-0.42,1.2,-0.78,1.68l-0.21,0.27l0.18,0.33c0.57,1.05,0.93,2.13,1.02,3.18c0.06,0.72,0,1.83,-0.21,2.79c-0.18,1.02,-0.63,2.34,-1.02,3.09c-0.15,0.33,-0.48,0.45,-0.78,0.3c-0.18,-0.09,-0.27,-0.18,-0.33,-0.33c-0.09,-0.18,-0.06,-0.3,0.03,-0.54c0.75,-1.5,1.23,-3.45,1.17,-4.89c-0.06,-1.02,-0.42,-2.01,-1.17,-3.15c-0.48,-0.72,-1.02,-1.35,-1.89,-2.22c-0.57,-0.57,-1.56,-1.5,-1.92,-1.77l-0.12,-0.09l0,1.68l0,1.68l-0.21,0l-0.21,0l0,-15zm0.93,-8.07c-0.27,-0.3,-0.48,-0.54,-0.51,-0.54c0,0,0,0.69,0.03,1.02c0.15,1.47,0.75,2.94,2.04,4.83l1.08,1.53c0.39,0.57,0.84,1.2,0.99,1.44c0.15,0.24,0.3,0.45,0.3,0.45c0,0,0.03,-0.09,0.06,-0.21c0.36,-1.59,-0.15,-3.33,-1.47,-5.4c-0.63,-0.93,-1.35,-1.83,-2.52,-3.12zm0.06,6.72c-0.24,-0.21,-0.48,-0.42,-0.51,-0.45l-0.06,-0.06l0,0.33c0,1.2,0.3,2.34,0.93,3.6c0.45,0.9,0.96,1.68,2.25,3.51c0.39,0.54,0.84,1.17,1.02,1.44c0.21,0.33,0.33,0.51,0.33,0.48c0.06,-0.09,0.21,-0.63,0.3,-0.99c0.06,-0.33,0.06,-0.45,0.06,-0.96c0,-0.6,-0.03,-0.84,-0.18,-1.35c-0.3,-1.08,-1.02,-2.28,-2.13,-3.57c-0.39,-0.45,-1.44,-1.47,-2.01,-1.98zm0,6.72c-0.24,-0.21,-0.48,-0.39,-0.51,-0.42l-0.06,-0.06l0,0.33c0,1.41,0.45,2.82,1.38,4.35c0.42,0.72,0.72,1.14,1.86,2.73c0.36,0.45,0.75,0.99,0.87,1.2c0.15,0.21,0.3,0.36,0.3,0.36c0.06,0,0.3,-0.48,0.39,-0.75c0.09,-0.36,0.12,-0.63,0.12,-1.05c-0.06,-1.05,-0.45,-2.04,-1.2,-3.18c-0.57,-0.87,-1.11,-1.53,-2.07,-2.49c-0.36,-0.33,-0.84,-0.78,-1.08,-1.02z"
    },
    "flags.d8th": {
        w: 8.492,
        h: 21.691,
        d: "M5.67,-21.63c0.24,-0.12,0.54,-0.06,0.69,0.15c0.06,0.06,0.21,0.36,0.39,0.66c0.84,1.77,1.26,3.36,1.32,5.1c0.03,1.29,-0.21,2.37,-0.81,3.63c-0.6,1.23,-1.26,2.13,-3.21,4.38c-1.35,1.53,-1.86,2.19,-2.4,2.97c-0.63,0.93,-1.11,1.92,-1.38,2.79c-0.15,0.54,-0.27,1.35,-0.27,1.8l0,0.15l-0.21,0l-0.21,0l0,-3.75l0,-3.75l0.21,0l0.21,0l0.48,-0.3c1.83,-1.11,3.12,-2.1,4.17,-3.12c0.78,-0.81,1.32,-1.53,1.71,-2.31c0.45,-0.93,0.6,-1.74,0.51,-2.88c-0.12,-1.56,-0.63,-3.18,-1.47,-4.68c-0.12,-0.21,-0.15,-0.33,-0.06,-0.51c0.06,-0.15,0.15,-0.24,0.33,-0.33z"
    },
    "flags.ugrace": {
        w: 12.019,
        h: 9.954,
        d: "M6.03,6.93c0.15,-0.09,0.33,-0.06,0.51,0c0.15,0.09,0.21,0.15,0.3,0.33c0.09,0.18,0.06,0.39,-0.03,0.54c-0.06,0.15,-10.89,8.88,-11.07,8.97c-0.15,0.09,-0.33,0.06,-0.48,0c-0.18,-0.09,-0.24,-0.15,-0.33,-0.33c-0.09,-0.18,-0.06,-0.39,0.03,-0.54c0.06,-0.15,10.89,-8.88,11.07,-8.97z"
    },
    "flags.dgrace": {
        w: 15.12,
        h: 9.212,
        d: "M-6.06,-15.93c0.18,-0.09,0.33,-0.12,0.48,-0.06c0.18,0.09,14.01,8.04,14.1,8.1c0.12,0.12,0.18,0.33,0.18,0.51c-0.03,0.21,-0.15,0.39,-0.36,0.48c-0.18,0.09,-0.33,0.12,-0.48,0.06c-0.18,-0.09,-14.01,-8.04,-14.1,-8.1c-0.12,-0.12,-0.18,-0.33,-0.18,-0.51c0.03,-0.21,0.15,-0.39,0.36,-0.48z"
    },
    "flags.d16th": {
        w: 8.475,
        h: 22.591,
        d: "M6.84,-22.53c0.27,-0.12,0.57,-0.06,0.72,0.15c0.15,0.15,0.33,0.87,0.45,1.56c0.06,0.33,0.06,1.35,0,1.65c-0.06,0.33,-0.15,0.78,-0.27,1.11c-0.12,0.33,-0.45,0.96,-0.66,1.32l-0.18,0.27l0.09,0.18c0.48,1.02,0.72,2.25,0.69,3.3c-0.06,1.23,-0.42,2.28,-1.26,3.45c-0.57,0.87,-0.99,1.32,-3,3.39c-1.56,1.56,-2.22,2.4,-2.76,3.45c-0.42,0.84,-0.66,1.8,-0.66,2.55l0,0.15l-0.21,0l-0.21,0l0,-7.5l0,-7.5l0.21,0l0.21,0l0,1.14l0,1.11l0.27,-0.15c1.11,-0.57,1.77,-0.99,2.52,-1.47c2.37,-1.56,3.69,-3.15,4.05,-4.83c0.03,-0.18,0.03,-0.39,0.03,-0.78c0,-0.6,-0.03,-0.93,-0.24,-1.5c-0.06,-0.18,-0.12,-0.39,-0.15,-0.45c-0.03,-0.24,0.12,-0.48,0.36,-0.6zm-0.63,7.5c-0.06,-0.18,-0.15,-0.36,-0.15,-0.36c-0.03,0,-0.03,0.03,-0.06,0.06c-0.06,0.12,-0.96,1.02,-1.95,1.98c-0.63,0.57,-1.26,1.17,-1.44,1.35c-1.53,1.62,-2.28,2.85,-2.55,4.32c-0.03,0.18,-0.03,0.54,-0.06,0.99l0,0.69l0.18,-0.09c0.93,-0.54,2.1,-1.29,2.82,-1.83c0.69,-0.51,1.02,-0.81,1.53,-1.29c1.86,-1.89,2.37,-3.66,1.68,-5.82z"
    },
    "flags.d32nd": {
        w: 8.475,
        h: 29.191,
        d: "M6.794,-29.13c0.27,-0.12,0.57,-0.06,0.72,0.15c0.12,0.12,0.27,0.63,0.36,1.11c0.33,1.59,0.06,3.06,-0.81,4.47l-0.18,0.27l0.09,0.15c0.12,0.24,0.33,0.69,0.45,1.05c0.63,1.83,0.45,3.57,-0.57,5.22l-0.18,0.3l0.15,0.27c0.42,0.87,0.6,1.71,0.57,2.61c-0.06,1.29,-0.48,2.46,-1.35,3.78c-0.54,0.81,-0.93,1.29,-2.46,3c-0.51,0.54,-1.05,1.17,-1.26,1.41c-1.56,1.86,-2.25,3.36,-2.37,5.01l0,0.33l-0.21,0l-0.21,0l0,-11.25l0,-11.25l0.21,0l0.21,0l0,1.35l0.03,1.35l0.78,-0.39c1.38,-0.69,2.34,-1.26,3.24,-1.92c1.38,-1.02,2.28,-2.13,2.64,-3.21c0.15,-0.48,0.18,-0.72,0.18,-1.29c0,-0.57,-0.06,-0.9,-0.24,-1.47c-0.06,-0.18,-0.12,-0.39,-0.15,-0.45c-0.03,-0.24,0.12,-0.48,0.36,-0.6zm-0.63,7.2c-0.09,-0.18,-0.12,-0.21,-0.12,-0.15c-0.03,0.09,-1.02,1.08,-2.04,2.04c-1.17,1.08,-1.65,1.56,-2.07,2.04c-0.84,0.96,-1.38,1.86,-1.68,2.76c-0.21,0.57,-0.27,0.99,-0.3,1.65l0,0.54l0.66,-0.33c3.57,-1.86,5.49,-3.69,5.94,-5.7c0.06,-0.39,0.06,-1.2,-0.03,-1.65c-0.06,-0.39,-0.24,-0.9,-0.36,-1.2zm-0.06,7.2c-0.06,-0.15,-0.12,-0.33,-0.15,-0.45l-0.06,-0.18l-0.18,0.21l-1.83,1.83c-0.87,0.9,-1.77,1.8,-1.95,2.01c-1.08,1.29,-1.62,2.31,-1.89,3.51c-0.06,0.3,-0.06,0.51,-0.09,0.93l0,0.57l0.09,-0.06c0.75,-0.45,1.89,-1.26,2.52,-1.74c0.81,-0.66,1.74,-1.53,2.22,-2.16c1.26,-1.53,1.68,-3.06,1.32,-4.47z"
    },
    "flags.d64th": {
        w: 8.485,
        h: 32.932,
        d: "M7.08,-32.88c0.3,-0.12,0.66,-0.03,0.78,0.24c0.18,0.33,0.27,2.1,0.15,2.64c-0.09,0.39,-0.21,0.78,-0.39,1.08l-0.15,0.3l0.09,0.27c0.03,0.12,0.09,0.45,0.12,0.69c0.27,1.44,0.18,2.55,-0.3,3.6l-0.12,0.33l0.06,0.42c0.27,1.35,0.33,2.82,0.21,3.63c-0.12,0.6,-0.3,1.23,-0.57,1.8l-0.15,0.27l0.03,0.42c0.06,1.02,0.06,2.7,0.03,3.06c-0.15,1.47,-0.66,2.76,-1.74,4.41c-0.45,0.69,-0.75,1.11,-1.74,2.37c-1.05,1.38,-1.5,1.98,-1.95,2.73c-0.93,1.5,-1.38,2.82,-1.44,4.2l0,0.42l-0.21,0l-0.21,0l0,-15l0,-15l0.21,0l0.21,0l0,1.86l0,1.89c0,0,0.21,-0.03,0.45,-0.09c2.22,-0.39,4.08,-1.11,5.19,-2.01c0.63,-0.54,1.02,-1.14,1.2,-1.8c0.06,-0.3,0.06,-1.14,-0.03,-1.65c-0.03,-0.18,-0.06,-0.39,-0.09,-0.48c-0.03,-0.24,0.12,-0.48,0.36,-0.6zm-0.45,6.15c-0.03,-0.18,-0.06,-0.42,-0.06,-0.54l-0.03,-0.18l-0.33,0.3c-0.42,0.36,-0.87,0.72,-1.68,1.29c-1.98,1.38,-2.25,1.59,-2.85,2.16c-0.75,0.69,-1.23,1.44,-1.47,2.19c-0.15,0.45,-0.18,0.63,-0.21,1.35l0,0.66l0.39,-0.18c1.83,-0.9,3.45,-1.95,4.47,-2.91c0.93,-0.9,1.53,-1.83,1.74,-2.82c0.06,-0.33,0.06,-0.87,0.03,-1.32zm-0.27,4.86c-0.03,-0.21,-0.06,-0.36,-0.06,-0.36c0,-0.03,-0.12,0.09,-0.24,0.24c-0.39,0.48,-0.99,1.08,-2.16,2.19c-1.47,1.38,-1.92,1.83,-2.46,2.49c-0.66,0.87,-1.08,1.74,-1.29,2.58c-0.09,0.42,-0.15,0.87,-0.15,1.44l0,0.54l0.48,-0.33c1.5,-1.02,2.58,-1.89,3.51,-2.82c1.47,-1.47,2.25,-2.85,2.4,-4.26c0.03,-0.39,0.03,-1.17,-0.03,-1.71zm-0.66,7.68c0.03,-0.15,0.03,-0.6,0.03,-0.99l0,-0.72l-0.27,0.33l-1.74,1.98c-1.77,1.92,-2.43,2.76,-2.97,3.9c-0.51,1.02,-0.72,1.77,-0.75,2.91c0,0.63,0,0.63,0.06,0.6c0.03,-0.03,0.3,-0.27,0.63,-0.54c0.66,-0.6,1.86,-1.8,2.31,-2.31c1.65,-1.89,2.52,-3.54,2.7,-5.16z"
    },
    "clefs.C": {
        w: 20.31,
        h: 29.97,
        d: "M0.06,-14.94l0.09,-0.06l1.92,0l1.92,0l0.09,0.06l0.06,0.09l0,14.85l0,14.82l-0.06,0.09l-0.09,0.06l-1.92,0l-1.92,0l-0.09,-0.06l-0.06,-0.09l0,-14.82l0,-14.85zm5.37,0c0.09,-0.06,0.09,-0.06,0.57,-0.06c0.45,0,0.45,0,0.54,0.06l0.06,0.09l0,7.14l0,7.11l0.09,-0.06c0.18,-0.18,0.72,-0.84,0.96,-1.2c0.3,-0.45,0.66,-1.17,0.84,-1.65c0.36,-0.9,0.57,-1.83,0.6,-2.79c0.03,-0.48,0.03,-0.54,0.09,-0.63c0.12,-0.18,0.36,-0.21,0.54,-0.12c0.18,0.09,0.21,0.15,0.24,0.66c0.06,0.87,0.21,1.56,0.57,2.22c0.51,1.02,1.26,1.68,2.22,1.92c0.21,0.06,0.33,0.06,0.78,0.06c0.45,0,0.57,0,0.84,-0.06c0.45,-0.12,0.81,-0.33,1.08,-0.6c0.57,-0.57,0.87,-1.41,0.99,-2.88c0.06,-0.54,0.06,-3,0,-3.57c-0.21,-2.58,-0.84,-3.87,-2.16,-4.5c-0.48,-0.21,-1.17,-0.36,-1.77,-0.36c-0.69,0,-1.29,0.27,-1.5,0.72c-0.06,0.15,-0.06,0.21,-0.06,0.42c0,0.24,0,0.3,0.06,0.45c0.12,0.24,0.24,0.39,0.63,0.66c0.42,0.3,0.57,0.48,0.69,0.72c0.06,0.15,0.06,0.21,0.06,0.48c0,0.39,-0.03,0.63,-0.21,0.96c-0.3,0.6,-0.87,1.08,-1.5,1.26c-0.27,0.06,-0.87,0.06,-1.14,0c-0.78,-0.24,-1.44,-0.87,-1.65,-1.68c-0.12,-0.42,-0.09,-1.17,0.09,-1.71c0.51,-1.65,1.98,-2.82,3.81,-3.09c0.84,-0.09,2.46,0.03,3.51,0.27c2.22,0.57,3.69,1.8,4.44,3.75c0.36,0.93,0.57,2.13,0.57,3.36c0,1.44,-0.48,2.73,-1.38,3.81c-1.26,1.5,-3.27,2.43,-5.28,2.43c-0.48,0,-0.51,0,-0.75,-0.09c-0.15,-0.03,-0.48,-0.21,-0.78,-0.36c-0.69,-0.36,-0.87,-0.42,-1.26,-0.42c-0.27,0,-0.3,0,-0.51,0.09c-0.57,0.3,-0.81,0.9,-0.81,2.1c0,1.23,0.24,1.83,0.81,2.13c0.21,0.09,0.24,0.09,0.51,0.09c0.39,0,0.57,-0.06,1.26,-0.42c0.3,-0.15,0.63,-0.33,0.78,-0.36c0.24,-0.09,0.27,-0.09,0.75,-0.09c2.01,0,4.02,0.93,5.28,2.4c0.9,1.11,1.38,2.4,1.38,3.84c0,1.5,-0.3,2.88,-0.84,3.96c-0.78,1.59,-2.19,2.64,-4.17,3.15c-1.05,0.24,-2.67,0.36,-3.51,0.27c-1.83,-0.27,-3.3,-1.44,-3.81,-3.09c-0.18,-0.54,-0.21,-1.29,-0.09,-1.74c0.15,-0.6,0.63,-1.2,1.23,-1.47c0.36,-0.18,0.57,-0.21,0.99,-0.21c0.42,0,0.63,0.03,1.02,0.21c0.42,0.21,0.84,0.63,1.05,1.05c0.18,0.36,0.21,0.6,0.21,0.96c0,0.3,0,0.36,-0.06,0.51c-0.12,0.24,-0.27,0.42,-0.69,0.72c-0.57,0.42,-0.69,0.63,-0.69,1.08c0,0.24,0,0.3,0.06,0.45c0.12,0.21,0.3,0.39,0.57,0.54c0.42,0.18,0.87,0.21,1.53,0.15c1.08,-0.15,1.8,-0.57,2.34,-1.32c0.54,-0.75,0.84,-1.83,0.99,-3.51c0.06,-0.57,0.06,-3.03,0,-3.57c-0.12,-1.47,-0.42,-2.31,-0.99,-2.88c-0.27,-0.27,-0.63,-0.48,-1.08,-0.6c-0.27,-0.06,-0.39,-0.06,-0.84,-0.06c-0.45,0,-0.57,0,-0.78,0.06c-1.14,0.27,-2.01,1.17,-2.46,2.49c-0.21,0.57,-0.3,0.99,-0.33,1.65c-0.03,0.51,-0.06,0.57,-0.24,0.66c-0.12,0.06,-0.27,0.06,-0.39,0c-0.21,-0.09,-0.21,-0.15,-0.24,-0.75c-0.09,-1.92,-0.78,-3.72,-2.01,-5.19c-0.18,-0.21,-0.36,-0.42,-0.39,-0.45l-0.09,-0.06l0,7.11l0,7.14l-0.06,0.09c-0.09,0.06,-0.09,0.06,-0.54,0.06c-0.48,0,-0.48,0,-0.57,-0.06l-0.06,-0.09l0,-14.82l0,-14.85z"
    },
    "clefs.F": {
        w: 20.153,
        h: 23.142,
        d: "M6.3,-7.8c0.36,-0.03,1.65,0,2.13,0.03c3.6,0.42,6.03,2.1,6.93,4.86c0.27,0.84,0.36,1.5,0.36,2.58c0,0.9,-0.03,1.35,-0.18,2.16c-0.78,3.78,-3.54,7.08,-8.37,9.96c-1.74,1.05,-3.87,2.13,-6.18,3.12c-0.39,0.18,-0.75,0.33,-0.81,0.36c-0.06,0.03,-0.15,0.06,-0.18,0.06c-0.15,0,-0.33,-0.18,-0.33,-0.33c0,-0.15,0.06,-0.21,0.51,-0.48c3,-1.77,5.13,-3.21,6.84,-4.74c0.51,-0.45,1.59,-1.5,1.95,-1.95c1.89,-2.19,2.88,-4.32,3.15,-6.78c0.06,-0.42,0.06,-1.77,0,-2.19c-0.24,-2.01,-0.93,-3.63,-2.04,-4.71c-0.63,-0.63,-1.29,-1.02,-2.07,-1.2c-1.62,-0.39,-3.36,0.15,-4.56,1.44c-0.54,0.6,-1.05,1.47,-1.32,2.22l-0.09,0.21l0.24,-0.12c0.39,-0.21,0.63,-0.24,1.11,-0.24c0.3,0,0.45,0,0.66,0.06c1.92,0.48,2.85,2.55,1.95,4.38c-0.45,0.99,-1.41,1.62,-2.46,1.71c-1.47,0.09,-2.91,-0.87,-3.39,-2.25c-0.18,-0.57,-0.21,-1.32,-0.03,-2.28c0.39,-2.25,1.83,-4.2,3.81,-5.19c0.69,-0.36,1.59,-0.6,2.37,-0.69zm11.58,2.52c0.84,-0.21,1.71,0.3,1.89,1.14c0.3,1.17,-0.72,2.19,-1.89,1.89c-0.99,-0.21,-1.5,-1.32,-1.02,-2.25c0.18,-0.39,0.6,-0.69,1.02,-0.78zm0,7.5c0.84,-0.21,1.71,0.3,1.89,1.14c0.21,0.87,-0.3,1.71,-1.14,1.89c-0.87,0.21,-1.71,-0.3,-1.89,-1.14c-0.21,-0.84,0.3,-1.71,1.14,-1.89z"
    },
    "clefs.G": {
        w: 19.051,
        h: 57.057,
        d: "M9.69,-37.41c0.09,-0.09,0.24,-0.06,0.36,0c0.12,0.09,0.57,0.6,0.96,1.11c1.77,2.34,3.21,5.85,3.57,8.73c0.21,1.56,0.03,3.27,-0.45,4.86c-0.69,2.31,-1.92,4.47,-4.23,7.44c-0.3,0.39,-0.57,0.72,-0.6,0.75c-0.03,0.06,0,0.15,0.18,0.78c0.54,1.68,1.38,4.44,1.68,5.49l0.09,0.42l0.39,0c1.47,0.09,2.76,0.51,3.96,1.29c1.83,1.23,3.06,3.21,3.39,5.52c0.09,0.45,0.12,1.29,0.06,1.74c-0.09,1.02,-0.33,1.83,-0.75,2.73c-0.84,1.71,-2.28,3.06,-4.02,3.72l-0.33,0.12l0.03,1.26c0,1.74,-0.06,3.63,-0.21,4.62c-0.45,3.06,-2.19,5.49,-4.47,6.21c-0.57,0.18,-0.9,0.21,-1.59,0.21c-0.69,0,-1.02,-0.03,-1.65,-0.21c-1.14,-0.27,-2.13,-0.84,-2.94,-1.65c-0.99,-0.99,-1.56,-2.16,-1.71,-3.54c-0.09,-0.81,0.06,-1.53,0.45,-2.13c0.63,-0.99,1.83,-1.56,3,-1.53c1.5,0.09,2.64,1.32,2.73,2.94c0.06,1.47,-0.93,2.7,-2.37,2.97c-0.45,0.06,-0.84,0.03,-1.29,-0.09l-0.21,-0.09l0.09,0.12c0.39,0.54,0.78,0.93,1.32,1.26c1.35,0.87,3.06,1.02,4.35,0.36c1.44,-0.72,2.52,-2.28,2.97,-4.35c0.15,-0.66,0.24,-1.5,0.3,-3.03c0.03,-0.84,0.03,-2.94,0,-3c-0.03,0,-0.18,0,-0.36,0.03c-0.66,0.12,-0.99,0.12,-1.83,0.12c-1.05,0,-1.71,-0.06,-2.61,-0.3c-4.02,-0.99,-7.11,-4.35,-7.8,-8.46c-0.12,-0.66,-0.12,-0.99,-0.12,-1.83c0,-0.84,0,-1.14,0.15,-1.92c0.36,-2.28,1.41,-4.62,3.3,-7.29l2.79,-3.6c0.54,-0.66,0.96,-1.2,0.96,-1.23c0,-0.03,-0.09,-0.33,-0.18,-0.69c-0.96,-3.21,-1.41,-5.28,-1.59,-7.68c-0.12,-1.38,-0.15,-3.09,-0.06,-3.96c0.33,-2.67,1.38,-5.07,3.12,-7.08c0.36,-0.42,0.99,-1.05,1.17,-1.14zm2.01,4.71c-0.15,-0.3,-0.3,-0.54,-0.3,-0.54c-0.03,0,-0.18,0.09,-0.3,0.21c-2.4,1.74,-3.87,4.2,-4.26,7.11c-0.06,0.54,-0.06,1.41,-0.03,1.89c0.09,1.29,0.48,3.12,1.08,5.22c0.15,0.42,0.24,0.78,0.24,0.81c0,0.03,0.84,-1.11,1.23,-1.68c1.89,-2.73,2.88,-5.07,3.15,-7.53c0.09,-0.57,0.12,-1.74,0.06,-2.37c-0.09,-1.23,-0.27,-1.92,-0.87,-3.12zm-2.94,20.7c-0.21,-0.72,-0.39,-1.32,-0.42,-1.32c0,0,-1.2,1.47,-1.86,2.37c-2.79,3.63,-4.02,6.3,-4.35,9.3c-0.03,0.21,-0.03,0.69,-0.03,1.08c0,0.69,0,0.75,0.06,1.11c0.12,0.54,0.27,0.99,0.51,1.47c0.69,1.38,1.83,2.55,3.42,3.42c0.96,0.54,2.07,0.9,3.21,1.08c0.78,0.12,2.04,0.12,2.94,-0.03c0.51,-0.06,0.45,-0.03,0.42,-0.3c-0.24,-3.33,-0.72,-6.33,-1.62,-10.08c-0.09,-0.39,-0.18,-0.75,-0.18,-0.78c-0.03,-0.03,-0.42,0,-0.81,0.09c-0.9,0.18,-1.65,0.57,-2.22,1.14c-0.72,0.72,-1.08,1.65,-1.05,2.64c0.06,0.96,0.48,1.83,1.23,2.58c0.36,0.36,0.72,0.63,1.17,0.9c0.33,0.18,0.36,0.21,0.42,0.33c0.18,0.42,-0.18,0.9,-0.6,0.87c-0.18,-0.03,-0.84,-0.36,-1.26,-0.63c-0.78,-0.51,-1.38,-1.11,-1.86,-1.83c-1.77,-2.7,-0.99,-6.42,1.71,-8.19c0.3,-0.21,0.81,-0.48,1.17,-0.63c0.3,-0.09,1.02,-0.3,1.14,-0.3c0.06,0,0.09,0,0.09,-0.03c0.03,-0.03,-0.51,-1.92,-1.23,-4.26zm3.78,7.41c-0.18,-0.03,-0.36,-0.06,-0.39,-0.06c-0.03,0,0,0.21,0.18,1.02c0.75,3.18,1.26,6.3,1.5,9.09c0.06,0.72,0,0.69,0.51,0.42c0.78,-0.36,1.44,-0.96,1.98,-1.77c1.08,-1.62,1.2,-3.69,0.3,-5.55c-0.81,-1.62,-2.31,-2.79,-4.08,-3.15z"
    },
    "clefs.perc": {
        w: 9.99,
        h: 14.97,
        d: "M5.07,-7.44l0.09,-0.06l1.53,0l1.53,0l0.09,0.06l0.06,0.09l0,7.35l0,7.32l-0.06,0.09l-0.09,0.06l-1.53,0l-1.53,0l-0.09,-0.06l-0.06,-0.09l0,-7.32l0,-7.35zm6.63,0l0.09,-0.06l1.53,0l1.53,0l0.09,0.06l0.06,0.09l0,7.35l0,7.32l-0.06,0.09l-0.09,0.06l-1.53,0l-1.53,0l-0.09,-0.06l-0.06,-0.09l0,-7.32l0,-7.35z"
    },
    "timesig.common": {
        w: 13.038,
        h: 15.697,
        d: "M6.66,-7.826c0.72,-0.06,1.41,-0.03,1.98,0.09c1.2,0.27,2.34,0.96,3.09,1.92c0.63,0.81,1.08,1.86,1.14,2.73c0.06,1.02,-0.51,1.92,-1.44,2.22c-0.24,0.09,-0.3,0.09,-0.63,0.09c-0.33,0,-0.42,0,-0.63,-0.06c-0.66,-0.24,-1.14,-0.63,-1.41,-1.2c-0.15,-0.3,-0.21,-0.51,-0.24,-0.9c-0.06,-1.08,0.57,-2.04,1.56,-2.37c0.18,-0.06,0.27,-0.06,0.63,-0.06l0.45,0c0.06,0.03,0.09,0.03,0.09,0c0,0,-0.09,-0.12,-0.24,-0.27c-1.02,-1.11,-2.55,-1.68,-4.08,-1.5c-1.29,0.15,-2.04,0.69,-2.4,1.74c-0.36,0.93,-0.42,1.89,-0.42,5.37c0,2.97,0.06,3.96,0.24,4.77c0.24,1.08,0.63,1.68,1.41,2.07c0.81,0.39,2.16,0.45,3.18,0.09c1.29,-0.45,2.37,-1.53,3.03,-2.97c0.15,-0.33,0.33,-0.87,0.39,-1.17c0.09,-0.24,0.15,-0.36,0.3,-0.39c0.21,-0.03,0.42,0.15,0.39,0.36c-0.06,0.39,-0.42,1.38,-0.69,1.89c-0.96,1.8,-2.49,2.94,-4.23,3.18c-0.99,0.12,-2.58,-0.06,-3.63,-0.45c-0.96,-0.36,-1.71,-0.84,-2.4,-1.5c-1.11,-1.11,-1.8,-2.61,-2.04,-4.56c-0.06,-0.6,-0.06,-2.01,0,-2.61c0.24,-1.95,0.9,-3.45,2.01,-4.56c0.69,-0.66,1.44,-1.11,2.37,-1.47c0.63,-0.24,1.47,-0.42,2.22,-0.48z"
    },
    "timesig.cut": {
        w: 13.038,
        h: 20.97,
        d: "M6.24,-10.44c0.09,-0.06,0.09,-0.06,0.48,-0.06c0.36,0,0.36,0,0.45,0.06l0.06,0.09l0,1.23l0,1.26l0.27,0c1.26,0,2.49,0.45,3.48,1.29c1.05,0.87,1.8,2.28,1.89,3.48c0.06,1.02,-0.51,1.92,-1.44,2.22c-0.24,0.09,-0.3,0.09,-0.63,0.09c-0.33,0,-0.42,0,-0.63,-0.06c-0.66,-0.24,-1.14,-0.63,-1.41,-1.2c-0.15,-0.3,-0.21,-0.51,-0.24,-0.9c-0.06,-1.08,0.57,-2.04,1.56,-2.37c0.18,-0.06,0.27,-0.06,0.63,-0.06l0.45,0c0.06,0.03,0.09,0.03,0.09,0c0,-0.03,-0.45,-0.51,-0.66,-0.69c-0.87,-0.69,-1.83,-1.05,-2.94,-1.11l-0.42,0l0,7.17l0,7.14l0.42,0c0.69,-0.03,1.23,-0.18,1.86,-0.51c1.05,-0.51,1.89,-1.47,2.46,-2.7c0.15,-0.33,0.33,-0.87,0.39,-1.17c0.09,-0.24,0.15,-0.36,0.3,-0.39c0.21,-0.03,0.42,0.15,0.39,0.36c-0.03,0.24,-0.21,0.78,-0.39,1.2c-0.96,2.37,-2.94,3.9,-5.13,3.9l-0.3,0l0,1.26l0,1.23l-0.06,0.09c-0.09,0.06,-0.09,0.06,-0.45,0.06c-0.39,0,-0.39,0,-0.48,-0.06l-0.06,-0.09l0,-1.29l0,-1.29l-0.21,-0.03c-1.23,-0.21,-2.31,-0.63,-3.21,-1.29c-0.15,-0.09,-0.45,-0.36,-0.66,-0.57c-1.11,-1.11,-1.8,-2.61,-2.04,-4.56c-0.06,-0.6,-0.06,-2.01,0,-2.61c0.24,-1.95,0.93,-3.45,2.04,-4.59c0.42,-0.39,0.78,-0.66,1.26,-0.93c0.75,-0.45,1.65,-0.75,2.61,-0.9l0.21,-0.03l0,-1.29l0,-1.29zm-0.06,10.44c0,-5.58,0,-6.99,-0.03,-6.99c-0.15,0,-0.63,0.27,-0.87,0.45c-0.45,0.36,-0.75,0.93,-0.93,1.77c-0.18,0.81,-0.24,1.8,-0.24,4.74c0,2.97,0.06,3.96,0.24,4.77c0.24,1.08,0.66,1.68,1.41,2.07c0.12,0.06,0.3,0.12,0.33,0.15l0.09,0l0,-6.96z"
    },
    f: {
        w: 16.155,
        h: 19.445,
        d: "M9.93,-14.28c1.53,-0.18,2.88,0.45,3.12,1.5c0.12,0.51,0,1.32,-0.27,1.86c-0.15,0.3,-0.42,0.57,-0.63,0.69c-0.69,0.36,-1.56,0.03,-1.83,-0.69c-0.09,-0.24,-0.09,-0.69,0,-0.87c0.06,-0.12,0.21,-0.24,0.45,-0.42c0.42,-0.24,0.57,-0.45,0.6,-0.72c0.03,-0.33,-0.09,-0.39,-0.63,-0.42c-0.3,0,-0.45,0,-0.6,0.03c-0.81,0.21,-1.35,0.93,-1.74,2.46c-0.06,0.27,-0.48,2.25,-0.48,2.31c0,0.03,0.39,0.03,0.9,0.03c0.72,0,0.9,0,0.99,0.06c0.42,0.15,0.45,0.72,0.03,0.9c-0.12,0.06,-0.24,0.06,-1.17,0.06l-1.05,0l-0.78,2.55c-0.45,1.41,-0.87,2.79,-0.96,3.06c-0.87,2.37,-2.37,4.74,-3.78,5.91c-1.05,0.9,-2.04,1.23,-3.09,1.08c-1.11,-0.18,-1.89,-0.78,-2.04,-1.59c-0.12,-0.66,0.15,-1.71,0.54,-2.19c0.69,-0.75,1.86,-0.54,2.22,0.39c0.06,0.15,0.09,0.27,0.09,0.48c0,0.24,-0.03,0.27,-0.12,0.42c-0.03,0.09,-0.15,0.18,-0.27,0.27c-0.09,0.06,-0.27,0.21,-0.36,0.27c-0.24,0.18,-0.36,0.36,-0.39,0.6c-0.03,0.33,0.09,0.39,0.63,0.42c0.42,0,0.63,-0.03,0.9,-0.15c0.6,-0.3,0.96,-0.96,1.38,-2.64c0.09,-0.42,0.63,-2.55,1.17,-4.77l1.02,-4.08c0,-0.03,-0.36,-0.03,-0.81,-0.03c-0.72,0,-0.81,0,-0.93,-0.06c-0.42,-0.18,-0.39,-0.75,0.03,-0.9c0.09,-0.06,0.27,-0.06,1.05,-0.06l0.96,0l0,-0.09c0.06,-0.18,0.3,-0.72,0.51,-1.17c1.2,-2.46,3.3,-4.23,5.34,-4.5z"
    },
    m: {
        w: 14.687,
        h: 9.126,
        d: "M2.79,-8.91c0.09,0,0.3,-0.03,0.45,-0.03c0.24,0.03,0.3,0.03,0.45,0.12c0.36,0.15,0.63,0.54,0.75,1.02l0.03,0.21l0.33,-0.3c0.69,-0.69,1.38,-1.02,2.07,-1.02c0.27,0,0.33,0,0.48,0.06c0.21,0.09,0.48,0.36,0.63,0.6c0.03,0.09,0.12,0.27,0.18,0.42c0.03,0.15,0.09,0.27,0.12,0.27c0,0,0.09,-0.09,0.18,-0.21c0.33,-0.39,0.87,-0.81,1.29,-0.99c0.78,-0.33,1.47,-0.21,2.01,0.33c0.3,0.33,0.48,0.69,0.6,1.14c0.09,0.42,0.06,0.54,-0.54,3.06c-0.33,1.29,-0.57,2.4,-0.57,2.43c0,0.12,0.09,0.21,0.21,0.21c0.24,0,0.75,-0.3,1.2,-0.72c0.45,-0.39,0.6,-0.45,0.78,-0.27c0.18,0.18,0.09,0.36,-0.45,0.87c-1.05,0.96,-1.83,1.47,-2.58,1.71c-0.93,0.33,-1.53,0.21,-1.8,-0.33c-0.06,-0.15,-0.06,-0.21,-0.06,-0.45c0,-0.24,0.03,-0.48,0.6,-2.82c0.42,-1.71,0.6,-2.64,0.63,-2.79c0.03,-0.57,-0.3,-0.75,-0.84,-0.48c-0.24,0.12,-0.54,0.39,-0.66,0.63c-0.03,0.09,-0.42,1.38,-0.9,3c-0.9,3.15,-0.84,3,-1.14,3.15l-0.15,0.09l-0.78,0c-0.6,0,-0.78,0,-0.84,-0.06c-0.09,-0.03,-0.18,-0.18,-0.18,-0.27c0,-0.03,0.36,-1.38,0.84,-2.97c0.57,-2.04,0.81,-2.97,0.84,-3.12c0.03,-0.54,-0.3,-0.72,-0.84,-0.45c-0.24,0.12,-0.57,0.42,-0.66,0.63c-0.06,0.09,-0.51,1.44,-1.05,2.97c-0.51,1.56,-0.99,2.85,-0.99,2.91c-0.06,0.12,-0.21,0.24,-0.36,0.3c-0.12,0.06,-0.21,0.06,-0.9,0.06c-0.6,0,-0.78,0,-0.84,-0.06c-0.09,-0.03,-0.18,-0.18,-0.18,-0.27c0,-0.03,0.45,-1.38,0.99,-2.97c1.05,-3.18,1.05,-3.18,0.93,-3.45c-0.12,-0.27,-0.39,-0.3,-0.72,-0.15c-0.54,0.27,-1.14,1.17,-1.56,2.4c-0.06,0.15,-0.15,0.3,-0.18,0.36c-0.21,0.21,-0.57,0.27,-0.72,0.09c-0.09,-0.09,-0.06,-0.21,0.06,-0.63c0.48,-1.26,1.26,-2.46,2.01,-3.21c0.57,-0.54,1.2,-0.87,1.83,-1.02z"
    },
    p: {
        w: 14.689,
        h: 13.127,
        d: "M1.92,-8.7c0.27,-0.09,0.81,-0.06,1.11,0.03c0.54,0.18,0.93,0.51,1.17,0.99c0.09,0.15,0.15,0.33,0.18,0.36l0,0.12l0.3,-0.27c0.66,-0.6,1.35,-1.02,2.13,-1.2c0.21,-0.06,0.33,-0.06,0.78,-0.06c0.45,0,0.51,0,0.84,0.09c1.29,0.33,2.07,1.32,2.25,2.79c0.09,0.81,-0.09,2.01,-0.45,2.79c-0.54,1.26,-1.86,2.55,-3.18,3.03c-0.45,0.18,-0.81,0.24,-1.29,0.24c-0.69,-0.03,-1.35,-0.18,-1.86,-0.45c-0.3,-0.15,-0.51,-0.18,-0.69,-0.09c-0.09,0.03,-0.18,0.09,-0.18,0.12c-0.09,0.12,-1.05,2.94,-1.05,3.06c0,0.24,0.18,0.48,0.51,0.63c0.18,0.06,0.54,0.15,0.75,0.15c0.21,0,0.36,0.06,0.42,0.18c0.12,0.18,0.06,0.42,-0.12,0.54c-0.09,0.03,-0.15,0.03,-0.78,0c-1.98,-0.15,-3.81,-0.15,-5.79,0c-0.63,0.03,-0.69,0.03,-0.78,0c-0.24,-0.15,-0.24,-0.57,0.03,-0.66c0.06,-0.03,0.48,-0.09,0.99,-0.12c0.87,-0.06,1.11,-0.09,1.35,-0.21c0.18,-0.06,0.33,-0.18,0.39,-0.3c0.06,-0.12,3.24,-9.42,3.27,-9.6c0.06,-0.33,0.03,-0.57,-0.15,-0.69c-0.09,-0.06,-0.12,-0.06,-0.3,-0.06c-0.69,0.06,-1.53,1.02,-2.28,2.61c-0.09,0.21,-0.21,0.45,-0.27,0.51c-0.09,0.12,-0.33,0.24,-0.48,0.24c-0.18,0,-0.36,-0.15,-0.36,-0.3c0,-0.24,0.78,-1.83,1.26,-2.55c0.72,-1.11,1.47,-1.74,2.28,-1.92zm5.37,1.47c-0.27,-0.12,-0.75,-0.03,-1.14,0.21c-0.75,0.48,-1.47,1.68,-1.89,3.15c-0.45,1.47,-0.42,2.34,0,2.7c0.45,0.39,1.26,0.21,1.83,-0.36c0.51,-0.51,0.99,-1.68,1.38,-3.27c0.3,-1.17,0.33,-1.74,0.15,-2.13c-0.09,-0.15,-0.15,-0.21,-0.33,-0.3z"
    },
    r: {
        w: 9.41,
        h: 9.132,
        d: "M6.33,-9.12c0.27,-0.03,0.93,0,1.2,0.06c0.84,0.21,1.23,0.81,1.02,1.53c-0.24,0.75,-0.9,1.17,-1.56,0.96c-0.33,-0.09,-0.51,-0.3,-0.66,-0.75c-0.03,-0.12,-0.09,-0.24,-0.12,-0.3c-0.09,-0.15,-0.3,-0.24,-0.48,-0.24c-0.57,0,-1.38,0.54,-1.65,1.08c-0.06,0.15,-0.33,1.17,-0.9,3.27c-0.57,2.31,-0.81,3.12,-0.87,3.21c-0.03,0.06,-0.12,0.15,-0.18,0.21l-0.12,0.06l-0.81,0.03c-0.69,0,-0.81,0,-0.9,-0.03c-0.09,-0.06,-0.18,-0.21,-0.18,-0.3c0,-0.06,0.39,-1.62,0.9,-3.51c0.84,-3.24,0.87,-3.45,0.87,-3.72c0,-0.21,0,-0.27,-0.03,-0.36c-0.12,-0.15,-0.21,-0.24,-0.42,-0.24c-0.24,0,-0.45,0.15,-0.78,0.42c-0.33,0.36,-0.45,0.54,-0.72,1.14c-0.03,0.12,-0.21,0.24,-0.36,0.27c-0.12,0,-0.15,0,-0.24,-0.06c-0.18,-0.12,-0.18,-0.21,-0.06,-0.54c0.21,-0.57,0.42,-0.93,0.78,-1.32c0.54,-0.51,1.2,-0.81,1.95,-0.87c0.81,-0.03,1.53,0.3,1.92,0.87l0.12,0.18l0.09,-0.09c0.57,-0.45,1.41,-0.84,2.19,-0.96z"
    },
    s: {
        w: 6.632,
        h: 8.758,
        d: "M4.47,-8.73c0.09,0,0.36,-0.03,0.57,-0.03c0.75,0.03,1.29,0.24,1.71,0.63c0.51,0.54,0.66,1.26,0.36,1.83c-0.24,0.42,-0.63,0.57,-1.11,0.42c-0.33,-0.09,-0.6,-0.36,-0.6,-0.57c0,-0.03,0.06,-0.21,0.15,-0.39c0.12,-0.21,0.15,-0.33,0.18,-0.48c0,-0.24,-0.06,-0.48,-0.15,-0.6c-0.15,-0.21,-0.42,-0.24,-0.75,-0.15c-0.27,0.06,-0.48,0.18,-0.69,0.36c-0.39,0.39,-0.51,0.96,-0.33,1.38c0.09,0.21,0.42,0.51,0.78,0.72c1.11,0.69,1.59,1.11,1.89,1.68c0.21,0.39,0.24,0.78,0.15,1.29c-0.18,1.2,-1.17,2.16,-2.52,2.52c-1.02,0.24,-1.95,0.12,-2.7,-0.42c-0.72,-0.51,-0.99,-1.47,-0.6,-2.19c0.24,-0.48,0.72,-0.63,1.17,-0.42c0.33,0.18,0.54,0.45,0.57,0.81c0,0.21,-0.03,0.3,-0.33,0.51c-0.33,0.24,-0.39,0.42,-0.27,0.69c0.06,0.15,0.21,0.27,0.45,0.33c0.3,0.09,0.87,0.09,1.2,0c0.75,-0.21,1.23,-0.72,1.29,-1.35c0.03,-0.42,-0.15,-0.81,-0.54,-1.2c-0.24,-0.24,-0.48,-0.42,-1.41,-1.02c-0.69,-0.42,-1.05,-0.93,-1.05,-1.47c0,-0.39,0.12,-0.87,0.3,-1.23c0.27,-0.57,0.78,-1.05,1.38,-1.35c0.24,-0.12,0.63,-0.27,0.9,-0.3z"
    },
    z: {
        w: 8.573,
        h: 8.743,
        d: "M2.64,-7.95c0.36,-0.09,0.81,-0.03,1.71,0.27c0.78,0.21,0.96,0.27,1.74,0.3c0.87,0.06,1.02,0.03,1.38,-0.21c0.21,-0.15,0.33,-0.15,0.48,-0.06c0.15,0.09,0.21,0.3,0.15,0.45c-0.03,0.06,-1.26,1.26,-2.76,2.67l-2.73,2.55l0.54,0.03c0.54,0.03,0.72,0.03,2.01,0.15c0.36,0.03,0.9,0.06,1.2,0.09c0.66,0,0.81,-0.03,1.02,-0.24c0.3,-0.3,0.39,-0.72,0.27,-1.23c-0.06,-0.27,-0.06,-0.27,-0.03,-0.39c0.15,-0.3,0.54,-0.27,0.69,0.03c0.15,0.33,0.27,1.02,0.27,1.5c0,1.47,-1.11,2.7,-2.52,2.79c-0.57,0.03,-1.02,-0.09,-2.01,-0.51c-1.02,-0.42,-1.23,-0.48,-2.13,-0.54c-0.81,-0.06,-0.96,-0.03,-1.26,0.18c-0.12,0.06,-0.24,0.12,-0.27,0.12c-0.27,0,-0.45,-0.3,-0.36,-0.51c0.03,-0.06,1.32,-1.32,2.91,-2.79l2.88,-2.73c-0.03,0,-0.21,0.03,-0.42,0.06c-0.21,0.03,-0.78,0.09,-1.23,0.12c-1.11,0.12,-1.23,0.15,-1.95,0.27c-0.72,0.15,-1.17,0.18,-1.29,0.09c-0.27,-0.18,-0.21,-0.75,0.12,-1.26c0.39,-0.6,0.93,-1.02,1.59,-1.2z"
    },
    "+": {
        w: 7.507,
        h: 7.515,
        d: "M3.48,-11.19c0.18,-0.09,0.36,-0.09,0.54,0c0.18,0.09,0.24,0.15,0.33,0.3l0.06,0.15l0,1.29l0,1.29l1.29,0c1.23,0,1.29,0,1.41,0.06c0.06,0.03,0.15,0.09,0.18,0.12c0.12,0.09,0.21,0.33,0.21,0.48c0,0.15,-0.09,0.39,-0.21,0.48c-0.03,0.03,-0.12,0.09,-0.18,0.12c-0.12,0.06,-0.18,0.06,-1.41,0.06l-1.29,0l0,1.29c0,1.23,0,1.29,-0.06,1.41c-0.09,0.18,-0.15,0.24,-0.3,0.33c-0.21,0.09,-0.39,0.09,-0.57,0c-0.18,-0.09,-0.24,-0.15,-0.33,-0.33c-0.06,-0.12,-0.06,-0.18,-0.06,-1.41l0,-1.29l-1.29,0c-1.23,0,-1.29,0,-1.41,-0.06c-0.18,-0.09,-0.24,-0.15,-0.33,-0.33c-0.09,-0.18,-0.09,-0.36,0,-0.54c0.09,-0.18,0.15,-0.24,0.33,-0.33l0.15,-0.06l1.26,0l1.29,0l0,-1.29c0,-1.23,0,-1.29,0.06,-1.41c0.09,-0.18,0.15,-0.24,0.33,-0.33z"
    },
    ",": {
        w: 3.452,
        h: 8.143,
        d: "M1.32,-3.36c0.57,-0.15,1.17,0.03,1.59,0.45c0.45,0.45,0.6,0.96,0.51,1.89c-0.09,1.23,-0.42,2.46,-0.99,3.93c-0.3,0.72,-0.72,1.62,-0.78,1.68c-0.18,0.21,-0.51,0.18,-0.66,-0.06c-0.03,-0.06,-0.06,-0.15,-0.06,-0.18c0,-0.06,0.12,-0.33,0.24,-0.63c0.84,-1.8,1.02,-2.61,0.69,-3.24c-0.12,-0.24,-0.27,-0.36,-0.75,-0.6c-0.36,-0.15,-0.42,-0.21,-0.6,-0.39c-0.69,-0.69,-0.69,-1.71,0,-2.4c0.21,-0.21,0.51,-0.39,0.81,-0.45z"
    },
    "-": {
        w: 5.001,
        h: 0.81,
        d: "M0.18,-5.34c0.09,-0.06,0.15,-0.06,2.31,-0.06c2.46,0,2.37,0,2.46,0.21c0.12,0.21,0.03,0.42,-0.15,0.54c-0.09,0.06,-0.15,0.06,-2.28,0.06c-2.16,0,-2.22,0,-2.31,-0.06c-0.27,-0.15,-0.27,-0.54,-0.03,-0.69z"
    },
    ".": {
        w: 3.413,
        h: 3.402,
        d: "M1.32,-3.36c1.05,-0.27,2.1,0.57,2.1,1.65c0,1.08,-1.05,1.92,-2.1,1.65c-0.9,-0.21,-1.5,-1.14,-1.26,-2.04c0.12,-0.63,0.63,-1.11,1.26,-1.26z"
    },
    stave: {
        d: "M0,0L800,0M0,8L800,8M0,16L800,16M0,24L800,24M0,32L800,32z"
    }
};

},{}],"D:\\TimTech\\WebABC\\engine\\parser.js":[function(require,module,exports){
"use strict";

var lexer = require("./lexer.js"),
    data_tables = require("./data_tables.js"),
    _ = require('./vendor.js').lodash,
    enums = require("./types"),
    dispatcher = require("./dispatcher"),
    AbcNote = require("./types/AbcSymbol").AbcNote,
    AbcSymbol = require("./types/AbcSymbol").AbcSymbol,
    AbcChord = require("./types/AbcChord").AbcChord;

function ParserException(message) {
    this.message = message;
    this.name = "ParserException";
}

var ABCParser = function (transposeAmount) {
    var typecache = new Map();
    var dicache = new Map();
    var drawableIndex = 0;
    var decorationstack = [];
    var maxStartId = 0;

    var transpose = transposeAmount || 0;

    //parse a note
    function parseNote(lexer, parsed) {
        var newNote = new AbcNote();

        while (lexer[0] && lexer[0].subType === "chord_annotation") {
            newNote.chord = new AbcChord(lexer[0].data);
            lexer.shift();
        }

        while (lexer[0] && lexer[0].subType === "decoration") {
            lexer.shift();
        }

        if (lexer[0].subType == "accidental") {
            newNote.accidental = lexer.shift().data;
        }

        if (!lexer[0] || lexer[0].subType !== "letter") {
            lexer.shift();
            return new ParserException("Missing note name");
        }

        if (lexer[0] && lexer[0].subType == "letter") {
            newNote.note = lexer.shift().data;

            newNote.pitch = data_tables.notes[newNote.note].pitch + transpose;
            newNote.octave = data_tables.notes[newNote.note].octave;
            newNote.pos = data_tables.notes[newNote.note].pos + transpose;
        }

        if (lexer[0] && lexer[0].subType == "pitch") {
            newNote.octave += lexer.shift().data;
        }

        if (lexer[0] && lexer[0].subType == "length") {
            newNote.noteLength = lexer.shift().data;
        }

        newNote.beamDepth = Math.floor(Math.log2(newNote.noteLength)) - 1;
        newNote.weight = data_tables.symbol_width.note(newNote);

        if (parsed === undefined || newNote.weight === undefined) {
            console.log("DAMN");
        }

        parsed.weight += newNote.weight;
        parsed.symbols.push(newNote);

        return newNote;
    }

    //parse a rest
    function parseRest(lexer) {
        var newRest = new AbcRest();

        newRest.visible = lexer[0].subType === "visible";
        newRest.subType = lexer[0].data === "short" ? "beat_rest" : "bar_rest";

        lexer.shift();

        if (lexer[0] && lexer[0].subType == "length") {
            newRest.restLength = lexer.shift().data;
        }

        return newRest;
    }

    /**
     * Parses a group of notes
     * @param  {Array} The output array for the entire parse process
     * @param  {Array} The input array of lexed tokens
     * @param  {String} The name of the type of note group
     * @param  {String} The type of token that starts the note group
     * @param  {String} The type of token that ends the note group
     * @return {Boolean} Returns TRUE if the specified note group was found
     */
    function noteGroup(parsed, lexed, name, start, stop) {
        if (lexed[0].type === start) {
            lexed.shift();

            var groupNotes = [];

            while (lexed.length > 0 && lexed[0].type != stop) {
                if (lexed[0].type === "note") {
                    groupNotes.push(parseNote(lexed));
                    continue;
                } else {
                    /*throw new*/
                    groupNotes.push(new ParserException("Only notes are allowed in " + name + "s"));
                    lexed.shift();
                    continue;
                }
            }

            parsed.push({
                type: name,
                type_class: "drawable",
                notes: groupNotes
            });

            lexed.shift();
            return true;
        }

        if (lexed[0].type === stop) {
            parsed.push(new ParserException("Closing " + name + " found before starting it"));
            lexed.shift();
            return true;
        }

        return false;
    };

    function parseSlur(parsed, lexed) {
        if (lexed[0].type === "slur_start") {
            lexed.shift();

            var groupNotes = [];

            while (lexed.length > 0 && lexed[0].type != "slur_stop") {
                if (lexed[0].type === "note") {
                    var parsedNote = parseNote(lexed, parsed);
                    groupNotes.push(parsedNote);
                    continue;
                } else {
                    /*throw new*/
                    groupNotes.push(new ParserException("Only notes are allowed in slurs"));
                    lexed.shift();
                    continue;
                }
            }

            parsed.symbols.push({
                type: "slur",
                type_class: "drawable",
                notes: groupNotes
            });

            lexed.shift();
            return true;
        }

        if (lexed[0].type === "slur_stop") {
            parsed.push(new ParserException("Closing slur found before starting it"));
            lexed.shift();
            return true;
        }

        return false;
    };

    var parseBarline = function (lexed, parsed) {
        var symbol = lexed.shift();

        var newBarline = new AbcSymbol("barline", 1);
        newBarline.subType = symbol.subtype;

        parsed.symbols.push(newBarline);
        parsed.weight += 1;

        return symbol.v;
    };

    /**
     * A recursive decent parser that combines lexed tokens into a meaningful data structure
     * @param  {Array} An array of lexed tokens
     * @return {Array} An array of parsed symbols
     */
    function parse(lexed, line) {
        var parsed = {
            symbols: [],
            weight: 0
        };

        var currentVarientEnding = null,
            tupletBuffer = [],
            tupletCount = 0;

        while (lexed.length > 0) {
            if (lexed[0].type === "data") {
                var lexedToken = lexed.shift();
                parsed.symbols.push({
                    type_class: "data",
                    type: lexedToken.subtype,
                    data: lexedToken.data
                });

                continue;
            }

            if (lexed[0].type === "beam") {
                lexed.shift();
                continue;
            }

            // if (lexed[0].type === "chord_annotation") {
            //     parsed.symbols.push({
            //         type_class: "drawable",
            //         type: "chord_annotation",
            //         text: lexed[0].data
            //     });
            //     lexed.shift();
            //     continue;
            // }
            if (lexed[0].type === "tuplet_start") {
                tupletCount = lexed[0].data;
                lexed.shift();
                continue;
            }

            if (lexed[0].type === "note") {
                parseNote(lexed, parsed);

                if (currentVarientEnding !== null && currentVarientEnding.start === null) {
                    currentVarientEnding.start = _.last(parsed.symbols);
                }

                if (tupletCount > 0) {
                    tupletBuffer.push(_.last(parsed.symbols));
                    tupletCount--;

                    if (tupletCount === 0) {
                        line.tuplets.push({
                            notes: tupletBuffer
                        });
                        tupletBuffer = [];
                    }
                }

                continue;
            }

            if (lexed[0].type === "rest") {
                parsed.symbols.push(parseRest(lexed));
                parsed.weight += 1;
                continue;
            }

            if (lexed[0].type === "space") {
                parsed.symbols.push(new AbcSymbol("space", 0));
                lexed.shift();
                continue;
            }

            if (lexed[0].type === "varient_section") {
                var symbol = lexed.shift();

                currentVarientEnding = {
                    start: null,
                    name: symbol.data,
                    end: null
                };

                continue;
            }

            if (noteGroup(parsed, lexed, "chord", "chord_start", "chord_stop")) continue;
            if (parseSlur(parsed, lexed)) continue;
            if (noteGroup(parsed, lexed, "grace", "grace_start", "grace_stop")) continue;

            if (lexed[0].type === "barline") {
                if (parseBarline(lexed, parsed) === 1) {
                    if (line.firstEndingEnder === null) line.firstEndingEnder = _.last(parsed.symbols);

                    if (currentVarientEnding !== null) {
                        currentVarientEnding.end = _.last(parsed.symbols);
                        line.endings.push(currentVarientEnding);
                        currentVarientEnding = null;
                    }
                }


                continue;
            }

            if (lexed[0].type === "tie") {
                lexed.shift();

                //the last parsed symbol must be a note
                if (_.last(parsed.symbols).type === "note") {
                    var tie = {
                        type: "tie",
                        start: _.last(parsed.symbols)
                    };

                    //eat the barline if required
                    if (lexed[0].type === "barline") parseBarline(lexed, parsed);

                    if (lexed[0].type === "note") {
                        parseNote(lexed, parsed);
                    } else {
                        //THROW ERROR
                        continue;
                    }

                    tie.end = _.last(parsed.symbols);

                    parsed.symbols.push(tie);
                } else {
                    //THROW ERROR
                    continue;
                }

                continue;
            }

            console.log("PARSER ERROR: UNKNOWN " + lexed[0]);
            lexed.shift();
        }

        if (currentVarientEnding !== null) {
            line.endings.push(currentVarientEnding);
            line.endWithEndingBar = true;
        }

        console.log("PARSED", parsed);
        return parsed;
    }

    function processAddedLine(line) {
        // try {

        if (line.raw.length === 0) {
            line.type = "drawable";
            line.di = drawableIndex++;
            line.symbols = [];
            line.weight = 0;
        }

        var lexed = lexer(line.raw, line.id);

        if (lexed.length > 0) {
            var parseOutput = parse(lexed, line);

            line.symbols = parseOutput.symbols;
            line.weight = parseOutput.weight;

            if (!(parseOutput.symbols.length === 1 && parseOutput.symbols[0].type_class === "data")) {
                line.type = "drawable";
                line.di = drawableIndex++;
            } else {
                line.type = "data";
            }
        } else {
            line.type = "drawable";
            line.parsed = [];
        }

        typecache.set(line.id, line.type);
        dicache.set(line.id, line.di);
    }

    var processDeletedLine = function (line) {
        line.type = typecache.get(line.id);
        if (typecache.get(line.id) === "drawable") {
            line.di = dicache.get(line.id);
        }
    };

    var processUnmodifiedLine = function (line) {
        if (typecache.get(line.id) === "drawable") drawableIndex++;
    };

    return function (lineCollection) {
        //if (lineCollection.startId === 0) drawableIndex = 0;
        if (lineCollection.startId < maxStartId) {
            drawableIndex = 0;
            for (var i = 0; i < lineCollection.startId; i++) {
                if (typecache.get(i) === "drawable") drawableIndex++;
            }
        }

        if (lineCollection.startId > maxStartId) {
            for (var i = maxStartId; i < lineCollection.startId; i++) {
                if (typecache.get(i) === "drawable") drawableIndex++;
            }
        }

        maxStartId = lineCollection.startId + lineCollection.count;

        if (lineCollection.action === "ADD") {
            lineCollection.lines.forEach(processAddedLine);
        }

        if (lineCollection.action === "DEL") {
            lineCollection.lines.forEach(processDeletedLine);
        }

        //if (lineCollection.action === "NONE") {
        //    lineCollection.lines.forEach(processUnmodifiedLine);
        //}

        return lineCollection;
    };
};

module.exports = ABCParser;

},{"./data_tables.js":"D:\\TimTech\\WebABC\\engine\\data_tables.js","./dispatcher":"D:\\TimTech\\WebABC\\engine\\dispatcher.js","./lexer.js":"D:\\TimTech\\WebABC\\engine\\lexer.js","./types":"D:\\TimTech\\WebABC\\engine\\types.js","./types/AbcChord":"D:\\TimTech\\WebABC\\engine\\types\\AbcChord.js","./types/AbcSymbol":"D:\\TimTech\\WebABC\\engine\\types\\AbcSymbol.js","./vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\types\\AbcSymbol.js":[function(require,module,exports){
"use strict";

////////////
// Symbol //
////////////

AbcSymbol = function (type, weight) {
    this.type = type;
    this.weight = weight || 0;
};

AbcSymbol.prototype.subType = "";
AbcSymbol.prototype.weight = 0;
AbcSymbol.prototype.visible = true;
AbcSymbol.prototype.xp = 0;
AbcSymbol.prototype.align = 0;


AbcSymbol.prototype.getX = function (leadInWidth, lineWidth) {
    return this.xp * (lineWidth - leadInWidth) + leadInWidth;
};


AbcNote = function () {
    AbcSymbol.call(this, "note");
};

AbcNote.prototype = Object.create(AbcSymbol.prototype);
AbcNote.prototype.beamDepth = 0;
AbcNote.prototype.octave = 4;
AbcNote.prototype.pitch = 0;
AbcNote.prototype.pos = 0;
AbcNote.prototype.truepos = 0;
AbcNote.prototype.letter = "";
AbcNote.prototype.accidentals = "";
AbcNote.prototype.noteLength = 1;
AbcNote.prototype.beams = [];
AbcNote.prototype.forceStem = 0;
AbcNote.prototype.beamOffsetFactor = 0;
AbcNote.prototype.y = null;
AbcNote.prototype.beamed = false;
AbcNote.prototype.chord = "";

AbcRest = function () {
    AbcSymbol.call(this, "rest", 1);
};

AbcRest.prototype.restLength = 1;

module.exports = {
    AbcNote: AbcNote,
    AbcSymbol: AbcSymbol
};

},{}],"D:\\TimTech\\WebABC\\engine\\types\\AbcChord.js":[function(require,module,exports){
"use strict";

////////////
// Symbol //
////////////

var chordRegex = /^([A-G](?:b|#)?)(m|min|maj|dim|aug|\+|sus)?(2|4|7|9|13)?(\/[A-G](?:b|#)?)?$/i;

var zaz = require('./../vendor.js').zazate;

window.zaz = zaz;

var transposeNote = function (note, a) {
    var transposedInt = zaz.notes.note_to_int(note.toUpperCase()) + a;
    var hashed = (transposedInt % 12 + 12) % 12;
    return zaz.notes.int_to_note(hashed);
};

AbcChord = function (text) {
    var _this = this;
    this.text = text;

    var regexTestResult = chordRegex.exec(text);

    if (regexTestResult === null) {
        this.parsed = false;
    } else {
        this.parsed = true;

        this.note = regexTestResult[1];
        this.type = regexTestResult[2];
        this.number = regexTestResult[3];
        this.base = regexTestResult[4];
    }

    this.getText = function (transpose) {
        if (!_this.parsed || transpose === 0) return _this.text;

        var output = transposeNote(_this.note, transpose);
        if (_this.type) output += _this.type;
        if (_this.number) output += _this.number;
        if (_this.base) output += "/" + transposeNote(_this.base.substr(1), transpose);
        return output;
    };
};

module.exports = {
    AbcChord: AbcChord };

},{"./../vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\lexer.js":[function(require,module,exports){
"use strict";

var _ = require('./vendor.js').lodash,
    Lexer = require('./vendor.js').lex,
    dispatcher = require("./dispatcher");

//////////////////////
// HELPER FUNCTIONS //
//////////////////////
var simpleType = function (name) {
    return function () {
        return {
            type: name
        };
    };
};

var charCountInString = function (string, character) {
    return string.split(character).length - 1;
};

var addSimpleStringInformationField = function (spec, key, type) {
    spec.start[key + ": *([^\n]*)\n?"] = function (data) {
        return {
            type_class: "data",
            type: type,
            data: data
        };
    };
};



function LexerException(message, line, char) {
    this.message = message;
    this.line = line;
    this.char = char;
    this.name = "LexerException";
}


////////////////////////////////
//            LEXER           //
////////////////////////////////

var lexer = new Lexer(function (char) {
    throw new LexerException("Unexpected '" + char + "'", 0, this.index);
});

///////////
// NOTES //
///////////
lexer.addRule(/([A-Ga-g])/, function (note) {
    return {
        type: "note",
        subType: "letter",
        data: note
    };
});

///////////
// RESTS //
///////////
lexer.addRule(/z/, function () {
    return {
        type: "rest",
        subType: "visible",
        data: "short"
    };
}).addRule(/x/, function () {
    return {
        type: "rest",
        subType: "invisible",
        data: "short"
    };
}).addRule(/Z/, function () {
    return {
        type: "rest",
        subType: "visible",
        data: "long"
    };
}).addRule(/X/, function () {
    return {
        type: "rest",
        subType: "invisible",
        data: "long"
    };
});

///////////////////////////////
// NOTE AND REST DECORATIONS //
///////////////////////////////
lexer.addRule(/([0-9]+)\/?([0-9]+)?/, function (all, notelength, notedenom) {
    return {
        type: "note",
        subType: "length",
        data: notedenom && notedenom.length > 0 ? parseFloat(notelength) / parseFloat(notedenom) : parseInt(notelength) };
}).addRule(/\/([0-9]+)/, function (all, notedenom) {
    return {
        type: "note",
        subType: "length",
        data: 1 / parseFloat(notedenom) };
}).addRule(/\/+/, function (all) {
    return {
        type: "note",
        subType: "length",
        data: 1 / all.length };
}).addRule(/([',]+)/, function (pitchModifier) {
    return {
        type: "note",
        subType: "pitch",
        data: charCountInString(pitchModifier, "'") - charCountInString(pitchModifier, ",")
    };
}).addRule(/(_|\^|=|__|\^\^)/, function (accidental) {
    return {
        type: "note",
        subType: "accidental",
        data: accidental
    };
}).addRule(/"([^"]+)"/, function (match, data) {
    return {
        type: "note",
        subType: "chord_annotation",
        data: data
    };
}).addRule(/!([^!]+)!/, function (data) {
    return {
        type: "note",
        subType: "decoration",
        data: data
    };
}).addRule(/~/, function (data) {
    return {
        type: "note",
        subType: "decoration",
        data: data
    };
}).addRule(/>{1,3}/, function (data) {
    return {
        type: "broken-rhythm",
        subType: "right",
        data: data.length
    };
}).addRule(/<{1,3}/, function (data) {
    return {
        type: "broken-rhythm",
        subType: "left",
        data: data.length
    };
});

///////////////
// BAR LINES //
///////////////
///
/// v indicates how the type of barline effects varient endings
/// #0 -> No effect
/// #1 -> Ends a varient ending
/// #2 -> Starts a varient ending
///
lexer.addRule(/\|/, function () {
    return {
        type: "barline",
        subtype: "normal",
        v: 0
    };
}).addRule(/\|\]/, function () {
    return {
        type: "barline",
        subtype: "heavy_end",
        v: 1
    };
}).addRule(/\|\|/, function () {
    return {
        type: "barline",
        subtype: "double",
        v: 1
    };
}).addRule(/\[\|/, function () {
    return {
        type: "barline",
        subtype: "heavy_start",
        v: 1
    };
}).addRule(/:\|/, function () {
    return {
        type: "barline",
        subtype: "repeat_end",
        v: 1
    };
}).addRule(/\|:/, function () {
    return {
        type: "barline",
        subtype: "repeat_start",
        v: 0
    };
}).addRule(/::/, function () {
    return {
        type: "barline",
        subtype: "double_repeat",
        v: 1
    };
}).addRule(/\[([0-9]+)/, function (all, sectionNumber) {
    return {
        type: "varient_section",
        subtype: "start_section",
        data: sectionNumber,
        v: 2
    };
}).addRule(/\["([a-z A-Z0-9]+)"/, function (all, sectionName) {
    return {
        type: "varient_section",
        subtype: "start_section",
        data: sectionName,
        v: 2
    };
});

/////////////////
// NOTE GROUPS //
/////////////////
lexer.addRule(/\[/, function () {
    return {
        type: "chord_start"
    };
}).addRule(/\]/, function () {
    return {
        type: "chord_stop"
    };
}).addRule(/{/, function () {
    return {
        type: "grace_start"
    };
}).addRule(/}/, function () {
    return {
        type: "grace_stop"
    };
}).addRule(/\(([2-9])/, function (all, size) {
    return {
        type: "tuplet_start",
        data: parseInt(size)
    };
}).addRule(/\(/, function () {
    return {
        type: "slur_start"
    };
}).addRule(/\)/, function () {
    return {
        type: "slur_stop"
    };
}).addRule(/-/, function () {
    return {
        type: "tie"
    };
});

//////////////////
// DATA FIELDS  //
//////////////////

lexer.addRule(/T: *([\w ',?]+)\s*$/, function (match, title) {
    return {
        type: "data",
        subtype: "title",
        data: title
    };
});

lexer.addRule(/X: *([0-9]+)\s*$/, function (match, num) {
    return {
        type: "data",
        subtype: "number",
        data: num
    };
});

lexer.addRule(/R: *([\w ]+)\s*$/, function (match, rhythm) {
    return {
        type: "data",
        subtype: "rhythm",
        data: rhythm
    };
});

lexer.addRule(/S: *([\w \/:\.#]+)\s*$/, function (match, source) {
    return {
        type: "data",
        subtype: "source",
        data: source
    };
});

lexer.addRule(/Z: *([\w \/:\.#]+)\s*$/, function (match, source) {
    return {
        type: "data",
        subtype: "transcriber",
        data: source
    };
});

lexer.addRule(/M: *([0-9]+)\/([0-9]+)\s*$/, function (match, top, bottom) {
    return {
        type: "data",
        subtype: "timesig",
        data: {
            top: top,
            bottom: bottom
        }
    };
});

lexer.addRule(/L: *([0-9]+)\/([0-9])\s*$/, function (match, top, bottom) {
    return {
        type: "data",
        subtype: "notelength",
        data: parseInt(top) / parseInt(bottom)
    };
});

lexer.addRule(/K: *([A-G][#|b]?) ?([\w]*)\s*$/, function (match, note, mode) {
    return {
        type: "data",
        subtype: "key",
        data: {
            note: note,
            mode: mode
        }
    };
});

///////////
// OTHER //
///////////
lexer.addRule(/ /, function () {
    return {
        type: "space"
    };
}).addRule(/`/, function () {
    return {
        type: "beam"
    };
});

module.exports = function (input, lineId) {
    lexer.setInput(input);
    var output = [],
        data = lexer.lex();

    while (data != undefined) {
        output.push(data);
        try {
            data = lexer.lex();
        } catch (e) {
            var error = {
                line: lineId,
                message: e.message,
                severity: 1,
                char: e.char,
                type: "LEXERERROR"
            };

            console.log(error);

            dispatcher.send("abc_error", error);

            break;
        }
    }

    return output;
};

},{"./dispatcher":"D:\\TimTech\\WebABC\\engine\\dispatcher.js","./vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\layout.js":[function(require,module,exports){
"use strict";

var enums = require("./types"),
    data_tables = require("./data_tables"),
    _ = require('./vendor.js').lodash,
    dispatcher = require("./dispatcher"),
    AbcBeam = require("./types/AbcBeam");

var ABCLayout = function () {
    var scoreLines = [];
    var tuneSettings = {
        key: {
            note: "C",
            mode: "Major"
        },
        measure: {
            top: 4,
            bottom: 4
        },
        title: "Untitled Tune"
    };

    var layoutDrawableLine = function (line) {
        if (line.symbols.length === 0) return line;

        var posMod = 1 / (line.weight + 1),
            totalOffset = 0,
            beamList = [],
            beamDepth = 0,
            lastNote = null;

        if (_.last(line.symbols).type === "barline") {
            posMod = 1 / line.weight;
        }

        for (var i = 0; i < line.symbols.length; i++) {
            if (line.symbols[i].type === "tie" || line.symbols[i].type === "varient-section" || line.symbols[i].type == "slur") continue;

            var currentSymbol = line.symbols[i];

            currentSymbol.xp = totalOffset;
            if (i === line.symbols.length - 1 && currentSymbol.type === "barline") {
                currentSymbol.xp = 1;
                currentSymbol.align = 2;
            }

            if (_.isFunction(data_tables.symbol_width[currentSymbol.type])) {
                totalOffset += data_tables.symbol_width[currentSymbol.type](currentSymbol) * posMod;
            } else {
                totalOffset += data_tables.symbol_width[currentSymbol.type] * posMod;
            }

            if (currentSymbol.type === "note") {
                currentSymbol.truepos = currentSymbol.pos + 7 * (currentSymbol.octave - 4);
                currentSymbol.y = 40 - currentSymbol.truepos * 4;
                currentSymbol.beams = [];
            }

            if (currentSymbol.beamDepth !== undefined && currentSymbol.beamDepth < 0) {
                if (currentSymbol.beamDepth <= beamDepth) {
                    if (currentSymbol.type === "note") beamList.push(currentSymbol);
                    beamDepth = currentSymbol.beamDepth;
                }
            } else {
                //draw beam
                //if(currentSymbol.type === "note")beamList.push(currentSymbol);
                if (beamList.length > 1) lastNote.beams.push(new AbcBeam(beamList));
                beamList = [];
                beamDepth = 0;
            }

            if (currentSymbol.type === "note") lastNote = currentSymbol;
        }

        if (beamList.length > 0) {
            //draw beam
            if (beamList.length > 1) lastNote.beams.push(new AbcBeam(beamList));
            beam_list = [];
            beam_depth = 0;
        }

        return line;
    };

    function handleDataLine(line) {
        if (line.symbols[0].type === "title") {
            tuneSettings.title = line.symbols[0].data;
            dispatcher.send("change_tune_title", line.symbols[0].data);
        }
        if (line.symbols[0].type === "rhythm") {
            tuneSettings.rhythm = line.symbols[0].data;
            dispatcher.send("change_rhythm", line.symbols[0].data);
        }
        if (line.symbols[0].type === "key") {
            tuneSettings.key = line.symbols[0].data;
            dispatcher.send("change_key", line.symbols[0].data);
        }
        if (line.symbols[0].type === "timesig") {
            tuneSettings.measure = line.symbols[0].data;
            dispatcher.send("change_timesig", line.symbols[0].data);
        }
    }

    var handleAction = {
        ADD: function (lineCollection) {
            //draw tune lines
            var renderedLines = lineCollection.lines.filter(function (line) {
                return !line.error && line.type === "drawable";
            }).map(layoutDrawableLine);


            //renderedLines[0].di IS UNDEFINED!!!!
            if (renderedLines.length > 0) {
                var args = [renderedLines[0].di, 0].concat(renderedLines);
                Array.prototype.splice.apply(scoreLines, args);
            }

            //draw or handle data lines
            lineCollection.lines.filter(function (line) {
                return !line.error && line.type === "data";
            }).forEach(handleDataLine);
        },
        DEL: function (lineCollection) {
            var dl = lineCollection.lines.filter(function (line) {
                return !line.error && line.type === "drawable";
            });

            if (dl.length > 0) {
                var removed_lines = scoreLines.splice(dl[0].di, dl.length);

                for (var i = dl[0].di; i < scoreLines.length; i++) {
                    scoreLines[i].id -= dl.length;
                }
            }
        }
    };

    return function (oldScoreLines, lineCollection) {
        lineCollection.action === "NONE" || handleAction[lineCollection.action](lineCollection);
        console.log("LAYOUT", scoreLines);
        return {
            scoreLines: scoreLines,
            tuneSettings: tuneSettings
        };
    };
};

module.exports = ABCLayout;

},{"./data_tables":"D:\\TimTech\\WebABC\\engine\\data_tables.js","./dispatcher":"D:\\TimTech\\WebABC\\engine\\dispatcher.js","./types":"D:\\TimTech\\WebABC\\engine\\types.js","./types/AbcBeam":"D:\\TimTech\\WebABC\\engine\\types\\AbcBeam.js","./vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\types\\AbcBeam.js":[function(require,module,exports){
"use strict";

var POS_SWITCH = 6;

AbcBeam = function (notes) {
    var hNote, lNote, hNoteIndex, lNoteIndex;

    var avgPos = this.avgPos = notes.reduce(function (a, b, i) {
        if (lNote === undefined || lNote.truepos > b.truepos) {
            lNote = b;
            lNoteIndex = i;
        }

        if (hNote === undefined || hNote.truepos < b.truepos) {
            hNote = b;
            hNoteIndex = i;
        }

        return a + b.truepos;
    }, 0) / notes.length;

    var downBeam = this.downBeam = avgPos > POS_SWITCH;

    notes.forEach(function (note) {
        note.forceStem = downBeam ? 1 : -1;
    });

    var baseNote = this.baseNote = this.downBeam ? lNote : hNote;
    this.baseNoteIndex = this.downBeam ? lNoteIndex : hNoteIndex;

    var x, y;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    for (var v = 0; v < notes.length; v++) {
        x = notes[v].xp; //notes[v].truepos;
        y = notes[v].truepos;
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
        count++;
    }

    var m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x) * 2;

    notes.forEach(function (note) {
        var xpDist = note.xp - baseNote.xp;
        var heightDiff = Math.abs(note.y - baseNote.y);
        note.beamOffsetFactor = xpDist * -m + baseNote.y + (downBeam ? 28 : -28);
        note.beamed = true;
    });

    this.gradient = m;
    this.depth = 0;
    this.notes = notes;
    this.count = notes.length;
};

AbcBeam.prototype.subType = "";
AbcBeam.prototype.weight = 0;

module.exports = AbcBeam;

},{}],"D:\\TimTech\\WebABC\\engine\\diff.js":[function(require,module,exports){
"use strict";

var enums = require("./types"),
    JsDiff = require('./vendor.js').jsDiff,
    LineCollection = require("./types/LineCollection");


var Diff = function (change) {
    console.log(change.newValue);

    var diff = JsDiff.diffLines(change.oldValue, change.newValue);

    //ensure deletions are before additions in changes
    for (var i = 0; i < diff.length; i++) {
        if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
            var swap = diff[i];
            diff[i] = diff[i + 1];
            diff[i + 1] = swap;
        }
    }

    var lineCount = 0;
    var output = [];

    for (var i = 0; i < diff.length; i++) {
        var item = diff[i],
            newlines = 0,
            split = [];

        split = item.value.split(/\r\n|\r|\n/);

        if (split[split.length - 1] === "") {
            split = split.slice(0, split.length - 1);
        }

        newlines = split.length;

        item.lineno = lineCount;

        var newLineCollection = new LineCollection(item.lineno, item.value, item.added ? "ADD" : item.removed ? "DEL" : "NONE");

        if (!item.removed) {
            lineCount += newlines;
        }

        if (newLineCollection.action != "NONE") output.push(newLineCollection);
    }

    return output;
};

module.exports = Diff;

},{"./types":"D:\\TimTech\\WebABC\\engine\\types.js","./types/LineCollection":"D:\\TimTech\\WebABC\\engine\\types\\LineCollection.js","./vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\types\\LineCollection.js":[function(require,module,exports){
"use strict";

/////////////
// ABCLine //
/////////////

AbcLine = function (raw, id) {
    this.raw = raw;
    this.id = id;
    this.endings = [];
    this.tuplets = [];
    this.firstEndingEnder = null;
};

AbcLine.prototype.type = "hidden";
AbcLine.prototype.di = -1;
AbcLine.prototype.parsed = [];
AbcLine.prototype.weight = 0;
AbcLine.prototype.error = false;
AbcLine.prototype.changed = false;
AbcLine.prototype.endWithEndingBar = false;

///////////////////
//LineCollection //
///////////////////

LineCollection = function (id, raw, action) {
    var split = raw.split(/\r\n|\r|\n/);

    if (split[split.length - 1] === "") {
        split = split.slice(0, split.length - 1);
    }

    this.lines = split.map(function (line, i) {
        return new AbcLine(line, i + id);
    });

    this.count = this.lines.length;

    this.action = action;

    this.startId = id;
};

module.exports = LineCollection;

},{}],"D:\\TimTech\\WebABC\\engine\\audio_render.js":[function(require,module,exports){
"use strict";

var data_tables = require("./data_tables.js");

//transforms a tune into an array that can be played by the audio system
var audioRender = function (tune) {
	var outTune = [];

	var keyModifier = data_tables.getKeyModifiers(tune.tuneSettings.key);

	tune.scoreLines.forEach(function (line) {
		line.symbols.filter(function (symbol) {
			return symbol.type === "note";
		}).forEach(function (note) {
			var pitch = note.pitch + (note.octave - 4) * 12;
			if (_.indexOf(keyModifier.notes, note.note) !== -1) pitch += keyModifier.mod;
			outTune.push([pitch, note.noteLength * 16]);
		});
	});

	return outTune;
};

module.exports = audioRender;

},{"./data_tables.js":"D:\\TimTech\\WebABC\\engine\\data_tables.js"}],"D:\\TimTech\\WebABC\\engine\\data_tables.js":[function(require,module,exports){
"use strict";

var data_tables = {},
    dispatcher = require("./dispatcher"),
    zazate = require('./vendor.js').zazate,
    _ = require('./vendor.js').lodash;

data_tables.notes = {
    C: {
        octave: 4,
        pitch: 60,
        pos: 0
    },
    D: {
        octave: 4,
        pitch: 62,
        pos: 1
    },
    E: {
        octave: 4,
        pitch: 64,
        pos: 2
    },
    F: {
        octave: 4,
        pitch: 65,
        pos: 3
    },
    G: {
        octave: 4,
        pitch: 67,
        pos: 4
    },
    A: {
        octave: 4,
        pitch: 69,
        pos: 5
    },
    B: {
        octave: 4,
        pitch: 71,
        pos: 6
    },
    c: {
        octave: 5,
        pitch: 60,
        pos: 0
    },
    d: {
        octave: 5,
        pitch: 62,
        pos: 1
    },
    e: {
        octave: 5,
        pitch: 64,
        pos: 2
    },
    f: {
        octave: 5,
        pitch: 65,
        pos: 3
    },
    g: {
        octave: 5,
        pitch: 67,
        pos: 4
    },
    a: {
        octave: 5,
        pitch: 69,
        pos: 5
    },
    b: {
        octave: 5,
        pitch: 71,
        pos: 6
    } };

data_tables.symbol_width = {
    note: function (note) {
        return Math.log(note.noteLength + 1);
        //return note.noteLength * 1;//* 1.618;
    },
    rest: 1,
    beat_rest: 1,
    barline: 1,
    space: 0,
    chord_annotation: 0
};

data_tables.mode_map = {
    "": "maj",
    ion: "maj",
    maj: "maj",

    m: "min",
    min: "min",
    aeo: "min",

    mix: "mix",
    dor: "dor",
    phr: "phr",
    lyd: "lyd",
    loc: "loc"
};

data_tables.keySig = {
    C: {
        maj: "0",
        min: "-3",
        mix: "-1",
        dor: "-2",
        phr: "-4",
        lyd: "1",
        loc: "-5"
    },
    "C#": {
        maj: "7",
        min: "4",
        mix: "6",
        dor: "5",
        phr: "3",
        lyd: "NOPE",
        loc: "2"
    },
    Db: {
        maj: "-5",
        min: "NOPE",
        mix: "-6",
        dor: "-7",
        phr: "NOPE",
        lyd: "-4",
        loc: "NOPE"
    },
    D: {
        maj: "2",
        min: "-1",
        mix: "1",
        dor: "0",
        phr: "-2",
        lyd: "3",
        loc: "-3"
    },
    "D#": {
        maj: "6",
        min: "NOPE",
        mix: "NOPE",
        dor: "7",
        phr: "5",
        lyd: "",
        loc: "4"
    },
    Eb: {
        maj: "-3",
        min: "-6",
        mix: "-4",
        dor: "-5",
        phr: "-7",
        lyd: "-2",
        loc: "NOPE"
    },
    E: {
        maj: "4",
        min: "1",
        mix: "3",
        dor: "2",
        phr: "0",
        lyd: "5",
        loc: "-1"
    },
    "E#": {
        maj: "NOPE",
        min: "NOPE",
        mix: "NOPE",
        dor: "NOPE",
        phr: "7",
        lyd: "NOPE",
        loc: "6"
    },
    Fb: {
        maj: "NOPE",
        min: "NOPE",
        mix: "NOPE",
        dor: "NOPE",
        phr: "NOPE",
        lyd: "-7",
        loc: "NOPE"
    },
    F: {
        maj: "-1",
        min: "-4",
        mix: "-2",
        dor: "-3",
        phr: "-5",
        lyd: "0",
        loc: "-6"
    },
    "F#": {
        maj: "6",
        min: "3",
        mix: "5",
        dor: "4",
        phr: "2",
        lyd: "7",
        loc: "1"
    },
    Gb: {
        maj: "-6",
        min: "NOPE",
        mix: "-7",
        dor: "NOPE",
        phr: "NOPE",
        lyd: "-5",
        loc: "NOPE"
    },
    G: {
        maj: "1",
        min: "-2",
        mix: "0",
        dor: "-1",
        phr: "-3",
        lyd: "2",
        loc: "-4"
    },
    "G#": {
        maj: "NOPE",
        min: "5",
        mix: "7",
        dor: "6",
        phr: "4",
        lyd: "NOPE",
        loc: "3"
    },
    Ab: {
        maj: "-4",
        min: "-7",
        mix: "-5",
        dor: "-6",
        phr: "NOPE",
        lyd: "-3",
        loc: "NOPE"
    },
    A: {
        maj: "3",
        min: "0",
        mix: "2",
        dor: "1",
        phr: "-1",
        lyd: "4",
        loc: "-2"
    },
    "A#": {
        maj: "NOPE",
        min: "7",
        mix: "NOPE",
        dor: "NOPE",
        phr: "6",
        lyd: "NOPE",
        loc: "5"
    },
    Bb: {
        maj: "-2",
        min: "-5",
        mix: "-3",
        dor: "-4",
        phr: "-6",
        lyd: "-1",
        loc: "-7"
    },
    B: {
        maj: "5",
        min: "2",
        mix: "4",
        dor: "3",
        phr: "1",
        lyd: "6",
        loc: "0"
    },
    "B#": {
        maj: "NOPE",
        min: "NOPE",
        mix: "NOPE",
        dor: "NOPE",
        phr: "NOPE",
        lyd: "NOPE",
        loc: "7"
    },
    Cb: {
        maj: "-7",
        min: "NOPE",
        mix: "NOPE",
        dor: "NOPE",
        phr: "NOPE",
        lyd: "-6",
        loc: "NOPE"
    }
};

var majorMode = {
    "-7": "Cb",
    "-6": "Gb",
    "-5": "Db",
    "-4": "Ab",
    "-3": "Eb",
    "-2": "Bb",
    "-1": "F",
    "0": "C",
    "1": "G",
    "2": "D",
    "3": "A",
    "4": "E",
    "5": "B",
    "6": "F#",
    "7": "C#"
};

data_tables.normaliseMode = function (mode) {
    return mode.toLowerCase().substr(0, 3);
};

window.toMajorMode = function (note, mode) {
    var norm = data_tables.normaliseMode(mode);
    var middle = data_tables.mode_map[norm];
    var key = majorMode[data_tables.keySig[note][middle]];

    var chords = [];

    chords.push(zazate.chords.I(key));
    chords.push(zazate.chords.II(key));
    chords.push(zazate.chords.III(key));
    chords.push(zazate.chords.IV(key));
    chords.push(zazate.chords.V(key));
    chords.push(zazate.chords.VI(key));
    chords.push(zazate.chords.VII(key));

    var indexOfRootNote = _.findIndex(chords, function (c) {
        return c[0] === note;
    });

    while (indexOfRootNote > 0) {
        indexOfRootNote--;
        chords.push(chords.shift());
    }

    return chords.map(function (c) {
        return zazate.chords.determine(c, true)[0];
    });
};

window.gkm = data_tables.getKeyModifiers = function (key) {
    var norm = data_tables.normaliseMode(key.mode);
    var middle = data_tables.mode_map[norm];
    var meh = parseInt(data_tables.keySig[key.note][middle]);

    console.log(meh);

    if (meh > 0) {
        var range = _.range(-1, meh - 1);
        return {
            mod: 1,
            notes: range.map(function (r) {
                return majorMode[r];
            })
        };
    }

    if (meh < 0) {
        var range = _.range(5, meh + 5, -1);
        return {
            mod: -1,
            notes: range.map(function (r) {
                return majorMode[r];
            })
        };
    }

    return {
        mod: 0,
        notes: []
    };
};


data_tables.getKeySig = function (note, mode) {
    var normalisedMode = data_tables.mode_map[data_tables.normaliseMode(mode)];

    return parseInt(data_tables.keySig[note][normalisedMode]);
};

data_tables.flats = [6, 9, 5, 8, 4, 7, 3];
data_tables.sharps = [10, 7, 11, 8, 5, 9, 6];

//not all note lengths can be represented with a single note
data_tables.allowed_note_lengths = [1, 2, 3, 4, 6, 7, 8, 12, 14, 16, 24, 28];

module.exports = data_tables;

},{"./dispatcher":"D:\\TimTech\\WebABC\\engine\\dispatcher.js","./vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\audio\\audio.js":[function(require,module,exports){
"use strict";

var midiGen = require("./midi");

var dispatcher = require("../dispatcher");

var context = new AudioContext();
var source = 0;
var audioBufferSize = 8192;
var waveBuffer;
var midiFileBuffer;
var read_wave_bytes = 0;
var song = 0;
var midijs_url = "";

var num_missing = 0;
var midiFileArray;
var stream;
var rval;

function get_next_wave(ev) {
    // collect new wave data from libtimidity into waveBuffer
    read_wave_bytes = Module.ccall("mid_song_read_wave", "number", ["number", "number", "number", "number"], [song, waveBuffer, audioBufferSize * 2, false]);
    if (0 == read_wave_bytes) {
        dispatcher.send("end-of-tune");
        stop();
        return;
    }

    var max_i16 = Math.pow(2, 15);
    for (var i = 0; i < audioBufferSize; i++) {
        if (i < read_wave_bytes) {
            // convert PCM data from C sint16 to JavaScript number (range -1.0 .. +1.0)
            ev.outputBuffer.getChannelData(0)[i] = Module.getValue(waveBuffer + 2 * i, "i16") / max_i16;
        } else {
            ev.outputBuffer.getChannelData(0)[i] = 0; // fill end of buffer with zeroes, may happen at the end of a piece
        }
    }
}

function loadMissingPatch(url, path, filename) {
    var request = new XMLHttpRequest();
    request.open("GET", path + filename, true);
    request.responseType = "arraybuffer";

    request.onerror = function () {};

    request.onload = function () {
        if (200 != request.status) {
            //MIDIjs.message_callback("Error: Cannot retrieve patch filee " + path + filename + " : " + request.status);
            return;
        }

        num_missing--;
        FS.createDataFile("pat/", filename, new Int8Array(request.response), true, true);
        //MIDIjs.message_callback("Loading instruments: " + num_missing);
        if (num_missing == 0) {
            stream = Module.ccall("mid_istream_open_mem", "number", ["number", "number", "number"], [midiFileBuffer, midiFileArray.length, false]);
            var MID_AUDIO_S16LSB = 32784; // signed 16-bit samples
            var options = Module.ccall("mid_create_options", "number", ["number", "number", "number", "number"], [context.sampleRate, MID_AUDIO_S16LSB, 1, audioBufferSize * 2]);
            song = Module.ccall("mid_song_load", "number", ["number", "number"], [stream, options]);
            rval = Module.ccall("mid_istream_close", "number", ["number"], [stream]);
            Module.ccall("mid_song_start", "void", ["number"], [song]);

            // create script Processor with buffer of size audioBufferSize and a single output channel
            source = context.createScriptProcessor(audioBufferSize, 0, 1);
            waveBuffer = Module._malloc(audioBufferSize * 2);
            source.onaudioprocess = get_next_wave; // add eventhandler for next buffer full of audio data
            source.connect(context.destination); // connect the source to the context's destination (the speakers)
        }
    };
    request.send();
}

var play = function (base64) {
    midiFileArray = base64;
    midiFileBuffer = Module._malloc(midiFileArray.length);
    Module.writeArrayToMemory(midiFileArray, midiFileBuffer);

    rval = Module.ccall("mid_init", "number", [], []);
    stream = Module.ccall("mid_istream_open_mem", "number", ["number", "number", "number"], [midiFileBuffer, midiFileArray.length, false]);
    var MID_AUDIO_S16LSB = 32784; // signed 16-bit samples
    var options = Module.ccall("mid_create_options", "number", ["number", "number", "number", "number"], [context.sampleRate, MID_AUDIO_S16LSB, 1, audioBufferSize * 2]);
    song = Module.ccall("mid_song_load", "number", ["number", "number"], [stream, options]);
    rval = Module.ccall("mid_istream_close", "number", ["number"], [stream]);

    num_missing = Module.ccall("mid_song_get_num_missing_instruments", "number", ["number"], [song]);
    if (0 < num_missing) {
        for (var i = 0; i < num_missing; i++) {
            var missingPatch = Module.ccall("mid_song_get_missing_instrument", "string", ["number", "number"], [song, i]);
            loadMissingPatch("", "/pat/", missingPatch);
        }
    } else {
        Module.ccall("mid_song_start", "void", ["number"], [song]);
        // create script Processor with auto buffer size and a single output channel
        source = context.createScriptProcessor(audioBufferSize, 0, 1);
        waveBuffer = Module._malloc(audioBufferSize * 2);
        source.onaudioprocess = get_next_wave; // add eventhandler for next buffer full of audio data
        source.connect(context.destination); // connect the source to the context's destination (the speakers)
    }
};

var stop = function () {
    if (source) {
        // terminate playback
        source.disconnect();

        // hack: without this, Firfox 25 keeps firing the onaudioprocess callback
        source.onaudioprocess = 0;

        source = 0;

        // free libtimitdiy ressources
        Module._free(waveBuffer);
        Module._free(midiFileBuffer);
        Module.ccall("mid_song_free", "void", ["number"], [song]);
        song = 0;
        Module.ccall("mid_exit", "void", [], []);
        source = 0;
    }
};

var playTune = function (tuneData) {
    var noteEvents = [];
    tuneData.forEach(function (note) {
        noteEvents.push(midiGen.MidiEvent.noteOn({ pitch: note[0], duration: 16 }));
        noteEvents.push(midiGen.MidiEvent.noteOff({ pitch: note[0], duration: note[1] }));
    });

    // Create a track that contains the events to play the notes above
    var track = new midiGen.MidiTrack({ events: noteEvents });

    var song = midiGen.MidiWriter({ tracks: [track] });

    var convertDataURIToBinary = function (raw) {
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for (var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    };

    // Creates an object that contains the final MIDI track in base64 and some
    // useful methods.
    var song = convertDataURIToBinary(song);

    play(song);
};


module.exports = {
    play: playTune,
    stop: stop
};
// MIDIjs.message_callback("Error: Cannot retrieve patch file " + path + filename);

},{"../dispatcher":"D:\\TimTech\\WebABC\\engine\\dispatcher.js","./midi":"D:\\TimTech\\WebABC\\engine\\audio\\midi.js"}],"D:\\TimTech\\WebABC\\engine\\dispatcher.js":[function(require,module,exports){
"use strict";

var _ = require('./vendor.js').lodash;

var subscribers = new Map(),
    afterSubscribers = new Map();

var disconnectId = 0;

function send(eventName, data) {
    if (!subscribers.has(eventName)) {
        console.log("No subscribers for " + eventName, data);
    }

    _(subscribers.get(eventName)).forEach(function (sub) {
        sub.f(data);
    });

    _(afterSubscribers.get(eventName)).forEach(function (sub) {
        sub.f(data);
    });
}

function subscribeEvent(subList, eventName, func) {
    var connection = {
        id: disconnectId,
        f: func
    };

    disconnectId++;

    if (subList.has(eventName)) {
        subList.get(eventName).push(connection);
    } else {
        subList.set(eventName, [connection]);
    }

    return disconnectId - 1;
}

function on(eventName, func) {
    if (_.isObject(eventName) && func === undefined) {
        for (var propt in eventName) {
            subscribeEvent(subscribers, propt, eventName[propt]);
        }
    } else {
        return subscribeEvent(subscribers, eventName, func);
    }
}

function off(id) {
    subscribers.forEach(function (value, key) {
        var toRemove = _.findIndex(value, function (v) {
            return v.id === id;
        });
        if (toRemove !== -1) {
            value.splice(toRemove, 1);
        }
    });
}

function after(eventName, func) {
    if (_.isObject(eventName) && func === undefined) {
        for (var propt in eventName) {
            subscribeEvent(afterSubscribers, propt, eventName[propt]);
        }
    } else {
        subscribeEvent(afterSubscribers, eventName, func);
    }
}

module.exports = {
    on: on,
    off: off,
    send: send,
    after: after
};

},{"./vendor.js":"D:\\TimTech\\WebABC\\engine\\vendor.js"}],"D:\\TimTech\\WebABC\\engine\\audio\\midi.js":[function(require,module,exports){
"use strict";

/*jslint es5: true, laxbreak: true */

var AP = Array.prototype;

// Create a mock console object to void undefined errors if the console object
// is not defined.
if (!window.console || !console.firebug) {
    var names = ["log", "debug", "info", "warn", "error"];

    window.console = {};
    for (var i = 0; i < names.length; ++i) {
        window.console[names[i]] = function () {};
    }
}

var DEFAULT_VOLUME = 90;
var DEFAULT_DURATION = 128;
var DEFAULT_CHANNEL = 0;

// These are the different values that compose a MID header. They are already
// expressed in their string form, so no useless conversion has to take place
// since they are constants.

var HDR_CHUNKID = "MThd";
var HDR_CHUNK_SIZE = "\u0000\u0000\u0000\u0006"; // Header size for SMF
var HDR_TYPE0 = "\u0000\u0000"; // Midi Type 0 id
var HDR_TYPE1 = "\u0000\u0001"; // Midi Type 1 id
var HDR_SPEED = "\u0000"; // Defaults to 128 ticks per beat

// Midi event codes
var EVT_NOTE_OFF = 8;
var EVT_NOTE_ON = 9;
var EVT_AFTER_TOUCH = 10;
var EVT_CONTROLLER = 11;
var EVT_PROGRAM_CHANGE = 12;
var EVT_CHANNEL_AFTERTOUCH = 13;
var EVT_PITCH_BEND = 14;

var META_SEQUENCE = 0;
var META_TEXT = 1;
var META_COPYRIGHT = 2;
var META_TRACK_NAME = 3;
var META_INSTRUMENT = 4;
var META_LYRIC = 5;
var META_MARKER = 6;
var META_CUE_POINT = 7;
var META_CHANNEL_PREFIX = 32;
var META_END_OF_TRACK = 47;
var META_TEMPO = 81;
var META_SMPTE = 84;
var META_TIME_SIG = 88;
var META_KEY_SIG = 89;
var META_SEQ_EVENT = 127;

// This is the conversion table from notes to its MIDI number. Provided for
// convenience, it is not used in this code.
var noteTable = { G9: 127, Gb9: 126, F9: 125, E9: 124, Eb9: 123,
    D9: 122, Db9: 121, C9: 120, B8: 119, Bb8: 118, A8: 117, Ab8: 116,
    G8: 115, Gb8: 114, F8: 113, E8: 112, Eb8: 111, D8: 110, Db8: 109,
    C8: 108, B7: 107, Bb7: 106, A7: 105, Ab7: 104, G7: 103, Gb7: 102,
    F7: 101, E7: 100, Eb7: 99, D7: 98, Db7: 97, C7: 96, B6: 95,
    Bb6: 94, A6: 93, Ab6: 92, G6: 91, Gb6: 90, F6: 89, E6: 88,
    Eb6: 87, D6: 86, Db6: 85, C6: 84, B5: 83, Bb5: 82, A5: 81,
    Ab5: 80, G5: 79, Gb5: 78, F5: 77, E5: 76, Eb5: 75, D5: 74,
    Db5: 73, C5: 72, B4: 71, Bb4: 70, A4: 69, Ab4: 68, G4: 67,
    Gb4: 66, F4: 65, E4: 64, Eb4: 63, D4: 62, Db4: 61, C4: 60,
    B3: 59, Bb3: 58, A3: 57, Ab3: 56, G3: 55, Gb3: 54, F3: 53,
    E3: 52, Eb3: 51, D3: 50, Db3: 49, C3: 48, B2: 47, Bb2: 46,
    A2: 45, Ab2: 44, G2: 43, Gb2: 42, F2: 41, E2: 40, Eb2: 39,
    D2: 38, Db2: 37, C2: 36, B1: 35, Bb1: 34, A1: 33, Ab1: 32,
    G1: 31, Gb1: 30, F1: 29, E1: 28, Eb1: 27, D1: 26, Db1: 25,
    C1: 24, B0: 23, Bb0: 22, A0: 21, Ab0: 20, G0: 19, Gb0: 18,
    F0: 17, E0: 16, Eb0: 15, D0: 14, Db0: 13, C0: 12 };

// Helper functions

/*
 * Converts a string into an array of ASCII char codes for every character of
 * the string.
 *
 * @param str {String} String to be converted
 * @returns array with the charcode values of the string
 */
function StringToNumArray(str) {
    return AP.map.call(str, function (char) {
        return char.charCodeAt(0);
    });
}

/*
 * Converts an array of bytes to a string of hexadecimal characters. Prepares
 * it to be converted into a base64 string.
 *
 * @param byteArray {Array} array of bytes that will be converted to a string
 * @returns hexadecimal string
 */
function codes2Str(byteArray) {
    return String.fromCharCode.apply(null, byteArray);
}

/*
 * Converts a String of hexadecimal values to an array of bytes. It can also
 * add remaining "0" nibbles in order to have enough bytes in the array as the
 * |finalBytes| parameter.
 *
 * @param str {String} string of hexadecimal values e.g. "097B8A"
 * @param finalBytes {Integer} Optional. The desired number of bytes that the returned array should contain
 * @returns array of nibbles.
 */

function str2Bytes(str, finalBytes) {
    if (finalBytes) {
        while (str.length / 2 < finalBytes) {
            str = "0" + str;
        }
    }

    var bytes = [];
    for (var i = str.length - 1; i >= 0; i = i - 2) {
        var chars = i === 0 ? str[i] : str[i - 1] + str[i];
        bytes.unshift(parseInt(chars, 16));
    }

    return bytes;
}

function isArray(obj) {
    return !!(obj && obj.concat && obj.unshift && !obj.callee);
}


/**
 * Translates number of ticks to MIDI timestamp format, returning an array of
 * bytes with the time values. Midi has a very particular time to express time,
 * take a good look at the spec before ever touching this function.
 *
 * @param ticks {Integer} Number of ticks to be translated
 * @returns Array of bytes that form the MIDI time value
 */
var translateTickTime = function (ticks) {
    var buffer = ticks & 127;

    while (ticks = ticks >> 7) {
        buffer <<= 8;
        buffer |= ticks & 127 | 128;
    }

    var bList = [];
    while (true) {
        bList.push(buffer & 255);

        if (buffer & 128) {
            buffer >>= 8;
        } else {
            break;
        }
    }
    return bList;
};

/*
 * This is the function that assembles the MIDI file. It writes the
 * necessary constants for the MIDI header and goes through all the tracks, appending
 * their data to the final MIDI stream.
 * It returns an object with the final values in hex and in base64, and with
 * some useful methods to play an manipulate the resulting MIDI stream.
 *
 * @param config {Object} Configuration object. It contains the tracks, tempo
 * and other values necessary to generate the MIDI stream.
 *
 * @returns An object with the hex and base64 resulting streams, as well as
 * with some useful methods.
 */

var MidiWriter = function (config) {
    if (config) {
        var tracks = config.tracks || [];
        // Number of tracks in hexadecimal
        var tracksLength = tracks.length.toString(16);

        // This variable will hold the whole midi stream and we will add every
        // chunk of MIDI data to it in the next lines.
        var hexMidi = HDR_CHUNKID + HDR_CHUNK_SIZE + HDR_TYPE0;

        // Appends the number of tracks expressed in 2 bytes, as the MIDI
        // standard requires.
        hexMidi += codes2Str(str2Bytes(tracksLength, 2));
        hexMidi += HDR_SPEED;
        // Goes through the tracks appending the hex strings that compose them.
        tracks.forEach(function (trk) {
            hexMidi += codes2Str(trk.toBytes());
        });

        return hexMidi;
    } else {
        throw new Error("No parameters have been passed to MidiWriter.");
    }
};











/*
 * Generic MidiEvent object. This object is used to create standard MIDI events
 * (note Meta events nor SysEx events). It is passed a |params| object that may
 * contain the keys time, type, channel, param1 and param2. Note that only the
 * type, channel and param1 are strictly required. If the time is not provided,
 * a time of 0 will be assumed.
 *
 * @param {object} params Object containing the properties of the event.
 */
var MidiEvent = function (params) {
    if (params && (params.type !== null || params.type !== undefined) && (params.channel !== null || params.channel !== undefined) && (params.param1 !== null || params.param1 !== undefined)) {
        this.setTime(params.time);
        this.setType(params.type);
        this.setChannel(params.channel);
        this.setParam1(params.param1);
        this.setParam2(params.param2);
    } else {
        throw new Error("Not enough parameters to create an event.");
    }
};

/**
 * Returns an event of the type NOTE_ON taking the values passed and falling
 * back to defaults if they are not specified.
 *
 * @param note {Note || String} Note object or string
 * @param time {Number} Duration of the note in ticks
 * @returns MIDI event with type NOTE_ON for the note specified
 */
MidiEvent.noteOn = function (note, duration) {
    return new MidiEvent({
        time: note.duration || duration || 0,
        type: EVT_NOTE_ON,
        channel: note.channel || DEFAULT_CHANNEL,
        param1: note.pitch || note,
        param2: note.volume || DEFAULT_VOLUME
    });
};

/**
 * Returns an event of the type NOTE_OFF taking the values passed and falling
 * back to defaults if they are not specified.
 *
 * @param note {Note || String} Note object or string
 * @param time {Number} Duration of the note in ticks
 * @returns MIDI event with type NOTE_OFF for the note specified
 */

MidiEvent.noteOff = function (note, duration) {
    return new MidiEvent({
        time: note.duration || duration || 0,
        type: EVT_NOTE_OFF,
        channel: note.channel || DEFAULT_CHANNEL,
        param1: note.pitch || note,
        param2: note.volume || DEFAULT_VOLUME
    });
};


MidiEvent.prototype = {
    type: 0,
    channel: 0,
    time: 0,
    setTime: function (ticks) {
        // The 0x00 byte is always the last one. This is how Midi
        // interpreters know that the time measure specification ends and the
        // rest of the event signature starts.

        this.time = translateTickTime(ticks || 0);
    },
    setType: function (type) {
        if (type < EVT_NOTE_OFF || type > EVT_PITCH_BEND) {
            throw new Error("Trying to set an unknown event: " + type);
        }

        this.type = type;
    },
    setChannel: function (channel) {
        if (channel < 0 || channel > 15) {
            throw new Error("Channel is out of bounds.");
        }

        this.channel = channel;
    },
    setParam1: function (p) {
        this.param1 = p;
    },
    setParam2: function (p) {
        this.param2 = p;
    },
    toBytes: function () {
        var byteArray = [];

        var typeChannelByte = parseInt(this.type.toString(16) + this.channel.toString(16), 16);

        byteArray.push.apply(byteArray, this.time);
        byteArray.push(typeChannelByte);
        byteArray.push(this.param1);

        // Some events don't have a second parameter
        if (this.param2 !== undefined && this.param2 !== null) {
            byteArray.push(this.param2);
        }
        return byteArray;
    }
};


///
/// META EVENT
///

var MetaEvent = function (params) {
    if (params) {
        this.setType(params.type);
        this.setData(params.data);
    }
};

MetaEvent.prototype = {
    setType: function (t) {
        this.type = t;
    },
    setData: function (d) {
        this.data = d;
    },
    toBytes: function () {
        if (!this.type || !this.data) {
            throw new Error("Type or data for meta-event not specified.");
        }

        var byteArray = [255, this.type];

        // If data is an array, we assume that it contains several bytes. We
        // apend them to byteArray.
        if (isArray(this.data)) {
            AP.push.apply(byteArray, this.data);
        }

        return byteArray;
    }
};

///
/// MIDI TRACK
///

var MidiTrack = function (cfg) {
    this.events = [];
    for (var p in cfg) {
        if (cfg.hasOwnProperty(p)) {
            // Get the setter for the property. The property is capitalized.
            // Probably a try/catch should go here.
            this["set" + p.charAt(0).toUpperCase() + p.substring(1)](cfg[p]);
        }
    }
};

//"MTrk" Marks the start of the track data
MidiTrack.TRACK_START = [77, 84, 114, 107];
MidiTrack.TRACK_END = [0, 255, 47, 0];

MidiTrack.prototype = {
    /*
     * Adds an event to the track.
     *
     * @param event {MidiEvent} Event to add to the track
     * @returns the track where the event has been added
     */
    addEvent: function (event) {
        this.events.push(event);
        return this;
    },
    setEvents: function (events) {
        AP.push.apply(this.events, events);
        return this;
    },
    /*
     * Adds a text meta-event to the track.
     *
     * @param type {Number} type of the text meta-event
     * @param text {String} Optional. Text of the meta-event.
     * @returns the track where the event ahs been added
     */
    setText: function (type, text) {
        // If the param text is not specified, it is assumed that a generic
        // text is wanted and that the type parameter is the actual text to be
        // used.
        if (!text) {
            type = META_TEXT;
            text = type;
        }
        return this.addEvent(new MetaEvent({ type: type, data: text }));
    },
    // The following are setters for different kinds of text in MIDI, they all
    // use the |setText| method as a proxy.
    setCopyright: function (text) {
        return this.setText(META_COPYRIGHT, text);
    },
    setTrackName: function (text) {
        return this.setText(META_TRACK_NAME, text);
    },
    setInstrument: function (text) {
        return this.setText(META_INSTRUMENT, text);
    },
    setLyric: function (text) {
        return this.setText(META_LYRIC, text);
    },
    setMarker: function (text) {
        return this.setText(META_MARKER, text);
    },
    setCuePoint: function (text) {
        return this.setText(META_CUE_POINT, text);
    },

    setTempo: function (tempo) {
        this.addEvent(new MetaEvent({ type: META_TEMPO, data: tempo }));
    },
    setTimeSig: function () {},
    setKeySig: function () {},

    toBytes: function () {
        var trackLength = 0;
        var eventBytes = [];
        var startBytes = MidiTrack.TRACK_START;
        var endBytes = MidiTrack.TRACK_END;

        /*
         * Adds the bytes of an event to the eventBytes array and add the
         * amount of bytes to |trackLength|.
         *
         * @param event {MidiEvent} MIDI event we want the bytes from.
         */
        var addEventBytes = function (event) {
            var bytes = event.toBytes();
            trackLength += bytes.length;
            AP.push.apply(eventBytes, bytes);
        };

        this.events.forEach(addEventBytes);

        // Add the end-of-track bytes to the sum of bytes for the track, since
        // they are counted (unlike the start-of-track ones).
        trackLength += endBytes.length;

        // Makes sure that track length will fill up 4 bytes with 0s in case
        // the length is less than that (the usual case).
        var lengthBytes = str2Bytes(trackLength.toString(16), 4);

        return startBytes.concat(lengthBytes, eventBytes, endBytes);
    }
};


module.exports = {
    MidiWriter: MidiWriter,
    MidiEvent: MidiEvent,
    MetaEvent: MetaEvent,
    MidiTrack: MidiTrack,
    noteTable: noteTable
};
// TBD
// TBD

},{}]},{},["./engine/engine.js"]);
