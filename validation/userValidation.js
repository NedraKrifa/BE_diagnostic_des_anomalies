//VALIDATION
const Joi = require("@hapi/joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().pattern(new RegExp(/[A-Za-z]+\.[A-Za-z]+/)).min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string().valid(Joi.ref("password")).required(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().pattern(new RegExp(/[A-Za-z]+\.[A-Za-z]+/)).min(6).required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const ValidationError = (error) => {
  return error.details[0].message;
};

module.exports = { registerValidation, loginValidation, ValidationError };