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
        if (posts.length > 0) {
            resolve(posts.filter(({ published }) => published === true))
        } else {
            reject("No results returned")
        }
    })
}

module.exports.getPostByCategory = (num) => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts.filter(({ category }) => category == num))
        } else {
            reject("no results returned")
        }
    })
}

module.exports.getPostByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts.filter(({ postDate }) => new Date(postDate) >=  new Date(minDateStr)))
            // recheck
            // if(new Date(somePostObj.postDate) >= new Date(minDateStr)){
            //     console.log("The postDate value is greater than minDateStr")
            // }
            
        } else {
            reject("no results returned")
        }
    })
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts.filter(({ id }) => this.id == id))
        } else {
            reject("no result returned")
        }
    })
}


module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        if (postData) {

            postData.id = posts.length + 1
            posts.push(postData)
            console.log(postData)
            resolve(postData)
        } else {
            reject("failed")
        }
    })
}

