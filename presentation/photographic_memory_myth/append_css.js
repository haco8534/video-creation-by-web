const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');
const extra = fs.readFileSync('custom_visuals.css', 'utf8');
css += '\n' + extra;
fs.writeFileSync('style.css', css, 'utf8');
console.log('CSS lines:', css.split(/\r?\n/).length);
