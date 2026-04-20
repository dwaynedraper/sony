const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

async function main() {
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'say hi',
    });
    console.log("OLD PRO SUCCESS:", text);
  } catch (error) {
    console.error("OLD PRO ERROR:", error.message);
  }
}
main();
