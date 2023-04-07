/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Narisorn Chowarun__ Student ID: __169007218__ Date: __April 7, 2023_
*
*  Cyclic Web App URL: ___https://plain-ruby-rabbit.cyclic.app__
*
*  GitHub Repository URL: ___https://github.com/nrrri/web322-app.git__
*
********************************************************************************/



var express = require("express");
var app = express();
var blog = require("./blog-service.js");
var HTTP_PORT = process.env.PORT || 8080;

const multer = require("multer");
// add require for AS6
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");

const upload = multer();

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// AS4 adding .hbs
const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

const stripJs = require('strip-js');

//-------------------------------------------------------------------------------------------

cloudinary.config({
    cloud_name: "dloc6ybj4",
    api_key: "457235514631484",
    api_secret: "609MtbN8sS2j9sgsm8y3kUrTjaI",
    secure: true
});

//-------------------------------------------------------------------------------------------

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

//-------------------------------------------------------------------------------------------

// put this before routes
app.use(express.static("public"));
// fixing nav bar
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(express.urlencoded({ extended: true }));

//-------------------------------------------------------------------------------------------
// custom helper function
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        // Instead of writing something like {{postDate}}, you can instead write {{#formatDate postDate}}{{/formatDate}}

    }
}));

//-------------------------------------------------------------------------------------------
app.use(clientSessions({
    cookieName: "session", // req.session
    secret: "web322-app",
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}))

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

//-------------------------------------------------------------------------------------------
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
    res.redirect("/blog");
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
    res.render('about')
    // res.sendFile(path.join(__dirname, "/views/about.html"));
});

// '/blog'
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })

});

// route to '/blog/:id/
app.get('/blog/:id', ensureLogin, async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post = await blog.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
    console.log(viewData)
    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});

// setup another route to listen on /posts
app.get("/posts", ensureLogin, (req, res) => {
    if (req.query.category) {
        blog.getPostByCategory(req.query.category)
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", {
                        posts: data
                    })
                }
                else {
                    res.render("posts", { message: "no results" });
                }
            })
            .catch(() => {
                res.render("posts", { message: "no results" });
            })
    } else if (req.query.minDate) {
        // 
        blog.getPostByMinDate(req.query.minDate)
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", {
                        posts: data
                    })
                } else {
                    res.render("posts", { message: "no results" });

                }

            })
            .catch(() => {
                res.render("posts", { message: "no results" });
            })
    } else {
        // get all posts without filter
        blog.getAllPosts()
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", {
                        posts: data
                    })
                } else {
                    res.render("posts", { message: "no results" });
                }

            })
            .catch(() => {
                res.render("posts", { message: "no results" });
            })
    }
});

// get post by id -> add route (param :id)
app.get("/post/:id", ensureLogin, (req, res) => {
    blog.getPostById(req.params.id)
        .then((data) => {
            res.render('posts', { posts: data })

        })
        .catch(() => {
            res.render("posts", { message: "no results" });

        })
})

// setup another route to listen on /posts/add
app.get("/posts/add", ensureLogin, (req, res) => {
    blog.getCategories().then((data) => {
        res.render('addPost', { categories: data })
    }).catch(() => {
        res.render('addPost', { categories: [] })
    })

})

app.get("/posts/delete/:id", ensureLogin, (req, res) => {
    blog.deletePostById(req.params.id).then((data) => {
        res.redirect("/posts")
    }).catch(() => {
        res.status(500);
        res.render("posts", { message: "Unable to Remove Post / Post not found)" });
    })
})

// for uploading file to posts/add (picture)
app.post("/posts/add", upload.single("featureImage"), ensureLogin, (req, res) => {
    //console.log(req.body)
    console.log(req)
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
    }
});

// setup another route to listen on /categories
app.get("/categories", ensureLogin, (req, res) => {
    blog.getCategories().then((data) => {

        if (data.length > 0) {
            res.render("categories", {
                categories: data
            })
        } else {
            res.render("categories", { message: "no results" });
        }

    }).catch(() => {
        res.render("categories", { message: "no results" });
    })
})

app.get("/categories/add", ensureLogin, (req, res) => {
    res.render('addCategory')

})

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
    blog.deleteCategoryById(req.params.id).then((data) => {
        res.redirect("/categories")
    }).catch(() => {
        res.status(500);
        res.render("categories", { message: "Unable to Remove Category / Category not found)" });
    })
})

app.post("/categories/add", ensureLogin, (req, res) => {

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
            //console.log(result);
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
        blog.addCategory(req.body).then(() => {
            res.redirect("/categories")
        }).catch((err) => {
            res.redirect("/categories/add")
        })
    }
});

//-------------------------------------------------------------------------------------------

// new route for AS6
app.get("/login", (req, res) => {
    res.render('login')
})

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.username,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/post');
    }).catch((err) => {
        console.log(err)
        res.render('login',
            {
                errorMessage: err,
                userName: req.body.userName,
            })

    })
})

app.get("/register", (req, res) => {
    res.render('register')
})

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render('register', {
            successMessage: "User created",
        })
    }).catch((err) => {
        console.log(err)
        res.render('register',
            {
                errorMessage: err,
                userName: req.body.userName
            })
    })
})

app.get("/logout", (req, res) => {
  req.session.reset();
    res.redirect('/')
})

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render('userHistory')
})


//-------------------------------------------------------------------------------------------
// setup another route to listen on err
app.use((req, res) => {
    res.status(404).render("404")
})

// setup http server to listen on HTTP_PORT
blog.initialize()
    .then(authData.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });