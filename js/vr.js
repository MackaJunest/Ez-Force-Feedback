/*!
 * AC.VR class
 *
 * Creates a javascript-powered VR, based on QuickTime 7 VR technology,
 * but with a few added benefits and enhancements:
 *
 *     1. Easier initialization -- no QuickTime; just one line of javascript
 *     2. Faster load time -- no need to wait for the entire file to download before interacting
 *     3. Intros -- spinning intro animation is used by default, which is easily overridden
 *     4. Inertia -- once the VR is mostly loaded, the user can "throw" it at the end of a grab
 *
 * How to initialize:
 *
 * Make sure you've imported /safaridemos/showcase/global_html5/scripts/vr.js and /safaridemos/showcase/global_html5/styles/vr.css on your page.
 *
 * If your VR only has an X axis:
 *     new AC.VR('div-id', '/path/to/image/sequence/sequence/image_###.jpg', 36);
 *
 * If it has both X and Y axes:
 *     new AC.VR('div-id', '/path/to/image/sequence/sequence/image_###.jpg', [36,20], { initialPos: [8,9] });
 *
 *
 * @param  mixed   container    Element (or its ID) to contain the VR
 * @param  string  imagePath    Path to image sequence. Use "###" to indicate the variable image number.
 * @param  mixed   totalFrames  Number of frames, indicated as a number (x-axis only) or array ([x-axis, y-axis])
 * @param  object  options      Optionally override any of the default options (documented below)
 *
 * @author Brandon Kelly
 */

AC.VR = Class.create();

AC.VR.SpinIntro = function(vr){
	var totalFrames = vr.options.fps * vr.options.introDuration,
		introInitialRow = (typeof vr.options.introInitialRow != 'undefined') ? vr.options.introInitialRow : vr.options.initialPos[1],
		rowDiff = introInitialRow - vr.options.initialPos[1],
		queue = $A();

	for (var i=0; i<totalFrames; i++) {
		var percent = i/totalFrames,
			speed = Math.pow(percent-1,4),
			posX = Math.floor(speed * vr.totalFrames[0] * vr.options.introSpins) + vr.options.initialPos[0],
			posY = Math.floor(speed * rowDiff) + vr.options.initialPos[1];

		// prevent doubles
		if (!queue.length || queue.last()[0] != posX || queue.last()[1] != posY) {
			queue.push(vr.validatePos([posX, posY], true));
		}
	}

	return queue;
};

AC.VR.options = {
	imageIndexOffset: 1,        // (number)   maps the position [0,0] to image 001.jpg, etc.
	loaders: 3,                 // (number)   how many concurrent image loaders
	initialLoad: 4,             // (number)   images to load initially per row (4 = every 90 degrees)
	noCache: false,             // (boolean)  append a random query string to the image URLs?
	initialPos: [0,0],          // (mixed)    initial VR position (number or array)
	invert: [false,false],      // (mixed)    invert the x/y axes?

	infiniteAxis: [true,false], // (array)    defines which axes can spin infinitely

	autoPlay: false,            // (boolean)  begin auto spin right away?
	fps: 25,                    // (number)   frames per second (used for the intro, auto spinning, and throwing)

	grabbable: true,            // (boolean)  can the user grab the VR to manually spin it?
	grabRotateDistance: 1000,   // (number)   pixels the cursor must travel to view a full axis
	grabRotateDistanceY: 500,   // (number)   pixels the cursor must travel to view a full axis

	throwable: true,            // (boolean)  does the VR have inertia when releasing a grab?
	minThrowDuration: 0.5,      // (number)   minimum throw duration in seconds
	maxThrowDuration: 1.5,      // (number)   maximum throw duration in seconds

	spinnable: true,            // (boolean)  add spinners to on axes marked as infinite?
	minSpinDuration: 3,         // (number)   minimum time in seconds the VR will take to rotate 360 degrees

	intro: AC.VR.SpinIntro,     // (function) function that returns the intro sequence (array of position arrays)
	introSpins: 0.5,            // (number)   times the VR rotates 360 degrees in the intro
	introDuration: 1,           // (number)   intro duration in seconds

	mobileTotalFrames: null     // (mixed)    total frames to show on a mobile device (number or array)
};


Object.extend(AC.VR.prototype, {

	convertToArray: function(mixed, second){
		return (typeof mixed[0] == 'undefined') ? [mixed, second] : mixed;
	},

	initialize: function(container, imagePath, totalFrames, options){
		// options
		this.options = Object.extend(Object.clone(AC.VR.options), options);
		if (this.options.noCache) this.random = Math.floor(Math.random()*10000000);

		// mobile?
		if (this.mobile = ((AC.Detector.isMobile() || AC.Detector.isiPad()) ? true : false)) {
			// strip to bare-bones
			this.options.intro = null;
			this.options.autoPlay = false;
			this.options.spinnable = false;
			this.options.throwable = false;

			this.mobileStrings = {
				mousedown: 'touchstart',
				mousemove: 'touchmove',
				mouseup:   'touchend'
			};
		}

		// dom
		this.container = $(container).addClassName('vrcontainer');
		this.vr = $(document.createElement('div')).addClassName('vr');
				
		this.vr.style.width = "100%"; // Fit to container exactly
		this.vr.style.height = "100%";
		
		this.container.appendChild(this.vr);

		// images
		this.imagePathParts = imagePath.match(/^([^#]*)(#+)([^#]*)$/);
		this.numDigits = this.imagePathParts[2].length;

		// convert totalFrames and initialPos to x,y coordinates
		this.totalFrames = this.convertToArray(totalFrames, 1);
		if (this.mobile && this.options.mobileTotalFrames) {
			var actual = this.totalFrames;
			this.totalFrames = this.convertToArray(this.options.mobileTotalFrames, 1);
			this.frameMultipliers = [ actual[0] / this.totalFrames[0], actual[1] / this.totalFrames[1] ];
		} else {
			this.frameMultipliers = [1,1];
		}
		this.options.initialPos = this.convertToArray(this.options.initialPos, 0);

		this.options.invert = this.convertToArray(this.options.invert, false);

		this.frames = [];
		for (var i=0; i<this.totalFrames[0]; i++) {
			this.frames[i] = [];
		}

		// options conversions
		this.playIntervalDuration = 1000 / this.options.fps;
		this.minSpinIntervalDuration = (this.options.minSpinDuration * 1000) / this.totalFrames[0];
		this.minThrowFrames = Math.floor(this.options.minThrowDuration * this.options.fps);
		this.maxThrowFrames = Math.floor(this.options.maxThrowDuration * this.options.fps);

		// state
		this.currentPos;
		this.playing = false;
		this.grabbing = false;
		this.spinning = false;

		if (this.options.intro) {
			// load and play the intro
			this.introSequence = this.options.intro(this);
			this.loader = new AC.VR.LoaderController(this, this.introSequence.slice(0), this.playIntro.bind(this));
		}
		else {
			this.loadAllFrames();
			this.gotoPos(this.options.initialPos);
			this.makeInteractive();

			// auto play?
			if (this.options.autoPlay) {
				this.play();
			}
		}
	},

	/* Mobile */

	getStr: function(str){
		return this.mobile ? this.mobileStrings[str] : str;
	},

	getEvent: function(event){
		if (event.touches) {
			// ignore multi-touch
			if (event.touches.length > 1) return false;

			if (event.touches.length) {
				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
			}
		}

		return event;
	},

	/* Intro */

	playIntro: function(){
		this.introInterval = setInterval(this.gotoNextIntroFrame.bind(this), this.playIntervalDuration);
		this.loadAllFrames();
	},

	gotoNextIntroFrame: function(){
		this.gotoPos(this.introSequence.shift());

		// finished?
		if (!this.introSequence.length) {
			clearInterval(this.introInterval);
			this.makeInteractive();
		}
	},

	/* Loading */

	isPosLoaded: function(pos){
		return (typeof this.frames[pos[0]] != 'undefined' && typeof this.frames[pos[0]][pos[1]] != 'undefined');
	},

	createLoadPlan: function(total, skip){
		if (!skip) return [0];
		var plan = [];
		do {
			for (var i=0; i<total; i+=skip) {
				var f = Math.floor(i);
				if (plan.indexOf(f) == -1) {
					plan.push(f);
				}
			}
			if (skip == 1) return plan;
			if ((skip /= 2) < 1) skip = 1;
		} while (true);
	},

	loadAllFrames: function(){
		// create the queue
		var queue = [],
			skipX = Math.floor(this.totalFrames[0] / this.options.initialLoad),
			planX = this.createLoadPlan(this.totalFrames[0], skipX),
			skipY = Math.floor(this.totalFrames[1] / this.options.initialLoad),
			planY = this.createLoadPlan(this.totalFrames[1], skipY);

		for (var y=0; y<planY.length; y++) {
			for (var x=0; x<planX.length; x++) {
				queue.push(this.validatePos([ planX[x]+this.options.initialPos[0], planY[y]+this.options.initialPos[1] ], true));
			}
		}

		// load the images
		this.loader = new AC.VR.LoaderController(this, queue);

		queue = null;
		skipX = null;
		planX = null;
		skipY = null;
		planY = null;
	},

	getImageSource: function(pos){
		var x = this.options.invert[0] ? (this.totalFrames[0]-1) - pos[0] : pos[0],
			y = this.options.invert[1] ? (this.totalFrames[1]-1) - pos[1] : pos[1],
			frame = (Math.floor(y*this.totalFrames[0]*this.frameMultipliers[0]*this.frameMultipliers[1]) + Math.floor(x*this.frameMultipliers[0]) + this.options.imageIndexOffset) + '';

		while (frame.length < this.numDigits){
			frame = '0'+frame;
		}
		return this.imagePathParts[1] + frame + this.imagePathParts[3] + (this.options.noCache ? '?'+this.random : '');
	},

	/* Controls */

	makeInteractive: function(){
		if (this.options.grabbable) {
			// grab events
			this.bindGrabStart = this.onGrabStart.bind(this);
			this.bindGrabChange = this.onGrabChange.bind(this);
			this.bindGrabEnd = this.onGrabEnd.bind(this);
			this.vr.observe(this.getStr('mousedown'), this.bindGrabStart);

			// keyboard
			this.onKeyDown.keys = {};
			this.bindOnClick = this.onClick.bind(this);
			this.vr.observe('click', this.bindOnClick);
			this.bindOnFocus = this.onFocus.bind(this);
			this.vr.observe('focus', this.bindOnFocus);
			this.bindOnBlur = this.onBlur.bind(this);
			this.vr.observe('blur', this.bindOnBlur);
			this.bindKeyDown = this.onKeyDown.bind(this);
			this.bindKeyUp = this.onKeyUp.bind(this);
			this.vr.tabIndex = 0;
		}

		// spinning
		if (this.options.spinnable) {
			this.bindSpinChange = this.onSpinChange.bind(this);
			this.bindSpinEnd = this.onSpinEnd.bind(this);

			var directions = [];
			if (this.totalFrames[1] > 1 && this.options.infiniteAxis[1]) directions.push('Up', 'Down');
			if (this.totalFrames[0] > 1 && this.options.infiniteAxis[0]) directions.push('Left', 'Right');

			for (var i=0; i<directions.length; i++) {
				var dir = directions[i],
				 	spinner = $(document.createElement('div'));
				// BUN-3398 The line below caused white space issues
				//this.container.appendChild(spinner);
				spinner.className = 'spinner spin'+dir;
				spinner.observe('mousedown', this['onSpin'+dir+'Start'].bind(this));
				this['spin'+dir+'Offset'] = spinner.cumulativeOffset();

				// manually set height for IE
				if (dir == 'Left' || dir == 'Right') {
					spinner.style.height = this.container.getHeight()+'px';
				}

				dir = null;
				spinner = null;
			}

			directions = null;
		}
	},

	unmakeInteractive: function(){

		if (this.mobile) {
			this.vr.down().stopObserving('touchmove', this.bindGrabChange);
			this.vr.down().stopObserving('touchend', this.bindGrabEnd);
		}

		if (this.options.grabbable) {
			// grab events
			this.vr.stopObserving(this.getStr('mousedown'), this.bindGrabStart);

			// keyboard
			this.vr.stopObserving('click', this.bindOnClick);
			this.vr.stopObserving('focus', this.bindOnFocus);
			this.vr.stopObserving('blur', this.bindOnBlur);
		}

		// spinning
		// if (this.options.spinnable) {
		// 	//this.bindSpinChange = this.onSpinChange.bind(this);
		// 	//this.bindSpinEnd = this.onSpinEnd.bind(this);
		//
		// 	for (var i=0; i<directions.length; i++) {
		// 		var dir = directions[i], spinner = $(document.createElement('div'));
		// 		spinner.stopObserving('mousedown', this['onSpin'+dir+'Start'].bind(this));
		//
		// 	}
		// }
	},

	recycle: function() {
		this.unmakeInteractive();
		delete this.frames;
		delete this.introSequence;
		delete this.loader;
	},

	atPosition: function(pos){
		return (this.currentPos && pos[0] == this.currentPos[0] && pos[1] == this.currentPos[1]);
	},

	play: function(){
		if (this.playing) return;
		this.playing = true;
		this.playInterval = setInterval(this.gotoNextFrame.bind(this), this.playIntervalDuration);
	},

	pause: function(){
		if (!this.playing) return;
		this.playing = false;
		clearInterval(this.playInterval);
	},

	gotoNextFrame: function(){
		this.gotoPos([ this.currentPos[0]+1, this.currentPos[1] ]);
	},

	validatePos: function(pos, forceContinuous){
		for (var i=0; i<2; i++) {
			if (forceContinuous || this.options.infiniteAxis[i]) {
				while (pos[i] > this.totalFrames[i]-1) {
					pos[i] -= this.totalFrames[i];
				}
				while (pos[i] < 0) {
					pos[i] += this.totalFrames[i];
				}
			} else{
				if (pos[i] > this.totalFrames[i]-1) {
					pos[i] = this.totalFrames[i]-1;
				}
				if (pos[i] < 0) {
					pos[i] = 0;
				}
			}
		}
		return pos;
	},

	gotoPos: function(pos, force){
		// keep the pos in bounds
		pos = this.validatePos(pos);

		// are we already here?
		if (!force && this.atPosition(pos)) return;

		// go to the pos
		this.currentPos = pos;

		this.frame = this.frames[pos[0]][pos[1]];
		if (typeof this.frame != 'undefined' && this.frame.nodeType) {
			if (this.currentFrame) this.vr.removeChild(this.currentFrame);
			this.currentFrame = this.frame;
			this.vr.appendChild(this.currentFrame);			
		} else {
			this.loader.loadNow(pos);
		}
		delete this.frame;
	},

	/* Grabbing */

	onGrabStart: function(event){
		if (!(event = this.getEvent(event))) return;

		if (event.which == 2) { return; }

		this.grabbing = true;
		$(document.body).addClassName('grabbing');

		$(document).observe(this.getStr('mousemove'), this.bindGrabChange);
		$(document).observe(this.getStr('mouseup'), this.bindGrabEnd);
		if (this.mobile) {
			// For whatever reason, document.ontouchmove stops firing as soon as the image within
			// this.vr has been removed from the DOM. "Thankfully" there is a related bug:
			// that image will continue firing ontouchmove *after* it has been removed from the DOM,
			// even when hovering outside of the image area.
			// So for the time being, we're observing the touchmove event on both the document
			// and the image. Sane browsers will continue firing the former and stop firing the
			// latter as soon as the image has been swapped; Mobile Safari will do the opposite.
			this.vr.down().observe('touchmove', this.bindGrabChange);
			this.vr.down().observe('touchend', this.bindGrabEnd);
		}

		this.grabHistory = $A([ event ]);
		this.onGrabChange.clientX = this.onGrabChange.clientY = null;
		this.grabHistoryInterval = setInterval(this.updateGrabHistory.bind(this), 10);

		// save state for later
		this.onGrabStart.clientX = event.clientX;
		this.onGrabStart.clientY = event.clientY;
		this.onGrabStart.playing = this.playing;
		this.onGrabStart.pos = this.currentPos;

		// pause and stop throwing
		this.pause();
		this.stopThrowing();

		// prevent default event behavior
		event.stop();
	},

	onGrabChange: function(event){
		if (!(event = this.getEvent(event))) return;

		if (event.which == 2) { return; }

		// IE likes to fire onmousemove even when the mouse has not moved
		if (!(event.clientX == this.onGrabStart.clientX && event.clientY == this.onGrabStart.clientY)) {

			// save the event for later
			this.onGrabChange.clientX = event.clientX;
			this.onGrabChange.clientY = event.clientY;

			var pos = this.getGrabPos(event);
			if (pos) this.gotoPos(pos);
		}

		// prevent the default behavior
		event.stop();
	},

	getGrabPos: function(event){
		var diffX = event.clientX - this.onGrabStart.clientX,
			diffY = event.clientY - this.onGrabStart.clientY,
			percentDiffX = diffX / this.options.grabRotateDistance,
			percentDiffY = diffY / this.options.grabRotateDistanceY,
			frameDiffX = Math.round(this.totalFrames[0] * percentDiffX),
			frameDiffY = Math.round(this.totalFrames[1] * percentDiffY),
			posX = this.onGrabStart.pos[0] + frameDiffX,
			posY = this.onGrabStart.pos[1] + frameDiffY;

		return [posX, posY];
	},

	updateGrabHistory: function(){
		var func = this.onGrabChange.clientX ? this.onGrabChange : this.onGrabStart;
		this.grabHistory.unshift({ clientX: func.clientX, clientY: func.clientY });
		if (this.grabHistory.length > 3) {
			this.grabHistory.splice(3);
		}
	},

	onGrabEnd: function(event){
		if (!(event = this.getEvent(event))) return;

		if (event.which == 2) { return; }

		this.grabbing = false;
		$(document.body).removeClassName('grabbing');
		$(document).stopObserving(this.getStr('mousemove'), this.bindGrabChange);
		$(document).stopObserving(this.getStr('mouseup'), this.bindGrabEnd);
		clearInterval(this.grabHistoryInterval);

		// resume playing?
		if (this.onGrabStart.playing) {
			this.play();
		}
		else if (this.options.throwable) {
			var diffX = event.clientX - this.grabHistory.last().clientX,
				diffY = event.clientY - this.grabHistory.last().clientY,
				loaded = true;

			if (diffX || diffY) {
				var dist = Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2)),
					frames = Math.floor(dist/5),
					clientX = this.grabHistory.last().clientX,
					clientY = this.grabHistory.last().clientY,
					changeX = true,
					changeY = true;

				// keep # of frames in-bounds
				if (frames < this.minThrowFrames) frames = this.minThrowFrames;
				else if (frames > this.maxThrowFrames) frames = this.maxThrowFrames;

				this.throwSequence = $A();

				for (var i=0; i<frames; i++) {
					var percent = i/frames,
						speed = Math.pow(percent-1,2),
						clientX = Math.floor(speed * diffX) + clientX,
						clientY = Math.floor(speed * diffY) + clientY,
						pos = this.validatePos(this.getGrabPos({ clientX: clientX, clientY: clientY }));

					// once an axis rotates slowly enough to use the same row/column for two frames,
					// stop rotating that axis entirely
					if (!changeX) pos[0] = this.throwSequence.last()[0];
					else if (this.throwSequence.length && pos[0] == this.throwSequence.last()[0]) changeX = false;
					if (!changeY) pos[1] = this.throwSequence.last()[1];
					else if (this.throwSequence.length && pos[1] == this.throwSequence.last()[1]) changeY = false;

					// cancel if every frame isn't loaded
					if (!this.isPosLoaded(pos)) {
						loaded = false;
						break;
					}

					this.throwSequence.push(pos);
				}

				if (loaded) {
					this.throwing = true;
					this.throwInterval = setInterval(this.throwStep.bind(this), this.playIntervalDuration);
				}
			}
		}
	},

	throwStep: function(){
		this.gotoPos(this.throwSequence.shift());
		if (!this.throwSequence.length) {
			this.stopThrowing();
		}
	},

	stopThrowing: function(){
		if (!this.throwing) return;
		this.throwing = false;
		clearInterval(this.throwInterval);
	},

	/* Sliding */

	onSpinLeftStart: function(event){
		this.spinAxis = 0;
		this.spinDirection = -1;
		this.spinBounds = this.spinLeftOffset[0] + 35;
		this.onSpinStart(event);
	},

	onSpinRightStart: function(event){
		this.spinAxis = 0;
		this.spinDirection = 1;
		this.spinBounds = this.spinRightOffset[0];
		this.onSpinStart(event);
	},

	onSpinUpStart: function(event){
		this.spinAxis = 1;
		this.spinDirection = -1;
		this.spinBounds = this.spinUpOffset[1] + 35;
		this.onSpinStart(event);
	},

	onSpinDownStart: function(event){
		this.spinAxis = 1;
		this.spinDirection = 1;
		this.spinBounds = this.spinRightOffset[1];
		this.onSpinStart(event);
	},

	onSpinStart: function(event){
		this.spinning = true;
		$(document.body).addClassName('spinning'+(this.spinDirection == -1 ? 'Left' : 'Right'));
		$(document).observe(this.getStr('mousemove'), this.bindSpinChange);
		$(document).observe(this.getStr('mouseup'), this.bindSpinEnd);

		// save state for later
		this.onSpinStart.clientX = event.clientX;
		this.onSpinStart.clientY = event.clientY;
		this.onSpinStart.playing = this.playing;

		// pause
		this.pause();

		this.spinPosDiff = 1;
		this.onSpinChange(event);
		this.spin();

		// prevent defeault event behavior
		event.stop();
	},

	onSpinChange: function(event){
		var spinBoundsDist = (this.spinAxis == 0 ? event.clientX : event.clientY) - this.spinBounds;

		if (spinBoundsDist != this.spinBoundsDist) {
			if ((this.spinDirection == -1 && spinBoundsDist > 0) || (this.spinDirection == 1 && spinBoundsDist < 0)) {
				// turn into a grab
				this.onSpinEnd(event);
				this.onGrabStart(event);
			} else {
				// update the interval
				this.spinBoundsDist = spinBoundsDist;
				this.updateSpinIntervalDuration = true;
			}
		}
	},

	spin: function(){
		var pos = this.currentPos.slice(0);
		pos[this.spinAxis] += this.spinDirection * this.spinPosDiff;
		this.gotoPos(pos);
		pos = null;

		if (this.updateSpinIntervalDuration) {
			this.updateSpinIntervalDuration = false;
			clearInterval(this.spinInterval);

			var duration = 2000/Math.abs(this.spinBoundsDist);

			// keep it from spinning too slowly
			if (duration > this.minSpinIntervalDuration) {
				duration = this.minSpinIntervalDuration;
			}

			// once the duration is less than the defined fps,
			// start changing the number of frames moved instead
			if (duration < this.playIntervalDuration) {
				this.spinPosDiff = Math.round(this.playIntervalDuration / duration);
				duration = this.playIntervalDuration;
			}

			this.spinInterval = setInterval(this.spin.bind(this), duration);
		}
	},

	onSpinEnd: function(event){
		this.spinning = false;
		$(document.body).removeClassName('spinning'+(this.spinDirection == -1 ? 'Left' : 'Right'));
		$(document).stopObserving(this.getStr('mousemove'), this.bindSpinChange);
		$(document).stopObserving(this.getStr('mouseup'), this.bindSpinEnd);

		// stop spinning
		clearInterval(this.spinInterval);

		// resume playing?
		if (this.onGrabStart.playing) {
			this.play();
		}
	},

	/* Keyboard events */

	onClick: function(event){
		if (this.focussed) return;

		this.vr.addClassName('clickfocus');
		this.vr.focus();
	},

	onFocus: function(event){
		this.focussed = true;
		$(document).observe('keydown', this.bindKeyDown);
		$(document).observe('keyup', this.bindKeyUp);
	},

	onBlur: function(event){
		this.focussed = false;
		this.vr.removeClassName('clickfocus');
		$(document).stopObserving('keydown', this.bindKeyDown);
		$(document).stopObserving('keyup', this.bindKeyDown);
	},

	onKeyDown: function(event){
		// only care about arrow keys
		if (event.keyCode < 37 || event.keyCode > 40) return;

		// record the key
		this.onKeyDown.keys['key'+event.keyCode] = true;

		var pos = this.currentPos.slice(0);

		if      (this.onKeyDown.keys.key37) pos[0]--; // left
		else if (this.onKeyDown.keys.key39) pos[0]++; // right
		if      (this.onKeyDown.keys.key38) pos[1]--; // up
		else if (this.onKeyDown.keys.key40) pos[1]++; // down

		this.gotoPos(pos);

		// prevent default event behavior
		event.stop();
	},

	onKeyUp: function(event){
		// only care about arrow keys
		if (event.keyCode < 37 || event.keyCode > 40) return;

		// record the key
		this.onKeyDown.keys['key'+event.keyCode] = false;

		// prevent default event behavior
		event.stop();
	}

});


AC.VR.LoaderController = Class.create({
	initialize: function(vr, queue, onLoad){
		this.vr = vr;
		this.queue = queue;
		this.onLoad = onLoad;
		this.retiredLoaders = new Array();

		for (var i=0; i<this.vr.options.loaders; i++) {
			this.loadNext(new AC.VR.Loader(this));
		}
	},
	loadNext: function(loader){
		if (this.queue.length) {
			loader.load(this.queue.shift());
		} else {
			this.retiredLoaders.push(loader);
			if (this.retiredLoaders.length == this.vr.options.loaders && typeof this.onLoad == 'function'){
				this.onLoad();
				this.onLoad = null;
			}
		}
	},
	loadNow: function(pos){
		if (this.retiredLoaders.length) {
			this.retiredLoaders.shift().load(pos);
		} else {
			this.queue.unshift(pos);
		}
	}
});


AC.VR.Loader = Class.create({
	initialize: function(controller){
		this.controller = controller;
		this.loadNext = this.controller.loadNext.bind(this.controller);
	},
	load: function(pos) {
		this.pos = pos;

		// skip if already loaded
		if (this.controller.vr.isPosLoaded(pos)) {
			this.controller.loadNext(this);
			return;
		}

		this.img = new Image();
		// Added these two lines to make sure that the image resizes to the browser's windows while
		// preserving the aspect ratio. Mark Bidar.				
		// this.img.style.width="100%";
		// this.img.style.height="auto";

		this.img.onload = this.onLoad.bind(this);

		this.controller.vr.frames[this.pos[0]][this.pos[1]] = true;
		this.img.src = this.controller.vr.getImageSource(this.pos);
		delete this.img;
	},
	onLoad: function (event) {
		this.controller.vr.frames[this.pos[0]][this.pos[1]] = event.target;
		delete event.target.onload;

		this.setSizeConstraints(event.target);

		// should we show this now?
		if (this.controller.vr.atPosition(this.pos)) {
			this.controller.vr.gotoPos(this.pos, true);
		}

		// load next
		// (delay by 1ms to prevent IE's Stack Overflow error)
		this.loadNext.defer(this);
	},
	setSizeConstraints: function (img) {
		// Aspect Ratio of the Image
		
		var arImage = img.naturalWidth / img.naturalHeight;

		// Aspect Ratio of the Viewer

		var arViewer = this.controller.vr.container.getWidth() / this.controller.vr.container.getHeight();

		if (arViewer >= arImage) {
			// Image is constrained by height
			img.style.height = "100%";
			img.style.width = "auto";
		} else {
			// Image is constrained by width
			img.style.width = "100%";
			img.style.height = "auto";
		}
	}
	/*,

		load: function(pos) {
			this.pos = pos;

			// skip if already loaded
			if (this.controller.vr.isPosLoaded(pos)) {
				this.controller.loadNext(this);
				return;
			}

			var request = new XMLHttpRequest(), self = this;
			request.open("GET",this.controller.vr.getImageSource(this.pos),true);
			request.onreadystatechange  = function(request) {
				self.onrequestStateChange(request);
			}
			request.setRequestHeader("Pragma", "no-cache");
			request.setRequestHeader("Pragma", "no-cache");
			request.setRequestHeader("Expires", "Fri, 30 Oct 1998 14:19:41 GMT");
			request.setRequestHeader("Cache-Control", "no-cache, must-revalidate");
			// request.overrideMimeType("image/"+this.controller.vr.imagePathParts[3].substr(1));
			request.overrideMimeType('text/plain; charset=x-user-defined');
			request.send(null);
			this.controller.vr.frames[this.pos[0]][this.pos[1]] = true;
			//this.img.src = this.controller.vr.getImageSource(this.pos);
			//delete this.img;
		},
		makeBinaryContent: function (text) {
		        var ff = [];
		        var mx = text.length;
		        var scc= String.fromCharCode;
		        for (var z = 0; z < mx; z++) {
		            ff[z] = scc(text.charCodeAt(z) & 255);
		        }
		        var b = ff.join("");
		        return b;
		},
		onrequestStateChange: function(myRequestEvent) {
			var status, image, myRequest = myRequestEvent.srcElement;
			if(myRequest.readyState === 4) {// success
				status = myRequest.status;
				if(AC.Detector.isWebKit() && (status === undefined) && (myRequest.responseText.length>0)) {
					status = 200;
				}
				if (status === 0 || (status >= 200 && status < 300)) {
						image = new Image();
						//image.src = "data:image/"+this.controller.vr.imagePathParts[3].substr(1)+";base64,"+window.btoa(this.makeBinaryContent(myRequest.responseText));
						image.src = "data:image/jpeg;base64,"+window.btoa(this.makeBinaryContent(myRequest.responseText));
						// console.log(image.src );
						this.imageDidLoad(image);
						image = null;
				}
				else {
						console.log("requestDidFailWithError");
				}
				  delete myRequest.onreadystatechange;
			}
		 },

		onLoad: function(event){
			this.imageDidLoad(event.target);
			delete event.target.onload;
		},
		imageDidLoad: function(image) {
			this.controller.vr.frames[this.pos[0]][this.pos[1]] = image;

			// should we show this now?
			if (this.controller.vr.atPosition(this.pos)) {
				this.controller.vr.gotoPos(this.pos, true);
			}

			// load next
			// (delay by 1ms to prevent IE's Stack Overflow error)
			this.loadNext.defer(this);

		}
	*/
});

