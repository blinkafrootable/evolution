
class Species {

  constructor(colorHistory, isRandom) {
    this.timeCreated = millis();
    this.speciesNumber = speciesNumber;
    speciesNumber++;

    this.color = getAvailableColor();
    this.colorHistory = [this.color] //colorHistory; // array of colors, [newest - oldest] in ancestral line
    if (colorHistory != null) {
      this.colorHistory = this.colorHistory.concat(colorHistory);
    }
    this.creatures = [];
    this.points = {
      baseSpeedPoints: 0,
      baseSightPoints: 0,
      baseLifePoints: 0,
      cellDivisionPoints: 0
    };

    if (isRandom) {
      this.genRandom();
    }
  }

  genRandom() {
    this.points.baseSpeedPoints = random(0, 10);
    this.points.baseSightPoints = random(0, 10);
    this.points.baseLifePoints = random(0, 10);
    this.points.cellDivisionPoints = random(0, 10);
    this.genAttributes();
  }

  genAttributes() {
    this.baseSpeed = 0.4 + 0.17 * this.points.baseSpeedPoints;
    this.baseSightMultiplier = 1.2 + 0.25 * this.points.baseSightPoints;
    this.baseLifeSpan = 350 + 150 * this.points.baseLifePoints;
    this.cellDivisionThreshold = 25 + 5 * this.points.cellDivisionPoints;

    this.baseLifeSpan /= this.baseSpeed ** 1.75;
    this.baseSightMultiplier /= this.baseSpeed ** 1.1;
  }

  genMutation() {
    // get all the keys in the points dict and select a random one
    let pointsKeys = Object.keys(this.points);
    let randomKey = pointsKeys[round(random(0, pointsKeys.length - 1))];
    // store the original value of a point
    let oldValue = this.points[randomKey];
    // deep copy points and a apply a random addition/subtraction on a gaussian distribution
    let newPoints = JSON.parse(JSON.stringify(this.points));
    newPoints[randomKey] = randomGaussian(newPoints[oldValue], 0.25);
    // if the change made the points go below 0 or above 10
    if (newPoints[randomKey] < 0) {
      newPoints[randomKey] = 0;
    } else if (newPoints[randomKey] > 10) {
      newPoints[randomKey] = 10;
    }

    let newSpecies = new Species(this.colorHistory, false);
    for (let i = 0; i < pointsKeys.length; i++) {
      newSpecies.points[pointsKeys[i]] = newPoints[pointsKeys[i]];
    }
    newSpecies.genAttributes();

    species.push(newSpecies);
    return newSpecies;
  }

  genCreatures(num) {
    for (let i = 0; i < num; i++) {
      creatures.push(new Creature(species));
    }
  }

  // returns the sum of all it's members' radii
  getScore() {
    let score = 0;
    for (let i = 0; i < creatures.length; i++) {
      if (creatures[i].species === this) {
        score += creatures[i].r;
      }
    }
    return round(score);
  }

  timeSinceCreation() {
    return millis() - this.timeCreated;
  }
}