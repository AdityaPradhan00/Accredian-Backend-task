import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { config } from 'dotenv';
config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
console.log(process.env.GMAIL_USER);
console.log(process.env.GMAIL_PASS);
// Create transporter instance
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
});


app.post('/send-email', (req, res) => {
    const { to, subject, html } = req.body; 
    transporter.sendMail({
        to: to,
        subject: subject,
        html: html
    }).then(() => {
        console.log('Email sent');
        res.status(200).send('Email sent successfully');
    }).catch(err => {
        console.error('Error sending email:', err);
        res.status(500).send('Error sending email');
    });
});

app.listen(4000, () => {
    console.log('Server listening on port 4000');
});