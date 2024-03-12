/*
* Automated Testing Kit configuration.
*/
module.exports = {
  operatingMode: "native",
  drushCmd: "drush",
  articleAddUrl: 'node/add/article',
  contactUsUrl: "form/contact",
  logInUrl: "user/login",
  logOutUrl: "user/logout",
  imageAddUrl: 'media/add/image',
  mediaDeleteUrl: 'media/{mid}/delete',
  mediaEditUrl: 'media/{mid}/edit',
  mediaList: 'admin/content/media',
  nodeDeleteUrl: 'node/{nid}/delete',
  nodeEditUrl: 'node/{nid}/edit',
  pageAddUrl: 'node/add/page',
  registerUrl: "user/register",
  resetPasswordUrl: "user/password",
  termAddUrl: 'admin/structure/taxonomy/manage/tags/add',
  termEditUrl: 'taxonomy/term/{tid}/edit',
  termDeleteUrl: 'taxonomy/term/{tid}/delete',
  termViewUrl: 'taxonomy/term/{tid}',
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
