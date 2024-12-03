import express from 'express';
import cors from 'cors';
import http from 'http';
import User from './model.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; 


const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());





const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bonguashok86@gmail.com', 
        pass: 'zwnv umsd ohmx bsgm',  
    },
});





const generateOtp = () => crypto.randomInt(100000, 999999).toString();






app.post('/register', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    const duplicate =await User.findOne({email})
    if(duplicate){
        return res.status(400).json({message : "Email already exists"})
    }

    try {
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); 


        const user = new User({ name, email, otp, otpExpires , marks : undefined });
        await user.save();

        const mailOptions = {
            from: 'bonguashok86@gmail.com',
            to: email,
            subject: 'Quiz OTP Verification',
            text: `Your OTP for the quiz is: ${otp}. It will expire in 5 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send OTP' });
            }
            res.status(200).json({ message: 'OTP sent successfully to your email' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.otpExpires)) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully. You can now proceed to the quiz.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});






app.post('/save-marks', async (req, res) => {
    const { email, marks } = req.body;

    if (!email || marks === undefined) {
        return res.status(400).json({ message: "Email and Marks are required" });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ email, marks });
            await user.save();
            return res.status(201).json({ message: 'User created and marks saved successfully' });
        }

        user.marks = marks;
        user.isSubmitted = true
        await user.save();

        return res.status(200).json({ message: 'Marks updated successfully' });
    } catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





app.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find().sort({ marks: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/check-status', async (req, res) => {
    const { email } = req.body; 
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      if (user.isSubmitted) {
        return res.status(200).json({ success: true, message: "Submission is complete", isSubmitted: true });
      } else {
        return res.status(200).json({ success: false, message: "Submission is not complete", isSubmitted: false });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });




mongoose
    .connect('mongodb+srv://bonguashok86:s1KKK67e8GviYP6w@cluster0.fbdrp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log("Connected to DB"))
    .catch((e) => console.error("Failed to Connect to DB:", e));




server.listen(9000, () => console.log("Server running on port 9000"));
