/* library.js
   ========== */
function isTransform3DAvailable() {
    var isTransform3DAvailable = false;
    if ('styleMedia' in window) {
        isTransform3DAvailable = window.styleMedia.matchMedium('(-webkit-transform-3d)');
    }
    else if ('media' in window) {
        isTransform3DAvailable = window.media.matchMedium('(-webkit-transform-3d)');
    }
    return AC.Detector.isiPad() || AC.Detector.isSnowLeopard() || AC.Detector.isiPhone() || isTransform3DAvailable;
}
function recycleObjectValueForKey(object, key) {
    var value = object[key];
    if (value && typeof value.recycle === "function") {
        value.recycle();
    }
    delete object[key];
    object[key] = null;
    value = null;
}
function constrainNumberWithin(number, min, max) {
    return (number < min) ? min : ((number > max) ? max : number);
};
if (Array.prototype.indexOf === undefined) {
    Array.prototype.indexOf = function(valueToSearchFor) {
        var iEnd = this.length;
        var retVal = -1;
        for (var i = 0; i < iEnd; i++) {
            if (this[i] == valueToSearchFor) {
                retVal = i;
                break;
            }
        }
        return retVal;
    };
}
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/, "");
}
function addClassName(oHTMLElement, classNameToAdd) {
    if (typeof(oHTMLElement) == "string") {
        oHTMLElement = document.getElementById(oHTMLElement);
    }
    if (oHTMLElement) {
        var theClassName = oHTMLElement.className;
        if (theClassName && (theClassName.length > 0)) {
            var classNamesToAdd = classNameToAdd.split(" ");
            if (classNamesToAdd.length === 1 && ((" " + theClassName + " ").lastIndexOf(" " + classNameToAdd + " ") === -1)) {
                oHTMLElement.className = oHTMLElement.className + " " + classNameToAdd;
            } else {
                var theClassNames = theClassName.split(" "),
                    iEnd = classNamesToAdd.length,
                    aClassName, theClassNamesToAddArray = [];
                for (var i = 0; i < iEnd; i++) {
                    aClassName = classNamesToAdd[i];
                    if (theClassNames.indexOf(aClassName) === -1) {
                        theClassNamesToAddArray.push(aClassName);
                    }
                }
                oHTMLElement.className = oHTMLElement.className + " " + ((theClassNamesToAddArray.length > 1) ? theClassNamesToAddArray.join(" ") : theClassNamesToAddArray[0]);
                theClassNames = null;
                aClassName = null;
                theClassNamesToAddArray = null;
            }
        } else {
            oHTMLElement.className = classNameToAdd;
        }
        theClassName = null;
        classNamesToAdd = null;
    }
}
function hasClassName(oHTMLElement, classNameOfInterest) {
    return ((" " + oHTMLElement.className + " ").lastIndexOf(" " + classNameOfInterest + " ") > -1);
}
function removeClassName(oHTMLElement, classNameToRemove) {
    if (typeof(oHTMLElement) == "string") {
        oHTMLElement = document.getElementById(oHTMLElement);
    }
    if (oHTMLElement) {
        var theClassName = oHTMLElement.className;
        if (theClassName && (theClassName.length > 0)) {
            var theClassNameArray = theClassName.split(" "),
                classNamesToRemove = classNameToRemove.split(" "),
                iEnd = theClassNameArray.length,
                aClassName, theNewClassNameArray = [];
            for (var i = 0; i < iEnd; i++) {
                aClassName = theClassNameArray[i];
                if (classNamesToRemove.indexOf(aClassName) === -1) {
                    theNewClassNameArray.push(aClassName);
                }
            }
            switch (true) {
            case (theNewClassNameArray.length > 1):
                oHTMLElement.className = theNewClassNameArray.join(" ");
                break;
            case (theNewClassNameArray.length == 1):
                oHTMLElement.className = theNewClassNameArray[0];
                break;
            case (theNewClassNameArray.length == 0):
                oHTMLElement.className = "";
                break;
            }
            theClassNameArray = null;
            classNamesToRemove = null;
            aClassName = null;
            theNewClassNameArray = null;
        }
        theClassName = null;
    }
}
function setHidden(oHTMLElement, bHidden) {
    if (bHidden) {
        addClassName(oHTMLElement, "hidden");
    } else {
        removeClassName(oHTMLElement, "hidden");
    }
}
function setWebKitAnimation(oHTMLElement, webKitAnimationName) {
    if (typeof(oHTMLElement) == "string") {
        oHTMLElement = document.getElementById(oHTMLElement);
    }
    if (oHTMLElement && oHTMLElement.style) {
        oHTMLElement.style.webkitAnimationName = webKitAnimationName;
    }
}(function() {
    var isSafari4 = function(userAgent) {
        if (this._isSafari4 === undefined) {
            if (!AC.Detector.isWebKit()) {
                this._isSafari4 = false;
            } else {
                var ua = navigator.userAgent.toLowerCase();
                var version = parseInt(parseFloat(ua.substring(ua.lastIndexOf('safari/') + 7)), 10);
                this._isSafari4 = (version >= 528);
            }
            this.isSafari4 = function() {
                return this._isSafari4;
            };
        }
        return this._isSafari4;
    }
    if (document.location.toString().match(/\/html5\/showcase\//)) {
        if (AC.Detector.isChrome() || !(isSafari4() || AC.Detector.isiPad() || AC.Detector.isiPhone())) {
            document.location = '/safaridemos/';
        }
    }
})();
(function() {
    Event.onDOMReady(function() {
        if (AC.Detector.isiPad() || AC.Detector.isiPhone()) {
            var links = document.querySelectorAll('a[href*="/safaridemos/showcase/"]');
            for (var i = links.length - 1; i >= 0; i--) {
                links[i].href += '#html5-showcase';
            }
        }
    });
})();
if (typeof Apple === "undefined") {
    window.Apple = {};
}
Apple.browser = {
    FF: (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)),
    SAFARI: (/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)),
    IE: (navigator.appName == "Microsoft Internet Explorer")
};
Apple.slider = {
    activeSlider: null,
    defaults: {
        sliderType: "Linear",
        minValue: 0,
        maxValue: 100,
        initialValue: 0,
        allowsTickMarkValuesOnly: false,
        numberOfTickMarks: 0,
        thumbHeight: 11,
        thumbWidth: 11,
        tickMarkPosition: "Above",
        onSlide: function() {},
        onSlideComplete: function() {},
        height: 19,
        width: 19
    },
    valid: {
        sliderTypes: ["Linear", "Circular"],
        tickMarkPositions: ["Above", "Below"],
        minHeight: 19,
        minWidth: 19
    },
    _sliderObjRecycle: function() {
        this._track = null;
        this._thumb = null;
        this._ticks = null;
        this._sliderType = null;
        this._minValue = null;
        this._maxValue = null;
        this.value = null;
        this._initialValue = null;
        this._height = null;
        this._width = null;
        this._numberOfTickMarks = null;
        this._tickMarkPosition = null;
        this._allowsTickMarkValuesOnly = null;
        this._onSlide = null;
        this._onSlideComplete = null;
        this.isVertical = null;
        this._minSlidePosition = null;
        this._maxSlidePosition = null;
        this._horizontalOffset = null;
        this._verticalOffset = null;
        this._valuePerPixel = null;
        this._tickValues = null;
        this._tickLocations = null;
        this.recycle = null;
    },
    create: function(id, params) {
        params = params || this.defaults;
        var _sliderObj = document.getElementById(id);
        _sliderObj.recycle = this._sliderObjRecycle;
        if (_sliderObj) {
            _sliderObj.id = id;
            if (_sliderObj.getElementsByClassName) {
                _sliderObj._track = _sliderObj.getElementsByClassName('sliderTrack')[0];
                _sliderObj._thumb = _sliderObj.getElementsByClassName('sliderThumb')[0];
                _sliderObj._ticks = _sliderObj.getElementsByClassName('sliderTicks')[0];
            } else {
                _sliderObj._track = _sliderObj.childNodes[1];
                _sliderObj._thumb = _sliderObj.childNodes[3];
                _sliderObj._ticks = _sliderObj.childNodes[4];
            }
            _sliderObj._sliderType = params["sliderType"] || this.defaults.sliderType;
            _sliderObj._minValue = params["minValue"] || this.defaults.minValue;
            _sliderObj._maxValue = params["maxValue"] || this.defaults.maxValue;
            _sliderObj.value = params["initialValue"] || this.defaults.initialValue;
            _sliderObj._initialValue = params["initialValue"] || this.defaults.initialValue;
            _sliderObj._height = params["height"] || this.defaults.height;
            _sliderObj._width = params["width"] || this.defaults.width;
            _sliderObj._numberOfTickMarks = params["numberOfTickMarks"] || this.defaults.numberOfTickMarks;
            _sliderObj._tickMarkPosition = params["tickMarkPosition"] || this.defaults.tickMarkPosition;
            _sliderObj._allowsTickMarkValuesOnly = params["allowsTickMarkValuesOnly"] || this.defaults.allowsTickMarkValuesOnly;
            _sliderObj._onSlide = params["onSlide"] || this.defaults.onSlide;
            _sliderObj._onSlideComplete = params["onSlideComplete"] || this.defaults.onSlideComplete;
            _sliderObj._sliderType = (this.valid.sliderTypes.indexOf(_sliderObj._sliderType) > -1) ? _sliderObj._sliderType : this.defaults.sliderType;
            _sliderObj._tickMarkPosition = (this.valid.tickMarkPositions.indexOf(_sliderObj._tickMarkPosition) > -1) ? _sliderObj._tickMarkPosition : this.defaults.tickMarkPosition;
            _sliderObj._width = Math.max(_sliderObj._width, this.valid.minWidth);
            _sliderObj._height = Math.max(_sliderObj._height, this.valid.minHeight);
            _sliderObj.value = Math.min(_sliderObj.value, _sliderObj._maxValue);
            _sliderObj.value = Math.max(_sliderObj.value, _sliderObj._minValue);
            _sliderObj.isVertical = (_sliderObj._height > _sliderObj._width);
            _sliderObj._horizontalOffset = (_sliderObj.isVertical) ? 0 : 2;
            _sliderObj._verticalOffset = (_sliderObj.isVertical) ? 2 : 0;
            var sliderThumbWidth = _sliderObj._thumb.clientWidth,
                sliderThumbHeight = _sliderObj._thumb.clientHeight;
            if (sliderThumbWidth === 0) {
                if (document.defaultView && document.defaultView.getComputedStyle) {
                    sliderThumbWidth = parseFloat(document.defaultView.getComputedStyle(_sliderObj._thumb, null).getPropertyValue('width'));
                    sliderThumbHeight = parseFloat(document.defaultView.getComputedStyle(_sliderObj._thumb, null).getPropertyValue('height'));
                } else {
                    if (_sliderObj._thumb.currentStyle) {
                        sliderThumbWidth = parseFloat(_sliderObj._thumb.currentStyle['width']);
                        sliderThumbHeight = parseFloat(_sliderObj._thumb.currentStyle['height']);
                    } else {
                        sliderThumbWidth = parseFloat(_sliderObj._thumb.style['width']);
                        sliderThumbHeight = parseFloat(_sliderObj._thumb.style['height']);
                    }
                }
                if (sliderThumbWidth === 0) {
                    sliderThumbWidth = this.defaults.thumbHeight;
                    sliderThumbHeight = this.defaults.thumbHeight;
                }
            }
            if (_sliderObj.isVertical) {
                _sliderObj._width = this.valid.minWidth;
                _sliderObj._track.style.height = (_sliderObj._height - _sliderObj._verticalOffset * 2) + "px";
                _sliderObj._ticks.style.height = (_sliderObj._height - _sliderObj._verticalOffset * 2) + "px";
                _sliderObj._minSlidePosition = _sliderObj._track.clientTop;
                _sliderObj._maxSlidePosition = _sliderObj._height - sliderThumbHeight;
            } else {
                _sliderObj._height = this.valid.minHeight;
                _sliderObj._track.style.width = (_sliderObj._width - _sliderObj._horizontalOffset * 2) + "px";
                _sliderObj._ticks.style.width = (_sliderObj._width - _sliderObj._horizontalOffset * 2) + "px";
                _sliderObj._minSlidePosition = _sliderObj._track.clientLeft;
                _sliderObj._maxSlidePosition = _sliderObj._width - sliderThumbWidth;
            }
            _sliderObj._valuePerPixel = (_sliderObj._maxSlidePosition - _sliderObj._minSlidePosition) / (_sliderObj._maxValue - _sliderObj._minValue);
            if (_sliderObj._numberOfTickMarks > 0) {
                _sliderObj._ticks.className = _sliderObj._ticks.className + _sliderObj._tickMarkPosition;
                _sliderObj._ticks.style.display = 'block';
                if (_sliderObj.isVertical) {
                    _sliderObj._ticks.style.width = _sliderObj._track.style.width;
                    _sliderObj._ticks.style.left = _sliderObj._horizontalOffset + "px";
                    _sliderObj._ticks.style.top = _sliderObj._verticalOffset + "px";
                } else {
                    _sliderObj._ticks.style.height = _sliderObj._track.style.height;
                    _sliderObj._ticks.style.left = _sliderObj._horizontalOffset + "px";
                    _sliderObj._ticks.style.top = _sliderObj._verticalOffset + "px";
                }
                _sliderObj._tickValues = [];
                if (_sliderObj._numberOfTickMarks == 1) {
                    _sliderObj._tickValues.push((_sliderObj._maxValue - _sliderObj._minValue) / 2);
                } else {
                    _sliderObj._tickValues.push(_sliderObj._minValue);
                    var deltaValuePerTickMark = (_sliderObj._maxValue - _sliderObj._minValue) / (_sliderObj._numberOfTickMarks - 1);
                    for (var i = 1; i < _sliderObj._numberOfTickMarks; i++) {
                        _sliderObj._tickValues.push(_sliderObj._tickValues[i - 1] + deltaValuePerTickMark);
                    }
                }
                _sliderObj._tickLocations = [];
                var deltaPixelPerTickMark = (_sliderObj._maxSlidePosition - _sliderObj._minSlidePosition) / (_sliderObj._numberOfTickMarks - 1);
                _sliderObj._tickLocations.push(5);
                for (var i = 1; i < _sliderObj._numberOfTickMarks; i++) {
                    _sliderObj._tickLocations.push(_sliderObj._tickLocations[i - 1] + deltaPixelPerTickMark);
                }
                for (var i = 0; i < _sliderObj._numberOfTickMarks; i++) {
                    var oDiv = document.createElement('div');
                    oDiv.className = 'tickMark';
                    if (_sliderObj.isVertical) {
                        oDiv.style.top = _sliderObj._tickLocations[i] + "px";
                    } else {
                        oDiv.style.left = _sliderObj._tickLocations[i] + "px";
                    }
                    _sliderObj._ticks.appendChild(oDiv);
                }
                if (_sliderObj.isVertical) {
                    if (_sliderObj._tickMarkPosition == "Below") {
                        _sliderObj._thumb.style.left = "0px";
                    } else {
                        _sliderObj._thumb.style.left = "-6px";
                    }
                } else {
                    if (_sliderObj._tickMarkPosition == "Below") {
                        _sliderObj._thumb.style.height = "16px";
                        _sliderObj._thumb.style.top = "-1px";
                    } else {
                        _sliderObj._thumb.style.height = "16px";
                        _sliderObj._thumb.style.top = "-6px";
                    }
                }
            }
            _sliderObj.positionThumbBasedOnValue = function() {
                if (this._allowsTickMarkValuesOnly) {
                    this.value = this.computeValueBasedOnNearestTickMark(this.value);
                }
                if (this.isVertical) {
                    this._thumb.style.top = ((this.value - this._minValue) * this._valuePerPixel) + "px";
                } else {
                    this._thumb.style.left = ((this.value - this._minValue) * this._valuePerPixel) + "px";
                }
            };
            _sliderObj.computeValueBasedOnNearestTickMark = function(aValue) {
                var retVal = aValue;
                if (this._numberOfTickMarks > 1) {
                    var closestDifference = Math.abs(this._tickValues[0] - aValue);
                    retVal = this._tickValues[0];
                    for (var i = 0; i < this._numberOfTickMarks; i++) {
                        var currentDifference = Math.abs(this._tickValues[i] - aValue);
                        if (currentDifference < closestDifference) {
                            closestDifference = Math.abs(this._tickValues[i] - aValue);
                            retVal = this._tickValues[i];
                        }
                    }
                } else {
                    if (this._numberOfTickMarks == 1) {
                        retVal = this._tickValues[0];
                    }
                }
                return retVal;
            };
            _sliderObj.computeValueBasedOnThumbPosition = function() {
                this.value = ((this.isVertical) ? ((parseFloat(_sliderObj._thumb.style.top) / this._valuePerPixel) + _sliderObj._minValue) : ((parseFloat(_sliderObj._thumb.style.left) / (this._valuePerPixel)) + _sliderObj._minValue));
            };
            _sliderObj.reset = function() {
                this.value = this._initialValue;
                this.positionThumbBasedOnValue();
                this._onSlide();
            };
            _sliderObj.finalizeKnobPosition = function() {
                this.computeValueBasedOnThumbPosition();
                if (this._allowsTickMarkValuesOnly) {
                    this.value = constrainNumberWithin(this.computeValueBasedOnNearestTickMark(this.value), this._minValue, this._maxValue);
                    this.positionThumbBasedOnValue();
                }
                this._onSlide();
            };
            if (Apple.browser.IE) {
                _sliderObj._thumb.attachEvent("onmousedown", Apple.slider.startSlide);
                _sliderObj._track.attachEvent("onclick", Apple.slider.onTrackClicked);
            } else {
                _sliderObj._thumb.addEventListener('mousedown', Apple.slider.startSlide, false);
                _sliderObj._track.addEventListener("click", Apple.slider.onTrackClicked, false);
            }
            _sliderObj._track.sliderParent = _sliderObj;
            _sliderObj._thumb.sliderParent = _sliderObj;
            _sliderObj.positionThumbBasedOnValue();
            return _sliderObj;
        }
    },
    onSlide: function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        var oSlider = Apple.slider.activeSlider;
        var bDidSlide = false;
        var currentStyle = (window.getComputedStyle) ? window.getComputedStyle(oSlider._thumb, null) : oSlider._thumb.style;
        var mouseX = e.clientX;
        var mouseY = e.clientY;
        var left = parseFloat(currentStyle.left);
        var top = parseFloat(currentStyle.top);
        var width = oSlider.clientWidth;
        var height = oSlider.clientHeight;
        var thumbX = left + mouseX - oSlider._oldX;
        var thumbY = top + mouseY - oSlider._oldY;
        if (thumbY < 0) {
            thumbY = 0;
        }
        if (thumbY > oSlider._maxSlidePosition) {
            thumbY = oSlider._maxSlidePosition;
        }
        if (!oSlider.isVertical) {
            if (thumbX < 0) {
                thumbX = 0;
            }
            else if (thumbX > oSlider._maxSlidePosition) {
                thumbX = oSlider._maxSlidePosition;
                if (!oSlider._over) {
                    oSlider._oldX = mouseX;
                    oSlider._over = true;
                }
            }
            else if ((thumbX >= oSlider._minSlidePosition) && (thumbX <= oSlider._maxSlidePosition)) {
                oSlider._oldX = mouseX;
                oSlider._over = false;
                bDidSlide = true;
            }
            oSlider._thumb.style.left = thumbX + "px";
        }
        if (oSlider.isVertical && (thumbY >= oSlider._minSlidePosition) && (thumbY <= oSlider._maxSlidePosition)) {
            oSlider._thumb.style.top = thumbY + "px";
            oSlider._oldY = mouseY;
            bDidSlide = true;
        }
        oSlider.computeValueBasedOnThumbPosition();
        Apple.utilities.logger.log(oSlider.value, true);
        if (bDidSlide) {
            oSlider._onSlide();
        }
    },
    onTrackClicked: function(event) {
        event.preventDefault();
        event.defaultPrevented = true;
        event.stopPropagation();
        var slideToX = (Apple.browser.FF) ? event.layerX : event.offsetX;
        var slideToY = (Apple.browser.FF) ? event.layerY : event.offsetY;
        if (Apple.browser.IE) {
            Apple.slider.activeSlider = event.srcElement.sliderParent;
        } else {
            Apple.slider.activeSlider = event.target.sliderParent;
        }
        var halfThumbWidth = (Apple.slider.activeSlider._thumb.clientWidth / 2);
        if (Apple.slider.activeSlider.isVertical) {
            var thumbY = slideToY - halfThumbWidth;
            if (thumbY < Apple.slider.activeSlider._minSlidePosition) {
                thumbY = Apple.slider.activeSlider._minSlidePosition;
            }
            if (thumbY > Apple.slider.activeSlider._maxSlidePosition) {
                thumbY = Apple.slider.activeSlider._maxSlidePosition;
            }
            Apple.slider.activeSlider._thumb.style.top = thumbY + "px";
        } else {
            var thumbX = slideToX - halfThumbWidth;
            if (thumbX < Apple.slider.activeSlider._minSlidePosition) {
                thumbX = Apple.slider.activeSlider._minSlidePosition;
            }
            if (thumbX > Apple.slider.activeSlider._maxSlidePosition) {
                thumbX = Apple.slider.activeSlider._maxSlidePosition;
            }
            Apple.slider.activeSlider._thumb.style.left = thumbX + "px";
        }
        Apple.slider.activeSlider.finalizeKnobPosition();
        Apple.slider.activeSlider._onSlide();
    },
    onSlideComplete: function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        var oSlider = Apple.slider.activeSlider;
        oSlider._onSlideComplete();
    },
    startSlide: function(event) {
        var slider;
        event.preventDefault();
        event.defaultPrevented = true;
        event.stopPropagation();
        if (Apple.browser.IE) {
            slider = Apple.slider.activeSlider = event.srcElement.sliderParent;
            document.attachEvent("onmouseup", Apple.slider.stopSlide);
            document.attachEvent("onmousemove", Apple.slider.onSlide);
            slider._track.detachEvent("onclick", Apple.slider.onTrackClicked, false);
        } else {
            slider = Apple.slider.activeSlider = event.target.sliderParent;
            document.addEventListener("mouseup", Apple.slider.stopSlide, true);
            document.addEventListener("mousemove", Apple.slider.onSlide, true);
            slider._track.removeEventListener("click", Apple.slider.onTrackClicked, false);
        }
        slider._oldX = event.clientX;
        slider._oldY = event.clientY;
        slider._over = false;
        if (event.preventDefault) {
            event.preventDefault();
        }
        Apple.utilities.disableTextSelection();
    },
    stopSlide: function(event) {
        event.preventDefault();
        event.defaultPrevented = true;
        event.stopPropagation();
        Apple.slider.onSlide(event);
        Apple.utilities.enableTextSelection();
        Apple.slider.onSlideComplete(event);
        if (Apple.browser.IE) {
            document.detachEvent("onmouseup", Apple.slider.stopSlide);
            document.detachEvent("onmousemove", Apple.slider.onSlide);
            Apple.slider.activeSlider._track.attachEvent("onclick", Apple.slider.onTrackClicked, false);
        } else {
            document.removeEventListener("mouseup", Apple.slider.stopSlide, true);
            document.removeEventListener("mousemove", Apple.slider.onSlide, true);
            Apple.slider.activeSlider._track.addEventListener("click", Apple.slider.onTrackClicked, false);
        }
        Apple.slider.activeSlider = null;
    }
};
Apple.utilities = {
    savedValueOf: new Object(),
    disableTextSelection: function() {
        switch (true) {
        case (typeof document.onselectstart != "undefined"):
            this.savedValueOf["onselectstart"] = document.onselectstart;
            document.onselectstart = function() {
                return false;
            };
            break;
        case (typeof document.body.style.MozUserSelect != "undefined"):
            this.savedValueOf["-moz-user-select"] = document.body.style.MozUserSelect || "text";
            document.body.style.MozUserSelect = "none";
            break;
        case (document.body.style["-khtml-user-select"] != "undefined"):
            this.savedValueOf["-khtml-user-select"] = document.body.style["-khtml-user-select"];
            document.body.style["-khtml-user-select"] = 'none';
            break;
        }
    },
    enableTextSelection: function() {
        switch (true) {
        case (typeof document.onselectstart != "undefined"):
            document.onselectstart = this.savedValueOf["onselectstart"]
            break;
        case (typeof document.body.style.MozUserSelect != "undefined"):
            document.body.style.MozUserSelect = this.savedValueOf["-moz-user-select"]
            break;
        case (document.body.style["-khtml-user-select"] != "undefined"):
            document.body.style["-khtml-user-select"] = this.savedValueOf["-khtml-user-select"];
            break;
        }
    },
    logger: {
        bLoggerEnabled: false,
        oLogWindow: null,
        enableOrDisable: function(bEnable, sLogWindowId) {
            this.bLoggerEnabled = bEnable;
            if (bEnable && sLogWindowId != "") {
                this.oLogWindow = document.getElementById(sLogWindowId);
                if (!this.oLogWindow) {
                    this.bLoggerEnabled = false;
                }
            }
        },
        log: function(sMessage, bReplaceContents) {
            if (this.bLoggerEnabled) {
                if (bReplaceContents) {
                    this.oLogWindow.innerHTML = sMessage;
                } else {
                    this.oLogWindow.innerHTML = this.oLogWindow.innerHTML + "<br/>" + sMessage;
                }
            }
        }
    }
};
function randomInteger(l, u) {
    return Math.floor((Math.random() * (u - l + 1)) + l);
}
function touchHandler(event) {
    var touches = event.changedTouches,
        first = touches[0],
        type = "",
        callee = arguments.callee;
    if (touches.length === 1) {
        switch (event.type) {
        case "touchstart":
            type = "mousedown";
            break;
            callee._previousTarget = null;
        case "touchmove":
            type = "mousemove";
            break;
        case "touchend":
            type = "mouseup";
            break;
        default:
            return;
        }
        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
        first.target.dispatchEvent(simulatedEvent);
        if (simulatedEvent.defaultPrevented) {
            event.preventDefault();
        }
        if (callee._previousEvent && callee._previousEvent.touches) {}
        if (event.type === "touchend" && !simulatedEvent.defaultPrevented && callee._previousEvent && callee._previousEvent.touches && callee._previousEvent.touches[0].target === first.target && callee._previousEvent.type !== "touchmove") {
            event.preventDefault();
            simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent("click", true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
            first.target.dispatchEvent(simulatedEvent);
            if (simulatedEvent.defaultPrevented) {
                event.preventDefault();
            }
        }
        callee._previousEvent = first;
    }
}
if (typeof Touch !== "undefined") {
    document.addEventListener('touchstart', touchHandler, true);
    document.addEventListener('touchmove', touchHandler, true);
    document.addEventListener('touchend', touchHandler, true);
    document.addEventListener('touchcancel', touchHandler, true);
}

