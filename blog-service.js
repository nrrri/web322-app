// Sequelize
const Sequelize = require('sequelize');
var sequelize = new Sequelize('huawarsj', 'huawarsj', 'VZJxm9BNwTZ1nse89KsI4KO5fvkBj1t4', {
    host: 'postgres://huawarsj:VZJxm9BNwTZ1nse89KsI4KO5fvkBj1t4@ruby.db.elephantsql.com/huawarsj',
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



module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            console.log("POST GRES DB LOADED")
            resolve()
        }).catch((err) => {
            console.log("unable to sync the database")
            reject()
        })
    })
}


// export Categories array
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then((Category)=> {
            resolve([Category])
        }).catch((err) => {
            reject();
        })
    })
}

// export Posts array
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then((Post) => {
            resolve([Post])
        }).catch((err) => {
            console.log("no results returned")
            reject()
        })
    })
}

// export Blog publish == true
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then(() => {
            resolve(Post.findAll({
                where: {
                    published: true
                }
            }))
        }).catch((err) => {
            console.log("no results returned")
            reject()
        })
    })
}

// filter category
module.exports.getPostByCategory = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: id
            }
        }).then((posts) => {
            resolve(posts)
        }).catch((err) => {
            console.log("no results returned")
            reject()
        })
    })
}

module.exports.getPostByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(() => {
            resolve()
        }).catch((err) => {
            console.log("no results returned")
            reject()
        })
    })
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then(() => {
            resolve()
        }).catch((err) => {
            console.log("no results returned")
            reject()
        })
    })
}


module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (prop in postData) {
            if (prop == "") prop = null; // prop = properties
        }
        postData.postDate = new Date()
        Post.create(postData).then(() => {
            resolve(postData)
        }).catch((err) => {
            console.log("no results returned")
            reject()
        })
    })
}

// check posts is published and filtered by category
module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        // find true for published
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(() => {
            resolve()
        }).catch((err) => {
            console.log("no results returned")
            reject()
        })
    })
}