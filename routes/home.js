var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/home', function(req, res) {
  res.redirect('/catalog');
});

module.exports = router;
