// ---------------------------------------------------------------
// Everything with the canvas

//var alltags = [{"tag": "facebook", "numEntries": 3},{"tag": "google", "numEntries": 1},{"tag": "apple", "numEntries": 4},{"tag": "twilio", "numEntries": 5},{"tag": "twitter", "numEntries": 9}];


//https://developer.mozilla.org/en-US/docs/Drawing_text_using_a_canvas




//ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
//ctx.fillRect(50, 250, 300, 100);
//fillRect(height, width, left, top)

// text = string to print
// fontsize = fontsize to use
// left = how many pixels from the left.
// top = how many pixels fromt the top.
function textFader(text, fontsize, color, left, top, ctx){
	var fader = this;

	this.font = fontsize + "px Verdana";
	this.text = text;
	this.left = left;
	this.top = top;
	this.alpha = 1.0;
	this.alpha_incr = .02;
	this.width;
	this.height = fontsize*1.5;
	this.delay = 50;
	this.status = "off";
	this.intervalId;
	this.color = color;

	function rectSize(){
		ctx.font = fader.font;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		fader.width = ctx.measureText(fader.text).width;
	}

	rectSize();

	this.clearFader = function(){
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillRect(fader.left, fader.top, fader.width, fader.height);
	}

	this.drawText = function(){
		ctx.font = fader.font;
		ctx.fillStyle = fader.color;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(fader.text, fader.left, fader.top);
	}

	this.drawRect = function(){
		ctx.fillStyle = "rgba(255, 255, 255," + fader.alpha + ")";
		ctx.fillRect(fader.left, fader.top, fader.width, fader.height);
	}

	this.drawFader = function(){
		fader.clearFader();
		fader.drawText();
		fader.drawRect();
	}

	this.changeFader = function(){
		console.log(fader.alpha);
		if(fader.status === "fadein"){
			fader.alpha -= fader.alpha_incr;
			if(fader.alpha <= 0.1){
				fader.alpha = 0.0;
				fader.status = "hold";
			}
			fader.drawFader();
		}
		else if(fader.status === "hold"){
			fader.status = "void";
			clearInterval(fader.intervalId);
			/*setTimeout(function(){
				fader.status = "fadeout";
				fader.intervalId = setInterval(fader.changeFader, fader.delay);
			}, 2000);*/
		}
		else if(fader.status === "fadeout"){
			fader.alpha += fader.alpha_incr;
			if(fader.alpha >= 1.0){
				fader.alpha = 1.0;
				fader.status = "off";
			}
			fader.drawFader();
		}
		else if(fader.status === "off"){
			clearInterval(fader.intervalId);
		}

	}

	this.startFade = function(){
		fader.alpha = 1.0;
		fader.status = "fadein";
		fader.intervalId = setInterval(fader.changeFader, fader.delay);
	}
}

function drawTags(alltags, ctx){
	var canvasWidth = ctx.canvas.width;
	var canvasHeight = ctx.canvas.height;

	var topMargin = 25;
	var leftMargin = 10;
	var rightMargin = 150;
	var bottomMargin = 45;

	var drawWidth = canvasWidth - rightMargin - leftMargin;
	var drawHeight = canvasHeight - topMargin - bottomMargin;
	
	var numTagsToDisplay = 6;

	var colors = ["red","green", "blue", "black", "magenta", "cyan","salmon","chartreuse","gold","orange","seagreen","slateblue","chocolate"];
	var validHeights = [];

	for(var i = 0; i < numTagsToDisplay; i++){
		validHeights[i] = i*drawHeight/numTagsToDisplay;
	}

	var context = this;

	this.arr = [];

	for(var i = 0; i < numTagsToDisplay && alltags.length > 0; i++){
		var tagInd = Math.floor(alltags.length * Math.random());
		var tag = "#" + alltags[tagInd].tag;
		alltags.splice(tagInd, 1);

		console.log(tag);

		var x = drawWidth * Math.random();

		// Make sure they don't overlap
		var yInd = Math.floor(validHeights.length * Math.random());
		var y = validHeights[yInd];
		validHeights.splice(yInd, 1);

		// Choose a different color for each one.
		var colorInd = Math.floor(colors.length * Math.random());
		var color = colors[colorInd];
		colors.splice(colorInd, 1);

		this.arr.push(new textFader(tag, 20, color, leftMargin + x, topMargin + y, ctx));
	}


	this.startFade = function(){
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		for(var i = 0; i < context.arr.length; i++){
			context.arr[i].startFade();
		}
	}
}


function keepDrawingTags(alltags, ctx){
	return function(){
		var newalltags = alltags.slice(0);
		newalltags.sort(function(elem1, elem2){
			if(elem1.numEntries > elem2.numEntries){
				return 1;
			}
			if(elem1.numEntries < elem2.numEntries){
				return -1;
			}
			return 0;
		});

		var tagCollection = new drawTags(newalltags.slice(0,25), ctx);
		tagCollection.startFade();
	}
}

function setupDrawTags(canvasId,alltags){
	var canvas = document.getElementById(canvasId);
	var ctx = canvas.getContext('2d');
	var callback = keepDrawingTags(alltags, ctx);
	callback();
	return callback;
}
