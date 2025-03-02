/**
 * Enhanced Natural Name Matcher
 * 
 * Combines the strengths of natural.js and Enhanced Name Matcher
 * for optimal name matching performance.
 */
const natural = require('natural');
const EnhancedMatcher = require('./enhanced-matcher');

class EnhancedNaturalMatcher {
  /**
   * Create a new EnhancedNaturalMatcher
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Configure threshold - if average score is >= threshold, names match
    this.threshold = options.threshold || 0.75;
    
    // Initialize the component matchers
    this.enhancedMatcher = new EnhancedMatcher();
  }

  /**
   * Calculate combined similarity score between two names
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @returns {number} - Similarity score (0-1)
   */
  getSimilarity(name1, name2) {
    // Handle empty names
    if (!name1 || !name2) return 0;
    
    // Handle exact match
    if (name1 === name2) return 1;
    
    // Get scores from both matchers
    const naturalScore = this.getNaturalScore(name1, name2);
    const enhancedScore = this.enhancedMatcher.getSimilarity(name1, name2);
    
    // Calculate average of the two scores
    const averageScore = (naturalScore + enhancedScore) / 2;
    
    return parseFloat(averageScore.toFixed(2));
  }

  /**
   * Get score using natural.js algorithms
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @returns {number} - Similarity score (0-1)
   */
  getNaturalScore(name1, name2) {
    if (!name1 || !name2) return 0;
    
    // Try different algorithms and take the best result
    const jaroWinkler = natural.JaroWinklerDistance(name1, name2);
    const diceCoefficient = natural.DiceCoefficient(name1, name2);
    
    // Convert Levenshtein distance to similarity
    const levenshteinDistance = natural.LevenshteinDistance(name1, name2);
    const maxLength = Math.max(name1.length, name2.length);
    const levenshteinSimilarity = maxLength > 0 ? 1 - (levenshteinDistance / maxLength) : 1;
    
    // Return the best score from all algorithms
    return Math.max(jaroWinkler, diceCoefficient, levenshteinSimilarity);
  }

  /**
   * Determine if two names match based on the threshold
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @returns {boolean} - True if the names match
   */
  isMatch(name1, name2) {
    const score = this.getSimilarity(name1, name2);
    return score >= this.threshold;
  }

  /**
   * Check if all names in a group refer to the same person
   * @param {Array} nameGroup - Array of name variants
   * @returns {Object} - Result with score and details
   */
  matchNameGroup(nameGroup) {
    if (nameGroup.length <= 1) {
      return { score: 1, matches: [], isMatch: true };
    }

    const matches = [];
    let totalScore = 0;
    let pairCount = 0;

    // Compare each name with every other name
    for (let i = 0; i < nameGroup.length; i++) {
      for (let j = i + 1; j < nameGroup.length; j++) {
        const name1 = nameGroup[i];
        const name2 = nameGroup[j];
        const similarity = this.getSimilarity(name1, name2);
        
        matches.push({ name1, name2, similarity });
        totalScore += similarity;
        pairCount++;
      }
    }

    // Average similarity across all pairs
    const averageScore = parseFloat((totalScore / pairCount).toFixed(2));
    const isMatch = averageScore >= this.threshold;

    return {
      score: averageScore,
      matches,
      isMatch
    };
  }
}

module.exports = EnhancedNaturalMatcher;
