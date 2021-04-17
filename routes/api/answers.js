const express = require("express");
const router = express.Router();
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const Comment = require("../../models/comment");
const verify = require('../middleware/verifyToken');


//[Get] get all items
router.get("/:id", verify, async (req, res) => {
    try {
        const item = await Question.findById(req.params.id);
        const answers= await Promise.all(item.answers.map(async (answerId)=>{
            const answer = await Answer.findById(answerId);
            const {_id, vote, author, body, created, comments} = answer;
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

  try {
    const item = new Answer({
      author,
      body
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



module.exports = router;