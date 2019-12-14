import { fromCache, toCache } from './cache.js';

const registeredElements = new Map();

const toDashCase = (name) => {
  const dashCaseLetters = [];

  for (let i = 0, letter = name[0]; i < name.length; i += 1, letter = name[i]) {
    const letterLowerCase = letter.toLowerCase();

    if (letter !== letterLowerCase && i !== 0) {
      dashCaseLetters.push('-');
    }

    dashCaseLetters.push(letterLowerCase);
  }

  return dashCaseLetters.join('');
};

const incrementTagName = (tag, counter, start = 1) => {
  const newName = counter === start ? tag : `${tag}-${counter}`;
  const elementRegistered = !!customElements.get(newName);

  if (elementRegistered) {
    return incrementTagName(tag, counter + 1, start);
  }

  return newName;
};

const getClassUniqueTag = (klass) => {
  let tag = registeredElements.get(klass);
  if (tag) {
    return tag;
  }

  if (Object.prototype.hasOwnProperty.call(klass, 'name') && klass.name) {
    tag = toDashCase(klass.name);
    if (tag.indexOf('-') === -1) {
      tag = `c-${tag}`;
    }
    tag = incrementTagName(tag, 1);
  } else {
    tag = incrementTagName('c', 1, 0);
  }

  customElements.define(tag, klass);
  registeredElements.set(klass, tag);

  return tag;
};

const isCustomElement = (element) => element.prototype instanceof HTMLElement;

const process = (strings, values) => {
  const keys = [];
  const indexes = [];
  const newValues = [];
  const newStrings = [strings[0]];

  values.forEach((value, index) => {
    if (isCustomElement(value)) {
      keys.push([index, value]);
      newStrings[newStrings.length - 1] += getClassUniqueTag(value) + strings[index + 1];
    } else {
      indexes.push(index);
      newValues.push(value);
      newStrings.push(strings[index + 1]);
    }
  });

  toCache(strings, {
    keys,
    indexes,
    strings: keys.length > 0 ? newStrings : strings,
  });

  return [newStrings, ...newValues];
};

export default (strings, values) => fromCache(strings, values) || process(strings, values);
