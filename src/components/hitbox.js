import { Component } from "ecsy"

class Hitbox extends Component {
  /** @type {SAT.Polygon|SAT.Circle} */
  value = null
  group = Group.none

  clear() {
    this.value = null
    this.group = Group.none
  }
}

export class Group {
  static enemies = new Group("enemies")
  static player = new Group("player")
  static enemybullet = new Group("enemybullet")
  static playerbullet = new Group("playerbullet")
  static none = new Group("none")

  constructor(label) {
    this.label = label
  }

  toString() {
    return `Group(${this.label})`
  }
}

export default Hitbox
