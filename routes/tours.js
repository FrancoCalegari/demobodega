const express = require("express");
const router = express.Router();
const {
	supabase,
	allQuery,
	getQuery,
	runInsert,
	runUpdate,
	runDelete,
} = require("../database/supabase");
const { requireAuth } = require("../middleware/auth");

// GET all tours (public)
router.get("/", async (req, res) => {
	try {
		// Get all tours with related data using JOIN queries
		const tours = await allQuery("tours", {
			order: { column: "created_at", ascending: true },
		});

		// For each tour, get related data
		const toursWithDetails = await Promise.all(
			tours.map(async (tour) => {
				// Get features
				const features = await allQuery("features", {
					filters: { tour_id: tour.id },
					select: "feature",
					order: { column: "display_order", ascending: true },
				});

				// Get wineries
				const wineries = await allQuery("wineries", {
					filters: { tour_id: tour.id },
					order: { column: "display_order", ascending: true },
				});

				// Get menu steps
				const menuSteps = await allQuery("menu_steps", {
					filters: { tour_id: tour.id },
					select: "step",
					order: { column: "display_order", ascending: true },
				});

				// Get tour details
				const details = await getQuery("tour_details", { tour_id: tour.id });

				return {
					id: tour.id,
					title: tour.title,
					subtitle: tour.subtitle,
					image: tour.image,
					price: tour.price,
					priceCurrency: tour.price_currency,
					minGuests: tour.min_guests,
					description: tour.description,
					duration: tour.duration,
					features: features.map((f) => f.feature),
					details: {
						menuImage: details ? details.menu_image : null,
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
		const tour = await getQuery("tours", { id: req.params.id });

		if (!tour) {
			return res.status(404).json({ error: "Tour not found" });
		}

		// Get related data
		const features = await allQuery("features", {
			filters: { tour_id: tour.id },
			select: "feature",
			order: { column: "display_order", ascending: true },
		});

		const wineries = await allQuery("wineries", {
			filters: { tour_id: tour.id },
			order: { column: "display_order", ascending: true },
		});

		const menuSteps = await allQuery("menu_steps", {
			filters: { tour_id: tour.id },
			select: "step",
			order: { column: "display_order", ascending: true },
		});

		const details = await getQuery("tour_details", { tour_id: tour.id });

		res.json({
			...tour,
			features: features.map((f) => f.feature),
			details: {
				menuImage: details ? details.menu_image : null,
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
		const tour = await runInsert("tours", {
			title,
			subtitle,
			image,
			price,
			price_currency: priceCurrency,
			min_guests: minGuests,
			description,
			duration,
		});

		const tourId = tour.id;

		// Insert features
		if (features && Array.isArray(features)) {
			for (let i = 0; i < features.length; i++) {
				await runInsert("features", {
					tour_id: tourId,
					feature: features[i],
					display_order: i,
				});
			}
		}

		// Insert wineries
		if (wineries && Array.isArray(wineries)) {
			for (let i = 0; i < wineries.length; i++) {
				const w = wineries[i];
				await runInsert("wineries", {
					tour_id: tourId,
					name: w.name,
					image: w.image,
					location: w.location,
					instagram: w.instagram,
					display_order: i,
				});
			}
		}

		// Insert menu steps
		if (menuSteps && Array.isArray(menuSteps)) {
			for (let i = 0; i < menuSteps.length; i++) {
				await runInsert("menu_steps", {
					tour_id: tourId,
					step: menuSteps[i],
					display_order: i,
				});
			}
		}

		// Insert tour details
		if (menuImage) {
			await runInsert("tour_details", {
				tour_id: tourId,
				menu_image: menuImage,
			});
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
		await runUpdate(
			"tours",
			{
				title,
				subtitle,
				image,
				price,
				price_currency: priceCurrency,
				min_guests: minGuests,
				description,
				duration,
			},
			{ id: req.params.id }
		);

		// Delete and re-insert features
		await runDelete("features", { tour_id: req.params.id });
		if (features && Array.isArray(features)) {
			for (let i = 0; i < features.length; i++) {
				await runInsert("features", {
					tour_id: req.params.id,
					feature: features[i],
					display_order: i,
				});
			}
		}

		// Delete and re-insert wineries
		await runDelete("wineries", { tour_id: req.params.id });
		if (wineries && Array.isArray(wineries)) {
			for (let i = 0; i < wineries.length; i++) {
				const w = wineries[i];
				await runInsert("wineries", {
					tour_id: req.params.id,
					name: w.name,
					image: w.image,
					location: w.location,
					instagram: w.instagram,
					display_order: i,
				});
			}
		}

		// Delete and re-insert menu steps
		await runDelete("menu_steps", { tour_id: req.params.id });
		if (menuSteps && Array.isArray(menuSteps)) {
			for (let i = 0; i < menuSteps.length; i++) {
				await runInsert("menu_steps", {
					tour_id: req.params.id,
					step: menuSteps[i],
					display_order: i,
				});
			}
		}

		// Update tour details
		await runDelete("tour_details", { tour_id: req.params.id });
		if (menuImage) {
			await runInsert("tour_details", {
				tour_id: req.params.id,
				menu_image: menuImage,
			});
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
		// Supabase will cascade delete related records
		await runDelete("tours", { id: req.params.id });
		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting tour:", error);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
