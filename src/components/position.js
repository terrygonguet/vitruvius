import SAT from "sat"

class Position extends SAT.Vector {
  static isComponent = true

  reset() {
    this.x = this.y = 0
    return this
  }

  /**
   * Set vector coordinates
   * @param {number} x
   * @param {number} y
   */
  set(x, y) {
    this.x = x
    this.y = y
    return this
  }

  /**
   * Adds another vector to this one after scaling it
   * @param {Position} other
   * @param {number} scale
   */
  scaleAndAdd(other, scale) {
    return this.add(other.clone().scale(scale))
  }
}

export default Position
