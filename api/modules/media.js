const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const fs = require("fs");
const auth = require("./auth");

module.exports = {
	limit: 15,

	init (app) {
		const self = this;
		const router = express.Router();

		router.post("/delete", auth, async function (request, result) {
			const user = request.user;
			const _id = request.fields._id || "";

			if (!ObjectId.isValid(_id)) {
				result.json({
					status: "error",
					message: "In-valid '_id' value."
				});
				return;
			}

			const media = await db.collection("media")
				.findOne({
					$and: [{
						_id: ObjectId.createFromHexString(_id)
					}, {
						userId: user._id
					}]
				});

			if (media == null) {
				result.json({
					status: "error",
					message: "Media not found."
				});
				return;
			}

			if (media.file?.path && fs.existsSync(media.file.path)) {
				fs.unlinkSync(media.file.path);
			}

			await db.collection("media")
				.findOneAndDelete({
					_id: media._id
				});

			result.json({
				status: "success",
				message: "Media has been removed."
			});
		});

		router.post("/update", auth, async function (request, result) {
			const user = request.user;
			const _id = request.fields._id || "";
			const title = request.fields.title || "";
			const alt = request.fields.alt || "";
			const caption = request.fields.caption || "";
			const type = request.fields.type || "";
			const file = request.files.file;

			if (!ObjectId.isValid(_id)) {
				result.json({
					status: "error",
					message: "In-valid '_id' value."
				});
				return;
			}

			if (!["private", "public"].includes(type)) {
				result.json({
					status: "error",
					message: "In-valid 'type' value."
				});
				return;
			}

			const media = await db.collection("media")
				.findOne({
					$and: [{
						_id: ObjectId.createFromHexString(_id)
					}, {
						userId: user._id
					}]
				});

			if (media == null) {
				result.json({
					status: "error",
					message: "Media not found."
				});
				return;
			}

			const obj = {
				title: title,
				alt: alt,
				caption: caption,
				type: type,
				updatedAt: new Date().toUTCString()
			};

			if (file && file.size > 0) {

				if (file.type.toLowerCase().includes("heic")) {
					result.json({
						status: "error",
						message: "'HEIC' format are not supported right now."
					});
					return;
				}

				if (media.file?.path && fs.existsSync(media.file.path)) {
					fs.unlinkSync(media.file.path);
				}

				const fileContent = fs.readFileSync(file.path);
				const nameParts = file.name.split(".");
				const extension = nameParts[nameParts.length - 1];
				const fileLocation = "uploads/" + type + "/media/" + crypto.randomUUID() + "." + extension;
				fs.writeFileSync(fileLocation, fileContent);

				obj.file = {
					name: file.name,
					path: fileLocation,
					size: file.size,
					type: file.type
				};
			}

			await db.collection("media")
				.findOneAndUpdate({
					_id: media._id
				}, {
					$set: obj
				});

			result.json({
				status: "success",
				message: "Media has been updated."
			});
		});

		router.post("/fetch-single", auth, async function (request, result) {
			const user = request.user;
			const _id = request.fields._id || "";

			if (!ObjectId.isValid(_id)) {
				result.json({
					status: "error",
					message: "In-valid '_id' value."
				});
				return;
			}

			const media = await db.collection("media")
				.findOne({
					$and: [{
						_id: ObjectId.createFromHexString(_id)
					}, {
						userId: user._id
					}]
				});

			if (media == null) {
				result.json({
					status: "error",
					message: "Media not found."
				});
				return;
			}

			const obj = {
				_id: media._id || "",
				title: media.title || "",
				alt: media.alt || "",
				caption: media.caption || "",
				type: media.type || "",
				file: media.file || null,
				createdAt: new Date(media.createdAt + " UTC").toLocaleString(),
				updatedAt: new Date(media.updatedAt + " UTC").toLocaleString()
			};

			if (obj.file?.path && fs.existsSync(obj.file.path)) {
				obj.file.path = baseUrl + "/" + obj.file.path;
			}

			result.json({
				status: "success",
				message: "Data has been fetched.",
				media: obj
			});
		});
		
		router.post("/fetch", auth, async function (request, result) {
			const user = request.user;
			const page = request.fields.page || 1;
			const skip = (page - 1) * self.limit;

			const media = await db.collection("media")
				.find({
					userId: user._id
				})
				.skip(skip)
				.limit(self.limit)
				.sort("_id", "desc")
				.toArray();

			const mediaArr = [];
			for (let a = 0; a < media.length; a++) {
				const obj = {
					_id: media[a]._id || "",
					title: media[a].title || "",
					alt: media[a].alt || "",
					caption: media[a].caption || "",
					type: media[a].type || "",
					status: media[a].status || "",
					file: media[a].file || null,
					createdAt: new Date(media[a].createdAt + " UTC").toLocaleString(),
					updatedAt: new Date(media[a].updatedAt + " UTC").toLocaleString()
				};

				if (obj.file?.path && fs.existsSync(obj.file.path)) {
					obj.file.path = baseUrl + "/" + obj.file.path;
				}

				mediaArr.push(obj);
			}

			result.json({
				status: "success",
				message: "Data has been fetched.",
				media: mediaArr
			});
		});

		router.post("/upload", auth, async function (request, result) {
			const user = request.user;
			const title = request.fields.title || "";
			const alt = request.fields.alt || "";
			const caption = request.fields.caption || "";
			const type = request.fields.type || "public";
			const file = request.files.file;

			if (!file) {
				result.json({
					status: "error",
					message: "Please select a file."
				});
				return;
			}

			if (Array.isArray(file)) {
				result.json({
					status: "error",
					message: "Please select only 1 file."
				});
				return;
			}

			if (!["private", "public"].includes(type)) {
				result.json({
					status: "error",
					message: "In-valid 'type' value."
				});
				return;
			}

			if (file.type.toLowerCase().includes("heic")) {
				result.json({
					status: "error",
					message: "'HEIC' format are not supported right now."
				});
				return;
			}

			if (!file.type.toLowerCase().includes("image") && !file.type.toLowerCase().includes("video")) {
				result.json({
					status: "error",
					message: "Only image or video files are allowed."
				});
				return;
			}

			const obj = {
				title: title,
				alt: alt,
				caption: caption,
				type: type,
				file: null,
				userId: user._id,
				createdAt: new Date().toUTCString(),
				updatedAt: new Date().toUTCString()
			};

			if (!fs.existsSync("uploads/" + type + "/media"))
				fs.mkdirSync("uploads/" + type + "/media");

			const fileContent = fs.readFileSync(file.path);
			const nameParts = file.name.split(".");
			const extension = nameParts[nameParts.length - 1];
			const fileLocation = "uploads/" + type + "/media/" + crypto.randomUUID() + "." + extension;
			fs.writeFileSync(fileLocation, fileContent);

			obj.file = {
				name: file.name,
				path: fileLocation,
				size: file.size,
				type: file.type
			};

			await db.collection("media")
				.insertOne(obj);

			obj.file.path = baseUrl + "/" + obj.file.path;

			obj.createdAt = new Date().toLocaleString();
			obj.updatedAt = new Date().toLocaleString();

			result.json({
				status: "success",
				message: "Media has been uploaded.",
				media: obj
			});
		});

		app.use("/media", router);
	}
};