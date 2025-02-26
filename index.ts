
import pkg from './package.json';
import { sendQuestion } from './src/ia/ia';
import { getUserPrompt } from './src/utils/inquirer';
import type { Message } from './src/types';

console.log(`Pablito IA version: ${pkg.version}`);

let conversationHistory: Message[] = [];

async function handleQuery() {
    let continueQuerying = true;

    while (continueQuerying) {
        try {
            const { query } = await getUserPrompt()

            conversationHistory.push({ role: 'user', content: query });

            if (query.toLowerCase() === 'exit') {
                continueQuerying = false;
                continue;
            }

            if (query.toLowerCase() === 'new') {
                conversationHistory = []
                console.log('\n--- New conversation started ---\n');
                continue;
            }

            if (query.toLowerCase() === 'history') {
                console.log('\n--- Conversation History ---');
                conversationHistory.forEach((msg) => {
                    console.log(`[${msg.role}]: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
                });
                console.log('---------------------------\n');
                continue;
            }

            const response = await processQuery(conversationHistory);

            conversationHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            console.error('Error processing query:', error);
        }
    }

    console.log('Goodbye!');
}

async function processQuery(conversationHistory: Message[]) {
    let responseText = '';

    const textStream = sendQuestion(conversationHistory)

    for await (const textPart of textStream) {
        process.stdout.write(textPart);
        responseText += textPart;
    }

    console.log('\n');

    return responseText;
}

handleQuery().catch(console.error);