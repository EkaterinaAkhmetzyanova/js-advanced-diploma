import Character from '../Character';

export default class Bowman extends Character {
  constructor(...param) {
    super(...param);
    this.type = 'bowman';
    this.attack = 25;
    this.defence = 25;
    this.moveDistance = 2;
    this.attackDistance = 2;
  }
}
