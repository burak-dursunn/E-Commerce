const sum = require('../controllers/sum');

test('1+2 should equal to 3', () => {
    expect(sum(1,2)).toBe(3);
});
