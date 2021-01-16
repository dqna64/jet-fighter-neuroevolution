

class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(77, 187, 235, 255);
    strokeWeight(1);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  midpoint() {
    return createVector((this.a.x + this.b.x) / 2, (this.a.y + this.b.y) / 2)
  }
}
