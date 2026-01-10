const { runQuery } = require("./db");
const fs = require("fs");
const path = require("path");

console.log("🔄 Migrating existing data to database...");

// Read existing tours.json
const toursJsonPath = path.join(
	__dirname,
	"..",
	"public",
	"assets",
	"data",
	"tours.json"
);

if (!fs.existsSync(toursJsonPath)) {
	console.log("⚠️  tours.json not found. Skipping migration.");
	process.exit(0);
}

const toursData = JSON.parse(fs.readFileSync(toursJsonPath, "utf8"));

(async () => {
	try {
		for (const tour of toursData) {
			// Insert main tour
			const tourResult = await runQuery(
				`INSERT INTO tours (title, subtitle, image, price, priceCurrency, minGuests, description, duration)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					tour.title,
					tour.subtitle,
					tour.image,
					tour.price,
					tour.priceCurrency,
					tour.minGuests,
					tour.description,
					tour.duration || "6 horas", // Default duration
				]
			);

			const tourId = tourResult.id;
			console.log(`✅ Migrated tour: ${tour.title} (ID: ${tourId})`);

			// Insert features
			if (tour.features && Array.isArray(tour.features)) {
				for (let i = 0; i < tour.features.length; i++) {
					await runQuery(
						"INSERT INTO features (tourId, feature, displayOrder) VALUES (?, ?, ?)",
						[tourId, tour.features[i], i]
					);
				}
			}

			// Insert wineries
			if (
				tour.details &&
				tour.details.wineries &&
				Array.isArray(tour.details.wineries)
			) {
				for (let i = 0; i < tour.details.wineries.length; i++) {
					const winery = tour.details.wineries[i];
					await runQuery(
						"INSERT INTO wineries (tourId, name, image, location, instagram, displayOrder) VALUES (?, ?, ?, ?, ?, ?)",
						[
							tourId,
							winery.name,
							winery.image,
							winery.location,
							winery.instagram,
							i,
						]
					);
				}
			}

			// Insert menu steps
			if (
				tour.details &&
				tour.details.menuSteps &&
				Array.isArray(tour.details.menuSteps)
			) {
				for (let i = 0; i < tour.details.menuSteps.length; i++) {
					await runQuery(
						"INSERT INTO menu_steps (tourId, step, displayOrder) VALUES (?, ?, ?)",
						[tourId, tour.details.menuSteps[i], i]
					);
				}
			}

			// Insert tour details (menu image)
			if (tour.details && tour.details.menuImage) {
				await runQuery(
					"INSERT INTO tour_details (tourId, menuImage) VALUES (?, ?)",
					[tourId, tour.details.menuImage]
				);
			}
		}

		// Migrate gallery images
		const galleryImages = [
			{
				path: "assets/img/gallery/photo1.webp",
				alt: "Gallery Image 1",
				order: 0,
			},
			{
				path: "assets/img/gallery/photo2.webp",
				alt: "Gallery Image 2",
				order: 1,
			},
			{
				path: "assets/img/gallery/photo3.webp",
				alt: "Gallery Image 3",
				order: 2,
			},
			{
				path: "assets/img/gallery/photo4.webp",
				alt: "Gallery Image 4",
				order: 3,
			},
			{
				path: "assets/img/gallery/photo5.webp",
				alt: "Gallery Image 5",
				order: 4,
			},
			{
				path: "assets/img/gallery/photo6.webp",
				alt: "Gallery Image 6",
				order: 5,
			},
			{
				path: "assets/img/gallery/photo7.webp",
				alt: "Gallery Image 7",
				order: 6,
			},
		];

		for (const img of galleryImages) {
			await runQuery(
				"INSERT INTO gallery (imagePath, alt, displayOrder) VALUES (?, ?, ?)",
				[img.path, img.alt, img.order]
			);
		}

		console.log("✅ Gallery images migrated");
		console.log("✅ Migration completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration error:", error);
		process.exit(1);
	}
})();
