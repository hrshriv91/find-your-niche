/* Build compact production bundles without adding runtime dependencies. */
const fs = require('node:fs/promises');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const sourceScripts = ['main.js', 'match.js', 'profile-ui.js', 'quiz.js', 'exam-match.js', 'exam-ui.js'];

function minifyJavaScript(source) {
  let output = '';
  let quote = '';
  let pendingSpace = false;
  let index = 0;

  const needsSeparator = (left, right) => {
    const wordCharacter = /[\w$]/;
    return (wordCharacter.test(left || '') && wordCharacter.test(right || ''))
      || (left === '+' && right === '+')
      || (left === '-' && right === '-')
      || (left === '/' && (right === '/' || right === '*'));
  };

  const append = (character) => {
    const previous = output[output.length - 1];
    if (pendingSpace && needsSeparator(previous, character)) output += ' ';
    pendingSpace = false;
    output += character;
  };

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (quote) {
      output += current;
      if (current === '\\' && index + 1 < source.length) {
        output += source[index + 1];
        index += 2;
        continue;
      }
      if (current === quote) quote = '';
      index += 1;
      continue;
    }

    if (/\s/.test(current)) {
      pendingSpace = true;
      index += 1;
      continue;
    }

    if (current === '"' || current === "'" || current === '`') {
      quote = current;
      append(current);
      index += 1;
      continue;
    }

    if (current === '/' && next === '/') {
      pendingSpace = true;
      index += 2;
      while (index < source.length && source[index] !== '\n') index += 1;
      continue;
    }

    if (current === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      if (end < 0) throw new Error('Unclosed JavaScript comment in source bundle.');
      pendingSpace = true;
      index = end + 2;
      continue;
    }

    append(current);
    index += 1;
  }

  return output.trim();
}

function minifyCss(source) {
  let output = '';
  let quote = '';
  let pendingSpace = false;
  let index = 0;

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (quote) {
      output += current;
      if (current === '\\' && index + 1 < source.length) {
        output += source[index + 1];
        index += 2;
        continue;
      }
      if (current === quote) quote = '';
      index += 1;
      continue;
    }

    if (current === '"' || current === "'") {
      if (pendingSpace && output && !/[{;,]$/.test(output)) output += ' ';
      pendingSpace = false;
      quote = current;
      output += current;
      index += 1;
      continue;
    }

    if (current === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      if (end < 0) throw new Error('Unclosed CSS comment in source bundle.');
      pendingSpace = true;
      index = end + 2;
      continue;
    }

    if (/\s/.test(current)) {
      pendingSpace = true;
      index += 1;
      continue;
    }

    if ('{};,'.includes(current)) {
      output = output.replace(/\s+$/, '') + current;
      pendingSpace = false;
      index += 1;
      continue;
    }

    if (pendingSpace && output && !/[{;,]$/.test(output)) output += ' ';
    pendingSpace = false;
    output += current;
    index += 1;
  }

  return output.trim();
}

async function build() {
  const cssSourcePath = path.join(projectRoot, 'css', 'style.css');
  const cssSource = await fs.readFile(cssSourcePath, 'utf8');
  const scriptSources = await Promise.all(sourceScripts.map((file) =>
    fs.readFile(path.join(projectRoot, 'js', file), 'utf8')
  ));

  const cssBundle = minifyCss(cssSource);
  const jsBundle = scriptSources.map(minifyJavaScript).join(';');
  const cssOutputPath = path.join(projectRoot, 'css', 'style.min.css');
  const jsOutputPath = path.join(projectRoot, 'js', 'app.min.js');

  await Promise.all([
    fs.writeFile(cssOutputPath, cssBundle, 'utf8'),
    fs.writeFile(jsOutputPath, jsBundle, 'utf8')
  ]);

  console.log(`Built css/style.min.css (${cssBundle.length} bytes)`);
  console.log(`Built js/app.min.js (${jsBundle.length} bytes)`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
