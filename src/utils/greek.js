export const formatLabel = (text) => {
  const accents = {
    Ά: 'Α', Έ: 'Ε', Ή: 'Η', Ί: 'Ι', Ό: 'Ο', Ύ: 'Υ', Ώ: 'Ω',
    ά: 'α', έ: 'ε', ή: 'η', ί: 'ι', ό: 'ο', ύ: 'υ', ώ: 'ω',
    ΐ: 'ι', ΰ: 'υ', ϊ: 'ι', ϋ: 'υ'
  };
  const withoutAccents = text
    .split('')
    .map(char => accents[char] || char)
    .join('');
  return withoutAccents.toUpperCase();
};