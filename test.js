
var nodemailer = require('nodemailer');
const email = process.env.email;
const pass = process.env.pass;

const sendMail = (to="arunpragashap.19msc@kongu.edu", subject="Mail from AWS", message="Try to mail without arguments") =>{

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass
  }
});

var mailOptions = {
  to: to,
  subject: subject,
  html: message
};

const isSend = transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
return false;
  } else{
    console.log('Email sent: ' + info.response);
	return true;
  }
});
return isSend;
}

sendMail("gmail","Subject","<h1>Testing html</h1>");
const greet = ()=>{
console.log("Hello");
}
module.exports = {sendMail, greet};
