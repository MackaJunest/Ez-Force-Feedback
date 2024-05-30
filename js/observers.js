/*!
 * SOLIDWORKS Visualize
 * 
 * This script updates the "wheelzoom" images after the #viewer element is resized.
 */

(function Observer() {
	
	if (AC.Detector.isiPad()) {
		//$('main').addClassName('isipad');
		$('viewer').addClassName('isipad');
	}

	const viewer = document.querySelector('#viewer');

	const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	var imgObserver = new MutationObserver(function (mutations, observer) {
		// fired when a mutation occurs
		//console.log("imgObserver", mutations, observer);
		mutations.forEach(m => {

			// Nodes Removed
			// Transfer the removed node properties to the new node
			if (m.removedNodes && m.removedNodes.length > 0) {
				m.removedNodes.forEach(removedN => {
					if (!removedN.classList.contains('zoomableNode')) { return; }

					document.querySelectorAll(".zoomableNode").forEach(n => {
						n.style["background-size"] = removedN.style["background-size"];
						n.style["background-position"] = removedN.style["background-position"];
					});
				});
			}

			// Nodes Added
			// Clone the original "vr" img, add a "wheelzoomed" version, and hide the original
			// This fixes an issue with vr and wheelzoom not playing well together
			if (m.addedNodes && m.addedNodes.length > 0) {
				m.addedNodes.forEach(n => {
					if (n.nodeName != 'IMG' ||
						!n.currentSrc ||
						n.currentSrc.startsWith("data:image") ||
						n.classList.contains('zoomableNode')) { return; }

					document.querySelectorAll(".zoomableNode").forEach(el => el.remove());
					n.style.display = "unset"; // null?
					let zoomableNode = n.cloneNode(true);
					zoomableNode.addClassName('zoomableNode');

					let vr = document.getElementsByClassName("vr")[0];
					vr.appendChild(zoomableNode);
					wheelzoom(zoomableNode);

					zoomableNode.dispatchEvent(new CustomEvent('wheelzoom.updateSize'));

					n.style.display = "none";
				});
			}
		});

	});

	imgObserver.observe(document, {
		subtree: true,
		childList: true,
		//attributes: true
	});

	var resObserver = new ResizeObserver(function (entries) {
		//console.log("resObserver", entries);
		if (entries.length === 0 || !entries[0].contentRect || entries[0].contentRect.height == 0) { return; }

		document.querySelectorAll(".zoomableNode").forEach(n => {
			// There should only be 1 zoomable node
			n.style["background-size"] = `${n.width}px ${n.height}px`;
			n.style["background-position"] = "0px 0px";

			n.dispatchEvent(new CustomEvent('wheelzoom.updateSize'));
		});

		document.querySelectorAll("img").forEach(setSizeConstraints);
	});

	resObserver.observe(viewer);

	// Nearly identical to the function of the same name in vr.js
	function setSizeConstraints(img) {
		// Aspect Ratio of the Image
		
		var arImage = img.naturalWidth / img.naturalHeight;

		// Aspect Ratio of the Viewer

		var arViewer = viewer.getWidth() / viewer.getHeight();

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
})();
