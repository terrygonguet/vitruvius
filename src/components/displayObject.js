import { SystemStateComponent } from "ecsy"

class DisplayObject extends SystemStateComponent {
  /** @type {PIXI.Graphics} */
  graphics = null
  reset() {
    this.graphics = null
  }
}

export default DisplayObject
