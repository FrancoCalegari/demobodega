/**
 * Cloudinary Utilities Module
 *
 * Módulo reutilizable con funciones para trabajar con Cloudinary.
 * Incluye configuración, subida de archivos, eliminación y transformaciones.
 *
 * @requires cloudinary
 * @requires multer
 * @requires multer-storage-cloudinary
 */
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/**
 * Configura Cloudinary con las credenciales del entorno
 * Soporta tanto CLOUDINARY_URL como credenciales individuales
 *
 * @throws {Error} Si no están configuradas las credenciales de Cloudinary
 */
function configureCloudinary() {
	if (process.env.CLOUDINARY_URL) {
		// Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
		const url = process.env.CLOUDINARY_URL;
		const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);

		if (match) {
			cloudinary.config({
				cloud_name: match[3],
				api_key: match[1],
				api_secret: match[2],
				secure: true,
			});
		} else {
			throw new Error(
				"CLOUDINARY_URL format invalid. Expected: cloudinary://api_key:api_secret@cloud_name"
			);
		}
	} else if (
		process.env.CLOUDINARY_CLOUD_NAME &&
		process.env.CLOUDINARY_API_KEY &&
		process.env.CLOUDINARY_API_SECRET
	) {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
			secure: true,
		});
	} else {
		throw new Error(
			"Configura Cloudinary: CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET"
		);
	}
}

/**
 * Obtiene el nombre del cloud de Cloudinary configurado
 *
 * @returns {string} El nombre del cloud
 */
function getCloudName() {
	return (
		cloudinary.config().cloud_name ||
		process.env.CLOUDINARY_CLOUD_NAME ||
		process.env.CLOUDINARY_URL?.split("@")[1]?.split(".")[0] ||
		""
	);
}

/**
 * Crea un storage de Multer configurado para Cloudinary
 *
 * @param {string} folder - Carpeta en Cloudinary donde se guardarán los archivos
 * @returns {CloudinaryStorage} Storage configurado para Multer
 */
function createCloudinaryStorage(folder = "uploads") {
	return new CloudinaryStorage({
		cloudinary,
		params: async (req, file) => {
			const safeName = `${Date.now()}-${file.originalname}`
				.replace(/\s+/g, "-")
				.replace(/[^a-zA-Z0-9._-]/g, "");
			return {
				folder,
				resource_type: "auto",
				public_id: safeName,
			};
		},
	});
}

/**
 * Filtro de archivos para Multer
 * Permite solo imágenes, videos y audio en formatos específicos
 *
 * @param {Object} req - Request de Express
 * @param {Object} file - Archivo de Multer
 * @param {Function} cb - Callback
 */
function fileFilter(req, file, cb) {
	const allowedMimes = [
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
		"video/mp4",
		"video/webm",
		"video/quicktime", // .mov (iPhone)
		"audio/mpeg",
		"audio/wav",
		"audio/ogg",
	];

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				"Formato de archivo no permitido. Usa imágenes, videos o audio compatibles."
			),
			false
		);
	}
}

/**
 * Crea un middleware de Multer configurado para Cloudinary
 *
 * @param {string} folder - Carpeta en Cloudinary
 * @param {number} maxFileSize - Tamaño máximo de archivo en bytes (default: 100MB)
 * @returns {multer.Multer} Middleware de Multer configurado
 */
function createUploadMiddleware(
	folder = "uploads",
	maxFileSize = 100 * 1024 * 1024
) {
	const storage = createCloudinaryStorage(folder);
	return multer({
		storage,
		fileFilter,
		limits: {
			fileSize: maxFileSize,
		},
	});
}

/**
 * Mapea un mimetype a un tipo genérico (image, video, audio)
 *
 * @param {string} mimetype - MIME type del archivo
 * @returns {string} Tipo genérico: "image", "video" o "audio"
 */
function mapMimeToType(mimetype) {
	if (mimetype.startsWith("image")) return "image";
	if (mimetype.startsWith("video")) return "video";
	if (mimetype.startsWith("audio")) return "audio";
	return "image";
}

/**
 * Mapea el resourceType y format de Cloudinary a un tipo genérico
 *
 * @param {string} resourceType - Tipo de recurso de Cloudinary
 * @param {string} format - Formato del archivo
 * @returns {string} Tipo genérico: "image", "video" o "audio"
 */
function mapResourceToType(resourceType, format = "") {
	if (resourceType === "image") return "image";

	const lowerFormat = format.toLowerCase();
	const audioFormats = ["mp3", "wav", "ogg", "aac", "m4a"];

	if (resourceType === "video" && audioFormats.includes(lowerFormat))
		return "audio";
	if (resourceType === "video") return "video";

	return "image";
}

/**
 * Elimina un archivo de Cloudinary
 *
 * @param {string} publicId - Public ID del archivo en Cloudinary
 * @param {string} type - Tipo de archivo: "image", "video" o "audio"
 * @returns {Promise<void>}
 */
async function destroyCloudinaryAsset(publicId, type = "image") {
	if (!publicId) return;

	// En Cloudinary, audio se maneja como video
	const resourceType = type === "image" ? "image" : "video";

	try {
		await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
			invalidate: true,
		});
	} catch (err) {
		console.warn(
			`No se pudo eliminar ${publicId} en Cloudinary: ${err.message}`
		);
	}
}

/**
 * Genera una firma para subida directa desde el cliente a Cloudinary
 *
 * @param {string} folder - Carpeta de destino en Cloudinary
 * @param {string} publicId - (Opcional) Public ID específico para el archivo
 * @returns {Object} Datos de firma para la subida
 */
function generateUploadSignature(folder, publicId = null) {
	const timestamp = Math.round(Date.now() / 1000);
	const paramsToSign = { timestamp, folder };
	if (publicId) paramsToSign.public_id = publicId;

	const signature = cloudinary.utils.api_sign_request(
		paramsToSign,
		cloudinary.config().api_secret
	);

	return {
		signature,
		timestamp,
		folder,
		cloudName: getCloudName(),
		apiKey: cloudinary.config().api_key,
	};
}

/**
 * Sube un archivo a Cloudinary desde una URL
 * Útil para migrar imágenes existentes
 *
 * @param {string} url - URL del archivo a subir
 * @param {string} folder - Carpeta de destino en Cloudinary
 * @param {string} publicId - (Opcional) Public ID para el archivo
 * @returns {Promise<Object>} Resultado de la subida con secure_url y public_id
 */
async function uploadFromUrl(url, folder = "uploads", publicId = null) {
	const options = {
		folder,
		resource_type: "auto",
	};

	if (publicId) {
		options.public_id = publicId;
	} else {
		options.public_id = `upload-${Date.now()}`;
	}

	return await cloudinary.uploader.upload(url, options);
}

/**
 * Genera una URL de transformación de Cloudinary
 *
 * @param {string} publicId - Public ID del recurso
 * @param {Object} transformations - Transformaciones a aplicar
 * @returns {string} URL transformada
 */
function getTransformedUrl(publicId, transformations = {}) {
	return cloudinary.url(publicId, {
		...transformations,
		secure: true,
	});
}

module.exports = {
	// Configuración
	configureCloudinary,
	getCloudName,

	// Multer y Subida
	createCloudinaryStorage,
	createUploadMiddleware,
	fileFilter,

	// Mapeo de tipos
	mapMimeToType,
	mapResourceToType,

	// Gestión de archivos
	destroyCloudinaryAsset,
	uploadFromUrl,

	// Subida directa desde cliente
	generateUploadSignature,

	// Transformaciones
	getTransformedUrl,

	// Acceso directo a la instancia de Cloudinary
	cloudinary,
};
