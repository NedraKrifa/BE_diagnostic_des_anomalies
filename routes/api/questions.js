const express = require("express");
const router = express.Router();
const Question = require("../../models/question");
const verify = require('../middleware/verifyToken');
const esClient = require('../../connections/ElasticsearchConnection');

//[Get] Get all items
router.get("/", verify, async (req, res) => {
  try {
    const items = await Question.find().sort({ date: -1 });
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
  esClient.index({
        index: 'proxymtips',
        type: 'questions',
        body: {
            author: req.body.author,
            title: req.body.title,
            body: req.body.body,
            tags: req.body.tags,
        }
  })
  const item = new Question({
    author: req.body.author,
    title: req.body.title,
    body: req.body.body,
    tags: req.body.tags,
  });
  try {
    const saveditem = await item.save();
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