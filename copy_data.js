const fs = require('fs');

const toolsContent = fs.readFileSync('../sony-tools/src/app/page.tsx', 'utf8');

// Extract everything from "type Focus = ..." to the end of "const CAMERAS: Camera[] = [ ... ];"
const startStr = "type Focus = ";
const startIndex = toolsContent.indexOf(startStr);
const endStr = "];\n\nconst STEP_TITLES";
const endIndex = toolsContent.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

let extracted = toolsContent.substring(startIndex, endIndex + 2);

// Rename types to match our current conventions, or just stick to the new ones
extracted = extracted.replace(/type Camera =/g, 'export type CameraModel =');
extracted = extracted.replace(/Camera;/g, 'CameraModel;');
extracted = extracted.replace(/Camera\[\]/g, 'CameraModel[]');
extracted = extracted.replace(/Camera,/g, 'CameraModel,');
extracted = extracted.replace(/\(camera: Camera,/g, '(camera: CameraModel,');
extracted = extracted.replace(/const CAMERAS: (.*) = \[/g, 'export const cameras: $1 = [');

// Export types
extracted = extracted.replace(/type Focus =/g, 'export type Focus =');
extracted = extracted.replace(/type Skill =/g, 'export type Skill =');
extracted = extracted.replace(/type Intent =/g, 'export type Intent =');
extracted = extracted.replace(/type Budget =/g, 'export type Budget =');
extracted = extracted.replace(/type FormFactor =/g, 'export type FormFactor =');
extracted = extracted.replace(/type UseCase =/g, 'export type UseCase =');
extracted = extracted.replace(/type MustHave =/g, 'export type MustHave =');

// We don't need Answers, RankedResult, AiCopy here, they go to types.ts or we can just leave them if we want
extracted = extracted.replace(/type Answers = \{[\s\S]*?\};\n/, '');
extracted = extracted.replace(/type RankedResult = \{[\s\S]*?\};\n/, '');
extracted = extracted.replace(/type AiCopy = \{[\s\S]*?\};\n/, '');
extracted = extracted.replace(/type GenreOption = \{[\s\S]*?\};\n/, '');
extracted = extracted.replace(/function getAlternativeAiReason[\s\S]*?\n\}\n/g, '');
extracted = extracted.replace(/const MUST_HAVE_LABELS: Record<MustHave, string> = \{[\s\S]*?\};\n/g, '');

fs.writeFileSync('src/app/camera-finder/data/cameras.ts', extracted, 'utf8');
console.log("Transplanted data to cameras.ts");
