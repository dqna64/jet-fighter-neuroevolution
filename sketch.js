
let showRays = true;
let genCount = 1;
let CYCLES = 1;

const BOUNDS = 20;
const POP_SIZE = 4;
const LIFESPAN = 200;
const MUTATION_RATE = 0.05;
const TIME_REWARD = 10;

let population = [];
let savedPop = [];
let boundaries = [];

function setup() {
  createCanvas(1280, 720);
  for (let i = 0; i < POP_SIZE; i++) {
    population.push(new JetFighter);
  }

  boundaries.push(new Boundary(BOUNDS, BOUNDS, width-BOUNDS, BOUNDS));
  boundaries.push(new Boundary(width-BOUNDS, BOUNDS, width-BOUNDS, height-BOUNDS));
  boundaries.push(new Boundary(width-BOUNDS, height-BOUNDS, BOUNDS, height-BOUNDS));
  boundaries.push(new Boundary(BOUNDS, height-BOUNDS, BOUNDS, BOUNDS));

}

function draw() {
  background(20);

  for (let i = 0; i < CYCLES; i++) {
    // Update each jetFighter
    for (let i = 0; i < population.length; i++) {
      let jetFighter = population[i];
      let inputs = [];
      inputs = inputs.concat(jetFighter.cast(boundaries));
      let otherFighters = [...population]; // Shaky solution to deep-copying array - potential array items will not be deep-copied
      otherFighters.splice(i, 1);
      inputs = inputs.concat(jetFighter.sense(otherFighters));
      jetFighter.update(inputs);
      jetFighter.target(otherFighters);
    }

    for (let i = population.length-1; i >= 0; i--) {
      let jetFighter = population[i];
      jetFighter.checkDeath();
      if (jetFighter.dead) {
        savedPop.push(population.splice(i, 1)[0]);
      }
    }

    // Genetic algorithm
    if (population.length === 0) {
      nextGeneration();
    }
  }

  // Display
  for (let jetFighter of population) {
    jetFighter.show();
  }
  // for (let boundary of boundaries) {
  //   boundary.show();
  // }

}

loopBool = true;
function keyPressed() {
  if (key === " ") {
    if (loopBool) {
      noLoop();
      loopBool = !loopBool;
    } else {
      loop();
      loopBool = !loopBool;
    }
  } else if (key == 'r') {
    showRays = !showRays;
  }
}
