const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const { result } = require('lodash');
const { render } = require('ejs');

// express app
const app = express();

// connect to mongodb & listen for requests
const dburl = `${process.env.mongoDBuri}`

mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000))
  .catch(err => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(express.urlencoded({extended:true}));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// blog routes
app.get('/blogs/create', (req, res) => {
    res.render('create', { title: 'Create a new blog' });
});
app.get('/blogs/:id',(req,res)=>{
    const id = req.params.id;
    Blog.findById(id)
    .then( result =>{
        res.render('details',{title:"blog details",blog:result})
    }).catch(err=>{
        console.log(err)
    })
})

app.get('/blogs', (req, res) => {
    Blog.find().sort({ createdAt: -1 })
    .then(result => {
        res.render('index', { blogs: result, title: 'All blogs' });
    })
    .catch(err => {
        console.log(err);
    });
});
app.post('/blogs',(req,res)=>{
    const blog = new Blog(req.body);
    blog.save()
    .then( result =>{
        res.redirect('/');
    }).catch(err => {
        console.log(err);
    })
})

// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});
