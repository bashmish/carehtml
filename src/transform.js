const registeredElements = new Map();
const cache = new Map();
const CACHE_SEPARATOR = '$$carehtml_separator$$';

function toDashCase(name) {
  const dashCaseLetters = [];
  for (let i = 0; i < name.length; i += 1) {
    const letter = name[i];
    const letterLowerCase = letter.toLowerCase();
    if (letter !== letterLowerCase && i !== 0) {
      dashCaseLetters.push('-');
    }
    dashCaseLetters.push(letterLowerCase);
  }
  return dashCaseLetters.join('');
}

function removeInvalidCharacters(name) {
  return name.replace(/^[^a-z]+/, '').replace(/[^a-z0-9-]/g, '');
}

function incrementTagName(tag, counter, start = 1) {
  const newName = counter === start ? tag : `${tag}-${counter}`;
  const elementRegistered = !!customElements.get(newName);
  if (elementRegistered) {
    return incrementTagName(tag, counter + 1, start);
  }
  return newName;
}

function getClassUniqueTag(klass) {
  let tag = registeredElements.get(klass);

  if (tag) {
    return tag;
  }

  if (Object.prototype.hasOwnProperty.call(klass, 'name') && klass.name) {
    tag = removeInvalidCharacters(toDashCase(klass.name));
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
}

export default function transform(strings, values) {
  if (values.length === 0) {
    return [strings];
  }
  const newStrings = [];
  newStrings.raw = [];
  const result = [0]; // first index is reserved for strings
  let mergeWithLastString = false;
  values.forEach((value, index) => {
    const string = strings[index];
    const stringRaw = strings.raw[index];
    if (value && value.prototype instanceof HTMLElement) {
      const tag = getClassUniqueTag(value);
      if (mergeWithLastString) {
        const lastString = newStrings[newStrings.length - 1];
        const lastStringRaw = newStrings.raw[newStrings.raw.length - 1];
        newStrings[newStrings.length - 1] = `${lastString}${tag}${strings[index + 1]}`;
        newStrings.raw[newStrings.raw.length - 1] = String.raw`${lastStringRaw}${tag}${strings.raw[index + 1]}`;
      } else {
        newStrings.push(`${string}${tag}${strings[index + 1]}`);
        newStrings.raw.push(String.raw`${stringRaw}${tag}${strings.raw[index + 1]}`);
      }
      mergeWithLastString = true;
    } else {
      if (!mergeWithLastString) {
        newStrings.push(string);
        newStrings.raw.push(stringRaw);
      }
      result.push(value);
      mergeWithLastString = false;
    }
  });
  if (!mergeWithLastString) {
    newStrings.push(strings[strings.length - 1]);
    newStrings.raw.push(strings.raw[strings.raw.length - 1]);
  }

  const cacheKey = newStrings.join(CACHE_SEPARATOR);
  const cachedStrings = cache.get(cacheKey);
  if (cachedStrings) {
    result[0] = cachedStrings;
  } else {
    result[0] = newStrings;
    cache.set(cacheKey, newStrings);
  }

  return result;
}
