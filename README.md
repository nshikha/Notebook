myNotebook
==========

myNotebook is an app that allows anyone to create their own notebook to store, search, and share information.
When a user visits the site, they can create a notebook for themself or view an existing notebook from someone else.
There is no search function to provide some privacy (users can choose an obscure notebook name if they want)
With your notebook, you can add links or notes and tag them with hashtags, then search the tags later to recall information.
Finally, if you want to share your notebook, you can take it's URL and share it. Anyone who visits that URL will be taken to your notebook!


Rubric details
==============

1. Javascript Objects: They are used both on the client and server, one example is on the server (app.js:line 43)
2. Canvas: We used the canvas to create a tag cloud that displays the most used tags in a notebook. The canvas code can be found in the "static/graph.js" file. You can see it in action at the http://<domain>/notebook/tutorial
3. HTML: We used both static HTML (static/index.html and static/notebook.html files) as well as dynamically generated HTML ("static/hybrid-page.js:line 213). We especially made use of the different types of form input elements, who knew <input type="image"> existed?! (static/notebook.html:line 41)
4. CSS: We made extensive use of CSS to make our site pretty. Almost every element has an ID or Class associated with it. Some examples of exotic CSS include:
   - position relative/absolute hacks (things with .entry in static/notebook.css:lines 55-95)
   - pseudo selectors like hover. Check out or supercool hover change in the add link input box (static/notebook.html:lines 142-145)
   - cool stuff. We managed to make 2 textboxes and one textarea look like a single input area. Check out the add-entry and edit-entry. (static/notebook.html:lines 129-173)
5. DOM manipulation: We manipulated the DOM in many ways, for an example, check out the document.ready function (static/hybrid-page.js:line 307) or generateEntries in "static/hybrid-page.js:line 213)
6. jQuery: jQuery was used everywhere (perhaps even too much). See all of (static/index-page.js) and (static/hybrid-page.js)
7. AJAX client: we wrote wrapper functions to handle API calls, see all of static/notebook.js (lines 9, 30, ...)
8. AJAX server: we created express routes to be consumed by the API and to be called by the browser. see app.js:line 430


Code oranization:
=================

app.js: All of the serverside code
static/notebook.js: clientside code to communicate with the server
static/index.html: the home page/landing page
static/index-page.js: javascript specific to the home/landing page
static/index.css: CSS specific to the home/landing page
static/notebook.html: the notebook specific page
static/hybrid-page.js: javascript specific to the notebook page
static/notebook.css: CSS specific to the notebook page
static/graph.js: javascript for canvas use

Robustness:
===========

There is error checking throughout the app. Try submitting an empty entry. Try opening a nonexistent notebook!


Iterative Design:
=================
This is a version of our readme file just yesterday. Note that we have changed much of what we thought we were going to do.

Notebook -- (archive of our project description as of Monday 2/26/13)
=====================================================================

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
	-Parse hashtags correctly on frontend. It's not working right now.
	-Sort by search criterion
	-Link search with MRU/LRU
