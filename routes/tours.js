const express = require("express");
const router = express.Router();
const { runQuery, getQuery, allQuery } = require("../database/db");
const { requireAuth } = require("../middleware/auth");

// GET all tours (public)
router.get("/", async (req, res) => {
	try {
		const tours = await allQuery("SELECT * FROM tours ORDER BY id ASC");

		// For each tour, get related data
		const toursWithDetails = await Promise.all(
			tours.map(async (tour) => {
				const features = await allQuery(
					"SELECT feature FROM features WHERE tourId = ? ORDER BY displayOrder ASC",
					[tour.id]
				);

				const wineries = await allQuery(
					"SELECT * FROM wineries WHERE tourId = ? ORDER BY displayOrder ASC",
					[tour.id]
				);

				const menuSteps = await allQuery(
					"SELECT step FROM menu_steps WHERE tourId = ? ORDER BY displayOrder ASC",
					[tour.id]
				);

				const details = await getQuery(
					"SELECT menuImage FROM tour_details WHERE tourId = ?",
					[tour.id]
				);

				return {
					id: tour.id,
					title: tour.title,
					subtitle: tour.subtitle,
					image: tour.image,
					price: tour.price,
					priceCurrency: tour.priceCurrency,
					minGuests: tour.minGuests,
					description: tour.description,
					duration: tour.duration,
					features: features.map((f) => f.feature),
					details: {
						menuImage: details ? details.menuImage : null,
						menuSteps: menuSteps.map((m) => m.step),
						wineries: wineries,
					},
				};
			})
		);

		res.json(toursWithDetails);
	} catch (error) {
		console.error("Error fetching tours:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// GET single tour (public)
router.get("/:id", async (req, res) => {
	try {
		const tour = await getQuery("SELECT * FROM tours WHERE id = ?", [
			req.params.id,
		]);

		if (!tour) {
			return res.status(404).json({ error: "Tour not found" });
		}

		const features = await allQuery(
			"SELECT feature FROM features WHERE tourId = ? ORDER BY displayOrder ASC",
			[tour.id]
		);

		const wineries = await allQuery(
			"SELECT * FROM wineries WHERE tourId = ? ORDER BY displayOrder ASC",
			[tour.id]
		);

		const menuSteps = await allQuery(
			"SELECT step FROM menu_steps WHERE tourId = ? ORDER BY displayOrder ASC",
			[tour.id]
		);

		const details = await getQuery(
			"SELECT menuImage FROM tour_details WHERE tourId = ?",
			[tour.id]
		);

		res.json({
			...tour,
			features: features.map((f) => f.feature),
			details: {
				menuImage: details ? details.menuImage : null,
				menuSteps: menuSteps.map((m) => m.step),
				wineries: wineries,
			},
		});
	} catch (error) {
		console.error("Error fetching tour:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// CREATE tour (admin only)
router.post("/", requireAuth, async (req, res) => {
	try {
		const {
			title,
			subtitle,
			image,
			price,
			priceCurrency,
			minGuests,
			description,
			duration,
			features,
			wineries,
			menuSteps,
			menuImage,
		} = req.body;

		// Insert main tour
		const result = await runQuery(
			`INSERT INTO tours (title, subtitle, image, price, priceCurrency, minGuests, description, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				title,
				subtitle,
				image,
				price,
				priceCurrency,
				minGuests,
				description,
				duration,
			]
		);

		const tourId = result.id;

		// Insert features
		if (features && Array.isArray(features)) {
			for (let i = 0; i < features.length; i++) {
				await runQuery(
					"INSERT INTO features (tourId, feature, displayOrder) VALUES (?, ?, ?)",
					[tourId, features[i], i]
				);
			}
		}

		// Insert wineries
		if (wineries && Array.isArray(wineries)) {
			for (let i = 0; i < wineries.length; i++) {
				const w = wineries[i];
				await runQuery(
					"INSERT INTO wineries (tourId, name, image, location, instagram, displayOrder) VALUES (?, ?, ?, ?, ?, ?)",
					[tourId, w.name, w.image, w.location, w.instagram, i]
				);
			}
		}

		// Insert menu steps
		if (menuSteps && Array.isArray(menuSteps)) {
			for (let i = 0; i < menuSteps.length; i++) {
				await runQuery(
					"INSERT INTO menu_steps (tourId, step, displayOrder) VALUES (?, ?, ?)",
					[tourId, menuSteps[i], i]
				);
			}
		}

		// Insert tour details
		if (menuImage) {
			await runQuery(
				"INSERT INTO tour_details (tourId, menuImage) VALUES (?, ?)",
				[tourId, menuImage]
			);
		}

		res.json({ success: true, id: tourId });
	} catch (error) {
		console.error("Error creating tour:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// UPDATE tour (admin only)
router.put("/:id", requireAuth, async (req, res) => {
	try {
		const {
			title,
			subtitle,
			image,
			price,
			priceCurrency,
			minGuests,
			description,
			duration,
			features,
			wineries,
			menuSteps,
			menuImage,
		} = req.body;

		// Update main tour
		await runQuery(
			`UPDATE tours SET title = ?, subtitle = ?, image = ?, price = ?, priceCurrency = ?, minGuests = ?, description = ?, duration = ?
       WHERE id = ?`,
			[
				title,
				subtitle,
				image,
				price,
				priceCurrency,
				minGuests,
				description,
				duration,
				req.params.id,
			]
		);

		// Delete and re-insert features
		await runQuery("DELETE FROM features WHERE tourId = ?", [req.params.id]);
		if (features && Array.isArray(features)) {
			for (let i = 0; i < features.length; i++) {
				await runQuery(
					"INSERT INTO features (tourId, feature, displayOrder) VALUES (?, ?, ?)",
					[req.params.id, features[i], i]
				);
			}
		}

		// Delete and re-insert wineries
		await runQuery("DELETE FROM wineries WHERE tourId = ?", [req.params.id]);
		if (wineries && Array.isArray(wineries)) {
			for (let i = 0; i < wineries.length; i++) {
				const w = wineries[i];
				await runQuery(
					"INSERT INTO wineries (tourId, name, image, location, instagram, displayOrder) VALUES (?, ?, ?, ?, ?, ?)",
					[req.params.id, w.name, w.image, w.location, w.instagram, i]
				);
			}
		}

		// Delete and re-insert menu steps
		await runQuery("DELETE FROM menu_steps WHERE tourId = ?", [req.params.id]);
		if (menuSteps && Array.isArray(menuSteps)) {
			for (let i = 0; i < menuSteps.length; i++) {
				await runQuery(
					"INSERT INTO menu_steps (tourId, step, displayOrder) VALUES (?, ?, ?)",
					[req.params.id, menuSteps[i], i]
				);
			}
		}

		// Update tour details
		await runQuery("DELETE FROM tour_details WHERE tourId = ?", [
			req.params.id,
		]);
		if (menuImage) {
			await runQuery(
				"INSERT INTO tour_details (tourId, menuImage) VALUES (?, ?)",
				[req.params.id, menuImage]
			);
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Error updating tour:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// DELETE tour (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
	try {
		await runQuery("DELETE FROM tours WHERE id = ?", [req.params.id]);
		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting tour:", error);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
