const fs = require("fs");
const OpenAI = require("openai");

const CONSTANTS = {
  ARTICLE_URL:
    "https://cdn.oxido.pl/hr/Zadanie%20dla%20JJunior%20AI%20Developera%20-%20tresc%20artykulu.txt",
  OUTPUT_FILES: {
    ARTICLE: "artykul.html",
    PREVIEW: "podglad.html",
    TEMPLATE: "szablon.html",
  },
  OPENAI: {
    MODEL: "gpt-4o-2024-08-06",
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.5,
  },
};

const HTML_GENERATOR_PROMPT =
`You are an HTML generator specialized in converting articles into structured HTML content.

Your output must strictly follow these specifications:

1. CRITICAL: Preserve ALL original text
   - Include every single word from the input text
   - Maintain the exact same content and meaning
   - Do not skip, summarize, or modify any part of the original text

2. Use semantic HTML tags (<article>, <section>, <h1>, <p>, etc.) to structure the content appropriately
   - Break paragraphs only where they exist in the original text
   - Use appropriate heading levels to maintain hierarchy

3. Visual content requirements:
   - Strategically place <img> elements where visuals would enhance reader engagement and comprehension
   - Configure each <img> with:
     * src="image_placeholder.jpg"
     * alt attribute containing precise image generation instructions

4. Caption specifications:
   - Accompany each <img> with a <figcaption>
   - Provide contextual descriptions in <figcaption> matching the article's language
   - Encapsulate image-caption pairs in <figure> elements

5. Technical constraints:
   - Generate only the content meant for <body> tags
   - Exclude <html>, <head>, and <body> tags
   - Omit CSS and JavaScript
   - Use pure HTML (no markdown)

Your primary goal is to maintain 100% content fidelity while adding appropriate HTML structure and image placeholders.`;

async function readArticle() {
  try {
    const response = await fetch(CONSTANTS.ARTICLE_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch article: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Failed to read article: ${error.message}`);
  }
}

async function generateHtml(articleContent, openai) {
  if (!articleContent || typeof articleContent !== "string") {
    throw new Error("Invalid article content provided");
  }

  const response = await openai.chat.completions.create({
    model: CONSTANTS.OPENAI.MODEL,
    messages: [
      {
        role: "system",
        content: HTML_GENERATOR_PROMPT,
      },
      {
        role: "user",
        content: articleContent,
      },
    ],
    max_tokens: CONSTANTS.OPENAI.MAX_TOKENS,
    n: 1,
    temperature: CONSTANTS.OPENAI.TEMPERATURE,
  });

  if (!response.choices?.[0]?.message?.content) {
    throw new Error("Failed to generate HTML content");
  }

  return response.choices[0].message.content.trim();
}

async function saveOutput(htmlContent, outputPath) {
  if (!htmlContent || typeof htmlContent !== "string") {
    throw new Error("Invalid HTML content provided");
  }

  try {
    await fs.promises.writeFile(outputPath, htmlContent, "utf-8");
  } catch (error) {
    throw new Error(`Failed to save output to ${outputPath}: ${error.message}`);
  }
}

async function savePreview(htmlContent, outputPath) {
  if (!htmlContent || typeof htmlContent !== "string") {
    throw new Error("Invalid HTML content provided");
  }

  try {
    const template = await fs.promises.readFile(
      CONSTANTS.OUTPUT_FILES.TEMPLATE,
      {
        encoding: "utf-8",
      }
    );

    const modifiedTemplate = template.replace("<body>", `<body>${htmlContent}`);
    await fs.promises.writeFile(outputPath, modifiedTemplate, "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to save preview to ${outputPath}: ${error.message}`
    );
  }
}

async function getApiKey() {
  return new Promise((resolve) => {
    process.stdout.write("Please enter your OpenAI API key: ");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    let key = "";

    process.stdin.on("data", (char) => {
      if (char[0] === 3) {
        console.log("\nOperation cancelled");
        process.exit(1);
      } else if (char[0] === 13) {
        process.stdin.setRawMode(false);
        process.stdout.write("\n");
        process.env.API_KEY = key;
        resolve(key);
      } else if (char[0] === 127) {
        if (key.length) {
          key = key.slice(0, -1);
        }
      } else {
        key += char;
      }
    });
  });
}

async function main() {
  try {
    if (!process.env.API_KEY) {
      await getApiKey();
    }

    const openai = new OpenAI({
      apiKey: process.env.API_KEY,
    });

    console.log("Fetching article...");
    const articleContent = await readArticle();

    console.log("Generating HTML content...");
    const htmlContent = await generateHtml(articleContent, openai);

    console.log("Saving output files...");
    await Promise.all([
      saveOutput(htmlContent, CONSTANTS.OUTPUT_FILES.ARTICLE),
      savePreview(htmlContent, CONSTANTS.OUTPUT_FILES.PREVIEW),
    ]);

    console.log("Successfully completed all operations");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
