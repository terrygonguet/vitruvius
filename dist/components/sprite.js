function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Component } from "/web_modules/ecsy.js";

class Sprite extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "graphics", null);
  }

  reset() {
    this.graphics = null;
  }

}

export default Sprite;