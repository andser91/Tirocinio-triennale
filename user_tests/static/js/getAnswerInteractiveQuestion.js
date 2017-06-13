function externalGetAnswer(properties) {
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
    }
    var i;
    var answer = "";
    var nodes;
    var edges;
    if (properties.drawingStyle === "L-drawing" || properties.drawingStyle === undefined
        || properties.drawingStyle === "overloaded-orthogonal") {
        nodes = svg.getElementsByTagName('circle');
        for (i = 0; i < nodes.length; i++) {
            if (confrontaColori(nodes[i].getAttribute('fill'), properties.selectedNodeColor)) {
                answer = answer + nodes[i].getAttribute('id') + ',';
            }
        }
        edges = svg.getElementsByTagName('path');
        for (i = 0; i < edges.length; i++) {
            if (confrontaColori(edges[i].getAttribute('stroke'), properties.selectedEdgeColor)) {
                answer = answer + '[' + edges[i].getAttribute('id') + '],';
            }
        }
    }
    else if (properties.drawingStyle === "matrix") {
        nodes = eliminaDoppioni(svg.getElementsByTagName('text'));
        for (i = 0; i < nodes.length; i++) {
            if (confrontaColori(nodes[i].getAttribute('fill'), properties.selectedNodeColor)) {
                answer = answer + "node" + nodes[i].getAttribute('id').substring(8) + ',';
            }
        }
        var nodesEedge = svg.getElementsByTagName('rect');
        if (properties.graphType !== "undirected") {
            for (i = 0; i < nodesEedge.length; i++) {
                if (confrontaColori(nodesEedge[i].getAttribute('fill'), properties.selectedEdgeColor))
                    answer = answer + '[' + nodesEedge[i].getAttribute('id') + '],';
            }
        }
        else {
            edges = [];
            for (i = 0; i < nodesEedge.length; i++) {
                if (confrontaColori(nodesEedge[i].getAttribute('fill'), properties.selectedEdgeColor))
                    edges.push(nodesEedge[i]);
            }
            edges = eliminaArchiIndiretti(edges);
            for (i = 0; i < edges.length; i++)
                answer = answer + '[' + edges[i].getAttribute('id') + '],';
        }
    }
    return answer.substring(0, answer.length - 1)
}


function eliminaDoppioni(origArr) {
    var newArr = [],
        origLen = origArr.length,
        found, x, y;
    for (x = 0; x < origLen; x++) {
        found = undefined;
        for (y = 0; y < newArr.length; y++) {
            if (origArr[x].getAttribute('id').substring(3) === newArr[y].getAttribute('id').substring(3)) {
                found = true;
                break;
            }
        }
        if (!found) {
            newArr.push(origArr[x]);
        }
    }
    return newArr;
}

function eliminaArchiIndiretti(origArr) {
    var newArr = [],
        origLen = origArr.length,
        found, x, y;
    for (x = 0; x < origLen; x++) {
        found = undefined;
        for (y = 0; y < newArr.length; y++) {
            if (origArr[x].getAttribute('id') === invertedEdge(newArr[y].getAttribute('id'))) {
                found = true;
                break;
            }
        }
        if (!found) {
            newArr.push(origArr[x]);
        }
    }
    return newArr;
}

function invertedEdge(edgeId) {
    var nodeIdarray = edgeId.split("-");
    return nodeIdarray[1] + "-" + nodeIdarray[0];
}