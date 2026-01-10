const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const {
	allQuery,
	runInsert,
	runUpdate,
	runDelete,
	getQuery,
} = require("../database/supabase");
const { requireAuth } = require("../middleware/auth");

// GET all users (admin only, excluding master)
router.get("/", requireAuth, async (req, res) => {
	try {
		const users = await allQuery("users", {
			order: { column: "created_at", ascending: true },
		});

		// Return users without password
		const usersWithoutPassword = users.map((user) => ({
			id: user.id,
			username: user.username,
			role: user.role,
			createdAt: user.created_at,
		}));

		res.json(usersWithoutPassword);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// CREATE user (admin only)
router.post("/", requireAuth, async (req, res) => {
	try {
		const { username, password, role } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "Username and password required" });
		}

		// Check if user already exists
		const existingUsers = await allQuery("users", {
			filters: { username },
		});

		if (existingUsers.length > 0) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await runInsert("users", {
			username,
			password: hashedPassword,
			role: role || "admin",
		});

		res.json({
			success: true,
			id: user.id,
			username: user.username,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// UPDATE user (admin only)
router.put("/:id", requireAuth, async (req, res) => {
	try {
		const { username, password, role } = req.body;
		const updateData = {};

		if (username) updateData.username = username;
		if (role) updateData.role = role;

		// Only hash and update password if provided
		if (password) {
			updateData.password = await bcrypt.hash(password, 10);
		}

		await runUpdate("users", updateData, { id: req.params.id });

		res.json({ success: true });
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// DELETE user (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
	try {
		await runDelete("users", { id: req.params.id });
		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting user:", error);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
