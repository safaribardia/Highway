const WebSocket = require("ws");
const logger = require("./logging/logger");
const {
  OPENAI_API_KEY,
  VOICE,
  SYSTEM_MESSAGE,
  LOG_EVENT_TYPES,
} = require("./config");

function setupWebSocket(app) {
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

    openAiWs.on("open", () => {
      logger.info("Connected to the OpenAI Realtime API");
      setTimeout(sendSessionUpdate, 250);
    });

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

    ws.on("close", () => {
      if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
      logger.info("Client disconnected.");
    });

    openAiWs.on("close", () => {
      logger.info("Disconnected from the OpenAI Realtime API");
    });

    openAiWs.on("error", (error) => {
      logger.error("Error in the OpenAI WebSocket:", error);
    });
  });
}

module.exports = { setupWebSocket };
