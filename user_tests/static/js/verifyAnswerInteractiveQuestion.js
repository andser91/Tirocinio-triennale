function verifyAnswer(highlightedNode, answer, verify) {
    var firstNode = highlightedNode[0].id;
    var lastNode = highlightedNode[1].id;
    var listAnswer = answer.split(",");
    var copyListAnswer = listAnswer.slice(0);
    if (verify === "path") {
        return verifyPath(firstNode, lastNode, copyListAnswer)
            || verifyPath(lastNode, firstNode, copyListAnswer)
    }
    if (verify === "cicle") {
        return (verifyPath(firstNode, firstNode, copyListAnswer) && containsNode(listAnswer, lastNode))
            || (verifyPath(lastNode, lastNode, copyListAnswer) && containsNode(listAnswer, firstNode))
    }
    if (verify === "neighbour") {
        return verifyNeighbour(firstNode,lastNode,copyListAnswer);
    }
}

function verifyNeighbour(firstNode,secondNode,answer) {
    var firstIndex = firstNode.substring(4);
    var secondIndex = secondNode.substring(4);
    var graph = vicini(image_file.nodes, image_file.edges);
    var firstVicini = graph[firstIndex].split(",");
    var secondVicini = graph[secondIndex].split(",");
    firstVicini.pop();
    secondVicini.pop();
    var boolean = true;
    var viciniInComune = [];
    for (var i=0; i<firstVicini.length; i++){
        for (var j=0; j<secondVicini.length; j++){
            if (firstVicini[i] === secondVicini[j]){
                viciniInComune.push(firstVicini[i]);
            }
        }
    }
    for (i = 0; i<answer.length; i++){
        for (j=0; j<viciniInComune.length; j++){
            if (answer[i] === viciniInComune[j]){
                answer.splice(i,1);
                viciniInComune.splice(j,1);
                i = -1;
            }
        }
    }
    return answer.length === 0 && viciniInComune.length === 0;
}

function vicini(nodes,edges) {
    var graph = [];
    for (var i=0; i<nodes.length;i++){
        graph[i] = "";
    }
    for (i=0; i<edges.length;i++){
        graph[edges[i].from.substring(4)] = graph[edges[i].from.substring(4)] += edges[i].to +",";
    }
    return graph;
}

function verifyPath(first, last, list) {
    if (list === undefined)
        return false;
    var firstEdge = findFromNode(list, first);
    var orderedList = [];
    if (firstEdge === undefined)
        return false;
    else {
        orderedList.push(firstEdge);
        var i = 0;
        while (i<list.length && getToNodeString(orderedList[(orderedList.length - 1)]) !== last && list.length !== 0){
            if (getToNodeString(orderedList[(orderedList.length - 1)]) === getFromNodeString(list[i])) {
                orderedList.push(list[i]);
                list.splice(i,1);
                i = -1;
            }
            i++;
        }
        if (list.length !== 0)
            return false;
        if (getToNodeString(orderedList[(orderedList.length - 1)]) !== last)
            return false;
        return true;
    }
}

function containsNode(edgeList,node) {
    for (var i = 0; i<edgeList.length; i++){
        if (getFromNodeString(edgeList[i]) === node
            || getToNodeString(edgeList[i]) === node)
            return true;
    }
    return false;
}

function findFromNode(list, node) {
    for (var i = 0; i < list.length; i++) {
        if (getFromNodeString(list[i]) === node) {
            var edge = list[i];
            list.splice(i, 1);
            return edge;
        }
    }
    return undefined;
}
function getFromNodeString(edge) {
   return edge.split("-")[0];
}

function getToNodeString(edge) {
    return edge.split("-")[1];
}

function isEdgeBelongsToNode(edge, node) {
    return getFromNodeString(edge) === node || getToNodeString(edge) === node;
}