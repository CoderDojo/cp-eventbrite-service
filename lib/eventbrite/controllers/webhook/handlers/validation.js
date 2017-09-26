const Joi = require('joi');

module.exports = () => ({
  api_url: Joi.string().required(),

  config: Joi.object({
    action: Joi.string().required(),
    user_id: Joi.string().required(),
    endpoint_url: Joi.string().required(),
    webhook_id: Joi.string().required(),
  }).required(),
});
