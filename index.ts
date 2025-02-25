import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { readFile } from 'fs/promises';
import { z } from 'zod';
import pkg from './package.json';
import inquirer from 'inquirer';

const fs = require('fs');
const path = require('path');

function getSummaryFiles(): string[] {
    const summariesDir: string = path.join(__dirname, 'summaries');
    const files: string[] = fs.readdirSync(summariesDir);

    const summaryFiles = files
        .filter((file) => file.endsWith('.md'))
        .map((file) => file.replace('.md', ''));

    return summaryFiles;
}

const summaries = getSummaryFiles();

console.log(`Pablito IA version: ${pkg.version}`);

// Create a list to store conversation history
type Message = {
    role: 'user' | 'assistant';
    content: string;
};

// Initialize conversation history
const conversationHistory: Message[] = [];

// Function to handle the query process
async function handleQuery() {
    let continueQuerying = true;

    while (continueQuerying) {
        try {
            // Prompt user for query using inquirer
            const { query } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'query',
                    message: 'Enter your query (or type "exit" to quit):',
                }
            ]);

            // Check if user wants to exit
            if (query.toLowerCase() === 'exit') {
                continueQuerying = false;
                continue;
            }

            // Add user message to history
            conversationHistory.push({ role: 'user', content: query });

            // Process the query using the main function
            const response = await processQuery(query);

            // Add assistant response to history
            conversationHistory.push({ role: 'assistant', content: response });

            // Display conversation history if requested
            if (query.toLowerCase() === 'history') {
                console.log('\n--- Conversation History ---');
                conversationHistory.forEach((msg, index) => {
                    console.log(`[${msg.role}]: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
                });
                console.log('---------------------------\n');
            }

        } catch (error) {
            console.error('Error processing query:', error);
        }
    }

    console.log('Goodbye!');
}

// Function to process a query and return the response
async function processQuery(userQuestion: string): Promise<string> {
    let responseText = '';

    const { textStream } = streamText({
        model: anthropic('claude-3-7-sonnet-20250219'),
        prompt: userQuestion,
        system:
            `You are Pablito, an agent that has access to a list of dicipline summaries. 
      Please provide the user with the information they are looking for by using readFile tool
      the file names are:
      ${summaries.join(', ')}`,
        tools: {
            readFile: tool({
                description:
                    `Read a file from the summaries folder. with a given name. available files are: ${summaries.join(', ')}`,
                parameters: z.object({
                    fileName: z.string().describe('The file name to read.'),
                }),
                execute: async ({ fileName }) => {
                    console.log('Executing read file...');
                    const results = await readFile(`summaries/${fileName}.md`, 'utf8');
                    return results;
                },
            }),
        },
        maxSteps: 10,
        onStepFinish: ({ toolCalls }) => {
            console.log('\n');
            console.log('========================================');
            console.log('Tool calls:', toolCalls);
            console.log('========================================');
            console.log('\n');
        },
    });

    for await (const textPart of textStream) {
        process.stdout.write(textPart);
        responseText += textPart;
    }

    console.log('\n');

    return responseText;
}

// Call the function to start the query loop
handleQuery().catch(console.error);