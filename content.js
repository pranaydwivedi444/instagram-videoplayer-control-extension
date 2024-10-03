let activeVideoes = new Map();
let videoObserver = null; 

chrome.runtime.onMessage.addListener((data) => {
  const { event } = data;
  switch (event) {
    case "onStart":
      init();
      break;
    case "onStop":
      stopExtension(videoObserver)
      break;
    default:
      break;
  }
  return true;
});

function showVideoControls(videoPlayer) {
  const overlayElement = videoPlayer.nextSibling;
  overlayElement.remove();
  videoPlayer.controls = true;
  function timeUpdateHandler() {
    if (videoPlayer.muted) {
      videoPlayer.muted = false; // Unmute if muted
    }
    if (videoPlayer.paused) {
      videoPlayer.play();
    }
  }

//   videoPlayer.addEventListener("timeupdate", timeUpdateHandler);

  return () => {
    videoPlayer.controls = false;
    // video.removeEventListener("timeupdate", timeUpdateHandler);
    videoPlayer.insertAdjacentElement("afterend", overlayElement);
  };
}

function resetAllVideos() {
  activeVideoes.forEach((cleanup, video) => {
    cleanup(); 
  });
  activeVideoes.clear();
}

function processVideoes(container) {
  const videoPlayers = container.querySelectorAll(
    'div[style*="padding-bottom:"] video'
  );

  videoPlayers.forEach((video) => {
    if (!activeVideoes.has(video)) {
      const cleanup = showVideoControls(video);
      activeVideoes.set(video, cleanup);
    }
    //add event listeners
    //remove the element
    //if it visble then play
    console.log(videoPlayers, activeVideoes);
  });
}

function observingAllContainers() {
  const holders = document.querySelectorAll('div[style*="padding-bottom:"]');
  holders.forEach((holder) => {
    processVideoes(holder);
  });

  function checkForNewVideoesVIABottomLoad(mutations) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.matches('div[style*="padding-bottom:"]')) {
            processVideoes(node);
          } else {
            node
              .querySelectorAll('div[style*="padding-bottom:"]')
              .forEach((childNode) => {
                processVideoes(childNode); // process videoes in nested 
              });
          }
        }
      });
    });
  }
  const observer = new MutationObserver(checkForNewVideoesVIABottomLoad);

  observer.observe(document.body, { childList: true, subtree: true });

  return observer;
}

function init() {
   videoObserver =  observingAllContainers();
}

function stopExtension(obs) {
    obs.disconnect();
    resetAllVideos();
}

init();

// when encounter our instagram feed in the browseer , it doesn't show the video controls 
// appraoch to inpect understand dom , what s' the overlay element , that stopping us 
//selet the next sibling element and then remove it 
//  const holders = document.querySelectorAll('div[style*="padding-bottom:"]');
// the problem is we have many videoes ,  there will bottom load infinite load , which will reocmmend us more videoes  all the video element in one go
// mutuation ob server api  , any changes dom will be observed 
