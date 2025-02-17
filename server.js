const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// Root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Send SMS
app.post("/send-sms", async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) {
        return res.status(400).json({ success: false, error: "Missing recipient or message" });
    }
    try {
        const response = await client.messages.create({
            body: message,
            from: twilioNumber,
            to
        });
        res.json({ success: true, sid: response.sid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Receive SMS (Twilio Webhook)
app.post("/receive-sms", (req, res) => {
    const { From, Body } = req.body;
    console.log(`📩 Received SMS from ${From}: ${Body}`);
    res.send("SMS received");
});

// Make Call
app.post("/make-call", async (req, res) => {
    const { to } = req.body;
    if (!to) {
        return res.status(400).json({ success: false, error: "Missing recipient number" });
    }
    try {
        const call = await client.calls.create({
            url: "http://demo.twilio.com/docs/voice.xml",
            from: twilioNumber,
            to
        });
        res.json({ success: true, sid: call.sid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Receive Call (Twilio Webhook)
app.post("/receive-call", (req, res) => {
    const response = new twilio.twiml.VoiceResponse();
    response.say("Hello! This is a test call from Twilio.");
    res.type("text/xml").send(response.toString());
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
