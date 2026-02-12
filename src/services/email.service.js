const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hi ${name},\n\nThank you for registering with Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering with Backend Ledger. We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
};

async function sendTransactionEmail(userEmail, name, amount, fromAccount, toAccount) {
    const subject = 'Transaction Alert from Backend Ledger';
    const text = `Hi ${name},\n\nA transaction of amount ${amount} has been made from account ${fromAccount} to account ${toAccount}.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hi ${name},</p><p>A transaction of amount <b>${amount}</b> has been made from account <b>${fromAccount}</b> to account <b>${toAccount}</b>.</p><p>Best regards,<br>The Backend Ledger Team</p>`; 

    await sendEmail(userEmail, subject, text, html);
};

async function sendTransactionFailureEmail(userEmail, name, amount, fromAccount, toAccount) { 
    const subject = 'Transaction Failure Alert from Backend Ledger';
    const text = `Hi ${name},\n\nWe regret to inform you that a transaction of amount ${amount} from account ${fromAccount} to account ${toAccount} has failed. Please check your account and try again.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hi ${name},</p><p>We regret to inform you that a transaction of amount <b>${amount}</b> from account <b>${fromAccount}</b> to account <b>${toAccount}</b> has failed. Please check your account and try again.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};