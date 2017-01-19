var express = require('express');
var router = express.Router();

var template = require('../views/page2/template.marko');

router.get('/', function(req, res) {
  template.render({ content: 'This is page 2' }, res);
});

module.exports = router;