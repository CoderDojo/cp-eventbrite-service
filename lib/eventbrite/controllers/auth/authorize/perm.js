module.exports = {
  authorize: [{
    role: 'basic-user',
    customValidator: [
      {
        role: 'cd-dojos',
        cmd: 'have_permissions_on_dojo',
        perm: 'dojo-admin',
      },
    ],
  }],
};
