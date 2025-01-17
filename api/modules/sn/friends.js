const express = require("express");
const fs = require("fs");
const auth = require("./../auth");
const authOptional = require("./../auth-optional");
const notifications = require("./../notifications");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

module.exports = {
    limit: 15,

    async fetch(filterObj, page, user) {
        const skip = (page - 1) * this.limit;

        /*const friends = await db.collection("friends")
            .find(filterObj)
            .skip(skip)
            .limit(this.limit)
            .toArray();*/

        const friends = await db.collection("friends")
            .aggregate([{
                $match: filterObj
            }, {
                $lookup: {
                    from: "users",
                    localField: "user1",
                    foreignField: "_id",
                    as: "user1"
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "user2",
                    foreignField: "_id",
                    as: "user2"
                }
            }, {
                $unwind: "$user1"
            }, {
                $unwind: "$user2"
            }, {
                $sort: {
                    _id: -1
                }
            }, {
                $skip: skip
            }, {
                $limit: this.limit
            }]).toArray();

        const friendsArr = [];
        for (let a = 0; a < friends.length; a++) {
            const obj = {
                _id: friends[a]._id || "",
                user1: {
                    _id: friends[a].user1._id || "",
                    name: friends[a].user1.name || "",
                    profileImage: friends[a].user1.profileImage?.path || "",
                    unreadMessages: friends[a].user1UnreadMessages || 0
                },
                user2: {
                    _id: friends[a].user2._id || "",
                    name: friends[a].user2.name || "",
                    profileImage: friends[a].user2.profileImage?.path || "",
                    unreadMessages: friends[a].user2UnreadMessages || 0
                },
                createdAt: new Date(friends[a].createdAt)
            };

            if (obj.user1.profileImage && fs.existsSync(obj.user1.profileImage)) {
                obj.user1.profileImage = baseUrl + "/" + obj.user1.profileImage;
            }

            if (obj.user2.profileImage && fs.existsSync(obj.user2.profileImage)) {
                obj.user2.profileImage = baseUrl + "/" + obj.user2.profileImage;
            }

            friendsArr.push(obj);
        };

        return friendsArr;
    },

    init(app) {
        const self = this;
        const router = express.Router();

        // Fetch my friends, with pagination, with search.
        // Fetch by user too.
        router.post("/fetch", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const q = request.query.q || "";
            const page = request.fields.page || 1;

            const filterArr = [];
            filterArr.push({
                $or: [{
                    user1: user._id
                }, {
                    user2: user._id
                }]
            });

            /*if (q) {
                filterArr.push({
                    $or: [{
                        "user1.name": {
                            $regex: q,
                            $options: "i"
                        }
                    }, {
                        "user2.name": {
                            $regex: q,
                            $options: "i"
                        }
                    }]
                });
            }

            if (_id) {
                if (!ObjectId.isValid(_id)) {
                    result.json({
                        status: "success",
                        message: "In-valid ID."
                    });
                    return;
                }

                filterArr.push({
                    $or: [{
                        user1: ObjectId.createFromHexString(_id)
                    }, {
                        user2: ObjectId.createFromHexString(_id)
                    }]
                });
            }*/

            let filterObj = {};
            if (filterArr.length > 0) {
                filterObj = {
                    $and: filterArr
                };
            }

            // prettify JSON
            // console.log(JSON.stringify(filterObj, null, 2));

            let selectedFriend = null;

            if (_id != "") {
                if (!ObjectId.isValid(_id)) {
                    result.json({
                        status: "success",
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

                selectedFriend = {
                    _id: otherUser._id || "",
                    name: otherUser.name || "",
                    profileImage: otherUser.profileImage?.path || ""
                };

                if (selectedFriend.profileImage && fs.existsSync(selectedFriend.profileImage)) {
                    selectedFriend.profileImage = baseUrl + "/" + selectedFriend.profileImage;
                }
            }

            const friendsArr = await self.fetch(filterObj, page, user);
            const friendsCount = await db.collection("friends")
                .countDocuments(filterObj);

            result.json({
                status: "success",
                message: "Data has been fetched.",
                friends: friendsArr,
                friendsCount: friendsCount,
                selectedFriend: selectedFriend
            });
        });

        router.post("/requests/send", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

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

            const friendRequest = await db.collection("friend_requests")
                .findOne({
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
                });

            if (friendRequest != null) {
                result.json({
                    status: "error",
                    message: "Friend request already sent."
                });
                return;
            }

            const friendRequestObj = {
                senderId: user._id,
                receiverId: otherUser._id,
                status: "pending", // pending, accepted, rejected
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };

            await db.collection("friend_requests")
                .insertOne(friendRequestObj);

            notifications.insert({
                userId: otherUser._id,
                sentBy: user._id,
                type: "friendRequest",
                content: "'" + user.name + "' has sent you a friend request.",
                friendRequestId: friendRequestObj._id,
                isRead: false,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            });

            result.json({
                status: "success",
                message: "Friend request has been sent."
            });
        });

        // list all requests
        router.post("/requests/fetch", auth, async function (request, result) {
            const user = request.user;
            const page = parseInt(request.fields.page || 1);
            const skip = (page - 1) * self.limit;

            /*const filter = {
                $or: [{
                    senderId: user._id
                }, {
                    receiverId: user._id
                }]
            };*/

            const filter = {
                $and: [{
                    receiverId: user._id
                }, {
                    status: "pending"
                }]
            };

            const friendRequests = await db.collection("friend_requests")
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
                    $unwind: "$sender"
                }, {
                    $sort: {
                        _id: -1
                    }
                }, {
                    $skip: skip
                }, {
                    $limit: self.limit
                }]).toArray();

            const friendRequestsArr = [];
            for (let a = 0; a < friendRequests.length; a++) {
                const obj = {
                    _id: friendRequests[a]._id,
                    sender: {
                        _id: friendRequests[a].sender._id || "",
                        name: friendRequests[a].sender.name || "",
                        profileImage: friendRequests[a].sender.profileImage?.path || ""
                    },
                    status: friendRequests[a].status || "",
                    createdAt: new Date(friendRequests[a].createdAt).toLocaleString()
                };

                if (obj.sender.profileImage && fs.existsSync(obj.sender.profileImage)) {
                    obj.sender.profileImage = baseUrl + "/" + obj.sender.profileImage;
                }

                friendRequestsArr.push(obj);
            }

            const friendRequestsCount = await db.collection("friend_requests")
                .countDocuments(filter);

            result.json({
                status: "success",
                message: "Data has been fetched.",
                friendRequests: friendRequestsArr,
                friendRequestsCount: friendRequestsCount
            });
        });

        // reject request
        router.post("/requests/reject", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

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

            const friendRequest = await db.collection("friend_requests")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        receiverId: user._id
                    }]
                });

            if (friendRequest == null) {
                result.json({
                    status: "error",
                    message: "Friend request not found."
                });
                return;
            }

            await db.collection("friend_requests")
                .findOneAndUpdate({
                    _id: friendRequest._id
                }, {
                    $set: {
                        status: "rejected",
                        updatedAt: new Date().toUTCString()
                    }
                });

            notifications.insert({
                userId: friendRequest.senderId,
                sentBy: user._id,
                type: "friendRequestRejected",
                content: "'" + user.name + "' has rejected your friend request.",
                friendRequestId: friendRequest._id,
                isRead: false,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            });

            result.json({
                status: "success",
                message: "Friend request has been rejected."
            });
        });

        // accept request
        router.post("/requests/accept", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

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

            const friendRequest = await db.collection("friend_requests")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        receiverId: user._id
                    }]
                });

            if (friendRequest == null) {
                result.json({
                    status: "error",
                    message: "Friend request not found."
                });
                return;
            }

            if (friendRequest.status == "accepted") {
                result.json({
                    status: "error",
                    message: "Friend request already accepted."
                });
                return;
            }

            const otherUser = await db.collection("users")
                .findOne({
                    _id: friendRequest.senderId
                });

            if (otherUser == null) {
                result.json({
                    status: "error",
                    message: "User not found."
                });
                return;
            }

            await db.collection("friend_requests")
                .findOneAndUpdate({
                    _id: friendRequest._id
                }, {
                    $set: {
                        status: "accepted",
                        updatedAt: new Date().toUTCString()
                    }
                });

            await db.collection("friends")
                .insertOne({
                    user1: otherUser._id,
                    user2: user._id,
                    friendRequestId: friendRequest._id,
                    user1UnreadMessages: 0,
                    user2UnreadMessages: 0,
                    createdAt: new Date().toUTCString(),
                    updatedAt: new Date().toUTCString()
                });

            notifications.insert({
                userId: otherUser._id,
                sentBy: user._id,
                type: "friendRequestAccepted",
                content: "'" + user.name + "' has accepted your friend request.",
                friendRequestId: friendRequest._id,
                isRead: false,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            });

            result.json({
                status: "success",
                message: "Friend request has been accepted."
            });
        });

        // delete friend request
        router.post("/requests/delete", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

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

            const friendRequest = await db.collection("friend_requests")
                .findOne({
                    $and: [{
                        _id: ObjectId.createFromHexString(_id)
                    }, {
                        $or: [{
                            senderId: user._id
                        }, {
                            receiverId: user._id
                        }]
                    }]
                });

            if (friendRequest == null) {
                result.json({
                    status: "error",
                    message: "Friend request not found."
                });
                return;
            }

            await db.collection("friend_requests")
                .findOneAndDelete({
                    _id: friendRequest._id
                });

            result.json({
                status: "success",
                message: "Friend request has been deleted."
            });
        });

        // delete friend
        // on deleting, delete the friend request too
        router.post("/delete", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

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

            const friend = await db.collection("friends")
                .findOne({
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
                });

            if (friend == null) {
                result.json({
                    status: "error",
                    message: "This user is not in your friend list."
                });
                return;
            }

            await db.collection("friend_requests")
                .findOneAndDelete({
                    _id: friend.friendRequestId
                })

            await db.collection("friends")
                .findOneAndDelete({
                    _id: friend._id
                });

            result.json({
                status: "success",
                message: "Friend has been deleted."
            });
        });

        app.use("/sn/friends", router);
    }
};