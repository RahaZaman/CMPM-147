// sketch.js (dungeon.js) - A project that auto tiles map generation and generates a dungeon room.
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
  canvas.parent("canvas-containerOne");
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

// First Sketch - Dungeon Room Generator

const sketch1 = (p) => {
  let seed = 0;
  let tilesetImage;
  let currentGrid = [];
  let numRows, numCols;

  p.preload = function() {
    tilesetImage = p.loadImage("https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438");
  }

  p.setup = function() {

    const canvasContainer = p.select('#canvasContainer');
    numCols = select("#asciiBox").attribute("rows") | 0;
    numRows = select("#asciiBox").attribute("cols") | 0;
  
    p.createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
    p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
  
    p.select("#reseedButton").mousePressed(reseed);
    p.select("#asciiBox").input(reparseGrid);
  
    reseed();
  }

  p.draw = function() {
    p.randomSeed(seed);
    p.background(128);
    drawGrid(currentGrid);
  };

  function reseed() {
    seed = (seed | 0) + 1109;
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.select("#seedReport").html("seed " + seed);
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
  
  function placeTile(i, j, ti, tj) {
    p.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  function generateGrid(numCols, numRows) {
    // defining grid and dungeon rooms
    let grid = [];
    let rooms = [];
  
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push("_");
      }
      grid.push(row);
    }
  
    // Generate multiple rooms
    for (let k = 0; k < 5; k++) {
      // Adjust the number of rooms as needed
      let roomTopLeftX = p.floor(p.random(1, numCols - 5)); // Randomly choose the top-left corner X-coordinate
      let roomTopLeftY = p.floor(p.random(1, numRows - 5)); // Randomly choose the top-left corner Y-coordinate
      let roomBottomRightX = roomTopLeftX + p.floor(p.random(4, 8)); // Calculate the bottom-right corner X-coordinate
      let roomBottomRightY = roomTopLeftY + p.floor(p.random(4, 8)); // Calculate the bottom-right corner Y-coordinate
  
      let room = {
        topLeftX: roomTopLeftX,
        topLeftY: roomTopLeftY,
        bottomRightX: roomBottomRightX,
        bottomRightY: roomBottomRightY,
      };
  
      rooms.push(room);
  
      // Fill the dungeon room within the grid
      for (let i = roomTopLeftY; i <= roomBottomRightY; i++) {
        for (let j = roomTopLeftX; j <= roomBottomRightX; j++) {
          // Check if the cell is on the border of the room
          let isBorder =
            i == roomTopLeftY ||
            i == roomBottomRightY ||
            j == roomTopLeftX ||
            j == roomBottomRightX;
          // If it's a border cell, mark it as such
          if (isBorder) {
            grid[i][j] = "+"; // Use a different symbol to represent border cells
          } else {
            grid[i][j] = "."; // represents space inside dungeon room
          }
        }
      }
    }
  
    // Connect the rooms
    for (let k = 0; k < rooms.length - 1; k++) {
      let room1 = rooms[k];
      let room2 = rooms[k + 1];
      connectRooms(grid, room1, room2); // might need a p.connectRooms here
    }
  
    // Generate treasure chests inside the dungeon rooms
    for (let room of rooms) {
      let chestX = p.floor(p.random(room.topLeftX + 1, room.bottomRightX - 1)); // Randomly choose X-coordinate inside the room
      let chestY = p.floor(p.random(room.topLeftY + 1, room.bottomRightY - 1)); // Randomly choose Y-coordinate inside the room
      grid[chestY][chestX] = "C"; // Mark the cell as containing a treasure chest
    }
  
    return grid;
  }

  function connectRooms(grid, room1, room2) {
    let corridorStartX = p.floor(p.random(room1.topLeftX, room1.bottomRightX));
    let corridorStartY = p.floor(p.random(room1.topLeftY, room1.bottomRightY));
    let corridorEndX = p.floor(p.random(room2.topLeftX, room2.bottomRightX));
    let corridorEndY = p.floor(p.random(room2.topLeftY, room2.bottomRightY));
  
    // Connect the rooms with a corridor
    while (corridorStartX !== corridorEndX || corridorStartY !== corridorEndY) {
      if (corridorStartX !== corridorEndX) {
        corridorStartX += corridorStartX < corridorEndX ? 1 : -1;
      } else {
        corridorStartY += corridorStartY < corridorEndY ? 1 : -1;
      }
      grid[corridorStartY][corridorStartX] = ".";
    }
  }
  
  // Variable to store the animation offset
  let animationOffset = 0;

  function drawGrid(grid) {
    p.background(128);

    // Update animation offset based on time
    animationOffset = p.millis() * 0.2; // Adjust speed as needed

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        // Autotiling Logic using functions gridCheck() and drawContext()

        // Check if the cell is a background tile
        if (gridCheck(grid, i, j, "_")) {
          // Apply animation effect to the background tiles
          let brightness = 128 + sin(animationOffset + i * 0.1 + j * 0.1) * 32; // Adjust as needed
          p.fill(brightness);

          placeTile(i, j, 22, 22); // Place background tile
        } else {
          // Check if the cell is a dungeon room border
          if (gridCheck(grid, i, j, "+")) {
            placeTile(i, j, 16, 16);
          }
          // Check if the cell is a dungeon room tile
          else if (gridCheck(grid, i, j, ".")) {
            placeTile(i, j, 1, 17); // tile for inside of the dungeon room
          }
          // Check if the cell is for a treasure chest
          else if (gridCheck(grid, i, j, "C")) {
            placeTile(i, j, 3, 29); // place treasure chest tile
          } else {
            drawContext(grid, i, j, "_", 22, 22);
          }
        }
      }
    }
  }

}

// making sketch one 
new p5(sketch1); 

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
  [1, 1],
  [0, 0],
  [1, 0],
  [0, 1],
  [2, 0],
  [0, 2],
  [2, 1],
  [1, 2],
  [2, 2],
  [3, 2],
  [2, 3],
  [3, 3],
  [3, 0],
  [0, 3],
  [3, 1],
  [1, 3],
];
