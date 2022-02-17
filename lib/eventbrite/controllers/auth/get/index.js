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
        response.orgId = res;
        response.token = token;
        return cb(null, response);
      });

      async function getOrganisationId() {
        let orgId = '';

        await webhooks
        .get({token})
        .then((res) => {
          orgId = res['organizations'][0]['id'];
          // if (res['organizations'].length === 1) {
          //   orgId = res['organizations'][0]['id'];
          // } else {
          //   orgId = res['organizations'];
          //   console.log('*****',res['organizations']);
          //   console.log('length', res['organizations'].length);
          // }
        })
        .catch((err) => {
          seneca.log.error(err);
          return cb(new Error('An unknown error happened'));
        });

        return orgId;
      }
    });
  };