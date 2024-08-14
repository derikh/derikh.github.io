let audio = new Audio('Full Ensemble-MET.mp3'); // give it time to load or smth idk

function findCoordX(dot) {
	let coordX = dot.sideSteps*22.5 * (dot.inOut === "Outside" ? -1 : 1);
	coordX += dot.yardLine*36;
	coordX = dot.leftRight === "Right" ? 3600-coordX : coordX;
	return coordX;
}

function findCoordY(dot) {
	let coordY = dot.frontSteps*22.5*yCorrectionConstant * (dot.frontBehind === "Front" ? -1 : 1);
	coordY += dot.line === "Hash" ? 640 : 0;
	coordY = dot.homeVisitor === "Home" ? 1920-coordY : coordY;
	return coordY;
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
		
		this.beginCount = 0;
		this.endCount = 0;
		
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
		return "Set: " + this.set + ". Counts: " + this.counts + ". " + this.leftRight + ": " + this.sideSteps + " steps " + this.inOut + " " + this.yardLine + " yd ln. " + this.frontSteps + " steps " + this.frontBehind + " " + this.homeVisitor + " " + this.line;
		"Set: 4. Counts: 8. Right: 2.0 steps outside 50 yd ln. 8.0 steps in front of Home Hash (HS)";
	}
}

let wantedMarcher;
let wantedSubset;
function findMarcher(object) {
	return object.marcher = wantedMarcher;
}
function findSubset(object) {
	return object.subset = wantedSubset;
}

class Marcher {
	constructor(label, name, instrument) {
		this.label = label;
		this.name = name;
		this.instrument = instrument;
		this.drill = [];
		
		this.currentDot = 0;
		this.currentX = 0;
		this.currentY = 0;
		this.circle = new Path2D();
	}
	addDot(dot) {
		this.drill.push(dot);
	}
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
		
		this.beginCount = 0;
		this.endCount = 0;
		this.beginTime = 0;
		this.endTime = 0;
	}
	
	addDot(dot) {
		this.fullDrill.push(dot);
		
		let highestSubsets = {};
		for (let i = 0; i < this.fullDrill.length; i++) {
			let dot = this.fullDrill[i];
			if (highestSubsets[dot.marcher] === undefined || dot.subset > highestSubsets[dot.marcher]) {
				highestSubsets[dot.marcher] = dot.subset;
			}
		}
		
		let newDrill = [];
		for (let i = 0; i < this.fullDrill.length; i++) {
			let dot = this.fullDrill[i];
			if (dot.subset === highestSubsets[dot.marcher]) {
				newDrill.push(dot);
			}
		}
		this.drill = newDrill;
	}
}

