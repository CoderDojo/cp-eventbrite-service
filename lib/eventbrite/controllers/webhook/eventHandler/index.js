'use strict';
var _ = require('lodash');
var countries = require('country-list')();
var Promise = require('bluebird');
/**
 * Webhook handler for event update (create/update)
 * @return {[type]} [description]
 */
module.exports = function () {
  return function (args, done) {
    var seneca = this;
    var plugin = args.role;
    var events = seneca.export('cd-eventbrite/acts')['event'];
    var dojo = args.dojo;
    return events.get({url: args.api_url, qs: {expand: ['venue', 'ticket_classes'].join(',')},
      token: dojo.eventbriteToken})
    .then(syncEvent)
    .then(function () { return done(null, {http$: {status: 200}}); })
    .catch(function (err) {
      return done(null, {http$: {status: 500},
        data: 'Contact the Zen team, something went wrong !: ' + err}); });

    function syncEvent (eventbriteEvent) {
      return new Promise(function (resolve, reject) {
        seneca.act({role: 'cd-events', cmd: 'listEvents', query: {eventbriteId: eventbriteEvent.id}},
        function (err, zenEvents) {
          var event = {};
          if (err) return reject(err);
          if (zenEvents) {
            if (zenEvents.length > 1) return reject('More than a single event saved for this eventbriteEventId');
            event = zenEvents[0];
          }
          // Only expect 1 result for 1 event, eventbriteEventId should be unique
          event = _.assignIn(event, {
            public: eventbriteEvent.listed,
            eventbriteUrl: eventbriteEvent.url,
            eventbriteId: eventbriteEvent.id,
            name: eventbriteEvent.name.text,
            dates: [{startTime: eventbriteEvent.start.local, endTime: eventbriteEvent.end.local}],
            createdAt: new Date(eventbriteEvent.created),
            type: 'one-off',
            ticketApproval: false,
            dojoId: dojo.id
          });
          event.status = 'saved';
          if (eventbriteEvent.status === 'canceled') { // 'canceled' is not a typo, that's how it's spelled in the DB...
            event.status = 'cancelled';
          } else if (_.includes(['live', 'started', 'ended', 'completed'], eventbriteEvent.status)) {
            event.status = 'published';
          }
          if (eventbriteEvent.description) event.description = eventbriteEvent.description.html;
          if (eventbriteEvent.venue) {
            event.position = {
              lat: eventbriteEvent.venue.latitude,
              lng: eventbriteEvent.venue.longitude
            };
            if (eventbriteEvent.venue.address) {
              event.address = addressToString(eventbriteEvent.venue.address);
              if (eventbriteEvent.venue.address.city) {
                event.city = {'nameWithHierarchy': eventbriteEvent.venue.address.city};
              }
              if (eventbriteEvent.venue.address.country) {
                event.country = {
                  countryName: countries.getName(eventbriteEvent.venue.address.country),
                  alpha2: eventbriteEvent.venue.address.country
                };
              }
            }
          }
          seneca.act({role: 'cd-events', cmd: 'saveEvent', eventInfo: event}, function (err) {
            if (err) return reject(err);
            return resolve(event);
          });
        });
      });
    }

    function addressToString (address) {
      var addressStr = '';
      if (address.address_1) addressStr += address.address_1 + ',\n';
      if (address.address_2) addressStr += address.address_2 + ',\n';
      if (address.city) addressStr += address.city + ',\n';
      if (address.region) addressStr += address.region + ',\n';
      if (address.postal_code) addressStr += address.postal_code + ',\n';
      return addressStr.substr(0, addressStr.length - 2); // Remove trailing comma and new line
    }
  };
};
