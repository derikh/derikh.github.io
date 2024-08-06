// display setup
const field = document.getElementById("Field");

const lines = document.getElementById("Field_Lines");
const fieldctx = lines.getContext("2d");

const mouseField = document.getElementById("Field_Mouse");
const mousectx = mouseField.getContext("2d");
mousectx.fillStyle = "Black"

let moving = false;

let scalar = 1;
function resize() {
	canvas.width = window.innerWidth/2*1.5;
	canvas.height = window.innerWidth/3.75*1.5;
	lines.width = window.innerWidth/2*1.5;
	lines.height = window.innerWidth/3.75*1.5;
	mouseField.width = window.innerWidth/2*1.5;
	mouseField.height = window.innerWidth/3.75*1.5;
	
	scalar = window.innerWidth/1800*1.5;
	
	canvas.style.left = (window.innerWidth/2-canvas.width/2).toString() + "px";
	canvas.style.top = (canvas.height/32).toString() + "px";
	lines.style.left = (window.innerWidth/2-lines.width/2).toString() + "px";
	lines.style.top = (lines.height/32).toString() + "px";
	mouseField.style.left = (window.innerWidth/2-mouseField.width/2).toString() + "px";
	mouseField.style.top = (mouseField.height/32).toString() + "px";
	
	for (let i=1; i < 20; i++) {
		if (i === 10) {
			fieldctx.lineWidth = 2;
		} else {
			fieldctx.lineWidth = 1;
		}
		fieldctx.beginPath();
		fieldctx.moveTo(i*lines.width/20, 0);
		fieldctx.lineTo(i*lines.width/20, lines.height);
		fieldctx.stroke();
	}

	for (let i=1; i < 3; i++) {
		fieldctx.beginPath();
		fieldctx.moveTo(0, i*lines.height/3);
		fieldctx.lineTo(lines.width, i*lines.height/3);
		fieldctx.stroke();
	}
}
resize();
window.onresize = resize;


// add dots to data of sets and marchers
for (let s = 0; s < sets.length; s++) {
	for (let i = 0; i < _drill.length; i++) {
		if (sets[s].set === _drill[i].set && sets[s].movement === _drill[i].movement) {
			sets[s].addDot(_drill[i]);
		}
	}
}
for (let m = 0; m < marchers.length; m++) { // and marchers
	for (let i = 0; i < _drill.length; i++) {
		if (marchers[m].label === _drill[i].marcher) {
			marchers[m].addDot(_drill[i]);
		}
	}
}


// set beginning and end counts for marchers
for (let i = 0; i < marchers.length; i++) {
	let elapsedCounts = 1;
	for (let d = 0; d < marchers[i].drill.length; d++) {
		marchers[i].drill[d].beginCount = elapsedCounts;
		elapsedCounts += marchers[i].drill[d].counts;
		marchers[i].drill[d].endCount = elapsedCounts;
	}
}
let elapsedCounts = 1; // and sets
let elapsedTime = 0;
for (let s = 0; s < sets.length; s++) {
	sets[s].beginCount = elapsedCounts;
	sets[s].beginTime = elapsedTime;
	elapsedCounts += sets[s].counts;
	elapsedTime += sets[s].len; // will fix later for gradual changes
	sets[s].endCount = elapsedCounts;
	sets[s].endTime = elapsedTime;
}


// create arrays for what counts the tempo changes on, and the value (time) each chunk of similar tempo lasts
let changeAccuracy = 4; // for ritardando, accelerando, etc.

let tempoChanges = [0];
let countValues = [0];
let totalTime = 0; 

for (i=1; i<sets.length; i++) {
	let theSet = sets[i];
	if (theSet.tempo === sets[i-1].tempo) {
		tempoChanges[tempoChanges.length-1] += theSet.counts;
		countValues[countValues.length-1] += theSet.len;
	} else {
		if (theSet.change == null) {
			tempoChanges.push(theSet.counts);
			countValues.push(theSet.len);
			totalTime += countValues[countValues.length-2]
		} else {
			for (count=1; count<=theSet.counts*changeAccuracy; count++) {
				tempoChanges.push(1/changeAccuracy);
				countValues.push(60/(sets[i-1].tempo+(theSet.tempo-sets[i-1].tempo)*((count-.5)/changeAccuracy)/theSet.counts));
				totalTime += countValues[countValues.length-2]
			}
		}
	}
}
totalTime += countValues[countValues.length-1]

console.log(tempoChanges);
console.log(countValues);
console.log(totalTime);


let currentSet = 1;
let currentCount = 1;
let currentDots = [];

let tock;
let speed = 1;

const clampNum = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
const lerp = (x, y, a) => x * (1 - a) + y * a;

function setAll(currentDrill, lastDrill) {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	let newDots = [];
	if (lastDrill == null) {
		for (let i = 0; i < currentDrill.length; i++) {
			ctx.beginPath();
			const circle = new Path2D();
			circle.arc(currentDrill[i].CoordX*scalar,currentDrill[i].CoordY*scalar,4,0,2*Math.PI);
			newDots.push({circ: circle, dotDrill: currentDrill[i]});
			ctx.stroke(circle);
		}
	} else {
		for (let i = 0; i < currentDrill.length; i++) {
			let progress = (currentCount-currentDrill[i].beginCount)/currentDrill[i].counts
			let lerpX = lerp(lastDrill[i].CoordX*scalar,currentDrill[i].CoordX*scalar,progress);
			let lerpY = lerp(lastDrill[i].CoordY*scalar,currentDrill[i].CoordY*scalar,progress);
			
			ctx.beginPath();
			const circle = new Path2D();
			circle.arc(lerpX,lerpY,4,0,2*Math.PI);
			newDots.push({circ: circle, dotDrill: currentDrill[i]});
			ctx.stroke(circle);
		}
	}
	currentDots = newDots;
}

const marcherOutput = document.querySelector("#marcher");

canvas.addEventListener("mousemove", function(event) {
	// Check whether point is inside circle
	mousectx.clearRect(0, 0, mouseField.width, mouseField.height);
	let found = false;
	for (let i = 0; i < currentDots.length; i++) {
		if (ctx.isPointInPath(currentDots[i].circ, event.offsetX, event.offsetY)) {
			found = true;
			mousectx.beginPath();
			mousectx.fill(currentDots[i].circ);
			marcherOutput.style.left = event.clientX + 10 + "px"
			marcherOutput.style.top = event.clientY - 50 + "px"
			marcherOutput.textContent = currentDots[i].dotDrill.marcher;
			marcherOutput.style.visibility = "visible";
		}
		if (!found) {marcherOutput.style.visibility = "hidden";}
	}
});

canvas.addEventListener("mousedown", function(event) {
	for (let i = 0; i < currentDots.length; i++) {
		if (ctx.isPointInPath(currentDots[i].circ, event.offsetX, event.offsetY)) {
			
		}
	}
});

function getCount(t) {
	let extCounts = 0;
	let extValue = 0;
	for (i = 0; i < countValues.length; i++) {
		t -= countValues[i];
		if (t <= 0) {
			// return Math.max(1,(t+countValues[i])*tempoChanges[i]/countValues[i]+extCounts+1); doing this later, old way is funny
			return (t+countValues[i])*tempoChanges[i]/countValues[i]+extCounts+1;
		}
		extCounts += tempoChanges[i];
		if (i === countValues.length-1 && t > 0) {
			tock += totalTime*1000/speed;
			return 1;
		}
	}
}


const startOutput = document.querySelector("#sSet");

const movementOutput = document.querySelector("#movement");
const setOutputA = document.querySelector("#setA");
const setOutputB = document.querySelector("#setB");
const countOutputA = document.querySelector("#countA");
const countOutputB = document.querySelector("#countB");
const TcountOutput = document.querySelector("#Tcount");

function findCurrentDrill(theDrill) {
	return (currentCount >= theDrill.beginCount && currentCount < theDrill.endCount);
}

let theSet = sets[currentSet-1];
ctx.lineWidth = 1;
setAll(sets[0].drill);

let audio = new Audio('Full Ensemble-MET.mp3');
function render(tick) {
	if (moving) {
		let t = (tick - tock)*.001*speed;
		
		currentCount = getCount(t);
		let currentDrill = [];
		let lastDrill = [];
		for (let i = 0; i < marchers.length; i++) {
			let d = marchers[i].drill.findIndex(findCurrentDrill);
			if (d == null || d < 0) {
				d = 1;
			}
			currentDrill.push(marchers[i].drill[d]);
			lastDrill.push(marchers[i].drill[d-1])
		}
		
		if (Math.abs(t - audio.currentTime) > .1) {audio.currentTime += (t - audio.currentTime);}
		
		setAll(currentDrill, lastDrill);
		
		let s = sets.findIndex(findCurrentDrill);
		if (s == null || s < 0) {
			s = 1;
		}
		theSet = sets[s]
		currentSet = s;
		// movementOutput.textContent = theSet.movement;
		setOutputA.textContent = sets[s-1].set;
		setOutputB.textContent = theSet.set;
		countOutputA.textContent = Math.floor(currentCount)-theSet.beginCount+1;
		countOutputB.textContent = theSet.counts;
		TcountOutput.textContent = Math.floor(currentCount);
	}
	window.requestAnimationFrame(render);
}


let startSet = 1;

function stop() {
	moving = false;
	audio.pause();
}

function start() {
	moving = true;
	if (startSet === 1) {
		tock = performance.now();
		currentCount = 1;
		audio.play();
		audio.currentTime = 0;
	} else {
		tock = performance.now() - sets[startSet].beginTime*1000;
		currentCount = sets[startSet-1].beginCount;
		audio.play();
		audio.currentTime = sets[startSet-1].beginTime;
	}
}

function incStart(adding) {
	stop();
	if (adding === "add") {
		startSet += 1;
		if (startSet > sets.length) {startSet = 1;}
	} else if (adding === "subtract") {
		startSet -= 1;
		if (startSet < 1) {startSet = sets.length;}
	}
	currentCount = sets[startSet-1].beginCount;
	setAll(sets[startSet-1].drill);
	startOutput.textContent = sets[startSet-1].set;
}
window.requestAnimationFrame(render);
