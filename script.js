const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

async function readArticle() {
    return await fetch('https://cdn.oxido.pl/hr/Zadanie%20dla%20JJunior%20AI%20Developera%20-%20tresc%20artykulu.txt').then(response => response.text());
}

async function generateHtml(articleContent) {
    const prompt = 
`You are an HTML generator specialized in converting articles into structured HTML content.

Your output must strictly follow these specifications:

1. Use semantic HTML tags (<article>, <section>, <h1>, <p>, etc.) to structure the content appropriately

2. Visual content requirements:
   - Strategically place <img> elements where visuals would enhance reader engagement and comprehension
   - Configure each <img> with:
     * src="image_placeholder.jpg"
     * alt attribute containing precise image generation instructions

3. Caption specifications:
   - Accompany each <img> with a <figcaption>
   - Provide contextual descriptions in <figcaption> matching the article's language
   - Encapsulate image-caption pairs in <figure> elements

4. Technical constraints:
   - Generate only the content meant for <body> tags
   - Exclude <html>, <head>, and <body> tags
   - Omit CSS and JavaScript
   - Use pure HTML (no markdown)

Process the provided article according to these specifications.`;
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06',
        messages: [
            {
                role: 'system',
                content: prompt
            },
            {
                role: 'user',
                content: articleContent
            }
        ],
        max_tokens: 2048,
        n: 1,
        temperature: 0.5,
    });
    return response.choices[0].message.content.trim();
}

async function saveOutput(htmlContent, outputPath) {
    await fs.promises.writeFile(outputPath, htmlContent, 'utf-8');
}

async function savePreview(htmlContent, outputPath) {
    let template = await fs.promises.readFile("szablon.html", {encoding: 'utf-8'});
    const modifiedTemplate = template.replace('<body>', `<body>${htmlContent}`);
    await fs.promises.writeFile(outputPath, modifiedTemplate, 'utf-8');
}

async function main() {
    const articleContent = await readArticle();
    const htmlContent = await generateHtml(articleContent);
    await saveOutput(htmlContent, 'artykul.html');
    await savePreview(htmlContent, 'podglad.html');
    console.log("done");
}

main().catch(console.error);
