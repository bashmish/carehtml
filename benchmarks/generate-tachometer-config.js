const fs = require('fs');
const templateJson = require('./template-tachometer.json');

const templateJsonString = JSON.stringify(templateJson, null, 2);

const args = process.argv.slice(2);
const params = Object.fromEntries(args.map((arg) => arg.slice(1).split('=')));

const tachomaterJsonString = templateJsonString
  .replace(new RegExp('{{measurement}}', 'g'), params.m)
  .replace(new RegExp('{{browser}}', 'g'), params.b);

fs.writeFileSync(`${__dirname}/tachometer.json`, tachomaterJsonString);
