import mongoose from 'mongoose';
import fs from 'fs';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/elms_enterprise');
  const users = await mongoose.connection.db.collection('users').find({ isDeleted: false }, { projection: { email: 1, firstName: 1, lastName: 1, role: 1, employeeId: 1 } }).toArray();
  fs.writeFileSync('./users_output.json', JSON.stringify(users, null, 2));
  console.log('Done');
  process.exit(0);
}

main().catch(err => {
  fs.writeFileSync('./users_output.json', JSON.stringify({ error: err.message || String(err) }));
  process.exit(1);
});
