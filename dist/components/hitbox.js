function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Component } from "/web_modules/ecsy.js";

class Hitbox extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "value", null);

    _defineProperty(this, "group", Group.none);
  }

  clear() {
    this.value = null;
    this.group = Group.none;
  }

}

export class Group {
  constructor(label) {
    this.label = label;
  }

  toString() {
    return "Group(".concat(this.label, ")");
  }

}

_defineProperty(Group, "enemies", new Group("enemies"));

_defineProperty(Group, "player", new Group("player"));

_defineProperty(Group, "enemybullet", new Group("enemybullet"));

_defineProperty(Group, "playerbullet", new Group("playerbullet"));

_defineProperty(Group, "none", new Group("none"));

export default Hitbox;