document.addEventListener("DOMContentLoaded", function () {
	const bookingForm = document.getElementById("bookingForm");

	// Set minimum date to today
	// Intelligent Date Selection
	const dateInput = document.getElementById("date");
	const now = new Date();
	const currentHour = now.getHours();

	// If it's past 12 PM, set default/min date to tomorrow
	if (currentHour >= 12) {
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowString = tomorrow.toISOString().split("T")[0];
		dateInput.value = tomorrowString;
		dateInput.min = tomorrowString;
	} else {
		// Otherwise set to today
		const todayString = now.toISOString().split("T")[0];
		dateInput.value = todayString;
		dateInput.min = todayString;
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

	// Load Tours
	const tours = [
		{
			id: 1,
			title: "Experiencia Completa Maipú",
			subtitle: "Tempus Alba + Esencia 1870",
			image: "assets/img/winery-2.jpg",
			price: "160.000",
			priceCurrency: "ARS",
			minGuests: 1,
			features: [
				"Transporte Privado (Ida y Vuelta)",
				"Visita y Degustación en Bodega Tempus Alba",
				"Visita, Degustación y Almuerzo de 4 Pasos en Bodega Esencia 1870",
			],
			description:
				"Disfruta de un recorrido exclusivo por dos de las bodegas más emblemáticas de Maipú. Comenzaremos con una inmersión en la enología de Tempus Alba y culminaremos con una experiencia gastronómica inolvidable en los jardines de Esencia 1870.",
			details: {
				menuImage: "assets/img/menu-criollo.png",
				menuSteps: [
					"<strong>Primer Paso:</strong> Tapeo regional acompañado de un pan de focaccia. <br><em>Maridaje: Moscatuel blanco seco</em>",
					"<strong>Segundo Paso:</strong> 2 Empanadas de carne o 2 Empanadas de vegetales. <br><em>Maridaje: Malbec tinto dulce</em>",
					"<strong>Tercer Paso:</strong> Tira de asado con guarnición de papas rústicas o Lasagna vegetariana. <br><em>Maridaje: Blend de tintos 'Gran pueblo argentino'</em>",
					"<strong>Cuarto Paso:</strong> Flan con dulce de leche. <br><em>Maridaje: Torrontés blanco dulce</em>",
				],
				wineries: [
					{
						name: "Bodega Tempus Alba",
						image: "assets/img/winery-1.jpg",
						location: "https://maps.app.goo.gl/ScDtwq5gGPW79yAC8",
						instagram: "https://www.instagram.com/tempusalba/",
					},
					{
						name: "Bodega Esencia 1870",
						image: "assets/img/winery-2.jpg",
						location: "https://maps.app.goo.gl/LxXovkTsjzkbWiuy7",
						instagram: "https://www.instagram.com/bodegaesencia1870/",
					},
				],
			},
		},
	];

	const toursContainer = document.getElementById("tours-container");
	if (toursContainer) {
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

			card.innerHTML = `
                <div class="card-image" style="background-image: url('${tour.image}')">
                    <div class="badge">Paquete Destacado</div>
                </div>
                <div class="card-content">
                    <h3>${tour.title}</h3>
                    <p class="tour-subtitle">${tour.subtitle}</p>
                    <p>${tour.description}</p>
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
		document.querySelectorAll(".btn-tour-details").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const tourId = parseInt(e.target.getAttribute("data-id"));
				const tour = tours.find((t) => t.id === tourId);
				if (tour) openTourModal(tour);
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
                 <a href="#reservas" class="btn btn-whatsapp start-booking" onclick="document.getElementById('tourModal').classList.remove('active')">
                    <i class="fa-brands fa-whatsapp"></i> Reservar Ahora
                 </a>
            </div>
        `;
		tourModal.classList.add("active");
	}

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
