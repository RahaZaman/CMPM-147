// sketch.js - purpose and description here
// Author: Rahamat Zaman
// Date: April 16 2024

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

let seed = 200;

// setting colors for objects
const skyColor = "#87CEEB";
const riverColor = "#4169e1";
const grassColor = "#32cd32";
const mountainColor = "#a9a9a9";
const treeColor = "#006400";

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  createCanvas(500, 300);
  createButton("reimagine").mousePressed(() => seed++);
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(220);    
  // call a method on the instance
  myInstance.myMethod();

  // Set up rotation for the rectangle
  push(); // Save the current drawing context
  translate(centerHorz, centerVert); // Move the origin to the rectangle's center
  rotate(frameCount / 100.0); // Rotate by frameCount to animate the rotation
  fill(234, 31, 81);
  noStroke();
  rect(-125, -125, 250, 250); // Draw the rectangle centered on the new origin
  pop(); // Restore the original drawing context

  // The text is not affected by the translate and rotate
  fill(255);
  textStyle(BOLD);
  textSize(140);
  text("p5*", centerHorz - 105, centerVert + 40);

  randomSeed(seed);
  background(100);

  // Draw the sky
  fill(skyColor);
  // covers entire screen
  rect(0, 0, width, height);

  // Draw the mountains
  fill(mountainColor);
  beginShape();
  vertex(0, height / 2);
  const steps = 10;
  for (let i = 0; i < steps + 1; i++) {
    let x = (width * i) / steps;
    let y =
      height / 2 - (random() * random() * random() * height) / 2 - height / 25;
    vertex(x, y);
  }
  vertex(width, height / 2);
  endShape(CLOSE);

  // Draw the grass
  fill(grassColor);
  beginShape();
  curveVertex(0, height); // Start from the bottom left corner

  // Define control points to create a flat line
  let curveHeight = height / 2; // Set the height limit to halfway through the screen
  curveVertex(0, curveHeight); // Adjust the first control point to start from the bottom left corner
  curveVertex(0, curveHeight); // Keep the height constant for the left edge
  curveVertex(width / 6, curveHeight);
  curveVertex(width / 2, curveHeight); // Keep the height constant for the middle portion
  curveVertex((3 * width) / 4, curveHeight);
  curveVertex(width, curveHeight); // Keep the height constant for the right edge
  curveVertex(width, height); // End at the bottom right corner
  endShape(CLOSE);

  // Draw the river
  fill(riverColor);
  rect(0, random(height / 2 + 20, height - 20 - height / 6), width, height / 6);

  // Draw the trees
  fill(treeColor);
  const trees = 10 * random();
  const scrub = mouseX / width;
  for (let i = 0; i < trees; i++) {
    let z = random();
    let x = width * ((random() + (scrub / 50 + millis() / 500000.0) / z) % 1);
    let s = width / 50 / z;
    let y = height / 2 + height / 20 / z;
    triangle(x, y - s, x - s / 4, y, x + s / 4, y);
  }

}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}