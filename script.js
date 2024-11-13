const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

async function readArticle() {
    return await fetch('https://cdn.oxido.pl/hr/Zadanie%20dla%20JJunior%20AI%20Developera%20-%20tresc%20artykulu.txt').then(response => response.text());
}

async function generateHtml(articleContent) {
    const prompt = `
    Generate code for the article below. The code should adhere to the following guidelines:
Use appropriate HTML tags to structure the content.
Identify places where images would be beneficial, marking them with the <img> tag and the attribute src="image_placeholder.jpg". Include an alt attribute for each image with a detailed description that can be used to generate the graphic.
Place captions under the images using the appropriate HTML tag.
Do not include any CSS or JavaScript code. The returned code should contain only the content to be placed between the <body> and </body> tags. Do not include <html>, <head>, or <body> tags.
Return only html and do not use any markdown code!
    Here is the article:
    \n\n${articleContent}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 2048,
        n: 1,
        temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
}

async function saveHtml(htmlContent, outputPath) {
    await fs.promises.writeFile(outputPath, htmlContent, 'utf-8');
}

async function main() {
    const articleContent = await readArticle();
    const htmlContent = await generateHtml(articleContent);
    await saveHtml(htmlContent, 'artykul.html');
    console.log("done");
}

main().catch(console.error);
