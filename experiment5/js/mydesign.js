/* exported getInspirations, initDesign, renderDesign, mutateDesign */

function getInspirations() {
    return [
      {
        name: "Village Road in Bangladesh", 
        assetUrl: "img/bangladesh-landscape.jpg",
        credit: "Village road of Bangladesh during sunset, Arlo Magicman"
      },
      {
        name: "Sunset", 
        assetUrl: "img/sunset.jpg",
        credit: "Red sunset, magann"
      },
      {
        name: "London", 
        assetUrl: "img/london-landscape.jpg",
        credit: "London, United Kingdom - The bank district of central London with famous skyscrapers, zgphotography"
      },
    ];
  }
  
  function initDesign(inspiration) {
    // reshapes your drawing canvas to something with the same shape as the inspiring image.

    // set the canvas size based on the container
    let canvasContainer = $('.image-container'); // Select the container using jQuery
    let canvasWidth = canvasContainer.width(); // Get the width of the container
    let aspectRatio = inspiration.image.height / inspiration.image.width;
    let canvasHeight = canvasWidth * aspectRatio; // Calculate the height based on the aspect ratio
    resizeCanvas(canvasWidth, canvasHeight);
    $(".caption").text(inspiration.credit); // Set the caption text

    // add the original image to #original
    const imgHTML = `<img src="${inspiration.assetUrl}" style="width:${canvasWidth}px;">`
    $('#original').empty();
    $('#original').append(imgHTML);
    
    let design = {
      bg: 128,
      fg: []
    }
    
    for(let i = 0; i < 50; i++) {
      design.fg.push({x: random(width), y: random(height), w: random(width/2), h: random(height/2), fill: random(255)})
    }
    return design;
  }
  
  function renderDesign(design, inspiration) {
    background(design.bg); // Set the background color
    noStroke(); 
    
    // starter code
    // for(let box of design.fg) {
    //   fill(box.fill, 128);
    //   rect(box.x, box.y, box.w, box.h);
    // }
    
    // Draw foreground elements
    for (let i = 0; i < design.fg.length; i++) {
      let element = design.fg[i];
      let pixelColor = inspiration.image.get(floor(element.x), floor(element.y)); // Get color from the inspiration image
      fill(pixelColor); // Set fill color to the color from the inspiration image
      rect(element.x, element.y, element.w, element.h); // Draw rectangle
    }
  }
  
  function mutateDesign(design, inspiration, rate) {
    // Mutate background color
    design.bg = mut(design.bg, 0, 255, rate);
    
    // Mutate foreground elements
    for (let i = 0; i < design.fg.length; i++) {
      design.fg[i].x = mut(design.fg[i].x, 0, width, rate);
      design.fg[i].y = mut(design.fg[i].y, 0, height, rate);
      design.fg[i].w = mut(design.fg[i].w, 0, width / 2, rate);
      design.fg[i].h = mut(design.fg[i].h, 0, height / 2, rate);
      design.fg[i].fill = mut(design.fg[i].fill, 0, 255, rate);
    }
  }
  
  function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
  }