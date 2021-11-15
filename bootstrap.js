/**
 * SUITS (Spacesuit User Interface Technologies for Students)
 * Process Bootstrap Script
 * Facilitates starting all process defined in package.json > suits.bootstrap[]
 * 
 * Developer(s): Nick Davis [Metecs] JSC-ER711
 */
 const figlet = require('figlet');
 const package = require('./package.json');
 const fork = require('child_process').fork;
 const jsonPack = require('jsonpack');
 const dotenv = require('dotenv').config(); // << Not sure if we need to run here or every subproc ¯\_(ツ)_/¯

 async function main() {
    console.log(`SUITS Bootstrap Process Starting...`);
    console.log(`Starting SUITS Services`);
    figlet('SUITS', (err, res) => {
        if(err) {
            // ...
        } else {
            let dashes = '-------------------------------------------------';
            console.log('\n' + dashes);
            console.log(res + `\n(Spacesuit User Interface Technologies for Students)\nReal-time Telemetry Stream and Commander\n\nTechnical Contact:\nResponsible NASA Official: Paromita Mitra\nparomita.mitra@nasa.gov\nCurator: Nicholas Davis\nnicholas.r.davis@nasa.gov\n`);
            console.log(dashes);
        }

        if(package.suits.bootstrap.length > 0) {
            package.suits.bootstrap.forEach((inst, idx) => {
                // Use JSONPack to bundle all of the services args
                // this prevents ordering issues and gives us a JSON obj in the service
                let argPayload = []; //jsonPack.pack(inst);
    
                if(inst.enabled) {
                    console.log(`Starting ${inst.name}`);
                    let instance = fork(inst.script, [...argPayload]);
                }
            });
        }
    });
 }

 main();
