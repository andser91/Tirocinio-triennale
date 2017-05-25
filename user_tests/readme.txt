					++++++++++++++++++++++++ USERS TEST ++++++++++++++++++++++++

- Set the general test options in the config.py file
	+ QUESTIONS_FILE = path of the .json file that contains the test descriptor
	 (see testExample.json to understand how build it)

	+ QUESTION_DIRECTORY = path of the directory that contains all the questions

	+ JS_DIRECTORY = path of the directory that contains the .js files

	+ TEST_LENGTH = length of the test in number of questions

	+ RANGES_OF_RANDOMIZATION = list of randomization ranges like [[start,end],...[start,end]]. the values in this list must be less TEST_LENGTH 
								(if empty the questions will come in the order they are in QUESTIONS_FILE)


- Each question is located in its own folder where there are two files: properties.json and the file from which the browser
    loads the image that can be a .svg file or a .json file containing the coordinates of nodes and edges.
    ATTENTION this two files must be called svg.svg or coord.json!
    (see svgExample file and coordExample file to understand how build them)