import { System } from "ecsy"
import EventTarget from "../components/eventTarget.js"

class TickerSystem extends System {
  static queries = {
    eventEmitters: {
      components: [EventTarget],
    },
  }

  init() {}

  execute(delta, time) {
    this.queries.eventEmitters.results.forEach(
      /** @param {ecsy.Entity} e */
      e => {
        let evtg = e.getComponent(EventTarget)
        evtg.dispatchEvent(
          new CustomEvent("tick", { detail: { entity: e, delta, time } }),
        )
      },
    )
  }
}

export default TickerSystem
