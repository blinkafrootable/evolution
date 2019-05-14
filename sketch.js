let food = [];
let species = [];
let creatures = [];
let waste = []
let objectCount = 150;
let speciesCount = 5;
let colors = []

let speciesNumber = 1;

function setup() {
  p5.disableFriendlyErrors = true; // disables FES
  frameRate(60);
  // make sure this is ran before initializing creatures
  createCanvas(windowWidth, windowHeight); 

  // initialize colors
  for (let i = 0; i <= 255; i += 15) { 
    colors.push([i, 255, 255]);
    colors.push([i, 255, 122]);
  }

  // create species
  for (let i = 0; i < speciesCount; i++) { 
    species.push(new Species(null, true));
  }

  // create food and creatures
  for (let i = 0; i < objectCount; i++) { 
    food.push(new Food());
    food.push(new Food());
    let randSpecies = species[round(random(0, species.length - 1))];
    let creature = new Creature(randSpecies);
    creatures.push(creature);
  }

}

function draw() {
  background(220);

  // update objects
  for (let i = 0; i < waste.length; i++) {
    waste[i].update();
  }

  for (let i = 0; i < food.length; i++) {
    food[i].update();
  }

  for (let i = 0; i < creatures.length; i++) {
    if (creatures[i].eaten === true) {
      creatures[i].die();
    }
    if (creatures[i].dead === true) {
      creatures.splice(i, 1);
      i--;
      continue;
    }
    creatures[i].update(food.concat(waste).concat(creatures));

  }

  // check food sources
  for (let i = 0; i < food.length; i++) {
    if (food[i].eaten === true) {
      // cap waste limit to 2 times the number of creatures on screen (or else the screen gets crowded)
      if (waste.length < creatures.length * 2) { 
        waste.push(new Waste(food[i].pos.x, food[i].pos.y));
      }
      food.splice(i, 1);
      i--;
    }
  }
  for (let i = 0; i < waste.length; i++) {
    if (waste[i].eaten === true) {
      waste.splice(i, 1);
      i--;
    }
  }

  // # of frames between food being added >= 1, # of frames = 10 - (# of creatures)/5
  if (frameCount % max(1, (10 - round(creatures.length) / 5)) === 0) {
    food.push(new Food());
  }

  // show score list
  let scores = getScores();
  push();
  fill(0, 0, 0, 40);
  noStroke();
  rect(0, 0, 110, 20*(scores.length+1));
  pop();
  for (let i = 0; i < scores.length; i++) {
    push()
    colorMode(HSB);
    let color = scores[i][0].colorHistory[0];
    fill(color[0], color[1], color[2]);
    text(`Species ${scores[i][0].speciesNumber}: ${scores[i][1]}`, 10, 20 + 20*i);
    pop();
  }

  if (creatures.length === 1) {
    frameRate(0);
  }

}

// gets an unused species color
function getAvailableColor() {
  if (species.length === 0) return colors[round(random(0, colors.length - 1))];
  let taken = [];
  for (let i = 0; i < species.length; i++) {
    taken.push(species[i].color);
  }
  let available = colors.filter((value, index, arr) => {
    return taken.indexOf(value) === -1;
  });
  let availableColor = available[round(random(0, available.length - 1))];

  return availableColor;
}

// fetches and orders the scores in ascending order (dictionary because the associated species is attatched to the score)
function getScores() {
  // 2D array storing species and their scores (not a map/dictionary so that it can be sorted)
  let scores = [];
  for (let i = 0; i < species.length; i++) {
    scores.push([species[i], species[i].getScore()]);
  }
  scores = scores.sort((first, second) => {
    return second[1] - first[1];
  });

  return scores;
}