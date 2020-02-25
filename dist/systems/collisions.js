function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { System } from "/web_modules/ecsy.js";
import SAT from "/web_modules/sat.js";
import Position from "../components/position.js";
import Hitbox from "../components/hitbox.js";
import EventTarget from "../components/eventTarget.js";

class CollisionSystem extends System {
  init() {}

  execute(delta, time) {
    /** @type {ecsy.Entity[]} */
    let collidables = this.queries.collidables.results;
    /** @type {Map<string, { a: ecsy.Entity, b: ecsy.Entity }>} */

    let pairs = new Map(),
        key;

    for (const a of collidables) {
      for (const b of collidables) {
        if (a == b) continue;
        key = a.id < b.id ? "".concat(a.id, "_").concat(b.id) : "".concat(b.id, "_").concat(a.id);
        if (!pairs.has(key)) pairs.set(key, {
          a,
          b
        });
      }
    }

    let res = new SAT.Response();
    pairs.forEach(({
      a,
      b
    }) => {
      let evta = a.getComponent(EventTarget);
      let evtb = b.getComponent(EventTarget);
      if (!evta && !evtb) return; // if neither can emit events this is useless

      let {
        value: hba,
        group: groupa
      } = a.getComponent(Hitbox);
      let {
        value: hbb,
        group: groupb
      } = b.getComponent(Hitbox);
      if (groupa == groupb) return; // entities from the same group don't collide

      let posa = a.getComponent(Position);
      let posb = b.getComponent(Position);
      hba.pos.copy(posa);
      hbb.pos.copy(posb);
      res.clear();
      let method = "test".concat(hba.r ? "Circle" : "Polygon").concat(hbb.r ? "Circle" : "Polygon");

      if (SAT[method](hba, hbb, res)) {
        evta === null || evta === void 0 ? void 0 : evta.dispatchEvent(new CustomEvent("collide", {
          detail: {
            entity: a,
            other: b,
            response: res
          }
        }));
        evtb === null || evtb === void 0 ? void 0 : evtb.dispatchEvent(new CustomEvent("collide", {
          detail: {
            entity: b,
            other: a,
            response: res
          }
        }));
      }
    });
  }

}

_defineProperty(CollisionSystem, "queries", {
  collidables: {
    components: [Position, Hitbox]
  }
});

export default CollisionSystem;