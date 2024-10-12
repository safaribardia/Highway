const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PORT: process.env.PORT,
  VOICE: "shimmer",
  SYSTEM_MESSAGE: `You're helping verify financial transactions.

  You will be given a transcript of a phone call between a customer and an Olive Financial agent.

  Your job is to verify the customer's identity based on the transcript.

  The customer's name is Bardia. Say sorry I must have the wrong person when you realize you've been given the wrong name, and then hang up.
  `,
  LOG_EVENT_TYPES: [
    "response.content.done",
    "rate_limits.updated",
    "response.done",
    "input_audio_buffer.committed",
    "input_audio_buffer.speech_stopped",
    "input_audio_buffer.speech_started",
    "session.created",
  ],
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
};
