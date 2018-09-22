var express = require('express');
var router = express.Router();
const GoogleImages = require('google-images');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/images/:text', (req, res) => {

  let textSearch = req.params.text

  const client = new GoogleImages(process.env.CSEID, process.env.APIKEY);
  
  client.search(textSearch)
      .then(images => {
        res.send(images)
      });

})

module.exports = router;
