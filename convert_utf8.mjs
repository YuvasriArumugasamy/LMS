import fs from 'fs';
import path from 'path';

const filePath = 'client/src/pages/DailyReports.jsx';
if (fs.existsSync(filePath)) {
  const buf = fs.readFileSync(filePath);

  let text = '';
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    text = buf.toString('utf16le');
  } else if (buf[0] === 0xfe && buf[1] === 0xff) {
    text = buf.toString('hex');
  } else {
    text = buf.toString('utf8');
  }

  // Clean non-ASCII bytes
  text = text.replace(/[^\x00-\x7F]/g, '');

  // 1. Remove all negative left margins in Tailwind classes (-ml-*, -ml-[*])
  text = text.replace(/-ml-(?:\[[^\]]+\]|\S+)/g, 'ml-0');
  
  // 2. Remove all negative left absolute/relative offsets (-left-*, -left-[*])
  text = text.replace(/-left-(?:\[[^\]]+\]|\S+)/g, 'left-0');
  
  // 3. Remove all negative X translations (-translate-x-*, -translate-x-[*])
  text = text.replace(/-translate-x-(?:\[[^\]]+\]|\S+)/g, 'translate-x-0');

  // 4. Remove inline style negative margins and left offsets
  text = text.replace(/marginLeft\s*:\s*['"]-[^'"]+['"]/g, "marginLeft: '0px'");
  text = text.replace(/left\s*:\s*['"]-[^'"]+['"]/g, "left: '0px'");

  fs.writeFileSync(filePath, text, 'utf8');
  console.log('[UTF-8 Fix] DailyReports.jsx sanitized completely!');
}
