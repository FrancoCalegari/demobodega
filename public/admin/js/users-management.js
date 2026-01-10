// =============== USERS MANAGEMENT ===============
// (Add this to the end of admin.js)

// Global variable for user role (add to top of file if not exists)
let currentUserRole = null;

// Check if user has admin access
function isAdmin() {
	return currentUserRole === "admin" || currentUserRole === "master";
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
