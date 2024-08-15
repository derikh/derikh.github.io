// settings
const speed = 1;

const fluidTempoAccuracy = 4; // for ritardando, accelerando, etc. (idk if we need this)

const audioDelayLeniency = .25;

const yCorrectionConstant = (320/22.5)/14; // it's a common misconception that there are 14 steps between the sideline and hash; it's actually ~14.2. 🤓👆

const zoomSensitivity = .1;
const zoomLowerLimit = 1;
const zoomUpperLimit = 50;

const squareX = 1620;
const squareY = 1280 + (16*22.5*yCorrectionConstant);
