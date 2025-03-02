const { EnhancedNaturalMatcher, match, isMatch, matchGroup } = require('../index');

// Test cases - pairs of names that should match
const matchingPairs = [
  ['John Smith', 'Smith, John'],
  ['William Jones', 'Bill Jones'],
  ['Robert Johnson', 'Bob Johnson'],
  ['Aaron Charles Donovan', 'Aaron Donovan'],
  ['Michael Jackson', 'Michael Jackson Jr'],
  ['James Chaney', 'Jim Chaney'],
  ['Jessica Elizondo', 'Jessica William Elizondo'],
  ['Ander Herrera', 'Herrera Ander'],
  ['Chelsea M Solomon', 'Chelsea Mary-Elizabeth Solomon']
];

// Test cases - pairs of names that should not match
const nonMatchingPairs = [
  ['Henry Jackson', 'Howard Jackson'],
  ['Robert Johnson', 'Robert Williams'],
  ['Michael Davis', 'Nicole Davis'],
  ['James Brown', 'James Rodriguez'],
  ['Thomas Anderson', 'Andy Thomas']
];

// Test groups - each group should match internally
const nameGroups = [
  ['Aaron Charles Donovan', 'Aaron Donovan', 'Donovan Aaron Charles'],
  ['Emily Farris', 'Emily Tigist Ferede Farris', 'Farris Emily Tigist Ferede'],
  ['Tiffany Nash', 'Nash Tiffany M']
];

describe('EnhancedNaturalMatcher', () => {
  const matcher = new EnhancedNaturalMatcher({ threshold: 0.75 });
  
  describe('getSimilarity', () => {
    test('returns 1 for identical names', () => {
      expect(matcher.getSimilarity('John Smith', 'John Smith')).toBe(1);
    });
    
    test('returns 0 for empty or null names', () => {
      expect(matcher.getSimilarity('', '')).toBe(0);
      expect(matcher.getSimilarity(null, 'John')).toBe(0);
      expect(matcher.getSimilarity('John', '')).toBe(0);
    });
    
    test('handles matching pairs correctly', () => {
      matchingPairs.forEach(([name1, name2]) => {
        const score = matcher.getSimilarity(name1, name2);
        expect(score).toBeGreaterThanOrEqual(0.75);
      });
    });
    
    test('handles non-matching pairs correctly', () => {
      nonMatchingPairs.forEach(([name1, name2]) => {
        const score = matcher.getSimilarity(name1, name2);
        expect(score).toBeLessThan(0.75);
      });
    });
  });
  
  describe('isMatch', () => {
    test('returns true for matching pairs', () => {
      matchingPairs.forEach(([name1, name2]) => {
        expect(matcher.isMatch(name1, name2)).toBe(true);
      });
    });
    
    test('returns false for non-matching pairs', () => {
      nonMatchingPairs.forEach(([name1, name2]) => {
        expect(matcher.isMatch(name1, name2)).toBe(false);
      });
    });
    
    test('respects custom threshold', () => {
      const strictMatcher = new EnhancedNaturalMatcher({ threshold: 0.9 });
      const lenientMatcher = new EnhancedNaturalMatcher({ threshold: 0.5 });
      
      // This pair should match with lenient but not strict threshold
      expect(strictMatcher.isMatch('Michael Johnson', 'Mike Johnson')).toBe(false);
      expect(lenientMatcher.isMatch('Michael Johnson', 'Mike Johnson')).toBe(true);
    });
  });
  
  describe('matchNameGroup', () => {
    test('handles empty groups', () => {
      expect(matcher.matchNameGroup([])).toEqual({
        score: 1,
        matches: [],
        isMatch: true
      });
    });
    
    test('handles single-name groups', () => {
      expect(matcher.matchNameGroup(['John Smith'])).toEqual({
        score: 1,
        matches: [],
        isMatch: true
      });
    });
    
    test('correctly identifies matching name groups', () => {
      nameGroups.forEach(group => {
        const result = matcher.matchNameGroup(group);
        expect(result.isMatch).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(0.75);
      });
    });
    
    test('provides detailed match information', () => {
      const result = matcher.matchNameGroup(['John Smith', 'Johnny Smith']);
      expect(result.matches.length).toBe(1);
      expect(result.matches[0]).toHaveProperty('name1', 'John Smith');
      expect(result.matches[0]).toHaveProperty('name2', 'Johnny Smith');
      expect(result.matches[0]).toHaveProperty('similarity');
    });
  });
});

describe('Convenience Functions', () => {
  test('match returns correct similarity scores', () => {
    matchingPairs.forEach(([name1, name2]) => {
      expect(match(name1, name2)).toBeGreaterThanOrEqual(0.75);
    });
    
    nonMatchingPairs.forEach(([name1, name2]) => {
      expect(match(name1, name2)).toBeLessThan(0.75);
    });
  });
  
  test('isMatch correctly identifies matching pairs', () => {
    matchingPairs.forEach(([name1, name2]) => {
      expect(isMatch(name1, name2)).toBe(true);
    });
    
    nonMatchingPairs.forEach(([name1, name2]) => {
      expect(isMatch(name1, name2)).toBe(false);
    });
  });
  
  test('matchGroup correctly processes name groups', () => {
    nameGroups.forEach(group => {
      const result = matchGroup(group);
      expect(result.isMatch).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0.75);
    });
  });
  
  test('all functions respect custom options', () => {
    const options = { threshold: 0.9 };
    
    // This pair should not match with threshold 0.9
    const name1 = 'Michael Johnson';
    const name2 = 'Mike Johnson';
    
    expect(isMatch(name1, name2, options)).toBe(false);
    expect(matchGroup([name1, name2], options).isMatch).toBe(false);
  });
});
