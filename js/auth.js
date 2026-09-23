/**
 * LICORES MEGA CRM - CONTROLADOR DE AUTENTICACIÓN Y LANDING PAGE (AUTH.JS)
 * Manejo de la animación del logo, pestañas de login/registro, validaciones,
 * persistencia de usuarios y sincronización con el CRM.
 */

(function () {
  'use strict';

  // Claves de almacenamiento local
  const USERS_STORAGE_KEY = 'crm_auth_users';
  const CURRENT_USER_KEY = 'crm_current_user';
  const CRM_DB_KEY = 'crm_licorera_db_v3';

  // Usuarios predeterminados para pruebas inmediatas
  const DEFAULT_USERS = [
    {
      id: 'usr_admin',
      nombres: 'Carlos Mendoza',
      correo: 'admin@licoresmega.com',
      password: 'admin123',
      direccion: 'Av. Los Guaytambos 124 y Miraflores, Ambato',
      telefono: '+593 98 765 4321',
      rol: 'Administrador General',
      fecha_registro: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'usr_comercial',
      nombres: 'Ana María López',
      correo: 'ventas@licoresmega.com',
      password: 'mega2026',
      direccion: 'Calle Bolívar 450 y Montalvo, Centro',
      telefono: '+593 99 876 5432',
      rol: 'Asesor Comercial',
      fecha_registro: '2026-02-15T09:30:00.000Z'
    }
  ];

  // Gestor de Usuarios
  class AuthStore {
    static getUsers() {
      try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (!stored) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
          return DEFAULT_USERS;
        }
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error al leer usuarios de AuthStore:', e);
        return DEFAULT_USERS;
      }
    }

    static saveUser(user) {
      const users = this.getUsers();
      users.push(user);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    static findByEmail(email) {
      const users = this.getUsers();
      return users.find(u => u.correo.trim().toLowerCase() === email.trim().toLowerCase());
    }

    static getCurrentUser() {
      try {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }

    static setCurrentUser(user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    static clearCurrentUser() {
      localStorage.removeItem(CURRENT_USER_KEY);
    }

    // Sincroniza al nuevo usuario con el directorio de clientes de la base de datos del CRM
    static syncWithCRMClients(newUser) {
      try {
        const rawDB = localStorage.getItem(CRM_DB_KEY);
        if (!rawDB) return;
        const db = JSON.parse(rawDB);
        if (!db.clients) db.clients = [];

        // Verifica si ya existe por correo
        const exists = db.clients.some(c => (c.email || '').toLowerCase() === newUser.correo.toLowerCase());
        if (!exists) {
          const newClientId = 100 + db.clients.length + 1;
          const newClient = {
            id: newClientId,
            nombre_razon_social: newUser.nombres,
            nif_cif: 'REG-' + Date.now().toString().slice(-6),
            fecha_nacimiento: '1995-01-01',
            contacto_principal: newUser.nombres,
            email: newUser.correo,
            telefono: newUser.telefono,
            direccion: newUser.direccion,
            segmento: 'Minorista',
            notas_internas: 'Cliente registrado desde la Landing Page oficial de Licores Mega.'
          };
          db.clients.unshift(newClient);
          localStorage.setItem(CRM_DB_KEY, JSON.stringify(db));
        }
      } catch (e) {
        console.error('Error sincronizando cliente con el CRM:', e);
      }
    }
  }

  // Notificaciones Toast
  function showToast(title, message, type = 'success') {
    const container = document.getElementById('auth-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `auth-toast toast-${type}`;

    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
    const iconColor = type === 'success' ? 'text-emerald-400' : 'text-mega-500';

    toast.innerHTML = `
      <div class="mt-0.5 shrink-0 ${iconColor}">
        <i data-lucide="${iconName}" class="w-5 h-5"></i>
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-bold uppercase tracking-wider text-white">${title}</h4>
        <p class="text-xs text-gray-300 mt-0.5 leading-snug">${message}</p>
      </div>
      <button class="text-gray-400 hover:text-white p-1 ml-1" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }

  // Controlador de la Landing Page
  class LandingPageApp {
    constructor() {
      this.introOverlay = document.getElementById('logo-intro-overlay');
      this.introTimer = null;
      this.init();
    }

    init() {
      AuthStore.getUsers(); // Asegura usuarios iniciales
      this.setupIntroAnimation();
      this.setupTabs();
      this.setupPasswordToggles();
      this.setupPasswordStrengthMeter();
      this.setupForms();
      this.setupDemoButtons();
      this.checkActiveSession();
      if (window.lucide) window.lucide.createIcons();
    }

    // 1. Manejo de la Animación de Intro del Logo
    setupIntroAnimation() {
      if (!this.introOverlay) return;

      const skipBtn = document.getElementById('btn-skip-intro');
      const replayBtn = document.getElementById('btn-replay-intro');

      // Ocultar automáticamente después de la animación (~2.5s)
      this.introTimer = setTimeout(() => {
        this.hideIntro();
      }, 2600);

      // Saltar con botón
      if (skipBtn) {
        skipBtn.addEventListener('click', () => this.hideIntro());
      }

      // Saltar con tecla ESC
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.introOverlay.classList.contains('hidden-intro')) {
          this.hideIntro();
        }
      });

      // Botón para repetir la intro en cualquier momento
      if (replayBtn) {
        replayBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.replayIntro();
        });
      }
    }

    hideIntro() {
      if (this.introTimer) clearTimeout(this.introTimer);
      if (this.introOverlay) {
        this.introOverlay.classList.add('hidden-intro');
      }
    }

    replayIntro() {
      if (!this.introOverlay) return;
      this.introOverlay.classList.remove('hidden-intro');

      // Reinicia animaciones de los elementos clave de la intro
      const isoBox = this.introOverlay.querySelector('.intro-isotipo-box');
      const titles = this.introOverlay.querySelectorAll('.intro-title, .intro-tagline, .intro-subtitle');
      const progress = this.introOverlay.querySelector('.intro-progress-fill');

      if (isoBox) {
        isoBox.style.animation = 'none';
        void isoBox.offsetWidth;
        isoBox.style.animation = '';
      }
      titles.forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
      if (progress) {
        progress.style.animation = 'none';
        void progress.offsetWidth;
        progress.style.animation = '';
      }

      if (this.introTimer) clearTimeout(this.introTimer);
      this.introTimer = setTimeout(() => {
        this.hideIntro();
      }, 2600);
    }

    // 2. Conmutador de Pestañas (Iniciar Sesión vs Registrarse)
    setupTabs() {
      const tabLogin = document.getElementById('tab-login-btn');
      const tabRegister = document.getElementById('tab-register-btn');
      const formLogin = document.getElementById('form-login');
      const formRegister = document.getElementById('form-register');
      const switchLinks = document.querySelectorAll('.switch-auth-tab');

      if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

      const switchTo = (tab) => {
        if (tab === 'login') {
          tabLogin.classList.add('active');
          tabRegister.classList.remove('active');
          formLogin.classList.remove('hidden');
          formRegister.classList.add('hidden');
        } else {
          tabRegister.classList.add('active');
          tabLogin.classList.remove('active');
          formRegister.classList.remove('hidden');
          formLogin.classList.add('hidden');
        }
        if (window.lucide) window.lucide.createIcons();
      };

      tabLogin.addEventListener('click', () => switchTo('login'));
      tabRegister.addEventListener('click', () => switchTo('register'));

      switchLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = link.getAttribute('data-target');
          switchTo(target);
          const authCard = document.getElementById('auth-card-section');
          if (authCard) {
            authCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });
    }

    // 3. Ojo de mostrar / ocultar contraseña
    setupPasswordToggles() {
      document.querySelectorAll('.auth-toggle-pwd').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target');
          const input = document.getElementById(targetId);
          if (!input) return;

          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';

          const icon = btn.querySelector('i');
          if (icon) {
            icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
            if (window.lucide) window.lucide.createIcons();
          }
        });
      });
    }

    // 4. Medidor dinámico de fuerza de contraseña
    setupPasswordStrengthMeter() {
      const regPwd = document.getElementById('reg-password');
      const bars = [
        document.getElementById('pwd-bar-1'),
        document.getElementById('pwd-bar-2'),
        document.getElementById('pwd-bar-3')
      ];
      const label = document.getElementById('pwd-strength-text');

      if (!regPwd || !bars[0] || !bars[1] || !bars[2] || !label) return;

      regPwd.addEventListener('input', () => {
        const val = regPwd.value;
        if (!val) {
          bars.forEach(b => b.style.backgroundColor = 'rgba(255, 255, 255, 0.08)');
          label.textContent = 'Seguridad requerida';
          label.className = 'text-[11px] text-gray-500';
          return;
        }

        let score = 0;
        if (val.length >= 6) score++;
        if (/[A-Z]/.test(val) || /[0-9]/.test(val)) score++;
        if (val.length >= 8 && /[^A-Za-z0-9]/.test(val)) score++;

        bars.forEach(b => b.style.backgroundColor = 'rgba(255, 255, 255, 0.08)');

        if (score === 1) {
          bars[0].style.backgroundColor = '#f4060e';
          label.textContent = 'Contraseña débil';
          label.className = 'text-[11px] text-mega-400 font-medium';
        } else if (score === 2) {
          bars[0].style.backgroundColor = '#f59e0b';
          bars[1].style.backgroundColor = '#f59e0b';
          label.textContent = 'Seguridad media';
          label.className = 'text-[11px] text-amber-400 font-medium';
        } else if (score >= 3) {
          bars[0].style.backgroundColor = '#10b981';
          bars[1].style.backgroundColor = '#10b981';
          bars[2].style.backgroundColor = '#10b981';
          label.textContent = 'Contraseña robusta';
          label.className = 'text-[11px] text-emerald-400 font-semibold';
        }
      });
    }

    // 5. Formularios de Login y Registro
    setupForms() {
      const formLogin = document.getElementById('form-login');
      const formRegister = document.getElementById('form-register');

      // --- INICIAR SESIÓN (Correo y Contraseña) ---
      if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = (document.getElementById('login-email')?.value || '').trim();
          const password = (document.getElementById('login-password')?.value || '').trim();

          if (!email || !password) {
            showToast('Campos Incompletos', 'Por favor ingresa tu correo y contraseña.', 'error');
            return;
          }

          const user = AuthStore.findByEmail(email);
          if (!user || user.password !== password) {
            showToast('Credenciales Inválidas', 'El correo o la contraseña son incorrectos.', 'error');
            return;
          }

          // Guardar sesión activa
          const sessionUser = {
            id: user.id,
            nombres: user.nombres,
            correo: user.correo,
            direccion: user.direccion || '',
            telefono: user.telefono || '',
            rol: user.rol || 'Usuario',
            loginAt: new Date().toISOString()
          };
          AuthStore.setCurrentUser(sessionUser);

          showToast('¡Bienvenido de nuevo!', `Accediendo al CRM como ${user.nombres}...`, 'success');

          const submitBtn = formLogin.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
              <span class="inline-block animate-spin mr-2">⟳</span>
              <span>Ingresando al CRM...</span>
            `;
          }

          setTimeout(() => {
            window.location.href = 'index.html';
          }, 850);
        });
      }

      // --- REGISTRO (Nombres, Correo, Contraseña, Dirección y Número de Teléfono) ---
      if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
          e.preventDefault();
          const nombres = (document.getElementById('reg-names')?.value || '').trim();
          const correo = (document.getElementById('reg-email')?.value || '').trim();
          const password = (document.getElementById('reg-password')?.value || '').trim();
          const direccion = (document.getElementById('reg-address')?.value || '').trim();
          const telefono = (document.getElementById('reg-phone')?.value || '').trim();
          const checkAge = document.getElementById('reg-check-age');

          // Validaciones obligatorias solicitadas por el usuario
          if (!nombres) {
            showToast('Nombre requerido', 'Por favor ingresa tus nombres y apellidos completos.', 'error');
            return;
          }
          if (!correo || !correo.includes('@') || !correo.includes('.')) {
            showToast('Correo no válido', 'Ingresa una dirección de correo electrónico válida.', 'error');
            return;
          }
          if (!password || password.length < 5) {
            showToast('Contraseña corta', 'La contraseña debe tener al menos 5 caracteres.', 'error');
            return;
          }
          if (!direccion) {
            showToast('Dirección requerida', 'Ingresa tu dirección de despacho o domicilio.', 'error');
            return;
          }
          if (!telefono) {
            showToast('Teléfono requerido', 'Ingresa tu número de teléfono de contacto.', 'error');
            return;
          }
          if (checkAge && !checkAge.checked) {
            showToast('Mayoría de edad (+18)', 'Debes confirmar que eres mayor de 18 años para operar con licores.', 'error');
            return;
          }

          // Verificar duplicados
          if (AuthStore.findByEmail(correo)) {
            showToast('Correo ya registrado', 'Ya existe una cuenta con este correo. Por favor inicia sesión.', 'error');
            return;
          }

          // Crear nuevo usuario
          const newUser = {
            id: 'usr_' + Date.now().toString(36),
            nombres,
            correo,
            password,
            direccion,
            telefono,
            rol: 'Cliente Corporativo',
            fecha_registro: new Date().toISOString()
          };

          // Guardar en repositorio de usuarios
          AuthStore.saveUser(newUser);

          // Sincronizar automáticamente con el directorio de clientes del CRM
          AuthStore.syncWithCRMClients(newUser);

          // Iniciar sesión inmediatamente
          AuthStore.setCurrentUser({
            id: newUser.id,
            nombres: newUser.nombres,
            correo: newUser.correo,
            direccion: newUser.direccion,
            telefono: newUser.telefono,
            rol: newUser.rol,
            loginAt: new Date().toISOString()
          });

          showToast('¡Registro Exitoso!', `Bienvenido a LICORES MEGA, ${nombres}. Ingresando al CRM...`, 'success');

          const submitBtn = formRegister.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
              <span class="inline-block animate-spin mr-2">⟳</span>
              <span>Configurando tu espacio...</span>
            `;
          }

          setTimeout(() => {
            window.location.href = 'index.html';
          }, 950);
        });
      }
    }

    // 6. Botones de acceso rápido Demo (1 Clic)
    setupDemoButtons() {
      const demoAdmin = document.getElementById('btn-demo-admin');
      const demoSales = document.getElementById('btn-demo-sales');

      if (demoAdmin) {
        demoAdmin.addEventListener('click', (e) => {
          e.preventDefault();
          const emailInput = document.getElementById('login-email');
          const pwdInput = document.getElementById('login-password');
          if (emailInput && pwdInput) {
            emailInput.value = 'admin@licoresmega.com';
            pwdInput.value = 'admin123';
            showToast('Credenciales Demo Cargadas', 'Administrador General listo. Haz clic en "Ingresar al CRM" o presiona Enter.', 'success');
          }
        });
      }

      if (demoSales) {
        demoSales.addEventListener('click', (e) => {
          e.preventDefault();
          const emailInput = document.getElementById('login-email');
          const pwdInput = document.getElementById('login-password');
          if (emailInput && pwdInput) {
            emailInput.value = 'ventas@licoresmega.com';
            pwdInput.value = 'mega2026';
            showToast('Credenciales Demo Cargadas', 'Asesor Comercial listo. Haz clic en "Ingresar al CRM".', 'success');
          }
        });
      }
    }

    // 7. Revisa si hay una sesión activa para mostrar aviso amigable
    checkActiveSession() {
      const currentUser = AuthStore.getCurrentUser();
      const banner = document.getElementById('active-session-banner');
      const userNameSpan = document.getElementById('active-session-user');

      if (currentUser && banner && userNameSpan) {
        userNameSpan.textContent = currentUser.nombres;
        banner.classList.remove('hidden');

        const btnEnterDirect = document.getElementById('btn-enter-active-crm');
        if (btnEnterDirect) {
          btnEnterDirect.addEventListener('click', () => {
            window.location.href = 'index.html';
          });
        }

        const btnLogoutBanner = document.getElementById('btn-logout-banner');
        if (btnLogoutBanner) {
          btnLogoutBanner.addEventListener('click', () => {
            AuthStore.clearCurrentUser();
            banner.classList.add('hidden');
            showToast('Sesión Finalizada', 'Has cerrado tu sesión correctamente.', 'success');
          });
        }
      }
    }
  }

  // Exportar globalmente
  window.AuthStore = AuthStore;
  window.showAuthToast = showToast;

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    new LandingPageApp();
  });
})();
