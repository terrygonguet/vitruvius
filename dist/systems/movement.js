function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { System } from "/web_modules/ecsy.js";
import Position from "../components/position.js";
import Velocity from "../components/velocity.js";

class MovementSystem extends System {
  init() {}

  execute(delta, time) {
    this.queries.movables.results.forEach(
    /** @param {ecsy.Entity} e */
    e => {
      let pos = e.getMutableComponent(Position);
      let vel = e.getComponent(Velocity);
      pos.scaleAndAdd(vel, delta);
    });
  }

}

_defineProperty(MovementSystem, "queries", {
  movables: {
    components: [Position, Velocity]
  }
});

export default MovementSystem;