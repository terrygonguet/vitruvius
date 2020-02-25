function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import SAT from "/web_modules/sat.js";

class Position extends SAT.Vector {
  reset() {
    this.x = this.y = 0;
    return this;
  }
  /**
   * Set vector coordinates
   * @param {number} x
   * @param {number} y
   */


  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  /**
   * Adds another vector to this one after scaling it
   * @param {Position} other
   * @param {number} scale
   */


  scaleAndAdd(other, scale) {
    return this.add(other.clone().scale(scale));
  }

}

_defineProperty(Position, "isComponent", true);

export default Position;