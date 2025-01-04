const express = require("express");
const fs = require("fs");
const ObjectId = require("mongodb").ObjectId;
const auth = require("./../auth");
const authOptional = require("./../auth-optional");
const posts = require("./posts");

module.exports = {
    limit: 15,

    init (app) {
        const self = this;
        const router = express.Router();

        router.post("/fetch-followers", async function (request, result) {
            result.json({
                status: "info",
                title: premiumVersionTitle,
                message: premiumVersionText
            });
        });

        router.post("/toggle-follow", auth, async function (request, result) {
            result.json({
                status: "info",
                title: premiumVersionTitle,
                message: premiumVersionText
            });
        });

        router.post("/fetch-single", authOptional, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const pageNumber = request.fields.page || 1;

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required field missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid '_id' value."
                });
                return;
            }

            const pages = await db.collection("pages")
                .aggregate([{
                    $match: {
                        _id: ObjectId.createFromHexString(_id)
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $unwind: "$user"
                }]).toArray();

            if (pages.length == 0) {
                result.json({
                    status: "error",
                    message: "Page not found."
                });
                return;
            }

            const page = pages[0];
            
            if (page.status == "inActive" && !(user != null && page.userId.toString() == user._id.toString())) {
                result.json({
                    status: "error",
                    message: "Page is in-active."
                });
                return;
            }

            const obj = {
                _id: page._id,
                name: page.name || "",
                description: page.description || "",
                status: page.status || "",
                user: {
                    _id: page.user._id || "",
                    name: page.user.name || "",
                    profileImage: page.user.profileImage?.path || "",
                },
                followersCount: page.followers || 0,
                image: page.image?.path || "",
                isFollowing: false,
                isMyPage: false,
                createdAt: new Date(page.createdAt).toLocaleString()
            };

            if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
            }

            if (obj.image && fs.existsSync(obj.image)) {
                obj.image = baseUrl + "/" + obj.image;
            }

            obj.posts = await posts.fetch({
                pageId: page._id
            }, pageNumber, user);

            if (user != null) {
                if (user._id.toString() == page.userId.toString()) {
                    obj.isMyPage = true;
                }
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                page: obj
            });
        });

        router.post("/delete", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required field missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid '_id' value."
                });
                return;
            }

            const page = await db.collection("pages")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (page == null) {
                result.json({
                    status: "error",
                    message: "Page not found."
                });
                return;
            }

            if (page.image && page.image.path && fs.existsSync(page.image.path)) {
                fs.unlinkSync(page.image.path);
            }

            const posts = await db.collection("posts")
                .find({
                    pageId: page._id
                })
                .toArray();

            for (let a = 0; a < posts.length; a++) {
                for (let b = 0; b < (posts[a].files || []).length; b++) {
                    if (posts[a].files[b].path && fs.existsSync(posts[a].files[b].path)) {
                        fs.unlinkSync(posts[a].files[b].path);
                    }
                }
            }

            await db.collection("posts")
                .deleteMany({
                    pageId: page._id
                });

            await db.collection("pages")
                .findOneAndDelete({
                    _id: page._id
                });

            result.json({
                status: "success",
                message: "Page has been deleted."
            });
        });

        router.post("/update", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const name = request.fields.name || "";
            const description = request.fields.description || "";
            const status = request.fields.status || "active";
            const image = request.files.image;

            if (!_id || !name || !description || !status) {
                result.json({
                    status: "error",
                    message: "Required fields missing."
                });
                return;
            }

            if (!["active", "inActive"].includes(status)) {
                result.json({
                    status: "error",
                    message: "In-valid 'status' value."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid '_id' value."
                });
                return;
            }

            const page = await db.collection("pages")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (page == null) {
                result.json({
                    status: "error",
                    message: "Page not found."
                });
                return;
            }

            const obj = {
                name: name,
                description: description,
                status: status,
                updatedAt: new Date().toUTCString()
            };

            if (image && image.size > 0) {
                if (Array.isArray(image)) {
                    result.json({
                        status: "error",
                        message: "Please select only 1 file."
                    });
                    return;
                }

                if (image.type.toLowerCase().includes("heic")) {
                    result.json({
                        status: "error",
                        message: "'HEIC' format are not supported right now."
                    });
                    return;
                }

                if (!image.type.toLowerCase().includes("image")) {
                    result.json({
                        status: "error",
                        message: "Only image file is allowed."
                    });
                    return;
                }

                if (page.image && page.image.path && fs.existsSync(page.image.path)) {
                    fs.unlinkSync(page.image.path);
                }

                if (!fs.existsSync("uploads/public/pages")) {
                    fs.mkdirSync("uploads/public/pages");
                }

                const fileContent = fs.readFileSync(image.path);
                const fileLocation = "uploads/public/pages/" + crypto.randomUUID() + ".png";
                fs.writeFileSync(fileLocation, fileContent);
                fs.unlinkSync(image.path);

                obj.image = {
                    path: fileLocation,
                    name: image.name,
                    size: image.size,
                    type: image.mimetype
                };
            }

            await db.collection("pages")
                .findOneAndUpdate({
                    _id: page._id
                }, {
                    $set: obj
                });

            if (obj.image != null && obj.image.path && fs.existsSync(obj.image.path)) {
                obj.image.path = baseUrl + "/" + obj.image.path;
            }

            result.json({
                status: "success",
                message: "Page has been updated.",
                page: obj
            });
        });

        router.post("/fetch-my-followed", auth, async function (request, result) {
            result.json({
                status: "info",
                title: premiumVersionTitle,
                message: premiumVersionText
            });
        });

        router.post("/fetch-my", auth, async function (request, result) {
            const user = request.user;
            const query = request.fields.query || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            let searchObj = {};
            
            const searchArr = [];
            searchArr.push({
                userId: user._id
            });
            
            if (query != "") {
                searchArr.push({
                    name: {
                        $regex: query,
                        $options: "i"
                    }
                });
            }
            if (searchArr.length > 0) {
                searchObj = {
                    $and: searchArr
                };
            }

            const pages = await db.collection("pages")
                .find(searchObj)
                .skip(skip)
                .limit(self.limit)
                .toArray();

            const pagesArr = [];
            for (let a = 0; a < pages.length; a++) {
                const obj = {
                    _id: pages[a]._id,
                    name: pages[a].name || "",
                    description: pages[a].description || "",
                    status: pages[a].status || "",
                    followers: pages[a].followers || 0,
                    image: pages[a].image?.path || "",
                    createdAt: new Date(pages[a].createdAt).toLocaleString()
                };

                if (obj.image && fs.existsSync(obj.image)) {
                    obj.image = baseUrl + "/" + obj.image;
                }

                pagesArr.push(obj);
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                pages: pagesArr
            });
            return;
        });

        router.post("/fetch", async function (request, result) {
            const query = request.fields.query || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            let searchObj = {};
            
            const searchArr = [];
            searchArr.push({
                status: "active"
            });
            
            if (query != "") {
                searchArr.push({
                    name: {
                        $regex: query,
                        $options: "i"
                    }
                });
            }
            if (searchArr.length > 0) {
                searchObj = {
                    $and: searchArr
                };
            }

            const pages = await db.collection("pages")
                .find(searchObj)
                .skip(skip)
                .limit(self.limit)
                .toArray();

            const pagesArr = [];
            for (let a = 0; a < pages.length; a++) {
                const obj = {
                    _id: pages[a]._id,
                    name: pages[a].name || "",
                    description: pages[a].description || "",
                    status: pages[a].status || "",
                    userId: pages[a].userId,
                    followers: pages[a].followers || 0,
                    isFollowed: false,
                    image: pages[a].image?.path || "",
                    createdAt: new Date(pages[a].createdAt).toLocaleString()
                };

                if (obj.image && fs.existsSync(obj.image)) {
                    obj.image = baseUrl + "/" + obj.image;
                }

                pagesArr.push(obj);
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                pages: pagesArr
            });
        });

        router.post("/create", auth, async function (request, result) {
            const user = request.user;
            const name = request.fields.name || "";
            const description = request.fields.description || "";
            const status = request.fields.status || "active";
            const image = request.files.image;

            if (!name || !description || !status || !image) {
                result.json({
                    status: "error",
                    message: "Required fields missing."
                });
                return;
            }

            if (!["active", "inActive"].includes(status)) {
                result.json({
                    status: "error",
                    message: "In-valid 'status' value."
                });
                return;
            }

            if (Array.isArray(image)) {
                result.json({
                    status: "error",
                    message: "Please select only 1 file."
                });
                return;
            }

            if (image.type.toLowerCase().includes("heic")) {
                result.json({
                    status: "error",
                    message: "'HEIC' format are not supported right now."
                });
                return;
            }

            if (!image.type.toLowerCase().includes("image")) {
                result.json({
                    status: "error",
                    message: "Only image file is allowed."
                });
                return;
            }

            if (image.size <= 0) {
                result.json({
                    status: "error",
                    message: "In-valid image file."
                });
                return;
            }

            const obj = {
                name: name,
                description: description,
                status: status,
                userId: user._id,
                followers: 0,
                // mediaId: mediaId,
                image: null,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };

            if (!fs.existsSync("uploads/public/pages")) {
                fs.mkdirSync("uploads/public/pages");
            }

            const fileContent = fs.readFileSync(image.path);
            const fileLocation = "uploads/public/pages/" + crypto.randomUUID() + ".png";
            fs.writeFileSync(fileLocation, fileContent);
            fs.unlinkSync(image.path);

            obj.image = {
                path: fileLocation,
                name: image.name,
                size: image.size,
                type: image.mimetype
            };

            await db.collection("pages")
                .insertOne(obj);

            if (fs.existsSync(obj.image.path)) {
                obj.image.path = baseUrl + "/" + obj.image.path;
            }

            result.json({
                status: "success",
                message: "Page has been created.",
                page: obj
            });
        });

        app.use("/sn/pages", router);
    }
};