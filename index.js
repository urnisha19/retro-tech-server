const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')
const app = express()
require('dotenv').config()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('blogs'));
app.use(fileUpload());

// MongoDB connect
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rzg3r.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const blogsCollection = client.db("Blogs").collection("blogsCollection");

  // <----------Get Methods---------->
  // check server connection
  app.get('/', (req, res) => {
    res.send('server working');
  });
  console.log("DB connected");

  //get all blogs
  app.get('/blogs', (req, res) => {
    blogsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  // get blog by object id
  app.get('/blog/:id', (req, res) => {
    blogsCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, documents) => {
        res.send(documents[0]);
    })
  });

  // <----------Delete---------->
  // delete blog by object id
  app.delete('/admin/deleteBlog/:id', (req, res)=>{
    const id = ObjectId(req.params.id); 
    blogsCollection.findOneAndDelete({_id: id})
    .then(result => {
        res.send(result.deletedCount > 0);
    });
  });
   

  // <----------Post Methods---------->
  //Add Blog
  app.post('/admin/addBlog', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const file = req.files.file;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: file.mimType,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    blogsCollection.insertOne({ title, content, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  });

});

app.listen(process.env.PORT || 5000);