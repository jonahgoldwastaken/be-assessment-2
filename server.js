const app = require('./index')
const http = require('http')
const port = process.env.PORT || 1337
http.createServer(app).listen(port, () => console.log(`started server on port ${port}`))