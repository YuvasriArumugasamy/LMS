import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/HP/Downloads';
const destAssetsDir = 'C:/Users/HP/OneDrive/Attachments/OneDrive/Desktop/LMS/client/src/assets';
const destPublicDir = 'C:/Users/HP/OneDrive/Attachments/OneDrive/Desktop/LMS/client/public/leave-cards';

fs.mkdirSync(destAssetsDir, { recursive: true });
fs.mkdirSync(destPublicDir, { recursive: true });

const files = [
  { name: 'ChatGPT Image Aug 4, 2026, 05_12_52 PM.png', code: 'CL' },
  { name: 'ChatGPT Image Aug 4, 2026, 05_13_05 PM.png', code: 'EL' },
  { name: 'ChatGPT Image Aug 4, 2026, 05_13_13 PM.png', code: 'EML' },
  { name: 'ChatGPT Image Aug 4, 2026, 05_15_35 PM.png', code: 'SL' }
];

for (const item of files) {
  const src = path.join(srcDir, item.name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(destAssetsDir, item.name));
    fs.copyFileSync(src, path.join(destPublicDir, `${item.code}.png`));
    console.log(`Successfully copied ${item.name} as ${item.code}.png`);
  } else {
    console.log(`Not found: ${src}`);
  }
}
