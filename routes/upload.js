const express = require("express");
const router = express.Router();
const {
	createUploadMiddleware,
	destroyCloudinaryAsset,
} = require("../utils/cloudinary");

// Configure uploads for different folders
const uploadTour = createUploadMiddleware("valzoe-tour/tours");
const uploadGallery = createUploadMiddleware("valzoe-tour/gallery");

// POST upload tour media
router.post("/tour", uploadTour.single("media"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file provided" });
		}

		// Cloudinary returns the URL in req.file.path
		res.json({
			success: true,
			path: req.file.path,
			publicId: req.file.filename,
			type: req.file.mimetype.startsWith("video/") ? "video" : "image",
		});
	} catch (error) {
		console.error("Error uploading tour media:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// POST upload gallery image
router.post("/gallery", uploadGallery.single("media"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file provided" });
		}

		res.json({
			success: true,
			path: req.file.path,
			publicId: req.file.filename,
		});
	} catch (error) {
		console.error("Error uploading gallery image:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// DELETE cloudinary asset
router.delete("/:publicId", async (req, res) => {
	try {
		const { publicId } = req.params;
		const { type } = req.query; // "image" or "video"

		await destroyCloudinaryAsset(publicId, type || "image");

		res.json({ success: true, message: "File deleted successfully" });
	} catch (error) {
		console.error("Error deleting file:", error);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
