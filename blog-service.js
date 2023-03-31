// Sequelize
const Sequelize = require('sequelize');
var sequelize = new Sequelize('huawarsj', 'huawarsj', 'VZJxm9BNwTZ1nse89KsI4KO5fvkBj1t4', {
    host: 'ruby.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
})

Post.belongsTo(Category, { foreignKey: 'category' });
const { gte } = Sequelize.Op;


// note: rechecked
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            console.log("POST GRES DB LOADED")
            resolve()
        }).catch((err) => {
            console.log("unable to sync the database")
            reject(err)
        })
    })
}

// note: rechecked
// export Categories array
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then(() => {
            // // recheck
            // console.log("Recheck getCategory")
            // console.log([Category])
            // // end
            resolve()
        }).catch((err) => {
            reject(err);
        })
    })
}

// note: rechecked
// export Posts array
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then((Posts) => {
            resolve(Posts)
        }).catch((err) => {
            console.log("no results returned")
            reject(err)
        })
    })
}

// export Blog publish == true
// note: rechecked
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then((Posts) => {
            // // check
            // console.log([Posts])
            // console.log("Check from getPublishedPosts")
            // // end
            resolve(Posts)
        }).catch((err) => {
            console.log("no results returned")
            reject(err)
        })
    })
}

// note: rechecked
// filter category
module.exports.getPostByCategory = (id) => {
    // use a value pass to function
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then((posts) => {
            // // check 
            // console.log("This is from getPostByCategory receiving id = number but (type = String)")
            // console.log([posts])
            // // dont forget to delete later
            resolve(posts)
        }).catch((err) => {
            console.log("no results returned")
            reject(err)
        })
    })
}

// note: rechecked
module.exports.getPostByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data) => {
            resolve(data)
        }).catch((err) => {
            console.log("no results returned")
            reject(err)
        })
    })
}

// note: rechecked
module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then((data) => {
            // // recheck
            // console.log("from getPostById")
            // console.log([data])
            // // end of recheck

            resolve(data)
        }).catch((err) => {
            console.log("no results returned")
            reject(err)
        })
    })
}

// note: rechecked
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        // check 1 : published set to true or false
        postData.published = (postData.published) ? true : false;
        // check 2 : each prop that is "" will be set to 'null'
        for (prop in postData) {
            if (prop == "") prop = null; // prop = properties
        }
        // check 3 : set new date
        postData.postDate = new Date()

        // then create new post
        Post.create(postData).then((data) => {
            console.log("POST ADDED SUCCESSFULLY")
            resolve([data])
        }).catch((err) => {
            console.log("no results returned")
            reject(err)
        })
    })
}

// add category
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {

        // check 1 : each prop that is "" will be set to 'null'
        for (prop in categoryData) {
            if (prop == "") prop = null; // prop = properties
        }

        // then create new post
        Category.create(categoryData).then((data) => {
            console.log("CATEGORY ADDED SUCCESSFULLY")
            // pass
            console.log([data])
            resolve([data])
        }).catch((err) => {
            console.log("unable to create category")
            reject(err)
        })
    })
}

// delete category by ID
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve,reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => {
            console.log("CATEGORY DELETED SUCCESSFULLY")
            resolve();
        }).catch((err) => {
            reject(err);
        })
    })
}

// delete Post by ID
module.exports.deletePostById = (id) => {
    return new Promise((resolve,reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then(() => {
            console.log("POST DELETED SUCCESSFULLY")
            resolve();
        }).catch((err) => {
            reject(err);
        })
    })
}


// note: rechecked
// check posts is published and filtered by category
module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        // find true for published
        Post.findAll({
            where: {
                published: true,
                category: category // integer value
            }
        }).then((data) => {
            // // recheck
            // console.log([data])
            // console.log("from getPublishedPostsByCategory")
            // // end
            console.log("GET POSTS SUCCESSFULLY")
            resolve(data)
        }).catch((err) => {
            console.log("no results returned")
            reject(err)
        })
    })
}