/**
 * Webhook handler for any event registred by our webhook but not handled
 * It should reduce a certain number of unnecesary logs from zen-api
 * @return {Object}  http code result (200)
 */
module.exports = function unimplementedHandler() {
  return (args, done) => done(null, { http$: { status: 200 } });
};
