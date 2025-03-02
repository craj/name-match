/**
 * Enhanced Name Matcher
 * A robust name matching library that combines multiple algorithms
 * for optimal name matching performance
 */

// Export main classes and utilities
const EnhancedNaturalMatcher = require('./src/enhanced-natural-matcher');
const EnhancedMatcher = require('./src/enhanced-matcher');
const NameNormalizer = require('./src/name-normalizer');

module.exports = {
  // Main matcher
  EnhancedNaturalMatcher,
  
  // Component matchers
  EnhancedMatcher,
  
  // Utilities
  NameNormalizer,
  
  // Convenience function for simple matching
  match: function(name1, name2, options = { threshold: 0.75 }) {
    const matcher = new EnhancedNaturalMatcher(options);
    return matcher.getSimilarity(name1, name2);
  },
  
  // Convenience function for checking if names match
  isMatch: function(name1, name2, options = { threshold: 0.75 }) {
    const matcher = new EnhancedNaturalMatcher(options);
    return matcher.isMatch(name1, name2);
  },
  
  // Convenience function for matching a group of names
  matchGroup: function(nameGroup, options = { threshold: 0.75 }) {
    const matcher = new EnhancedNaturalMatcher(options);
    return matcher.matchNameGroup(nameGroup);
  }
};
