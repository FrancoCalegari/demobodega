// DOM Elements
const loginScreen = document.getElementById("loginScreen");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

// Navigation
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");

// Tours
const addTourBtn = document.getElementById("addTourBtn");
const toursTable = document.getElementById("toursTable");
const tourModal = document.getElementById("tourModal");
const tourForm = document.getElementById("tourForm");

//Gallery
const addImageBtn = document.getElementById("addImageBtn");
const galleryGrid = document.getElementById("galleryGrid");
const galleryModal = document.getElementById("galleryModal");
const galleryForm = document.getElementById("galleryForm");

// =============== MEDIA UPLOAD HELPERS ===============

// YouTube URL detection
function extractYouTubeId(url) {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/,
		/youtube\.com\/embed\/([^&\?]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

// Process media URL (detect YouTube)
function processMediaUrl(url) {
	const youtubeId = extractYouTubeId(url);
	if (youtubeId) {
		return {
			type: "youtube",
			url: `https://www.youtube.com/embed/${youtubeId}`,
		};
	}
	return {
		type: "url",
		url: url,
	};
}

// Extract YouTube URL from iframe
function extractYouTubeFromIframe(iframeHtml) {
	const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);
	if (srcMatch && srcMatch[1]) {
		return srcMatch[1];
	}
	return null;
}

// Upload file to server
async function uploadMediaFile(file) {
	const formData = new FormData();
	formData.append("media", file);

	try {
		const response = await fetch("/api/upload/tour", {
			method: "POST",
			body: formData,
		});

		if (response.ok) {
			const data = await response.json();
			return data.path;
		}
		return null;
	} catch (error) {
		console.error("Error uploading file:", error);
		return null;
	}
}

// Check authentication on load
checkAuth();

async function checkAuth() {
	try {
		const response = await fetch("/api/auth/check");
		const data = await response.json();

		if (data.authenticated) {
			// Store user role globally
			window.currentUserRole = data.role;

			// Show users tab for admin and master roles
			if (data.role === "admin" || data.role === "master") {
				const usersNavLink = document.getElementById("usersNavLink");
				if (usersNavLink) {
					usersNavLink.style.display = "block";
				}
			}

			showDashboard();
			loadTours();
		} else {
			showLogin();
		}
	} catch (error) {
		console.error("Auth check error:", error);
		showLogin();
	}
}

function showLogin() {
	loginScreen.style.display = "flex";
	adminDashboard.style.display = "none";
}

function showDashboard() {
	loginScreen.style.display = "none";
	adminDashboard.style.display = "flex";
}

// Login
loginForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const username = document.getElementById("loginUsername").value;
	const password = document.getElementById("loginPassword").value;

	try {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});

		const data = await response.json();

		if (data.success) {
			// Store user role
			if (data.user && data.user.role) {
				window.currentUserRole = data.user.role;

				// Show users tab for admin and master roles
				if (data.user.role === "admin" || data.user.role === "master") {
					const usersNavLink = document.getElementById("usersNavLink");
					if (usersNavLink) {
						usersNavLink.style.display = "block";
					}
				}
			}

			showDashboard();
			loadTours();
		} else {
			loginError.textContent = data.error || "Error al iniciar sesión";
			loginError.style.display = "block";
		}
	} catch (error) {
		loginError.textContent = "Error de conexión";
		loginError.style.display = "block";
	}
});

// Logout
logoutBtn.addEventListener("click", async () => {
	try {
		await fetch("/api/auth/logout", { method: "POST" });
		showLogin();
	} catch (error) {
		console.error("Logout error:", error);
	}
});

// Navigation
navLinks.forEach((link) => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		const sectionName = link.getAttribute("data-section");

		// Update active link
		navLinks.forEach((l) => l.classList.remove("active"));
		link.classList.add("active");

		// Show section
		sections.forEach((s) => s.classList.remove("active"));
		document.getElementById(`${sectionName}Section`).classList.add("active");

		// Load data
		if (sectionName === "tours") loadTours();
		if (sectionName === "gallery") loadGallery();
		if (sectionName === "users") loadUsers();
	});
});

// =============== TOURS ===============

async function loadTours() {
	try {
		const response = await fetch("/api/tours");
		const tours = await response.json();

		toursTable.innerHTML = "";

		if (tours.length === 0) {
			toursTable.innerHTML =
				'<p style="padding: 20px; text-align: center; color: var(--admin-muted);">No hay tours creados</p>';
			return;
		}

		tours.forEach((tour) => {
			const item = document.createElement("div");
			item.className = "tour-item";
			item.innerHTML = `
        <div class="tour-info">
          <h3>${tour.title}</h3>
          <p>${tour.subtitle || ""} | $${tour.price} | ${
				tour.duration || "N/A"
			}</p>
        </div>
        <div class="tour-actions">
          <button class="icon-btn edit" onclick="editTour('${tour.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn delete" onclick="deleteTour('${tour.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
			toursTable.appendChild(item);
		});
	} catch (error) {
		console.error("Error loading tours:", error);
	}
}

addTourBtn.addEventListener("click", () => {
	document.getElementById("tourModalTitle").textContent = "Nuevo Tour";
	tourForm.reset();
	document.getElementById("tourId").value = "";
	document.getElementById("wineriesContainer").innerHTML = "";
	document.getElementById("tourMediaPreview").innerHTML = "";
	// Reset tabs
	document
		.querySelectorAll(".tab-btn")
		.forEach((btn) => btn.classList.remove("active"));
	document.querySelector('[data-tab="upload"]').classList.add("active");
	document.getElementById("uploadTab").style.display = "block";
	document.getElementById("urlTab").style.display = "none";
	document.getElementById("iframeTab").style.display = "none";
	tourModal.classList.add("active");
});

window.editTour = async (id) => {
	try {
		const response = await fetch(`/api/tours/${id}`);
		const tour = await response.json();

		document.getElementById("tourModalTitle").textContent = "Editar Tour";
		document.getElementById("tourId").value = tour.id;
		document.getElementById("tourTitle").value = tour.title;
		document.getElementById("tourSubtitle").value = tour.subtitle || "";
		document.getElementById("tourPrice").value = tour.price;
		document.getElementById("tourMinGuests").value = tour.minGuests;
		document.getElementById("tourDuration").value = tour.duration || "";
		document.getElementById("tourDescription").value = tour.description || "";
		document.getElementById("tourImage").value = tour.image || "";
		document.getElementById("tourFeatures").value = tour.features.join("\n");
		document.getElementById("menuImage").value = tour.details.menuImage || "";
		document.getElementById("menuSteps").value =
			tour.details.menuSteps.join("\n");

		// Load wineries
		const wineriesContainer = document.getElementById("wineriesContainer");
		wineriesContainer.innerHTML = "";
		if (tour.details.wineries) {
			tour.details.wineries.forEach((winery, index) => {
				addWineryBlock(winery);
			});
		}

		tourModal.classList.add("active");
	} catch (error) {
		console.error("Error loading tour:", error);
	}
};

window.deleteTour = async (id) => {
	if (!confirm("¿Estás seguro de eliminar este tour?")) return;

	try {
		await fetch(`/api/tours/${id}`, { method: "DELETE" });
		loadTours();
	} catch (error) {
		console.error("Error deleting tour:", error);
	}
};

tourForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const tourId = document.getElementById("tourId").value;
	const featuresText = document.getElementById("tourFeatures").value;
	const menuStepsText = document.getElementById("menuSteps").value;

	// Process media (file, URL, or iframe)
	let tourImagePath = document.getElementById("tourImage").value;
	const mediaFile = document.getElementById("tourMediaFile").files[0];
	const mediaUrl = document.getElementById("tourMediaUrl").value.trim();
	const mediaIframe = document.getElementById("tourMediaIframe").value.trim();

	// Upload file if provided
	if (mediaFile) {
		tourImagePath = await uploadMediaFile(mediaFile);
		if (!tourImagePath) {
			alert("Error al subir el archivo");
			return;
		}
	}
	// Or process iframe if provided
	else if (mediaIframe) {
		const extractedUrl = extractYouTubeFromIframe(mediaIframe);
		if (extractedUrl) {
			tourImagePath = extractedUrl;
		} else {
			alert("No se pudo extraer la URL del iframe");
			return;
		}
	}
	// Or process URL if provided
	else if (mediaUrl) {
		const processed = processMediaUrl(mediaUrl);
		tourImagePath = processed.url;
	}

	const wineries = [];
	document.querySelectorAll(".winery-block").forEach((block) => {
		wineries.push({
			name: block.querySelector(".winery-name").value,
			image: block.querySelector(".winery-image").value,
			location: block.querySelector(".winery-location").value,
			instagram: block.querySelector(".winery-instagram").value,
		});
	});

	const tourData = {
		title: document.getElementById("tourTitle").value,
		subtitle: document.getElementById("tourSubtitle").value,
		image: tourImagePath,
		price: document.getElementById("tourPrice").value,
		priceCurrency: "ARS",
		minGuests: parseInt(document.getElementById("tourMinGuests").value),
		description: document.getElementById("tourDescription").value,
		duration: document.getElementById("tourDuration").value,
		features: featuresText.split("\n").filter((f) => f.trim()),
		wineries: wineries,
		menuSteps: menuStepsText.split("\n").filter((s) => s.trim()),
		menuImage: document.getElementById("menuImage").value,
	};

	try {
		const url = tourId ? `/api/tours/${tourId}` : "/api/tours";
		const method = tourId ? "PUT" : "POST";

		await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(tourData),
		});

		tourModal.classList.remove("active");
		loadTours();
	} catch (error) {
		console.error("Error saving tour:", error);
		alert("Error al guardar el tour");
	}
});

// Wineries management
document.getElementById("addWineryBtn").addEventListener("click", () => {
	addWineryBlock();
});

function addWineryBlock(winery = {}) {
	const container = document.getElementById("wineriesContainer");
	const block = document.createElement("div");
	const wineryIndex = container.children.length;
	block.className = "winery-block";
	block.setAttribute("data-winery-index", wineryIndex);
	block.innerHTML = `
    <button type="button" class="icon-btn delete winery-remove" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-times"></i>
    </button>
    <div class="form-row">
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" class="winery-name" value="${
					winery.name || ""
				}" required>
      </div>
    </div>
    <div class="form-group">
      <label>Imagen de Bodega</label>
      <div class="winery-media-tabs">
        <button type="button" class="winery-tab-btn active" data-winery-tab="upload" data-index="${wineryIndex}">Subir Archivo</button>
        <button type="button" class="winery-tab-btn" data-winery-tab="url" data-index="${wineryIndex}">URL</button>
      </div>
      <div class="winery-tab-content" id="wineryUploadTab${wineryIndex}">
        <input type="file" class="winery-image-file" accept="image/*" data-index="${wineryIndex}" />
        <div class="winery-image-preview" data-index="${wineryIndex}" style="margin-top: 10px;"></div>
      </div>
      <div class="winery-tab-content" id="wineryUrlTab${wineryIndex}" style="display: none;">
        <input type="text" class="winery-image-url" placeholder="URL de imagen" data-index="${wineryIndex}" value="${
		winery.image || ""
	}" />
      </div>
      <input type="hidden" class="winery-image" value="${winery.image || ""}" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Ubicación (Google Maps)</label>
        <input type="text" class="winery-location" value="${
					winery.location || ""
				}">
      </div>
      <div class="form-group">
        <label>Instagram</label>
        <input type="text" class="winery-instagram" value="${
					winery.instagram || ""
				}">
      </div>
    </div>
  `;
	container.appendChild(block);

	// Add event listeners for this winery's tabs
	setupWineryTabs(wineryIndex);
}

// Setup tabs for winery image upload
function setupWineryTabs(index) {
	const tabBtns = document.querySelectorAll(
		`.winery-tab-btn[data-index="${index}"]`
	);

	tabBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const tab = btn.getAttribute("data-winery-tab");

			// Update active button
			tabBtns.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");

			// Show/hide tabs
			document.getElementById(`wineryUploadTab${index}`).style.display =
				tab === "upload" ? "block" : "none";
			document.getElementById(`wineryUrlTab${index}`).style.display =
				tab === "url" ? "block" : "none";
		});
	});

	// File preview
	const fileInput = document.querySelector(
		`.winery-image-file[data-index="${index}"]`
	);
	if (fileInput) {
		fileInput.addEventListener("change", async (e) => {
			const file = e.target.files[0];
			const preview = document.querySelector(
				`.winery-image-preview[data-index="${index}"]`
			);
			const hiddenInput = e.target
				.closest(".winery-block")
				.querySelector(".winery-image");

			if (file) {
				// Show preview
				const reader = new FileReader();
				reader.onload = (event) => {
					preview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 150px; border-radius: 6px;">`;
				};
				reader.readAsDataURL(file);

				// Upload file
				const uploadedPath = await uploadMediaFile(file);
				if (uploadedPath) {
					hiddenInput.value = uploadedPath;
				}
			}
		});
	}

	// URL input
	const urlInput = document.querySelector(
		`.winery-image-url[data-index="${index}"]`
	);
	if (urlInput) {
		urlInput.addEventListener("input", (e) => {
			const hiddenInput = e.target
				.closest(".winery-block")
				.querySelector(".winery-image");
			hiddenInput.value = e.target.value;
		});
	}
}

// =============== MEDIA UPLOAD TAB SWITCHING ===============

// Tab switching
document.addEventListener("DOMContentLoaded", () => {
	const tabBtns = document.querySelectorAll(".tab-btn");

	tabBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const tab = btn.getAttribute("data-tab");

			// Update active button
			tabBtns.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");

			// Show/hide tabs
			document.getElementById("uploadTab").style.display =
				tab === "upload" ? "block" : "none";
			document.getElementById("urlTab").style.display =
				tab === "url" ? "block" : "none";
			document.getElementById("iframeTab").style.display =
				tab === "iframe" ? "block" : "none";
		});
	});

	// Media file preview
	const mediaFileInput = document.getElementById("tourMediaFile");
	if (mediaFileInput) {
		mediaFileInput.addEventListener("change", (e) => {
			const file = e.target.files[0];
			const preview = document.getElementById("tourMediaPreview");

			if (file) {
				const reader = new FileReader();
				reader.onload = (event) => {
					const isVideo = file.type.startsWith("video/");

					if (isVideo) {
						preview.innerHTML = `
							<video src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 6px;" controls></video>
						`;
					} else {
						preview.innerHTML = `
							<img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 6px;">
						`;
					}
				};
				reader.readAsDataURL(file);
			}
		});
	}

	// Menu image tabs
	const menuTabBtns = document.querySelectorAll(".menu-tab-btn");
	menuTabBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const tab = btn.getAttribute("data-menu-tab");

			// Update active button
			menuTabBtns.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");

			// Show/hide tabs
			document.getElementById("menuUploadTab").style.display =
				tab === "upload" ? "block" : "none";
			document.getElementById("menuUrlTab").style.display =
				tab === "url" ? "block" : "none";
		});
	});

	// Menu image file preview
	const menuFileInput = document.getElementById("menuImageFile");
	if (menuFileInput) {
		menuFileInput.addEventListener("change", async (e) => {
			const file = e.target.files[0];
			const preview = document.getElementById("menuImagePreview");
			const hiddenInput = document.getElementById("menuImage");

			if (file) {
				// Show preview
				const reader = new FileReader();
				reader.onload = (event) => {
					preview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 150px; border-radius: 6px;">`;
				};
				reader.readAsDataURL(file);

				// Upload file
				const uploadedPath = await uploadMediaFile(file);
				if (uploadedPath) {
					hiddenInput.value = uploadedPath;
				}
			}
		});
	}

	// Menu image URL input
	const menuUrlInput = document.getElementById("menuImageUrl");
	if (menuUrlInput) {
		menuUrlInput.addEventListener("input", (e) => {
			const hiddenInput = document.getElementById("menuImage");
			hiddenInput.value = e.target.value;
		});
	}
});

// =============== GALLERY ===============

async function loadGallery() {
	try {
		const response = await fetch("/api/gallery");
		const images = await response.json();

		galleryGrid.innerHTML = "";

		if (images.length === 0) {
			galleryGrid.innerHTML =
				'<p style="padding: 20px; text-align: center; color: var(--admin-muted); grid-column: 1 / -1;">No hay imágenes en la galería</p>';
			return;
		}

		images.forEach((image) => {
			const item = document.createElement("div");
			item.className = "gallery-item-admin";
			item.innerHTML = `
        <img src="${image.image_path}" alt="${image.alt || "Gallery image"}">
        <div class="gallery-item-info">
          <p>${image.alt || "Sin descripción"}</p>
          <div class="item-actions">
            <button class="icon-btn delete" onclick="deleteGalleryImage('${
							image.id
						}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
			galleryGrid.appendChild(item);
		});
	} catch (error) {
		console.error("Error loading gallery:", error);
	}
}

addImageBtn.addEventListener("click", () => {
	galleryForm.reset();
	document.getElementById("imagePreview").innerHTML = "";
	galleryModal.classList.add("active");
});

// Image preview
document.getElementById("galleryImageInput").addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = (event) => {
			document.getElementById("imagePreview").innerHTML = `
        <img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 6px;">
      `;
		};
		reader.readAsDataURL(file);
	}
});

galleryForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const formData = new FormData();
	const imageFile = document.getElementById("galleryImageInput").files[0];
	const alt = document.getElementById("galleryAlt").value;

	formData.append("image", imageFile);
	formData.append("alt", alt);
	formData.append("displayOrder", 0);

	try {
		const response = await fetch("/api/gallery", {
			method: "POST",
			body: formData,
		});

		if (response.ok) {
			galleryModal.classList.remove("active");
			loadGallery();
		} else {
			alert("Error al subir la imagen");
		}
	} catch (error) {
		console.error("Error uploading image:", error);
		alert("Error al subir la imagen");
	}
});

window.deleteGalleryImage = async (id) => {
	if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

	try {
		await fetch(`/api/gallery/${id}`, { method: "DELETE" });
		loadGallery();
	} catch (error) {
		console.error("Error deleting image:", error);
	}
};

// Modal close handlers
document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
	btn.addEventListener("click", () => {
		tourModal.classList.remove("active");
		galleryModal.classList.remove("active");
	});
});

// Close modal on outside click
[tourModal, galleryModal].forEach((modal) => {
	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.classList.remove("active");
		}
	});
});
// =============== USERS MANAGEMENT ===============
// (Add this to the end of admin.js)

// Global variable for user role (add to top of file if not exists)
let currentUserRole = null;

// Check if user has admin access
function isAdmin() {
	return (
		window.currentUserRole === "admin" || window.currentUserRole === "master"
	);
}

// Load all users
async function loadUsers() {
	if (!isAdmin()) {
		console.log("Access denied: Only admins can view users");
		return;
	}

	try {
		const response = await fetch("/api/users");
		const users = await response.json();

		const tbody = document.getElementById("usersTableBody");
		if (!tbody) return;

		tbody.innerHTML = users
			.map(
				(user) => `
			<tr>
				<td>${user.username}</td>
				<td><span class="badge badge-${user.role}">${user.role}</span></td>
				<td>${new Date(user.createdAt).toLocaleDateString("es-ES")}</td>
				<td class="actions">
					<button class="icon-btn edit" onclick="editUser('${user.id}')">
						<i class="fa-solid fa-pen"></i>
					</button>
					<button class="icon-btn delete" onclick="deleteUser('${user.id}')">
						<i class="fa-solid fa-trash"></i>
					</button>
				</td>
			</tr>
		`
			)
			.join("");
	} catch (error) {
		console.error("Error loading users:", error);
	}
}

// Open user modal for creation
document.getElementById("addUserBtn")?.addEventListener("click", () => {
	if (!isAdmin()) {
		alert("Solo los administradores pueden gestionar usuarios");
		return;
	}

	document.getElementById("userId").value = "";
	document.getElementById("username").value = "";
	document.getElementById("userPassword").value = "";
	document.getElementById("userPassword").required = true;
	document.getElementById("userRole").value = "admin";
	document.getElementById("userModalTitle").textContent = "Agregar Usuario";
	document.getElementById("passwordHint").style.display = "none";
	document.getElementById("userModal").classList.add("active");
});

// Edit user
async function editUser(userId) {
	if (!isAdmin()) {
		alert("Solo los administradores pueden editar usuarios");
		return;
	}

	try {
		const response = await fetch("/api/users");
		const users = await response.json();
		const user = users.find((u) => u.id === userId);

		if (!user) return;

		document.getElementById("userId").value = user.id;
		document.getElementById("username").value = user.username;
		document.getElementById("userPassword").value = "";
		document.getElementById("userPassword").required = false;
		document.getElementById("userRole").value = user.role;
		document.getElementById("userModalTitle").textContent = "Editar Usuario";
		document.getElementById("passwordHint").style.display = "inline";
		document.getElementById("userModal").classList.add("active");
	} catch (error) {
		console.error("Error loading user:", error);
	}
}

// Delete user
async function deleteUser(userId) {
	if (!isAdmin()) {
		alert("Solo los administradores pueden eliminar usuarios");
		return;
	}

	if (!confirm("\u00bfEstás seguro de eliminar este usuario?")) return;

	try {
		await fetch(`/api/users/${userId}`, { method: "DELETE" });
		loadUsers();
	} catch (error) {
		console.error("Error deleting user:", error);
		alert("Error al eliminar usuario");
	}
}

// User form submission
document.getElementById("userForm")?.addEventListener("submit", async (e) => {
	e.preventDefault();

	if (!isAdmin()) {
		alert("Solo los administradores pueden gestionar usuarios");
		return;
	}

	const userId = document.getElementById("userId").value;
	const userData = {
		username: document.getElementById("username").value,
		password: document.getElementById("userPassword").value,
		role: document.getElementById("userRole").value,
	};

	// Remove password if editing and not changed
	if (userId && !userData.password) {
		delete userData.password;
	}

	try {
		const url = userId ? `/api/users/${userId}` : "/api/users";
		const method = userId ? "PUT" : "POST";

		const response = await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(userData),
		});

		if (response.ok) {
			document.getElementById("userModal").classList.remove("active");
			loadUsers();
		} else {
			const data = await response.json();
			alert(data.error || "Error al guardar usuario");
		}
	} catch (error) {
		console.error("Error saving user:", error);
		alert("Error al guardar usuario");
	}
});

// Modal close handlers for user modal
document
	.querySelectorAll("#userModal .modal-close, #userModal .modal-cancel")
	.forEach((btn) => {
		btn.addEventListener("click", () => {
			document.getElementById("userModal").classList.remove("active");
		});
	});

// Update auth check to store role and show/hide users tab
// Modify the existing auth check in admin.js around line 90-130
// After successful login, add:
/*
currentUserRole = data.role;
if (isAdmin()) {
	document.getElementById('usersNavLink').style.display = 'block';
}
*/

// Add users nav link click handler
document
	.querySelector('[data-section="users"]')
	?.addEventListener("click", (e) => {
		e.preventDefault();
		if (isAdmin()) {
			loadUsers();
		}
	});
