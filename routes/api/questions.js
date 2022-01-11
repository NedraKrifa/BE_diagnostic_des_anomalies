const express = require("express");
const nodemailer = require('nodemailer');
const router = express.Router();
const Question = require("../../models/question");
const User = require("../../models/user");
const Comment = require("../../models/comment");
const Tag = require("../../models/tag");
const verify = require('../middleware/verifyToken');
const esClient = require('../../connections/ElasticsearchConnection');
const questionValidation = require('../../validation/questionValidation');
const { ValidationError } = require('../../validation/userValidation');
require("dotenv/config");

//[Get] Get all items
router.get("/", verify, async (req, res) => {
  try {
    const items = await Question.find({blocked:false}).sort({ created: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/old", verify, async (req, res) => {
  try {
    const items = await Question.find({blocked:false}).sort({ created: 1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/top", verify, async (req, res) => {
  try {
    const items = await Question.find({blocked:false}).sort({ vote: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/moderation", verify, async (req, res) => {
  try {
    const items = await Question.find().sort({ vote: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/moderation/unblocked", verify, async (req, res) => {
  try {
    const items = await Question.find({blocked:false}).sort({ vote: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/moderation/blocked", verify, async (req, res) => {
  try {
    const items = await Question.find({blocked:true}).sort({ vote: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/tags/id=:tagId&name=:tagName", verify, async (req, res) => {
  try {
    const items = await Question.find({ tags: {_id:req.params.tagId,name:req.params.tagName},blocked:false }).sort({ vote: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/users/id=:userId&name=:userName", verify, async (req, res) => {
  try {
    const items = await Question.find({ author: {_id:req.params.userId,username:req.params.userName},blocked:false }).sort({ vote: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Get] Get all items: elasticsearch
router.get("/search", verify, async (req, res) => {
    const { authors, title, tags } = req.query;

    let querySearch={
      must: [],
      filter:[]
    };
    if(title !==''){
      querySearch.must.push({match: { title: title }})
    }
    if(tags !==''){
      querySearch.filter.push({
        terms: {
          tags: tags.split(","),
        },
      });
      if(title==''){
        querySearch.must.push({match_all: {}})
      }
    }
    if(authors!==''){
      querySearch.filter.push({
        terms: {
          "author.username": authors.split(','),
        },
      });
      if(title=='' && tags==''){
        querySearch.must.push({match_all: {}})
      }
    }
    if(title=='' & tags=='' & authors==''){
      querySearch = { must: [{match: { title: '' }}] };
    }

    try {
      const items = await esClient.search({
        index: "proxymtips",
        type: "questions",
        body: {
          //sort: [{ created: { order: "desc" } }],
          query: {
            bool: querySearch,
            /*bool: {
              must: [
                {
                  match: { title: title },
                  //regexp: { title: `.*${title}.*` },
                },
              ],
              filter: [
                {
                  terms: {
                    tags: tags.split(','),
                  },
                  terms: {
                    "author.username": authors.split(','),
                  },
                },
              ],
            },*/
          },
        },
      });
      const itemsId = items.hits.hits.map((item) => {
        return item._source.id;
      });
      const questions = await Question.find({blocked:false}).sort({ vote: -1 });
      const questionSearch = questions.filter((question) =>
        itemsId.includes(question._id.toString())
      );
      res.json(questionSearch);
    } catch (err) {
      res.json({ message: err });
    }
  });

//[Post] Submit item
router.post("/", verify, async (req, res) => {

  const { author, title, body, tags } = req.body;

 //LETS VALIDATE THE DATA BEFORE WE ADD A QUESTION
  const { error } = questionValidation({
    author,
    title,
    body,
    tags,
  });
  if (error) return res.status(400).send(ValidationError(error));

    //checking if the title is already in the database
  const titleExist = await Question.findOne({ title });
  if (titleExist) return res.status(400).send("title already exists");

//POST tags
const finalTagList= await Promise.all(
  tags.map(async function (element) {
    const tagExist = await Tag.findOne({ name: element });
    try {
      if (tagExist) {
        await Tag.updateOne(
          { _id: tagExist._id },
          {
            $set: {
              questioNumber: tagExist.questioNumber + 1,
            },
          }
        );
        /*await client.update({
          index: "proxymtips",
          type: "tags",
          id: "tagExist._id",
          body: {
            questioNumber: tagExist.questioNumber + 1,
          },
        });*/
        return { _id: tagExist._id, name: tagExist.name };
      } else {
        const tag = new Tag({
          name: element,
          questioNumber: 1,
        });
        const savedtag = await tag.save();
        const { _id, questioNumber, name } = savedtag;
        /*await esClient.index({
          index: "proxymtips",
          type: "tags",
          body: {
            _id,
            name,
            questioNumber,
          },
        });*/
        return { _id, name };
      }
    } catch (err) {
      res.json({ message: err });
    }
  })
);

  try {
    const item = new Question({
      author,
      title,
      body,
      tags: finalTagList,
    });
    const saveditem = await item.save();
    const { _id, created } = saveditem;
    await esClient.index({
      index: "proxymtips",
      type: "questions",
      body: {
        id: _id,
        author,
        title,
        tags,
        created,
      },
    });
    res.json(saveditem);
  } catch (err) {
    res.json({ message: "error" });
  }
  

});

//count elasticsearch
router.get("/count", async (req,res) =>{
    esClient.count({
        index: 'proxymtips',
        type: 'questions'},
        (err,resp,status) => {  
            return res.json(resp);
      });
})

//[Get] Specific item
router.get("/:itemId", verify, async (req, res) => {
  try {
    const item = await Question.findById(req.params.itemId);
    const {_id, vote,title,tags, author, checked, body, created,answers, comments} = item;
    const finalComments = await Promise.all(
      comments.map(async (commentId) => {
        const comment = await Comment.findById(commentId);
        return comment;
      })
    );
    res.json({
      _id,
      author,
      title,
      body,
      tags,
      vote,
      comments: finalComments,
      answers,
      created,
      checked
    });
  } catch (err) {
    res.json({ message: err });
  }
});

//[Delete] Delete item
router.delete("/:itemId", verify, async (req, res) => {
  try {
    const removedItem = await Question.remove({ _id: req.params.itemId });
    res.json(removedItem);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Patch] Update a item
router.patch("/:itemId", verify, async (req, res) => {
  const { blocked, text } = req.body;
  const { itemId } = req.params;

  if(blocked){
    const questionItem = await Question.findById(itemId);
    const reciever = questionItem.author;
    const userDetail = await User.findById(reciever._id);
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
     subject: "[ProxymTips] reason for blocking your question",
     text: `Hello ${reciever.username}, \n The reason for blocking your question are: \n ${text} \n Sincerely, \n ProxymTips Team`,
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
    const updatedItem = await Question.updateOne(
      { _id: itemId },
      {
        $set: {
            blocked: blocked,
        },
      }
    );
    res.json(updatedItem);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;