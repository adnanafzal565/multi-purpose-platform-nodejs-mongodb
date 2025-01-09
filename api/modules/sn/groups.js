const express = require("express");
const fs = require("fs");
const ObjectId = require("mongodb").ObjectId;
const auth = require("./../auth");
const authOptional = require("./../auth-optional");
const posts = require("./posts");

module.exports = {
	limit: 15,

	async fetch(searchObj, page, user) {
		const skip = (page - 1) * this.limit;

		const groups = await db.collection("groups")
			.find(searchObj)
			.skip(skip)
			.limit(this.limit)
			.sort({
				_id: -1
			})
			.toArray();

		const groupIds = [];
		const groupsArr = [];
		for (let a = 0; a < groups.length; a++) {
			const obj = {
				_id: groups[a]._id,
				name: groups[a].name || "",
				description: groups[a].description || "",
				members: groups[a].members || 0,
				isJoined: false,
				image: groups[a].image?.path || "",
				createdAt: new Date(groups[a].createdAt).toLocaleString()
			};

			if (obj.image && fs.existsSync(obj.image)) {
				obj.image = baseUrl + "/" + obj.image;
			}

			groupIds.push(groups[a]._id);
			groupsArr.push(obj);
		}

		return groupsArr;
	},

	init (app) {
		const self = this;
		const router = express.Router();

		router.post("/remove-member", auth, async function (request, result) {
			result.json({
				status: "info",
                title: premiumVersionTitle,
				message: premiumVersionText
			});
		});

		router.post("/members", authOptional, async function (request, result) {
			result.json({
				status: "info",
				title: premiumVersionTitle,
				message: premiumVersionText
			});
		});

		router.post("/toggle-join", auth, async function (request, result) {
			result.json({
				status: "info",
                title: premiumVersionTitle,
				message: premiumVersionText
			});
		});

		router.post("/fetch-pending-posts", auth, async function (request, result) {
			result.json({
				status: "info",
                title: premiumVersionTitle,
				message: premiumVersionText
			});
		});

		router.post("/fetch-posts", authOptional, async function (request, result) {
			const user = request.user;
			const _id = request.fields._id || "";
			const page = request.fields.page || 1;

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

			const group = await db.collection("groups")
				.findOne({
					_id: ObjectId.createFromHexString(_id)
				});

			if (group == null) {
				result.json({
					status: "error",
					message: "Group not found."
				});
				return;
			}

			let isAdmin = false;

			if (user != null) {
				if (group.userId.toString() == user._id.toString()) {
					isAdmin = true;
				}
			}

			if (group.status == "inActive" && !isAdmin) {
				result.json({
					status: "error",
					message: "Group is in-active."
				});
				return;
			}

			const postsArr = await posts.fetch({
				$and: [{
					groupId: group._id
				}, {
					status: "published"
				}]
			}, page, user);

			result.json({
				status: "success",
				message: "Data has been fetched.",
				posts: postsArr
			});
		});

		router.post("/fetch-single", authOptional, async function (request, result) {
			const user = request.user;
			const _id = request.fields._id || "";
			const page = request.fields.page || 1;

			if (!_id) {
				result.json({
					status: "error",
					title: "Error",
					message: "Required field missing."
				});
				return;
			}

			if (!ObjectId.isValid(_id)) {
				result.json({
					status: "error",
					title: "Error",
					message: "In-valid '_id' value."
				});
				return;
			}

			const group = await db.collection("groups")
				.findOne({
					_id: ObjectId.createFromHexString(_id)
				});

			if (group == null) {
				result.json({
					status: "error",
					title: "Error",
					message: "Group not found."
				});
				return;
			}

			let isAdmin = false;

			if (user != null) {
				if (group.userId.toString() == user._id.toString()) {
					isAdmin = true;
				}
			}

			if (group.status == "inActive" && !isAdmin) {
				result.json({
					status: "error",
					title: "Error",
					message: "Group is in-active."
				});
				return;
			}

			const obj = {
				_id: group._id,
				name: group.name || "",
				description: group.description || "",
				membersCount: group.members || 0,
				image: group.image?.path || "",
				isMember: false,
				isAdmin: isAdmin,
				createdAt: new Date(group.createdAt).toLocaleString()
			};

			if (obj.image && fs.existsSync(obj.image)) {
				obj.image = baseUrl + "/" + obj.image;
			}

			obj.members = [];

			obj.posts = await posts.fetch({
				$and: [{
					groupId: obj._id
				}, {
					status: "published"
				}]
			}, page, user);

			if (isAdmin) {
				const pendingPostsFilter = {
					$and: [{
						status: "pending"
					}, {
						groupId: obj._id
					}]
				};

				obj.pendingPosts = await posts.fetch(pendingPostsFilter);
				obj.pendingPostsCount = await posts.count(pendingPostsFilter);
			} else {
				obj.pendingPosts = [];
				obj.pendingPostsCount = 0;
			}

			result.json({
				status: "success",
				message: "Data has been fetched.",
				group: obj
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

			const group = await db.collection("groups")
				.findOne({
					$and: [{
						_id: ObjectId.createFromHexString(_id)
					}, {
						userId: user._id
					}]
				});

			if (group == null) {
				result.json({
					status: "error",
					message: "Group not found."
				});
				return;
			}

			if (group.image && group.image.path && fs.existsSync(group.image.path)) {
				fs.unlinkSync(group.image.path);
			}

			const posts = await db.collection("posts")
				.find({
					groupId: group._id
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
					groupId: group._id
				});

			await db.collection("groups")
				.findOneAndDelete({
					_id: group._id
				});

			result.json({
				status: "success",
				message: "Group has been deleted."
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

			const group = await db.collection("groups")
				.findOne({
					$and: [{
						_id: ObjectId.createFromHexString(_id)
					}, {
						userId: user._id
					}]
				});

			if (group == null) {
				result.json({
					status: "error",
					message: "Group not found."
				});
				return;
			}

			const obj = {
				name: name,
				description: description,
				updatedAt: new Date().toUTCString()
			};

			let fileLocation = "";

			if (image) {
				if (Array.isArray(image)) {
					result.json({
						status: "error",
						message: "Please select one image."
					});
					return;
				}

				if (image.size > 0) {
					if (image.type.toLowerCase().includes("heic")) {
						result.json({
							status: "error",
							message: "'HEIC' format is not supported right now."
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
					
					if (group.image && group.image.path && fs.existsSync(group.image.path)) {
						fs.unlinkSync(group.image.path);
					}

					if (!fs.existsSync("uploads/public/groups")) {
						fs.mkdirSync("uploads/public/groups");
					}

					const fileContent = fs.readFileSync(image.path);
					fileLocation = "uploads/public/groups/" + crypto.randomUUID() + ".png";
					fs.writeFileSync(fileLocation, fileContent);
					fs.unlinkSync(image.path);

					obj.image = {
						path: fileLocation,
						name: image.name,
						size: image.size,
						type: image.type
					};
				}
			}

			await db.collection("groups")
				.findOneAndUpdate({
					_id: group._id
				}, {
					$set: obj
				});

			if (fileLocation != "") {
				obj.image = baseUrl + "/" + fileLocation;
			}

			result.json({
				status: "success",
				message: "Group has been updated.",
				group: obj
			});
		});

		router.post("/fetch-my-joined", auth, async function (request, result) {
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

			const groupsArr = await self.fetch(searchObj, page, user);

			result.json({
				status: "success",
				message: "Data has been fetched.",
				groups: groupsArr
			});
		});

		router.post("/fetch", authOptional, async function (request, result) {
			const user = request.user;
			const query = request.fields.query || "";
			const page = request.fields.page || 1;

			let searchObj = {};
			const searchArr = [];
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
					$or: searchArr
				};
			}

			const groupsArr = await self.fetch(searchObj, page, user);

			result.json({
				status: "success",
				message: "Data has been fetched.",
				groups: groupsArr
			});
		});

		router.post("/create", auth, async function (request, result) {
			const user = request.user;
			const name = request.fields.name || "";
			const description = request.fields.description || "";
			const status = request.fields.status || "active";
			const image = request.files.image;

			if (!name || !description || !status) {
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

			const obj = {
				name: name,
				description: description,
				status: status,
				userId: user._id,
				members: 0,
				image: null,
				createdAt: new Date().toUTCString(),
				updatedAt: new Date().toUTCString()
			};

			let fileLocation = "";

			if (image) {
				if (Array.isArray(image)) {
					result.json({
						status: "error",
						title: "Error",
						message: "Please select one image."
					});
					return;
				}

				if (image.size > 0) {
                    if (image.type.toLowerCase().includes("heic")) {
                        result.json({
                            status: "error",
                            title: "Error",
                            message: "'HEIC' format is not supported right now."
                        });
                        return;
                    }
    
                    if (!image.type.toLowerCase().includes("image")) {
                        result.json({
                            status: "error",
                            title: "Error",
                            message: "Only image file is allowed."
                        });
                        return;
                    }

					if (!fs.existsSync("uploads/public/groups")) {
						fs.mkdirSync("uploads/public/groups");
					}

					const fileContent = fs.readFileSync(image.path);
					fileLocation = "uploads/public/groups/" + crypto.randomUUID() + ".png";
					fs.writeFileSync(fileLocation, fileContent);
					fs.unlinkSync(image.path);

					obj.image = {
						path: fileLocation,
						name: image.name,
						size: image.size,
						type: image.type
					};
				} else {
					result.json({
						status: "error",
						title: "Error",
						message: "Please select an image."
					});
					return;
				}
			}

			await db.collection("groups")
				.insertOne(obj);

			if (fileLocation != "") {
				obj.image = baseUrl + "/" + fileLocation;
			}
			
			delete obj.status;

			result.json({
				status: "success",
				message: "Group has been created.",
				group: obj
			});
		});

		app.use("/sn/groups", router);
	}
};