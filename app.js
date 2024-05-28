const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const postsRouter = require("./routers/posts.js");
const routersLogger = require('./middlewares/routersLogger.js');
const errorsFormatter = require("./middlewares/errorsFormatter.js");
const routesNotFound = require("./middlewares/routesNotFound.js");

app.use(bodyParser.urlencoded({ extended: true })); // Per parsare application/x-www-form-urlencoded
app.use(express.static('./public'));

app.use('/posts', postsRouter);

// start server
app.listen(3000, () => {
    console.log('Server attivo sulla porta http://localhost:3000.');
});
