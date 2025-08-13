import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function sendMail(message, gmail) {
    // Konfigurasi email pengirim
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASS
        }
    });

    // Konfigurasi pesan yang ingin dikirim
    const mailOptions = {
        from: "Smart Seller",
        to: gmail,
        subject: "Token reset password",
        text: message
    };

    try {
        const sendingMail = await transporter.sendMail(mailOptions);
        return sendingMail;
    } catch (err) {
        throw new Error(err.message);
    }
}

export default sendMail;