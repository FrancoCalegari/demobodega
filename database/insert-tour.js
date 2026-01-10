/**
 * Script to insert a tour into Supabase database
 * Run with: node database/insert-tour.js
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

const tourData = {
	title: "Experiencia Completa Maipú",
	subtitle: "Tempus Alba + Esencia 1870",
	image: "assets/img/winery-2.jpg",
	price: "160.000",
	price_currency: "ARS",
	min_guests: 1,
	description:
		"Disfruta de un recorrido exclusivo por dos de las bodegas más emblemáticas de Maipú. Comenzaremos con una inmersión en la enología de Tempus Alba y culminaremos con una experiencia gastronómica inolvidable en los jardines de Esencia 1870.",
	duration: null,
};

const features = [
	"Transporte Privado (Ida y Vuelta)",
	"Visita y Degustación en Bodega Tempus Alba",
	"Visita, Degustación y Almuerzo de 4 Pasos en Bodega Esencia 1870",
];

const menuSteps = [
	"<strong>Primer Paso:</strong> Tapeo regional acompañado de un pan de focaccia. <br><em>Maridaje: Moscatuel blanco seco</em>",
	"<strong>Segundo Paso:</strong> 2 Empanadas de carne o 2 Empanadas de vegetales. <br><em>Maridaje: Malbec tinto dulce</em>",
	"<strong>Tercer Paso:</strong> Tira de asado con guarnición de papas rústicas o Lasagna vegetariana. <br><em>Maridaje: Blend de tintos 'Gran pueblo argentino'</em>",
	"<strong>Cuarto Paso:</strong> Flan con dulce de leche. <br><em>Maridaje: Torrontés blanco dulce</em>",
];

const wineries = [
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
];

const menuImage = "assets/img/menu-criollo.png";

async function insertTour() {
	console.log("🚀 Inserting tour into Supabase...\n");

	try {
		// 1. Insert main tour
		const { data: tour, error: tourError } = await supabase
			.from("tours")
			.insert(tourData)
			.select()
			.single();

		if (tourError) throw tourError;
		console.log("✅ Tour created:", tour.id);

		const tourId = tour.id;

		// 2. Insert features
		for (let i = 0; i < features.length; i++) {
			const { error } = await supabase.from("features").insert({
				tour_id: tourId,
				feature: features[i],
				display_order: i,
			});
			if (error) throw error;
		}
		console.log(`✅ ${features.length} features added`);

		// 3. Insert menu steps
		for (let i = 0; i < menuSteps.length; i++) {
			const { error } = await supabase.from("menu_steps").insert({
				tour_id: tourId,
				step: menuSteps[i],
				display_order: i,
			});
			if (error) throw error;
		}
		console.log(`✅ ${menuSteps.length} menu steps added`);

		// 4. Insert wineries
		for (let i = 0; i < wineries.length; i++) {
			const { error } = await supabase.from("wineries").insert({
				tour_id: tourId,
				name: wineries[i].name,
				image: wineries[i].image,
				location: wineries[i].location,
				instagram: wineries[i].instagram,
				display_order: i,
			});
			if (error) throw error;
		}
		console.log(`✅ ${wineries.length} wineries added`);

		// 5. Insert tour details (menu image)
		const { error: detailsError } = await supabase.from("tour_details").insert({
			tour_id: tourId,
			menu_image: menuImage,
		});
		if (detailsError) throw detailsError;
		console.log("✅ Tour details added");

		console.log("\n🎉 Tour inserted successfully!");
		console.log(`   ID: ${tourId}`);
		console.log(`   Title: ${tourData.title}`);
	} catch (error) {
		console.error("❌ Error inserting tour:", error);
	}
}

insertTour();
