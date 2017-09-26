module.exports = options => ({
  transport: {
    type: 'web',
    web: {
      timeout: 120000,
      port: options && options.port ? options.port : 10307,
    },
  },

  // seneca-web is crashing on startup ?
  default_plugins: { web: false },

  // needed if using Seneca 2.x
  legacy: { error_codes: false, validate: false },

  timeout: 120000,
  strict: { add: false, result: false },
  actcache: { active: false },
});
