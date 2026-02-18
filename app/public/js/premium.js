document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('premiumModal');
    const openBtn = document.getElementById('openPremiumModal');
    const closeBtn = document.getElementById('closePremiumModal');
    const cancelBtn = document.getElementById('cancelPremium');
    const form = document.getElementById('premiumForm');
    const cancelForm = document.getElementById('cancelPremiumForm');
    const methodSelect = document.getElementById('paymentMethod');
    const cardFields = document.getElementById('cardFields');
    const applePayFields = document.getElementById('applePayFields');
    const paypalFields = document.getElementById('paypalFields');

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    };

    if (openBtn) {
        openBtn.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (!auth) {
                showNotification('Debes iniciar sesión para suscribirte', 'error');
                window.location.href = 'login.html';
                return;
            }
            openModal();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });

    async function checkAuth() {
        try {
            const response = await fetch('../auth/session.php', {
                credentials: 'include'
            });
            const data = await response.json();
            return data.authenticated === true;
        } catch (error) {
            return false;
        }
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const payload = {
                fullName: form.fullName.value.trim(),
                email: form.email.value.trim(),
                method: form.paymentMethod.value,
            };

            if (!payload.method) {
                showNotification('Selecciona un método de pago', 'error');
                return;
            }

            try {
                const response = await fetch('../auth/premium.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('Todo OK. Ya eres Premium.', 'success');
                    closeModal();
                    if (openBtn) {
                        openBtn.textContent = 'Ya eres Premium';
                        openBtn.disabled = true;
                        openBtn.classList.add('disabled');
                    }
                } else {
                    showNotification(data.message || 'No se pudo completar el pago', 'error');
                }
            } catch (error) {
                showNotification('Error al procesar el pago', 'error');
            }
        });
    }

    if (cancelForm) {
        cancelForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = cancelForm.cancelEmail.value.trim();
            const termsAccepted = cancelForm.cancelTerms.checked;

            if (!termsAccepted) {
                showNotification('Debes aceptar los términos para cancelar', 'error');
                return;
            }

            try {
                const response = await fetch('../auth/premium.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel', email, accept_terms: true }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('Suscripción cancelada', 'success');
                    setTimeout(() => window.location.reload(), 600);
                } else {
                    showNotification(data.message || 'No se pudo cancelar', 'error');
                }
            } catch (error) {
                showNotification('Error al cancelar la suscripción', 'error');
            }
        });
    }

    const updatePaymentFields = () => {
        const method = methodSelect ? methodSelect.value : '';
        const show = (el, visible) => {
            if (!el) return;
            el.classList.toggle('is-visible', visible);
            el.setAttribute('aria-hidden', visible ? 'false' : 'true');
        };

        show(cardFields, method === 'card');
        show(applePayFields, method === 'apple_pay');
        show(paypalFields, method === 'paypal');
    };

    if (methodSelect) {
        methodSelect.addEventListener('change', updatePaymentFields);
        updatePaymentFields();
    }

    const appleBtn = document.getElementById('connectApplePay');
    if (appleBtn) {
        appleBtn.addEventListener('click', () => {
            showNotification('Apple Pay conectado (demo)', 'success');
        });
    }

    const paypalBtn = document.getElementById('connectPayPal');
    if (paypalBtn) {
        paypalBtn.addEventListener('click', () => {
            showNotification('PayPal conectado (demo)', 'success');
        });
    }
});
