const path = require("path");
const fs = require("fs");

let posts = require("./DB/db.js");

const generateSlug = (title, existingSlugs) => {
    let slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, '');
    let counter = 1;
    while (existingSlugs.includes(slug)) {
        slug = `${slug}-${counter}`;
        counter++;
    }
    return slug;
};

const updatePosts = (newPosts) => {
    const filePath = path.join(__dirname, './DB/db.js');
    const fileContent = `module.exports = ${JSON.stringify(newPosts, null, 2)};`;
    fs.writeFileSync(filePath, fileContent);
    posts = newPosts;
};

module.exports = {
    generateSlug,
    updatePosts,
    posts
};
