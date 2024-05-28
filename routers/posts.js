const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController.js");
const multer = require("multer");
const uploader = multer({dest: "public"});
// siamo in /posts
router.get("/", postsController.index);
router.get("/create", postsController.create);
router.get("/:slug", postsController.show);
router.get("/:slug/download", postsController.downloadImage);
router.post("/", postsController.create); 
router.delete("/:slug", postsController.destroy);

module.exports = router;
