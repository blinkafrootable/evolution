
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
    this.members = [];
    this.points = {
      baseSpeedPoints: 0,
      baseSightPoints: 0,
      baseLifePoints: 0,
      cellDivisionPoints: 0
      // intellect: 0
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
    // this.points.intellect = random(0, 10);
    this.genAttributes();
  }

  genAttributes() {
    this.baseSpeed = 0.4 + 0.17 * this.points.baseSpeedPoints;
    this.baseSightMultiplier = 1.2 + 0.25 * this.points.baseSightPoints;
    this.baseLifeSpan = 350 + 150 * this.points.baseLifePoints;
    this.cellDivisionThreshold = 25 + 5 * this.points.cellDivisionPoints;

    this.baseLifeSpan /= this.baseSpeed ** 1.75;
    this.baseSightMultiplier = this.baseSightMultiplier ** (1/this.baseSpeed);
  }

  genMutation() {
    // get all the keys in the points dict and select a random one
    let pointsKeys = Object.keys(this.points);
    let randomKey = pointsKeys[round(random(0, pointsKeys.length - 1))];
    // store the original value of a point
    let oldValue = this.points[randomKey];
    // deep copy points and a apply a random addition/subtraction on a gaussian distribution
    let newPoints = JSON.parse(JSON.stringify(this.points));
    newPoints[randomKey] = randomGaussian(oldValue, 0.25);
    // if the change made the points go below 0 or above 10
    if (newPoints[randomKey] < 0) {
      newPoints[randomKey] = 0;
    } else if (newPoints[randomKey] > 10) {
      newPoints[randomKey] = 10;
    }
    
    print(`[${randomKey}]: Old: ${oldValue}, New: ${newPoints[randomKey]}`);

    let newSpecies = new Species(this.colorHistory, false);
    for (let i = 0; i < pointsKeys.length; i++) {
      newSpecies.points[pointsKeys[i]] = newPoints[pointsKeys[i]];
    }
    newSpecies.genAttributes();

    species.push(newSpecies);
    return newSpecies;
  }

  // returns the sum of all it's members' radii
  getScore() {
    let score = 0;
    for (let i = 0; i < this.members.length; i++) {
      score += this.members[i].r;
    }
    return round(score);
  }

  timeSinceCreation() {
    return millis() - this.timeCreated;
  }
  
  addMember(member) {
    this.members.push(member);
  }
  
  removeMember(member) {
    let memberIndex = this.members.indexOf(this);
    this.members.splice(memberIndex, 1);
  }
}