const express = require("express");
const nodemailer = require('nodemailer');
const router = express.Router();
const Question = require("../../models/question");
const User = require("../../models/user");
const Answer = require("../../models/answer");
const Comment = require("../../models/comment");
const verify = require('../middleware/verifyToken');
require("dotenv/config");


//[Post] Submit item
router.post("/", verify, async (req, res) => {
  const { author, body, postId, type } = req.body;
  let text;
  let reciever;
  if (type === "question") {
    const postItem = await Question.findById(postId);
    reciever = postItem.author;
    text = `Hello ${reciever.username}, \n you have received a comment to your question "${postItem.title}" from ${author.username}. \n Sincerely, \n ProxymTips Team`;
  } else {
    const postItem = await Answer.findById(postId);
    reciever = postItem.author;
    text = `Hello ${reciever.username}, \n you have received a comment to your answer from ${author.username}. \n Sincerely, \n ProxymTips Team`;
  }
  const userDetail = await User.findById(reciever._id);
  if (author._id !== reciever._id) {
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
      text: text,
    };

    transporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log("Error " + err);
      } else {
        console.log("Email sent successfully");
      }
    });
  }

  try {
    const item = new Comment({
      author,
      body,
    });
    const saveditem = await item.save();
    if (type === "question") {
      await Question.updateOne(
        { _id: postId },
        {
          $push: {
            comments: saveditem._id,
          },
        }
      );
    } else {
      await Answer.updateOne(
        { _id: postId },
        {
          $push: {
            comments: saveditem._id,
          },
        }
      );
    }
    res.json(saveditem);
  } catch (err) {
    res.json({ message: err });
  }
});
/*
//[Patch] Update a item
router.patch("/:itemId", verify, async (req, res) => {
  try {
    const updatedItem = await Comment.updateOne(
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
*/


module.exports = router;