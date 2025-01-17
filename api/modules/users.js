const express = require("express");
const fs = require("fs");
const auth = require("./auth");
const authOptional = require("./auth-optional");
const friends = require("./sn/friends");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

module.exports = {
    limit: 15,

    init(app) {
        const self = this;
        const router = express.Router();

        // search
        router.post("/search", authOptional, async function (request, result) {
            const user = request.user;
            const query = request.fields.query || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            const filterArr = [];
            if (user != null) {
                filterArr.push({
                    _id: {
                        $ne: user._id
                    }
                });
            }

            filterArr.push({
                name: {
                    $regex: query,
                    $options: "i"
                }
            });
            
            const users = await db.collection("users")
                .find({
                    $and: filterArr
                })
                .skip(skip)
                .limit(self.limit)
                .toArray();

            let friendsArr = [];

            if (user != null) {
                friendsArr = await db.collection("friends")
                    .find({
                        $and: [{
                            $or: [{
                                user1Id: user._id
                            }, {
                                user2Id: user._id
                            }]
                        }]
                    }).toArray();
            }

            const usersArr = [];
            for (let a = 0; a < users.length; a++) {
                const obj = {
                    _id: users[a]._id || "",
                    name: users[a].name || "",
                    profileImage: users[a].profileImage?.path || "",
                    isFriend: false,
                    memberSince: new Date(users[a].createdAt).toLocaleString()
                };

                if (obj.profileImage && fs.existsSync(obj.profileImage)) {
                    obj.profileImage = baseUrl + "/" + obj.profileImage;
                }

                if (user != null) {
                    for (let a = 0; a < friendsArr.length; a++) {
                        obj.isFriend = (user._id.toString() == friendsArr[a].user1Id.toString()
                            || user._id.toString() == friendsArr[a].user2Id.toString());
                    }
                }

                usersArr.push(obj);
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                users: usersArr
            });
        });

        app.use("/users", router);
    }
};