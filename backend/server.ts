import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5173;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Twilio initialization
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Endpoint to handle absent button click and send SMS
app.post('/absent', async (req: Request, res: Response) => {
  try {
    const { studentName, rollNumber, subject, phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).send('Phone number is required.');
      return;
    }

    const message = `Dear Parents,\nYour child ${studentName} bearing roll number ${rollNumber} is found absent on ${subject} class.\nRegards,\nNISTU`;
    
    // Send SMS
    const twilioResponse = await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER as string, // ensure this is always a string
      to: process.env.TWILIO_TO_NUMBER as string // use phoneNumber from the request body
    });

    console.log('Twilio Response:', twilioResponse);

    res.status(200).send('SMS sent successfully.');
  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error instanceof Error) {
      res.status(500).send(`Error sending SMS: ${error.message}`);
    } else {
      res.status(500).send('Error sending SMS.');
    }
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
