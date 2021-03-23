const express = require("express");
const router = express.Router();
const Question = require("../../models/question");
const Tag = require("../../models/tag");
const verify = require('../middleware/verifyToken');
const esClient = require('../../connections/ElasticsearchConnection');
const questionValidation = require('../../validation/questionValidation');
const { ValidationError } = require('../../validation/userValidation');

//[Get] Get all items
router.get("/", verify, async (req, res) => {
  try {
    const items = await Question.find().sort({ created: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Get] Get all items: elasticsearch
router.get("/search", verify, async (req, res) => {
    try {
      const items = await esClient.search({
        index: 'proxymtips',
        type: 'questions',
        body: {
            query: {
                match_all: {}
            }
        }
      })
      res.json(items);
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
  tags.forEach(async function(element) {
    const tagExist = await Tag.findOne({name:element});
    try {
      if(tagExist){
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
      }else{
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
      }
    } catch (err) {
      res.json({ message: err });
    }
  });

  const item = new Question({
    author,
    title,
    body,
    tags
  });
  try {
    const saveditem = await item.save();
    const { _id, created } = saveditem;
    await esClient.index({
      index: "proxymtips",
      type: "questions",
      body: {
        _id,
        author,
        title,
        tags,
        created,
      },
    });
    res.json(saveditem);
  } catch (err) {
    res.json({ message: err });
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
    res.json(item);
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
  try {
    const updatedItem = await Question.updateOne(
      { _id: req.params.itemId },
      {
        $set: {
            author: req.body.author,
            title: req.body.title,
            body: req.body.body,
            tags: req.body.tags,
        },
      }
    );
    res.json(updatedItem);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;