const fs = require('fs');
let content = fs.readFileSync('src/app/camera-finder/data/cameras.ts', 'utf8');

content = content.replace(
  /name: "A6100",([^]*?)builtinFlash: false/m,
  'name: "A6100",$1builtinFlash: true'
);

content = content.replace(
  /name: "A6400",([^]*?)builtinFlash: false/m,
  'name: "A6400",$1builtinFlash: true'
);

fs.writeFileSync('src/app/camera-finder/data/cameras.ts', content, 'utf8');
