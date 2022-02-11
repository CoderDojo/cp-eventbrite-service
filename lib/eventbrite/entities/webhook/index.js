const Joi = require('joi');
const createVal = require('./create/validation');
const create = require('./create');
const delVal = require('./delete/validation');
const del = require('./delete');
const get = require('./get');
const getVal = require('./get/validation');

module.exports = function webhook() {
  const seneca = this;
  const name = 'webhook';
  const domain = 'cd-eventbrite';
  seneca.context.API_BASE = 'https://www.eventbriteapi.com/v3';

  const definition = {
    id: Joi.string().required(),
    endpoint_url: Joi.string().required(),
    actions: Joi.string().required(),
    event_id: Joi.string().required(),
    token: Joi.string().required(),
  };

  return {
    name,
    domain,
    definition,
    // RO support atm
    acts: {
      create: {
        validation: createVal(definition),
        cb: create.bind(this)(),
      },
      delete: {
        validation: delVal(definition),
        cb: del.bind(this)(),
      },
      get: {
        validation: getVal(definition),
        cb: get.bind(this)()
      }
    },
  };
};
