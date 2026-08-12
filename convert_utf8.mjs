import fs from 'fs';

const filePath = 'c:/Users/HP/OneDrive/Attachments/OneDrive/Desktop/LMS/client/src/pages/DailyReports.jsx';
const buf = fs.readFileSync(filePath);

let text = '';
if (buf[0] === 0xff && buf[1] === 0xfe) {
  text = buf.toString('utf16le');
} else if (buf[0] === 0xfe && buf[1] === 0xff) {
  text = buf.toString('hex');
} else {
  text = buf.toString('utf8');
}

// Clean any bad surrogate characters or broken emojis
text = text.replace(/[^\x00-\x7F]/g, '');

fs.writeFileSync(filePath, text, 'utf8');
console.log('DailyReports.jsx converted to UTF-8!');
