const fs = require('fs');
let code = fs.readFileSync('src/components/MentorChat.tsx', 'utf8');
code = code.replace(/id: 'user_' \+ Date\.now\(\),/g, "id: 'user_' + Date.now() + Math.random().toString(36).substring(2),");
code = code.replace(/id: 'assistant_' \+ Date\.now\(\),/g, "id: 'assistant_' + Date.now() + Math.random().toString(36).substring(2),");
code = code.replace(/id: 'err_' \+ Date\.now\(\),/g, "id: 'err_' + Date.now() + Math.random().toString(36).substring(2),");
fs.writeFileSync('src/components/MentorChat.tsx', code);
