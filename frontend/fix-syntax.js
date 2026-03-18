const fs = require('fs');
const path = 'C:/prejud-saas-new/frontend/app/(dashboard)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Mapeamento de correções por número de linha
const corrections = {
  393: { from: /\u00E4$/, to: '{' },           // ä -> {
  394: { from: /\u00E4$/, to: '{' },           // ä -> {
  405: { from: /\u00FC;/, to: '};' },           // ü; -> };
  406: { from: /labels\u00C4status\u00DC \u00F6\u00F6 status;/, to: 'labels[status] || status;' },
  407: { from: /^\u00FC$/, to: '}' }           // ü -> }
};

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  if (corrections[lineNum]) {
    const original = lines[i];
    lines[i] = lines[i].replace(corrections[lineNum].from, corrections[lineNum].to);
    console.log(`Linha ${lineNum}: ${original === lines[i] ? 'NÃO ALTERADA' : 'ALTERADA'}`);
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Correção concluída');