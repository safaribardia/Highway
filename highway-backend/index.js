require("express-async-errors")
const express = require("express")
const errorHandler = require("./middleware/errorHandler");
const logger = require("./logging/logger");
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

const app = express();

app.use(express.json());
app.use(errorHandler);
app.use(helmet());
app.use(compression());
app.use(morgan('tiny'));

const PORT = process.env.PORT | 3001;
app.listen(PORT, () => logger.info("Listening " + PORT));

app.get("/", (req, res) => {
  res.send("Hello world");
});