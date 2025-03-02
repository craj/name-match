/**
 * Example usage of the Enhanced Name Matcher library
 */
const { 
  EnhancedNaturalMatcher, 
  match, 
  isMatch, 
  matchGroup,
  NameNormalizer 
} = require('./index');

console.log('Enhanced Name Matcher - Example Usage\n');

// Basic similarity scoring
console.log('Basic similarity scoring:');
const testPairs = [
  ['John Smith', 'Smith, John'],
  ['William Jones', 'Bill Jones'],
  ['Robert Johnson', 'Bob Johnson'],
  ['Aaron Charles Donovan', 'Aaron Donovan'],
  ['Michael Jackson', 'Michael Jackson Jr'],
  ['James Chaney', 'Jim Chaney'],
  ['Jessica Elizondo', 'Jessica William Elizondo'],
  ['Ander Herrera', 'Herrera Ander'],
  ['Chelsea M Solomon', 'Chelsea Mary-Elizabeth Solomon'],
  ['John Smith', 'James Smith'], // Should not match
  ['Robert Johnson', 'Robert Williams'] // Should not match
];

testPairs.forEach(([name1, name2]) => {
  const score = match(name1, name2);
  const matched = isMatch(name1, name2);
  console.log(`"${name1}" vs "${name2}": Score = ${score.toFixed(3)}, Match = ${matched ? 'YES' : 'NO'}`);
});

// Custom matcher with different threshold
console.log('\nCustom matcher with different threshold:');
const strictMatcher = new EnhancedNaturalMatcher({ threshold: 0.85 });
const lenientMatcher = new EnhancedNaturalMatcher({ threshold: 0.6 });

const borderlinePair = ['Michael Johnson', 'Mike Johnson'];
console.log(`"${borderlinePair[0]}" vs "${borderlinePair[1]}"`);
console.log(`  Standard (0.75): ${isMatch(borderlinePair[0], borderlinePair[1]) ? 'MATCH' : 'NO MATCH'}`);
console.log(`  Strict (0.85): ${strictMatcher.isMatch(borderlinePair[0], borderlinePair[1]) ? 'MATCH' : 'NO MATCH'}`);
console.log(`  Lenient (0.6): ${lenientMatcher.isMatch(borderlinePair[0], borderlinePair[1]) ? 'MATCH' : 'NO MATCH'}`);

// Group matching
console.log('\nGroup matching:');
const nameGroups = [
  ['Aaron Charles Donovan', 'Aaron Donovan', 'Donovan Aaron Charles'],
  ['Emily Farris', 'Emily Tigist Ferede Farris', 'Farris Emily Tigist Ferede'],
  ['Tiffany Nash', 'Nash Tiffany M']
];

nameGroups.forEach((group, index) => {
  const result = matchGroup(group);
  console.log(`Group ${index + 1}: ${result.isMatch ? 'MATCH' : 'NO MATCH'} (Score: ${result.score.toFixed(3)})`);
  console.log(`  Names: ${group.join(' | ')}`);
});

// Name normalization
console.log('\nName normalization:');
const nameExamples = [
  'Smith, John William Jr.',
  'Dr. Robert J. Johnson III',
  'Michael Patrick Davis',
  'Mary-Elizabeth Smith (Parker)',
  'O\'Connor, James Richard'
];

nameExamples.forEach(name => {
  const parsed = NameNormalizer.parseName(name);
  console.log(`\nOriginal: "${name}"`);
  console.log(`  Normalized: "${parsed.normalized}"`);
  console.log(`  First: "${parsed.firstName}", Middle: "${parsed.middleNames.join(' ')}", Last: "${parsed.lastName}"`);
  
  if (parsed.prefixes.length > 0) {
    console.log(`  Prefixes: ${parsed.prefixes.join(', ')}`);
  }
  
  if (parsed.suffixes.length > 0) {
    console.log(`  Suffixes: ${parsed.suffixes.join(', ')}`);
  }
  
  console.log(`  Initials: ${parsed.initials.first}${parsed.initials.middle}${parsed.initials.last}`);
  
  // Get variations for the first name
  if (parsed.firstName) {
    const variations = NameNormalizer.getNameVariations(parsed.firstName);
    if (variations.length > 1) {
      console.log(`  First name variations: ${variations.join(', ')}`);
    }
  }
});

console.log('\nDone!');
