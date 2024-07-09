import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import validator from 'email-validator'; // Import email validator
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = 4000;

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.post('/api/referral', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, courseInterested, message } = req.body;

  // Validate email address
  if (!validator.validate(refereeEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  
  try {
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        courseInterested,
        message
      }
    });

    // Send the referral response first
    res.status(201).json(referral);

    // Define email content
    const to = refereeEmail;
    const subject = 'Referral Submission';
    const html = `
  <p>Dear ${refereeName},</p>
  <p>I hope this message finds you well.</p>
  <p>I am excited to share with you an excellent opportunity to enhance your skills and knowledge. I have come across a fantastic course on "${courseInterested}" that I believe would be perfect for you. This course offers comprehensive content, expert instructors, and a flexible learning schedule, making it ideal for anyone looking to advance their career or explore new interests.</p>
  <p>I highly recommend you check it out and consider enrolling. If you have any questions or need further information, feel free to reach out to me or visit the course website.</p>
  <p>Wishing you all the best on your learning journey!</p>
  <p>Warm regards,</p>
  <p>${referrerName}</p>
`;

    // Send email
    transporter.sendMail({ to, subject, html })
      .then(() => {
        console.log('Email sent');
      })
      .catch(err => {
        console.error('Error sending email:', err);
      });

  } catch (error) {
    console.error('Error saving referral:', error);
    res.status(500).json({ error: 'Unable to save referral' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
