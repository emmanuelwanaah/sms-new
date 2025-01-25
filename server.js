const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the frontend
app.use(express.static("public"));

// SMS Endpoint
app.post("/send-sms", async (req, res) => {
  const { sender, numbers, message } = req.body;

  // Split and clean recipient numbers
  const recipients = numbers.split(",").map(num => num.trim());

  try {
    for (const recipient of recipients) {
      const response = await axios.post(
        "https://api.brevo.com/v3/transactionalSMS/sms",
        {
          sender: sender || "YourBrand", // Default sender name
          recipient: recipient,
          content: message,
          type: "marketing", // Change to 'marketing' if needed
          unicodeEnabled: true, // For special characters
        },
        {
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": "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", // Replace with your API key
          },
        }
      );

      console.log(`SMS sent to ${recipient}:`, response.data);
    }

    res.status(200).json({ success: true, message: "SMS sent successfully!" });
  } catch (error) {
    console.error("Error sending SMS:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send SMS." });
  }
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

