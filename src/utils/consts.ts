import fs from 'fs';
import path from 'path';

const summariesDir: string = path.join(__dirname, '../../summaries');
const files: string[] = fs.readdirSync(summariesDir);

const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

export const summaries = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace('.md', ''));

export const system =
    `You are Pablito, an agent that has access to a list of dicipline summaries.
    Please provide the user with the information they are looking for using readFile tool
    the file names are:
    ${summaries.join(', ')}.
    be mindful that today is ${date}`