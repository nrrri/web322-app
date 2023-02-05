const fs = require("fs")
let categories = []
let posts = []


module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject()
            } else {
                console.log(data)
                posts = JSON.parse(data)

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject()
                    } else {
                        console.log(data)
                        categories = JSON.parse(data)
                        resolve()
                    }
                })
            }
        })
    })
}


// export Categories array
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories)
        } else {
            reject("No results returned")
        }
    })
}

// export Posts array
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts)
        } else {
            reject("No results returned")
        }
    })
}

// export Blog pub;ish == true
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0 && posts.indexOf("published") == true) {
            resolve(posts)
        } else {
            reject("No results returned")
        }
    })
}