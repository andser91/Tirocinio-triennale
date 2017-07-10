from flask import Flask, render_template, request, json, url_for, session
import config
import random

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('firstPage.html')


@app.route('/firstPage', methods=['POST'])
def first_page():
    with app.open_resource(config.TEST_DESCRIPTOR) as data_file:
        data = json.load(data_file)
        return render_template('presentationPage.html', group=data['groups'])


@app.route('/instructions', methods=['POST'])
def instructions():
    user = request.form['user']
    group = request.form['group']
    return render_template('sizePage.html', user=user, group=group)


@app.route('/size', methods=['POST'])
def size():
    user = request.form['user']
    group = request.form['group']
    image_fileL = config.QUESTION_DIRECTORY + "userGuide" + "/" + "svgL.svg"
    image_fileO = config.QUESTION_DIRECTORY + "userGuide" + "/" + "svgO.svg"
    image_fileM = config.QUESTION_DIRECTORY + "userGuide" + "/" + "svgM.svg"
    image_fileLNot = config.QUESTION_DIRECTORY + "userGuide" + "/" + "svgLNot.svg"
    image_fileONot = config.QUESTION_DIRECTORY + "userGuide" + "/" + "svgONot.svg"
    image_fileMNot = config.QUESTION_DIRECTORY + "userGuide" + "/" + "svgMNot.svg"
    return render_template('userGuide.html',image_fileL=image_fileL, image_fileO=image_fileO, image_fileM=image_fileM,
                           image_fileLNot=image_fileLNot, image_fileONot=image_fileONot, image_fileMNot=image_fileMNot,
                           user=user, group=group)


@app.route('/userGuide', methods=['POST'])
def userGuide():
    user = request.form['user']
    group = request.form['group']
    with app.open_resource(config.QUESTION_DIRECTORY + "userAttempt" + "/" + "propertiesL.json") as json_file:
        propertiesL = json.load(json_file)
    with app.open_resource(config.QUESTION_DIRECTORY + "userAttempt" + "/" + "propertiesO.json") as json_file:
        propertiesO = json.load(json_file)
    with app.open_resource(config.QUESTION_DIRECTORY + "userAttempt" + "/" + "propertiesM.json") as json_file:
        propertiesM = json.load(json_file)
    text_question = "Select the common successors (immediate neighbors) of the two highlighted vertices"

    with app.open_resource(config.QUESTION_DIRECTORY + "userAttempt" + "/" + "coord.json") as coord_json:
        coord = json.load(coord_json)
        return render_template('userAttempt.html', propertiesL=propertiesL, propertiesM=propertiesM, propertiesO=propertiesO,
                                image_file=coord, text_question=text_question, user=user, group=group)


@app.route('/userAttempt', methods=['POST'])
def userAttempt():
    user = request.form['user']
    group = request.form['group']
    questions_string = make_string_from_json()
    i = 0
    while i < len(config.RANGES_OF_RANDOMIZATION):
        questions_string = randomize(questions_string, config.RANGES_OF_RANDOMIZATION[i][0],
                                     config.RANGES_OF_RANDOMIZATION[i][1])
        i = i + 1
    total_number_of_questions = config.TEST_LENGTH
    id_question = int(questions_string.split('#')[0])
    questions_string = elimina_id(questions_string)
    question = build_question(id_question)
    if question[0] == 'radioQuestion.html':
        return render_template(question[0], text_question=question[1], questions_string=questions_string,
                               options=question[2], correct_answer=question[3],
                               image_file=question[4], user=user, step=0, group=group, id_question=id_question,
                               total_number_of_questions=total_number_of_questions, properties=question[5],
                               make_svg=question[5])
    elif question[0] == 'textQuestion.html':
        return render_template(question[0], text_question=question[1], questions_string=questions_string,
                               correct_answer=question[2], image_file=question[3], user=user, step=0, group=group,
                               id_question=id_question, total_number_of_questions=total_number_of_questions,
                               properties=question[4], make_svg=question[5])
    elif question[0] == 'interactiveQuestion.html':
        return render_template(question[0], text_question=question[1], questions_string=questions_string,
                               correct_answer=question[2], image_file=question[3], user=user, step=0, group=group,
                               id_question=id_question, total_number_of_questions=total_number_of_questions,
                               properties=question[4], make_svg=question[5], interactive_script=question[6],
                               get_answer=question[7])


# legge un file json e forma la stringa da cui poi verranno generate tutte le domande
def make_string_from_json():
    questions_string = ''
    with app.open_resource(config.TEST_DESCRIPTOR) as data_file:
        data = json.load(data_file)
        i = 0
        while i < config.TEST_LENGTH:
            if questions_string == "":
                questions_string = questions_string + str(data['test'][i]['id']) + '#p'
            else:
                questions_string = questions_string + '#' + str(data['test'][i]['id']) + '#p'
            i = i + 1
    return questions_string[:-2]


def randomize(string, start, end):
    ids_list = string.split('#p#')
    i = start
    while i < end:
        j = random.randint(i, end)
        temp = ids_list[i]
        ids_list[i] = ids_list[j]
        ids_list[j] = temp
        i = i + 1
    return '#p#'.join(ids_list)


# recupera tutti i dati di una domanda a partire dall'id della domanda
# ed al perorso del file json restituendoli in una lista
def build_question(id_question):
    with app.open_resource(config.TEST_DESCRIPTOR) as data_file:
        data = json.load(data_file)
        i = 0
        while i < len(data['test']):
            if data['test'][i]['id'] == id_question:
                text_question = data['test'][i]["question"]
                correct_answer = data['test'][i]["correctAnswer"]
                template = data['test'][i]['template']
                make_svg = url_for('static', filename='js/makeSVG.js')
                if data['test'][i]['template'] == 'radioQuestion.html':
                    options = data['test'][i]['options']
                    with app.open_resource(config.QUESTION_DIRECTORY + data['test'][i]['question_folder']
                                                   + "/" + "properties.json") as json_file:
                        properties = json.load(json_file)
                        if properties['fileType'] == "SVG_file":
                            image_file = config.QUESTION_DIRECTORY + data['test'][i]['question_folder'] + "/" + "svg.svg"
                            return [template, text_question, options, correct_answer, image_file, properties, make_svg]
                        else:
                            image_file = config.QUESTION_DIRECTORY + data['test'][i]['question_folder'] + "/" + "coord.json"
                            with app.open_resource(image_file) as coord_json:
                                coord = json.load(coord_json)
                                return [template, text_question, options, correct_answer, coord, properties, make_svg]
                elif data['test'][i]['template'] == 'textQuestion.html':
                    with app.open_resource(config.QUESTION_DIRECTORY + data['test'][i]['question_folder']
                                + "/" + "properties.json") as json_file:
                        properties = json.load(json_file)
                        if properties['fileType'] == "SVG_file":
                            image_file = config.QUESTION_DIRECTORY + data['test'][i]['question_folder'] + "/" + "svg.svg"
                            return [template, text_question, correct_answer, image_file, properties, make_svg]
                        else:
                            image_file = config.QUESTION_DIRECTORY + data['test'][i]['question_folder'] + "/" + "coord.json"
                            with app.open_resource(image_file) as coord_json:
                                coord = json.load(coord_json)
                                return [template, text_question, correct_answer, coord, properties, make_svg]
                elif data['test'][i]['template'] == 'interactiveQuestion.html':
                    interactive_script = url_for('static', filename='js/svgInteractiveScript.js')
                    get_answer = url_for('static', filename='js/getAnswerInteractiveQuestion.js')
                    with app.open_resource(config.QUESTION_DIRECTORY + data['test'][i]['question_folder'] + "/" + "properties.json") as json_file:
                        properties = json.load(json_file)
                        if properties['fileType'] == "SVG_file":
                            image_file = config.QUESTION_DIRECTORY + data['test'][i]['question_folder'] + "/" + "svg.svg"
                            return [template, text_question, correct_answer, image_file, properties, make_svg,
                                    interactive_script, get_answer]
                        else:
                            image_file = config.QUESTION_DIRECTORY + data['test'][i]['question_folder'] + "/" + "coord.json"
                            with app.open_resource(image_file) as coord_json:
                                coord = json.load(coord_json)
                                return [template, text_question, correct_answer, coord, properties, make_svg,
                                        interactive_script, get_answer]
            i = i + 1
    return ['pagePause.html']


# elimina dalla stringa contenente gli id delle domande del testo il primo id il carattere separatore '+',
# la 'p' della pagina di pausa e un altro '+'
def elimina_id(stringa):
    cont = 0
    for i in stringa:
        if i != '#':
            cont = cont + 1
        else:
            break
    return stringa[cont + 1:]


# richiede i dati personali,li stampa su file, costruisce la stringa del test, la prima domanda
#  aggiorna la stringa e reindirizza alla prima domanda
@app.route('/presentation', methods=['POST'])
def presentation():
    user = request.form['firstName'] + request.form['lastName'] + request.form['userId']
    age = request.form['age']
    gender = request.form['gender']
    group = request.form['group']
    data_e_ora = request.form['dataEora']
    if group != 'null':
        with open('answer.txt', 'a') as text_file:
            text_file.write('[%s] ' % data_e_ora + 'user=%s' % user + ' group=%s' % group
                            + ' age=%s' % age + ' gender=%s\n' % gender)
    else:
        with open('answer.txt', 'a') as text_file:
            text_file.write('[%s] ' % data_e_ora + 'user=%s' % user
                            + ' age=%s' % age + ' gender=%s\n' % gender)
    with app.open_resource(config.TEST_DESCRIPTOR) as data_file:
        data = json.load(data_file)
        return render_template('instructionsPage.html', istruzioni=data['instructions'],user=user, group=group)


# richiede i dati dalla form della risposta, stampa su file user,step,risposta e tempo
#  e reindirizza alla pagina di pausa
@app.route('/answers', methods=['POST'])
def answers():
    questions_string = request.form['questions_string']
    user = request.form['user']
    group = request.form['group']
    answer = request.form['answer']
    time = request.form['time']
    step = request.form['step']
    data_e_ora = request.form['dataEora']
    total_number_of_questions = request.form['total_number_of_questions']
    id_question = request.form['id_question']
    correct_answer = request.form['correct_answer']
    if group != 'null':
        with open('answer.txt', 'a') as text_file:
            text_file.write(
                '[%s]' % data_e_ora + ' user=%s' % user + ' group=%s' % group + ' step=%s' % step + ' id_question=%s'
                % id_question + ' correct_answer=%s' % correct_answer + ' answer=%s' % answer + ' time=%s\n' % time)
    else:
        with open('answer.txt', 'a') as text_file:
            text_file.write(
                '[%s]' % data_e_ora + ' user=%s' % user + ' step=%s' % step + ' id_question=%s' % id_question
                + ' correct_answer=%s' % correct_answer + ' answer=%s' % answer + ' time=%s\n' % time)
    questions_string = elimina_id(questions_string)
    if len(questions_string) == 0:
        return render_template('endPage.html', step=step, total_number_of_questions=total_number_of_questions)
    return render_template('pagePause.html', user=user, group=group, step=step, questions_string=questions_string,
                           total_number_of_questions=total_number_of_questions)


# recupera dei dati inviati dal client, costruisce la prossima domanda e reindirizza alla prossima domanda
@app.route('/page_pause', methods=['GET', 'POST'])
def page_pause():
    user = request.form['user']
    step = request.form['step']
    group = request.form['group']
    total_number_of_questions = request.form['total_number_of_questions']
    questions_string = request.form['questions_string']
    id_question = int(questions_string.split('#')[0])
    questions_string = elimina_id(questions_string)
    question = build_question(id_question)
    if question[0] == 'radioQuestion.html':
        return render_template(question[0], text_question=question[1], questions_string=questions_string,
                               options=question[2], correct_answer=question[3],
                               image_file=question[4], user=user, step=step, group=group, id_question=id_question,
                               total_number_of_questions=total_number_of_questions, properties=question[5],
                               make_svg=question[6])
    elif question[0] == 'textQuestion.html':
        return render_template(question[0], text_question=question[1], questions_string=questions_string,
                               correct_answer=question[2], image_file=question[3], user=user, step=step, group=group,
                               id_question=id_question, total_number_of_questions=total_number_of_questions,
                               properties=question[4], make_svg=question[5])
    elif question[0] == 'interactiveQuestion.html':
        return render_template(question[0], text_question=question[1], questions_string=questions_string,
                               correct_answer=question[2], image_file=question[3], user=user, step=step, group=group,
                               id_question=id_question, total_number_of_questions=total_number_of_questions,
                               properties=question[4], make_svg=question[5], interactive_script=question[6],
                               get_answer=question[7])


if __name__ == '__main__':
    app.run()
