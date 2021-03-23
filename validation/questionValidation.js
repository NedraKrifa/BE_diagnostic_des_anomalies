const Joi = require("@hapi/joi");

const questionValidation = (data) => {
    const schema = Joi.object({
      author: Joi.string().pattern(new RegExp(/[A-Za-z]+\.[A-Za-z]+/)).min(6).required(),
      title: Joi.string().required(),
      body: Joi.string().max(5000).required(),
      tags: Joi.array().required(),
    });
    return schema.validate(data);
  };

module.exports = questionValidation;