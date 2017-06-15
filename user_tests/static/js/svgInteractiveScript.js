function svgScript() {
    var editable = properties.editable;
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svgElement.removeEventListener('load', svgScript);
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
        svg.removeEventListener('mouseover', svgScript);
    }
    if (properties.drawingStyle !== "matrix")
        editableScriptLDrawing(svg, editable);
    else
        editableScriptMatrix(svg, editable);
}

function editableScriptMatrix(svg, editable) {
    var labels = svg.getElementsByTagName('text');
    var nodesEedge = svg.getElementsByTagName('rect');
    var nodes = [];
    var edges = [];
    for (var i = 0; i < nodesEedge.length; i++) {
        if (confrontaColori(nodesEedge[i].getAttribute('fill'), properties.defaultNodeColor) && nodesEedge[i].getAttribute('id'))
            nodes.push(nodesEedge[i]);
        if (confrontaColori(nodesEedge[i].getAttribute('fill'), properties.defaultEdgeColor))
            edges.push(nodesEedge[i]);
    }
    if (contains(editable, "nodes"))
        editableNodeMatrix(svg, nodes, labels);
    if (contains(editable, "edges"))
        editableEdgeMatrix(svg, edges, nodes);
}

function editableEdgeMatrix(svg, edges) {
    for (var i = 0; i < edges.length; i++) {
        if (confrontaColori(edges[i].getAttribute('fill'), properties.defaultEdgeColor)) {
            edges[i].addEventListener('mousedown', editMatrixEdge, false);
            edges[i].addEventListener('mouseover', zoomInMatrixEdge, false);
            edges[i].addEventListener('mouseout', zoomOutMatrixEdge, false);
        }
    }
}

function editMatrixEdge() {
    var svg = document.getElementById('svg');
    var nodesEedge = svg.getElementsByTagName('rect');
    var edges = [];
    var y = this.getAttribute('y');
    var x = this.getAttribute('x');
    if (confrontaColori(this.getAttribute('fill'), properties.defaultEdgeColor)) {
        for (var i = 0; i < nodesEedge.length; i++) {
            if (!confrontaColori(nodesEedge[i].getAttribute('fill'), properties.defaultEdgeColor)
                && !confrontaColori(nodesEedge[i].getAttribute('fill'), properties.selectedEdgeColor))
                edges.push(nodesEedge[i]);
        }
        for (i = 0; i < edges.length; i++) {
            if (edges[i].getAttribute('y') === y && parseInt(edges[i].getAttribute('x')) < parseInt(x)
                || edges[i].getAttribute('x') === x && parseInt(edges[i].getAttribute('y')) < parseInt(y))
                edges[i].setAttribute('fill', '#ffe6e6');
        }
        this.setAttribute('fill', properties.selectedEdgeColor);
        if (properties.graphType === "undirected") {
            var nodeIdarray = this.getAttribute('id').split("-");
            var otherEdgeId = nodeIdarray[1] + "-" + nodeIdarray[0];
            var otherEdge = svg.getElementById(otherEdgeId);
            var otherY = otherEdge.getAttribute('y');
            var otherX = otherEdge.getAttribute('x');
            for (i = 0; i < edges.length; i++) {
                if (edges[i].getAttribute('y') === otherY && parseInt(edges[i].getAttribute('x')) < parseInt(otherX)
                    || edges[i].getAttribute('x') === otherX && parseInt(edges[i].getAttribute('y')) < parseInt(otherY))
                    edges[i].setAttribute('fill', '#ffe6e6');
            }
            otherEdge.setAttribute('fill', properties.selectedEdgeColor);
        }
    }
    else {
        this.setAttribute('fill', properties.defaultEdgeColor);
        for (i = 0; i < nodesEedge.length; i++) {
            //deseleziona i quadrati evidenziati sulla stessa colonna
            if (nodesEedge[i].getAttribute('x') === this.getAttribute('x')
                && nodesEedge[i].getAttribute('fill') === "#ffe6e6"
                && parseInt(nodesEedge[i].getAttribute('y')) < parseInt(this.getAttribute('y'))
                && !existSelectedEdgeSameYGreaterX(nodesEedge, nodesEedge[i])
                && !existSelectedEdgeSameXGreaterY(nodesEedge, nodesEedge[i])) {
                nodesEedge[i].setAttribute('fill', '#f4f4f4');
            }
            //deseleziona i quadrati evidenziati sulla stessa riga
            if (nodesEedge[i].getAttribute('y') === this.getAttribute('y')
                && nodesEedge[i].getAttribute('fill') === "#ffe6e6"
                && parseInt(nodesEedge[i].getAttribute('x')) < parseInt(this.getAttribute('x'))
                && !existSelectedEdgeSameYGreaterX(nodesEedge,nodesEedge[i])
                && !existSelectedEdgeSameXGreaterY(nodesEedge,nodesEedge[i])) {
                nodesEedge[i].setAttribute('fill', '#f4f4f4');
            }
        }
        if (properties.graphType === "undirected") {
            var nodeIdarray = this.getAttribute('id').split("-");
            var otherEdgeId = nodeIdarray[1] + "-" + nodeIdarray[0];
            var otherEdge = svg.getElementById(otherEdgeId);
            var otherY = otherEdge.getAttribute('y');
            var otherX = otherEdge.getAttribute('x');
            otherEdge.setAttribute('fill', properties.defaultEdgeColor);
            for (i = 0; i < nodesEedge.length; i++) {
            //deseleziona i quadrati evidenziati sulla stessa colonna
            if (nodesEedge[i].getAttribute('x') === otherX
                && nodesEedge[i].getAttribute('fill') === "#ffe6e6"
                && parseInt(nodesEedge[i].getAttribute('y')) < parseInt(otherY)
                && !existSelectedEdgeSameYGreaterX(nodesEedge, nodesEedge[i])
                && !existSelectedEdgeSameXGreaterY(nodesEedge, nodesEedge[i])) {
                nodesEedge[i].setAttribute('fill', '#f4f4f4');
            }
            //deseleziona i quadrati evidenziati sulla stessa riga
            if (nodesEedge[i].getAttribute('y') === otherY
                && nodesEedge[i].getAttribute('fill') === "#ffe6e6"
                && parseInt(nodesEedge[i].getAttribute('x')) < parseInt(otherX)
                && !existSelectedEdgeSameYGreaterX(nodesEedge,nodesEedge[i])
                && !existSelectedEdgeSameXGreaterY(nodesEedge,nodesEedge[i])) {
                nodesEedge[i].setAttribute('fill', '#f4f4f4');
            }
        }
        }
    }
}

function existSelectedEdgeSameYGreaterX(edges, edge) {
    var exist = false;
    for (var i = 0; i < edges.length; i++) {
        if (edges[i].getAttribute('y') === edge.getAttribute('y')
            && parseInt(edges[i].getAttribute('x')) > parseInt(edge.getAttribute('x'))
            && edges[i].getAttribute('fill') === properties.selectedEdgeColor)
            exist = true;
    }
    return exist;
}

function existSelectedEdgeSameXGreaterY(edges, edge) {
    var exist = false;
    for (var i = 0; i < edges.length; i++) {
        if (edges[i].getAttribute('x') === edge.getAttribute('x')
            && parseInt(edges[i].getAttribute('y')) > parseInt(edge.getAttribute('y'))
            && edges[i].getAttribute('fill') === properties.selectedEdgeColor)
        exist = true;
    }
    return exist;
}


function zoomInMatrixEdge() {
    if (confrontaColori(this.getAttribute('fill'), properties.defaultEdgeColor) ||
        confrontaColori(this.getAttribute('fill'), properties.selectedEdgeColor)) {
        this.setAttribute('stroke', 'red');
        if (properties.graphType === "undirected") {
            var svg = document.getElementById('svg');
            var nodeIdarray = this.getAttribute('id').split("-");
            var otherEdgeId = nodeIdarray[1] + "-" + nodeIdarray[0];
            var otherEdge = svg.getElementById(otherEdgeId);
            otherEdge.setAttribute('stroke', 'red');
        }
    }
}

function zoomOutMatrixEdge() {
    if (confrontaColori(this.getAttribute('fill'), properties.defaultEdgeColor) ||
        confrontaColori(this.getAttribute('fill'), properties.selectedEdgeColor)) {
        this.setAttribute('stroke', 'white');
        if (properties.graphType === "undirected") {
            var svg = document.getElementById('svg');
            var nodeIdarray = this.getAttribute('id').split("-");
            var otherEdgeId = nodeIdarray[1] + "-" + nodeIdarray[0];
            var otherEdge = svg.getElementById(otherEdgeId);
            otherEdge.setAttribute('stroke', 'white');
        }
    }
}

function editableNodeMatrix(svg, nodes, labels) {
    for (var i = 0; i < nodes.length; i++) {
        if (confrontaColori(nodes[i].getAttribute('fill'), properties.defaultNodeColor)) {
            nodes[i].addEventListener('mousedown', editMatrixNode, false);
            nodes[i].addEventListener('mouseover', zoomInMatrixNode, false);
            nodes[i].addEventListener('mouseout', zoomOutMatrixNode, false);
        }
    }
    for (i = 0; i < labels.length; i++) {
        var nodeId = 'rawnode' + labels[i].getAttribute('id').substring(8);
        var node = svg.getElementById(nodeId);
        if (confrontaColori(node.getAttribute('fill'), properties.defaultNodeColor)) {
            labels[i].addEventListener('mousedown', editMatrixLabel, false);
            labels[i].addEventListener('mouseover', zoomInMatrixNodeByLabel, false);
            labels[i].addEventListener('mouseout', zoomOutMatrixNodeByLabel, false);
        }
    }
}

function editMatrixLabel() {
    var svg = document.getElementById('svg');
    var otherLabelId;
    if (this.getAttribute('id').substring(0, 3) === "raw")
        otherLabelId = "col" + this.getAttribute('id').substring(3);
    else
        otherLabelId = "raw" + this.getAttribute('id').substring(3);
    var otherLabel = svg.getElementById(otherLabelId);
    if (confrontaColori(this.getAttribute('fill'), properties.defaultLabelColor)) {
        this.setAttribute('fill', properties.selectedNodeColor);
        otherLabel.setAttribute('fill', properties.selectedNodeColor);
    }
    else {
        this.setAttribute('fill', properties.defaultLabelColor);
        otherLabel.setAttribute('fill', properties.defaultLabelColor);
    }
}

function zoomInMatrixNodeByLabel() {
    var svg = document.getElementById('svg');
    var firstNodeId = "rawnode" + this.getAttribute('id').substring(8);
    var secondNodeId = "colnode" + this.getAttribute('id').substring(8);
    var firstNode = svg.getElementById(firstNodeId);
    var secondNode = svg.getElementById(secondNodeId);
    firstNode.setAttribute('stroke', 'red');
    secondNode.setAttribute('stroke', 'red');
}

function zoomOutMatrixNodeByLabel() {
    var svg = document.getElementById('svg');
    var firstNodeId = "rawnode" + this.getAttribute('id').substring(8);
    var secondNodeId = "colnode" + this.getAttribute('id').substring(8);
    var firstNode = svg.getElementById(firstNodeId);
    var secondNode = svg.getElementById(secondNodeId);
    firstNode.setAttribute('stroke', 'white');
    secondNode.setAttribute('stroke', 'white');
}

function zoomInMatrixNode() {
    var svg = document.getElementById('svg');
    var otherNodeId;
    if (this.getAttribute('id').substring(0, 3) === "raw")
        otherNodeId = "col" + this.getAttribute('id').substring(3);
    else
        otherNodeId = "raw" + this.getAttribute('id').substring(3);
    var otherNode = svg.getElementById(otherNodeId);
    otherNode.setAttribute('stroke', 'red');
    this.setAttribute('stroke', 'red');
}

function zoomOutMatrixNode() {
    var svg = document.getElementById('svg');
    var otherNodeId;
    if (this.getAttribute('id').substring(0, 3) === "raw")
        otherNodeId = "col" + this.getAttribute('id').substring(3);
    else
        otherNodeId = "raw" + this.getAttribute('id').substring(3);
    var otherNode = svg.getElementById(otherNodeId);
    otherNode.setAttribute('stroke', 'white');
    this.setAttribute('stroke', 'white');
}

function editMatrixNode() {
    var svg = document.getElementById('svg');
    var firstLabelId = 'rawlabel' + this.getAttribute('id').substring(7);
    var firstLabel = svg.getElementById(firstLabelId);
    var secondLabelId = 'collabel' + this.getAttribute('id').substring(7);
    var secondLabel = svg.getElementById(secondLabelId);
    if (confrontaColori(firstLabel.getAttribute('fill'), properties.defaultLabelColor)) {
        firstLabel.setAttribute('fill', properties.selectedNodeColor);
        secondLabel.setAttribute('fill', properties.selectedNodeColor);
    }
    else {
        firstLabel.setAttribute('fill', properties.defaultLabelColor);
        secondLabel.setAttribute('fill', properties.defaultLabelColor);
    }
}

function editableScriptLDrawing(svg, editable) {
    var edges = svg.getElementsByTagName('path');
    var nodes = svg.getElementsByTagName('circle');
    var labels = svg.getElementsByTagName('text');
    if (contains(editable, "nodes"))
        editableNodeLDrawing(svg, nodes, labels);
    if (contains(editable, "edges"))
        editableEdgeLDrawing(svg, edges, nodes);
}

function editableNodeLDrawing(svg, nodes, labels) {
    for (var i = 0; i < nodes.length; i++) {
        if (confrontaColori(nodes[i].getAttribute('fill'), properties.defaultNodeColor)) {
            nodes[i].addEventListener('mousedown', editNode, false);
            nodes[i].addEventListener('mouseover', zoomInNode, false);
            nodes[i].addEventListener('mouseout', zoomOutNode, false);
        }
    }
    for (i = 0; i < labels.length; i++) {
        var nodeId = 'node' + labels[i].getAttribute('id').substring(5);
        var node = svg.getElementById(nodeId);
        if (confrontaColori(node.getAttribute('fill'), properties.defaultNodeColor)) {
            labels[i].addEventListener('mousedown', editNodeByLabel, false);
            labels[i].addEventListener('mouseover', zoomInNodeByLabel, false);
            labels[i].addEventListener('mouseout', zoomOutNodeByLabel, false);
        }
    }
}

function editableEdgeLDrawing(svg, edges, nodes) {
    var newEdges = [];
    for (var i = 0; i < edges.length; i++) {
        newEdges[i] = edges[i];
    }
    for (i = 0; i < newEdges.length; i++) {
        if (confrontaColori(newEdges[i].getAttribute('stroke'), properties.defaultEdgeColor)) {
            var newEdge = newEdges[i].cloneNode(false);
            newEdge.setAttribute('id', 'big' + newEdges[i].getAttribute('id'));
            newEdge.setAttribute('stroke-width', '7');
            newEdge.setAttribute('opacity', '0');
            if (properties.fileType === "SVG_file") {
                var svgTag = svg.getElementById('svg');
                svgTag.insertBefore(newEdge, nodes[0]);
            }
            else
                svg.insertBefore(newEdge, nodes[0]);
            newEdge.addEventListener('mousedown', editEdge, false);
            newEdge.addEventListener('mouseover', zoomInEdge, false);
            newEdge.addEventListener('mouseout', zoomOutEdge, false);
        }
    }
}

function editNode() {
    if (confrontaColori(this.getAttribute('fill'), properties.defaultNodeColor))
        this.setAttribute('fill', properties.selectedNodeColor);
    else
        this.setAttribute('fill', properties.defaultNodeColor);
}

function editNodeByLabel() {
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
    }
    var nodeId = 'node' + this.getAttribute('id').substring(5);
    var node = svg.getElementById(nodeId);
    if (confrontaColori(node.getAttribute('fill'), properties.defaultNodeColor))
        node.setAttribute('fill', properties.selectedNodeColor);
    else
        node.setAttribute('fill', properties.defaultNodeColor);
}

function editEdge() {
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
    }
    var svgTag = svg.getElementById('svg');
    var edgeId = this.getAttribute('id').substring(3);
    var nodes = svg.getElementsByTagName('circle');   //nodes list
    var edges = svg.getElementsByTagName('path');   //edges list
    var edge = svg.getElementById(edgeId);
    if (properties.graphType === "directed")
        var arrow = svg.getElementById("arrow" + edgeId);
    var color = edge.getAttribute('stroke');
    var firstBigEdge = null;
    var i = 0;
    while (i < edges.length && firstBigEdge === null) {
        if (edges[i].getAttribute('id').substring(0, 3) === "big") {
            firstBigEdge = edges[i];
        }
        i++;
    }
    if (confrontaColori(color, properties.defaultEdgeColor)) {
        if (properties.fileType === "SVG_file") {
            svgTag.removeChild(edge);  //rimuovo l'arco
            svgTag.insertBefore(edge, firstBigEdge); //lo inserisco prima degli archi trasparenti
            if (properties.graphType === "directed") {
                svgTag.removeChild(arrow);
                svgTag.insertBefore(arrow, edge);
            }
        }
        else {
            svg.removeChild(edge);  //rimuovo l'arco
            svg.insertBefore(edge, firstBigEdge); //lo inserisco prima degli archi trasparenti
            if (properties.graphType === "directed") {
                svg.removeChild(arrow);
                svg.insertBefore(arrow, edge);
            }
        }
        if (properties.graphType === "directed") {
            arrow.setAttribute('stroke', properties.selectedEdgeColor);
            arrow.setAttribute('fill', properties.selectedEdgeColor);
        }
        edge.setAttribute('stroke', properties.selectedEdgeColor);
    }
    else {
        var firstEdge = edges[0];
        if (properties.fileType === "SVG_file") {
            svgTag.removeChild(edge);
            svgTag.insertBefore(edge, firstEdge);
            if (properties.graphType === "directed") {
                svgTag.removeChild(arrow);
                svgTag.insertBefore(arrow, edge);
            }
        }
        else {
            svg.removeChild(edge);
            svg.insertBefore(edge, firstEdge);
            if (properties.graphType === "directed") {
                svg.removeChild(arrow);
                svg.insertBefore(arrow, edge);
            }
        }
        if (properties.graphType === "directed") {
            arrow.setAttribute('stroke', properties.defaultEdgeColor);
            arrow.setAttribute('fill', properties.defaultEdgeColor);
        }
        edge.setAttribute('stroke', properties.defaultEdgeColor);
    }
}

function zoomInNode() {
    this.setAttribute('stroke-width', (parseInt(this.getAttribute('stroke-width') * 2)).toString());
}

function zoomOutNode() {
    this.setAttribute('stroke-width', (parseInt(this.getAttribute('stroke-width') / 2)).toString());
}

function zoomInNodeByLabel() {
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
    }
    var nodeId = 'node' + this.getAttribute('id').substring(5);
    var node = svg.getElementById(nodeId);
    node.setAttribute('stroke-width', (parseInt(node.getAttribute('stroke-width') * 2)).toString());
}

function zoomOutNodeByLabel() {
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
    }
    var nodeId = 'node' + this.getAttribute('id').substring(5);
    var node = svg.getElementById(nodeId);
    node.setAttribute('stroke-width', (parseInt(node.getAttribute('stroke-width') / 2)).toString());
}

function zoomInEdge() {
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
    }
    var edgeId = this.getAttribute('id').substring(3);
    var edges = svg.getElementsByTagName('path');   //edges list
    var edge = svg.getElementById(edgeId);
    edge.setAttribute('stroke-width', (parseInt(edge.getAttribute('stroke-width') * 2)).toString());
    this.removeEventListener('mouseover', zoomInEdge);
}

function zoomOutEdge() {
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument;
    }
    else {
        svg = document.getElementById('svg');
    }
    var edgeId = this.getAttribute('id').substring(3);
    var edges = svg.getElementsByTagName('path');   //edges list
    var edge = svg.getElementById(edgeId);
    edge.setAttribute('stroke-width', (parseInt(edge.getAttribute('stroke-width') / 2)).toString());
    this.addEventListener('mouseover', zoomInEdge, false);
}


function contains(array, elem) {
    for (var i = 0; i < array.length; i++)
        if (array[i] === elem)
            return true;
    return false;
}

function confrontaColori(first, second) {
    if (first === second)
        return true;
    else if (first[0] === '#') {
        for (var i = 1; i < first.length; i++) {
            if (first[i] !== second[i].toLowerCase() && first[i] !== second[i].toUpperCase())
                return false;
        }
        return true;
    }
}
