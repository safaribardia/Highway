const WebSocket = require("ws");
const logger = require("./logging/logger");
const { OPENAI_API_KEY } = require("./config");
const { sessionConfig, followUpPrompt } = require("./conversationConfig");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://umbkzjfffeoykaxsghly.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmt6amZmZmVveWtheHNnaGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3NTgzMjEsImV4cCI6MjA0NDMzNDMyMX0.6PVD6OD6dSt4yGjAMpsxE73sxz9NpgMhHW4JfP0IE5I"
);
function setupWebSocket(app) {
  app.ws("/media-stream/:id/:numid", async (ws, req) => {
    const streamId = req.params.id;
    const callId = req.params.numid;

    let bigdata = "";
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
      const sending_data = `SYSTEM:(Explain to the customer that you are an agent with Olive Financial. Read the background from the identity provider and verify the infomration provided BUT do not confirm any information, just ask 2 questions one at a time based on the following data: ${JSON.stringify(
        bigdata
      )})`;
      console.log("sending_data", sending_data);
      sendConversationItem(sending_data);
    };

    openAiWs.on("open", async () => {
      const { data, error } = await supabase
        .from("verifications")
        .select("*")
        .eq("id", streamId);
      console.log("supadata", data, error, streamId);

      if (data) {
        bigdata = JSON.stringify(data[0]);
        sendSessionUpdate();

        logger.info("Connected to the OpenAI Realtime API");
      }
    });

    openAiWs.on("message", (data) => {
      try {
        const response = JSON.parse(data);
        // console.log(
        //   `Received event: ${response.type}`,
        //   JSON.stringify(response)
        // );

        if (response.type === "response.function_call_arguments.done") {
          console.log("arguments", response.arguments);
          supabase
            .from("calls")
            .update({ status: response.arguments.status })
            .eq("id", callId);
        }

        if (
          response.type === "response.function_call_arguments.done" &&
          response.name === "hang_up_call"
        ) {
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
      openAiWs.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text"],
            tool_choice: {
              type: "function",
              name: "call_reflection_data",
            },
          },
        })
      );

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
