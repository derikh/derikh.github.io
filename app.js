const field = document.getElementById("Field");

const lines = document.getElementById("Field_Lines");
const fieldctx = lines.getContext("2d");

let scalar = 1;

function resize() {
	canvas.width = window.innerWidth/2*1.5;
	canvas.height = window.innerWidth/3.75*1.5;
	lines.width = window.innerWidth/2*1.5;
	lines.height = window.innerWidth/3.75*1.5;
	
	scalar = window.innerWidth/1800*1.5;
	
	canvas.style.left = (window.innerWidth/2-canvas.width/2).toString().concat("px");
	canvas.style.top = (window.innerHeight/2-canvas.height/1.5).toString().concat("px");
	lines.style.left = (window.innerWidth/2-lines.width/2).toString().concat("px");
	lines.style.top = (window.innerHeight/2-lines.height/1.5).toString().concat("px");
	
	for (let i=1; i < 20; i++) {
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

let currentMovement = 1;
let currentSet = 2;

const clampNum = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
const lerp = (x, y, a) => x * (1 - a) + y * a;

function setAll(progress) {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	if (progress == null || currentSet === 1) {
		for (let i = 0; i < setPointer.drill.length; i++) {
			if (setPointer.drill[i].subset === 1) {
				ctx.beginPath();
				ctx.arc(setPointer.drill[i].CoordX,setPointer.drill[i].CoordY,5,0,2*Math.PI);
				ctx.stroke();
			}	
		}
	} else {
		for (let i = 0; i < setPointer.drill.length; i++) {
			if (setPointer.drill[i].subset === 1) {
				let lastDot = movements[currentMovement-1][currentSet-2].drill[i]
				ctx.beginPath();
				ctx.arc(lerp(lastDot.CoordX*scalar,setPointer.drill[i].CoordX*scalar,progress),lerp(lastDot.CoordY*scalar,setPointer.drill[i].CoordY*scalar,progress),5,0,2*Math.PI);
				ctx.stroke();
			}
		}
	}
}

const movementOutput = document.querySelector("#movement");
const setOutputA = document.querySelector("#setA");
const setOutputB = document.querySelector("#setB");

const speed = 1;
let tock;
let setPointer = movements[currentMovement-1][currentSet-1];
ctx.lineWidth = 1;
setAll();
console.log("Set 1");
function render(tick) {
	if (tock == null) {
		tock = tick;
	}
	let t = (tick - tock)*.001;
	let progress = t * setPointer.len * speed
	
	if (progress >= 1) {
		tock += (tick - tock)/progress;
		currentSet += 1;
		console.log("Set".concat(" ", (currentSet-1).toString()));
		if (currentSet > movements[currentMovement-1].length) {
			currentMovement += 1;
			currentSet = 2;
			console.log("Set 1");
			if (currentMovement > movements.length) {
				currentMovement = 1;
			}
		}
		setOutputA.textContent = currentSet-1;
		setOutputB.textContent = currentSet;
		movementOutput.textContent = currentMovement;
		setPointer = movements[currentMovement-1][currentSet-1];
		progress = (tick-tock)*.001 * setPointer.len * speed
	}
	setAll(clampNum(progress, 0, 1));
	
	window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
