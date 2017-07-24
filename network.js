'use strict';

module.exports = function (seneca) {
  seneca.listen()
    .client({
      type: 'web',
      host: process.env.CD_DOJOS || 'localhost',
      port: 10301,
      pin: {
        role: 'cd-dojos',
        cmd: '*'
      }
    })
    .client({
      type: 'web',
      host: process.env.CD_EVENTS || 'localhost',
      port: 10306,
      pin: {
        role: 'cd-events',
        cmd: '*'
      }
    });
};
