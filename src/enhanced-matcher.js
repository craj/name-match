/**
 * Enhanced name matcher that combines multiple approaches 
 * specifically optimized for common name matching challenges
 */
const {
  parseName,
  getNameVariations
} = require('./name-normalizer');

class EnhancedMatcher {
  constructor() {
    // Name-specific stopwords to ignore
    this.stopwords = ['and', 'or', 'the', 'de', 'la', 'del', 'van', 'von', 'der'];
    
    // Name prefixes and suffixes to handle specially
    this.prefixes = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof'];
    this.suffixes = ['jr', 'sr', 'ii', 'iii', 'iv', 'v', 'phd', 'md', 'esq'];
  }

  /**
   * Calculate similarity score between two names
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @returns {number} - Similarity score (0-1)
   */
  getSimilarity(name1, name2) {
    // Normalize names
    const normalized1 = this.normalizeNameForComparison(name1);
    const normalized2 = this.normalizeNameForComparison(name2);
    
    // Perform a multi-strategy comparison
    const strategies = [
      () => this.exactMatchScore(normalized1, normalized2),
      () => this.tokenSetScore(normalized1, normalized2),
      () => this.initialsMatchScore(normalized1, normalized2),
      () => this.editDistanceScore(normalized1, normalized2)
    ];
    
    // Take the best score from all strategies
    let bestScore = 0;
    for (const strategy of strategies) {
      const score = strategy();
      bestScore = Math.max(bestScore, score);
    }
    
    return bestScore;
  }

  /**
   * Normalize a name for comparison
   * @param {string} name - Name to normalize
   * @returns {Object} - Normalized name with tokens and other metadata
   */
  normalizeNameForComparison(name) {
    // Parse the name using the name-normalizer
    const parsed = parseName(name);
    
    // Get tokens (excluding stopwords, prefixes, and suffixes)
    const tokens = parsed.normalized.split(' ').filter(token => 
      token.length > 0 &&
      !this.stopwords.includes(token) && 
      !this.prefixes.includes(token) && 
      !this.suffixes.includes(token)
    );
    
    return {
      original: name,
      normalized: parsed.normalized,
      tokens,
      firstName: parsed.firstName,
      middleNames: parsed.middleNames,
      lastName: parsed.lastName,
      initials: parsed.initials,
      firstNameVariations: getNameVariations(parsed.firstName)
    };
  }

  /**
   * Score based on exact matches
   * @param {Object} name1 - First normalized name
   * @param {Object} name2 - Second normalized name
   * @returns {number} - Similarity score (0-1)
   */
  exactMatchScore(name1, name2) {
    // Direct match of normalized names
    if (name1.normalized === name2.normalized) {
      return 1;
    }
    
    // Match first and last name
    if (name1.firstName && name2.firstName && name1.lastName && name2.lastName) {
      if (name1.firstName === name2.firstName && name1.lastName === name2.lastName) {
        return 0.9;
      }
    }
    
    return 0;
  }

  /**
   * Score based on token set matching
   * @param {Object} name1 - First normalized name
   * @param {Object} name2 - Second normalized name
   * @returns {number} - Similarity score (0-1)
   */
  tokenSetScore(name1, name2) {
    const tokens1 = new Set(name1.tokens);
    const tokens2 = new Set(name2.tokens);
    
    // Calculate Jaccard similarity
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Score based on initials matching
   * @param {Object} name1 - First normalized name
   * @param {Object} name2 - Second normalized name
   * @returns {number} - Similarity score (0-1)
   */
  initialsMatchScore(name1, name2) {
    // Check if one is a full name and the other is initials
    if (name1.tokens.length > 0 && name2.tokens.length > 0) {
      // First initial matches first name
      if (name1.firstName.charAt(0) === name2.firstName.charAt(0)) {
        // Last initial matches last name
        if (name1.lastName.charAt(0) === name2.lastName.charAt(0)) {
          return 0.7;
        }
        return 0.4;
      }
    }
    
    return 0;
  }

  /**
   * Score based on edit distance
   * @param {Object} name1 - First normalized name
   * @param {Object} name2 - Second normalized name
   * @returns {number} - Similarity score (0-1)
   */
  editDistanceScore(name1, name2) {
    const str1 = name1.normalized;
    const str2 = name2.normalized;
    
    if (!str1 || !str2) return 0;
    
    // Levenshtein distance implementation
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Create matrix
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    // Initialize first column and row
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,        // deletion
          matrix[i][j - 1] + 1,        // insertion
          matrix[i - 1][j - 1] + cost  // substitution
        );
      }
    }
    
    // Calculate similarity
    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    
    return maxLength > 0 ? 1 - (distance / maxLength) : 1;
  }

  /**
   * Check if all names in a group refer to the same person
   * @param {Array} nameGroup - Array of name variants
   * @returns {Object} - Result with score and details
   */
  matchNameGroup(nameGroup) {
    if (nameGroup.length <= 1) {
      return { score: 1, matches: [] };
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
    const averageScore = totalScore / pairCount;

    return {
      score: averageScore,
      matches
    };
  }
}

module.exports = EnhancedMatcher;
