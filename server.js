/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Narisorn Chowarun__ Student ID: __169007218__ Date: __Fubruary 4, 2023_
*
*  Cyclic Web App URL: ___https://app.cyclic.sh/#/deploy/nrrri/web322-app__
*
*  GitHub Repository URL: ___https://github.com/nrrri/web322-app.git__
*
********************************************************************************/



var express = require("express");
var app = express();
var path = require("path");
var blog = require("./blog-service.js");

const multer = require("multer");
const upload = multer();

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: "dloc6ybj4",
    api_key: "457235514631484",
    api_secret: "609MtbN8sS2j9sgsm8y3kUrTjaI",
    secure: true
});


var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// put this before routes
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
    res.redirect("/about");
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
    //res.send("About me");

});

// setup another route to listen on /blog
app.get("/blog", (req, res) => {
    blog.getPublishedPosts().then((posts) => {
        res.json(posts)
        //res.send("TODO:get all pasts who have published==true");
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
})

// setup another route to listen on /posts
app.get("/posts", (req, res) => {
    if (req.query.category) {
        blog.getAllPostsByCategory(req.query.category)
            .then((posts) => { res.json(posts) })
            .catch((err) => {
                console.log(err)
                res.send(err)
            })
    } else if (req.query.postDate) {
        blog.getAllPostsByMinDate(req.query.postDate)
            .then((posts) => { res.json(posts) })
            .catch((err) => {
                console.log(err)
                res.send(err)
            })
    } else {
        blog.getAllPosts()
            .then((posts) => { res.json(posts) })
            .catch((err) => {
                console.log(err)
                res.send(err)
            })
    }
    //res.send("this is in posts new");
})

app.get("/post/value",(req,res) => {
    blog.getPostById(req.query.id)
    .then((posts) => { res.json(req.query.id) })
    .catch((err) => {
        console.log(err)
        res.send(err)
    })
})

// setup another route to listen on /categories
app.get("/categories", (req, res) => {
    blog.getCategories().then((categories) => {
        res.json(categories)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
    //res.send("this is in categories new");
})

// setup another route to listen on /posts/add
app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
})

// for uploading file to posts/add (picture)
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    //console.log(req.body)
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");

    }

    function processPost(imageUrl) {

        req.body.featureImage = imageUrl;
        blog.addPost(req.body).then(() => {
            res.redirect("/posts")
        }).catch((err) => {
            res.redirect("/posts/add")
        })

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    }
});

// setup another route to listen on err
app.use((req, res) => {
    res.status(404).send("Page Not Found")
})

// setup http server to listen on HTTP_PORT
blog.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
})