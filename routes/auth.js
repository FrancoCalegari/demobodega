const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getQuery } = require("../database/db");

// Login
router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "Username and password required" });
		}

		const user = await getQuery("SELECT * FROM users WHERE username = ?", [
			username,
		]);

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);

		if (!isValid) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Set session
		req.session.userId = user.id;
		req.session.username = user.username;
		req.session.role = user.role;

		res.json({
			success: true,
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Server error" });
	}
});

// Logout
router.post("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).json({ error: "Error logging out" });
		}
		res.json({ success: true });
	});
});

// Check auth status
router.get("/check", (req, res) => {
	if (req.session && req.session.userId) {
		res.json({
			authenticated: true,
			user: {
				id: req.session.userId,
				username: req.session.username,
				role: req.session.role,
			},
		});
	} else {
		res.json({ authenticated: false });
	}
});

module.exports = router;
