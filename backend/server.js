const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const twilio = require('twilio');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../dist'))); // Adjust if necessary

// Twilio initialization
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Endpoint to handle absent button click and send SMS
app.post('/absent', async (req, res) => {
  try {
    const { studentName, rollNumber, subject, phoneNumber, date, time } = req.body;
    const message = `Dear Parents,\nYour child ${studentName} bearing roll number ${rollNumber} is found absent on ${subject} class.\nDate: ${date}\nTime: ${time}\nRegards,\nNISTU`;
    
    // Send SMS
    const twilioResponse = await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER,
      to: process.env.TWILIO_TO_NUMBER,  
    });

    console.log('Twilio Response:', twilioResponse);

    res.status(200).send('SMS sent successfully.');
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).send('Error sending SMS.');
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html')); // Adjust if necessary
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
