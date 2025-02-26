
import pkg from './package.json';
import { sendQuestion } from './src/ia/ia';
import { getUserPrompt } from './src/utils/inquirer';

console.log(`Pablito IA version: ${pkg.version}`);

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

let conversationHistory: Message[] = [];

async function handleQuery() {
    let continueQuerying = true;

    while (continueQuerying) {
        try {
            const { query } = await getUserPrompt()

            if (query.toLowerCase() === 'exit') {
                continueQuerying = false;
                continue;
            }

            conversationHistory.push({ role: 'user', content: query });

            const response = await processQuery(query);

            conversationHistory.push({ role: 'assistant', content: response });

            if (query.toLowerCase() === 'new') {
                conversationHistory = []
            }

            if (query.toLowerCase() === 'history') {
                console.log('\n--- Conversation History ---');
                conversationHistory.forEach((msg) => {
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

async function processQuery(userQuestion: string) {
    let responseText = '';

    const textStream = sendQuestion(userQuestion)

    for await (const textPart of textStream) {
        process.stdout.write(textPart);
        responseText += textPart;
    }

    console.log('\n');

    return responseText;
}

handleQuery().catch(console.error);