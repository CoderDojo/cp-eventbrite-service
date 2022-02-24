const authorizeVal = require('./authorize/validation');
const authorize = require('./authorize');
const deauthorize = require('./deauthorize');
const deauthorizeVal = require('./deauthorize/validation');
const app = require('./app');
const appVal = require('./app/validation');
const organisations = require('./get');
const organisationsVal = require('./get/validation');

module.exports = function auth() {
  const seneca = this;
  const name = 'auth';
  const domain = 'cd-eventbrite';
  const plugin = 'cd-auth';
  seneca.context.TRANSPARENT = false;

  const definition = {};
  return {
    name,
    plugin,
    domain,
    definition,
    acts: {
      authorize: {
        validation: authorizeVal(definition),
        cb: authorize.bind(this)(),
      },
      deauthorize: {
        validation: deauthorizeVal(definition),
        cb: deauthorize.bind(this)(),
      },
      getApp: {
        validation: appVal(definition),
        cb: app.bind(this)(),
      },
      getOrganisations: {
        validation: organisationsVal(definition),
        cb: organisations.bind(this)(),
      },
    },
  };
};
