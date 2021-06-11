/* eslint-disable no-undef */
import Daemon from '../character types/Daemon';

test('check tooltip', () => {
  const daemon = new Daemon(2);
  daemon.health = 50;
  const icons = {
    level: '\u{1F396}',
    attack: '\u{2694}',
    defence: '\u{1F6E1}',
    health: '\u{2764}',
  };
  const received = `${icons.level}${daemon.level}${icons.attack}${daemon.attack}${icons.defence}${daemon.defence}${icons.health}${daemon.health}`;
  const expected = '\u{1F396}2\u{2694}10\u{1F6E1}40\u{2764}50';
  expect(received).toBe(expected);
});
