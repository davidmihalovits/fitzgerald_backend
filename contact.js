const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const { stringify } = require("query-string");
require("dotenv").config();

exports.contact = async (req, res) => {
    if (!req.body.recaptchaRes) {
        return res.json({
            status: "fail",
        });
    }

    const secretKey = "6LfWuKIZAAAAACooWKS443w6K4pPBlhqwcv0ON0x";
    const query = stringify({
        secret: secretKey,
        response: req.body.recaptchaRes,
        remoteip: req.connection.remoteAddress,
    });

    const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
    const body = await fetch(verifyURL).then((res) => res.json());

    if (body.success === false) {
        return res.json({
            status: "fail",
        });
    } else {
        const htmlEmail = `
		<h1>Hello!</h1>
		<p><strong>${req.body.name}</strong> is interested. You can reach them at <strong>${req.body.email}</strong>.</p>
		<p><strong>Their message:</strong> ${req.body.message}</p>
		`;

        const mailOptions = {
            from: req.body.email,
            to: "info@fitzgeraldspinesports.com",
            subject: "Client Message",
            html: htmlEmail,
        };

        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                return res.json({
                    status: "fail",
                });
            } else {
                return res.json({
                    status: "success",
                });
            }
        });
    }
};
