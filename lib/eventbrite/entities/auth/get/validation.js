module.exports = definition => ({
  pubKey: definition.pubKey.required(),
  secKey: definition.secKey.required(),
  code: definition.code.required(),
});
