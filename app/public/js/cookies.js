/**
 * Sistema de Cookies Banner
 * Muestra un aviso de cookies y gestiona el consentimiento
 */

class CookiesManager {
	constructor() {
		this.cookieName = 'aje10_cookies_consent';
		this.cookieExpiry = 365; // días
		this.init();
	}

	init() {
		// Esperar a que el DOM esté cargado
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.checkConsent());
		} else {
			this.checkConsent();
		}
	}

	checkConsent() {
		// Verificar si ya hay consentimiento
		// MODO DEBUG: Descomenta la siguiente línea para que siempre aparezca
		// localStorage.removeItem(this.cookieName);
		
		if (!this.hasConsent()) {
			this.showBanner();
			this.setCookies(); // Establecer cookies técnicas necesarias
		} else {
			this.setCookies();
		}
	}

	hasConsent() {
		const consent = localStorage.getItem(this.cookieName);
		return consent === 'accepted';
	}

	showBanner() {
		// Crear el HTML del banner
		const banner = document.createElement('div');
		banner.className = 'cookies-banner';
		banner.id = 'cookiesBanner';
		banner.innerHTML = `
			<div class="cookies-content">
				<h3>🍪 Cookies & Privacidad</h3>
				<p>
					Usamos cookies para mejorar tu experiencia, recordar tus preferencias y analizar el uso de la web.
					Al continuar, aceptas nuestra 
					<a href="https://ejemplo.com/politica-cookies" target="_blank">política de cookies</a>.
				</p>
			</div>
			<div class="cookies-buttons">
				<button class="cookies-btn cookies-accept" id="acceptCookies">✓ Aceptar</button>
				<button class="cookies-btn cookies-reject" id="rejectCookies">✕ Rechazar</button>
			</div>
		`;

		// Agregar al DOM
		document.body.appendChild(banner);

		// Agregar listeners
		document.getElementById('acceptCookies').addEventListener('click', () => this.acceptCookies());
		document.getElementById('rejectCookies').addEventListener('click', () => this.rejectCookies());
	}

	acceptCookies() {
		localStorage.setItem(this.cookieName, 'accepted');
		this.hideBanner();
		this.setCookies();
		console.log('✓ Cookies aceptadas');
	}

	rejectCookies() {
		localStorage.setItem(this.cookieName, 'rejected');
		this.hideBanner();
		console.log('✕ Cookies rechazadas');
	}

	hideBanner() {
		const banner = document.getElementById('cookiesBanner');
		if (banner) {
			banner.classList.add('hidden');
			setTimeout(() => banner.remove(), 400);
		}
	}

	setCookies() {
		// Cookie de sesión
		this.setSessionCookie('session_id', this.generateSessionId(), 24);
		
		// Cookie de preferencias (tema)
		const theme = localStorage.getItem('theme') || 'dark';
		this.setCookie('theme', theme, this.cookieExpiry);
		
		// Cookie de autorización si hay sesión activa
		if (typeof userId !== 'undefined' && userId) {
			this.setCookie('user_session', 'active', 1);
		}
	}

	setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = 'expires=' + date.toUTCString();
		document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
		console.log(`🍪 Cookie establecida: ${name}`);
	}

	setSessionCookie(name, value, hours) {
		const date = new Date();
		date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
		const expires = 'expires=' + date.toUTCString();
		document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict`;
	}

	getCookie(name) {
		const nameEQ = name + '=';
		const cookies = document.cookie.split(';');
		for (let cookie of cookies) {
			cookie = cookie.trim();
			if (cookie.indexOf(nameEQ) === 0) {
				return cookie.substring(nameEQ.length);
			}
		}
		return null;
	}

	deleteCookie(name) {
		this.setCookie(name, '', -1);
	}

	generateSessionId() {
		return 'aje10_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	}

	// Método para limpiar todas las cookies (útil para logout)
	clearAllCookies() {
		const cookies = document.cookie.split(';');
		for (let cookie of cookies) {
			const cookieName = cookie.split('=')[0].trim();
			this.deleteCookie(cookieName);
		}
		localStorage.removeItem(this.cookieName);
		console.log('🧹 Todas las cookies han sido eliminadas');
	}

	// Método para obtener el estado de consentimiento
	getConsentStatus() {
		return localStorage.getItem(this.cookieName) || 'unknown';
	}
}

// Inicializar el gestor de cookies cuando se carga la página
const cookiesManager = new CookiesManager();
