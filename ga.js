

function nextGeneration() {
  calculateFitness();

  for (let i = 0; i < POP_SIZE; i++) {
    population[i] = pickOne();
  }
  for (let i = 0; i < savedPop.length; i++) {
    savedPop[i].dispose()
  }
  savedPop = [];
  genCount++;
  console.log('\n=========================\nStarting generation ' + genCount);
}

function pickOne() {
  let index = 0;
  let r = random(1);
  while (r > 0) {
    r = r - savedPop[index].fitness;
    index++;
  }
  index--;
  let jetFighter = savedPop[index];
  let child = new JetFighter(jetFighter.brain);
  child.mutate();
  return child;
}

function calculateFitness() {
  let sum = 0;
  let highestScore = -Infinity;
  let highestFitness = -Infinity;
  for (let jetFighter of savedPop) {
    jetFighter.calculateFitness();
    sum += jetFighter.fitness;
  }
  for (let jetFighter of savedPop) {
    if (jetFighter.score > highestScore) {
      highestScore = jetFighter.score;
    }
    if (jetFighter.fitness > highestFitness) {
      highestFitness = jetFighter.fitness;
    }
    jetFighter.fitness = jetFighter.fitness / sum; // Normalize fitness values
  }
  console.log("Highest score: " + highestScore)
  console.log("Highest fitness: " + highestFitness)
}
