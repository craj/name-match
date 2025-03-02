# Enhanced Name Matcher

A robust name matching library for Node.js that combines multiple string similarity algorithms for optimal name matching performance.

[![npm version](https://img.shields.io/npm/v/name-match.svg)](https://www.npmjs.com/package/name-match)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Combined Algorithms**: Uses both Natural.js and a custom enhanced matcher for superior matching results
- **Name-Specific Optimizations**: Handles common name matching challenges like nicknames, middle names, and reversed order
- **Comprehensive Approach**: Considers multiple strategies and selects the best match
- **Flexible Threshold**: Configurable similarity threshold for matches
- **Utility Functions**: Includes name normalization, parsing, and standardization

## Installation

```bash
npm install name-match
```

## Quick Start

```javascript
const { match, isMatch } = require('name-match');

// Get similarity score (0-1)
const score = match('John Smith', 'Smith, John');
console.log(score); // 0.87

// Check if names match (using default threshold of 0.75)
const matched = isMatch('Robert Johnson', 'Bob Johnson');
console.log(matched); // true
```

## Detailed Usage

### Creating a Matcher Instance

```javascript
const { EnhancedNaturalMatcher } = require('name-match');

// Create matcher with custom threshold
const matcher = new EnhancedNaturalMatcher({ threshold: 0.75 });

// Calculate similarity score
const score = matcher.getSimilarity('William Jones', 'Bill Jones');
console.log(score); // 0.78

// Check if names match using custom threshold
const matched = matcher.isMatch('Michael Smith', 'Mike Smith');
console.log(matched); // true
```

### Matching Groups of Names

```javascript
const { matchGroup } = require('name-match');

// Check if all names in a group refer to the same person
const nameGroup = [
  'Aaron Charles Donovan',
  'Aaron Donovan',
  'Donovan Aaron C'
];

const result = matchGroup(nameGroup);
console.log(result.score); // 0.76
console.log(result.isMatch); // true
console.log(result.matches); // Detailed match information for each pair
```

### Name Normalization

```javascript
const { NameNormalizer } = require('name-match');

// Parse a name into components
const parsed = NameNormalizer.parseName('Dr. John William Smith Jr.');
console.log(parsed);
/*
{
  original: 'Dr. John William Smith Jr.',
  cleaned: 'dr john william smith jr',
  normalized: 'dr john william smith jr',
  prefixes: [ 'dr' ],
  firstName: 'john',
  middleNames: [ 'william' ],
  lastName: 'smith',
  suffixes: [ 'jr' ],
  initials: { first: 'j', middle: 'w', last: 's' }
}
*/

// Get name variations
const variations = NameNormalizer.getNameVariations('William Smith');
console.log(variations);
// [ 'william smith', 'will smith', 'bill smith', 'billy smith', 'willy smith' ]
```

## Challenges Handled

The library is specifically designed to handle these common name matching challenges:

- Different name formats (first last vs. last, first)
- Middle names and initials
- Nicknames and formal names
- Suffixes (Jr, Sr, III)
- Titles and prefixes (Mr, Dr, etc.)
- Compound last names
- Hyphenated names
- Different character casing
- Special characters
- Spacing variations

## How It Works

This library combines two powerful approaches:

1. **Natural.js**: Uses industry-standard string similarity algorithms (Jaro-Winkler, Dice, Levenshtein)
2. **Enhanced Matcher**: Uses name-specific strategies like token matching, initials comparison, and nickname handling

The final score is an average of these two approaches, providing more robust and accurate results than either method alone.

## License

MIT
