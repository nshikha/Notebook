Notebook
========

An online notebook to allow users to store, search, and share information with everyone. 
Users are given a free page to add links or notes and tag them with relevant hashtags. 
Anyone can search a users links/notes and view the resources or information they have online.

Unit Project - 15237

Important code design questions:
	Should we only persist the data back to the server once the file write is complete, or should we add it first to the server, and then write it to file?
	What is the best way to serve different html pages/redirects?
		Should we load everything on the client side and change the DOM?
		Should we serve multiple pages?

TODO:
	-Discuss the format of a notebook name?
		-All lowercase?
		-No numbers?
		-Must be something that can be written to a filename
	-Ask Dan about how he wants the alltags datastructure
		-Use Object.keys(obj) to extract the object properties.