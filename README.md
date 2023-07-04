# Students Management Application

This project represents a student management application designed by CRUD philosophy. It can execute several actions against the DB – add, retrieve, update, and delete student details.

## Features 
- Management of two main DBs: 
  1. DB for the student management app
  2. DB that documents every path and method that the client has used (activated automatically).
- Two optional run modes: HTML & JSON 
- Client application (only in JSON mode) – this app reads a provided text file that includes one of the CRUD commands. Then the app commits the specific command.

## Installation

```bash
npm install
```

## Usage

Run mode HTML:
```bash
npm run start
```
Run mode JSON:
```bash
npm start [--json]
```
Note: to activate the client app, you must run "node client.js" in a separate terminal.


## Project Components

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- | 
| **client_input**         |  Prepared input files for the client app usage.                                               |
| **curl_test**            |  Contains two repositories for different run modes – JSON/HTML. Each repository includes input files for CURL   usage.                                                                       | 
| **node_modules**         | Contains the installed packages: express, mongoose, pug and the devDependencies: eslint                                                                                                       |
| **src**                  | Contains the source code                                                                      |
| **src/models**           | Contains student model file and log model file                                                |
| **src/public**           | Contains the main CSS file and 404 error file                                                 |
| **src/routes**           | Contains the router file (the response for every path and method)                             |
| **views**                | Contains all Pug files (responsible for the HTML template)                                    |
| .env.example             | Contains my environment variables                                                             |
| .eslintrc.js             | Config settings for ESLint to check code integrity                                           |
| .gitignore               | Config settings for my git repository that tells git not to track certain files and folders that i don't want being uploaded to my main repository.    |                                                                                             
| package.json             | File that contains metadata relevant to the project and is used for managing the project's dependencies, scripts, version and more.  |                                                                                               |
| server.js               | The main file and the starting point of the server application                                |
| client.js               | The main file of the client application                                                       |
| httpJSONRequest.js      | JS file that works with any HTTP request. Work in JSON mode only and receive only JSON strings (not buffers) and return only the body (the payload) and not the HTTP headers.                                                           |        

## Author

👤 **Yuval Tzoor**
👤 **Dani Meleh**

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
