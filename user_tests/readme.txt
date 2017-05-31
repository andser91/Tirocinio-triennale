					++++++++++++++++++++++++ USERS TEST ++++++++++++++++++++++++
Applicazione Web per la somministrazione di test utente in ambito di visualizzazione delle informazione

ISTRUZIONI PER L'USO

-Impostazioni generali delle proprietà del test, configurare il file config.py:

	+ QUESTIONS_FILE = percorso del file .json (+ nome del file) che contiene la descrizione del test
	 (vedere il file testDescriptorExample.json per capire come costruirlo)

	+ QUESTION_DIRECTORY = percorso della cartella contenente le domande del test

	+ JS_DIRECTORY = percorso della cartella contenente i file javascript

	+ TEST_LENGTH = lunghezza del test espressa con un intero che rappresenta il numero di domande

	+ RANGES_OF_RANDOMIZATION = lista di intervalli di randomizzazione ad esempio: [[start,end],...[start,end]]. tutti i valori devono essere minori di TEST_LENGTH 
								(se si vuole che le domande seguano l'ordine stabilito in testDescriptor lasciare la lista vuota '[]')


- Ogni domanda ha una propria cartella, sottocartella di QUESTION_DIRECTORY, nella quale devono essere presenti due file: properties.json e il file dal quale il browser
    caricherà l'immagine svg che può essere un file .svg già pronto oppue un file .json che contiene le coordinate dei nodi e l'elenco degli archi.
    ATTENZIONE ognuno di questi file per ogni domanda deve avere lo stesso nome ovvero 'properties.json', 'svg.svg', 'coord.json'
    (per capire come sono strutturati tali file vedere i file di esempio)

Tutti i file di esempio si trovano nella cartella 'Example'