var i = 0;
$(document).ready(function () {
    document.getElementById('instr').innerHTML = instr[0];
});

function nextText() {
    i++;
    console.log(i);
    var form = document.getElementById('form');
    if (i < instr.length - 1) {
        document.getElementById('instr').innerHTML = instr[i];
        if (document.getElementById('previous') === null) {
            var previous = document.createElement('input');
            previous.setAttribute('type', 'button');
            previous.setAttribute('id', 'previous');
            previous.setAttribute('class', 'btn btn-success');
            previous.setAttribute('value', 'Back');
            previous.setAttribute('style', 'float: left');
            previous.addEventListener('click', previousText, false);
            form.appendChild(previous);
        }
    }
    if (i === instr.length - 1) {
        var submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('id', 'submit');
        submit.setAttribute('class', 'btn btn-success');
        submit.setAttribute('value', 'Next');
        submit.setAttribute('style', 'float: right');
        form.removeChild(document.getElementById('next'));
        form.appendChild(submit);
        document.getElementById('instr').innerHTML = instr[i];
    }
}

function previousText() {
    i--;
    console.log(i);
    var form = document.getElementById('form');
    if (i > 0) {
        document.getElementById('instr').innerHTML = instr[i];
         if (document.getElementById('submit') !== null) {
                form.removeChild(document.getElementById('submit'));
            }
        if (document.getElementById('next') === null) {
            var next = document.createElement('input');
            next.setAttribute('type', 'button');
            next.setAttribute('id', 'next');
            next.setAttribute('class', 'btn btn-success');
            next.setAttribute('value', 'Next');
            next.setAttribute('style', 'float: right');
            next.addEventListener('click', nextText, false);
            form.appendChild(next);
        }
    }
    if (i === 0) {
        document.getElementById('instr').innerHTML = instr[i];
        form.removeChild(document.getElementById('previous'));
    }
}

<!-- <input style="align-content: center; margin-top: 5%" type="submit" value="OK" class="btn btn-success"> -->