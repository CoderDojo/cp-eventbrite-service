const Joi = require('joi');
console.log('VALIDATION');

// module.exports = () => ({
//   code: Joi.string().required(),
// });

module.exports = () => ({
  code: Joi.string().required(),
});
