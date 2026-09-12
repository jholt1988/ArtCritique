const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// I need to pull the original server.ts before I messed it up, but how? 
// It's in the terminal output. No, I don't have it saved on disk.
