#!/user/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import axios from 'axios';
import { appendFileSync } from 'fs';

class resultModel {
    constructor(name="", agify_response="", genderize_response="", nationalize_response="") {
        this.name = name;
        this.agify_response = agify_response;
        this.genderize_response = genderize_response;
        this.nationalize_response = nationalize_response;

    }

    saveAsCSV() {
        console.log(this.agify_response)
        let csv = `
------------------------------------------------ ${Date.now()}
Hello ${this.name} !
\n
In this txt file you will find your data in very readable style.
\n
According to your name, you are probably ${this.agify_response.age} years old ${this.genderize_response.gender}.
\n
It might not very accurate I know its very sad.
\n            
The probability of being ${this.genderize_response.gender} is ${this.genderize_response.probability}.
\n
But let's look at possible countries!
\n        
`
        this.nationalize_response.country.forEach(function(value){
            csv += ` You are from ${value.country_id} with probability ${value.probability}\n`;
        })

        try{
            appendFileSync(`./${this.name}_result.txt`, csv);
        } catch(e){
            console.error(e);
        }
    }
}  

let playerName;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome(){
    const rainbowTitle = chalkAnimation.rainbow(
        "Welcome my dear friend!\n"
    );

    await sleep();
    rainbowTitle.stop();

    console.log(`
        ${chalk.bgBlue("How to play?")}
        I am process on your computer
    `);
}

async function askName(){
    const answers = await inquirer.prompt({
        name: 'player_name',
        type: 'input',
        message: 'What is your name?',
        default(){
            return 'Player';
        },
    });

    playerName = answers.player_name;
}

async function question1(){
    const answers = await inquirer.prompt({
        name: 'question1',
        type: 'list',
        message: 'Select output type please!',
        choices: [
            ' CSV ',
            ' Command line ',
            ' I want nothing from you! ',
        ],
    });

    if (answers.question1 == ' CSV '){
        return "csv";
    }else if (answers.question1 == ' I want nothing from you! '){
        return "mail";
    }else{
        return "print";
    }
}

async function fetchAllData() {

    const spinner = createSpinner('Checking answer...').start();
    const [result1, result2, result3] = await Promise.all([
      axios.get(`https://api.agify.io?name=${playerName}`),
      axios.get(`https://api.genderize.io?name=${playerName}`),
      axios.get(`https://api.nationalize.io?name=${playerName}`),
    ]);
    spinner.success({ text: `We got your results ${playerName}.`});
    let response = await question1();

    if (response == "print"){
        console.clear();
        const message = `  Bye Bye ${playerName}`;

        figlet(message, (err, data) => {
            console.log(gradient.pastel.multiline(data));
        });

        console.log(result1.data);
        console.log(result2.data);
        console.log(result3.data);
    }else if (response == "csv"){
        const csv = new resultModel(`${playerName}`, result1.data, result2.data, result3.data);
        csv.saveAsCSV();
    }else{
        const rainbowTitle = chalkAnimation.glitch(
            "CALM DOWN my dear friend! Bye\n"
        );    
        await sleep();
        process.exit(1);
    }

}
  
async function run(){
    await welcome();
    await askName();
    await fetchAllData();
}

run();