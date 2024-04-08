// project.js - purpose and description here
// Author: Rahamat Zaman
// Date: April 7th 2024

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
  }
}

function main() {
  // create an instance of the class
  // let myInstance = new MyProjectClass("value1", "value2");

  // call a method on the instance
  // myInstance.myMethod();

  // dataset of car information: brand, model, and year
const fillers = {
  brand: [
    "BMW",
    "Toyota",
    "Tesla",
    "Ford",
    "Honda",
    "Chevrolet",
    "Mercedes-Benz",
    "Audi",
    "Lamborghini",
    "Ferrari",
  ],
  model: [
    "X3",
    "Camry",
    "Model Y",
    "Mustang",
    "Civic",
    "Silverado",
    "E-Class",
    "A4",
    "Aventador",
    "488 GTB",
    "Accord",
    "Corvette",
    "Tacoma",
    "G-Class",
    "R8",
    "Huracan",
    "F8 Tributo",
    "RAV4",
    "3 Series",
    "Corolla",
    "S-Class",
    "Q7",
    "Urus",
    "Portofino",
  ],
  year: [
    "2022",
    "2023",
    "2024",
    "2020",
    "2021",
    "2004",
    "2015",
    "2018",
    "2019",
  ],
};

// template which showcases what is displayed on web page
const template = "Introducing the new $year $brand $model!";

// STUDENTS: You don't need to edit code below this line.

const slotPattern = /\$(\w+)/;

function replacer(match, name) {
  let options = fillers[name];
  if (options) {
    return options[Math.floor(Math.random() * options.length)];
  } else {
    return `<UNKNOWN:${name}>`;
  }
}

function generate() {
  let story = template;
  while (story.match(slotPattern)) {
    story = story.replace(slotPattern, replacer);
  }

  /* global box */
  // box.innerText = story;
  $("#box").text(story); 
}

/* global clicker */
// clicker.onclick = generate;
$("#clicker").click(generate);

generate();

}

// let's get this party started - uncomment me
main();