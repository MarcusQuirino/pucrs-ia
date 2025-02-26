import { tool } from "ai";
import { z } from "zod";
import { summaries } from "../utils/consts";
import { readFile } from 'fs/promises';

export function getTools() {
    return {
        readFile: tool({
            description:
                `Read a file from the summaries folder. with a given name. available files are: ${summaries.join(', ')}`,
            parameters: z.object({
                fileName: z.string().describe('The file name to read.'),
            }),
            execute: readSummaryFile
        }),
    }
}

async function readSummaryFile({ fileName }: { fileName: string }) {
    console.log('Executing read file...');
    const results = await readFile(`summaries/${fileName}.md`, 'utf8');
    return results;
}