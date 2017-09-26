const Joi = require('joi');
const _ = require('lodash');
const validation = require('../handlers/validation');

module.exports = () => _.extend(validation, { dojo: Joi.object().required() });
