var wallColor = "rgb(30,30,30)";
var initialScore = 9999;

var mapWidth = 5;
var mapHeight = 5;
var map = [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 0]
];

var valueAt = function(x, y) {
    return map[y][x];
};

var setValueAt = function (x, y, value) {
    map[y][x] = value;
};

var allNodes = {};

var setMapSize = function(width, height) {
    mapWidth = width;
    mapHeight = height;
    allNodes = {};
    map = [];
    var mapRow;
    for (var i = 0; i < height; i++) {
        mapRow = [];
        for (var j = 0; j < width; j++) {
            mapRow.push(0);
        }
        map.push(mapRow);
    }
};

var getNode = function (x, y, draw) {
    var node = allNodes[x + ':' + y];
    if (node === null || node === undefined) {
        var isClear = valueAt(x, y) === 0;
        node = {
            x: x,
            y: y,
            isClear: isClear,
            gScore: initialScore,
            fScore: initialScore,
            cameFrom: null
        };
        allNodes[x + ':' + y] = node;
    }
    if (draw && draw === true) {
        drawNode(node, context, 'rgba(200,0,0,0.1)');
    }
    return node;
};

// Return the straight-line distance between start and goal, the shortest possible distance.
var heuristicCostEstimate = function (start, goal) {
    var xLen = Math.abs(goal.x - start.x);
    var yLen = Math.abs(goal.y - start.y);
    var estimate = Math.floor(Math.sqrt((xLen * xLen) + (yLen * yLen)));
    return estimate;
};

var neighborNodesOf = function (node, draw) {
    // Return all adjacent accessible nodes.
    var nodes = [];
    var x = node.x;
    var y = node.y;
    var mapNode;
    if (x > 0) {
        mapNode = getNode(x - 1, y, draw);
        if (mapNode.isClear) {
            nodes.push(mapNode);
        }
    }
    if (x < (mapWidth - 1)) {
        mapNode = getNode(x + 1, y, draw);
        if (mapNode.isClear) {
            nodes.push(mapNode);
        }
    }
    if (y > 0) {
        mapNode = getNode(x, y - 1, draw);
        if (mapNode.isClear) {
            nodes.push(mapNode);
        }
    }
    if (y < (mapHeight - 1)) {
        mapNode = getNode(x, y + 1, draw);
        if (mapNode.isClear) {
            nodes.push(mapNode);
        }
    }
    return nodes;
};

var drawPath = function (path, context) {
    var pxWidth = context.canvas.width / mapWidth;
    var pxHeight = context.canvas.height / mapHeight;
    path.forEach(function (node) {
        context.fillRect (node.x * pxWidth, node.y * pxHeight, pxWidth, pxHeight);
    });
};

var drawMap = function (context) {
    context.fillStyle = wallColor;
    var pxWidth = context.canvas.width / mapWidth;
    var pxHeight = context.canvas.height / mapHeight;
    var isClear;
    for (var x = 0; x < mapWidth; x++) {
        for (var y = 0; y < mapHeight; y++) {
            isClear = valueAt(x, y) === 0;
            if (!isClear) {
                context.fillRect (x * pxWidth, y * pxHeight, pxWidth, pxHeight);
            }
        }
    }
};

var drawNode = function (node, context, fillStyle) {
    var pxWidth = context.canvas.width / mapWidth;
    var pxHeight = context.canvas.height / mapHeight;
    context.fillStyle = fillStyle;
    context.fillRect(node.x * pxWidth, node.y * pxHeight, pxWidth, pxHeight);
};

var canvas = null;
var context = null;

var startX = 4;
var startY = 0;
var endX = 0;
var endY = 4;

var drawHeatMap = false;

var toggleHeatMap = function (event) {
    drawHeatMap = !drawHeatMap;
};

var run = function () {
    context.clearRect ( 0 , 0 , canvas.width, canvas.height );
    redraw();
    var start = getNode(startX, startY);
    var end = getNode(endX, endY);
    var path = aStar(start, end, heuristicCostEstimate, neighborNodesOf, drawHeatMap);
    if (path === false) {
        alert('No path found :-(');
    } else {
        context.fillStyle = 'rgba(0,200,0,0.5)';
        drawPath(path, context);
    }
};

var redraw = function () {
    drawMap(context);
    var start = getNode(startX, startY);
    drawNode(start, context, 'rgb(0,0,200)');
    var end = getNode(endX, endY);
    drawNode(end, context, 'rgb(200,0,0)');
};

var clearMap = function () {
    context.clearRect ( 0 , 0 , canvas.width, canvas.height );
    redraw();
};

var WALL = 0;
var START = 1;
var END = 2;
var WALL_ADD = 3;
var WALL_REMOVE = 4;
var editMode = WALL;

var setWallMode = function (event) {
    editMode = WALL;
};

var setStartMode = function (event) {
    editMode = START;
};

var setEndMode = function (event) {
    editMode = END;
};

var onSetSize = function (event) {
    var width = parseInt(document.getElementById('width').value, 10);
    var height = parseInt(document.getElementById('height').value, 10);
    setMapSize(width, height);
    startX = 0;
    startY = 0;
    endX = width - 1;
    endY = height -1;
    context.clearRect ( 0 , 0 , canvas.width, canvas.height );
    redraw();
};

var mouseDown = false;
var prevPos = null;

var canvasDragged = function (event) {
    if (!mouseDown) {
        return;
    }

    var rect = canvas.getBoundingClientRect();
    var pxWidth = context.canvas.width / mapWidth;
    var pxHeight = context.canvas.height / mapHeight;
    var xPos = (event.clientX - rect.left);
    var yPos = (event.clientY - rect.top);
    var x = Math.floor(xPos / pxWidth);
    var y = Math.floor(yPos / pxHeight);
    if(prevPos !== null && x === prevPos.x && y === prevPos.y) {
        return;
    }

    if (prevPos && prevPos.mode) {
        editMode = prevPos.mode;
    }
    prevPos = canvasMoved(event);
};

var canvasEnd = function (event) {
    mouseDown = false;
    prevPos = null;
    editMode = WALL;
};

var canvasDown = function (event) {
    mouseDown = true;
    prevPos = null;
    prevPos = canvasMoved(event);
};

var canvasMoved = function (event) {
    var rect = canvas.getBoundingClientRect();
    var pxWidth = context.canvas.width / mapWidth;
    var pxHeight = context.canvas.height / mapHeight;
    var xPos = (event.clientX - rect.left);
    var yPos = (event.clientY - rect.top);
    var x = Math.floor(xPos / pxWidth);
    var y = Math.floor(yPos / pxHeight);
    var color;
    allNodes = {};
    var endMode = null;
    if (editMode === WALL) {
        if (valueAt(x,y) === 0) {
            endMode = WALL_ADD;
            setValueAt(x, y, 1);
        } else {
            endMode = WALL_REMOVE;
            setValueAt(x,y, 0);
        }
        color = (valueAt(x, y) === 0) ? 'white' : wallColor;
    } else if (editMode === WALL_ADD) {
        setValueAt(x, y, 1);
    } else if (editMode === WALL_REMOVE) {
        setValueAt(x, y, 0);
    } else {
        if (editMode === START) {
            context.clearRect(startX * pxWidth, startY * pxHeight, pxWidth, pxHeight);
            startX = x;
            startY = y;
        } else {
            context.clearRect(endX * pxWidth, endY * pxHeight, pxWidth, pxHeight);
            endX = x;
            endY = y;
        }
        color = (editMode === START) ? 'rgb(0,0,200)' : 'rgb(200,0,0)';
    }
    var node = getNode(x,y);
    drawNode(node, context, color);
    return { x: x, y: y, mode: endMode !== null ? endMode : editMode};
};

var setup = function () {
    canvas = document.getElementById('mapCanvas');
    canvas.width = 300;
    canvas.height = 300;
    context = canvas.getContext('2d');
    canvas.addEventListener('mousedown', canvasDown);
    canvas.addEventListener('mousemove', canvasDragged);
    canvas.addEventListener('mouseup', canvasEnd);

    document.getElementById('runButton').addEventListener('click', run);
    document.getElementById('sizeButton').addEventListener('click', onSetSize);
    document.getElementById('clearButton').addEventListener('click', clearMap);
    document.getElementById('drawHeatMap').addEventListener('click', toggleHeatMap);

    document.getElementById('wallMode').addEventListener('click', setWallMode);
    document.getElementById('startMode').addEventListener('click', setStartMode);
    document.getElementById('endMode').addEventListener('click', setEndMode);

    redraw();
};

document.addEventListener("DOMContentLoaded", setup);