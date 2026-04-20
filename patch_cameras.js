const fs = require('fs');

let content = fs.readFileSync('src/app/camera-finder/data/cameras.ts', 'utf8');

// Add to interface
content = content.replace(
  /hasEVF: boolean;/g,
  `hasEVF: boolean;\n  builtinFlash: boolean;`
);

// Add to all cameras
content = content.replace(
  /hasEVF: (true|false),/g,
  `hasEVF: $1,\n    builtinFlash: false,`
);

fs.writeFileSync('src/app/camera-finder/data/cameras.ts', content, 'utf8');
