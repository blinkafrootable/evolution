class Creature {

  constructor(species, location, customRadius) {
    this.species = species;
    if (customRadius === undefined)
      this.r = 10;
    else
      this.r = customRadius;
    this.color = this.species.colorHistory[0];
    if (location === undefined)
      this.pos = createVector(this.r + random(0, width - this.r * 2), this.r + random(0, height - this.r * 2));
    else
      this.pos = location;

    this.nearestFoodDirection = null;
    this.nearestFood = null;
    this.wanderAngle = random(0, 2 * PI);
    this.deltaAngle = PI / 8;
    this.deltaSize = 0.994;
    this.section = 0;
    this.timeSinceEat = 0;
    this.dead = false;
    this.lifeSpan = this.species.baseLifeSpan;
    this.hungerTolerance = 600;
    this.eaten = false;
    this.follower = null;

    this.sightRadius = this.r * this.species.baseSightMultiplier;

    this.speed = this.species.baseSpeed;
  }


  update(food) {
    this.draw();
    this.findNearestFood(food);
    this.move();
    this.eat();
    this.checkDivide();
    this.checkHunger();

    this.follower = null;
  }

  draw() {
    push();
    colorMode(HSB);
    
    // draw main circle
    fill(this.color[0], this.color[1], this.color[2], 0.5);
    ellipse(this.pos.x, this.pos.y, this.r);

    // draw the ancestry rings TODO: fix this so that older = closer to the middle
    noFill(true);
    for (let i = 0; i < this.species.colorHistory.length; i++) {
      push();
      stroke(this.species.colorHistory[i][0], this.species.colorHistory[i][1], this.species.colorHistory[i][2]);
      ellipse(this.pos.x, this.pos.y, this.r * (i * (1 / (this.species.colorHistory.length))));
      pop();
    }

    // draw the direction that the creature faces
    noFill(false);
    let dirVec = p5.Vector.fromAngle((this.nearestFoodDirection !== null && this.follower === null) ? this.nearestFoodDirection.heading() : this.wanderAngle, this.r / 2);
    line(this.pos.x, this.pos.y, this.pos.x + dirVec.x, this.pos.y + dirVec.y);

    // draw the sight circle
    stroke(0, 0, 0, 0.2);
    ellipse(this.pos.x, this.pos.y, this.sightRadius);
    pop();
  }

  findNearestFood(food) {
    this.nearestFoodDirection = null;
    this.nearestFood = null;
    let highestValue = -1;
    for (let i = 0; i < food.length; i++) {
      if (food[i].eaten === false) {
        // if it's a creature and it's bigger than 75% of this one or it's the same species or it's color history includes this species' and it was created within 30 seconds then pass it up
        if (food[i] instanceof Creature && (food[i].r > this.r * 0.75 || food[i].species == this.species || food[i].species.colorHistory.indexOf(this.color) !== -1 && food[i].species.timeSinceCreation() / 1000 <= 30)) {
          continue;
        }
        if (food[i] instanceof Waste) {
          // after a creature reaches its hungerTolerance (gets too hungry) and it's too small to shrink, it'll resort to eating waste
          if (this.timeSinceEat > this.hungerTolerance) {
            if (this.r > 20) {
              continue;
            }
          } else {
            continue;
          }
        }
        // calculate the value (radius gain)/(distance)^1.5 TODO: if the food is a creature and the current target is a creature, only select the food if its radius is 10 bigger than the current target's radius
        let distance = this.pos.dist(food[i].pos);
        let radiusGain = (food[i] instanceof Creature) ? food[i].r * 0.25 : 2;
        let value = (radiusGain) / (distance ** 1.5);
        if (value > highestValue && distance <= this.sightRadius / 2) {
          if (food[i] instanceof Creature && this.nearestFood instanceof Creature && food[i].r < this.nearestFood.r + 10) {
            continue;
          }
          // set the nearest food and the direction it's in
          this.nearestFoodDirection = p5.Vector.sub(food[i].pos, this.pos).normalize();
          this.nearestFood = food[i];
          highestValue = value;
        }
      }
    }
    // if the target is a Creature, then set its follower to be this one
    if (this.nearestFood instanceof Creature) {
      this.nearestFood.follower = this;
    }
  }

  move() { // TODO: tidy up move method
    // get the region of the creature in the map
    let region = this.getRegion();
    // if the the creature is being followed and is in the main section of the map, then move direction away from it //TODO: add smart movement (multiple followers + move in the average direction away + turn near walls)
    if (region === 'Main' && this.follower !== null /*&& this.pos.dist(this.follower.pos) <= this.r/2*/) {
      this.wanderAngle = this.follower.nearestFoodDirection.heading();
      let moveDirection = p5.Vector.fromAngle(this.wanderAngle, 1);
      this.pos = p5.Vector.add(this.pos, moveDirection.mult(this.speed));
    // if there's food, then go towards it
    } else if (this.nearestFoodDirection !== null) {
      this.pos = p5.Vector.add(this.pos, this.nearestFoodDirection.mult(this.speed));
      // move in accordance of the region that the creature is in
    } else {
      if (region === 'Right') {
        this.wanderAngle += this.getAngle(this.wanderAngle, PI);
      } else if (region === 'Left') {
        this.wanderAngle += this.getAngle(this.wanderAngle, 0);
      } else if (region === 'Top') {
        this.wanderAngle += this.getAngle(this.wanderAngle, PI / 2);
      } else if (region === 'Bottom') {
        this.wanderAngle += this.getAngle(this.wanderAngle, (3 * PI) / 2);
      } else if (region === 'TopRight') {
        this.wanderAngle += this.getAngle(this.wanderAngle, (3 * PI) / 4);
      } else if (region === 'TopLeft') {
        this.wanderAngle += this.getAngle(this.wanderAngle, (PI) / 4);
      } else if (region === 'BottomRight') {
        this.wanderAngle += this.getAngle(this.wanderAngle, (5 * PI) / 4);
      } else if (region === 'BottomLeft') {
        this.wanderAngle += this.getAngle(this.wanderAngle, (7 * PI) / 4);
      } else {
        if (this.follower === null) {
          this.wanderAngle += random(-PI / 16, PI / 16);
        }
      }
      this.section = region;
      let moveDirection = p5.Vector.fromAngle(this.wanderAngle, 1);
      this.pos = p5.Vector.add(this.pos, moveDirection.mult(this.speed));
    }
  }

  eat() {
    if (this.nearestFood !== null && this.nearestFood.eaten === false) {
      let distance = p5.Vector.dist(this.pos, this.nearestFood.pos);
      let foodIsCreature = this.nearestFood instanceof Creature;
      // TODO: make this more intuitive and functional (has to deal with the distance that the food has to be in order to be eaten)
      if ((this.r + this.nearestFood.r) / (foodIsCreature ? 4 : 2) > distance) {
        this.nearestFood.eaten = true;
        this.timeSinceEat = 0;
        // if the food is waste, then degrease the lifespan of the creature TODO: keep track of this to apply it to calculateStats()
        if (this.nearestFood instanceof Waste) {
          this.lifeSpan *= 0.9;
          this.hungerTolerance *= 0.9;
        }
        // if creature, then add 1/4 of that creature's radius
        if (this.nearestFood instanceof Creature) {
          this.r += this.nearestFood.r * 0.25;
        } else {
          this.r += 2;
        }
        this.calculateStats();
        return;
      }
    }
    this.timeSinceEat += 1;
  }

  getAngle(current, target) {
    // limit the current angle to be a range from -2pi to 2pi
    let limCurrent = current % (2 * PI);
    // if the angle negative, then make it equal 2pi - the absoluate value of the angle (which makes it the same angle but positive instead of negative)
    if (limCurrent < 0) {
      limCurrent = 2 * PI - abs(limCurrent);
    }
    // if you have to loop past 2pi in order to reach the target, then add 2pi to the target to make it mathmatically work
    if (limCurrent > PI && target < PI) {
      target += 2 * PI;
    }
    // get the shorted distance (turning left or right) and return the appropriate rotation direction
    let diff1 = abs(abs(limCurrent - this.deltaAngle) - target);
    let diff2 = abs(abs(limCurrent + this.deltaAngle) - target);
    return (diff1 < diff2) ? -this.deltaAngle : this.deltaAngle;
  }

  getRegion() { // returns the section(s) of the map that the creature is in
    let sections = '';
    if (this.pos.y < 25) {
      sections += 'Top';
    }
    if (this.pos.y > height - 25) {
      sections += 'Bottom';
    }
    if (this.pos.x > width - 25) {
      sections += 'Right';
    }
    if (this.pos.x < 25) {
      sections += 'Left';
    }
    if (sections === '') {
      sections = 'Main';
    }
    return sections;
  }

  checkHunger() {
    if (this.timeSinceEat > this.lifeSpan) {
      // if the creature is big enough to shrink, then shrink or else it dies
      if (this.r >= 20) {
        this.r *= 0.75;
        this.calculateStats();
        this.timeSinceEat = 0;
      } else {
        this.die();
      }
    }
  }

  die() {
    this.dead = true;
    // see if the creature is the last of its species
    let numSameSpecies = 0;
    for (let i = 0; i < creatures.length; i++) {
      if (creatures[i] !== this && creatures[i].species === this.species) {
        numSameSpecies++;
        break;
      }
    }
    // if the creature is the last one then take this species out of the species list
    if (numSameSpecies === 0) {
      species = species.filter((value) => {
        return value !== this.species;
      });
    }
  }

  checkDivide() {
    if (this.r >= this.species.cellDivisionThreshold && this.follower === null && this.nearestFood instanceof Creature === false || this.r >= this.species.cellDivisionThreshold * 2) {
      if (random(0, 100) <= 1) { // 1 in 100 chance of dividing every frame following threshold met
        if (this.insideAnotherCreature() === false || this.r >= this.species.cellDivisionThreshold * 2) {
          this.divide();
        }
      }
    }
  }

  divide() {
    let newCreature = null;
    if (random(0, 6) <= 1) { // 1 in 6 change of a mutation
      newCreature = new Creature(this.species.genMutation(), this.pos, this.r / 2);
    } else { // otherwise just divide
      newCreature = new Creature(this.species, this.pos, this.r / 2);
    }
    creatures.push(newCreature);
    this.r /= 2;
    this.calculateStats();
  }

  insideAnotherCreature() {
    for (let i = 0; i < creatures.length; i++) {
      if (creatures[i] !== this && creatures[i].species !== this.species && this.pos.dist(creatures[i].pos) <= creatures[i].r / 2 + this.r / 2) {
        return true;
      }
    }
    return false;
  }

  calculateStats() {
    this.lifeSpan = this.species.baseLifeSpan * (0.99 ** ((this.r - 10) / 2));
    this.speed = this.species.baseSpeed * (this.deltaSize ** ((this.r - 10)));
    this.sightRadius = this.r * this.species.baseSightMultiplier;
  }
}