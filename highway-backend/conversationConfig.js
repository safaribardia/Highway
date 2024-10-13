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
      name: "set_birthday",
      description: "Set the birthday of the user",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          month: { type: "string" },
          day: { type: "string" },
          year: { type: "string" },
        },
        required: ["name", "month", "day", "year"],
      },
    },
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
  ],
};

const initialPrompt =
  "SYSTEM:(Explain to the customer that you are an agent with Olive Financial. The customer recently requested a loan online and we're calling to verify their identity. Prompt the customer to provide their name and date of birth to continue.)";

const carPrompt =
  "SYSTEM:(Now, we have some information about the customer that we want to verify in order to activate their account. Ask the customer what was the make and model of their car in 2005. Options are 2000 Mazda, 1995 Chevy, 2005 Honda, 2004 Ford.)";

module.exports = {
  sessionConfig,
  initialPrompt,
  carPrompt,
};
