const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { allQuery, runInsert } = require("../database/supabase");

// Master admin credentials (hardcoded, not in database)
const MASTER_ADMIN = {
	username: process.env.MASTER_USERNAME || "gowther",
	password: process.env.MASTER_PASSWORD || "Chemy@137546321",
	role: "master",
};

// Login
router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		// Check master admin first (hardcoded)
		if (
			username === MASTER_ADMIN.username &&
			password === MASTER_ADMIN.password
		) {
			req.session.userId = "master";
			req.session.username = MASTER_ADMIN.username;
			req.session.role = "master";

			return res.json({
				success: true,
				user: {
					id: "master",
					username: MASTER_ADMIN.username,
					role: "master",
				},
			});
		}

		// Check database users
		const users = await allQuery("users", {
			filters: { username },
		});

		const user = users[0];

		if (!user) {
			return res.json({ success: false, error: "Usuario no encontrado" });
		}

		const validPassword = await bcrypt.compare(password, user.password);

		if (!validPassword) {
			return res.json({ success: false, error: "Contraseña incorrecta" });
		}

		req.session.userId = user.id;
		req.session.username = user.username;
		req.session.role = user.role || "admin";

		res.json({
			success: true,
			user: {
				id: user.id,
				username: user.username,
				role: user.role || "admin",
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

// Logout
router.post("/logout", (req, res) => {
	req.session.destroy();
	res.json({ success: true });
});

// Check authentication status
router.get("/check", (req, res) => {
	if (req.session.userId) {
		res.json({
			authenticated: true,
			username: req.session.username,
			role: req.session.role || "admin",
		});
	} else {
		res.json({ authenticated: false });
	}
});

module.exports = router;
