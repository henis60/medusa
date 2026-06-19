const fs = require('fs');
const path = require('path');

// Read the landingChunks file
const content = fs.readFileSync('./landingChunks.ts', 'utf8');

// Function to unescape the JSON string
function unescapeHtml(str) {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

// Extract PRE_HTML
const preMatch = content.match(/export const PRE_HTML = "([\s\S]*?)"\n\nexport/);
if (preMatch) {
  const html = unescapeHtml(preMatch[1]);
  fs.writeFileSync('./chunks/PRE_HTML.html', html);
  console.log('✓ Extracted PRE_HTML');
}

// Extract MIDDLE_HTML
const middleMatch = content.match(/export const MIDDLE_HTML = "([\s\S]*?)"\n\nexport/);
if (middleMatch) {
  const html = unescapeHtml(middleMatch[1]);
  fs.writeFileSync('./chunks/MIDDLE_HTML.html', html);
  console.log('✓ Extracted MIDDLE_HTML');
}

// Extract POST_HTML
const postMatch = content.match(/export const POST_HTML = "([\s\S]*?)"$/);
if (postMatch) {
  const html = unescapeHtml(postMatch[1]);
  fs.writeFileSync('./chunks/POST_HTML.html', html);
  console.log('✓ Extracted POST_HTML');
}
