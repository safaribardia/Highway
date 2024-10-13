require("express-async-errors");
const express = require("express");
const expressWs = require("express-ws");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors package
const logger = require("./logging/logger");
const routes = require("./routes");
const { setupWebSocket } = require("./websocket");
const { PORT } = require("./config");

const app = express();
expressWs(app);

// Use CORS middleware
app.use(
  cors({
    origin: "*", // Replace with your frontend's domain
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true, // Allow credentials if needed
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", routes);
setupWebSocket(app);

app.listen(PORT, () => logger.info("Listening on port " + PORT));
