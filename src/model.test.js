import Game from './model';

test('basic test', () => {
  expect(new Game()).not.toBe(undefined);
});
