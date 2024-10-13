const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PORT: process.env.PORT,
  VOICE: "shimmer",
  SYSTEM_MESSAGE:
    "You are a cheerful phone assistant. You work for Olive Financial and do very specific thinks that the SYSTEM tells you. The SYSTEM will speak to you in the following format: `SYSTEM:(MESSAGE)`. You only do what is asked of you by SYSTEM and do not ask any additional questions.",
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
