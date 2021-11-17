# SUITS - Telemetry Server

![NASAMeatball](https://www.nasa.gov/sites/all/themes/custom/nasatwo/images/nasa-logo.svg)
<img src="https://microgravityuniversity.jsc.nasa.gov/img/suits/Artemis%20Logo.png" width="105" height="95"/>
<img src="https://microgravityuniversity.jsc.nasa.gov/img/suits/NASASUITS-logo.png" width="95" height="95"/>

## Table of Contents 
1. [Overview](#overview)
2. [Development](#development)
3. [Requirements](#requirements)
4. [Operations](#operations)
5. [Client](#client)
6. [Glossary](#glossary)

## Overview 
SUITS _(Spacesuit User Interface Technologies for Students)_ Telemetry Server is a server-based solution used to generate and distribute data while offering specific real-time data communications - required for student teams to successfully perform the required tasks of the challenge. The server is comprised of open source technologies that are both agnostic in deployment and ubiquitous in distribution. 

## Development
This section is intended to demonstrate how to operate the __telemetry server__ for _"client-based"_ development- not necessarily the development of the telemetry server itself.  
>Warning!: If you are a student or team participating in the SUITS challenge, changes to the __telemetry server__ made by the student/team will not reflect the operation of the server on the test/challenge day. The SUITS technical team will ensure communication of any and all changes including enhancements, and bug fixes to the teams. If you encounter an anomaly or bug with the SUITS-TS, please report it to your SUITS PoC, do not attempt to fix yourself. 

### Requirements  
The SUITS Telemetry Server utilizes open source web-based technologies to simplify the client-side consumption and communication with the server. There are a few requirements that must be met in-order to run the server, however, simply put; the telemetry server should run efficiently on a RaspberryPI 3 Model B+ device with no issue and more so on any modern desktop or laptop. The telemetry server <u>itself</u> is _NOT_ designed to run on mobile devices (e.g. Android phones, phablets, tablets, iOS iPhones, or iPads).

_Min Requirements_  
- OS: Windows 10+, MacOS 10/11, Linux (we recommend Debian or Ubuntu 18+, however, if you can run Chrome or Chromium, the server should run fine).
- CPU: Intel Core or greater, ARMv8 (Advanced RISC Machines), M1 (Apple Silicon) 
- RAM: 1GB LPDDR2 SDRAM or greater
- Software: 
  - [NodeJS LTS](https://nodejs.org/en/)  
  - [AngularCLI](https://angular.io/cli)  
  - If on Ubuntu you will need to get the LTS version of NPM (Node Package Manager). Follow this [link](https://digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04) for assistance.   
  - Git account and client  


## Operations

-----------------------------------------------
*__Pro Tip__ for Windows users! You can use WSL (Windows Subsystem for Linux) to create a Ubuntu 20.04 instance on your machine. Then access your disk with:  
```bash
$ cd /mnt/c/Users/<youracct> 
```

You can then install node and angular directly in the WSL instance and run the server from there.   

-----------------------------------------------  

Start by creating a location on disk where the server should live, but equally a location you will have read/write access. Clone the project into that location.  
```
$ git clone https://github.com/NASA-SUITS-techteam/SUITS-2020-telemetrystream.git 
```  

Since both the server and frontend use NodeJS, we need to use NPM to install dependencies for both of those projects. You will need to run install in two locations:
```bash
# in the root of the project, run the following command
$ npm i
# Now cd into frontend and do the same
$ cd frontend
$ npm i
```

#### __Frontend__
If you are not interested in the frontend commanding application, you my skip this step and go to the server section below.

To build/run the frontend you need to have the Angular CLI installed (from the requirements above). If you already have nodejs installed on your machine, this process is simple.
```bash
# to install angular cli run the following command with 'Admin privileges'
$ npm i -g @angular/cli 
# the above command uses the short-hand 'i' or install and the argument '-g' to place angular in the nodejs global. 
# This gives you access to call the command "ng" when testing or building the frontend.
```
> Warning: If you receive an error with the prefix __EACCES__ this means you do not have rights to install the package. You will need to have administrative rights on the machine or contact your system administrator to have it installed. The same is true for installing PM2 in the server section below.  

Now that angular CLI has been installed, we can cd into the frontend directory and serve the frontend application.
```bash
# Make sure you are in the frontend directory, you can verify if you run ls -la | grep "angular" 
# if you see angular.js - you are in the right place. Now run:
$ ng serve
``` 
At this point Angular will transpile the typescript and dependencies used to run the application. Open a browser or new tab and navigate to http://localhost:4200/ 
> NRD Talk: The Angular CLI transpiles (convert one language to another) the strongly typed TypeScript to _vanilla_ HTML, Javascript, and CSS-- "the stuff browsers want" using a tool called WebPack. This allows us to pre-compile the application into a SPA (Single Page Application).

The SUITS Telemetry Server builds the frontend so that it may be accessed via the server in a self-hosting manner. To do this run:
```bash
$ ng build 
```
The config is set so when build is executed the binaries for the application are copied to ./dist/SUITS at the root of the project. Go to the next section to learn how to start the server.   

#### __Server__ 
The server is the core software for the SUITS Telemetry server and is thus the main application. The server is comprised of sub-processes that are bootstrapped or started in-order of presidence to offer services to the client software. The bootstrap functions can be found in the package.json config at the root of the project. At the time of this writing, the config is as follows:   
```json
  "suits": {
    "bootstrap": [
      {
        "name": "api",
        "script": "app.js",
        "enabled": true
      },
      {
        "name": "socketserver",
        "script": "./socket/server.js",
        "enabled": true
      }
    ]
  }
```
The _bootstrap_ array defines a set of subprocesses that will be executed in order; the fields are defined as:   
- name: Name identifier for the process
- script: The relative path to the process or program
- enabled: If true, the process is started when the bootstrapper is executed, if false, its skipped.  

To start the server simply run the following command:  
```bash
$ node bootstrap.js 
```

Running the "node" command will run in interactive mode. If your terminal loses focus for any reason, its possible that the server will stop responding and terminate. A workaround for this is to use a production -level "process manager"- I recommend using PM2. To get and run PM2 do the following:  

```bash
# Install PM2 globally
$ npm i -g pm2
# CD into the SUITS project root
$ cd <suitsts>/
# Validate you are in the right directory by verifying the bootstrap.js script exists
$ ls -l | grep "bootstrap" 
# Now run the SUITS TS and give it a name
$ pm2 start --name SUITS-TS bootstrap.js 
```
If all's well you will see an ASCII table with info about the server and a "green" status. If you want, PM2 offers a task monitor where you can view console logs while using the server. Simply run:
```bash
$ pm2 monit 
```

A few other useful commands for PM2 are:
```bash
# To show the table of running processes
pm2 ls 
# Stop the server
pm2 stop <name>
# Remove the server
pm2 delete <name> # *Note: The server must be stopped to perform this action
# Restart a stopped server
pm2 start <name>
```

_Congratulations! You're off to the races!_  


-------------------------------------------------------------------------------

## Client
This section is intended to help developers understand implemetnation and workflow.

### Workflow
A typical user of the SUITS-TS will follow the preceding workflow.

1. Client creates a connection to the server.
2. Server sends a _"handshake"_ message to the client.
3. Client responds to the _"handshake"_ with a _"register"_ event and JSON payload including _name_ and _room_. 
4. If _name_ or _room_ is missing; _"err"_ will be sent to the Client. However, if successful _"register"_ will be sent to the client.
5. The client can now choose to use _"hearbeat"_ on an interval no less than every 3 seconds to verify server - client communication.




## Glossary
1. Client - A device that connects to, and may send or receive data from the server.
2. DCU: Display and Control Unit
2. EVA: Extra Vehicular Activity
3. SUITS: Spacesuit User Interface Technologies for Students
4. UIA: Umbilical Interface Assembly


# EMU_TelemetrySimulator
This is the EMU Telemetry Simulator for the 2021 SUITS Challenge. The purpose of this code is to generate mock EMU telemetry data for
students to implement within their user interface designs.

## Acronyms: 
  ```
  DCU - Display and Control Unit
  EVA - Extra Vehicular Activity
  UIA - Umbilical Interface Assembly 
  ```
## Code Sections: 

### Models: 

  **SimulationControl.js**
  
    Mongoose Schema for DCU switches. 
    Sets values and types for each switch. Switches can be manipulated by user.  
  
  **SimulationFailure.js**
  
    Mongoose Schema for available errors. 
    Currently contains fan error only. 
    
  **SimulationStateUIA.js**
  
    Mongoose Schema for UIA. 
    Sets names and types for each component of the UIA.
    Values will be changed depending on user manipulation. 
 
 **SimlulationState.js**
  
    Mongoose Schema for EVA telemetry values.
    Sets value names and types for each telemetry data point. 
 
 **SimulationUIA.js**
  
    Mongoose Schema for UIA controls. 
    Sets value names and types for each UIA switch. Switches can be manipulated by user.  
    

### Routes: 

  **evarouter.js**
  
  
    Sets HTTP request methods for EVA portion of the simulation. 
  
  **uiarouter.js**
  
    Sets HTTP request methods for UIA portion of the simulation. 
  
### Simulations:

   **evasimulation.js**
  
     This is where the simulation takes place for the EVA. EVA data is updated and sent to the database here.
  
   **uiasimulation.js**
     
     This is where the simulation takes place for the UIA. UIA data is updated and sent to the database here.
  
  
### Telemetry:

  **eva_telemetry.js**
    
    All EVA Telemetry Data is generated here
 
  **uia_telemetry.js**
    
    All UIA Telemetry Data is generated here

## Support
If you have any questions or need any help please visit our website [NASA SUITS](https://microgravityuniversity.jsc.nasa.gov/nasasuits.cfm) or contact us at: [NASA-SUITS@mail.nasa.gov](nasa-suits@mail.nasa.gov)



