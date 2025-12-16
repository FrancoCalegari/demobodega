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
		"assets/img/gallery/photo-1.jpg",
		"assets/img/gallery/photo-2.jpg",
		"assets/img/gallery/photo-3.jpg",
		"assets/img/gallery/photo1.png",
		"assets/img/gallery/photo2.png",
		"assets/img/gallery/photo3.png",
		"assets/img/gallery/photo4.png",
		"assets/img/gallery/photo5.png",
		"assets/img/gallery/photo6.png",
		"assets/img/gallery/photo7.png",
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
});
