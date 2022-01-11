const express = require("express");
const router = express.Router();
const Tag = require("../../models/tag");
const verify = require('../middleware/verifyToken');
const esClient = require('../../connections/ElasticsearchConnection');

//[Get] Get all new items
router.get("/new", verify, async (req, res) => {
  try {
    const items = await Tag.find().sort({ created: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Get] Get all popular items
router.get("/top", verify, async (req, res) => {
  try {
    const items = await Tag.find().sort({ questioNumber: -1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Get] Get all popular items
router.get("/name", verify, async (req, res) => {
  try {
    const items = await Tag.find().sort({ name : 1 });
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

//[Get] Specific item
router.get("/:itemId", verify, async (req, res) => {
  try {
    const item = await Tag.findById(req.params.itemId);
    res.json(item);
  } catch (err) {
    res.json({ message: err });
  }
});

//Search Tag
router.get("/tag/:itemName", verify, async (req, res) => {
  try {
    const item = await Tag.find({
      name: { $regex: req.params.itemName },
    }).sort({ created: -1 });
    res.json(item);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;