function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { System } from "/web_modules/ecsy.js";
import EventTarget from "../components/eventTarget.js";

class TickerSystem extends System {
  init() {}

  execute(delta, time) {
    this.queries.eventEmitters.results.forEach(
    /** @param {ecsy.Entity} e */
    e => {
      let evtg = e.getComponent(EventTarget);
      evtg.dispatchEvent(new CustomEvent("tick", {
        detail: {
          entity: e,
          delta,
          time
        }
      }));
    });
  }

}

_defineProperty(TickerSystem, "queries", {
  eventEmitters: {
    components: [EventTarget]
  }
});

export default TickerSystem;