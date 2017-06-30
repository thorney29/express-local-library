var express = require('express');
var router = express.Router();

/* GET users listing. */
// next is not used in this example
router.get('/home', function(req, res, next) {
  res.send('respond with a resource for user');
});
router.get('/cool', function(req, res, next) {
  res.send('You are so cool');
});
module.exports = router;
