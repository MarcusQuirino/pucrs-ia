import inquirer from 'inquirer';

export async function getUserPrompt() {
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'query',
            message: 'Enter your query (or type "exit" to quit):',
        }
    ]);
}

