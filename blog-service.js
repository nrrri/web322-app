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
            resolve(posts.filter(({ published }) => published == true))
        } else {
            reject("No results returned")
        }
    })
}

// filter category
module.exports.getPostByCategory = (category) => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts.filter(posts => posts.category == category))
        } else {
            reject("no results returned")
        }
    })
}

module.exports.getPostByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let postByDate = posts.filter(posts => new Date(posts.postDate) >= new Date(minDateStr))
        if(postByDate.length > 0) {
            resolve(postByDate)
            
        } else {
            reject("no results returned")
        }
    })
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            console.log(id)
            resolve(posts.filter(posts => posts.id == id))
        } else {
            reject("no result returned")
        }
    })
}


module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        if (postData) {
            postData.id = posts.length + 1
            // add postDate
            postData.postDate = postDate
            posts.push(postData)
            console.log(postData)
            resolve(postData)
        } else {
            reject("failed")
        }
    })
}

// check posts is published and filtered by category
module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            let checkPublished = posts.filter(({ published }) => published == true)
            let checkCategory = posts.filter ((posts) => posts.category == category)

            resolve(checkPublished && checkCategory)
        } else {
            reject("No results returned")
        }
    })
}