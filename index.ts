import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { readFile } from 'fs/promises';
import { z } from 'zod';
import pkg from './package.json';
import * as readline from 'readline';

const summaries = ['infraestrutura-para-gestao-de-dados', 'algoritimos-e-estruturas-de-dados-II', 'probabilidade-e-estatistica', 'todas']

console.log(`PUCRS IA version: ${pkg.version}`);

// Create a list to store conversation history
type Message = {
    role: 'user' | 'assistant';
    content: string;
};

// Initialize conversation history
const conversationHistory: Message[] = [];

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to handle the query process
async function handleQuery() {
    let continueQuerying = true;

    while (continueQuerying) {
        try {
            // Prompt user for query
            const query = await new Promise<string>((resolve) => {
                rl.question('Enter your query (or type "exit" to quit): ', resolve);
            });

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

    // Close the readline interface when done
    rl.close();
}

// Function to process a query and return the response
async function processQuery(userQuestion: string): Promise<string> {
    let responseText = '';

    const { textStream } = streamText({
        model: anthropic('claude-3-7-sonnet-20250219'),
        prompt: userQuestion,
        system:
            `You are an agent that has access a list of dicipline summaries. 
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
            console.log('Tool calls:', toolCalls);
        },
    });

    console.log('\n\nPUCRS IA: ');

    for await (const textPart of textStream) {
        process.stdout.write(textPart);
        responseText += textPart;
    }

    console.log('\n');
    return responseText;
}

// Call the function to start the query loop
handleQuery().catch(console.error);