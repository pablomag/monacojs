const car = document.getElementById('car');
const viewport = document.getElementById('viewport');

const unit = 'px';
const gameTick = 5;
const trackSpeed = .1;

const steeringSpeed = 3;
const gasSpeed = 1;
const brakeSpeed = 2;

let direction = 'none';
let pedal = 'none';
let steering = false;
let gasPressed = false;

const keyCodes = {
	37: 'left',
	38: 'gas',
	39: 'right',
	40: 'brake'
};

let initGame = false;

const init = () => {

	if (!initGame) {

		initGame = true;

		const overlay = document.getElementById('overlay');
		const tracks = document.querySelectorAll('.track');
		const trackId = tracks.length;

		const track = document.createElement('div');
		const leftRail = document.createElement('div');
		const road = document.createElement('div');
		const rightRail = document.createElement('div');
	
		track.style.top = '-1em';
		track.style.left = '0';
		track.classList.add('track', `track-${trackId}`);
	
		overlay.appendChild(track);
	
		leftRail.classList.add('left-rail');
		road.classList.add('road');
		rightRail.classList.add('right-rail');
	
		track.appendChild(leftRail);
		track.appendChild(road);
		track.appendChild(rightRail);
	}
};

const drive = (event) => {

	event.preventDefault();

	const keyPressed = event.which;
	const validKeys = Object.keys(keyCodes);

	if (validKeys.includes(String(keyPressed))) {

		switch(keyPressed) {
		case 37:
			steering = true;
			direction = 'left';
			break;
		case 39:
			steering = true;
			direction = 'right';
			break;
		case 38:
			gasPressed = true;
			pedal = 'gas';
			break;
		case 40:
			gasPressed = true;
			pedal = 'brake';
			break;
		default:
			gasPressed = false;
			steering = false;
			direction = 'none';
			pedal = 'none';
			break;
		}
	}
};

const stop = (event) => {

	const keyUnpressed = event.which;

	if (keyCodes[keyUnpressed] === direction)
		steering = false;

	if (keyCodes[keyUnpressed] === pedal)
		gasPressed = false;
};

const carMovement = () => {

	const carPosition = car.getBoundingClientRect();
	const carHeight = carPosition.height;
	const viewportHeight = viewport.offsetHeight;
	const startingPosition = ((viewportHeight * 95) / 100) - carHeight;

	let left = carPosition.left;

	if (!car.style.top) {

		car.style.opacity = 1;
		car.style.top = `${startingPosition}${unit}`;
	}

	if (steering) {

		if (direction === 'left')
			left = carPosition.left - steeringSpeed;
		else
			left = carPosition.left + steeringSpeed;

		car.style.left = `${left}${unit}`;
	}

	if (gasPressed) {

		let top = car.style.top;
		const currentPosition = parseFloat(top.replace(unit, ''));

		if (pedal === 'gas')
			top = currentPosition - gasSpeed;
		else
			top = currentPosition + brakeSpeed;

		car.style.top = `${top}${unit}`;
	}
};

const overlaps = (first, second) => {

	const firstShape = getPosition(first);
	const secondShape = getPosition(second);

	function getPosition(element) {

		const shape = element.getBoundingClientRect();
	
		const width = shape.width;
		const height = shape.height;
	
		const left = shape.x;
		const right = shape.x + width;
		const top = shape.y;
		const bottom = shape.y + height;

		return { top, right, bottom, left };
	}

	function isColliding() {

		let notColliding = true;
	
		notColliding = firstShape.right < secondShape.left || firstShape.left > secondShape.right;

		if (!notColliding)
			notColliding = firstShape.top > secondShape.bottom || firstShape.bottom < secondShape.top;

		return !notColliding;
	}

	return isColliding();
};

const crashDetection = () => {

	const leftRails = [].slice.call(document.querySelectorAll('.left-rail'));
	const rightRails = [].slice.call(document.querySelectorAll('.right-rail'));

	leftRails.forEach(rail => {
		if (overlaps(car, rail))
			console.log('crashed on the left');
	});

	rightRails.forEach(rail => {
		if (overlaps(car, rail))
			console.log('crashed on the right');
	});
};

const travel = (track) => {

	let top = track.style.top;
	const currentPosition = parseFloat(top.replace(unit, ''));

	top = !top ? trackSpeed : currentPosition + trackSpeed;

	track.style.top = `${top}${unit}`;

	if (!overlaps(track, viewport))
		track.remove();
};

setInterval(() => {
	init();
	carMovement();
	trackTravel();
	crashDetection();
}, gameTick);

const trackTravel = () => {

	const tracks = document.querySelectorAll('.track');

	tracks.forEach((track) => {
		travel(track);
	});
};

window.addEventListener('keydown', drive);
window.addEventListener('keyup', stop);
