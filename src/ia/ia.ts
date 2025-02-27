import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import { system } from '../utils/consts';
import { getTools } from './tools';
import type { Message } from '../types';
export function sendQuestion(messages: Message[]) {
    const { textStream } = streamText({
        model: anthropic('claude-3-7-sonnet-20250219'),
        messages,
        system,
        temperature: 0,
        tools: getTools(),
        maxSteps: 10,
        onStepFinish: ({ toolCalls }) => logToolCalls(toolCalls),
    });

    return textStream
}

function logToolCalls(toolCalls: any) {
    if (Bun.env.DEBUG === "true") {
        console.log('\n');
        console.log('========================================');
        console.log('Tool calls:', toolCalls);
        console.log('========================================');
        console.log('\n');
    }
}