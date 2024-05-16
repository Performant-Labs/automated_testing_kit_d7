/*
* Automated Testing Kit configuration.
*/
module.exports = {
  operatingMode: "native",
  drushCmd: "drush",
  articleAddUrl: 'node/add/article',
  contactUsUrl: "contact",
  logInUrl: "user/login",
  logOutUrl: "user/logout",
  mediaAddUrl: 'media/browser',
  mediaEditUrl: 'media/{mid}/edit/js',
  nodeDeleteUrl: 'node/{nid}/delete',
  nodeEditUrl: 'node/{nid}/edit',
  pageAddUrl: 'node/add/page',
  registerUrl: "user/register",
  resetPasswordUrl: "user/password",
  termAddUrl: 'admin/structure/taxonomy/tags/add',
  authDir: "tests/support",
  dataDir: "tests/data",
  supportDir: "tests/support",
  testDir: "tests",
  pantheon : {
    isTarget: false,
    site: "aSite",
    environment: "dev"
  }
}
