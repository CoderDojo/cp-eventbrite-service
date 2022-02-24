const async = require('async');

module.exports = () =>
  function getOrganisations(args, cb) {
    const seneca = this;
    const secKey = process.env.EVENTBRITE_SECRET_KEY;
    const pubKey = process.env.EVENTBRITE_PUBLIC_KEY;
    const code = args.code;
    const auth = seneca.export('cd-eventbrite/acts').auth;
    const response = {};

    auth.get({ pubKey, secKey, code }).then((body) => {
      const token = body.access_token;
      const webhooks = seneca.export('cd-eventbrite/acts').webhook;

      getOrganisationId().then((res) => {
        response.organisations = res;
        response.token = token;
        return cb(null, response);
      })
      .catch((err) => {
        seneca.log.error(err);
        return cb(new Error('An unknown error happened'));
      });

      async function getOrganisationId() {
        let organisations = [];

        await webhooks
          .get({token})
          .then((res) => {
            res['organizations'].forEach(org => {
              organisations.push({'name' : org.name, 'id' : org.id});
            });
          })
          .catch((err) => {
            seneca.log.error(err);
            return cb(new Error('Error when getting organisations'));
          });

        return organisations;
      }
    });
  };