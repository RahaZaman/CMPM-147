// overworld.js - A project that auto-tiles map generation and generates biomes to create an overworld
// Author: Rahamat Zaman
// Date:

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
  canvas.parent("canvas-containerTwo");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
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
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}

// Second Sketch - Overworld Map Generator

const sketch2 = (p) => {
  let seed = 0;
  let tilesetImage;
  let currentGrid = [];
  let numRows, numCols;

  p.preload = function() {
    tilesetImage = p.loadImage("https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438");
  }

  p.setup = function() {
    const canvasContainer = p.select('#canvasContainer2');
    numCols = p.select("#asciiBox2").attribute("rows") | 0;
    numRows = p.select("#asciiBox2").attribute("cols") | 0;
  
    p.createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
    p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
  
    p.select("#reseedButton2").mousePressed(reseed);
    p.select("#asciiBox2").input(reparseGrid);
  
    reseed();
  }

  p.draw = function() {
    p.randomSeed(seed);
    drawGrid(currentGrid);
  }

  function reseed() {
    seed = (seed | 0) + 1109;
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.select("#seedReport2").html("seed " + seed);
    regenerateGrid();
  }
  
  function regenerateGrid() {
    p.select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
    reparseGrid();
  }
  
  function reparseGrid() {
    currentGrid = stringToGrid(p.select("#asciiBox").value());
  }

  function gridToString(grid) {
    let rows = [];
    for (let i = 0; i < grid.length; i++) {
      rows.push(grid[i].join(""));
    }
    return rows.join("\n");
  }
  
  function stringToGrid(str) {
    let grid = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let row = [];
      let chars = lines[i].split("");
      for (let j = 0; j < chars.length; j++) {
        row.push(chars[j]);
      }
      grid.push(row);
    }
    return grid;
  }

  function generateGrid(numCols, numRows) {
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push("_");
      }
      grid.push(row);
    }
  
    // Generate biomes in the overworld using the noise function
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        if (p.noise(i / 10, j / 10) > 0.5) { // added p in front of noise
          grid[i][j] = "#"; // # symbol to represent biomes / grass
        }
  
        // Place trees randomly around the biome
        if (grid[i][j] === "#") {
          if (p.random() > 0.95) { // added p in front of random
            // Adjust the probability as needed
            grid[i][j] = "$"; // $ symbol to represent trees
          }
        }
      }
    }
  
    return grid;
  }

  // Define variables for cloud properties
  let cloudX = 100;
  let cloudSpeed = 0.7;

  // creates cloud using ellipse function
  // function taken from: https://editor.p5js.org/mena-landry/sketches/D7ql4Nd3V
  function makeCloud(cloudx, cloudy) {
    p.fill(250);
    p.noStroke();
    p.ellipse(cloudx, cloudy, 50, 30);
    p.ellipse(cloudx + 10, cloudy + 10, 50, 30);
    p.ellipse(cloudx - 20, cloudy + 10, 50, 30);
  }

  function drawGrid(grid) {
    p.background(128);
  
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        // Autotiling Logic using functions gridCheck() and drawContext()
  
        // background (ocean / sea)
        if (gridCheck(grid, i, j, "_")) {
          placeTile(i, j, p.floor(p.random(0)), 13);
        }
        // tile for grass
        else if (gridCheck(grid, i, j, "#")) {
          placeTile(i, j, 1, 0);
        }
        // tile for trees
        else if (gridCheck(grid, i, j, "$")) {
          placeTile(i, j, 16, 7);
        } else {
          drawContext(grid, i, j, "_", 1, 0);
        }
      }
    }
  
    // Reset clouds to the left side and randomize y-coordinate when they go off the screen
    if (cloudX > width) {
      cloudX = -200; // Adjust the initial position as needed
    }
  
    // function which creates clouds
    makeCloud(cloudX, p.random(p.height));
    makeCloud(cloudX + 100, p.random(p.height));
    makeCloud(cloudX + 200, p.random(p.height));
  
    // moving clouds horizontally on the x-coordinate
    cloudX += cloudSpeed;
  }

  function placeTile(i, j, ti, tj) {
    p.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

}

// making sketch two
new p5(sketch2);

// Checks to see if location is inside of the grid (not out of bounds)
function gridCheck(grid, i, j, target) {
  // Check if the indices i and j are within the bounds of the grid
  if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
    // If the value at grid[i][j] matches the target, return true
    return grid[i][j] === target;
  } else {
    // If the indices are out of bounds, return false
    return false;
  }
}

// Form a 4-bit code using gridCheck on the north/south/east/west neighbors
function gridCode(grid, i, j, target) {
  // Define variables to store the presence of the target in the neighbors
  const northBit = gridCheck(grid, i - 1, j, target) ? 1 : 0;
  const southBit = gridCheck(grid, i + 1, j, target) ? 1 : 0;
  const eastBit = gridCheck(grid, i, j + 1, target) ? 1 : 0;
  const westBit = gridCheck(grid, i, j - 1, target) ? 1 : 0;

  // Form the 4-bit code using bitwise operations
  const code =
    (northBit << 0) + (southBit << 1) + (eastBit << 2) + (westBit << 3);

  return code;
}

// Grabs the code for the lecture and target to get a pair of tile offset numbers
function drawContext(grid, i, j, target, ti, tj) {
  // Get the code for this location and target
  const code = gridCode(grid, i, j, target);

  // If the code is within the valid range of the lookup table
  if (code >= 0 && code < lookup.length) {
    // Get the tile offset numbers from the lookup table
    const [tiOffset, tjOffset] = lookup[code];

    // Place the tile at the adjusted position
    placeTile(i, j, ti + tiOffset, tj + tjOffset);
  }
}

// Table for offset pairs
const lookup = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [1, 2],
  [2, 1],
  [2, 2],
  [3, 3],
  [3, 0],
  [0, 3],
  [3, 1],
  [1, 3],
  [2, 3],
  [3, 2],
  [0, 2],
  [2, 0],
];