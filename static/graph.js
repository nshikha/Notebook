var canvas = ($("#graph"))[0]; /* non jquery canvas */
var context = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

context.fillStyle = "#36474b";
context.fillRect(0,0,canvas.width,canvas.height)

$(document).ready(function() {
	drawAxes();
});

function drawAxes() {
	context.fillStyle = "#4b595b";
	var margin = 20;
	var xLen = width-(margin*2);
	var yLen = height-(margin*2);
	var size = 5;
	/* x axis */
	context.fillRect(margin,height-margin,xLen,size);
	/* y axis */
	context.fillRect(margin,margin,size,yLen);
	drawDivs(margin,margin,20,"Y",yLen,size)
	drawDivs(margin,height-margin,20,"X",xLen,size)
}

function drawDivs(Xstart,Ystart,step,dir,length,size) {
	if (dir === "Y") {
		for(var i = 0; i < (length/step); i++){
			context.fillRect(Xstart,Ystart+step*i,16,size)
		}
	}
	else {
		for(var i = 2; i < (length/step); i++){
			context.fillRect(Xstart+step*i,Ystart-14,size,14)
		}
	}

}