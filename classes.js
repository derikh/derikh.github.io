const canvas = document.getElementById("Field_Drill");
const ctx = canvas.getContext("2d");

function findCoordX(tis) {
	let coordX = tis.sideSteps*canvas.width/160;
	if (tis.inOut === "Outside") {coordX *= -1;}
	coordX += tis.yardLine*canvas.width/100;
	if (tis.leftRight === "Right") {coordX = canvas.width-coordX;}
	return coordX;
}

function findCoordY(tis) {
	let coordY = canvas.height;
	if (tis.homeVisitor === "Visitor") {
		coordY = 0;
		if (tis.line === "Hash") {coordY += canvas.height/3;}
	} else {
		if (tis.line === "Hash") {coordY -= canvas.height/3;}
	}
	let tStep = tis.frontSteps*(canvas.height/256*3);
	if (tis.frontBehind === "Behind") {tStep *= -1;}
	return (coordY+tStep);
}

class Dot {
	constructor(marcher,stepRat,movement,subset,set,counts,LR,sSteps,inOut,ydLn,fSteps,FB,homVis,line) {
		this.marcher = marcher;
		this.stepRatio = stepRat;
		this.steps = (counts*stepRat);
		this.movement = movement;
		this.subset = subset;
		this.set = set;
		this.counts = counts;
		
		this.beginCount = 1;
		this.endCount = counts+1;
		
		if (LR === "On") {
			line = FB;
			homVis = fSteps;
			FB = ydLn;
			fSteps = inOut;
			ydLn = sSteps;
			inOut = "Inside";
			sSteps = 0;
			LR = "Left";
		}
		
		if (sSteps === "On") {
			line = homVis;
			homVis = FB;
			FB = fSteps;
			fSteps = ydLn;
			ydLn = inOut;
			inOut = "Inside";
			sSteps = 0;
		}
		
		if (fSteps === "On") {
			line = homVis;
			homVis = FB;
			FB = "Front";
			fSteps = 0;
		}
		
		this.leftRight = LR;
		this.sideSteps = sSteps;
		this.inOut = inOut;
		this.yardLine = ydLn;
		this.frontSteps = fSteps;
		this.frontBehind = FB;
		this.homeVisitor = homVis;
		this.line = line;
		
		this.CoordX = findCoordX(this);
		this.CoordY = findCoordY(this);
	}
	
	
	toString() {
		"Set: 4. Counts: 8. Right: 2.0 steps outside 50 yd ln. 8.0 steps in front of Home Hash (HS)"
	}
}

let wantedMarcher = "A1";
let wantedSubset = 1;
function findMarcher(object) {
	return object.marcher = wantedMarcher;
}
function findSubset(object) {
	return object.subset = wantedSubset;
}

class Set {
	constructor(movement,set,counts,tempo,change) {
		this.movement = movement;
		this.set = set;
		this.counts = counts;
		this.tempo = tempo;
		this.change = change;
		this.fullDrill = [];
		this.drill = [];
		this.len = 60*counts / tempo;
		
		this.beginCount = 1;
		this.endCount = counts+1;
		this.beginTime = 0;
		this.endTime = this.len;
	}
	
	addDot(dot) {
		this.fullDrill.push(dot);
		
		let highestSubsets = {};
		for (let i = 0; i < this.fullDrill.length; i++) {
			if (highestSubsets[this.fullDrill[i].marcher] == null || this.fullDrill[i].subset > highestSubsets[this.fullDrill[i].marcher]) {
				highestSubsets[this.fullDrill[i].marcher] = this.fullDrill[i].subset;
			}
		}
		
		let newDrill = [];
		for (let i = 0; i < this.fullDrill.length; i++) {
			if (this.fullDrill[i].subset === highestSubsets[this.fullDrill[i].marcher]) {
				newDrill.push(this.fullDrill[i])
			}
		}
		this.drill = newDrill;
	}
}

class Marcher {
	constructor(label, name, instrument) {
		this.label = label;
		this.name = name;
		this.instrument = instrument;
		this.drill = [];
	}
	
	addDot(dot) {
		this.drill.push(dot);
	}
}
