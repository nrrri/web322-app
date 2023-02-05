/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Narisorn Chowarun__ Student ID: __169007218__ Date: __Fubruary 4, 2023_
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: ___https://github.com/nrrri/web322-app.git__
*
********************************************************************************/ 



var express = require("express");
var app = express();
var path = require("path");
var blog = require("./blog-service.js")

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// put this before routes
app.use(express.static("public"));


// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect("/about");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
    //res.send("About me");
    
});

// setup another route to listen on /blog
app.get("/blog",(req,res) => {
blog.getPublishedPosts().then((posts) => {
    res.json(posts)
    //res.send("TODO:get all pasts who have published==true");
}).catch((err) => {
    console.log(err)
    res.send(err)
})
})

// setup another route to listen on /posts
app.get("/posts",(req,res) => {
    blog.getAllPosts().then((posts) => {
        res.json(posts)
    }).catch((err)=> {
        console.log(err)
        res.send(err)
    })
    //res.send("this is in posts new");
    })

// setup another route to listen on /categories
app.get("/categories",(req,res) => {
    blog.getCategories().then((categories) => {
        res.json(categories)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
    //res.send("this is in categories new");
    })


// setup another route to listen on err
app.use((req, res) => {
    res.status(404).send("Page Not Found")
  })

// setup http server to listen on HTTP_PORT
blog.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
})