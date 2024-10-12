const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const Joi = require("joi");
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} = require("./config");

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function validatePhoneNumber(phoneNumber) {
  const schema = Joi.object({
    to: Joi.string().required(),
  });

  return schema.validate(phoneNumber);
}

router.get("/", (req, res) => {
  res.send("Running");
});

router.all("/handle-call", (req, res) => {
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                          <Response>
                              <Say>Hey! I'm a virtual assistant on behalf of Olive Financial. Is this a good time to talk?</Say>
                              <Pause length="1"/>
                              <Connect>
                                  <Stream url="wss://${req.headers.host}/media-stream" />
                              </Connect>
                              <Hangup/>
                          </Response>`;
  res.type("text/xml");
  res.send(twimlResponse);
});

router.post("/call-customer", async (req, res) => {
  const { error } = validatePhoneNumber(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { to } = req.body;

  try {
    const call = await client.calls.create({
      url: `http://${req.headers.host}/handle-call`, // URL to handle the call
      to: to,
      from: TWILIO_PHONE_NUMBER,
    });

    res.send(`Call initiated with SID: ${call.sid}`);
  } catch (error) {
    res.status(500).send(`Failed to initiate call: ${error.message}`);
  }
});

module.exports = router;
