const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const { configureCloudinary } = require("./utils/cloudinary");

// Load environment variables
require("dotenv").config();

// Configure Cloudinary
try {
	configureCloudinary();
	console.log("✅ Cloudinary configured successfully");
} catch (error) {
	console.warn("⚠️  Cloudinary not configured:", error.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.SESSION_SECRET || "valzoe-tour-secret-key-change-in-production",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false, // Set to true if using HTTPS
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	})
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/upload", require("./routes/upload"));

// Serve index.html for root
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Admin route
app.get("/admin", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
});
