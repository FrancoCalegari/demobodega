const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { allQuery, runQuery, getQuery } = require("../database/db");
const {
	createUploadMiddleware,
	destroyCloudinaryAsset,
} = require("../utils/cloudinary");

// Configure multer with Cloudinary storage
const upload = createUploadMiddleware("valzoe-tour/gallery");

// GET all gallery images (public)
router.get("/", async (req, res) => {
	try {
		const images = await allQuery(
			"SELECT * FROM gallery ORDER BY displayOrder ASC, createdAt DESC"
		);
		res.json(images);
	} catch (error) {
		console.error("Error fetching gallery:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// POST new gallery image (admin only)
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No image provided" });
		}

		const { alt, displayOrder } = req.body;

		const result = await runQuery(
			"INSERT INTO gallery (imagePath, alt, displayOrder, publicId) VALUES (?, ?, ?, ?)",
			[req.file.path, alt || "", displayOrder || 0, req.file.filename]
		);

		res.json({ success: true, id: result.id });
	} catch (error) {
		console.error("Error adding gallery image:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// DELETE gallery image (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
	try {
		const { id } = req.params;

		// Get the image to delete from Cloudinary
		const image = await getQuery("SELECT publicId FROM gallery WHERE id = ?", [
			id,
		]);

		if (image && image.publicId) {
			await destroyCloudinaryAsset(image.publicId, "image");
		}

		await runQuery("DELETE FROM gallery WHERE id = ?", [id]);

		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting gallery image:", error);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
