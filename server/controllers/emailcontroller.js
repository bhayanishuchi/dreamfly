var nodeMailer = require('nodemailer');

var transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'info.guamlicensing@gmail.com',
    pass: 'info@guamlicens'
  }
});

exports.sendEmail = function (senderemail, receiveremail, subject, html, cb) {

  let mailOptions = {
    from: senderemail,
    to: receiveremail,
    subject: subject,
    //text: 'New Register Entry',
    html: html, // html body
  }
  console.log('mailOptions',mailOptions);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      cb(error, null)
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    cb(null, info)
  })
}
