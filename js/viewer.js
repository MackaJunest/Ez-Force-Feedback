/*!
 * SOLIDWORKS Visualize (Pre)Viewer
 * 
 * Basic logic supporting this page.
 * This does **not** need to be included when embedding into another site
 */

(function Viewer() {
    const viewer = document.querySelector('#viewer');
    const viewerParent = viewer.parentElement;

    var btnActual = document.getElementById('btn-actual');
    var btnFit = document.getElementById('btn-fit');

    // By default, the viewer is "fit to screen"
    // It will continue to fit to screen until the "Actual" button is clicked
    let shouldFitOnResize = true;
    btnFit.classList.add("hidden");    
    
    // Handle Button Events
    
    btnActual.addEventListener('click', function () {
        // get the intrinsic size of the original img element
        var actualWidth = document.querySelectorAll('#viewer img')[0].naturalWidth;
        var actualHeight = document.querySelectorAll('#viewer img')[0].naturalHeight;

        viewer.style.width = `${actualWidth}px`;
        viewer.style.height = `${actualHeight}px`;

        shouldFitOnResize = false;

        // Enable resize handles
        viewer.style.resize = "both";
       
        btnActual.classList.add("hidden");
        btnFit.classList.remove("hidden");
    });
    
    
    btnFit.addEventListener('click', function () {
        FitToScreen();
        shouldFitOnResize = true;
        viewer.style.resize = "none";
        btnFit.classList.add("hidden");
        btnActual.classList.remove("hidden");
    });

    function FitToScreen() {
        viewer.style.width = `${viewerParent.getWidth()}px`;
        var headerHeight = document.querySelector('header').getHeight();
        var bottomOffset = headerHeight + 35; // 35 "extra" to avoid scrollbars    
        viewer.style.height = `${window.innerHeight - bottomOffset}px`;
    }

    // Handle Window Resize

    var viewerResizeObserver = new ResizeObserver(function (entries) {
        if (!shouldFitOnResize) { return; }
        if (entries.length === 0 || !entries[0].contentRect || entries[0].contentRect.height == 0) { return; }

        FitToScreen();
    })

    viewerResizeObserver.observe(viewerParent);

})();
