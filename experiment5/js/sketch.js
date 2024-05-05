// sketch.js - Parameterized image generator that adapts its designs based on three selectable inspiring images, allowing users to fine-tune exploration with a mutation rate slider.
// Author: Rahamat Zaman
// Date: 

// function resizeScreen() {
//   centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
//   centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
//   console.log("Resizing...");
//   resizeCanvas(canvasContainer.width(), canvasContainer.height());
//   // redrawCanvas(); // Redraw everything based on new size
// }

// // setup() function is called once when the program starts
// function setup() {
//   // place our canvas, making it fit our container
//   canvasContainer = $("#canvas-container");
//   let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
//   canvas.parent("canvas-container");
//   // resize canvas is the page is resized

//   // create an instance of the class
//   myInstance = new MyClass("VALUE1", "VALUE2");

//   $(window).resize(function() {
//     resizeScreen();
//   });
//   resizeScreen();

//   createCanvas(500, 300);
//   createButton("reimagine").mousePressed(() => seed++);
// }

// // draw() function is called repeatedly, it's the main animation loop
// function draw() {
//   background(220);    
//   // call a method on the instance
//   myInstance.myMethod();

//   // Set up rotation for the rectangle
//   push(); // Save the current drawing context
//   translate(centerHorz, centerVert); // Move the origin to the rectangle's center
//   rotate(frameCount / 100.0); // Rotate by frameCount to animate the rotation
//   fill(234, 31, 81);
//   noStroke();
//   rect(-125, -125, 250, 250); // Draw the rectangle centered on the new origin
//   pop(); // Restore the original drawing context

//   // The text is not affected by the translate and rotate
//   fill(255);
//   textStyle(BOLD);
//   textSize(140);
//   text("p5*", centerHorz - 105, centerVert + 40);

//   randomSeed(seed);
//   background(100);
// }

// // mousePressed() function is called once after every time a mouse button is pressed
// function mousePressed() {
//     // code to run when mouse is pressed
// }

/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;

function preload() {
  

  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}



function setup() {
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}



function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  
  if(!currentDesign) {
    return;
  }
  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  rate.innerHTML = slider.value;
  mutateDesign(currentDesign, currentInspiration, slider.value/100.0);
  
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }
  
  fpsCounter.innerHTML = Math.round(frameRate());
}