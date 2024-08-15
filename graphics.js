// variables
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

const field = document.getElementById("Field");
const fieldChildren = field.children;

const markings = fieldChildren[0];
const markctx = markings.getContext("2d");

const pathways = fieldChildren[1];
const pathctx = pathways.getContext("2d");

const mouseField = fieldChildren[2];
const mousectx = mouseField.getContext("2d");
mousectx.fillStyle = "Black";
mousectx.textAlign = "center";

const canvas = fieldChildren[3];
const ctx = canvas.getContext("2d");

let posX = 0;
let posY = 0;

let zoom = 1;
let scalar = windowHeight/1920; // 3600 inches in field

let mouseX = 0;
let mouseY = 0;
let mouseDownX = 0;
let mouseDownY = 0;

let currentHover = null;
let currentClicked = null;
let mouseDown = false;

const startOutput = document.querySelector("#sSet");
const movementOutput = document.querySelector("#movement");
const setOutputA = document.querySelector("#setA");
const setOutputB = document.querySelector("#setB");
const countOutputA = document.querySelector("#countA");
const countOutputB = document.querySelector("#countB");
const TcountOutput = document.querySelector("#Tcount");

const clampNum = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
const lerp = (x, y, a) => x * (1 - a) + y * a;


// display setup
function setOutputs() {
	let set = sets[currentSet];
	movementOutput.textContent = set.movement;
	setOutputA.textContent = sets[currentSet-1].set;
	setOutputB.textContent = set.set;
	countOutputA.textContent = Math.floor(currentCount)-set.beginCount+1;
	countOutputB.textContent = set.counts;
	TcountOutput.textContent = Math.floor(currentCount);
}

function transform() {
	posX = clampNum(posX,0,windowWidth*(1-1/zoom));
	posY = clampNum(posY,0,windowHeight*(1-1/zoom));
	
	for (let i = 0; i < fieldChildren.length; i++) {
		fieldChildren[i].getContext("2d").setTransform(zoom,0,0,zoom,-posX*zoom+.5,-posY*zoom+.5);
	}
	
	markctx.clearRect(posX,posY,windowWidth,windowHeight);
	for (let i=0; i < 21; i++) {
		if (i === 0 || i === 20) {
			markctx.lineWidth = 8*scalar;
		} else if (i === 10) {
			markctx.lineWidth = 4*scalar;
		} else {
			markctx.lineWidth = 2*scalar;
		}
		markctx.beginPath();
		markctx.moveTo(i*windowWidth/20, 0);
		markctx.lineTo(i*windowWidth/20, windowHeight);
		markctx.stroke();
		markctx.fillText(50-Math.abs(i-10)*5, i*windowWidth/20+10*scalar, windowHeight/zoom+posY-30*scalar);
	}

	for (let i=0; i < 4; i++) {
		if (i === 0 || i === 3) {
			markctx.lineWidth = 8*scalar;
		} else {
			markctx.lineWidth = 4*scalar;
		}
		markctx.beginPath();
		markctx.moveTo(0, i*windowHeight/3);
		markctx.lineTo(windowWidth, i*windowHeight/3);
		markctx.stroke();
	}
	markctx.translate(squareX*scalar,squareY*scalar);
	markctx.rotate((-20 * Math.PI) / 180);
	markctx.fillRect(-45*scalar,-45*scalar,90*scalar,90*scalar);
	markctx.translate(-squareX*scalar,-squareY*scalar);
}

function resize() {
	windowWidth = window.innerHeight*1.875;
	windowHeight = window.innerHeight;
	
	field.style.left = window.innerWidth/2 - windowWidth/2 - .5 + "px";
	field.style.top = -.5 + "px";
	
	for (let i = 0; i < fieldChildren.length; i++) { // doing it this way because setting the size through the div causes hella blurriness
		fieldChildren[i].width = windowWidth;
		fieldChildren[i].height = windowHeight;
	}
	transform();
	
	scalar = windowHeight/1920;
}
resize();
window.onresize = resize;

function drawMarcher(i) {
	let marcher = marchers[i]
	let drill = marcher.drill;
	let d = drill.findIndex(findCurrentDrill);
	if (d == null || d < 0) {
		d = 0;
	}
	if (currentCount >= drill[drill.length-1].endCount) {
		d = drill.length-1; // aka you're screwed
	}
	marcher.currentDot = d;
	
	let currentDot = drill[d];
	let lastDot = drill[d-1];
	let progress = (currentCount-currentDot.beginCount)/currentDot.counts;
	if (currentDot.counts <= 0 || currentCount >= drill[drill.length-1].endCount) {
		lastDot = drill[d];
		progress = 1;
	}
	
	let lastX = lastDot.CoordX*scalar;
	let lastY = lastDot.CoordY*scalar;
	let nextX = currentDot.CoordX*scalar;
	let nextY = currentDot.CoordY*scalar;
	
	let lerpX = lerp(lastX,nextX,progress);
	let lerpY = lerp(lastY,nextY,progress);
	
	ctx.beginPath();
	const newCircle = new Path2D();
	newCircle.arc(lerpX,lerpY,8*scalar,0,2*Math.PI);
	ctx.strokeStyle = colors[marcher.instrument]
	ctx.lineWidth = 4*scalar;
	ctx.stroke(newCircle);
	
	marcher.currentX = lerpX;
	marcher.currentY = lerpY;
	marcher.circle = newCircle;
	
	if (ctx.isPointInPath(newCircle, mouseX, mouseY)) {
		if (currentHover == null || currentHover === i) {
			mousectx.beginPath();
			mousectx.fill(newCircle);
			mousectx.fillText(marcher.label, lerpX-9*scalar, lerpY-20*scalar); // figure out centering
			currentHover = i;
		}
	}
	
	if (currentClicked === i) {
		if (currentClicked != currentHover) {
			mousectx.beginPath();
			mousectx.fill(marcher.circle);
		}
		
		pathctx.beginPath(); // completed travel line
		pathctx.moveTo(lastX,lastY);
		pathctx.lineTo(lerpX,lerpY);
		pathctx.strokeStyle = "MediumSpringGreen";
		pathctx.lineWidth = 6*scalar;
		pathctx.stroke();
		
		pathctx.beginPath(); // incomplete travel line
		pathctx.moveTo(lerpX,lerpY);
		pathctx.lineTo(nextX,nextY);
		pathctx.strokeStyle = "DeepSkyBlue";
		pathctx.lineWidth = 6*scalar;
		pathctx.stroke();
		
		pathctx.beginPath(); // midpoint circle
		pathctx.arc(lerp(lastX,nextX,.5),lerp(lastY,nextY,.5),4*scalar,0,2*Math.PI);
		pathctx.strokeStyle = "Black";
		pathctx.lineWidth = 6*scalar;
		pathctx.stroke();
		pathctx.fillStyle = "SlateGray";
		pathctx.fill();
		
		pathctx.beginPath(); // last circle
		pathctx.arc(lastX,lastY,6*scalar,0,2*Math.PI);
		pathctx.strokeStyle = "MediumSpringGreen";
		pathctx.lineWidth = 6*scalar;
		pathctx.stroke();
		pathctx.fillStyle = "MediumAquaMarine";
		pathctx.fill();
		
		pathctx.beginPath(); // next circle
		pathctx.arc(nextX,nextY,6*scalar,0,2*Math.PI);
		pathctx.strokeStyle = "DeepSkyBlue";
		pathctx.lineWidth = 6*scalar;
		pathctx.stroke();
		pathctx.fillStyle = "DodgerBlue";
		pathctx.fill();
	}
}

function drawAllMarchers() {
	for (let i = 1; i < fieldChildren.length; i++) { // start at 1 because we don't wanna erase the markings
		fieldChildren[i].getContext("2d").clearRect(0,0,windowWidth,windowHeight);
	}
	
	currentHover = null;
	for (let i = 0; i < marchers.length; i++) {
		drawMarcher(i);
	}
}

canvas.addEventListener("wheel", function(event) {
	event.preventDefault();
	
	const wheel = event.deltaY < 0 ? 1 : -1;
	let newZoom = clampNum(zoom*Math.exp(wheel*zoomSensitivity),zoomLowerLimit,zoomUpperLimit);
	
	posX -= event.offsetX/(newZoom) - event.offsetX/zoom; // this took way too long to figure out
	posY -= event.offsetY/(newZoom) - event.offsetY/zoom;
	zoom = newZoom;
	transform();
});

canvas.addEventListener("mousemove", function(event) {
	if (mouseDown) {
		posX -= (event.offsetX - mouseX)/zoom;
		posY -= (event.offsetY - mouseY)/zoom;
		transform();
	}
	
	mouseX = event.offsetX;
	mouseY = event.offsetY;
});

canvas.addEventListener("mousedown", function(event) {
	mouseDownX = event.offsetX;
	mouseDownY = event.offsetY;
	mouseDown = (event.button === 0 && currentHover == null);
});

canvas.addEventListener("click", function(event) {
	if (event.button === 0 && (!mouseDown || (mouseX === mouseDownX && mouseY === mouseDownY))) {
		currentClicked = currentHover;
	}
	mouseDown = false;
});

canvas.addEventListener("mouseleave", function(event) {
	mouseDown = false;
});
