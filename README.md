# HDate
HDate is an application to show your hobbies to the world!

![Screenshot of profile page](screenshot.png)

## Installing
Clone the repo, and install the dependencies using npm or yarn
```bash
npm install || yarn install
```

## Database
This project uses MongoDB as its database of choice. It can be easily installed on MacOS using `brew` and Linux using `apt` or `yum`. [Here](https://docs.mongodb.com/manual/administration/install-community/) are the official guides on how to install it on any platform it is currently supported on.
When you've installed MongoDB. Be sure to add the folder _db/log_ inside the project folder, otherwise MongoDB will crash when firing it up.

## Setting up .env
Copy the `.env.example` file inside the project folder, and fill in with your prefered data:
```bash
NODE_ENV=development # Leave this as is, you probably aren't going to run this in production
DB_HOST= # Database host (probably localhost)
DB_PORT= # Port of database instance
DB_NAME= # Database name to use
SESSION_SECRET= # Used for hashing sessions
```

## Starting HDate
You need to execute a couple of commands in order to start the project properly.
```bash
npm run startDB || yarn startDB # Starts the database in the current folder
npm run watch || yarn watch # Compiles the client-side assets and starts the application using nodemon
```

## Other commands
```bash
npm run start || yarn start # Compiles assets and starts the app in production mode
npm run stop || yarn stop # Stops the database and removes logs
npm run cleanup || yarn cleanup # Removes assets from assets folder and remove logs from db/log
npm run lint || yarn lint # Lints the project on errors
npm run build-watch || yarn build-watch # Watches and compiles the client-side code on change
```

## Contributing
HDate is written using Arrow functions, Async/Await and a lot of shorthand implicit stuff. This means that you may not understand the code at first.  
Here are some links to reference if you're getting stuck:
- [Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [YDKJS: Types & Grammar Chapter 4: Coercion](https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch4.md#chapter-4-coercion)
