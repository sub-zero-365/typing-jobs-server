import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "atbistech@gmail.com",
        pass: "pehv sten motd ysio",
    },
});
//# sourceMappingURL=sendMailUtils.js.map