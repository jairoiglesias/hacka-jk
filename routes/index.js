
module.exports = function(app){
  
  let GoogleImages = require('google-images');
  let ig = require('instagram-node').instagram();
  let igScrap = require('instagram-scraping');
  let fs = require('fs')
  var uuid = require('uuid')
  
  var multer = require('multer')
  
  let accessToken = ''
  
  //the redirect uri we set when registering our application
  var redirectUri = 'http://localhost:3000/instagram_callback';
  
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  
  app.get('/images/:text', (req, res) => {
  
    let textSearch = req.params.text
  
    const client = new GoogleImages(process.env.CSEID, process.env.APIKEY);
    
    let options = {
      imgSize: 'medium'
    }
  
    client.search(textSearch, options).then(googleImages => {
  
      igScrap.scrapeTag(textSearch).then(function(igImages){

        // let resp = {
        //   google: googleImages,
        //   instagram: igImages
        // }
              
        let _googleImages = googleImages.slice(0, 10).map((imageData, imageIndex) => {
          return imageData.url
        })
        
        let _igImages = igImages.medias.slice(0, 10).map((imageData, imageIndex) => {
          return imageData.display_url
        })

        let urls = _googleImages.concat(_igImages)
        
        let resp = {
          name: textSearch,
          "image-hero": urls[0],
          looks: urls
        }

        res.send(resp)

      })
  
  
    });
  
  })
  
  app.get('/instagram_callback', (req, res) => {
  
    //retrieves the code that was passed along as a query to the '/handleAuth' route and uses this code to construct an access token
    ig.authorize_user(req.query.code, redirectUri, function(err, result){
        if(err) res.send(err);
  
        // store this access_token in a global variable called accessToken
        accessToken = result.access_token;
  
        console.log('accessToken')
        console.log(accessToken)
  
        ig.use({
          access_token: accessToken
        });
  
        console.log('pesquisando imagens por tag')
        ig.tag_media_recent('cachorro', function(err, result, pagination, remaining, limit) {
  
          console.log(result)
          console.log(pagination)
    
          // res.send(images)
          res.send('1')
  
        })
  
    });
  
  })
  
  app.get('/authorize', (req, res) => {
  
    ig.use({
      client_id: '742f8aeca20847e1a4184c5dabd5ee04',
      client_secret: '09a05cf282f34e368491708a8ee9a69d'
    });
  
    // set the scope of our application to be able to access likes and public content
    res.redirect(ig.get_authorization_url(redirectUri, { scope : ['public_content','likes']}) );
  });
  
  var upload = multer({ 
    dest: 'uploads/' 
  })
  
  app.post('/upload', upload.any(), (req, res) => {
    
    console.log(req.files)

    let fileName = req.files[0].filename

    let _uuid = uuid.v4()

    fs.rename('./uploads/' + fileName, './uploads/' + _uuid, (err) => {

      if (err) throw err;
      console.log('renamed')
      res.send(_uuid)

    })
    
  })

  app.get('/get_image/:uuid', (req, res) => {
    
    var _uuid = req.params.uuid

    var imagemPath = './uploads/'+_uuid

    // Configura o retorno do content
    res.set('Content-Type', 'image/png')

    // Efetua leitura da imagem
    fs.readFile(imagemPath, function(err, data) {

      if(err) throw err
      
      res.send(data)
      
    })

  })
}

