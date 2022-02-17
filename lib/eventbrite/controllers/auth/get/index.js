const request = require('request');

// module.exports = () => {
//   function getOrganisations(args, cb) {
//     console.log('Just checking this is hitting here ORGS ID')
//     console.log('THIS IS THE ARGS',args);
//     console.log('*******');
//   };
// request
//   .get(`https://www.eventbriteapi.com/v3/users/me/organizations/?token=${args.token}`)
//   .on('response', (res) => {
//     if (res.statusCode === 200) {
//       res.on('data', (chunk) => {
//         const body = JSON.parse(chunk);
//         cb(null, body);
//       });
//     } else {
//       cb('Invalid payload while authenticating to Eventbrite');
//     }
//   })
//   .on('error', (err) => {
//     console.log('ERROR');
//     cb(err);
//   });
// };


module.exports = () =>
  function getOrganisations(args, cb) {
    console.log('Just checking this is hitting here ORGS ID');
    console.log('THIS IS THE ARGS', args);

    const seneca = this;
    const secKey = process.env.EVENTBRITE_SECRET_KEY;
    const pubKey = process.env.EVENTBRITE_PUBLIC_KEY;
    const code = args.code;
    const user = args.user;
    const auth = seneca.export('cd-eventbrite/acts').auth;

    auth.get({ pubKey, secKey, code }).then((body) => {
      const token = body.access_token;

      request
        .get(`https://www.eventbriteapi.com/v3/users/me/organizations/?token=${token}`)
        .on('response', (res) => {
          if (res.statusCode === 200) {
            res.on('data', (chunk) => {
              const body = JSON.parse(chunk);
              console.log('BODY RESPONSE', body)
              cb(null, body);
            });
          } else {
            cb('Invalid payload while authenticating to Eventbrite');
          }
        })
        .on('error', (err) => {
          console.log('ERROR', err);
          cb(err);
        });
    });
    console.log('*******************************************');
  };
