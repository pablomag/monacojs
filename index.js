const car = document.getElementById('car');
const viewport = document.getElementById('viewport');

const viewportHeight = parseInt(viewport.offsetHeight);
const trackHeight = 19;
const trackChunks = 40; /* Track chunks to pre-render */

const unit = 'px';
const gameTick = 5;
const trackSpeed = 1; /* 1 to 10 */

const steeringSpeed = 3;
const gasSpeed = 1;
const brakeSpeed = 2;

let direction = 'none';
let pedal = 'none';
let steering = false;
let gasPressed = false;

const startingTrackWidth = 400;
const widenSpeed = 3;
let trackWidth = 150;
let trackMargin = 140;

const keyCodes = {
	37: 'left',
	38: 'gas',
	39: 'right',
	40: 'brake'
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

const getTopValue = () => {

	const numberOfTracks = getNumberOfTracks();

	return viewportHeight - (trackHeight * numberOfTracks);
};

const getNumberOfTracks = () => {

	const tracks = document.querySelectorAll('.track');

	return tracks.length;
};

const createTrack = () => {

	const track = document.createElement('div');
	const leftRail = document.createElement('div');
	const road = document.createElement('div');
	const rightRail = document.createElement('div');

	const top = getTopValue();
	const numberOfTracks = getNumberOfTracks();

	track.style.top = `${top}${unit}`;
	track.classList.add('track', `track-${numberOfTracks}`);

	leftRail.classList.add('left-rail');
	road.classList.add('road');
	rightRail.classList.add('right-rail');

	road.style.width = `${startingTrackWidth}${unit}`;

	track.appendChild(leftRail);
	track.appendChild(road);
	track.appendChild(rightRail);

	const trackContainer = document.getElementById('tracks');

	trackContainer.appendChild(track);
};

let currentTrackWidth = 0;
let currentTrackMargin = 0;

const recycleTrack = (track) => {

	let top = getTopValue();

	track.style.top = `${top}${unit}`;

	const road = track.querySelector('.road');

	if (currentTrackWidth === 0) {

		currentTrackWidth = road.style.width;
		currentTrackWidth = parseInt(currentTrackWidth.replace(unit, ''));
	}

	let newRoadWidth = currentTrackWidth;

	if (trackWidth > currentTrackWidth)
		newRoadWidth = (currentTrackWidth + widenSpeed) > trackWidth ? trackWidth : (currentTrackWidth + widenSpeed);

	if (trackWidth < currentTrackWidth)
		newRoadWidth = (currentTrackWidth - widenSpeed) < trackWidth ? trackWidth : (currentTrackWidth - widenSpeed);

	currentTrackWidth = newRoadWidth;

	road.style.width = `${newRoadWidth}${unit}`;

	let newTrackMargin = currentTrackMargin;

	if (trackMargin > currentTrackMargin)
		newTrackMargin = (currentTrackMargin + widenSpeed) > trackMargin ? trackMargin : (currentTrackMargin + widenSpeed);

	if (trackMargin < currentTrackMargin)
		newTrackMargin = (currentTrackMargin - widenSpeed) < trackMargin ? trackMargin : (currentTrackMargin - widenSpeed);

	currentTrackMargin = newTrackMargin;

	track.style.left = `${currentTrackMargin}${unit}`;
};

const travel = (track) => {

	let top = track.style.top;
	const currentPosition = parseInt(top.replace(unit, ''));

	top = !top ? 0 : currentPosition + trackSpeed;

	track.style.top = `${top}${unit}`;

	if (top > viewportHeight) recycleTrack(track);

	const classList = track.classList.value;
	const classes = classList.split(' ');

	const t1 = document.getElementById('track-0-display');
	const t2 = document.getElementById('track-1-display');
	const t3 = document.getElementById('track-2-display');
	const t4 = document.getElementById('track-3-display');
	const t5 = document.getElementById('track-4-display');

	if (classes.includes('track-0'))
		t1.value = `top: ${top}, ${viewportHeight} = ${top > viewportHeight}`;
	if (classes.includes('track-1'))
		t2.value = `top: ${top}, ${viewportHeight} = ${top > viewportHeight}`;
	if (classes.includes('track-2'))
		t3.value = `top: ${top}, ${viewportHeight} = ${top > viewportHeight}`;
	if (classes.includes('track-3'))
		t4.value = `top: ${top}, ${viewportHeight} = ${top > viewportHeight}`;
	if (classes.includes('track-4'))
		t5.value = `top: ${top}, ${viewportHeight} = ${top > viewportHeight}`;
};

let ready = true;

const trackTravel = () => {

	const tracks = document.querySelectorAll('.track');

	let tracksProcessed = 0;

	if (ready) {

		ready = false;

		tracks.forEach((track, index, array) => {

			travel(track);

			tracksProcessed++;

			if (tracksProcessed === array.length) ready = true;
		});
	}
};

const start = () => {

	window.addEventListener('keydown', drive);
	window.addEventListener('keyup', stop);

	setInterval(() => {
		trackTravel();
		carMovement();
		crashDetection();
	}, gameTick);
};

const init = () => {

	let tracksCreated = 0;

	while (tracksCreated <= trackChunks) {

		createTrack();

		tracksCreated++;

		if (tracksCreated === trackChunks) start();
	}
};

init();
