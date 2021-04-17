const express = require("express");
const router = express.Router();
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const Vote = require("../../models/vote");
const verify = require('../middleware/verifyToken');


router.get("/vote/:postId/:userId?", verify, async (req, res) => {
    const userId=req.params.userId;
    const postId=req.params.postId;
    try {
        const voteExist = await Vote.findOne({ userId, postId });
        if(!voteExist) return res.status(200).send({value: 0});
        res.json(voteExist);
    } catch (err) {
      res.json({ message: err });
    }
  });

//upvote
router.post("/upvote", verify, async (req, res) => {

  const { userId, postId, type } = req.body;

  try {
    if(type === 'question'){
        const questionExist = await Question.findById(postId);
        await Question.updateOne(
            { _id: postId },
            {
              $set: {
                  vote: questionExist.vote + 1,
              },
            }
          );
    }else{
        const answerExist = await Answer.findById(postId);
        await Answer.updateOne(
            { _id: postId },
            {
              $set: {
                  vote: answerExist.vote + 1,
              },
            }
          );
    }
    const voteExist = await Vote.findOne({ userId, postId });
    if(!voteExist){
        const item = new Vote({
            userId,
            postId,
            value: 1
        })
        const saveditem = await item.save();
        res.json(saveditem);
    }else{
        const removedItem = await Vote.remove({ userId, postId });
        res.json(removedItem);
    }
  } catch (err) {
    res.json({ message: err });
  }
});

//downvote
router.post("/downvote", verify, async (req, res) => {

    const { userId, postId, type } = req.body;
  
    try {
      if(type === 'question'){
          const questionExist = await Question.findById(postId);
          await Question.updateOne(
              { _id: postId },
              {
                $set: {
                    vote: questionExist.vote - 1,
                },
              }
            );
      }else{
          const answerExist = await Answer.findById(postId);
          await Answer.updateOne(
              { _id: postId },
              {
                $set: {
                    vote: answerExist.vote - 1,
                },
              }
            );
      }
      const voteExist = await Vote.findOne({ userId, postId });
      if(!voteExist){
          const item = new Vote({
              userId,
              postId,
              value: -1
          })
          const saveditem = await item.save();
          res.json(saveditem);
      }else{
          const removedItem = await Vote.remove({ userId, postId });
          res.json(removedItem);
      }
    } catch (err) {
      res.json({ message: err });
    }
  });

module.exports = router;