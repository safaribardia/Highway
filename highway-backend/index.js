require("express-async-errors");
const express = require("express");
const expressWs = require("express-ws");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const fs = require("fs");
const dotenv = require("dotenv");
const logger = require("./logging/logger");

// Load environment variables from .env file
dotenv.config();

// Retrieve the OpenAI API key from environment variables. You must have OpenAI Realtime API access.
const OPENAI_API_KEY  = "sk-aaaa"

if (!OPENAI_API_KEY) {
    logger.error("Missing OpenAI API key. Please set it in the .env file.");
    process.exit(1);
}

// Initialize Express and apply express-ws
const app = express();
expressWs(app);

// Use middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Constants
const SYSTEM_MESSAGE =
    "You are a helpful and bubbly AI assistant who loves to chat about anything the user is interested about and is prepared to offer them facts. You have a penchant for dad jokes, owl jokes, and rickrolling – subtly. Always stay positive, but work in a joke when appropriate.";
const VOICE = "alloy";
const PORT = process.env.PORT || 3001; // Use PORT from environment variables or default to 3001

// List of Event Types to log to the console. See OpenAI Realtime API Documentation. (session.updated is handled separately.)
const LOG_EVENT_TYPES = [
    "response.content.done",
    "rate_limits.updated",
    "response.done",
    "input_audio_buffer.committed",
    "input_audio_buffer.speech_stopped",
    "input_audio_buffer.speech_started",
    "session.created",
];

// Root Route
app.get("/", (req, res) => {
    res.send("Hello world");
});

// Additional Route for Status Check
app.get("/status", (req, res) => {
    res.send({ message: "Twilio Media Stream Server is running!" });
});

// Route for Twilio to handle incoming and outgoing calls
// <Say> punctuation to improve text-to-speech translation
app.all("/incoming-call", (req, res) => {
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                          <Response>
                              <Say>Please wait while we connect your call to the A. I. voice assistant, powered by Twilio and the Open-A.I. Realtime API</Say>
                              <Pause length="1"/>
                              <Say>O.K. you can start talking!</Say>
                              <Connect>
                                  <Stream url="wss://${req.headers.host}/media-stream" />
                              </Connect>
                          </Response>`;
    res.type("text/xml");
    res.send(twimlResponse);
});

// WebSocket route for media-stream
app.ws("/media-stream", (ws, req) => {
    logger.info("Client connected");

    const openAiWs = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
        {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "realtime=v1",
            },
        }
    );

    let streamSid = null;

    const sendSessionUpdate = () => {
        const sessionUpdate = {
            type: "session.update",
            session: {
                turn_detection: { type: "server_vad" },
                input_audio_format: "g711_ulaw",
                output_audio_format: "g711_ulaw",
                voice: VOICE,
                instructions: SYSTEM_MESSAGE,
                modalities: ["text", "audio"],
                temperature: 0.8,
            },
        };

        logger.info("Sending session update:", JSON.stringify(sessionUpdate));
        openAiWs.send(JSON.stringify(sessionUpdate));
    };

    // Open event for OpenAI WebSocket
    openAiWs.on("open", () => {
        logger.info("Connected to the OpenAI Realtime API");
        setTimeout(sendSessionUpdate, 250); // Ensure connection stability, send after .25 seconds
    });

    // Listen for messages from the OpenAI WebSocket (and send to Twilio if necessary)
    openAiWs.on("message", (data) => {
        try {
            const response = JSON.parse(data);

            if (LOG_EVENT_TYPES.includes(response.type)) {
                logger.info(`Received event: ${response.type}`, response);
            }

            if (response.type === "session.updated") {
                logger.info("Session updated successfully:", response);
            }

            if (response.type === "response.audio.delta" && response.delta) {
                const audioDelta = {
                    event: "media",
                    streamSid: streamSid,
                    media: {
                        payload: Buffer.from(response.delta, "base64").toString("base64"),
                    },
                };
                ws.send(JSON.stringify(audioDelta));
            }
        } catch (error) {
            logger.error(
                "Error processing OpenAI message:",
                error,
                "Raw message:",
                data
            );
        }
    });

    // Handle incoming messages from Twilio
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.event) {
                case "media":
                    if (openAiWs.readyState === WebSocket.OPEN) {
                        const audioAppend = {
                            type: "input_audio_buffer.append",
                            audio: data.media.payload,
                        };

                        openAiWs.send(JSON.stringify(audioAppend));
                    }
                    break;
                case "start":
                    streamSid = data.start.streamSid;
                    logger.info("Incoming stream has started", streamSid);
                    break;
                default:
                    logger.info("Received non-media event:", data.event);
                    break;
            }
        } catch (error) {
            logger.error("Error parsing message:", error, "Message:", message);
        }
    });

    // Handle connection close
    ws.on("close", () => {
        if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
        logger.info("Client disconnected.");
    });

    // Handle WebSocket close and errors
    openAiWs.on("close", () => {
        logger.info("Disconnected from the OpenAI Realtime API");
    });

    openAiWs.on("error", (error) => {
        logger.error("Error in the OpenAI WebSocket:", error);
    });
});

app.listen(PORT, () => logger.info("Listening on port " + PORT));
