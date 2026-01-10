const { runQuery, allQuery } = require("./db");

console.log("🔧 Fixing gallery image paths...");

(async () => {
	try {
		// Get all gallery images
		const images = await allQuery("SELECT * FROM gallery");

		console.log(`Found ${images.length} images to update`);

		for (const image of images) {
			// Only update if path doesn't start with /
			if (!image.imagePath.startsWith("/")) {
				const newPath = "/" + image.imagePath;
				await runQuery("UPDATE gallery SET imagePath = ? WHERE id = ?", [
					newPath,
					image.id,
				]);
				console.log(`✅ Updated: ${image.imagePath} → ${newPath}`);
			}
		}

		console.log("✅ All image paths fixed!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
})();
