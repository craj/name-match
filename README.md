# Enhanced Name Matcher

A robust name matching library for Node.js that combines multiple string similarity algorithms for optimal name matching performance.

[![npm version](https://img.shields.io/npm/v/enhanced-name-matcher.svg)](https://www.npmjs.com/package/enhanced-name-matcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Combined Algorithms**: Uses both Natural.js and a custom enhanced matcher for superior matching results
- **Name-Specific Optimizations**: Handles common name matching challenges like nicknames, middle names, and reversed order
- **Comprehensive Approach**: Considers multiple strategies and selects the best match
- **Flexible Threshold**: Configurable similarity threshold for matches
- **Utility Functions**: Includes name normalization, parsing, and standardization

## Installation

```bash
npm install enhanced-name-matcher
```

## Quick Start

```javascript
const { match, isMatch } = require('enhanced-name-matcher');

// Get similarity score (0-1)
const score = match('John W. Smith', 'Smith, John');
console.log(score); // 0.85

// Check if names match (using default threshold of 0.75)
const matched = isMatch('Robert Johnson', 'Bob Johnson');
console.log(matched); // true
```

## Detailed Usage

### Creating a Matcher Instance

```javascript
const { EnhancedNaturalMatcher } = require('enhanced-name-matcher');

// Create matcher with custom threshold
const matcher = new EnhancedNaturalMatcher({ threshold: 0.75 });

// Calculate similarity score
const score = matcher.getSimilarity('William Jones', 'Bill Jones');
console.log(score); // 0.89

// Check if names match using custom threshold
const matched = matcher.isMatch('Michael Smith', 'Mike Smith');
console.log(matched); // true
```

### Matching Groups of Names

```javascript
const { matchGroup } = require('enhanced-name-matcher');

// Check if all names in a group refer to the same person
const nameGroup = [
  'Aaron Charles Donovan',
  'Aaron Donovan',
  'Donovan, Aaron C.'
];

const result = matchGroup(nameGroup);
console.log(result.score); // 0.83
console.log(result.isMatch); // true
console.log(result.matches); // Detailed match information for each pair
```

### Name Normalization

```javascript
const { NameNormalizer } = require('enhanced-name-matcher');

// Parse a name into components
const parsed = NameNormalizer.parseName('Smith, John William Jr.');
console.log(parsed);
/*
{
  original: 'Smith, John William Jr.',
  cleaned: 'smith john william jr',
  normalized: 'john william smith',
  prefixes: [],
  firstName: 'john',
  middleNames: ['william'],
  lastName: 'smith',
  suffixes: ['jr'],
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
