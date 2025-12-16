document.addEventListener("DOMContentLoaded", function () {
	const bookingForm = document.getElementById("bookingForm");

	// Set minimum date to today
	const dateInput = document.getElementById("date");
	const today = new Date().toISOString().split("T")[0];
	dateInput.min = today;

	bookingForm.addEventListener("submit", function (e) {
		e.preventDefault();

		const date = document.getElementById("date").value;
		const language = document.getElementById("language").value;
		const guests = document.getElementById("guests").value;

		if (!date) {
			alert("Por favor selecciona una fecha.");
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
		});
	});
});
