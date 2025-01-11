const express = require("express");
const fs = require("fs");
const auth = require("./../auth");
const authOptional = require("./../auth-optional");
const notifications = require("./../notifications");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

module.exports = {
    limit: 15,

    async count(searchObj) {
        return await db.collection("posts")
            .countDocuments(searchObj);
    },

    async fetch(searchObj, page, user) {
        const skip = (page - 1) * this.limit;

        const posts = await db.collection("posts")
            .aggregate([{
                $match: searchObj
            }, {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }, {
                $lookup: {
                    from: "posts",
                    localField: "postId",
                    foreignField: "_id",
                    as: "sharedPost"
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "sharedPost.userId",
                    foreignField: "_id",
                    as: "sharedPostUser"
                }
            }, {
                $unwind: "$user"
            }, {
                $unwind: {
                    path: "$sharedPost",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $addFields: {
                    "sharedPost.user": {
                        $arrayElemAt: ["$sharedPostUser", 0]
                    }
                }
            }, {
                $project: {
                    sharedPostUser: 0
                }
            }, {
                /*$sort: {
                    _id: -1
                }*/

                $sample: {
                    size: this.limit
                }
            }, {
                $skip: skip
            }/*, {
                $limit: this.limit
            }*/])
            .toArray();

        const postsArr = [];
        const postIds = [];
        
        for (let a = 0; a < posts.length; a++) {
            const obj = {
                _id: posts[a]._id,
                user: {
                    _id: posts[a].user._id || "",
                    name: posts[a].user.name || "",
                    email: posts[a].user.email || "",
                    profileImage: posts[a].user.profileImage?.path || "",
                },
                caption: posts[a].caption || "",
                type: posts[a].type || "post",
                sharedPost: null,
                files: [],
                views: posts[a].views || 0,
                likes: posts[a].likes || 0,
                comments: posts[a].comments || 0,
                shares: posts[a].shares || 0,
                hasLiked: false,
                createdAt: new Date(posts[a].createdAt).toLocaleString()
            };

            if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
            }

            const files = [];
            for (let b = 0; b < (posts[a].files || []).length; b++) {
                if (posts[a].files[b].path && fs.existsSync(posts[a].files[b].path))
                    posts[a].files[b].path = baseUrl + "/" + posts[a].files[b].path;

                files.push({
                    name: posts[a].files[b].name || "",
                    size: posts[a].files[b].size || 0,
                    type: posts[a].files[b].type || "",
                    path: posts[a].files[b].path || ""
                });
            }
            obj.files = files;

            if (posts[a].type == "shared" && Object.keys(posts[a].sharedPost).length > 0) {
                const sharedPost = posts[a].sharedPost;
                const sharedPostObj = {
                    _id: sharedPost._id,
                    user: {
                        _id: sharedPost.user._id || "",
                        name: sharedPost.user.name || "",
                        email: sharedPost.user.email || "",
                        profileImage: sharedPost.user.profileImage?.path || "",
                    },
                    caption: sharedPost.caption || "",
                    type: sharedPost.type || "post",
                    files: [],
                    files: [],
                    views: sharedPost.views || 0,
                    likes: sharedPost.likes || 0,
                    comments: sharedPost.comments || 0,
                    shares: sharedPost.shares || 0,
                    hasLiked: false,
                    createdAt: new Date(sharedPost.createdAt).toLocaleString()
                };

                if (sharedPostObj.user.profileImage && fs.existsSync(sharedPostObj.user.profileImage)) {
                    sharedPostObj.user.profileImage = baseUrl + "/" + sharedPostObj.user.profileImage;
                }

                const sharedPostFiles = [];
                for (let b = 0; b < (sharedPost.files || []).length; b++) {
                    if (sharedPost.files[b].path && fs.existsSync(sharedPost.files[b].path))
                        sharedPost.files[b].path = baseUrl + "/" + sharedPost.files[b].path;

                    sharedPostFiles.push({
                        name: sharedPost.files[b].name || "",
                        size: sharedPost.files[b].size || 0,
                        type: sharedPost.files[b].type || "",
                        path: sharedPost.files[b].path || ""
                    });
                }
                sharedPostObj.files = sharedPostFiles;

                obj.sharedPost = sharedPostObj;
            }

            postsArr.push(obj);
            postIds.push(obj._id);
        }

        if (user != null) {
            const postLikers = await db.collection("post_likers")
                .find({
                    $and: [{
                        postId: {
                            $in: postIds
                        }
                    }, {
                        userId: user._id
                    }]
                })
                .toArray();

            for (let a = 0; a < postsArr.length; a++) {
                for (let b = 0; b < postLikers.length; b++) {
                    if (postLikers[b].postId.toString() == postsArr[a]._id.toString()) {
                        postsArr[a].hasLiked = true;
                        break;
                    }
                }
            }
        }

        return postsArr;
    },

    init(app) {
        const self = this;
        const router = express.Router();

        router.post("/fetch-likers", async function (request, result) {
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const postLikers = await db.collection("post_likers")
                .aggregate([{
                    $match: {
                        postId: ObjectId.createFromHexString(_id)
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
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: skip
                }, {
                    $limit: self.limit
                }]).toArray();

            const postLikersArr = [];
            for (let a = 0; a < postLikers.length; a++) {
                const obj = {
                    _id: postLikers[a]._id,
                    user: {
                        _id: postLikers[a].user._id || "",
                        name: postLikers[a].user.name || "",
                        email: postLikers[a].user.email || "",
                        profileImage: postLikers[a].user.profileImage?.path || "",
                    },
                    createdAt: new Date(postLikers[a].createdAt).toLocaleString()
                };

                if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                    obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
                }

                postLikersArr.push(obj);
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                likers: postLikersArr
            });
        });

        // Toggle like, un-like.
        router.post("/toggle-like", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const post = await db.collection("posts")
                .findOne({
                    _id: ObjectId.createFromHexString(_id)
                });

            if (post == null) {
                result.json({
                    status: "error",
                    message: "Post not found."
                });
                return;
            }

            const postLiker = await db.collection("post_likers")
                .findOne({
                    $and: [{
                        postId: post._id
                    }, {
                        userId: user._id
                    }]
                });

            if (postLiker == null) {
                await db.collection("post_likers")
                    .insertOne({
                        postId: post._id,
                        userId: user._id,
                        createdAt: new Date().toUTCString()
                    });

                await db.collection("posts")
                    .findOneAndUpdate({
                        _id: post._id
                    }, {
                        $inc: {
                            likes: 1
                        }
                    });

                notifications.insert({
                    userId: post.userId,
                    sentBy: user._id,
                    type: "postLiked",
                    content: "'" + user.name + "' liked your post '" + (post.caption || "") + "'",
                    postId: post._id,
                    isRead: false,
                    createdAt: new Date().toUTCString(),
                    updatedAt: new Date().toUTCString()
                });

                result.json({
                    status: "success",
                    message: "Post has been liked.",
                    type: "liked"
                });
                return;
            }

            await db.collection("post_likers")
                .findOneAndDelete({
                    _id: postLiker._id
                });

            await db.collection("posts")
                .findOneAndUpdate({
                    _id: post._id
                }, {
                    $inc: {
                        likes: -1
                    }
                });

            result.json({
                status: "success",
                message: "Post has been un-liked.",
                type: "un_liked"
            });
        });

        // Post comment.
        router.post("/comments/send", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const comment = request.fields.comment || "";

            if (!_id || !comment) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const post = await db.collection("posts")
                .findOne({
                    _id: ObjectId.createFromHexString(_id)
                });

            if (post == null) {
                result.json({
                    status: "error",
                    message: "Post not found."
                });
                return;
            }

            const commentObj = {
                userId: user._id,
                postId: post._id,
                comment: comment,
                replies: 0,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };

            await db.collection("comments")
                .insertOne(commentObj);

            await db.collection("posts")
                .findOneAndUpdate({
                    _id: post._id
                }, {
                    $inc: {
                        comments: 1
                    }
                });

            notifications.insert({
                userId: post.userId,
                sentBy: user._id,
                type: "newComment",
                content: "'" + user.name + "' commented on your post '" + (post.caption || "") + "'",
                commentId: commentObj._id,
                isRead: false,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            });

            const obj = {
                _id: commentObj._id,
                user: {
                    _id: user._id,
                    name: user.name || "",
                    profileImage: user.profileImage?.path || ""
                },
                comment: comment || "",
                replies: 0,
                createdAt: new Date().toLocaleString()
            };

            if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
            }

            result.json({
                status: "success",
                message: "Comment has been posted.",
                comment: obj
            });
        });

        router.post("/comments/fetch-single", async function (request, result) {
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            if (!_id || !ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const comments = await db.collection("comments")
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

            if (comments.length <= 0) {
                result.json({
                    status: "error",
                    message: "Comment not found."
                });
                return;
            }

            const comment = comments[0];

            const obj = {
                _id: comment._id,
                user: {
                    _id: comment.user._id,
                    name: comment.user.name || "",
                    profileImage: comment.user.profileImage?.path || ""
                },
                comment: comment.comment || "",
                replies: comment.replies || 0,
                createdAt: new Date(comment.createdAt).toLocaleString()
            };

            if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
            }

            const replies = await db.collection("replies")
                .aggregate([{
                    $match: {
                        commentId: comment._id
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
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: skip
                }, {
                    $limit: self.limit
                }]).toArray();

            const repliesArr = [];
            for (let a = 0; a < replies.length; a++) {
                const reply = replies[a];
                
                const replyObj = {
                    _id: reply._id,
                    user: {
                        _id: reply.user._id,
                        name: reply.user.name || "",
                        profileImage: reply.user.profileImage?.path || ""
                    },
                    reply: reply.reply || "",
                    createdAt: new Date(reply.createdAt).toLocaleString()
                };

                if (replyObj.user.profileImage && fs.existsSync(replyObj.user.profileImage)) {
                    replyObj.user.profileImage = baseUrl + "/" + replyObj.user.profileImage;
                }

                repliesArr.push(replyObj);
            }
            obj.repliesArr = repliesArr;

            result.json({
                status: "success",
                message: "Comment has been fetched.",
                comment: obj
            });
        });

        // Fetch comments, with pagination, of a post.
        router.post("/comments/fetch", async function (request, result) {
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;

            if (!_id || !ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const skip = (page - 1) * self.limit;
            /*const comments = await db.collection("comments")
                .find({
                    postId: ObjectId.createFromHexString(_id)
                })
                .skip(skip)
                .limit(self.limit)
                .sort({
                    _id: "desc"
                })
                .toArray();*/

            const comments = await db.collection("comments")
                .aggregate([{
                    $match: {
                        postId: ObjectId.createFromHexString(_id)
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
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: skip
                }, {
                    $limit: self.limit
                }]).toArray();

            const commentsArr = [];
            const commentIds = [];

            for (let a = 0; a < comments.length; a++) {
                const obj = {
                    _id: comments[a]._id,
                    user: {
                        _id: comments[a].user._id,
                        name: comments[a].user.name || "",
                        profileImage: comments[a].user.profileImage?.path || ""
                    },
                    comment: comments[a].comment || "",
                    replies: comments[a].replies || 0,
                    repliesArr: [],
                    createdAt: new Date(comments[a].createdAt).toLocaleString()
                };

                if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                    obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
                }

                commentsArr.push(obj);
                commentIds.push(obj._id);
            }

            const replies = await db.collection("replies")
                .aggregate([{
                    $match: {
                        commentId: {
                            $in: commentIds
                        }
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
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: 0
                }, {
                    $limit: self.limit
                }]).toArray();

            for (let a = 0; a < commentsArr.length; a++) {
                const repliesArr = [];
                for (let b = 0; b < replies.length; b++) {
                    const reply = replies[b];
                    
                    if (reply.commentId.toString() == commentsArr[a]._id.toString()) {
                        const replyObj = {
                            _id: reply._id,
                            user: {
                                _id: reply.user._id,
                                name: reply.user.name || "",
                                profileImage: reply.user.profileImage?.path || ""
                            },
                            reply: reply.reply || "",
                            createdAt: new Date(reply.createdAt).toLocaleString()
                        };

                        if (replyObj.user.profileImage && fs.existsSync(replyObj.user.profileImage)) {
                            replyObj.user.profileImage = baseUrl + "/" + replyObj.user.profileImage;
                        }

                        repliesArr.push(replyObj);
                    }
                }
                commentsArr[a].repliesArr = repliesArr;
            }

            result.json({
                status: "success",
                message: "Comments has been fetched.",
                comments: commentsArr
            });
        });

        // Update comment.
        router.post("/comments/update", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const comment = request.fields.comment || "";

            if (!_id || !comment) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const commentObj = await db.collection("comments")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (commentObj == null) {
                result.json({
                    status: "error",
                    message: "Comment not found."
                });
                return;
            }

            await db.collection("comments")
                .findOneAndUpdate({
                    _id: commentObj._id
                }, {
                    $set: {
                        comment: comment,
                        updatedAt: new Date().toUTCString()
                    }
                });

            result.json({
                status: "success",
                message: "Comment has been updated."
            });
        });

        // Delete comment.
        router.post("/comments/delete", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const commentObj = await db.collection("comments")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (commentObj == null) {
                result.json({
                    status: "error",
                    message: "Comment not found."
                });
                return;
            }

            await db.collection("posts")
                .findOneAndUpdate({
                    _id: commentObj.postId
                }, {
                    $inc: {
                        comments: -1
                    }
                });

            await db.collection("replies")
                .deleteMany({
                    commentId: commentObj._id
                });

            await db.collection("comments")
                .findOneAndDelete({
                    _id: commentObj._id
                });

            result.json({
                status: "success",
                message: "Comment has been deleted."
            });
        });

        // Reply on comment.
        router.post("/replies/send", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const reply = request.fields.reply || "";

            if (!_id || !reply) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const comment = await db.collection("comments")
                .findOne({
                    _id: ObjectId.createFromHexString(_id)
                });

            if (comment == null) {
                result.json({
                    status: "error",
                    message: "Comment not found."
                });
                return;
            }

            const replyObj = {
                userId: user._id,
                commentId: comment._id,
                reply: reply,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };

            await db.collection("replies")
                .insertOne(replyObj);

            await db.collection("comments")
                .findOneAndUpdate({
                    _id: comment._id
                }, {
                    $inc: {
                        replies: 1
                    }
                });

            notifications.insert({
                userId: comment.userId,
                sentBy: user._id,
                type: "newReply",
                content: "'" + user.name + "' has replied to your comment '" + (comment.comment || "") + "'",
                replyId: replyObj._id,
                isRead: false,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            });

            const obj = {
                _id: replyObj._id,
                user: {
                    _id: user._id,
                    name: user.name || "",
                    profileImage: user.profileImage?.path || ""
                },
                reply: replyObj.reply || "",
                createdAt: new Date().toLocaleString()
            };

            if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
            }

            result.json({
                status: "success",
                message: "Reply has been posted.",
                reply: obj
            });
        });

        router.post("/replies/fetch-single", async function (request, result) {
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            if (!_id || !ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            /*const replies = await db.collection("replies")
                .find({
                    "comment._id": ObjectId.createFromHexString(_id)
                })
                .skip(skip)
                .limit(self.limit)
                .sort({
                    _id: "desc"
                })
                .toArray();*/

            const replies = await db.collection("replies")
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
                    $lookup: {
                        from: "comments",
                        localField: "commentId",
                        foreignField: "_id",
                        as: "comment"
                    }
                }, {
                    $unwind: "$user"
                }, {
                    $unwind: "$comment"
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: skip
                }, {
                    $limit: self.limit
                }]).toArray();

            if (replies.length == 0) {
                result.json({
                    status: "error",
                    message: "Reply not found."
                });
                return;
            }

            const reply = replies[0];

            const replyObj = {
                _id: reply._id,
                user: {
                    _id: reply.user._id,
                    name: reply.user.name || "",
                    profileImage: reply.user.profileImage?.path || ""
                },
                reply: reply.reply || "",
                comment: reply.comment.comment || "",
                createdAt: new Date(reply.createdAt).toLocaleString()
            };

            if (replyObj.user.profileImage && fs.existsSync(replyObj.user.profileImage)) {
                replyObj.user.profileImage = baseUrl + "/" + replyObj.user.profileImage;
            }

            result.json({
                status: "success",
                message: "Reply has been fetched.",
                reply: replyObj
            });
        });

        // Fetch replies, with pagination, of a comment.
        router.post("/replies/fetch", async function (request, result) {
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;

            if (!_id || !ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const skip = (page - 1) * self.limit;
            /*const replies = await db.collection("replies")
                .find({
                    "comment._id": ObjectId.createFromHexString(_id)
                })
                .skip(skip)
                .limit(self.limit)
                .sort({
                    _id: "desc"
                })
                .toArray();*/

            const replies = await db.collection("replies")
                .aggregate([{
                    $match: {
                        commentId: ObjectId.createFromHexString(_id)
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
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: skip
                }, {
                    $limit: self.limit
                }]).toArray();

            const repliesArr = [];
            for (let a = 0; a < replies.length; a++) {
                const obj = {
                    _id: replies[a]._id,
                    user: {
                        _id: replies[a].user._id,
                        name: replies[a].user.name || "",
                        profileImage: replies[a].user.profileImage?.path || ""
                    },
                    reply: replies[a].reply || "",
                    createdAt: new Date(replies[a].createdAt).toLocaleString()
                };

                if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                    obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
                }

                repliesArr.push(obj);
            }

            result.json({
                status: "success",
                message: "Replies has been fetched.",
                replies: repliesArr
            });
        });

        // Update reply.
        router.post("/replies/update", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const reply = request.fields.reply || "";

            if (!_id || !reply) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const replyObj = await db.collection("replies")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (replyObj == null) {
                result.json({
                    status: "error",
                    message: "Reply not found."
                });
                return;
            }

            await db.collection("replies")
                .findOneAndUpdate({
                    _id: replyObj._id
                }, {
                    $set: {
                        reply: reply,
                        updatedAt: new Date().toUTCString()
                    }
                });

            result.json({
                status: "success",
                message: "Reply has been updated."
            });
        });

        // Delete reply.
        router.post("/replies/delete", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const replyObj = await db.collection("replies")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (replyObj == null) {
                result.json({
                    status: "error",
                    message: "Reply not found."
                });
                return;
            }

            await db.collection("comments")
                .findOneAndUpdate({
                    _id: replyObj.commentId
                }, {
                    $inc: {
                        replies: -1
                    }
                });

            await db.collection("replies")
                .findOneAndDelete({
                    _id: replyObj._id
                });

            result.json({
                status: "success",
                message: "Reply has been deleted."
            });
        });

        router.post("/fetch-sharers", async function (request, result) {
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const postSharers = await db.collection("post_sharers")
                .aggregate([{
                    $match: {
                        postId: ObjectId.createFromHexString(_id)
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
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: skip
                }, {
                    $limit: self.limit
                }]).toArray();

            const postSharersArr = [];
            for (let a = 0; a < postSharers.length; a++) {
                const obj = {
                    _id: postSharers[a]._id,
                    postId: postSharers[a].postId,
                    user: {
                        _id: postSharers[a].user._id || "",
                        name: postSharers[a].user.name || "",
                        email: postSharers[a].user.email || "",
                        profileImage: postSharers[a].user.profileImage?.path || "",
                    },
                    createdAt: new Date(postSharers[a].createdAt).toLocaleString()
                };

                if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                    obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
                }

                postSharersArr.push(obj);
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                sharers: postSharersArr
            });
        });

        // Share on your newsfeed with caption.
        router.post("/share", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const caption = request.fields.caption || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const post = await db.collection("posts")
                .findOne({
                    _id: ObjectId.createFromHexString(_id)
                });

            if (post == null) {
                result.json({
                    status: "error",
                    message: "Post not found."
                });
                return;
            }

            const sharedPost = {
                userId: user._id,
                postId: post._id,
                caption: caption,
                type: "shared",
                likes: 0,
                comments: 0,
                shares: 0,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };

            await db.collection("posts")
                .insertOne(sharedPost);

            await db.collection("posts")
                .findOneAndUpdate({
                    _id: post._id
                }, {
                    $inc: {
                        shares: 1
                    }
                });

            await db.collection("post_sharers")
                .insertOne({
                    userId: user._id,
                    postId: post._id,
                    sharedPost: sharedPost._id,
                    createdAt: new Date().toUTCString()
                });

            notifications.insert({
                userId: post.userId,
                sentBy: user._id,
                type: "postShared",
                content: "'" + user.name + "' has shared your post '" + (post.caption || "") + "'",
                postId: post._id,
                sharedPost: sharedPost._id,
                isRead: false,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            });

            result.json({
                status: "success",
                message: "Post has been shared."
            });
        });

        router.post("/remove-file", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            let path = request.fields.path || "";
            path = path.split(baseUrl);
            path = path[path.length - 1];
            path = path.replace(/^\//, "");

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const post = await db.collection("posts")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (post == null) {
                result.json({
                    status: "error",
                    message: "Post not found."
                });
                return;
            }

            for (let a = 0; a < (post.files || []).length; a++) {
                if (post.files[a].path == path) {
                    post.files.splice(a, 1);

                    if (fs.existsSync(path)) {
                        fs.unlinkSync(path);
                    }
                    break;
                }
            }

            await db.collection("posts")
                .findOneAndUpdate({
                    _id: post._id
                }, {
                    $set: {
                        files: post.files || [],
                        updatedAt: new Date().toUTCString()
                    }
                });

            result.json({
                status: "success",
                message: "File has been removed."
            });
        });

        router.post("/delete", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required parameter missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const post = await db.collection("posts")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (post == null) {
                result.json({
                    status: "error",
                    message: "Post not found."
                });
                return;
            }

            if (post.type == "shared" && post.post && ObjectId.isValid(post.post._id || "")) {
                const shareCount = await db.collection("post_sharers")
                    .countDocuments({
                        postId: post.post._id
                    });

                await db.collection("post_sharers")
                    .deleteMany({
                        postId: post.post._id
                    });

                // console.log("Decrement shared by " + shareCount + " of post " + post.post._id.toString());

                await db.collection("posts")
                    .findOneAndUpdate({
                        _id: post.post._id
                    }, {
                        $inc: {
                            shares: -shareCount
                        }
                    });
            }

            for (let a = 0; a < (post.files || []).length; a++) {
                if (post.files[a].path && fs.existsSync(post.files[a].path)) {
                    fs.unlinkSync(post.files[a].path);
                }
            }

            if (fs.existsSync("uploads/public/posts/" + post._id.toString())) {
                fs.rmdirSync("uploads/public/posts/" + post._id.toString());
            }

            const comments = await db.collection("comments")
                .find({
                    postId: post._id
                })
                .toArray();
            const commentIds = [];
            for (let a = 0; a < comments.length; a++) {
                commentIds.push(comments[a]._id);
            }

            const replies = await db.collection("replies")
                .find({
                    commentId: {
                        $in: commentIds
                    }
                })
                .toArray();
            const replyIds = [];
            for (let a = 0; a < replies.length; a++) {
                replyIds.push(replies[a]._id);
            }

            await db.collection("post_likers")
                .deleteMany({
                    postId: post._id
                });

            await db.collection("comments")
                .deleteMany({
                    postId: post._id
                });

            await db.collection("replies")
                .deleteMany({
                    commentId: {
                        $in: commentIds
                    }
                });

            await db.collection("post_sharers")
                .deleteMany({
                    postId: post._id
                });

            await db.collection("posts")
                .findOneAndDelete({
                    _id: post._id
                });

            result.json({
                status: "success",
                message: "Post has been deleted."
            });
        });

        router.post("/update", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const caption = request.fields.caption || "";
            const files = request.files["files[]"];

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const post = await db.collection("posts")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }]
                });

            if (post == null) {
                result.json({
                    status: "error",
                    message: "Post not found."
                });
                return;
            }

            const filesArr = [];
            if (Array.isArray(files)) {
                for (let a = 0; a < files.length; a++) {
                    if (files[a] && files[a].size > 0) {
                        filesArr.push(files[a]);
                    }
                }
            } else {
                if (files && files.size > 0) {
                    filesArr.push(files);
                }
            }

            for (let a = 0; a < filesArr.length; a++) {
                const type = filesArr[a].type.toLowerCase();
                if (!type.includes("jpeg") && !type.includes("jpg") && !type.includes("png") && !type.includes("mp4") && !type.includes("flv")) {
                    result.json({
                        status: "error",
                        message: "Only images or videos are allowed."
                    });
                    return;
                }
            }

            const updateObj = {
                caption: caption,
                updatedAt: new Date().toUTCString()
            };

            if (!fs.existsSync("uploads/public/posts/" + post._id.toString())) {
                fs.mkdirSync("uploads/public/posts/" + post._id.toString());
            }

            for (let a = 0; a < filesArr.length; a++) {
                const fileData = fs.readFileSync(filesArr[a].path);
                const fileLocation = "uploads/public/posts/" + post._id.toString() + "/" + filesArr[a].name;
                fs.writeFileSync(fileLocation, fileData);
                fs.unlinkSync(filesArr[a].path);

                updateObj.files = [...post.files, {
                    name: filesArr[a].name || "",
                    size: filesArr[a].size,
                    type: filesArr[a].type,
                    path: fileLocation
                }];
            }

            await db.collection("posts")
                .findOneAndUpdate({
                    _id: post._id
                }, {
                    $set: updateObj
                });

            result.json({
                status: "success",
                message: "Post has been updated."
            });
        });

        router.post("/fetch/:_id?", authOptional, async function (request, result) {
            const user = request.user;
            const _id = request.params._id || "";
            const q = request.fields.q || "";
            const userId = request.fields.userId || "";
            const page = parseInt(request.fields.page || 1);
            let searchArr = [];

            if (_id != "") {
                if (!ObjectId.isValid(_id)) {
                    result.json({
                        status: "error",
                        message: "In-valid ID."
                    });
                    return;
                }

                searchArr.push({
                    _id: ObjectId.createFromHexString(_id)
                });
            }

            if (q != "") {
                searchArr.push({
                    caption: {
                        $regex: q,
                        $options: "i"
                    }
                });
            }

            if (userId != "") {
                if (!ObjectId.isValid(userId)) {
                    result.json({
                        status: "error",
                        message: "In-valid ID."
                    });
                    return;
                }

                searchArr.push({
                    userId: ObjectId.createFromHexString(userId)
                });
            }

            let searchObj = {};
            if (searchArr.length > 0) {
                searchObj = {
                    $and: searchArr
                };
            }
            
            /*const posts = await db.collection("posts")
                .find(searchObj)
                .skip(skip)
                .limit(self.limit)
                .sort("_id", "desc")
                .toArray();*/

            const postsArr = await self.fetch(searchObj, page, user);

            result.json({
                status: "success",
                message: "Data has been fetched.",
                posts: postsArr
            });
        });

        router.post("/create", auth, async function (request, result) {
            const user = request.user;
            const caption = request.fields.caption || "";
            const postType = request.fields.type || "post"; // post, shared, group, page, sponsored
			const groupId = request.fields.groupId || "";
			const pageId = request.fields.pageId || "";
			const postId = request.fields.postId || ""; // in case of shared post
            const files = request.files["files[]"];
            let status = "published";
            let message = "Post has been created";

            if (!["post", "shared", "group", "page", "sponsored"].includes(postType)) {
                result.json({
                    status: "error",
                    message: "In-valid post type."
                });
                return;
            }

            const filesArr = [];
            if (Array.isArray(files)) {
                for (let a = 0; a < files.length; a++) {
                    if (files[a] && files[a].size > 0) {
                        filesArr.push(files[a]);
                    }
                }
            } else {
                if (files && files.size > 0) {
                    filesArr.push(files);
                }
            }

            for (let a = 0; a < filesArr.length; a++) {
                const type = filesArr[a].type.toLowerCase();
                if (!type.includes("jpeg") && !type.includes("jpg") && !type.includes("png") && !type.includes("mp4") && !type.includes("flv") && !type.includes("mov")) {
                    result.json({
                        status: "error",
                        message: "Only images or videos are allowed."
                    });
                    return;
                }
            }

            const postObj = {
                userId: user._id,
                caption: caption,
                type: postType,
                files: [],
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };
			
			if (postType == "group") {
				if (!ObjectId.isValid(groupId)) {
					result.json({
                        status: "error",
                        message: "In-valid group ID."
                    });
                    return;
				}
				
				const group = await db.collection("groups")
					.findOne({
						$and: [{
							status: "active"
						}, {
							_id: ObjectId.createFromHexString(groupId)
						}]
					});
					
				if (group == null) {
					result.json({
                        status: "error",
                        message: "Group not found."
                    });
                    return;
				}

                const isAdmin = (group.userId.toString() == user._id.toString());
					
				if (!isAdmin) {
					result.json({
                        status: "error",
                        message: "In free version, only admin can post in a group."
                    });
                    return;
				}
				
				postObj.groupId = group._id;

                if (!isAdmin) {
                    status = "pending";
                    message = "Your post is pending for approval from admin of this group.";
                }
			} else if (postType == "page") {
				if (!ObjectId.isValid(pageId)) {
					result.json({
                        status: "error",
                        message: "In-valid page ID."
                    });
                    return;
				}
				
				const page = await db.collection("pages")
					.findOne({
						$and: [{
							status: "active"
						}, {
							_id: ObjectId.createFromHexString(pageId)
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
				
				postObj.pageId = page._id;
			}

            postObj.status = status;

            const insertedDoc = await db.collection("posts")
                .insertOne(postObj);
                
            // const _id = insertedDoc.insertedId.toString();

            if (filesArr.length > 0) {
                if (!fs.existsSync("uploads/public/posts/" + postObj._id.toString()))
                    fs.mkdirSync("uploads/public/posts/" + postObj._id.toString());
            }

            const filesPaths = [];
            for (let a = 0; a < filesArr.length; a++) {
                const fileData = fs.readFileSync(filesArr[a].path);
                const fileLocation = "uploads/public/posts/" + postObj._id.toString() + "/" + filesArr[a].name;
                fs.writeFileSync(fileLocation, fileData);
                fs.unlinkSync(filesArr[a].path);

                filesPaths.push({
                    name: filesArr[a].name || "",
                    size: filesArr[a].size,
                    type: filesArr[a].type,
                    path: fileLocation
                });
            }
            postObj.files = filesPaths;

            await db.collection("posts")
                .findOneAndUpdate({
                    _id: postObj._id
                }, {
                    $set: {
                        "files": filesPaths
                    }
                });

            postObj.user = {
                _id: user._id || "",
                name: user.name || "",
                email: user.email || "",
                profileImage: user.profileImage?.path || "",
            };

            if (postObj.user.profileImage && fs.existsSync(postObj.user.profileImage)) {
                postObj.user.profileImage = baseUrl + "/" + postObj.user.profileImage;
            }

            postObj.createdAt = new Date().toLocaleString();
            postObj.updatedAt = new Date().toLocaleString();

            for (let a = 0; a < postObj.files.length; a++) {
                if (postObj.files[a].path && fs.existsSync(postObj.files[a].path)) {
                    postObj.files[a].path = baseUrl + "/" + postObj.files[a].path;
                }
            }
            
            result.json({
                status: "success",
                message: message,
                post: postObj
            });
        });

        app.use("/sn/posts", router);
    }
};