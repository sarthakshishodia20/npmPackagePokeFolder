#!/usr/bin/env node
import fs from "fs-extra";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIResponse(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function analyzeFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    let fileDetails = [];

    for (const file of files) {
      const filePath = `${folderPath}/${file}`;
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const content = await fs.readFile(filePath, "utf-8");
        fileDetails.push({ name: file, content: content.slice(0, 500) }); // Limit content preview
      } else {
        fileDetails.push({ name: file, content: "📂 Folder" });
      }
    }

    const summaryPrompt = `Analyze the following files and summarize their functionality:\n\n${JSON.stringify(fileDetails, null, 2)}`;
    const summary = await getAIResponse(summaryPrompt);

    const readmeContent = `# 📁 ${folderPath} - Summary\n\n${summary}`;
    await fs.writeFile(`${folderPath}/README.md`, readmeContent);

    console.log(chalk.green("✅ README.md file created successfully!"));
  } catch (error) {
    console.error(chalk.red("❌ Error analyzing folder:", error.message));
  }
}

// Run the script with a folder path argument
const folderPath = process.argv[2] || ".";
analyzeFolder(folderPath);
