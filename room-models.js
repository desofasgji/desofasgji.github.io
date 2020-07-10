let audioContext;
let canvasControl;
let scene;
let audioElements = [];
let soundSources = [];
let sourceIds = ['sourceAButton', 'sourceBButton'];
let dimension = {
    width: 4, height: 3, depth: 4,
};
let materials = {
  brick: {
    left: 'brick-bare', right: 'brick-bare',
    up: 'brick-bare', down: 'wood-panel',
    front: 'brick-bare', back: 'brick-bare',
  },
  curtains: {
    left: 'curtain-heavy', right: 'curtain-heavy',
    up: 'wood-panel', down: 'wood-panel',
    front: 'curtain-heavy', back: 'curtain-heavy',
  },
  marble: {
    left: 'marble', right: 'marble',
    up: 'marble', down: 'marble',
    front: 'marble', back: 'marble',
  },
  outside: {
    left: 'transparent', right: 'transparent',
    up: 'transparent', down: 'grass',
    front: 'transparent', back: 'transparent',
  },
};
let dimensionSelection = 'small';
let materialSelection = 'brick';
let audioReady = false;

/**
 * @private
 */
function selectRoomProperties() {
  if (!audioReady)
    return;

  materialSelection =
    document.getElementById('roomMaterialsSelect').value;

  dimension = {
    width: document.getElementById('roomDimensionsSelectWidth').value,
    height: document.getElementById('roomDimensionsSelectHeight').value,
    depth: document.getElementById('roomDimensionsSelectDepth').value,
  }

  scene.setRoomProperties(dimension, materials[materialSelection]);

  document.getElementById('listenerHeight').max = dimension.height;
  document.getElementById('listenerHeightValue').innerHtml = dimension.height;

  canvasControl.invokeCallback();
}

/**
 * @param {Object} elements
 * @private
 */
function updatePositions(elements) {
  if (!audioReady)
    return;

  for (let i = 0; i < elements.length; i++) {
    let x = (elements[i].x - 0.5) * dimension.width / 2;
    let y = 0;
    let z = (elements[i].y - 0.5) * dimension.depth / 2;
    if (i < elements.length - 1) {
      soundSources[i].setPosition(x, y, z);
      console.log("Set source position (x,y,z): (" + x + "," + y + "," + z + ")");
    } else {
      y = document.getElementById('listenerHeight').value - dimension.height / 2;
      document.getElementById('listenerHeightValue').innerHTML = document.getElementById('listenerHeight').value;
      scene.setListenerPosition(x, y, z);
      console.log("Set listener position (x,y,z): (" + x + "," + y + "," + z + ")");
    }
  }
}

/**
 * @private
 */
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext);
  let audioSources = [
    'sound/speech-sample.wav',
    'sound/music.wav',
  ];
  let audioElementSources = [];
  for (let i = 0; i < audioSources.length; i++) {
    audioElements[i] = document.createElement('audio');
    audioElements[i].src = audioSources[i];
    audioElements[i].crossOrigin = 'anonymous';
    audioElements[i].load();
    audioElements[i].loop = true;
    audioElementSources[i] =
      audioContext.createMediaElementSource(audioElements[i]);
  }

  // Initialize scene and create Source(s).
  scene = new ResonanceAudio(audioContext, {
    ambisonicOrder: 3,
  });
  for (let i = 0; i < audioSources.length; i++) {
    soundSources[i] = scene.createSource();
    audioElementSources[i].connect(soundSources[i].input);
  }
  scene.output.connect(audioContext.destination);

  audioReady = true;
}

let onLoad = function() {
  // Initialize play button functionality.
  for (let i = 0; i < sourceIds.length; i++) {
    let button = document.getElementById(sourceIds[i]);
    button.addEventListener('click', function(event) {
      switch (event.target.textContent) {
        case 'Play': {
          if (!audioReady) {
            initAudio();
          }
          event.target.textContent = 'Pause';
          audioElements[i].play();
        }
        break;
        case 'Pause': {
          event.target.textContent = 'Play';
          audioElements[i].pause();
        }
        break;
      }
    });
  }

  document.getElementById('roomDimensionsSelectWidth').addEventListener(
    'change', function(event) {
      selectRoomProperties();
  });
  document.getElementById('roomDimensionsSelectHeight').addEventListener(
    'change', function(event) {
      selectRoomProperties();
  });
  document.getElementById('roomDimensionsSelectDepth').addEventListener(
    'change', function(event) {
      selectRoomProperties();
  });

  document.getElementById('roomMaterialsSelect').addEventListener(
    'change', function(event) {
      selectRoomProperties();
  });

  let canvas = document.getElementById('canvas');
  let elements = [
    {
      icon: 'sourceAIcon',
      x: 0.25,
      y: 0.25,
      radius: 0.04,
      alpha: 0.75,
      clickable: true,
    },
    {
      icon: 'sourceBIcon',
      x: 0.75,
      y: 0.25,
      radius: 0.04,
      alpha: 0.75,
      clickable: true,
    },
    {
      icon: 'listenerIcon',
      x: 0.5,
      y: 0.5,
      radius: 0.04,
      alpha: 0.75,
      clickable: true,
    },
  ];
  canvasControl = new CanvasControl(canvas, elements, updatePositions);

  document.getElementById('listenerHeight').addEventListener(
    'change', function(event) {
      updatePositions(elements);
  });

  selectRoomProperties();
};
window.addEventListener('load', onLoad);
