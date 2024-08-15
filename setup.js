// variables
let moving = false;
let startSet = 1;

let currentSet = 1;
let currentCount = 1;

let tempoChanges = [0];
let countValues = [0];
let totalTime = 0;

let tock;


// add dots to data of sets and marchers
for (let i = 0; i < _dots.length; i++) {
	let dot = _dots[i];
	for (let s = 0; s < sets.length; s++) {
		let set = sets[s];
		if (set.set === dot.set && set.movement === dot.movement) {
			set.addDot(dot);
		}
	}
	for (let m = 0; m < marchers.length; m++) {
		let marcher = marchers[m];
		if (marcher.label === dot.marcher) {
			marcher.addDot(dot);
		}
	}
}

// set beginning and end counts for marchers
for (let i = 0; i < marchers.length; i++) {
	let drill = marchers[i].drill;
	let elapsedCounts = 1;
	for (let d = 0; d < drill.length; d++) {
		let dot = drill[d];
		dot.beginCount = elapsedCounts;
		elapsedCounts += dot.counts;
		dot.endCount = elapsedCounts;
	}
}

// create arrays for what counts the tempo changes on, and the value (time) each chunk of similar tempo lasts
let elapsedCounts = 1;
let elapsedTime = 0;
for (let s = 1; s < sets.length; s++) {
	let set = sets[s];
	set.beginCount = elapsedCounts;
	set.beginTime = elapsedTime;
	elapsedCounts += set.counts;
	elapsedTime += set.len; // will fix later for gradual changes
	set.endCount = elapsedCounts;
	set.endTime = elapsedTime;
	
	if (set.tempo === sets[s-1].tempo) {
		tempoChanges[tempoChanges.length-1] += set.counts;
		countValues[countValues.length-1] += set.len;
	} else {
		if (set.change == null) {
			tempoChanges.push(set.counts);
			countValues.push(set.len);
			totalTime += countValues[countValues.length-2]
		} else {
			for (count=1; count<=set.counts*fluidTempoAccuracy; count++) { // currently slightly broken
				tempoChanges.push(1/fluidTempoAccuracy);
				countValues.push(60/(sets[s-1].tempo+(set.tempo-sets[s-1].tempo)*((count-.5)/fluidTempoAccuracy)/set.counts));
				totalTime += countValues[countValues.length-2]
			}
		}
	}
}
totalTime += countValues[countValues.length-1]

console.log(tempoChanges);
console.log(countValues);
console.log(totalTime);

function findCurrentDrill(theDrill) {
	return (currentCount >= theDrill.beginCount && currentCount < theDrill.endCount);
}

function getCount(t) {
	let extCounts = 0;
	let extValue = 0;
	for (i = 0; i < countValues.length; i++) {
		let countChunk = countValues[i];
		let tempoChunk = tempoChanges[i];
		t -= countChunk;
		if (t <= 0) {
			return Math.max(1,(t+countChunk)*tempoChunk/countChunk+extCounts+1);
		}
		extCounts += tempoChunk;
		if (i === countValues.length-1 && t > 0) {
			tock += totalTime*1000/speed;
			return 1;
		}
	}
}

function stop() {
	moving = false;
	audio.pause();
}

function start() {
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
	moving = true;
}

function incStart(add) {
	stop();
	startSet += add;
	if (startSet < 1) {startSet = sets.length-1;} else if (startSet > sets.length-1) {startSet = 1;}
	
	currentCount = sets[startSet].beginCount;
	startOutput.textContent = sets[startSet-1].set;
}
