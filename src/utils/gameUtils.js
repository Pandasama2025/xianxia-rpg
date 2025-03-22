/**
 * Game utility functions for the Xianxia RPG
 */

/**
 * Parses karma values and returns numeric change
 * @param {string|number} karmaValue - The karma value to be parsed
 * @return {number} The numeric karma change
 */
export const getKarmaChange = (karmaValue) => {
  // If it's already a number, return it
  if (typeof karmaValue === 'number') return karmaValue;
  
  // If it's a string like "+10" or "-5", convert it to a number
  if (typeof karmaValue === 'string') {
    const match = karmaValue.match(/([+-]?\d+)/);
    if (match) {
      return parseInt(match[0], 10);
    }
  }
  
  // Default to 0 if we can't parse a meaningful value
  return 0;
};

/**
 * Checks if player meets all conditions for an option
 * @param {Object} playerStatus - The current player status attributes
 * @param {Object} conditions - The conditions to check
 * @return {boolean} Whether all conditions are met
 */
export const meetsAllConditions = (playerStatus, conditions) => {
  if (!conditions || Object.keys(conditions).length === 0) return true;
  
  for (const [attribute, requiredValue] of Object.entries(conditions)) {
    const playerValue = playerStatus[attribute] || 0;
    if (playerValue < requiredValue) {
      return false;
    }
  }
  
  return true;
};

/**
 * Format attribute value for display
 * @param {string} key - The attribute key/name
 * @param {number} value - The attribute value to format
 * @returns {string} Formatted value
 */
export const formatAttributeValue = (key, value) => {
  if (value === undefined || value === null) return "0";
  
  // 特殊属性格式化
  if (key === 'karma') {
    // 正负值不同显示方式
    return value > 0 ? `+${value}` : `${value}`;
  }
  
  if (key === 'cultivation') {
    // 修为等级用文字表示
    const levels = ['凡人', '练气', '筑基', '金丹', '元婴', '化神'];
    return levels[Math.min(value, levels.length - 1)];
  }
  
  if (Number.isInteger(value)) {
    return value.toString();
  }
  
  return value.toFixed(1);
};

/**
 * Get the appropriate CSS class based on attribute key and value
 * @param {string} key - The attribute key/name
 * @param {number} value - The attribute value
 * @returns {string} CSS class name
 */
export const getAttributeClass = (key, value) => {
  if (value === undefined || value === null) return "neutral";
  
  // 根据不同属性返回不同的CSS类
  if (key === 'karma') {
    if (value >= 30) return "very-positive";
    if (value > 0) return "positive";
    if (value === 0) return "neutral";
    if (value > -30) return "negative";
    return "very-negative";
  }
  
  if (key === 'corruption') {
    // 对于负面属性，值越高越糟糕
    if (value >= 80) return "very-negative";
    if (value >= 60) return "negative";
    if (value >= 40) return "slightly-negative";
    if (value >= 20) return "neutral";
    return "positive";
  }
  
  // 对于普通正面属性，值越高越好
  if (value >= 80) return "very-positive";
  if (value >= 60) return "positive";
  if (value >= 40) return "slightly-positive";
  if (value >= 20) return "neutral";
  return "negative";
};

/**
 * Applies effects to player status
 * @param {Object} playerStatus - Current player status
 * @param {Object} effects - Effects to apply
 * @return {Object} Updated player status
 */
export const applyEffects = (playerStatus, effects) => {
  if (!effects) return playerStatus;
  
  const newStatus = { ...playerStatus };
  
  for (const [attribute, value] of Object.entries(effects)) {
    // Convert string values to numbers if possible
    const numValue = getKarmaChange(value);
    
    // Update or initialize the attribute
    newStatus[attribute] = (newStatus[attribute] || 0) + numValue;
  }
  
  return newStatus;
};

/**
 * Get button style class based on option effects
 * @param {Object} option - The option object with effects
 * @returns {string} CSS class name
 */
export const getButtonStyleClass = (option) => {
  if (!option.effects) return "neutral-option";
  
  // Check for significant karma effects
  const hasPositiveKarma = option.effects.karma > 0.15;
  const hasNegativeKarma = option.effects.karma < -0.15;
  
  // Check for dangerous effects that significantly lower stats
  const hasDangerousEffects = Object.entries(option.effects).some(([key, value]) => {
    // Skip non-numeric effects or karma (handled separately)
    if (typeof value !== 'number' || key === 'karma') return false;
    // Consider any significant negative effect as dangerous
    return value < -0.2;
  });
  
  // Check for beneficial effects that raise stats
  const hasBeneficialEffects = Object.entries(option.effects).some(([key, value]) => {
    // Skip non-numeric effects or karma (handled separately)
    if (typeof value !== 'number' || key === 'karma') return false;
    // Consider any significant positive effect as beneficial
    return value > 0.2;
  });
  
  // Determine the button class based on effects
  if (hasPositiveKarma) return "positive-option";
  if (hasNegativeKarma) return "negative-option";
  if (hasDangerousEffects) return "dangerous-option";
  if (hasBeneficialEffects) return "beneficial-option";
  
  return "neutral-option";
};

/**
 * Check if option should be disabled based on player status and conditions
 * @param {Object} option - The option object with conditions
 * @param {Object} playerStatus - Current player status
 * @returns {boolean} Whether the option should be disabled
 */
export const shouldDisableOption = (option, playerStatus) => {
  if (!option.conditions || Object.keys(option.conditions).length === 0) {
    return false; // No conditions, so option is enabled
  }
  
  // Check each condition against player status
  return Object.entries(option.conditions).some(([attribute, requiredValue]) => {
    const playerValue = playerStatus[attribute];
    
    // If player doesn't have this attribute or it's below required value
    if (playerValue === undefined || playerValue < requiredValue) {
      return true; // Disable the option
    }
    
    return false;
  });
};