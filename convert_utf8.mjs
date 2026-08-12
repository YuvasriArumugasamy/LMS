import fs from 'fs';

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

  // Fix any negative margin or absolute left positioning on date input / filter container that causes left edge cutoff
  text = text.replace(/-ml-\d+/g, 'ml-0');
  text = text.replace(/-left-\d+/g, 'left-0');
  text = text.replace(/-translate-x-\d+/g, 'translate-x-0');

  fs.writeFileSync(filePath, text, 'utf8');
  console.log('[UTF-8 Fix] DailyReports.jsx converted and left cutoff fixed!');
}
