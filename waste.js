
class Waste {
  constructor(x, y) {
    this.r = 4;
    this.pos = createVector(x, y);
    this.eaten = false;
  }
  update() {
    this.draw();
  }
  draw() {
    push();
    fill(76, 43, 17);
    ellipse(this.pos.x, this.pos.y, this.r);
    pop();
  }
}
