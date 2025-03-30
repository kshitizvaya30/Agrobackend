require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const router = express.Router();
const port = 9000;
const serverless = require("serverless-http");

// Middleware to parse JSON bodies
app.use(bodyParser.json());

router.get("/", (req, res) => {
  res.send("App is running..");
});

// POST endpoint for form submission
router.post("/submit", async (req, res) => {
  const { name, subject, email, message } = req.body;

  // Validate required fields
  if (!name || !subject || !email || !message) {
    return res.status(400).json({
      error: "All fields are required: name, email, subject,   message",
    });
  }

  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "indis.incorp@gmail.com",
    subject: "New Product Requirement Submission - INDIS Website Query",
    text: ` 
                New submission details:
                Name: ${name}
                Email: ${email}
                Subject: ${subject}
                Message: ${message}
                `,
    html: `
            <h2>New Product Requirement Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
        `,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "Data received successfully",
      data: {
        name,
        subject,
        email,
        message,
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// Mount the router
app.use("/", router);

// Serverless function handler for production
module.exports.handler = serverless(app);

// Local development server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
