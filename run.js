drawAllMarchers();
setOutputs();

function render(tick) {
	if (moving) {
		let t = (tick - tock)*.001*speed;
		currentCount = getCount(t);
		
		if (Math.abs(t - audio.currentTime) > audioDelayLeniency) {audio.currentTime = t;}
	}
	let s = sets.findIndex(findCurrentDrill);
	if (s == null || s < 0) {
		s = 1; // i don't even wanna know
	}
	currentSet = s;
	
	drawAllMarchers();
	setOutputs();

	window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
