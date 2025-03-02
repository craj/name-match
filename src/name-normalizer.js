/**
 * Name normalization utility
 * 
 * Provides functions to clean, normalize, and standardize names
 * for comparison and matching.
 */

// Common prefixes and suffixes in names
const PREFIXES = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'rev', 'hon'];
const SUFFIXES = ['jr', 'sr', 'ii', 'iii', 'iv', 'v', 'md', 'phd', 'esq'];

// Common name variations/nicknames
const NAME_VARIATIONS = {
  'william': ['will', 'bill', 'billy', 'willy'],
  'robert': ['rob', 'bob', 'bobby'],
  'richard': ['rick', 'dick', 'richie', 'ricky'],
  'michael': ['mike', 'mikey', 'mick'],
  'james': ['jim', 'jimmy', 'jamie'],
  'joseph': ['joe', 'joey', 'jo'],
  'thomas': ['tom', 'tommy'],
  'christopher': ['chris', 'topher'],
  'charles': ['chuck', 'charlie', 'chas'],
  'daniel': ['dan', 'danny'],
  'matthew': ['matt', 'matty'],
  'anthony': ['tony', 'ant'],
  'steven': ['steve', 'stevie'],
  'kenneth': ['ken', 'kenny'],
  'edward': ['ed', 'eddie', 'ted', 'teddy'],
  'donald': ['don', 'donny'],
  'elizabeth': ['liz', 'lizzy', 'beth', 'betty', 'eli'],
  'jennifer': ['jen', 'jenny'],
  'katherine': ['kathy', 'kate', 'katie', 'katy'],
  'margaret': ['maggie', 'meg', 'megan', 'peggy'],
  'patricia': ['pat', 'patty', 'trish'],
  'deborah': ['deb', 'debbie'],
  'jessica': ['jess', 'jessie'],
  'sandra': ['sandy'],
  'barbara': ['barb', 'barbie'],
  'stephanie': ['steph', 'stephy'],
  'victoria': ['vicky', 'tori'],
  'jonathan': ['jon', 'jonny'],
  'nicholas': ['nick', 'nicky'],
  'jeffrey': ['jeff'],
  'benjamin': ['ben', 'benny'],
  'timothy': ['tim', 'timmy'],
  'gregory': ['greg', 'gregg'],
  'raymond': ['ray'],
  'samuel': ['sam', 'sammy'],
  'andrew': ['andy', 'drew'],
  'alexander': ['alex', 'al'],
  'david': ['dave', 'davey'],
  'joshua': ['josh']
};

/**
 * Clean a name string by removing special characters,
 * extra spaces, and normalizing case
 * 
 * @param {string} name - The name to clean
 * @returns {string} - Cleaned name
 */
function cleanName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ') // Replace special chars with space
    .replace(/\s+/g, ' ')        // Normalize spaces
    .trim();
}

/**
 * Parse a name into its components
 * 
 * @param {string} name - The name to parse
 * @returns {Object} - Parsed name components
 */
function parseName(name) {
  if (!name) return { original: '', parts: [] };
    
  // Check for comma format (last, first)
  let normalized = name;
  if (name.includes(',')) {
    const parts = name.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      normalized = `${parts[1]} ${parts[0]}`;
    }
  }
  
  // Normalized and clean name
  const cleanedName = cleanName(normalized);
  if(cleanedName !== normalized) {
    normalized = cleanedName;
  }

  // Split into parts
  const allParts = normalized.split(' ');
  
  // Separate prefixes, main parts, and suffixes
  const prefixes = [];
  const suffixes = [];
  const mainParts = [];
  
  for (const part of allParts) {
    if (PREFIXES.includes(part.replace(/\.$/, ''))) {
      prefixes.push(part);
    } else if (SUFFIXES.includes(part.replace(/\.$/, ''))) {
      suffixes.push(part);
    } else {
      mainParts.push(part);
    }
  }
  
  // Extract name components from main parts
  const firstName = mainParts.length > 0 ? mainParts[0] : '';
  const lastName = mainParts.length > 1 ? mainParts[mainParts.length - 1] : '';
  const middleNames = mainParts.length > 2 ? mainParts.slice(1, -1) : [];
  
  return {
    original: name,
    cleaned: cleanedName,
    normalized,
    prefixes,
    firstName,
    middleNames,
    lastName,
    suffixes,
    initials: {
      first: firstName ? firstName[0] : '',
      middle: middleNames.map(n => n[0]).join(''),
      last: lastName ? lastName[0] : ''
    }
  };
}

/**
 * Standardize a name for comparison
 * 
 * @param {string} name - The name to standardize
 * @returns {string} - Standardized name
 */
function standardizeName(name) {
  const parsed = parseName(name);
  
  // Use only main name parts in standard order
  const nameParts = [
    parsed.firstName,
    ...parsed.middleNames,
    parsed.lastName
  ].filter(Boolean);
  
  return nameParts.join(' ');
}

/**
 * Get name variations based on common nicknames
 * 
 * @param {string} name - The name to get variations for
 * @returns {Array} - Array of name variations
 */
function getNameVariations(name) {
  const parsed = parseName(name);
  const variations = [standardizeName(name)];
  
  // Generate first name variations
  const firstNameVariations = [parsed.firstName];
  
  // Add known variations
  if (NAME_VARIATIONS[parsed.firstName]) {
    firstNameVariations.push(...NAME_VARIATIONS[parsed.firstName]);
  }
  
  // Check if this is a nickname, add the formal name
  for (const [formal, nicknames] of Object.entries(NAME_VARIATIONS)) {
    if (nicknames.includes(parsed.firstName)) {
      firstNameVariations.push(formal);
    }
  }
  
  // Generate full name variations
  for (const firstVariation of firstNameVariations) {
    variations.push([
      firstVariation,
      ...parsed.middleNames,
      parsed.lastName
    ].filter(Boolean).join(' '));
  }
  
  // Add variations with middle initial
  if (parsed.middleNames.length > 0) {
    variations.push([
      parsed.firstName,
      parsed.initials.middle, // Just middle initials
      parsed.lastName
    ].filter(Boolean).join(' '));
    
    // Also with first name variations
    for (const firstVariation of firstNameVariations) {
      if (firstVariation !== parsed.firstName) {
        variations.push([
          firstVariation,
          parsed.initials.middle,
          parsed.lastName
        ].filter(Boolean).join(' '));
      }
    }
  }
  
  // Add variations with no middle name/initial
  variations.push([
    parsed.firstName,
    parsed.lastName
  ].filter(Boolean).join(' '));
  
  // Also with first name variations
  for (const firstVariation of firstNameVariations) {
    if (firstVariation !== parsed.firstName) {
      variations.push([
        firstVariation,
        parsed.lastName
      ].filter(Boolean).join(' '));
    }
  }
  
  // Return unique variations
  return [...new Set(variations)];
}

/**
 * Normalize name order (handle last, first format)
 * 
 * @param {string} name - The name to normalize
 * @returns {string} - Name with standardized order
 */
function normalizeNameOrder(name) {
  return parseName(name).normalized;
}

module.exports = {
  cleanName,
  parseName,
  standardizeName,
  getNameVariations,
  normalizeNameOrder,
  NAME_VARIATIONS,
  PREFIXES,
  SUFFIXES
};
