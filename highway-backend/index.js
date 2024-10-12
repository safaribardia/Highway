require("express-async-errors")
const express = require("express")
const logger = require("./logger");

const app = express()

const PORT = process.env.PORT | 3001;
app.listen(PORT, () => logger.info("Listening " + PORT));

app.get("/", (req, res) => {
  res.send("Hello world");
});