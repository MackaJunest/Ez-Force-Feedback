//TODO load dependencies: browserdetect

//onDOMReady Event Extension
//http://clientside.cnet.com/code-snippets/event-scripting/a-dom-ready-extension-for-prototype/
Object.extend(Event, {
  _domReady : function() {
    if (arguments.callee.done) return;
    arguments.callee.done = true;

    if (this._timer)  clearInterval(this._timer);
    AC.isDomReady = true;
    if(this._readyCallbacks) this._readyCallbacks.each(function(f) { f() });
    this._readyCallbacks = null;
},

  onDOMReady : function(f) {
	if(AC.isDomReady) {
		f();
	}
    else {
		if (!this._readyCallbacks) {
			  var domReady = this._domReady.bind(this);
			  
			  if (document.addEventListener)
				document.addEventListener("DOMContentLoaded", domReady, false);
				
				if(document.all) {
						document.onreadystatechange = function() {
							if (this.readyState == "complete") domReady(); 
						};

//					/*@cc_on @*/
//					/*@if (@_win32)
//						document.write('<script type="text/javascript" id="__ie_onload" defer="defer" src=javascript:void(0)><\/script>');
//						document.getElementById("__ie_onload").onreadystatechange = function() {
//							if (this.readyState == "complete") domReady(); 
//						};
//					/*@end @*/
				}
				
				if (/WebKit/i.test(navigator.userAgent)) { 
				  this._timer = setInterval(function() {
					if (/loaded|complete/.test(document.readyState)) domReady(); 
				  }, 10);
				}
				
				Event.observe(window, 'load', domReady);
				Event._readyCallbacks =  [];
			}
			Event._readyCallbacks.push(f);
	  }
  }
});
//   onDOMReady : function(f) {
// 	if(AC.isDomReady) {
// 		f();
// 	}
//     else {
// 		if (!this._readyCallbacks) {
// 			  var domReady = this._domReady.bind(this);
// 			  
// 			  if (document.addEventListener)
// 				document.addEventListener("DOMContentLoaded", domReady, false);
// 				
// 				/*@cc_on @*/
// 				/*@if (@_win32)
// 					document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
// 					document.getElementById("__ie_onload").onreadystatechange = function() {
// 						if (this.readyState == "complete") domReady(); 
// 					};
// 				/*@end @*/
// 				
// 				if (/WebKit/i.test(navigator.userAgent)) { 
// 				  this._timer = setInterval(function() {
// 					if (/loaded|complete/.test(document.readyState)) domReady(); 
// 				  }, 10);
// 				}
// 				
// 				Event.observe(window, 'load', domReady);
// 				Event._readyCallbacks =  [];
// 			}
// 			Event._readyCallbacks.push(f);
// 	  }
//   }
// });


if (typeof(AC) == "undefined") AC = {};

AC.decorateSearchInput = function(field, options) {
	
	var searchField = $(field);
	var standIn = null;

	var results = 0;
	var placeholder = '';
	var autosave = '';

	if(options) {
		
		if(options.results) { results = options.results; }
		if(options.placeholder) { placeholder = options.placeholder; }
		if(options.autosave) { autosave = options.autosave; }
		
	}
	
	if(AC.Detector.isWebKit()) {

        if(AC.Detector.isWin()) {
            searchField.addClassName('not-round');
        }

		searchField.setAttribute('type', 'search');
		if(!searchField.getAttribute('results')) {
			searchField.setAttribute('results', results);
		}
		
		if(null != placeholder) {
			searchField.setAttribute('placeholder', placeholder);
			searchField.setAttribute('autosave', autosave);
		}
		
	} else {
		
		//prevent browser from doing its own autocomplete, threw odd xul 
		//error on reset sometimes, although this feels a little
		//heavy handed
		searchField.setAttribute('autocomplete', 'off');
		
		//replace the field with a standin while we create the wrapper
		//we can't lose the reference to this field as other objects may
		//have already registered listeners on this field
		
		standIn = document.createElement('input');
		searchField.parentNode.replaceChild(standIn, searchField)

		var left = document.createElement('span');
		Element.addClassName(left, 'left');
	
		var right = document.createElement('span');
		Element.addClassName(right, 'right');
		
		var reset = document.createElement('div');
		Element.addClassName(reset, 'reset');
		
		var wrapper = document.createElement('div');
		Element.addClassName(wrapper, 'search-wrapper');
		
		var alreadyHasPlaceholder = field.value == placeholder;
		var isEmpty = field.value.length == 0;
		
		if (alreadyHasPlaceholder || isEmpty) {
			searchField.value = placeholder;
			Element.addClassName(wrapper, 'blurred');
			Element.addClassName(wrapper, 'empty');
		}
	
		wrapper.appendChild(left);
		wrapper.appendChild(searchField);
		wrapper.appendChild(right);
		wrapper.appendChild(reset);
	
		var focus = function() {
			
			var blurred = Element.hasClassName(wrapper, 'blurred');

			//need to check for flag AND placeholder lest somebody need to 
			//search for the placeholder text itself
			if(searchField.value == placeholder && blurred) {
				searchField.value = '';
			}
			
			Element.removeClassName(wrapper, 'blurred');
		}
		Event.observe(searchField, 'focus', focus);
		
		var blur = function() {
			
			if(searchField.value == '') {
				Element.addClassName(wrapper, 'empty');
				searchField.value = placeholder;
			}
			
			Element.addClassName(wrapper, 'blurred');
		}
		Event.observe(searchField, 'blur', blur);
		
		
		var toggleReset = function() {
			
			if(searchField.value.length >= 0) {
				Element.removeClassName(wrapper, 'empty');
			}
		}
		Event.observe(searchField, 'keydown', toggleReset);
	
	
		var resetField = function() {
			return( function(evt) {
				
				var escaped = false;
				
				if(evt.type == 'keydown') {
					if(evt.keyCode != 27) {
						return; //if it's not escape ignore it
					} else {
						escaped = true;
					}
				}
				
				searchField.blur(); //can't change value while in field
				searchField.value = '';
				Element.addClassName(wrapper, 'empty');
				searchField.focus();

			})
		}
		Event.observe(reset, 'mousedown', resetField());
		Event.observe(searchField, 'keydown', resetField());
	
		if (standIn) {
			standIn.parentNode.replaceChild(wrapper, standIn);
		}
		
	}
}

// this is called Element2 because
// adding methods to Element BLOWS UP IE7 
// for a reason I still haven't got to the bottom
// of.  It appears to be fine though, as long
// as you don't try to add additional methods
// to Element itself.
var Element2 = {};
Element2.Methods = {
	
	getInnerDimensions: function(element) {
    	
		element = $(element);
		var d = Element.getDimensions(element);
		
		var innerHeight = d.height;
		var styleOf = Element.getStyle;
		innerHeight -= styleOf(element, 'border-top-width') && styleOf(element, 'border-top-width') != 'medium' ? parseInt(styleOf(element, 'border-top-width'), 10) : 0;
		innerHeight -= styleOf(element, 'border-bottom-width') && styleOf(element, 'border-bottom-width') != 'medium' ? parseInt(styleOf(element, 'border-bottom-width'), 10) : 0;
		innerHeight -= styleOf(element, 'padding-top') ? parseInt(styleOf(element, 'padding-top'), 10) : 0;
		innerHeight -= styleOf(element, 'padding-bottom') ? parseInt(styleOf(element, 'padding-bottom'), 10) : 0;

		var innerWidth = d.width;
		innerWidth -= styleOf(element, 'border-left-width') && styleOf(element, 'border-left-width') != 'medium' ? parseInt(styleOf(element, 'border-left-width'), 10) : 0;
		innerWidth -= styleOf(element, 'border-right-width') && styleOf(element, 'border-right-width') != 'medium' ? parseInt(styleOf(element, 'border-right-width'), 10) : 0;
		innerWidth -= styleOf(element, 'padding-left') ? parseInt(styleOf(element, 'padding-left'), 10) : 0;
		innerWidth -= styleOf(element, 'padding-right') ? parseInt(styleOf(element, 'padding-right'), 10) : 0;

	    return {width: innerWidth, height: innerHeight};
	},
	
	getOuterDimensions: function(element) {
		element = $(element);
		var clone = element.cloneNode(true);
		
		document.body.appendChild(clone);
		Element.setStyle(clone, { position: "absolute", visibility: "hidden" });
		var d = Element.getDimensions(clone);
		
		var outerHeight = d.height;
		var styleOf = Element.getStyle;
		outerHeight += styleOf(clone, 'margin-top') ? parseInt(styleOf(clone, 'margin-top'), 10) : 0;
		outerHeight += styleOf(clone, 'margin-bottom') ? parseInt(styleOf(clone, 'margin-bottom'), 10) : 0;

		var outerWidth = d.width;
		outerWidth += styleOf(clone, 'margin-left') ? parseInt(styleOf(clone, 'margin-left'), 10) : 0;
		outerWidth += styleOf(clone, 'margin-right') ? parseInt(styleOf(clone, 'margin-right'), 10) : 0;

		Element.remove(clone);
		
		return {width: outerWidth, height: outerHeight};
	},
	
	removeAllChildNodes: function(element) {
		element = $(element);
		if(! element) { return; }
		
		while (element.hasChildNodes()) {
	  		element.removeChild(element.lastChild);
		}
	}
	
};

Object.extend(Element, Element2.Methods);



/**
* Omniture Tracking library
*/
if (typeof(AC) == "undefined") {
    AC = {};
}

if (typeof(AC.Tracking) == "undefined") {
    AC.Tracking = {};
}

AC.Tracking.getLinkClicked = function(target)
{
    if (!target) {
        return null;
    }

    while (target.nodeName.toLowerCase() != 'a' && target.nodeName.toLowerCase() != 'body') {
        target = target.parentNode;
    }

    if (!target.href) {
        target = null;
    }

    return target;
}

AC.Tracking.trackLinksWithin = function(container, test, title, properties, options)
{
    $(container).observe('mousedown', function(evt) {

        var target = AC.Tracking.getLinkClicked(Event.element(evt));

        if (target && test(target)) {

            if (options && options.beforeTrack) {
                // provides a way to alter the properties or the title in some way for the mousedown
                // most felixble way to capture what link was actually clicked or whatever else
                // you want at the time of the event
                var altered = options.beforeTrack(target, title, properties);
                if (altered) {
                    title = altered.title;
                    properties = altered.properties;
                }
            }

            AC.Tracking.trackClick(properties, this, 'o', title);
        }

    });
}

/**
 * Effectively tags all links within a container conforming to the supplied 
 * test function reference with the specified key and value.
 * 
 * The test argument should be a function reference expecting the link as 
 * its first and only parameter. It should simply return true or false 
 * indicating whether the link should be tagged or not.
 */
AC.Tracking.tagLinksWithin = function(container, key, value, test)
{
    $(container).observe('mousedown', function(evt) {

        var link = Event.element(evt);

        if (!link) {
            return;
        }

        while (link.nodeName.toLowerCase() != 'a' && link.nodeName.toLowerCase() != 'body') {
            link = link.parentNode;
        }

        if (link.href && test(link)) {
            AC.Tracking.tagLink(link, key, value);
        }

        link = null;
    })
}

/**
 * Appends the specified key and value to the querystring of the supplied 
 * anchor's href attribute.
 */
AC.Tracking.tagLink = function(link, key, value)
{
    var href = link.getAttribute('href');

    if (href.match(/\?/)) {
        var params = href.toQueryParams();
        params[key] = value;
        href = href.split(/\?/)[0] + '?' + $H(params).toQueryString();
    } else {
        href += '?' + key + '=' + value;
    }

    link.setAttribute('href', href);
}

AC.Tracking.s_vi = function()
{
    var cookies = document.cookie.split(';'),
        s_vi = null,
        match;

    for (var i = 0, cookie; (cookie = cookies[i]); i++) {
        match = cookie.match(/^\s*s_vi=\[CS\]v1\|(.+)\[CE\]\s*$/);
        if (match) {
            s_vi = match[1];
            break;
        }
    }

    return s_vi;
}


/**
 * Makes a tracking request
 * 
 * Note: Typically you won't need to call this directly, instead you should
 * track events using either TrackClick or TrackPage whihc provide more
 * friendly interfaces to this method 
 * 
 * @trackingMethod the method of Omniture tracking to use
 * @properties associative array of property names and their associated values to track
 * @options associate array of options to use in this tracking context, 
 * 	some of these are required depending upon the trackingMethod you have chose
 */
AC.Tracking.track = function(trackingMethod, properties, options)
{
    if (typeof(s_gi) == 'undefined' || !s_gi) {
        return;
    }

    options = options || {};

    //use existing tracking account if available, or use one from the options
    if (typeof(s_account) != 'undefined') {
        s = s_gi(s_account)
    } else if (options.s_account){
        s = s_gi(options.s_account);
    } else {
        return;
    }

    if (trackingMethod == s.tl) {

        var linkTrackVars = ''

        for (var key in properties) {
            linkTrackVars += key + ',';
        }
        linkTrackVars = linkTrackVars.replace(/,$/, '');

        s.linkTrackVars = linkTrackVars;
    } else {
        s.linkTrackVars = '';
    }

    //clear properties set by default within a page
    s.prop4 = "";
    s.g_prop4 = "";
    s.prop6 = "";
    s.g_prop6 = "";
    s.pageURL = "";
    s.g_pageURL = "";
    s.g_channel = "";

    var sanitize = function(value) {
        if (typeof(value) == "string") {
            return value.replace(/[\'\"\“\”\‘\’]/g, '');
        } else {
            return value;
        }
    }

    for (var key in properties) {

        s[key] = sanitize(properties[key]);

        if (key == 'events') {
            s.linkTrackEvents = sanitize(properties[key]);
        }
    }

    if (trackingMethod == s.t) {
        void(s.t());
    } else {
        s.tl(options.obj, options.linkType, sanitize(options.title));
    }

    for (var key in properties) {
        if (key != 'pageName') {
            s[key] = '';
        }
        if (key == 'events') {
            s.linkTrackEvents = 'None';
        }
    }

},

/**
 * Uses the Omniture s.tl Tracking method to track a "click"
 * 
 * @properties associative array of params and associated values
 * @obj object for context, usually "this"
 * @linkType type of link for Omniture usually 'o'
 * @title human readable title for this link that shows up in reports
 * @options associative array of options to apply to this tracking context (currently no valid options are available)
 */
AC.Tracking.trackClick = function(properties, obj, linkType, title, options)
{
    var options = {
        obj: obj,
        linkType: linkType,
        title: title
    };

    AC.Tracking.track(s.tl, properties, options);
},

/**
 * Uses the Omniture s.t Tracking method to track a "page load"
 * 
 * @properties associative array of params and associated values
 * @options associative array of options to apply to this tracking context
 */
AC.Tracking.trackPage = function(properties, options)
{
	AC.Tracking.track(s.t, properties, options);
}





Element.Methods.childNodeWithNodeTypeAtIndex = function(element, nodeType,index) {
	var node = element.firstChild;
    if (!node) return null;
	var i=0;
    while (node) {
		if(node.nodeType === nodeType) {
			if(index === i) {
				return node;
			}
			i++;
		}
		node = node.nextSibling;
	}
    return null;
};



/* String Extensions Begin */
String.prototype.lastPathComponent = function() {
	var index = this.lastIndexOf("/");
	if(index != -1) {
		return this.substring(index+1,this.length-1);
	}
	else return null;
}

String.prototype.stringByDeletingLastPathComponent = function() {
	var index = this.lastIndexOf("/");
	if(index != -1) {
		return this.slice(0,index);
	}
	else return null;
}

String.prototype.stringByAppendingPathComponent = function(value) {
 	return (this.lastIndexOf("/") !== (this.length-1)) ? (this+"/"+value) : (this+value);
}

String.prototype.stringByRemovingPrefix = function(value) {
	var index = this.indexOf(value);
	if(index > -1) {
		var result = this.substring(index+value.length,this.length);
		return result;
	}
	else {
		return this;
	}
}
String.prototype.pathExtension = function() {
	var lastPathComponent = this.lastPathComponent();
	var index = lastPathComponent.lastIndexOf(".");
	if(index != -1) {
		return lastPathComponent.slice(index,lastPathComponent.length);
	}
	else return "";
}


/* String Extensions End */

/* Array Extensions Begin */

Array.prototype.addObjectsFromArray = function(array) {
	if(array.constructor === Array) {
		this.push.apply(this,array);
	}
	else {
		for(var i=0,item;(item = array[i]);i++) {
			this[this.length] = item;
		}
	}
}

//To let an array behave like a node list
Array.prototype.item = function(index) {
	return this[index];
}
 
/* Array Extensions End */


document._importNode = function(node, allChildren) {
	/* find the node type to import */
	if (node.nodeType === Node.ELEMENT_NODE) {
			/* create a new element */
			var newNode = document.createElement(node.nodeName);
			var i, il;
			/* does the node have any attributes to add? */
			if (node.attributes && node.attributes.length > 0)
				/* add all of the attributes */
				var nodeAttributes = node.attributes;
				var iNodeName, iNodeValue;
				for (i = 0, il = node.attributes.length; i < il;) {
					iNodeName = nodeAttributes[i].nodeName;
					iNodeValue = node.getAttribute(nodeAttributes[i++].nodeName);
					if(iNodeName === "class") {
						//iNodeName = "className";
						newNode.setAttribute("className", iNodeValue);
					}
					newNode.setAttribute(iNodeName, iNodeValue);
				}
			/* are we going after children too, and does the node have any? */
			if (allChildren && node.childNodes && node.childNodes.length > 0){
				/* recursively get all of the child nodes */
				for (i = 0, il = node.childNodes.length; i < il;i++) {
                    //NOSCRIPT doesn't support the appendChild of even a text node, so we'll skip it
                    if(newNode.tagName === "NOSCRIPT") {
                        continue;
                    }
                    newNode.appendChild(document._importNode(node.childNodes[i], allChildren));
                }
			}
			return newNode;
	}
		else if (node.nodeType === Node.TEXT_NODE) {
			return document.createTextNode(node.nodeValue);
		}
		else if(node.nodeType === Node.COMMENT_NODE) {
			return document.createComment(node.nodeValue);
		}
		else if(node.nodeType === Node.CDATA_SECTION_NODE) {
			return document.createCDATASection(node.nodeValue);
		}
		else return null;
};
if(!document.importNode) {
	document.importNode = document._importNode;
}

if(AC.Detector.isIEStrict()) {

	Element.Methods.hasAttribute = function(element, attributeName ) {
		if ( attributeName == "class") attributeName = "className";
		else if(attributeName == "for") attributeName = "htmlFor";
		var result = element.getAttribute(attributeName);
		return ((result != null) && (result !== ""));
		
	};

	document._getElementsByName = document.getElementsByName;
	document._HTMLElementsWithName = ["a","apple","button","form","frame","iframe","img","input","object","map","meta","param","textarea","select"];

	document.getElementsByName = function(name) {
		var _HTMLElementsWithName = this._HTMLElementsWithName;
		var result = [], ieResult, i, iNode;
		for(var e=0, element;(element = _HTMLElementsWithName[e]);e++) {
			ieResult = document.getElementsByTagName(element);
			for(i = 0;(iNode=ieResult[i]); i++) {
				if(iNode.name === name) {
					 result[result.length] = iNode;
				}
			}
		}

		return result;
	}
}

/**
 * AC.Storage
 * 
 * localStorage/cookie handling
 */
AC.Storage = {
	setItem: function(key, value, days){
		if (window.localStorage) localStorage.setItem(key, value);
		else this.createCookie(key, value, days);
	},
	getItem: function(key){
		var value;
		return (window.localStorage && (value = localStorage.getItem(key))) ? value : this.readCookie(key);
	},
	removeItem: function(key){
		if (window.localStorage) localStorage.removeItem(key);
		this.eraseCookie(key);
	},

	// cookie fallbacks
	createCookie: function(key, value, days) {
		if (days === null) days = 365;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = '; expires='+date.toGMTString();
		}
		else var expires = '';
		document.cookie = key+'='+value+expires+'; path=/';
	},
	readCookie: function(key) {
		var keyEQ = key + '=';
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1, c.length);
			if (c.indexOf(keyEQ) == 0) return c.substring(keyEQ.length, c.length);
		}
		return null;
	},
	eraseCookie: function(key) {
		this.createCookie(key,'',-1);
	}
};



/*********************** Gomez ***********************/
var gomez=gomez?gomez:{};gomez.h3=function(d, s){for(var p in s){d[p]=s[p];}return d;};gomez.h3(gomez,{b3:function(r){if(r<=0)return false;return Math.random()<=r&&r;},b0:function(n){var c=document.cookie;var v=c.match(new RegExp(';[ ]*'+n+'=([^;]*)'));if(!v)v=c.match(new RegExp(n+'=([^;]*)'));if(v)return unescape(v[1]);return '';},c2:function(n,v,e,p,d,s){try{var t=this,a=location.hostname;var c=n+'='+escape(v)+(e?';expires='+e.toGMTString():'')+(p?';path='+p:';path=/')+(d?';domain='+d:';domain='+a)+(s?';secure':'');document.cookie=c;}catch(e){}},z0:function(n){var t=this;if(n){var s =t.b0("__g_c");if(!s)return '';var v=s.match(new RegExp(n+':([^\|]*)'));if(v)return unescape(v[1]);return '';}else return '';},z1:function(n,m){var t=this;if(n){var s=t.b0("__g_c");if(s){if(s.indexOf(n+':')!=-1)s=s.replace(new RegExp('('+n+':[^\|]*)'),n+':'+m);else s=s==' '?n+':'+m:s+'|'+n+':'+m;t.c2("__g_c",s);}else t.c2("__g_c",n+':'+m);};}});if(gomez.wrate){gomez.i0=gomez.z0('w');if(gomez.i0){gomez.runFlg=parseInt(gomez.i0)>0?true:false;}else if(gomez.b3(parseFloat(gomez.wrate))){gomez.runFlg=true;gomez.z1('w',1);}else{gomez.runFlg=false;gomez.z1('w',0);}}else if(gomez.wrate==undefined){gomez.runFlg=true;gomez.z1('w',1);}else{gomez.runFlg=false;gomez.z1('w',0);};if(gomez.runFlg){gomez.h1=function(v,d){return v?v:d};gomez.gs=gomez.h1(gomez.gs,new Date().getTime());gomez.acctId=gomez.h1(gomez.acctId,'');gomez.pgId=gomez.h1(gomez.pgId,'');gomez.grpId=gomez.h1(gomez.grpId, '');gomez.E=function(c){this.s=c;};gomez.E.prototype={g1:function(e){var t=gomez,i=t.g6(e);if(i)i.e=t.b5();}};gomez.L=function(m){this.a=m;};gomez.L.prototype={g2:function(m){var t=gomez,n=t.b5();var s=document.getElementsByTagName(m);var e=t.k;if(m=='script')e=t.j;if(m=='iframe')e=t.l;if(s){var l=s.length;for(var i=0;i<l;i++){var u=s[i].src||s[i].href;if(u &&!e[u]){var r =new gomez.E(e);t.grm[u]=r;e[u]=new t.c7(u, n);if(t.gIE&&m=='script')t.e2(s[i],'readystatechange',t.d2,false);else t.e2(s[i],'load',r.g1,false);}}}}};gomez.L.m=new Object;gomez.L.m['script']=new gomez.L();gomez.L.m['link']=new gomez.L();gomez.L.m['iframe']=new gomez.L();gomez.S=function(){var t=this,h=gomez.acctId+".r.axf8.net";t.x=location.protocol+'//'+h+'/mr/b'+'.'+['g','i','f'].join("")+'?';t.y=location.protocol+'//'+h+'/mr/a'+'.'+['g','i','f'].join("")+'?';};gomez.h2=function(){var t=this;t.gIE=false;t.f=new Object;t._h=0;t.j=new Object;t.k=new Object;t.l=new Object;t.m=location.href;t.p=-1;t.q=-1;t.t=new Array;t.u=new Array;t._w=false;t.gSfr=/KHTML|WebKit/i.test(navigator.userAgent);t.gc={'n':'c'};t.grm=new Object;t.b;t.a=0;t.d=false;t.x=false;t.s=new gomez.S;t._a=false;t.h6=false;};gomez.h3(gomez,{h5:function(u){try{var s=document.createElement('script');s.src=u;s.type='text/javascript';if(document.body)document.body.appendChild(s);else if(document.documentElement.getElementsByTagName('head')[0])document.documentElement.getElementsByTagName('head')[0].appendChild(s);}catch(e){}},a9:function(){var t=gomez,i=t.z0('a'),g=t.b0('__g_u');t.gc.h=t.z0('b');if(!t.gc.h)t.gc.h=1;t.z1('b',parseInt(t.gc.h)+1);if(i){t.a=parseInt(i);if(t.a==1){t._w=true;}else if(t.a==3){t.x=true;t._w=true;};t.d=true;t.gc.c=t.z0('c');t.gc.d=t.z0('d');t.gc.i=t.z0('e');t.gc.j=t.z0('f');if(t._w&&!t._a){t.h7();t._a=true;};}else {if(!t.gc.a)return;var s='v=1';t.c2('__g_u','1',new Date(t.gt()+1000));if(t.b0('__g_u')&&g&&g!='1'&&g.indexOf('NaN')==-1&&g.indexOf('undefined')==-1){s='v=0';var r=g.split('_');t.b2(parseInt(r[0]),parseInt(r[1])+1);if(r[4]&&r[4]!='0'&&t.gt()<parseInt(r[5])&&r[2]&&r[2]!='0'){t.b1(parseFloat(r[2]),parseFloat(r[3]),parseFloat(r[4]),parseInt(r[5]));return;};};t.h6=true;s=t.s.y+'a='+t.gc.a+'&'+s;if(t.gSfr)document.write("<scr"+"ipt src='"+s+"'"+"><\/scr"+"ipt>");else t.h5(s);};t.b=t.z0('g');},h7:function(){var t=gomez,u=t.tloc?t.tloc:location.protocol+'//'+t.acctId+'.t.axf8.net/js/gtag4.js';if(t.gSfr)document.write("<scr"+"ipt src='"+u+"'"+"><\/scr"+"ipt>");else t.h5(u);},b1:function(v,s,q,f){var t=this;if(t._a)return;if(t.b3(v)){t._w=true;t.a=1;var p=parseFloat(s/v);if(t.b3(p)){t.x=true;t.a=3;};};t.d=true;t.z1('a',t.a);t.z1('e',v);t.z1('f',s);t.gc.i=v;t.gc.j=s;t.h4(v,s,q,f);if(t._w){t.h7();t._a=true;};},b2:function(v,s){var t=this,f=new Date(t.gt()+946080000000),g=''+v+'_'+s;if(t._a)return;t.c2('__g_u',g,f);t.gc.c=v;t.gc.d=s;t.z1('c',v);t.z1('d',s);},h4:function(o,p,q,d){var t=this,f=new Date(t.gt()+946080000000),g=t.b0('__g_u');if(g&&g!='1'&&g.indexOf('NaN')==-1&&g.indexOf('undefined')==-1){var r=g.split('_'),s;if(d)s=d;else if(q&&q>=0)s=new Date(t.gt()+parseInt(q*86400000)).getTime();else{q=5;s=new Date(t.gt()+432000000).getTime();};g=''+r[0]+'_'+r[1]+'_'+o+'_'+p+'_'+q+'_'+s;t.c2('__g_u',g,f);};},gt:function(){return new Date().getTime()},b5:function(){return new Date().getTime()-gomez.gs},b6:function(){var t=gomez;t.p=t.b5();},f8:function(){var t=this;if(t.pollId1)clearInterval(t.pollId1);if(t.pollId2)clearInterval(t.pollId2);if(t.pollId3)clearInterval(t.pollId3);if(t.pollId4)clearInterval(t.pollId4);},b7:function(){var t =gomez;t.f8();t.q=t.b5();},c7:function(u, s){var t=this;t.m=u;t.s=s;},c8:function(){var t=gomez,n=t.b5(),l=document.images.length;if(l>t._h){for(var i=t._h;i<l;++i){var u=document.images[i].src;if(u){var r =new gomez.E(t.f);t.grm[u]=r;t.f[u]=new t.c7(u, n);t.e2(document.images[i],'load',t.c4,false);t.e2(document.images[i],'error',t.c5,false);t.e2(document.images[i],'abort',t.c6,false);}}}t._h=l;},c4:function(e){var t=gomez,i=t.g6(e);if(i)i.e=t.b5();},c5:function(e){var t=gomez,i=t.g6(e);if(i){i.e=t.b5();i.b=1;}},c6:function(e){var t=gomez,i=t.g6(e);if(i)i.a=t.b5();},g6:function(e){var t=gomez,e=window.event?window.event:e,a=t.d8(e),i;if(t.grm[a.src||a.href]&&t.grm[a.src||a.href].s)i=t.grm[a.src||a.href].s[a.src||a.href];return i;},d2:function(){var t=gomez;var e=window.event?window.event:e,s=t.d8(e);if(s.readyState=='loaded'||s.readyState=='complete'){var o=t.j[s.src];if(o)o.e=t.b5();}},setPair:function(name,value){var t=this;t.t[t.t.length]={'n':'p','a':name,'b':value};},nameEvent:function(n){var t=this;t.f6(n,1);},startInterval:function(n){var t=this;t.f6(n,2,1);},endInterval:function(n){var t=this;t.f6(n,2,2);},f6:function(n,p,b){if(n&&n.length>20)n=n.substring(0,20);var t=this,f=t.u;f[f.length]={'n':'a','a':n,'b':t.b5(),'e':p,'f':b};},d8:function(e){if(gomez.gIE)return e.srcElement||{};else return e.currentTarget||e.target||{};},e2:function(e,p,f,c){var n='on'+p;if(e.addEventListener)e.addEventListener(p,f,c);else if(e.attachEvent)e.attachEvent(n, f);else{var x=e[n];if(typeof e[n]!='function')e[n]=f;else e[n]=function(a){x(a);f(a);};}},i1:function(){var d =window.document, done=false,i2=function (){if(!done){done=true;gomez.b6();gomez.a9();}};(function (){try{d.documentElement.doScroll('left');}catch(e){setTimeout(arguments.callee, 50);return;}i2();})();d.onreadystatechange=function(){if(d.readyState=='complete'){d.onreadystatechange=null;i2();}};},g7:function(){try{var t=gomez;t.gc.a=t.acctId;/*@cc_on t.gIE=true;@*/if(t.gIE){t.i1();window.attachEvent('onload', t.b7);}else if(t.gSfr){var m=setInterval(function(){if(/loaded|complete/.test(document.readyState)){clearInterval(m);delete m;t.b6();t.b7();}}, 10);}else if(window.addEventListener){window.addEventListener('DOMContentLoaded', t.b6, false);window.addEventListener('load', t.b7, false);}else return;t.c8();t.pollId1=setInterval(t.c8, 1);gomez.L.m['link'].g2('link');t.pollId3=setInterval("gomez.L.m['link'].g2('link')", 1);gomez.L.m['iframe'].g2('iframe');t.pollId4=setInterval("gomez.L.m['iframe'].g2('iframe')", 1);if(!t.gIE)t.a9();}catch(e){return;}}});gomez.h2();gomez.g7();}
/*********************** Gomez ***********************/


