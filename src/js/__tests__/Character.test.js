/* eslint-disable no-new */
/* eslint-disable no-undef */
import Character from '../Character';
import Bowman from '../character types/Bowman';
import Daemon from '../character types/Daemon';
import Magician from '../character types/Magician';
import Swordsman from '../character types/Swordsman';
import Undead from '../character types/Undead';
import Vampire from '../character types/Vampire';

test('check new character error', () => {
  expect(() => { new Character(1, 'bowman'); }).toThrow('You can`t use Character for creating new players');
});

test('check bowman creation', () => {
  const received = new Bowman(1);
  const expected = {
    type: 'bowman',
    level: 1,
    health: 50,
    attack: 25,
    defence: 25,
    moveDistance: 2,
    attackDistance: 2,
  };
  expect(received).toEqual(expected);
});

test('check daemon creation', () => {
  const received = new Daemon(1);
  const expected = {
    type: 'daemon',
    level: 1,
    health: 50,
    attack: 10,
    defence: 40,
    moveDistance: 1,
    attackDistance: 4,
  };
  expect(received).toEqual(expected);
});

test('check magician creation', () => {
  const received = new Magician(1);
  const expected = {
    type: 'magician',
    level: 1,
    health: 50,
    attack: 10,
    defence: 40,
    moveDistance: 1,
    attackDistance: 4,
  };
  expect(received).toEqual(expected);
});

test('check swordsman creation', () => {
  const received = new Swordsman(1);
  const expected = {
    type: 'swordsman',
    level: 1,
    health: 50,
    attack: 40,
    defence: 10,
    moveDistance: 4,
    attackDistance: 1,
  };
  expect(received).toEqual(expected);
});

test('check undead creation', () => {
  const received = new Undead(1);
  const expected = {
    type: 'undead',
    level: 1,
    health: 50,
    attack: 40,
    defence: 10,
    moveDistance: 4,
    attackDistance: 1,
  };
  expect(received).toEqual(expected);
});

test('check vampire creation', () => {
  const received = new Vampire(1);
  const expected = {
    type: 'vampire',
    level: 1,
    health: 50,
    attack: 25,
    defence: 25,
    moveDistance: 2,
    attackDistance: 2,
  };
  expect(received).toEqual(expected);
});
