const canvas = document.getElementById("Field_Drill");
const ctx = canvas.getContext("2d");

class Dot {
	constructor(begin,marcher,movement,subset,set,counts,LR,sSteps,inOut,ydLn,fSteps,FB,homVis,line) {
		this.marcher = marcher;
		this.movement = movement;
		this.subset = subset;
		this.set = set;
		this.counts = counts;
		
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
		
		this.CoordX = this.findCoordX();
		this.CoordY = this.findCoordY();
	}
	findCoordX() {
		let coordX = this.sideSteps*canvas.width/160;
		if (this.inOut === "Outside") {coordX *= -1;}
		coordX += this.yardLine*canvas.width/100;
		if (this.leftRight === "Right") {coordX = canvas.width-coordX;}
		return coordX;
	}
	findCoordY() {
		let coordY = canvas.height;
		if (this.homeVisitor === "Visitor") {
			coordY = 0;
			if (this.line === "Hash") {coordY += canvas.height/3;}
		} else {
			if (this.line === "Hash") {coordY -= canvas.height/3;}
		}
		let steps = this.frontSteps*(canvas.height/256*3);
		if (this.frontBehind === "Behind") {steps *= -1;}
		return (coordY+steps);
	}
	toString() {
		
	}
}

class Set {
	constructor(movement,subsets,set,counts,tempo) {
		this.movement = movement;
		this.subsets = subsets;
		this.set = set;
		this.counts = counts;
		this.tempo = tempo;
		this.drill = [];
		this.len = tempo / (60 * counts)
	}
	
	addDot(dot) {
		this.drill.push(dot);
	}
}

class Marcher {
	constructor(label, name, instrument) {
		this.label = label;
		this.name = name;
		this.instrument = instrument;
	}
	
}
