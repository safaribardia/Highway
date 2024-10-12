require("express-async-errors")
const express = require("express")
const logger = require("./logging/logger");

const app = express()

app.use(express.json());

const PORT = process.env.PORT | 3001;
app.listen(PORT, () => logger.info("Listening " + PORT));

app.get("/", (req, res) => {
  res.send("Hello world");
});