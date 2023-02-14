require("dotenv").config();
const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

class Email {
  constructor(user, url = "") {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = "Ahmed Adel <hello@gmail.com>";
  }

  newTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    await this.newTransporter().sendMail(mailOptions);
  }
  async sendPasswordreset() {
    await this.send(
      "passwordReset",
      "your verification Token is valid for 10 mints"
    );
  }

  async scheduleNotificationUrl() {
    await this.send(
      "Newoffers",
      "Unlock Exciting Deals - Discover the Latest Offers with a Single Click!"
    );
  }

  async verificationToken() {
    await this.send(
      "verificationToken",
      "your verification Token is valid for 10 mints"
    );
  }
  async sendReport(orders, productReport, totalSales) {
    const template = "sendReport";
    const subject =
      "Here's a report includes orders made throughout the day and  products and their respective quantities";
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        subject,
        orders,
        productReport,
        totalSales,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    await this.newTransporter().sendMail(mailOptions);
  }
}

module.exports = Email;
