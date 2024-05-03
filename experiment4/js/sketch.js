// sketch.js - creates three interactive infinite worlds where users can dynamically interact with grass, 
// ocean life, and desert elements, each customizable using a world key.
// Author: Rahamat Zaman
// Date: May 1st 2024

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

// Grassy Infinite World Generator 
const s1 = (a) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  a.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  a.setup = function() {
    let canvas = createCanvas(800, 400);
    canvas.parent("container");

    camera_offset = new p5.Vector(-width / 2, height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (window.p3_setup) {
      window.p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    let label = createP();
    label.html("World key: ");
    label.parent("container");

    let input = createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      rebuildWorld(input.value());
    });

    createP("Arrow keys and WASD to scroll.").parent("container");
    
    // Additional text for instructions
    createP("Clicking changes tiles. By clicking the tiles you can place flowers across the infinite world").parent("container");

    rebuildWorld(input.value());
  }

  function rebuildWorld(key) {
    if (window.p3_worldKeyChanged) {
      window.p3_worldKeyChanged(key);
    }
    tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
    tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(height / (tile_height_step_main * 2));
  }
  
  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );
  
    if (window.p3_tileClicked) {
      window.p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  a.draw = function() {
    // Keyboard controls!
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    background(100);

    if (window.p3_drawBefore) {
      window.p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (window.p3_drawAfter) {
      window.p3_drawAfter();
    }
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    a.push();
    a.translate(screen_x, screen_y);
    if (window.p3_drawSelectedTile) {
      window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    a.pop();
  }
  
  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    a.push();
    a.translate(0 - screen_x, screen_y);
    if (window.p3_drawTile) {
      window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    a.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    a.push();
    a.translate(0 - screen_x, screen_y);
    if (window.p3_drawTile) {
      window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    a.pop();
  }

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */

  // let grassImage;

  const grassBackground = '#62bc2f'; 

  function p3_preload() {
    // Load the grass image
    // grassImage = loadImage("grass3.png");
  }

  function p3_setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container1");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container1");
  }

  let worldSeed;

  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    noiseSeed(worldSeed);
    randomSeed(worldSeed);
  }

  function p3_tileWidth() {
    return 32;
  }
  function p3_tileHeight() {
    return 16;
  }

  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

  let clicks = {};

  function p3_tileClicked(i, j) {
    let key = [i, j];
    clicks[key] = 1 + (clicks[key] | 0);
  }
  
  function p3_drawBefore() {
    // Draw the grass image as the background
    // image(grassImage, 0, 0, width, height);
    
    // grass
    a.background(grassBackground); 
  }
  
  function p3_drawTile(i, j) {
    a.noStroke();
  
    if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
      a.fill(240, 200);
    } else {
      a.fill(255, 200);
    }
  
  //   push();
  
      // Code for dark and light tiles 
      // beginShape();
      // vertex(-tw, 0);
      // vertex(0, th);
      // vertex(tw, 0);
      // vertex(0, -th);
      // endShape(CLOSE);
  
  //   pop();
    
    // Check if the tile was clicked
    let n = clicks[[i, j]] | 0;
    if (n % 2 == 1) {
      // Draw a flower if clicked
      a.fill(255, 0, 200);
      a.ellipse(0, 0, 20, 20);
      a.fill(255, 255, 0);
      a.ellipse(0, -10, 10, 10);
    }
  }
  
  function p3_drawSelectedTile(i, j) {
    a.noFill();
    a.stroke(0, 255, 0, 128);
    
    a.beginShape();
    a.vertex(-tw, 0);
    a.vertex(0, th);
    a.vertex(tw, 0);
    a.vertex(0, -th);
    a.endShape(CLOSE);
  
    // Display tile coordinates
    a.noStroke();
    a.fill(0);
    a.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {
    // draws a frame-rate counter message
    a.text("Frame Rate: " + frameRate(),20,20);
  }
  
}

// Ocean - Sea Infinite World Generator
const s2 = (b) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  b.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  b.setup = function() {
    let canvas = createCanvas(800, 400);
    canvas.parent("container");

    camera_offset = new p5.Vector(-width / 2, height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (window.p3_setup) {
      window.p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    let label = createP();
    label.html("World key: ");
    label.parent("container");

    let input = createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      rebuildWorld(input.value());
    });

    createP("Arrow keys and WASD to scroll. Clicking changes tiles.").parent("container");
    
    // Additional text for instructions
    createP("Clicking changes tiles. By clicking the tiles you can place fish across the infinite world").parent("container");

    rebuildWorld(input.value());
  }

  function rebuildWorld(key) {
    if (window.p3_worldKeyChanged) {
      window.p3_worldKeyChanged(key);
    }
    tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
    tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(height / (tile_height_step_main * 2));
  }
  
  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );
  
    if (window.p3_tileClicked) {
      window.p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  b.draw = function() {
    // Keyboard controls!
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    background(100);

    if (window.p3_drawBefore) {
      window.p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (window.p3_drawAfter) {
      window.p3_drawAfter();
    }
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    b.push();
    b.translate(screen_x, screen_y);
    if (window.p3_drawSelectedTile) {
      window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    b.pop();
  }
  
  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    b.push();
    b.translate(0 - screen_x, screen_y);
    if (window.p3_drawTile) {
      window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    b.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    b.push();
    b.translate(0 - screen_x, screen_y);
    if (window.p3_drawTile) {
      window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    b.pop();
  }

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */

  const oceanBackground = '#1da2d8';

  function p3_preload() {}

  function p3_setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container2");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container2");
  }

  let worldSeed;

  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    noiseSeed(worldSeed);
    randomSeed(worldSeed);
  }

  function p3_tileWidth() {
    return 32;
  }
  function p3_tileHeight() {
    return 16;
  }

  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

  let clicks = {};

  function p3_tileClicked(i, j) {
    let key = [i, j];
    clicks[key] = 1 + (clicks[key] | 0);
  }
  
  function p3_drawBefore() {
    // ocean 
    b.background(oceanBackground); 
  }
  
  function p3_drawTile(i, j) {
    b.noStroke();
  
    if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
      b.fill(240, 200);
    } else {
      b.fill(255, 200);
    }
  
    b.push();
  
    // Code for dark and light tiles 
    // beginShape();
    // vertex(-tw, 0);
    // vertex(0, th);
    // vertex(tw, 0);
    // vertex(0, -th);
    // endShape(CLOSE);
  
    let n = clicks[[i, j]] | 0;
    if (n % 2 == 1) {
    
      // Draw fish
      let fishColor = color(255, 255, 100, 128); // Set fish color
      let fishSize = 50; // Set fish size
      let fishHeight = 20; // Set fish height
      let fishX = 0; // X-coordinate of fish relative to tile (will be translated later)
      let fishY = -10; // Y-coordinate of fish relative to tile (will be translated later)
  
      b.fill(fishColor);
      b.triangle(fishX - 30, fishY - 10, fishX - 30, fishY + 10, fishX, fishY);
      b.ellipse(fishX, fishY, fishSize, fishHeight);
      b.fill(255);
      b.ellipse(fishX + 10, fishY, 6, 6);
    }
  
    b.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    b.noFill();
    b.stroke(0, 255, 0, 128);
  
    b.beginShape();
    b.vertex(-tw, 0);
    b.vertex(0, th);
    b.vertex(tw, 0);
    b.vertex(0, -th);
    b.endShape(CLOSE);
  
    b.noStroke();
    b.fill(0);
    b.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {
    // draws a frame-rate counter message
    b.text("Frame Rate: " + frameRate(),20,20);
  }  
}

// Desert - Sandy Infinite World Generator
const s3 = (c) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  c.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  c.setup = function() {
    let canvas = createCanvas(800, 400);
    canvas.parent("container");

    camera_offset = new p5.Vector(-width / 2, height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (window.p3_setup) {
      window.p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    let label = createP();
    label.html("World key: ");
    label.parent("container");

    let input = createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      rebuildWorld(input.value());
    });

    createP("Arrow keys and WASD to scroll. Clicking changes tiles.").parent("container");
    
    // Additional text for instructions
    createP("Clicking changes tiles. By clicking the tiles you can place cactus across the infinite world").parent("container");

    rebuildWorld(input.value());
  }

  function rebuildWorld(key) {
    if (window.p3_worldKeyChanged) {
      window.p3_worldKeyChanged(key);
    }
    tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
    tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(height / (tile_height_step_main * 2));
  }
  
  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );
  
    if (window.p3_tileClicked) {
      window.p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  c.draw = function() {
    // Keyboard controls!
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    background(100);

    if (window.p3_drawBefore) {
      window.p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (window.p3_drawAfter) {
      window.p3_drawAfter();
    }
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    c.push();
    c.translate(screen_x, screen_y);
    if (window.p3_drawSelectedTile) {
      window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    c.pop();
  }
  
  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    c.push();
    c.translate(0 - screen_x, screen_y);
    if (window.p3_drawTile) {
      window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    c.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    c.push();
    c.translate(0 - screen_x, screen_y);
    if (window.p3_drawTile) {
      window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    c.pop();
  }

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */

  const desertBackground = '#FAD5A5'; 

  function p3_preload() {}

  function p3_setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container3");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container3");
  }

  let worldSeed;

  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    noiseSeed(worldSeed);
    randomSeed(worldSeed);
  }

  function p3_tileWidth() {
    return 32;
  }
  function p3_tileHeight() {
    return 16;
  }

  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

  let clicks = {};

  function p3_tileClicked(i, j) {
    let key = [i, j];
    clicks[key] = 1 + (clicks[key] | 0);
  }
  
  function p3_drawBefore() {
    // desert 
    c.background(desertBackground); 
  }
  
  function p3_drawTile(i, j) {
    c.noStroke();
  
    if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
      c.fill(240, 200);
    } else {
      c.fill(255, 200);
    }
  
    c.push();
  
    // Code for dark and light tiles 
    // beginShape();
    // vertex(-tw, 0);
    // vertex(0, th);
    // vertex(tw, 0);
    // vertex(0, -th);
    // endShape(CLOSE);
  
    let n = clicks[[i, j]] | 0;
    if (n % 2 == 1) {
      
      // fill(0, 0, 0, 32);
      // translate(0, -10); // Move to the top of the tile
  
      // Draw cactus
      // fill(50, 205, 50); // Green color for cactus
      // rect(-5, -5, 10, 30); // Stem of the cactus
      // ellipse(0, -5, 20, 20); // Top of the cactus
      
      // Cactus code and dimensions from link below: 
      // https://editor.p5js.org/jesse_harding/sketches/d1EDT9uSV
      
      // Calculate the position of the cactus relative to the tile
      let cactusX = i * tw + tw / 2; // Center of the tile horizontally
      let cactusY = j * th + th * 2; // Place cactus above the tile
  
      // Calculate the dimensions of the cactus relative to the tile
      let cactusW = tw / 2; // Width of the cactus
      let cactusH = th * 4; // Height of the cactus
  
      // draw saguaro cactus
      c.fill(140,175,40); //green fill for cactus
      //rect() using rounded corners
      
      //cactus main body
      c.rect(cactusX,cactusY,cactusW,cactusH,cactusW/2,cactusW/2,cactusW/10,cactusW/10);
  
      //cactus arm dimensions
      let cactusArmW = 5 * cactusW / 6;
  
      //cactus left arm
      c.rect(cactusX-cactusW, 16*cactusY/15, cactusArmW,cactusW*2+1,cactusArmW/2,cactusArmW/2,0,0);
      c.rect(cactusX-cactusW,16*cactusY/15 + cactusW*2,cactusW+1,cactusArmW,0,0,0,cactusW/2);
  
      //cactus right arm
      c.rect(cactusX+7*cactusW / 6, 7*cactusY/6,cactusArmW,cactusW*2+1,cactusArmW/2,cactusArmW/2,0,0);
      c.rect(cactusX+cactusW-1, 7*cactusY/6+cactusW*2, cactusW+1, cactusArmW, 0, 0, cactusW/2, 0);
              
    }
      
    // }
    c.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    c.noFill();
    c.stroke(0, 255, 0, 128);
  
    c.beginShape();
    c.vertex(-tw, 0);
    c.vertex(0, th);
    c.vertex(tw, 0);
    c.vertex(0, -th);
    c.endShape(CLOSE);
  
    c.noStroke();
    c.fill(0);
    c.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {
    // draws a frame-rate counter message
    c.text("Frame Rate: " + frameRate(),20,20);
  }  
}

// Defining Sketches

let p51 = new p5(s1, "canvas-container1");

let p52 = new p5(s2, "canvas-container2");

let p53 = new p5(s3, "canvas-container3");