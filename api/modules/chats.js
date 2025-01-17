const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const auth = require("./auth");
const authOptional = require("./auth-optional");
const notifications = require("./notifications");
const friends = require("./sn/friends");

module.exports = {
    limit: 15,

    async fetch(filter, page, user) {
        const skip = (page - 1) * this.limit;

        /*const messages = await db.collection("messages")
            .find(filter)
            .skip(skip)
            .limit(this.limit)
            .toArray();*/

        const messages = await db.collection("messages")
            .aggregate([{
                $match: filter
            }, {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender"
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiver"
                }
            }, {
                $unwind: "$sender"
            }, {
                $unwind: "$receiver"
            }, {
                $sort: {
                    _id: -1
                }
            }, {
                $skip: skip
            }, {
                $limit: this.limit
            }]).toArray();

        const messagesArr = [];
        for (let a = 0; a < messages.length; a++) {
            const obj = {
                _id: messages[a]._id,
                sender: {
                    _id: messages[a].sender._id || "",
                    name: messages[a].sender.name || "",
                    profileImage: messages[a].sender.profileImage?.path || ""
                },
                receiver: {
                    _id: messages[a].receiver._id || "",
                    name: messages[a].receiver.name || "",
                    profileImage: messages[a].receiver.profileImage?.path || ""
                },
                message: messages[a].message || "",
                isRead: messages[a].isRead || false,
                createdAt: new Date(messages[a].createdAt).toLocaleString()
            };

            if (obj.sender.profileImage && fs.existsSync(obj.sender.profileImage)) {
                obj.sender.profileImage = baseUrl + "/" + obj.sender.profileImage;
            }

            if (obj.receiver.profileImage && fs.existsSync(obj.receiver.profileImage)) {
                obj.receiver.profileImage = baseUrl + "/" + obj.receiver.profileImage;
            }

            messagesArr.push(obj);
        }

        return messagesArr;
    },

    init(app) {
        const self = this;
        const router = express.Router();

        // send message with attachments (image, video, audio, pdf, doc, excel)
            // attachments should be stored in private storage
        router.post("/send", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const message = request.fields.message || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required missing fields."
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

            const otherUser = await db.collection("users")
                .findOne({
                    _id: ObjectId.createFromHexString(_id)
                });

            if (otherUser == null) {
                result.json({
                    status: "error",
                    message: "User not found."
                });
                return;
            }

            friends.fetch({
                $or: [{
                    $and: [{
                        user1: user._id
                    }, {
                        user2: otherUser._id
                    }]
                }, {
                    $and: [{
                        user2: user._id
                    }, {
                        user1: otherUser._id
                    }]
                }]
            }, 1, user).then(function (friendsArr) {
                if (friendsArr.length > 0) {
                    const friend = friendsArr[0];

                    if (friend.user1._id.toString() == user._id.toString()) {
                        db.collection("friends")
                            .findOneAndUpdate({
                                _id: friend._id
                            }, {
                                $inc: {
                                    user1UnreadMessages: 1
                                }
                            });
                    } else if (friend.user2._id.toString() == user._id.toString()) {
                        db.collection("friends")
                            .findOneAndUpdate({
                                _id: friend._id
                            }, {
                                $inc: {
                                    user2UnreadMessages: 1
                                }
                            });
                    }
                }
            });
            
            const messageObj = {
                senderId: user._id,
                receiverId: otherUser._id,
                message: message,
                isRead: false,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };

            await db.collection("messages")
                .insertOne(messageObj);

            let singleMessage = null;

            const newMessage = await self.fetch({
                _id: messageObj._id
            }, 1, user);

            if (newMessage.length > 0) {
                singleMessage = newMessage[0];
            }

            if (typeof usersArr[otherUser._id.toString()] !== "undefined") {
                self.fetch({
                    _id: messageObj._id
                }, 1, otherUser)
                    .then(function (messageForReceiver) {
                        if (messageForReceiver.length > 0) {
                            socketIO.to(usersArr[otherUser._id.toString()])
                                .emit("newMessage", messageForReceiver[0]);
                        }
                    });
            }
            
            result.json({
                status: "success",
                message: "In premium version, you can benefit end-to-end encryption.",
                messageObj: singleMessage
            });
        });

        // fetch messages with pagination
        // mark fetched messages as read, if not already read
        router.post("/fetch", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const page = parseInt(request.fields.page || 1);

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required missing fields."
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

            const otherUser = await db.collection("users")
                .findOne({
                    _id: ObjectId.createFromHexString(_id)
                });

            if (otherUser == null) {
                result.json({
                    status: "error",
                    message: "User not found."
                });
                return;
            }
            
            const messagesArr = await self.fetch({
                $or: [{
                    $and: [{
                        senderId: user._id
                    }, {
                        receiverId: otherUser._id
                    }]
                }, {
                    $and: [{
                        receiverId: user._id
                    }, {
                        senderId: otherUser._id
                    }]
                }]
            }, page, user);

            const messageIds = [];
            for (let a = 0; a < messagesArr.length; a++) {
                messageIds.push(messagesArr[a]._id);
            }

            db.collection("messages")
                .updateMany({
                    _id: {
                        $in: messageIds
                    }
                }, {
                    $set: {
                        isRead: 1,
                        updatedAt: new Date().toUTCString()
                    }
                });

            friends.fetch({
                $or: [{
                    $and: [{
                        user1: user._id
                    }, {
                        user2: otherUser._id
                    }]
                }, {
                    $and: [{
                        user2: user._id
                    }, {
                        user1: otherUser._id
                    }]
                }]
            }, 1, user).then(function (friendsArr) {
                if (friendsArr.length > 0) {
                    const friend = friendsArr[0];

                    if (friend.user1._id.toString() == user._id.toString()) {
                        db.collection("friends")
                            .findOneAndUpdate({
                                _id: friend._id
                            }, {
                                $set: {
                                    user2UnreadMessages: 0
                                }
                            });
                    } else if (friend.user2._id.toString() == user._id.toString()) {
                        db.collection("friends")
                            .findOneAndUpdate({
                                _id: friend._id
                            }, {
                                $set: {
                                    user1UnreadMessages: 0
                                }
                            });
                    }
                }
            });

            result.json({
                status: "success",
                message: "Data has been fetched.",
                messages: messagesArr
            });
        });

        app.use("/chats", router);
    }
};