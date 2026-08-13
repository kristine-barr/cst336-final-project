# cst336-final-project

## Setup and run

Create an .env file, this contains the projects secerts and will not be added to the git repo because it's been added to the .gitingore file.

- Create .env in the root of your project. Fill the key values with our database information.

``` ini
MYSQL_HOST="database hose URI"
MYSQL_USER="database username"
MYSQL_PASSWORD="database password"
MYSQL_DATABASE="database name"
SESSION_SECRET="your Secret"
```

### Install node packages and run app

From the cli run the below commands to start the project.

``` bash
npm install
npm run dev
```

## Routes

Routes are registered in /routes/index.mjs then imported into index.mjs.
