const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const auth = require("./auth");

module.exports = {
    limit: 15,

    fetchUnreadCount(user) {
        return new Promise(async function (resolve) {
            const unread = await db.collection("notifications")
                .countDocuments({
                    $and: [{
                        userId: user._id
                    }, {
                        isRead: false
                    }]
                });
            resolve(unread);
        });
    },

    async fetchUnread(user) {
        if (user != null) {
            return await this.fetch({
                $and: [{
                    userId: user._id
                }, {
                    isRead: false
                }]
            }, 1);
        }
        return [];
    },

    async fetch(filter, page) {
        const skip = (page - 1) * this.limit;

        /*const notifications = await db.collection("notifications")
            .find(filter)
            .skip(skip)
            .limit(this.limit)
            .sort({
                _id: -1
            })
            .toArray();*/

        const notifications = await db.collection("notifications")
            .aggregate([{
                $match: filter
            }, {
                $lookup: {
                    from: "users",
                    localField: "sentBy",
                    foreignField: "_id",
                    as: "sentBy"
                }
            }, {
                $unwind: {
                    path: "$sentBy",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $sort: {
                    _id: -1
                }
            }, {
                $skip: skip
            }, {
                $limit: this.limit
            }])
            .toArray();

        const notificationsArr = [];
        for (let a = 0; a < notifications.length; a++) {
            const obj = {
                _id: notifications[a]._id || "",
                type: notifications[a].type || "",
                content: notifications[a].content || "",
                isRead: notifications[a].isRead || false,
                message: null,
                post: null,
                sharedPost: null,
                comment: null,
                reply: null,
                sentBy: null
            };

            if (typeof notifications[a].sentBy !== "undefined") {
                obj.sentBy = {
                    _id: notifications[a].sentBy._id || "",
                    name: notifications[a].sentBy.name || "",
                    profileImage: notifications[a].sentBy.profileImage?.path || ""
                };

                if (obj.sentBy.profileImage && fs.existsSync(obj.sentBy.profileImage)) {
                    obj.sentBy.profileImage = baseUrl + "/" + obj.sentBy.profileImage;
                }
            }

            /*if (obj.type == "newMessage") {
                obj.message = {
                    _id: notifications[a].message._id || "",
                    message: notifications[a].message.message || ""
                };
            } else if (obj.type == "postLiked") {
                obj.post = {
                    _id: notifications[a].post._id || "",
                    caption: notifications[a].post.caption || ""
                };
            } else if (obj.type == "newComment") {
                if (typeof notifications[a].comment !== "undefined") {
                    obj.comment = {
                        _id: notifications[a].comment._id || "",
                        comment: notifications[a].comment.comment || ""
                    };
                }
            } else if (obj.type == "newReply") {
                if (typeof notifications[a].reply !== "undefined") {
                    obj.reply = {
                        _id: notifications[a].reply._id || "",
                        reply: notifications[a].reply.reply || ""
                    };
                }
            } else if (obj.type == "postShared") {
                obj.post = {
                    _id: notifications[a].post._id || "",
                    caption: notifications[a].post.caption || ""
                };

                obj.sharedPost = {
                    _id: notifications[a].sharedPost._id || "",
                    caption: notifications[a].sharedPost.caption || ""
                };
            }*/

            obj.createdAt = new Date(notifications[a].createdAt).toLocaleString();
            notificationsArr.push(obj);
        }

        return notificationsArr;
    },

    async markMessagesAsRead(messageIds) {
        await db.collection("notifications")
            .updateMany({
                messageId: {
                    $in: messageIds
                }
            }, {
                $set: {
                    isRead: true,
                    updatedAt: new Date().toUTCString()
                }
            });
    },

    async insert(obj) {
        // modules/chats.js
        // modules/sn/posts.js
        // modules/sn/friends.js

        await db.collection("notifications")
            .insertOne(obj);
    },

    init(app) {
        const self = this;
        const router = express.Router();

        router.post("/mark-as-read", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            await db.collection("notifications")
                .findOneAndUpdate({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        userId: user._id
                    }, {
                        isRead: false
                    }]
                }, {
                    $set: {
                        isRead: true,
                        updatedAt: new Date().toUTCString()
                    }
                });

            result.json({
                status: "success",
                message: "Notification has been marked as read."
            });
        });

        router.post("/mark-all-as-read", auth, async function (request, result) {
            const user = request.user;

            await db.collection("notifications")
                .updateMany({
                    $and: [{
                        userId: user._id
                    }, {
                        isRead: false
                    }]
                }, {
                    $set: {
                        isRead: true,
                        updatedAt: new Date().toUTCString()
                    }
                });

            result.json({
                status: "success",
                message: "All notifications has been marked as read."
            });
        });

        router.post("/fetch", auth, async function (request, result) {
            const user = request.user;
            const page = request.fields.page || 1;

            const notificationsArr = await self.fetch({
                userId: user._id
            }, page);

            const notificationIds = [];
            for (let a = 0; a < notificationsArr.length; a++) {
                if (!notificationsArr[a].isRead) {
                    notificationIds.push(notificationsArr[a]._id);
                }
            }

            await db.collection("notifications")
                .updateMany({
                    _id: {
                        $in: notificationIds
                    }
                }, {
                    $set: {
                        isRead: true,
                        updatedAt: new Date().toUTCString()
                    }
                });

            result.json({
                status: "success",
                message: "Data has been fetched.",
                notifications: notificationsArr
            });
        });

        app.use("/notifications", router);
    }
};