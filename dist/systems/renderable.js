function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { System, Not } from "/web_modules/ecsy.js";
import Position from "../components/position.js";
import Sprite from "../components/sprite.js";
import { stage } from "../globals.js";
import DisplayObject from "../components/displayObject.js";

class RenderableSystem extends System {
  init() {}

  execute(delta, time) {
    this.queries.renderables.results.forEach(
    /** @param {ecsy.Entity} e */
    e => {
      let pos = e.getComponent(Position);
      let {
        graphics
      } = e.getComponent(DisplayObject);
      graphics.position.set(pos.x, pos.y);
    });
    this.queries.spriteAdded.results.forEach(
    /** @param {ecsy.Entity} e */
    e => {
      let pos = e.getComponent(Position);
      let {
        graphics
      } = e.getComponent(Sprite);
      e.addComponent(DisplayObject, {
        graphics
      });
      graphics.position.set(pos.x, pos.y);
      stage.addChild(graphics);
    });
    this.queries.spriteRemoved.results.forEach(
    /** @param {ecsy.Entity} e */
    e => {
      let {
        graphics
      } = e.getComponent(DisplayObject);
      stage.removeChild(graphics);
      e.removeComponent(DisplayObject);
    });
  }

}

_defineProperty(RenderableSystem, "queries", {
  renderables: {
    components: [Position, DisplayObject]
  },
  spriteAdded: {
    components: [Sprite, Not(DisplayObject), Position]
  },
  spriteRemoved: {
    components: [Not(Sprite), DisplayObject]
  }
});

export default RenderableSystem;