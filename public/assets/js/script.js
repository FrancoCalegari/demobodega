document.addEventListener("DOMContentLoaded", function () {
	const bookingForm = document.getElementById("bookingForm");

	// Set minimum date to today
	// Intelligent Date Selection
	const dateInput = document.getElementById("date");
	if (dateInput) {
		const now = new Date();
		const currentHour = now.getHours();

		// Calculate today's date string
		const todayString = now.toISOString().split("T")[0];

		// If it's past 12 PM, default to tomorrow but still allow today
		if (currentHour >= 12) {
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			const tomorrowString = tomorrow.toISOString().split("T")[0];
			dateInput.value = tomorrowString;
		} else {
			dateInput.value = todayString;
		}

		// Always set min to today (allow selection of today and any future date)
		dateInput.setAttribute("min", todayString);
		// Remove any max restriction
		dateInput.removeAttribute("max");
	}

	bookingForm.addEventListener("submit", function (e) {
		e.preventDefault();

		const date = document.getElementById("date").value;
		const language = document.getElementById("language").value;
		const guests = document.getElementById("guests").value;

		if (!date) {
			alert("Por favor selecciona una fecha.");
			return;
		}

		if (guests < 1) {
			alert("El mínimo de personas para la reserva es de 1.");
			return;
		}

		// Format message
		// "Hola, quisiera reservar un tour para el dia [fecha]. Somos [X] personas. Idioma preferido: [idioma]."
		const message = `Hola, quisiera reservar un tour para el día ${date}. Somos ${guests} personas. Idioma preferido: ${language}.`;

		// Encode for URL
		const encodedMessage = encodeURIComponent(message);

		// WhatsApp number from requirements: 2613022740. Country code 549 for Argentina mobiles usually.
		// Format: https://wa.me/5492613022740
		const whatsappUrl = `https://wa.me/5492613022740?text=${encodedMessage}`;

		// Open in new tab
		window.open(whatsappUrl, "_blank");
	});

	// Smooth scroll for anchor links
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			document.querySelector(this.getAttribute("href")).scrollIntoView({
				behavior: "smooth",
			});
		});
	});

	// Lightbox Functionality
	const lightbox = document.getElementById("lightbox");
	const lightboxImg = document.getElementById("lightboxImg");
	const lightboxClose = document.getElementById("lightboxClose");
	const galleryImages = document.querySelectorAll(".gallery-item img");

	galleryImages.forEach((img) => {
		img.addEventListener("click", function () {
			lightbox.classList.add("active");
			lightboxImg.src = this.src;
			lightboxImg.alt = this.alt;
		});
	});

	// Close Lightbox
	lightboxClose.addEventListener("click", function () {
		lightbox.classList.remove("active");
	});

	lightbox.addEventListener("click", function (e) {
		if (e.target === lightbox) {
			lightbox.classList.remove("active");
		}
	});

	// Close with Escape key
	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && lightbox.classList.contains("active")) {
			lightbox.classList.remove("active");
		}
	});
	// Hero Background Slideshow
	const heroBg = document.getElementById("hero-bg");
	const heroImages = [
		"assets/img/gallery/photo1.webp",
		"assets/img/gallery/photo2.webp",
		"assets/img/gallery/photo3.webp",
		"assets/img/gallery/photo4.webp",
		"assets/img/gallery/photo5.webp",
		"assets/img/gallery/photo6.webp",
		"assets/img/gallery/photo7.webp",
	];

	// Create divs for each image
	if (heroBg) {
		heroImages.forEach((src, index) => {
			const div = document.createElement("div");
			div.style.backgroundImage = `url('${src}')`;
			if (index === 0) div.classList.add("active");
			heroBg.appendChild(div);
		});

		let currentHeroIndex = 0;
		const heroDivs = heroBg.querySelectorAll("div");

		if (heroDivs.length > 0) {
			setInterval(() => {
				heroDivs[currentHeroIndex].classList.remove("active");
				currentHeroIndex = (currentHeroIndex + 1) % heroDivs.length;
				heroDivs[currentHeroIndex].classList.add("active");
			}, 5000); // Change every 5 seconds
		}
	}

	// Hamburger Menu
	const hamburger = document.getElementById("hamburger");
	const navLinks = document.getElementById("nav-links");

	hamburger.addEventListener("click", () => {
		navLinks.classList.toggle("active");
		// Optional: Animate icon between bars and times (X)
		const icon = hamburger.querySelector("i");
		if (navLinks.classList.contains("active")) {
			icon.classList.remove("fa-bars");
			icon.classList.add("fa-xmark");
		} else {
			icon.classList.remove("fa-xmark");
			icon.classList.add("fa-bars");
		}
	});

	// Close menu when clicking a link
	navLinks.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			navLinks.classList.remove("active");
			const icon = hamburger.querySelector("i");
			icon.classList.remove("fa-xmark");
			icon.classList.add("fa-bars");
			// Load Tours
		});
	});

	// Load Tours from API
	async function loadTours() {
		try {
			const response = await fetch("/api/tours");
			const tours = await response.json();

			const toursContainer = document.getElementById("tours-container");
			if (!toursContainer) return;

			toursContainer.innerHTML = ""; // Clear loading message

			tours.forEach((tour) => {
				const card = document.createElement("article");
				card.className = "tour-card";

				// Features list
				const featuresHtml = tour.features
					.map(
						(feature) => `<li><i class="fa-solid fa-check"></i> ${feature}</li>`
					)
					.join("");

				// Duration display
				const durationHtml = tour.duration
					? `<p class="tour-duration"><i class="fa-solid fa-clock"></i> ${tour.duration}</p>`
					: "";

				// Media rendering (image, video, or YouTube iframe)
				let mediaHtml = "";
				if (tour.image) {
					// Check if it's a YouTube embed URL
					if (tour.image.includes("youtube.com/embed/")) {
						mediaHtml = `
							<div class="card-media-wrapper">
								<iframe src="${tour.image}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
							</div>
						`;
					}
					// Check if it's a video file
					else if (tour.image.match(/\.(mp4|webm|mov)$/i)) {
						mediaHtml = `
							<div class="card-media-wrapper">
								<video src="${tour.image}" autoplay loop muted playsinline></video>
							</div>
						`;
					}
					// Otherwise it's an image
					else {
						mediaHtml = `
							<div class="card-image" style="background-image: url('${tour.image}')">
								<div class="badge">Paquete Destacado</div>
							</div>
						`;
					}
				} else {
					// Fallback if no image
					mediaHtml = `
						<div class="card-image" style="background-image: url('assets/img/winery-default.jpg')">
							<div class="badge">Paquete Destacado</div>
						</div>
					`;
				}

				card.innerHTML = `
					${mediaHtml}
                <div class="card-content">
                    <h3>${tour.title}</h3>
                    <p class="tour-subtitle">${tour.subtitle}</p>
                    <p>${tour.description}</p>
                    ${durationHtml}
                    <ul class="card-features">
                        ${featuresHtml}
                    </ul>
                    <div class="card-price">
                        <span class="price-value">$${tour.price}</span>
                        <span class="price-currency">${tour.priceCurrency}</span>
						<span class="price-info">Por Persona</span>
                    </div>
                    <button class="btn btn-primary btn-tour-details" data-id="${tour.id}">Ver Más Detalles</button>
                </div>
            `;
				toursContainer.appendChild(card);
			});

			// Add event listeners to new buttons
			document.querySelectorAll(".btn-tour-details").forEach(function (btn) {
				btn.addEventListener("click", function (e) {
					const tourId = e.target.getAttribute("data-id");
					loadTourDetails(tourId);
				});
			});
		} catch (error) {
			console.error("Error loading tours:", error);
			const toursContainer = document.getElementById("tours-container");
			if (toursContainer) {
				toursContainer.innerHTML =
					'<p style="text-align: center; color: var(--text-muted);">Error al cargar los tours. Por favor recarga la página.</p>';
			}
		}
	}

	// Load tour details for modal
	async function loadTourDetails(tourId) {
		try {
			const response = await fetch(`/api/tours/${tourId}`);
			const tour = await response.json();
			openTourModal(tour);
		} catch (error) {
			console.error("Error loading tour details:", error);
		}
	}

	// Initialize tours on page load
	loadTours();
	loadGallery();

	// Load Gallery from API
	async function loadGallery() {
		try {
			const response = await fetch("/api/gallery");
			const images = await response.json();

			const galleryContainer = document.getElementById("gallery-container");
			if (!galleryContainer) return;

			galleryContainer.innerHTML = "";

			if (images.length === 0) {
				galleryContainer.innerHTML =
					'<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1;">No hay imágenes en la galería</p>';
				return;
			}

			images.forEach((image) => {
				const item = document.createElement("div");
				item.className = "gallery-item";
				item.innerHTML = `
					<img
						src="${image.image_path}"
						alt="${image.alt || "Galería"}"
						loading="lazy"
					/>
				`;
				galleryContainer.appendChild(item);
			});

			// Re-initialize lightbox for new images
			initLightbox();
		} catch (error) {
			console.error("Error loading gallery:", error);
			const galleryContainer = document.getElementById("gallery-container");
			if (galleryContainer) {
				galleryContainer.innerHTML =
					'<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1;">Error al cargar la galería</p>';
			}
		}
	}

	// Initialize lightbox for gallery images
	function initLightbox() {
		const galleryItems = document.querySelectorAll(".gallery-item img");
		galleryItems.forEach((img) => {
			img.addEventListener("click", () => {
				const lightbox = document.getElementById("lightbox");
				const lightboxImg = document.getElementById("lightboxImg");
				if (lightbox && lightboxImg) {
					lightboxImg.src = img.src;
					lightbox.classList.add("active");
				}
			});
		});
	}

	// Tour Modal Logic
	const tourModal = document.getElementById("tourModal");
	const modalClose = document.getElementById("modalClose");
	const modalBody = document.getElementById("tourModalBody");

	function openTourModal(tour) {
		const menuStepsHtml = tour.details.menuSteps
			.map((step) => `<li class="menu-step">${step}</li>`)
			.join("");

		const wineriesHtml = tour.details.wineries
			.map(
				(winery) => `
            <div class="winery-card">
                <div class="winery-image" style="background-image: url('${winery.image}')"></div>
                <div class="winery-info">
                    <h5>${winery.name}</h5>
                    <div class="winery-actions">
                        <a href="${winery.location}" target="_blank" class="btn-icon" title="Ver Ubicación">
                            <i class="fa-solid fa-location-dot"></i> Ubicación
                        </a>
                        <a href="${winery.instagram}" target="_blank" class="btn-icon" title="Ver Instagram">
                            <i class="fa-brands fa-instagram"></i> Instagram
                        </a>
                    </div>
                </div>
            </div>
        `
			)
			.join("");

		modalBody.innerHTML = `
            <h2>${tour.title}</h2>
            <div class="modal-grid">
                <div class="modal-info">
                    <h3>Detalles de la Experiencia</h3>
                    <p class="modal-description">${tour.description}</p>
                    
                    <div class="wineries-section">
                        <h4><i class="fa-solid fa-wine-glass"></i> Bodegas a Visitar</h4>
                        <div class="wineries-grid">
                            ${wineriesHtml}
                        </div>
                    </div>

                    <div class="menu-section">
                        <h4><i class="fa-solid fa-utensils"></i> Menú Criollo 4 Pasos</h4>
                        <ul class="menu-steps">
                            ${menuStepsHtml}
                        </ul>
                    </div>
                </div>
                <div class="modal-image">
                    <img src="${tour.details.menuImage}" alt="Menú Criollo" loading="lazy">
                </div>
            </div>
        <div class="modal-actions">
             <button type="button" class="btn btn-whatsapp" onclick="showBookingPopup('${tour.title}', '${tour.price}', '${tour.priceCurrency}')">
                <i class="fa-brands fa-whatsapp"></i> Reservar por WhatsApp
             </button>
        </div>
        `;
		tourModal.classList.add("active");
	}

	// Booking popup for WhatsApp (exposed globally for onclick)
	window.showBookingPopup = function (tourTitle, price, currency) {
		// Create popup overlay
		const popup = document.createElement("div");
		popup.className = "booking-popup-overlay";
		popup.innerHTML = `
			<div class="booking-popup">
				<h3><i class="fa-brands fa-whatsapp"></i> Reservar por WhatsApp</h3>
				<p class="popup-tour-name">${tourTitle}</p>
				<div class="popup-form-group">
					<label>Cantidad de Personas</label>
					<input type="number" id="popupGuests" min="1" value="2" class="popup-input" />
				</div>
				<div class="popup-price-info">
					<span>Precio por persona:</span>
					<span class="price-value">$${price} ${
			currency && currency !== "undefined" ? currency : "ARS"
		}</span>
				</div>
				<div class="popup-price-total">
					<span>Precio estimado total:</span>
					<span class="total-value" id="popupTotal">Calculando...</span>
				</div>
				<div class="popup-actions">
					<button type="button" class="btn-secondary popup-cancel">Cancelar</button>
					<button type="button" class="btn btn-whatsapp popup-confirm">
						<i class="fa-brands fa-whatsapp"></i> Enviar Consulta
					</button>
				</div>
			</div>
		`;
		document.body.appendChild(popup);

		// Parse price (remove dots for thousands)
		const priceNumber = parseFloat(price.replace(/\./g, "").replace(",", "."));

		// Calculate and update total
		function updateTotal() {
			const guests =
				parseInt(document.getElementById("popupGuests").value) || 1;
			const total = priceNumber * guests;
			const formattedTotal = total.toLocaleString("es-AR");
			document.getElementById(
				"popupTotal"
			).textContent = `$${formattedTotal} ${currency}`;
		}
		updateTotal();

		// Update on guest change
		document
			.getElementById("popupGuests")
			.addEventListener("input", updateTotal);

		// Cancel button
		popup.querySelector(".popup-cancel").addEventListener("click", () => {
			popup.remove();
		});

		// Click outside to close
		popup.addEventListener("click", (e) => {
			if (e.target === popup) popup.remove();
		});

		// Confirm button - redirect to WhatsApp
		popup.querySelector(".popup-confirm").addEventListener("click", () => {
			const guests =
				parseInt(document.getElementById("popupGuests").value) || 1;
			const total = priceNumber * guests;
			const formattedTotal = total.toLocaleString("es-AR");
			const currencyText =
				currency && currency !== "undefined" ? currency : "ARS";

			// Build WhatsApp message with Unicode emojis
			const message =
				`\u00a1Hola! Me interesa reservar el tour:\n\n` +
				`\ud83c\udf77 *Tour:* ${tourTitle}\n` +
				`\ud83d\udc65 *Cantidad de personas:* ${guests}\n` +
				`\ud83d\udcb0 *Precio por persona:* $${price} ${currencyText}\n` +
				`\ud83d\udcb2 *Precio estimado total:* $${formattedTotal} ${currencyText}\n\n` +
				`\u00bfPodr\u00edan confirmar disponibilidad?`;

			// WhatsApp number (from the site)
			const phoneNumber = "5492613022740";
			const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
				message
			)}`;

			// Open WhatsApp
			window.open(whatsappUrl, "_blank");
			popup.remove();
		});
	};

	if (modalClose) {
		modalClose.addEventListener("click", () => {
			tourModal.classList.remove("active");
		});
	}

	if (tourModal) {
		tourModal.addEventListener("click", (e) => {
			if (e.target === tourModal) {
				tourModal.classList.remove("active");
			}
		});
	}
});
