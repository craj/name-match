# Enhanced Name Matcher - Usage Guide

This guide provides detailed examples on how to use the Enhanced Name Matcher library in your Node.js applications.

## Installation

```bash
npm install name-match
```

## Basic Usage

```javascript
const { match, isMatch } = require('name-match');

// Get the similarity score between two names (0-1)
const score = match('John W. Smith', 'Smith, John');
console.log(score); // 0.85

// Check if two names match (using default threshold of 0.75)
if (isMatch('Robert Johnson', 'Bob Johnson')) {
  console.log('Names match!');
} else {
  console.log('Names do not match.');
}
```

## Advanced Usage

### Creating a Custom Matcher

```javascript
const { EnhancedNaturalMatcher } = require('name-match');

// Create a matcher with custom threshold
const strictMatcher = new EnhancedNaturalMatcher({ threshold: 0.85 });
const lenientMatcher = new EnhancedNaturalMatcher({ threshold: 0.6 });

// Get similarity scores
const score1 = strictMatcher.getSimilarity('Michael Scott', 'Mike Scott');
const score2 = lenientMatcher.getSimilarity('Michael Scott', 'Mike Scott');

// Check if names match with different thresholds
console.log(strictMatcher.isMatch('Michael Scott', 'Mike Scott')); // false
console.log(lenientMatcher.isMatch('Michael Scott', 'Mike Scott')); // true
```

### Group Matching

```javascript
const { matchGroup } = require('name-match');

// Check if all names in a group refer to the same person
const nameGroup = [
  'Aaron Charles Donovan',
  'Aaron Donovan',
  'Donovan, Aaron C.'
];

const result = matchGroup(nameGroup);
console.log(result.score); // 0.83
console.log(result.isMatch); // true

// You can also get detailed match information for each pair
console.log(result.matches);
/*
[
  {
    name1: 'Aaron Charles Donovan',
    name2: 'Aaron Donovan',
    similarity: 0.89
  },
  {
    name1: 'Aaron Charles Donovan',
    name2: 'Donovan, Aaron C.',
    similarity: 0.82
  },
  {
    name1: 'Aaron Donovan',
    name2: 'Donovan, Aaron C.',
    similarity: 0.78
  }
]
*/
```

### Name Normalization and Parsing

```javascript
const { NameNormalizer } = require('name-match');

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

// Clean a name
const cleaned = NameNormalizer.cleanName('Dr. JOHN W. Smith Jr.');
console.log(cleaned); // 'dr john w smith jr'

// Standardize a name for comparison
const standardized = NameNormalizer.standardizeName('Smith, John W.');
console.log(standardized); // 'john w smith'

// Get possible variations of a name
const variations = NameNormalizer.getNameVariations('William Smith');
console.log(variations);
// [ 'william smith', 'will smith', 'bill smith', 'billy smith', 'willy smith' ]

// Normalize name order (handles "Last, First" format)
const normalized = NameNormalizer.normalizeNameOrder('Smith, John');
console.log(normalized); // 'john smith'
```

## Common Use Cases

### Identity Verification

```javascript
const { isMatch } = require('name-match');

function verifyIdentity(storedName, inputName) {
  return isMatch(storedName, inputName, { threshold: 0.8 });
}

// Verify user identity
const verified = verifyIdentity('Robert Johnson', 'Bob Johnson');
console.log(`Identity verification: ${verified ? 'PASSED' : 'FAILED'}`);
```

### Deduplication

```javascript
const { matchGroup } = require('name-match');

function findDuplicates(names) {
  const result = matchGroup(names);
  
  if (result.isMatch) {
    return {
      isDuplicate: true,
      message: 'These names likely refer to the same person',
      score: result.score
    };
  } else {
    return {
      isDuplicate: false,
      message: 'These names likely refer to different people',
      score: result.score
    };
  }
}

// Check for duplicates
const names = ['William Jones', 'Bill Jones', 'W. Jones'];
const dupCheck = findDuplicates(names);
console.log(dupCheck);
```

### Database Matching

```javascript
const { EnhancedNaturalMatcher } = require('name-match');

// Create a matcher with custom settings
const matcher = new EnhancedNaturalMatcher({ threshold: 0.75 });

// Function to find records in a database that match a given name
async function findMatchingRecords(db, searchName) {
  // Get all records from the database
  const records = await db.collection('users').find().toArray();
  
  // Filter records by name match
  const matches = records.filter(record => 
    matcher.isMatch(record.name, searchName)
  );
  
  // Sort by similarity score
  return matches.sort((a, b) => 
    matcher.getSimilarity(b.name, searchName) - 
    matcher.getSimilarity(a.name, searchName)
  );
}

// Example usage
// const matches = await findMatchingRecords(db, 'Michael Johnson');
```

### Audit and Compliance

```javascript
const { match, NameNormalizer } = require('name-match');

function auditNameChange(oldName, newName) {
  const score = match(oldName, newName);
  const parsed1 = NameNormalizer.parseName(oldName);
  const parsed2 = NameNormalizer.parseName(newName);
  
  return {
    similarityScore: score,
    firstNameChanged: parsed1.firstName !== parsed2.firstName,
    lastNameChanged: parsed1.lastName !== parsed2.lastName,
    middleNameChanged: parsed1.middleNames.join('') !== parsed2.middleNames.join(''),
    suffixChanged: parsed1.suffixes.join('') !== parsed2.suffixes.join(''),
    initialsMatch: parsed1.initials.first === parsed2.initials.first && 
                  parsed1.initials.last === parsed2.initials.last,
    requiresReview: score < 0.75
  };
}

// Example usage
const audit = auditNameChange('John William Smith Jr.', 'John W. Smith');
console.log(audit);
```

## Performance Tuning

### Caching Results

For applications that repeatedly compare the same names, consider implementing a cache:

```javascript
const { match } = require('name-match');

// Simple cache implementation
class NameMatchCache {
  constructor() {
    this.cache = new Map();
  }
  
  getKey(name1, name2) {
    // Ensure consistent key regardless of name order
    const sortedNames = [name1, name2].sort();
    return `${sortedNames[0]}|${sortedNames[1]}`;
  }
  
  getMatch(name1, name2) {
    const key = this.getKey(name1, name2);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const score = match(name1, name2);
    this.cache.set(key, score);
    return score;
  }
}

// Usage
const cache = new NameMatchCache();
const score1 = cache.getMatch('John Smith', 'Smith, John'); // Computed
const score2 = cache.getMatch('Smith, John', 'John Smith'); // Retrieved from cache
```

### Batch Processing

For large sets of names, use batch processing to improve performance:

```javascript
const { EnhancedNaturalMatcher } = require('name-match');

function batchProcessNames(referenceNames, comparisonNames, batchSize = 100) {
  const matcher = new EnhancedNaturalMatcher();
  const results = [];
  
  // Process in batches
  for (let i = 0; i < referenceNames.length; i += batchSize) {
    const batch = referenceNames.slice(i, i + batchSize);
    
    for (const referenceName of batch) {
      for (const comparisonName of comparisonNames) {
        const score = matcher.getSimilarity(referenceName, comparisonName);
        
        if (score >= matcher.threshold) {
          results.push({
            referenceName,
            comparisonName,
            score
          });
        }
      }
    }
  }
  
  return results;
}
```

## Error Handling

The library is designed to handle edge cases gracefully but here are some tips for proper error handling:

```javascript
const { match, NameNormalizer } = require('name-match');

function safelyMatchNames(name1, name2) {
  try {
    // Handle null or undefined inputs
    if (!name1 || !name2) {
      return {
        score: 0,
        error: 'One or both names are empty'
      };
    }
    
    // Ensure inputs are strings
    const str1 = String(name1);
    const str2 = String(name2);
    
    // Clean the inputs
    const cleaned1 = NameNormalizer.cleanName(str1);
    const cleaned2 = NameNormalizer.cleanName(str2);
    
    // Skip processing for extremely short names
    if (cleaned1.length < 2 || cleaned2.length < 2) {
      return {
        score: 0,
        error: 'Names too short for reliable matching'
      };
    }
    
    // Get the match score
    const score = match(str1, str2);
    
    return {
      score,
      error: null
    };
  } catch (error) {
    return {
      score: 0,
      error: `Error matching names: ${error.message}`
    };
  }
}
```

## Best Practices

1. **Normalize inputs**: Always clean and normalize names before matching
2. **Choose appropriate thresholds**: The default threshold (0.75) works well for most cases, but you may need to adjust it based on your specific requirements
3. **Consider context**: Name matching alone may not be sufficient for identity verification in high-security contexts
4. **Combine with other data**: For better accuracy, combine name matching with other identity attributes (birthdate, ID numbers, etc.)
5. **Cache results**: For repeated comparisons, implement caching to improve performance
6. **Test thoroughly**: Test with a variety of name patterns and edge cases specific to your user population

## Troubleshooting

### Common Issues

1. **Low scores for obvious matches**: Try using the `NameNormalizer.normalizeNameOrder()` function to handle reversed names before matching
2. **High scores for non-matches**: Increase the threshold for `isMatch()` to reduce false positives
3. **Poor performance with large datasets**: Use batch processing and caching for large-scale comparisons
4. **Inconsistent results**: Ensure inputs are properly cleaned and normalized before matching

### Debugging

```javascript
const { EnhancedNaturalMatcher, NameNormalizer } = require('name-match');

function debugNameMatch(name1, name2) {
  // Parse names
  const parsed1 = NameNormalizer.parseName(name1);
  const parsed2 = NameNormalizer.parseName(name2);
  
  console.log('--- Name 1 ---');
  console.log(`Original: ${parsed1.original}`);
  console.log(`Normalized: ${parsed1.normalized}`);
  console.log(`Components: ${parsed1.firstName} ${parsed1.middleNames.join(' ')} ${parsed1.lastName}`);
  
  console.log('--- Name 2 ---');
  console.log(`Original: ${parsed2.original}`);
  console.log(`Normalized: ${parsed2.normalized}`);
  console.log(`Components: ${parsed2.firstName} ${parsed2.middleNames.join(' ')} ${parsed2.lastName}`);
  
  // Create matcher
  const matcher = new EnhancedNaturalMatcher();
  
  // Get scores from component matchers
  const naturalScore = matcher.getNaturalScore(name1, name2);
  const enhancedScore = matcher.enhancedMatcher.getSimilarity(name1, name2);
  const combinedScore = matcher.getSimilarity(name1, name2);
  
  console.log('--- Scores ---');
  console.log(`Natural Score: ${naturalScore.toFixed(3)}`);
  console.log(`Enhanced Score: ${enhancedScore.toFixed(3)}`);
  console.log(`Combined Score: ${combinedScore.toFixed(3)}`);
  console.log(`Match: ${combinedScore >= matcher.threshold ? 'YES' : 'NO'}`);
}

// Example usage
debugNameMatch('Dr. Jonathan W. Smith Jr.', 'SMITH, JOHN');
```
