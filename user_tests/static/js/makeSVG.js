function makeSVG() {

    var question = document.getElementById('question');
    var svgElement;
    if (properties.fileType === "SVG_file") {
        svgElement = document.createElement('object');
        svgElement.setAttribute('id', 'svgElement');
        svgElement.setAttribute('type', 'image/svg+xml');
        svgElement.setAttribute('data', image_file);
        svgElement.addEventListener('load', addZoomEPan, false);
        if (properties.editable)
            svgElement.addEventListener('load', svgScript, false);
    }
    else if (properties.fileType === "coord_file") {
        var coord_file = image_file;
        svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var svgNS = svgElement.namespaceURI;
        svgElement.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
        svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        svgElement.setAttribute('xmlns:ev', "http://www.w3.org/2001/xml-events");
        svgElement.setAttribute('zoom', '100');
        svgElement.onselectstart = nonSelectable;
        function nonSelectable() {
            return false;
        }

        var width = window.screen.width * 50 / 100;
        var height = window.screen.height * 85 / 100;
        svgElement.setAttribute("width", width);
        svgElement.setAttribute("height", height);
        svgElement.setAttribute("style", "outline: 1px solid #000;");
        svgElement.setAttribute('id', "svg");
        var nodes = coord_file.nodes;
        var edges = coord_file.edges;
        var yMax = yMassima(nodes);
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].y = yMax - nodes[i].y;
        }
        if (properties.drawingStyle === "L-drawing") {
            svgElement = makeSvgLDrawing(svgElement, svgNS, nodes, edges);
            if (properties.editable)
                svgElement.addEventListener('mouseover', svgScript, false);
        }
        if (properties.drawingStyle === "overloaded-orthogonal") {
            svgElement = makeSvgOO(svgElement, svgNS, nodes, edges);
            if (properties.editable)
                svgElement.addEventListener('mouseover', svgScript, false);
        }
        else if (properties.drawingStyle === "matrix") {
            svgElement = makeSvgMatrix(svgElement, svgNS, nodes, edges);
            console.log(svgElement);
            if (properties.editable)
                svgElement.addEventListener('mouseover', svgScript, false);
        }
        svgElement.setAttribute('viewBox', calcolaViewBox(svgElement, image_file));
        var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        svgElement.addEventListener(mousewheelevt, svgZoom, false);
        svgElement.addEventListener('mousedown', startPan, false);

    }
    question.appendChild(svgElement);
}

var beginX;
var beginY;

function releaseSVG(e) {
    if (!e)
        e = window.event;
    var svg;
    if (properties.fileType === "SVG_file") {
        var svgElement = document.getElementById('svgElement');
        svg = svgElement.contentDocument.getElementById('svg');
    }
    else {
        svg = document.getElementById('svg');
    }
    window.removeEventListener('mouseup', releaseSVG);
    svg.removeEventListener('mousemove', panning, false);
}

function startPan(e) {
    if (!e)
        e = window.event;
    beginX = e.clientX;
    beginY = e.clientY;
    this.addEventListener('mousemove', panning, false);
    this.addEventListener('mouseup', endPan, false);
    window.addEventListener('mouseup', releaseSVG, false);
}

function panning(e) {
    if (!e)
        e = window.event;
    var viewBox = this.getAttribute('viewBox');
    var vBox = viewBox.split(" ");
    var dx = beginX - e.clientX;
    var dy = beginY - e.clientY;
    var dxViewBox = dx * parseFloat(vBox[2]) / parseFloat(this.getAttribute('width'));
    var dyViewBox = dy * parseFloat(vBox[3]) / parseFloat(this.getAttribute('height'));
    vBox[0] = parseFloat(vBox[0]) + dxViewBox;
    vBox[1] = parseFloat(vBox[1]) + dyViewBox;
    this.setAttribute('viewBox', vBox.join(" "));
    beginX = e.clientX;
    beginY = e.clientY;

}

function endPan(e) {
    if (!e)
        e = window.event;
    var viewBox = this.getAttribute('viewBox');
    var vBox = viewBox.split(" ");
    var dx = beginX - e.clientX;
    var dy = beginY - e.clientY;
    var dxViewBox = dx * vBox[2] / this.getAttribute('width');
    var dyViewBox = dy * vBox[3] / this.getAttribute('height');
    vBox[0] = parseFloat(vBox[0]) + dxViewBox;
    vBox[1] = parseFloat(vBox[1]) + dyViewBox;
    this.setAttribute('viewBox', vBox.join(" "));
    this.removeEventListener('mousemove', panning);
    this.removeEventListener('mouseup', endPan);
    window.removeEventListener('mouseup', releaseSVG);
}

function addZoomEPan() {
    var svgDocument = this.contentDocument;
    var svgTag = svgDocument.getElementById('svg');
    svgTag.setAttribute('zoom', '100');
    svgTag.onselectstart = nonSelectable;
    function nonSelectable() {
        return false;
    }

    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
    svgTag.addEventListener(mousewheelevt, svgZoom, false);
    svgTag.addEventListener('mousedown', startPan, false);
}

function svgZoom(e) {
    var delta = 0;
    if (!e) /* For IE. */
        e = window.event;
    if (e.wheelDelta) { /* IE/Opera. */
        delta = e.wheelDelta / 120;

    } else if (e.type === "DOMMouseScroll") {
        /** Mozilla case. */
        delta = -e.detail / 3;
    }
    if (delta)
        handle(this, parseInt(delta), e.offsetX, e.offsetY);
}

function handle(svg, delta, mouseX, mouseY) {
    var viewBox, vBox, widthIniziale, heightIniziale;
    var actualZoom = parseInt(svg.getAttribute('zoom'));
    if (delta > 0) {
        if (actualZoom < 300) {
            viewBox = svg.getAttribute('viewBox');
            vBox = viewBox.split(" ");
            widthIniziale = vBox[2];
            heightIniziale = vBox[3];
            vBox[2] = parseFloat(vBox[2]) / 1.1;
            vBox[3] = parseFloat(vBox[3]) / 1.1;
            /*var mouseXViewBox = mouseX/parseInt(svg.getAttribute('width'))*vBox[2];
             var mouseYViewBox = mouseY/parseInt(svg.getAttribute('height'))*vBox[3];
             var centroAttualeX = (parseFloat(vBox[2]) - parseFloat(vBox[0]))/2;
             var centroAttualeY = (parseFloat(vBox[3]) - parseFloat(vBox[1]))/2;
             vBox[0] = parseFloat(vBox[0]) + mouseXViewBox - centroAttualeX;
             vBox[1] = parseFloat(vBox[0]) + mouseYViewBox - centroAttualeX;
             console.log(viewBox);*/
            vBox[0] = parseFloat(vBox[0]) + (parseFloat(widthIniziale) - vBox[2]) / 2;
            vBox[1] = parseFloat(vBox[1]) + (parseFloat(heightIniziale) - vBox[3]) / 2;
            viewBox = vBox.join(" ");
            svg.setAttribute('zoom', (actualZoom + 10).toString());
            svg.setAttribute('viewBox', viewBox);
        }
    }
    else {
        if (actualZoom > 40) {
            viewBox = svg.getAttribute('viewBox');
            vBox = viewBox.split(" ");
            widthIniziale = vBox[2];
            heightIniziale = vBox[3];
            vBox[2] *= 1.1;
            vBox[3] *= 1.1;
            vBox[0] = parseFloat(vBox[0]) + (parseFloat(widthIniziale) - vBox[2]) / 2;
            vBox[1] = parseFloat(vBox[1]) + (parseFloat(heightIniziale) - vBox[3]) / 2;
            viewBox = vBox.join(" ");
            svg.setAttribute('zoom', (actualZoom - 10).toString());
            svg.setAttribute('viewBox', viewBox);
        }
    }
}

function calcolaViewBox(svgElement, image_file) {
    var xMin = 100000;
    var yMin = 100000;
    var xMax = 0;
    var yMax = 0;
    var nodes = image_file.nodes;
    if (properties.drawingStyle === "L-drawing" || properties.drawingStyle === "overloaded-orthogonal") {
        for (var i = 0; i < nodes.length; i++) {
            if (parseInt(nodes[i].x) * properties.coordinatesMultiplier < xMin)
                xMin = parseInt(nodes[i].x) * properties.coordinatesMultiplier - 2 * parseInt(properties.nodeDimension);
            if (parseInt(nodes[i].x) * properties.coordinatesMultiplier > xMax)
                xMax = parseInt(nodes[i].x) * properties.coordinatesMultiplier + 2 * parseInt(properties.nodeDimension);
            if (parseInt(nodes[i].y) * properties.coordinatesMultiplier < yMin)
                yMin = parseInt(nodes[i].y) * properties.coordinatesMultiplier - 2 * parseInt(properties.nodeDimension);
            if (parseInt(nodes[i].y) * properties.coordinatesMultiplier > yMax)
                yMax = parseInt(nodes[i].y) * properties.coordinatesMultiplier + 2 * parseInt(properties.nodeDimension);
        }
    }
    else if (properties.drawingStyle === "matrix") {
        var cont = 0;
        for (i = 0; i < nodes.length; i++) {
            cont++;
        }
        xMin = 20;
        yMin = 20;
        xMax = 4 * properties.nodeDimension * (cont + 2) + cont;
        yMax = xMax;
    }
    var width = xMax - xMin;
    var height = yMax - yMin;
    return xMin + " " + yMin + " " + width + " " + height;

}


function makeSvgOO(svgElement, svgNS, nodes, edges) {
    makeOOEdge(edges, nodes, svgNS, svgElement);
    makeLDrawingNode(nodes, svgNS, svgElement);
    return svgElement;
}


function makeSvgLDrawing(svgElement, svgNS, nodes, edges) {
    makeLDrawingEdge(edges, nodes, svgNS, svgElement);
    makeLDrawingNode(nodes, svgNS, svgElement);
    return svgElement;
}

function makeSvgMatrix(svgElement, svgNS, nodes, edges) {
    makeMatrixNode(svgElement, nodes, svgNS);
    makeMatrixEdge(svgElement, svgNS, nodes, edges);
    return svgElement;
}

function makeMatrixEdge(svgElement, svgNS, nodes, edges) {
    var x = (20 + parseInt(properties.nodeDimension) * 4 + 1).toString();
    var y = (20 + parseInt(properties.nodeDimension) * 4 + 1).toString();
    var beginY = (20 + parseInt(properties.nodeDimension) * 4 + 1).toString();
    var fromNode = null;
    var toNode = null;
    for (var i = 0; i < nodes.length; i++) {
        y = beginY;
        for (var j = 0; j < nodes.length; j++) {
            var edge = document.createElementNS(svgNS, 'rect');
            edge.setAttribute('stroke-width', '1');
            edge.setAttribute('stroke', 'white');
            edge.setAttribute('fill', properties.defaultNodeColor);
            edge.setAttribute('width', (parseInt(properties.nodeDimension) * 4).toString());
            edge.setAttribute('height', (parseInt(properties.nodeDimension) * 4).toString());
            edge.setAttribute('x', x);
            edge.setAttribute('y', y);
            svgElement.appendChild(edge);
            y = (parseInt(y) + parseInt(properties.nodeDimension) * 4 + 1).toString();
            for (var k = 0; k < edges.length; k++) {
                if (edges[k].from === nodes[j].id && edges[k].to === nodes[i].id) {
                    if (edges[k].optionalColor)
                        edge.setAttribute('fill', edges[k].optionalColor);
                    else
                        edge.setAttribute('fill', properties.defaultEdgeColor);
                    edge.setAttribute('id', nodes[j].id + "-" + nodes[i].id);
                }
                if (properties.graphType === "undirected") {
                    if (edges[k].to === nodes[j].id && edges[k].from === nodes[i].id) {
                        if (edges[k].optionalColor)
                            edge.setAttribute('fill', edges[k].optionalColor);
                        else
                            edge.setAttribute('fill', properties.defaultEdgeColor);
                        edge.setAttribute('id', nodes[j].id + "-" + nodes[i].id);
                    }
                }
            }
        }

        x = (parseInt(x) + parseInt(properties.nodeDimension) * 4 + 1).toString();
    }
}

function makeMatrixNode(svgElement, nodes, svgNS) {
    var beginX = "20";
    var beginY = "20";
    var x = "20";
    var y = "20";
    for (var i = 0; i < nodes.length; i++) {
        x = (parseInt(x) + parseInt(properties.nodeDimension) * 4 + 1).toString();
        y = (parseInt(y) + parseInt(properties.nodeDimension) * 4 + 1).toString();
        var firstNode = document.createElementNS(svgNS, "rect");
        firstNode.setAttribute('id', "raw" + nodes[i].id);
        firstNode.setAttribute('stroke-width', '1');
        firstNode.setAttribute('stroke', 'white');
        firstNode.setAttribute('width', (parseInt(properties.nodeDimension) * 4).toString());
        firstNode.setAttribute('height', (parseInt(properties.nodeDimension) * 4).toString());
        if (nodes[i].optionalColor)
            firstNode.setAttribute('fill', nodes[i].optionalColor);
        else
            firstNode.setAttribute('fill', properties.defaultNodeColor);
        var secondNode = firstNode.cloneNode(false);
        firstNode.setAttribute('x', x);
        firstNode.setAttribute('y', beginY);
        secondNode.setAttribute('x', beginX);
        secondNode.setAttribute('y', y);
        secondNode.setAttribute('id', "col" + nodes[i].id);
        svgElement.appendChild(firstNode);
        svgElement.appendChild(secondNode);
        var firstLabel = document.createElementNS(svgNS, 'text');
        firstLabel.setAttribute('id', 'rawlabel' + nodes[i].id.substring(4));
        firstLabel.setAttribute('textLength', "20");
        firstLabel.setAttribute('font-size', "15");
        firstLabel.setAttribute('text-anchor', 'middle');
        firstLabel.setAttribute('alignment-baseline', 'middle');
        firstLabel.setAttribute('fill', properties.defaultLabelColor);
        firstLabel.setAttribute('lengthAdjust', "spacingAndGlyphs");
        firstLabel.textContent = firstLabel.getAttribute("id").substring(8);
        firstLabel.setAttribute('x', (parseInt(firstNode.getAttribute('x')) + parseInt(firstNode.getAttribute('width')) / 2).toString());
        firstLabel.setAttribute('y', (parseInt(firstNode.getAttribute('y')) + parseInt(firstNode.getAttribute('height')) / 2).toString());
        var secondLabel = firstLabel.cloneNode(true);
        secondLabel.setAttribute('x', (parseInt(secondNode.getAttribute('x')) + parseInt(secondNode.getAttribute('width')) / 2).toString());
        secondLabel.setAttribute('y', (parseInt(secondNode.getAttribute('y')) + parseInt(secondNode.getAttribute('height')) / 2).toString());
        secondLabel.setAttribute('id', 'collabel' + nodes[i].id.substring(4));
        svgElement.appendChild(firstLabel);
        svgElement.appendChild(secondLabel);
    }
}

function makeLDrawingNode(nodes, svgNS, svgElement) {
    for (var i = 0; i < nodes.length; i++) {
        var node = document.createElementNS(svgNS, 'circle');
        node.setAttribute('id', nodes[i].id);
        node.setAttribute('cx', (parseInt(nodes[i].x) * properties.coordinatesMultiplier).toString());
        node.setAttribute('cy', (parseInt(nodes[i].y) * properties.coordinatesMultiplier).toString());
        node.setAttribute('r', properties.nodeDimension);
        if (nodes[i].optionalColor)
            node.setAttribute('fill', nodes[i].optionalColor);
        else
            node.setAttribute('fill', properties.defaultNodeColor);
        node.setAttribute('stroke-width', "1");
        node.setAttribute('stroke', "#000000");
        svgElement.appendChild(node);
        var label = document.createElementNS(svgNS, 'text');
        label.setAttribute('id', 'label' + nodes[i].id.substring(4));
        label.setAttribute('x', (parseInt(nodes[i].x) * properties.coordinatesMultiplier - 4).toString());
        label.setAttribute('y', (parseInt(nodes[i].y) * properties.coordinatesMultiplier + 2).toString());
        label.setAttribute('textLength', "8");
        label.setAttribute('font-size', "7");
        label.setAttribute('fill', properties.defaultLabelColor);
        label.setAttribute('lengthAdjust', "spacingAndGlyphs");
        label.textContent = label.getAttribute('id').substring(5);
        svgElement.appendChild(label);
    }
}
function makeLDrawingEdge(edges, nodes, svgNS, svgElement) {
    ordinaArchiLunghezzaVerticaleCrescente(edges, nodes);
    for (var i = 0; i < edges.length; i++) {
        var fromNode = null;
        var toNode = null;
        for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].id === edges[i].from)
                fromNode = nodes[j];
            if (nodes[j].id === edges[i].to)
                toNode = nodes[j];
        }
        var edge;

        edge = document.createElementNS(svgNS, "path");
        edge.setAttribute('stroke-width', "1");
        edge.setAttribute('stroke-linejoin', "round");
        if (edges[i].optionalColor)
            edge.setAttribute('stroke', edges[i].optionalColor);
        else
            edge.setAttribute('stroke', properties.defaultEdgeColor);
        edge.setAttribute('fill', "none");
        edge.setAttribute('id', fromNode.id + "-" + toNode.id);
        if (properties.graphType === "directed") {
            var arrow = document.createElementNS(svgNS, "polygon");
            if (edges[i].optionalColor) {
                arrow.setAttribute('stroke', edges[i].optionalColor);
                arrow.setAttribute('fill', edges[i].optionalColor);
            }
            else {
                arrow.setAttribute('stroke', properties.defaultEdgeColor);
                arrow.setAttribute('fill', properties.defaultEdgeColor);
            }
            arrow.setAttribute('stroke-width', '1');
            arrow.setAttribute('id', 'arrow' + edge.getAttribute('id'));
        }
        var firstPoint, firstLine, firstCurvePoint, secondCurvePoint, secondLine, dPath, arrowPoints;
        if (parseInt(fromNode.x) < parseInt(toNode.x) && parseInt(fromNode.y) > parseInt(toNode.y)) {
            firstPoint = "M " + parseInt(fromNode.x) * properties.coordinatesMultiplier + " " +
                parseInt(fromNode.y) * properties.coordinatesMultiplier;
            firstLine = " V " + (parseInt(toNode.y) * properties.coordinatesMultiplier + 10).toString();
            firstCurvePoint = " Q " + parseInt(fromNode.x) * properties.coordinatesMultiplier +
                " " + parseInt(toNode.y) * properties.coordinatesMultiplier + " ";
            secondCurvePoint = (parseInt(fromNode.x) * properties.coordinatesMultiplier + 10).toString() +
                " " + parseInt(toNode.y) * properties.coordinatesMultiplier;
            secondLine = " H " + parseInt(toNode.x) * properties.coordinatesMultiplier;
            dPath = firstPoint + firstLine + firstCurvePoint + secondCurvePoint + secondLine;
            if (properties.graphType === "directed") {
                arrowPoints = (parseInt(toNode.x * properties.coordinatesMultiplier) - parseInt(properties.nodeDimension)).toString()
                    + "," + parseInt(toNode.y) * properties.coordinatesMultiplier + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) * 1.5).toString()
                    + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) / 3).toString() + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) * 1.5).toString()
                    + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier + parseInt(properties.nodeDimension) / 3).toString() + " ";
                arrow.setAttribute('points', arrowPoints);
            }
            edge.setAttribute('d', dPath);
        }
        else if (parseInt(fromNode.x) > parseInt(toNode.x) && parseInt(fromNode.y) < parseInt(toNode.y)) {
            firstPoint = "M " + parseInt(fromNode.x) * properties.coordinatesMultiplier + " "
                + parseInt(fromNode.y) * properties.coordinatesMultiplier;
            firstLine = " V " + (parseInt(toNode.y) * properties.coordinatesMultiplier - 10).toString();
            firstCurvePoint = " Q " + parseInt(fromNode.x) * properties.coordinatesMultiplier + " "
                + parseInt(toNode.y) * properties.coordinatesMultiplier + " ";
            secondCurvePoint = (parseInt(fromNode.x) * properties.coordinatesMultiplier - 10).toString() + " "
                + parseInt(toNode.y) * properties.coordinatesMultiplier;
            secondLine = " H " + parseInt(toNode.x) * properties.coordinatesMultiplier;
            dPath = firstPoint + firstLine + firstCurvePoint + secondCurvePoint + secondLine;
            if (properties.graphType === "directed") {
                arrowPoints = (parseInt(toNode.x) * properties.coordinatesMultiplier + 5).toString()
                    + "," + parseInt(toNode.y) * properties.coordinatesMultiplier + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier + 9).toString() + "," +
                    (parseInt(toNode.y) * properties.coordinatesMultiplier - 2).toString() + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier + 9).toString() + "," +
                    (parseInt(toNode.y) * properties.coordinatesMultiplier + 2).toString() + " ";
                arrow.setAttribute('points', arrowPoints);
            }
            edge.setAttribute('d', dPath);
        }
        else if (parseInt(fromNode.x) > parseInt(toNode.x) && parseInt(fromNode.y) > parseInt(toNode.y)) {
            firstPoint = "M " + parseInt(fromNode.x) * properties.coordinatesMultiplier
                + " " + parseInt(fromNode.y) * properties.coordinatesMultiplier;
            firstLine = " V " + (parseInt(toNode.y) * properties.coordinatesMultiplier + 10).toString();
            firstCurvePoint = " Q " + (fromNode.x) * properties.coordinatesMultiplier + " "
                + parseInt(toNode.y) * properties.coordinatesMultiplier + " ";
            secondCurvePoint = (parseInt(fromNode.x) * properties.coordinatesMultiplier - 10).toString()
                + " " + parseInt(toNode.y) * properties.coordinatesMultiplier;
            secondLine = " H " + parseInt(toNode.x) * properties.coordinatesMultiplier;
            dPath = firstPoint + firstLine + firstCurvePoint + secondCurvePoint + secondLine;
            if (properties.graphType === "directed") {
                arrowPoints = (parseInt(toNode.x) * properties.coordinatesMultiplier + 5).toString() +
                    "," + parseInt(toNode.y) * properties.coordinatesMultiplier + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier + 9).toString() + ","
                    + (parseInt(toNode.y) * properties.coordinatesMultiplier - 2).toString() + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier + 9).toString() + "," +
                    (parseInt(toNode.y) * properties.coordinatesMultiplier + 2).toString() + " ";
                arrow.setAttribute('points', arrowPoints);
            }
            edge.setAttribute('d', dPath);
        }
        else if (parseInt(fromNode.x) < parseInt(toNode.x) && parseInt(fromNode.y) < parseInt(toNode.y)) {
            firstPoint = "M " + parseInt(fromNode.x) * properties.coordinatesMultiplier + " "
                + parseInt(fromNode.y) * properties.coordinatesMultiplier;
            firstLine = " V " + (parseInt(toNode.y) * properties.coordinatesMultiplier - 10).toString();
            firstCurvePoint = " Q " + parseInt(fromNode.x) * properties.coordinatesMultiplier +
                " " + parseInt(toNode.y) * properties.coordinatesMultiplier + " ";
            secondCurvePoint = (parseInt(fromNode.x) * properties.coordinatesMultiplier + 10).toString()
                + " " + parseInt(toNode.y) * properties.coordinatesMultiplier;
            secondLine = " H " + parseInt(toNode.x) * properties.coordinatesMultiplier;
            dPath = firstPoint + firstLine + firstCurvePoint + secondCurvePoint + secondLine;
            if (properties.graphType === "directed") {
                arrowPoints = (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension)).toString()
                    + "," + parseInt(toNode.y) * properties.coordinatesMultiplier + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) * 1.5).toString()
                    + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) / 3).toString() + " " +
                    (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) * 1.5).toString()
                    + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier + parseInt(properties.nodeDimension) / 3).toString() + " ";
                arrow.setAttribute('points', arrowPoints);
            }
            edge.setAttribute('d', dPath);
        }
        if (properties.graphType === "directed")
            svgElement.appendChild(arrow);

        svgElement.appendChild(edge);
    }
}

function getFromNode(edge, nodes) {
    for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].id === edge.from)
            return nodes[j];
    }
}

function getToNode(edge, nodes) {
    for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].id === edge.to)
            return nodes[j];
    }
}
function ordinaArchiLunghezzaVerticaleCrescente(edges, nodes) {
    var max, temp;
    for (var i = 0; i < edges.length - 1; i++) {
        max = i;
        for (var j = i + 1; j < edges.length; j++)
            if (calcolaLunghezzaVerticale(edges[j], nodes) > calcolaLunghezzaVerticale(edges[max], nodes)) //cambiare questa condizione per invertire l'ordine
                max = j;
        temp = edges[max];
        edges[max] = edges[i];
        edges[i] = temp;
    }
}

function calcolaLunghezzaVerticale(edge, nodes) {
    var fromNode = getFromNode(edge, nodes);
    var toNode = getToNode(edge, nodes);
    if (fromNode.y > toNode.y)
        return fromNode.y - toNode.y;
    else
        return toNode.y - fromNode.y
}

function makeOOEdge(edges, nodes, svgNS, svgElement) {
    var upEdges = [];
    var downEdges = [];
    var fromNode = null;
    var toNode = null;
    var upEdgesAggiunti = [];
    var downEdgesAggiunti = [];
    ordinaArchiLunghezzaVerticaleCrescente(edges, nodes);
    for (var i = 0; i < edges.length; i++) {
        fromNode = getFromNode(edges[i], nodes);
        toNode = getToNode(edges[i], nodes);
        if (parseInt(fromNode.x) < parseInt(toNode.x) && parseInt(fromNode.y) > parseInt(toNode.y)) {
            upEdges.push(edges[i]);
        }
        if (parseInt(fromNode.x) > parseInt(toNode.x) && parseInt(fromNode.y) < parseInt(toNode.y)) {
            downEdges.push(edges[i]);
        }
    }
    var edge, arrow;
    var firstPoint, firstLine, firstCurvePoint, secondCurvePoint, secondLine, dPath, arrowPoints;
    for (i = 0; i < upEdges.length; i++) {
        fromNode = getFromNode(upEdges[i], nodes);
        toNode = getToNode(upEdges[i], nodes);
        edge = document.createElementNS(svgNS, "path");
        edge.setAttribute('stroke-width', "1");
        edge.setAttribute('stroke-linejoin', "round");
        if (upEdges[i].optionalColor)
            edge.setAttribute('stroke', upEdges[i].optionalColor);
        else
            edge.setAttribute('stroke', properties.defaultEdgeColor);
        edge.setAttribute('fill', "none");
        edge.setAttribute('id', fromNode.id + "-" + toNode.id);
        if (properties.graphType === "directed") {
            arrow = document.createElementNS(svgNS, "polygon");
            if (upEdges[i].optionalColor) {
                arrow.setAttribute('stroke', upEdges[i].optionalColor);
                arrow.setAttribute('fill', upEdges[i].optionalColor);
            }
            else {
                arrow.setAttribute('stroke', properties.defaultEdgeColor);
                arrow.setAttribute('fill', properties.defaultEdgeColor);
            }
            arrow.setAttribute('stroke-width', '1');
            arrow.setAttribute('id', 'arrow' + edge.getAttribute('id'));
        }
        firstPoint = "M " + parseInt(fromNode.x) * properties.coordinatesMultiplier +
            " " + parseInt(fromNode.y) * properties.coordinatesMultiplier;
        firstLine = " V " + parseInt(toNode.y) * properties.coordinatesMultiplier;
        secondLine = " H " + parseInt(toNode.x) * properties.coordinatesMultiplier;
        dPath = firstPoint + firstLine + secondLine;
        if (properties.graphType === "directed") {
            arrowPoints = (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension)).toString()
                + "," + parseInt(toNode.y) * properties.coordinatesMultiplier + " " +
                (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) * 1.5).toString()
                + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) / 3).toString() + " " +
                (parseInt(toNode.x) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) * 1.5).toString()
                + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier + parseInt(properties.nodeDimension) / 3).toString() + " ";
            arrow.setAttribute('points', arrowPoints);
        }
        edge.setAttribute('d', dPath);
        if (properties.graphType === "directed")
            svgElement.appendChild(arrow);
        svgElement.appendChild(edge);
        AggiungiPuntoUp(svgElement, svgNS, upEdgesAggiunti, upEdges[i], nodes);  //se necessario
        upEdgesAggiunti.push(upEdges[i]);
    }
    for (i = 0; i < downEdges.length; i++) {
        fromNode = getFromNode(downEdges[i], nodes);
        toNode = getToNode(downEdges[i], nodes);
        edge = document.createElementNS(svgNS, "path");
        edge.setAttribute('stroke-width', "1");
        edge.setAttribute('stroke-linejoin', "round");
        if (downEdges[i].optionalColor)
            edge.setAttribute('stroke', downEdges[i].optionalColor);
        else
            edge.setAttribute('stroke', properties.defaultEdgeColor);
        edge.setAttribute('fill', "none");
        edge.setAttribute('id', fromNode.id + "-" + toNode.id);
        if (properties.graphType === "directed") {
            arrow = document.createElementNS(svgNS, "polygon");
            if (downEdges[i].optionalColor) {
                arrow.setAttribute('stroke', downEdges[i].optionalColor);
                arrow.setAttribute('fill', downEdges[i].optionalColor);
            }
            else {
                arrow.setAttribute('stroke', properties.defaultEdgeColor);
                arrow.setAttribute('fill', properties.defaultEdgeColor);
            }
            arrow.setAttribute('stroke-width', '1');
            arrow.setAttribute('id', 'arrow' + edge.getAttribute('id'));
        }
        firstPoint = "M " + parseInt(fromNode.x) * properties.coordinatesMultiplier
            + " " + parseInt(fromNode.y) * properties.coordinatesMultiplier;
        firstLine = " V " + parseInt(toNode.y) * properties.coordinatesMultiplier;
        secondLine = " H " + parseInt(toNode.x) * properties.coordinatesMultiplier;
        dPath = firstPoint + firstLine + secondLine;
        if (properties.graphType === "directed") {
            arrowPoints = (parseInt(toNode.x) * properties.coordinatesMultiplier + parseInt(properties.nodeDimension)).toString()
                + "," + parseInt(toNode.y) * properties.coordinatesMultiplier + " " +
                (parseInt(toNode.x) * properties.coordinatesMultiplier + parseInt(properties.nodeDimension) * 1.5).toString()
                + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier - parseInt(properties.nodeDimension) / 3).toString() + " " +
                (parseInt(toNode.x) * properties.coordinatesMultiplier + parseInt(properties.nodeDimension) * 1.5).toString()
                + "," + (parseInt(toNode.y) * properties.coordinatesMultiplier + parseInt(properties.nodeDimension) / 3).toString() + " ";
            arrow.setAttribute('points', arrowPoints);
        }
        edge.setAttribute('d', dPath);
        if (properties.graphType === "directed")
            svgElement.appendChild(arrow);
        svgElement.appendChild(edge);
        AggiungiPuntoDown(svgElement, svgNS, downEdgesAggiunti, downEdges[i], nodes);  //se necessario
        downEdgesAggiunti.push(downEdges[i]);
    }
}

function AggiungiPuntoUp(svg, svgNS, edges, edge, nodes) {
    for (var i = 0; i < edges.length; i++) {
        var fromNodeAggiunto = getFromNode(edges[i], nodes);
        var fromNodeDaAggiungere = getFromNode(edge, nodes);
        var toNodeAggiunto = getToNode(edges[i], nodes);
        var toNodeDaAggiungere = getToNode(edge, nodes);
        if (fromNodeAggiunto === fromNodeDaAggiungere) {
            var blackPoint = document.createElementNS(svgNS, "ellipse");
            blackPoint.setAttribute('fill', properties.defaultEdgeColor);
            blackPoint.setAttribute('stroke', properties.defaultEdgeColor);
            blackPoint.setAttribute('rx', '1');
            blackPoint.setAttribute('ry', '1');
            if (parseInt(toNodeAggiunto.y) > parseInt(toNodeDaAggiungere.y)) {
                blackPoint.setAttribute('cx', parseInt(fromNodeAggiunto.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeAggiunto.y) * properties.coordinatesMultiplier);
            }
            else {
                blackPoint.setAttribute('cx', parseInt(fromNodeAggiunto.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeDaAggiungere.y) * properties.coordinatesMultiplier);
            }
            svg.appendChild(blackPoint);
        }
        if (toNodeAggiunto === toNodeDaAggiungere) {
            var blackPoint = document.createElementNS(svgNS, "ellipse");
            blackPoint.setAttribute('fill', properties.defaultEdgeColor);
            blackPoint.setAttribute('stroke', properties.defaultEdgeColor);
            blackPoint.setAttribute('rx', '1');
            blackPoint.setAttribute('ry', '1');
            if (parseInt(fromNodeAggiunto.x) > parseInt(fromNodeDaAggiungere.x)) {
                blackPoint.setAttribute('cx', parseInt(fromNodeAggiunto.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeAggiunto.y) * properties.coordinatesMultiplier);
            }
            else {
                blackPoint.setAttribute('cx', parseInt(fromNodeDaAggiungere.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeAggiunto.y) * properties.coordinatesMultiplier);
            }
            svg.appendChild(blackPoint);
        }
    }
}

function AggiungiPuntoDown(svg, svgNS, edges, edge, nodes) {
    for (var i = 0; i < edges.length; i++) {
        var fromNodeAggiunto = getFromNode(edges[i], nodes);
        var fromNodeDaAggiungere = getFromNode(edge, nodes);
        var toNodeAggiunto = getToNode(edges[i], nodes);
        var toNodeDaAggiungere = getToNode(edge, nodes);
        if (fromNodeAggiunto === fromNodeDaAggiungere) {
            var blackPoint = document.createElementNS(svgNS, "ellipse");
            blackPoint.setAttribute('fill', properties.defaultEdgeColor);
            blackPoint.setAttribute('stroke', properties.defaultEdgeColor);
            blackPoint.setAttribute('rx', '1');
            blackPoint.setAttribute('ry', '1');
            if (parseInt(toNodeAggiunto.y) > parseInt(toNodeDaAggiungere.y)) {
                blackPoint.setAttribute('cx', parseInt(fromNodeAggiunto.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeDaAggiungere.y) * properties.coordinatesMultiplier);
            }
            else {
                blackPoint.setAttribute('cx', parseInt(fromNodeAggiunto.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeAggiunto.y) * properties.coordinatesMultiplier);
            }
            svg.appendChild(blackPoint);
        }
        if (toNodeAggiunto === toNodeDaAggiungere) {
            var blackPoint = document.createElementNS(svgNS, "ellipse");
            blackPoint.setAttribute('fill', properties.defaultEdgeColor);
            blackPoint.setAttribute('stroke', properties.defaultEdgeColor);
            blackPoint.setAttribute('rx', '1');
            blackPoint.setAttribute('ry', '1');
            if (parseInt(fromNodeAggiunto.x) > parseInt(fromNodeDaAggiungere.x)) {
                blackPoint.setAttribute('cx', parseInt(fromNodeDaAggiungere.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeAggiunto.y) * properties.coordinatesMultiplier);
            }
            else {
                blackPoint.setAttribute('cx', parseInt(fromNodeAggiunto.x) * properties.coordinatesMultiplier);
                blackPoint.setAttribute('cy', parseInt(toNodeAggiunto.y) * properties.coordinatesMultiplier);
            }
            svg.appendChild(blackPoint);
        }
    }
}

function yMassima(nodes) {
    var yMaggiore = 0;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].y > yMaggiore) {
            yMaggiore = nodes[i].y;
        }
    }
    return yMaggiore;
}


