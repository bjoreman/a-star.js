var aStar = function (start, goal, costFunc, neighborFunc, drawHeatMap) {
    var distanceBetween = function (start, goal) {
        return 1; // Alter if or when we want to weigh nodes by content?
    };
    var lowestFScoreNodeIn = function (nodes) {
        var node = nodes[0];
        nodes.forEach(function (currentNode) {
            if (currentNode.fScore < node.fScore) {
                node = currentNode;
            }
        });
        return node;
    };
    var reconstructPath = function (current) {
        var path = [current];
        var next = current.cameFrom;
        while (next.cameFrom !== null) {
            path.push(next);
            next = next.cameFrom;
        }
        return path;
    };
    var closedSet = [];
    var openSet = [start];
    start.gScore = 0;
    start.fScore = start.gScore + costFunc(start, goal);
    var current, neighbors, tentativeScore;

    var numNeighbors, neighbor, i;
    while (openSet.length > 0) {
        current = lowestFScoreNodeIn(openSet);
        if (current === goal) {
            return reconstructPath(goal);
        }
        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);
        neighbors = neighborFunc(current, drawHeatMap);
        numNeighbors = neighbors.length;
        for (i = 0; i < numNeighbors; i++) {
            neighbor = neighbors[i];
            if (closedSet.indexOf(neighbor) !== -1) {
                continue;
            }
            tentativeScore = current.gScore  + distanceBetween(current, neighbor);

            if ((openSet.indexOf(neighbor) === -1) || (tentativeScore < neighbor.gScore)) {
                neighbor.cameFrom = current;
                neighbor.gScore = tentativeScore;
                neighbor.fScore = neighbor.gScore + costFunc(neighbor, goal);
                if (openSet.indexOf(neighbor) === -1) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return false;
};