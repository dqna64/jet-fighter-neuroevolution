function squisher(x) {
  return log(x/(1-x))
}

class JetFighter {
  constructor(brain=null) {
    this.r = 6;
    this.pos = createVector(random(BOUNDS, width-BOUNDS), random(BOUNDS, height-BOUNDS));
    this.vel = createVector(random(), random());
    this.acc = createVector();
    this.maxSpeed = 9;
    this.maxForce = 3;
    this.sightRange = 200;

    this.timer = 0;
    this.dead = false;
    this.score = 0;
    this.fitness = 0;

    this.rays = [];
    for (let a = -60; a <= 60; a+=30) {
      this.rays.push(new Ray(this.pos, this.vel, radians(a), this.sightRange));
    }
    this.bullets = [];
    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(this.rays.length + 2, 8, 3);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update(inputs) {
    this.steer(inputs);

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed)
    this.pos.add(this.vel);
    this.acc = createVector(0, 0);

    this.timer++;
    this.score++;

    for (let bullet of this.bullets) {
      bullet.update();
      bullet.show();
    }

  }

  show() {
    stroke(255);
    strokeWeight(1);
    fill(92, 222, 242);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() - PI/2);
    beginShape();
    vertex(0, this.r);
    vertex(-this.r/2, -this.r);
    vertex(this.r/2, -this.r);
    vertex(0, this.r);
    endShape(CLOSE);
    pop();

    if (showRays) {
      for (let ray of this.rays) {
        ray.show();
      }
    }
  }

  cast(walls) {
    let inputs = [];

    for (let i = 0; i < this.rays.length; i++) {
      let smallestDist = this.sightRange;
      for (let j = 0; j < walls.length; j++) {
        let point = this.rays[i].cast(walls[j]);
        if (point) {
          let curDist = p5.Vector.dist(point, this.pos);
          if (curDist < smallestDist) {
            smallestDist = curDist;
          }
        }
      }
      inputs.push(map(smallestDist, 0, this.sightRange, 1, 0));
    }
    return inputs;
  }

  target(entities) {
    for (let i = this.bullets.length-1; i >= 0; i--) {
      let bullet = this.bullets[i];
      if (bullet.distTravelled > this.sightRange) {
        this.bullets.splice(i, 1);
        this.score -= 0.1;
      } else {
        for (let j = entities.length-1; j >= 0; j--) {
          let entity = entities[j];
          let dist = p5.Vector.dist(bullet.pos, entity.pos);
          if (dist <= bullet.r + entity.r) {
            this.bullets.splice(i, 1);
            this.score += 2;
            this.timer -= TIME_REWARD;
            entity.dead = true;
            break;
          }
        }
      }
    }
  }

  sense(entities) {
    let inputs = [];
    let nearestEntityInd = null;
    let nearestDist = this.sightRange;
    for (let i = 0; i < entities.length; i++) {
      let currDist = p5.Vector.dist(entities[i].pos, this.pos);
      if (currDist < nearestDist) {
        nearestDist = currDist;
        nearestEntityInd = i;
      }
    }
    let relativePos = createVector(0, 0);
    if (nearestEntityInd) {
      relativePos = p5.Vector.sub(entities[nearestEntityInd].pos, this.pos);
    }
    relativePos.rotate(-this.vel.heading()); // Ambiguous????
    inputs.push(map(relativePos.x, -this.sightRange, this.sightRange, 0, 1));
    inputs.push(map(relativePos.y, -this.sightRange, this.sightRange, 0, 1));
    return inputs;
  }

  steer(inputs) {
    let outputs = this.brain.predict(inputs);
    let speed = map(outputs[0], 0, 1, 0, this.maxSpeed);
    let angle = squisher(outputs[1]) * 0.2;
    angle += this.vel.heading()
    let desiredVel = p5.Vector.fromAngle(angle).setMag(speed)
    let steerForce = desiredVel.sub(this.vel);
    steerForce.limit(this.maxForce);
    this.applyForce(steerForce);

    if (outputs[2] > 0.5) {
      this.shoot();
    }
  }

  shoot() {
    this.bullets.push(new Bullet(this.pos.x, this.pos.y, this.vel.heading()));
  }

  checkDeath() {
    if (this.pos.x < BOUNDS || this.pos.x > width - BOUNDS || this.pos.y < BOUNDS || this.pos.y > height - BOUNDS) {
      this.dead = true;
      this.score -= 30;
    } else if (this.timer > LIFESPAN) {
      this.dead = true;
    }
  }

  calculateFitness() {
    this.fitness = pow(2, this.score);
  }

  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }

  dispose() {
    this.brain.dispose();
  }
}
