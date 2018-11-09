const _ = require('lodash');
const countries = require('country-list')();
const Promise = require('bluebird');
const moment = require('moment');
/**
 * Webhook handler for event update (create/update)
 * @param {Object} dojo the dojo linked to this webhook
 * @param {String} api_url the link to the resource modified (here an event)
 * @return {Object}  http code result (200||500)
 */
module.exports = () =>
  function eventHandler(args, done) {
    const seneca = this;
    const events = seneca.export('cd-eventbrite/acts').event;
    const dojo = args.dojo;
    const apiUrl = args.api_url;
    return events
      .get({
        url: apiUrl,
        qs: { expand: ['venue', 'ticket_classes'].join(',') },
        token: dojo.eventbriteToken,
      })
      .then(syncEvent)
      .then(() => done(null, { http$: { status: 200 } }))
      .catch(err =>
        done(null, {
          http$: { status: 500 },
          data: `Contact the Zen team, something went wrong !: ${err}`,
        }),
      );

    function syncEvent(eventbriteEvent) {
      return new Promise((resolve, reject) => {
        seneca.act(
          { role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: eventbriteEvent.id, dojoId: dojo.id } },
          (err, zenEvents) => {
            let event = {};
            if (err) return reject(err);
            if (zenEvents) {
              if (zenEvents.length > 1) {
                return reject(
                  new Error('More than a single event saved for this eventbriteEventId'),
                );
              }
              event = zenEvents[0];
            }
            // Only expect 1 result for 1 event, eventbriteEventId should be unique
            event = _.assignIn(event, {
              public: eventbriteEvent.listed,
              eventbriteUrl: eventbriteEvent.url,
              eventbriteId: eventbriteEvent.id,
              name: eventbriteEvent.name.text,
              createdAt: new Date(eventbriteEvent.created),
              type: 'one-off',
              ticketApproval: false,
              dojoId: dojo.id,
            });
            event = _.pickBy(event, _.identity);
            event.status = 'saved';
            if (eventbriteEvent.status === 'canceled') {
              // 'canceled' is not a typo, that's how it's spelled in the DB...
              event.status = 'cancelled';
            } else if (
              _.includes(['live', 'started', 'ended', 'completed'], eventbriteEvent.status)
            ) {
              event.status = 'published';
            }
            if (eventbriteEvent.description) event.description = eventbriteEvent.description.html;
            if (eventbriteEvent.start && eventbriteEvent.end) {
              event.dates = [
                {
                  startTime: moment.utc(eventbriteEvent.start.local).format(),
                  endTime: moment.utc(eventbriteEvent.end.local).format(),
                },
              ];
            }
            if (eventbriteEvent.venue) {
              if (eventbriteEvent.venue.latitude && eventbriteEvent.venue.longitude) {
                event.position = {
                  lat: eventbriteEvent.venue.latitude,
                  lon: eventbriteEvent.venue.longitude,
                };
              }
              if (eventbriteEvent.venue.address) {
                event.address = addressToString(eventbriteEvent.venue.address);
                if (eventbriteEvent.venue.address.city) {
                  event.city = { nameWithHierarchy: eventbriteEvent.venue.address.city };
                }
                if (eventbriteEvent.venue.address.country) {
                  event.country = {
                    countryName: countries.getName(eventbriteEvent.venue.address.country),
                    alpha2: eventbriteEvent.venue.address.country,
                  };
                }
              }
            }
            seneca.act({ role: 'cd-events', cmd: 'saveEvent', eventInfo: event, user: { id: 'eventbrite' } }, (error) => {
              if (error) return reject(error);
              return resolve(event);
            });
          },
        );
      });
    }

    function addressToString(address) {
      const addressStr = [];
      _.each(['address_1', 'address_2', 'city', 'region', 'postal_code'], (field) => {
        if (address[field]) addressStr.push(address[field]);
      });
      return addressStr.join(',\n');
    }
  };
