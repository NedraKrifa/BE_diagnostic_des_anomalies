const express = require("express");
const nodemailer = require('nodemailer');
const router = express.Router();
const Question = require("../../models/question");
const User = require("../../models/user");
const Answer = require("../../models/answer");
const Comment = require("../../models/comment");
const verify = require('../middleware/verifyToken');
require("dotenv/config");


//[Get] get all items
router.get("/:id", verify, async (req, res) => {
    try {
        const item = await Question.findById(req.params.id);
        const answers= await Promise.all(item.answers.map(async (answerId)=>{
            const answer = await Answer.findById(answerId);
            const {_id, vote, author, body, created, comments, checked, blocked} = answer;
            const commentsUpdated= await Promise.all(comments.map(async(commentId)=>{
                const comment = await Comment.findById(commentId);
                return comment;
            }));
            return {
                _id,
                author,
                body,
                vote,
                created,
                checked,
                blocked,
                comments:commentsUpdated
            };
        }));
        res.json(answers);
    } catch (err) {
      res.json({ message: err });
    }
  });

//[Post] Submit item
router.post("/", verify, async (req, res) => {

  const { author, body, questionId } = req.body;

  const questionItem = await Question.findById(questionId);
  const reciever = questionItem.author;
  const userDetail = await User.findById(reciever._id);

if(author._id !== reciever._id){
  console.log(userDetail.email);
  //service gmail
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      pass: process.env.WORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });

  transporter.verify((err, success) => {
    err
      ? console.log(err)
      : console.log(`=== Server is ready to take messages: ${success} ===`);
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: userDetail.email,
    subject: "ProxymTips Notifications",
    text: `Hello ${reciever.username}, \n you have received an answer to your question "${questionItem.title}" from ${author.username}. \n Sincerely, \n ProxymTips Team`,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
}
  /*  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ETHEREAL_USERNAME, // generated ethereal user
      pass: process.env.ETHEREAL_PASSWORD, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"ProxymTIPS Contact" <proxymtips@contact.com>', // sender address
    to: "nedrakrifa@gmail.com", // list of receivers
    subject: "Hello", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
*/

  try {
    const item = new Answer({
      author,
      body,
    });
    const saveditem = await item.save();
    const updatedItem = await Question.updateOne(
      { _id: questionId },
      {
        $push: {
          answers: saveditem._id,
        },
      }
    );
    res.json(saveditem);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Patch] Update an item
router.patch("/check/:itemId", verify, async (req, res) => {
  try {
    const updatedItem = await Answer.updateOne(
      { _id: req.params.itemId },
      {
        $set: {
          checked: req.body.checked,
        },
      }
    );
    const updatedQuestion = await Question.updateOne(
      { _id: req.body.questionId },
      {
        $set: {
          checked: req.body.checked,
        },
      }
    );
    res.json(updatedItem);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Patch] Update a item
router.patch("/block/:itemId", verify, async (req, res) => {
  try {
    const updatedItem = await Answer.updateOne(
      { _id: req.params.itemId },
      {
        $set: {
            blocked: req.body.blocked,
        },
      }
    );
    res.json(updatedItem);
  } catch (err) {
    res.json({ message: err });
  }
});



module.exports = router;