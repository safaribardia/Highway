const WebSocket = require("ws");
const logger = require("./logging/logger");
const { OPENAI_API_KEY } = require("./config");
const {
  sessionConfig,
  initialPrompt,
  followUpPrompt,
} = require("./conversationConfig");

function setupWebSocket(app) {
  let birthday = {};

  app.ws("/media-stream/:id", (ws, req) => {
    const streamId = req.params.id;
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

    const sendConversationItem = (text, role = "user") => {
      const event = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: role,
          content: [
            {
              type: "input_text",
              text: text,
            },
          ],
        },
      };
      openAiWs.send(JSON.stringify(event));
      openAiWs.send(JSON.stringify({ type: "response.create" }));
    };

    let streamSid = null;

    const sendSessionUpdate = () => {
      const sessionUpdate = {
        type: "session.update",
        session: sessionConfig,
      };

      logger.info("Sending session update:", JSON.stringify(sessionUpdate));
      openAiWs.send(JSON.stringify(sessionUpdate));

      sendConversationItem(initialPrompt);
    };

    openAiWs.on("open", () => {
      logger.info("Connected to the OpenAI Realtime API");
      setTimeout(sendSessionUpdate, 250);
    });

    openAiWs.on("message", (data) => {
      try {
        const response = JSON.parse(data);
        console.log(
          `Received event: ${response.type}`,
          JSON.stringify(response)
        );

        if (
          response.type === "response.function_call_arguments.done" &&
          response.name === "set_birthday"
        ) {
          birthday = JSON.parse(response.arguments);

          const event = {
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              status: "completed",
              role: "system",
              call_id: response.call_id,
              output: `{'accepted': true}`,
            },
          };

          openAiWs.send(JSON.stringify(event));
          sendConversationItem(followUpPrompt);
          sendResponseCreate();
        }

        if (
          response.type === "response.function_call_arguments.done" &&
          response.name === "hang_up_call"
        ) {
          openAiWs.close();
          ws.close();
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
        console.log(JSON.stringify(error), JSON.stringify(data));
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
      console.log("We found the customer's birthday. It's: ", birthday);
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
