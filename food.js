
class Food {
  constructor() {
    this.r = 6;
    this.pos = createVector(this.r + random(0, width - this.r * 2), this.r + random(0, height - this.r * 2));
    this.eaten = false;
  }

  update() {
    this.draw();
  }

  draw() {
    push();
    fill(127, 226, 132);
    ellipse(this.pos.x, this.pos.y, this.r);
    pop();
  }
}
