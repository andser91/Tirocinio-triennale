var i = 0;
function nextInstruction() {
    i++;
    var svgObject = document.getElementById('svgObject');
    var text = document.getElementById('textGuide');
    var form = document.getElementById('form');
    if (i < imageFile.length - 1) {
        svgObject.setAttribute('data', imageFile[i]);
        text.innerHTML = textGuide[i];
        if (document.getElementById('previous') === null) {
            var previous = document.createElement('input');
            previous.setAttribute('type', 'button');
            previous.setAttribute('id', 'previous');
            previous.setAttribute('class', 'btn btn-success');
            previous.setAttribute('value', 'Back');
            previous.setAttribute('style', 'margin-top: 2%; float: left');
            previous.addEventListener('click', previousInstruction, false);
            form.appendChild(previous);
        }
    }
    if (i === imageFile.length - 1) {
        svgObject.setAttribute('data', imageFile[i]);
        text.innerHTML = textGuide[i];
        var submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('id', 'submit');
        submit.setAttribute('class', 'btn btn-success');
        submit.setAttribute('value', 'Next');
        submit.setAttribute('style', 'margin-top: 2%; float: right');
        form.removeChild(document.getElementById('next'));
        form.appendChild(submit);
    }
}

function previousInstruction() {
    i--;
    var svgObject = document.getElementById('svgObject');
    var text = document.getElementById('textGuide');
    var form = document.getElementById('form');
    if (i > 0) {
        svgObject.setAttribute('data', imageFile[i]);
        text.innerHTML = textGuide[i];
         if (document.getElementById('submit') !== null) {
                form.removeChild(document.getElementById('submit'));
            }
        if (document.getElementById('next') === null) {
            var next = document.createElement('input');
            next.setAttribute('type', 'button');
            next.setAttribute('id', 'next');
            next.setAttribute('class', 'btn btn-success');
            next.setAttribute('value', 'Next');
            next.setAttribute('style', 'margin-top: 2%; float: right');
            next.addEventListener('click', nextInstruction, false);
            form.appendChild(next);
        }
    }
    if (i === 0) {
        svgObject.setAttribute('data', imageFile[i]);
        text.innerHTML = textGuide[i];
        form.removeChild(document.getElementById('previous'));
    }
}
