# Express.JS with ES Module

https://www.npmjs.com/package/express

```sh
# create a folder for web server
npm init
npm install express
touch index.js .gitignore .env
node --print "http.STATUS_CODES"
```

default: run app `node app.js` or `node --watch app.js`

if setting to package.json: run scripts start to `npm start`

```json
{
  "main": "index.js",
  "engines": {
    "node": "20.x"
  },
  "type": "module",
  "scripts": {
    "start": "nodemon index.js",
    "start:prod": "NODE_ENV=production node index.js"
  }
}
```

# Deployment

https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production

```js
if (process.env.NODE_ENV != 'production') {
  app.use(morgan('dev'))
  app.get('/', (req, res) => res.redirect('api-docs'))
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger))
} else {
  app.get('/', (req, res) => {
    res.status(200).send(`<h1>${os.hostname()}</h1>`)
  })
}
```

- settings file hosting to vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```
