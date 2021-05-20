const express = require("express");
const router = express.Router();
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const Comment = require("../../models/comment");
const verify = require('../middleware/verifyToken');



//[Post] Submit item
router.post("/", verify, async (req, res) => {

  const { author, body, postId, type } = req.body;

  try {
    const item = new Comment({
      author,
      body
    });
    const saveditem = await item.save();
    if(type === 'question'){
        await Question.updateOne(
            { _id: postId },
            {
              $push: {
                  comments: saveditem._id,
              },
            }
          );
    }else{
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