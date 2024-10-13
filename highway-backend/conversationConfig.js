const { VOICE, SYSTEM_MESSAGE } = require("./config");

const sessionConfig = {
  turn_detection: {
    type: "server_vad",
    threshold: 0.95,
  },
  input_audio_format: "g711_ulaw",
  output_audio_format: "g711_ulaw",
  voice: VOICE,
  instructions: SYSTEM_MESSAGE,
  modalities: ["text", "audio"],
  temperature: 0.6,
  tools: [
    {
      type: "function",
      name: "hang_up_call",
      description:
        "This function ends and hangs up the phone call. ONLY HANG UP IF THE CUSTOMER EXPLICITLY ASKS TO HANG UP OR ALL THE SYSTEM PROMPTS ARE FINISHED. SAY THANK YOU BEFORE HANGING UP",
      parameters: {
        type: "object",
        properties: {
          hangup: { type: "boolean" },
        },
        required: ["hangup"],
      },
    },
    {
      type: "function",
      name: "call_reflection_data",
      description:
        "ONLY RUN THIS WHEN CALLED TO. DO NOT RUN THIS FUNCTION UNLESS YOU ARE EXPLITCLY TOLD TO. function is used to send reflection data to the backend after the call is finished.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: [
              "user_hung_up",
              "system_error",
              "successful_call",
              "unsuccessful_call",
              "in_progress",
            ],
          },
        },
        required: ["status"],
      },
    },
  ],
};

const carPrompt =
  "SYSTEM:(Now, we have some information about the customer that we want to verify in order to activate their account. Ask the customer what was the make and model of their car in 2005. Options are 2000 Mazda, 1995 Chevy, 2005 Honda, 2004 Ford.)";

module.exports = {
  sessionConfig,
  carPrompt,
};
