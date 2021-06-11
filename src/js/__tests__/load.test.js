/* eslint-disable no-undef */
import GameStateService from '../GameStateService';

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

test('check load', () => {
  const state = {
    level: 2,
    activePlayer: 1,
    position: [],
    scores: 15,
    theme: 'desert',
  };
  const stateService = new GameStateService();
  stateService.load.mockReturnValue(state);
  const received = stateService.load();
  expect(received).toEqual(state);
});
