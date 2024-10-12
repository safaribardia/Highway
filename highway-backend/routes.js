const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const Joi = require("joi");
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} = require("./config");
const { createClient } = require("@supabase/supabase-js");

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function validatePhoneNumber(phoneNumber) {
  const schema = Joi.object({
    to: Joi.string().required(),
    verification: Joi.number().required(),
  });

  return schema.validate(phoneNumber);
}

router.get("/", (req, res) => {
  res.send("Running");
});

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://umbkzjfffeoykaxsghly.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmt6amZmZmVveWtheHNnaGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3NTgzMjEsImV4cCI6MjA0NDMzNDMyMX0.6PVD6OD6dSt4yGjAMpsxE73sxz9NpgMhHW4JfP0IE5I"
);

router.post("/call-customer", async (req, res) => {
  const { error } = validatePhoneNumber(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { to, verification } = req.body;

  const { data } = await supabase
    .from("calls")
    .insert([{ verification: verification, status: "in_progress" }])
    .select();

  try {
    const call = await client.calls.create({
      // url: `http://${req.headers.host}/handle-call`, // URL to handle the call
      to: to,
      from: TWILIO_PHONE_NUMBER,
      twiml: `<?xml version="1.0" encoding="UTF-8"?>
              <Response>
                  <Connect>
                      <Stream url="wss://${req.headers.host}/media-stream/${verification}" />
                      <Record transcribe="true" transcribeCallback="https://webhook.site/4a1616da-9d4f-4b3b-af92-cf790be95930"/>
                  </Connect>
                  <Hangup/>
              </Response>`,
    });

    res.send(`Call initiated with SID: ${call.sid}`);
  } catch (error) {
    res.status(500).send(`Failed to initiate call: ${error.message}`);
  }
});

module.exports = router;
