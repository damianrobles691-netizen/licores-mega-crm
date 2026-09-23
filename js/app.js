/**
 * CRM LICORERA PREMIUM - APLICACIÓN PRINCIPAL (APP.JS)
 * Control de vistas, eventos, lógica de negocio y gráficos interactivos
 * Basado en las 7 categorías y formularios del Informe de la Licorera
 * Persistencia en almacenamiento local rápido y confiable (LocalStorageStore)
 */

class LicoreraCRMApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.viewMode = 'cards'; // 'cards' o 'table' para productos
    this.chartChannels = null;
    this.chartProfitability = null;
    this.currency = 'EUR';
    this.currencySymbol = '€';
    this.vatRate = 21;

    // Cache de datos
    this.clients = [];
    this.products = [];
    this.orders = [];
    this.tickets = [];

    this.init();
  }

  async init() {
    this.initAuthSession();
    this.loadSettings();
    this.refreshData();
    this.bindEvents();
    this.renderDashboard();
    this.renderClientsTable();
    this.renderProductsView();
    this.renderOrdersTable();
    this.renderTicketsTable();
    this.renderIcons();
  }

  // Inicialización de la sesión de autenticación del CRM
  initAuthSession() {
    let currentUser = null;
    try {
      const stored = localStorage.getItem('crm_current_user');
      currentUser = stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Error leyendo usuario:', e);
    }

    // Si no hay usuario y no es modo invitado explícito, redirigir a landing.html
    const urlParams = new URLSearchParams(window.location.search);
    const isGuest = urlParams.get('guest') === 'true';

    if (!currentUser && !isGuest) {
      window.location.href = 'landing.html';
      return;
    }

    // Renderizar datos del usuario en la barra superior si existe
    if (currentUser) {
      const avatarEl = document.getElementById('topbar-user-avatar');
      const nameEl = document.getElementById('topbar-user-name');
      const roleEl = document.getElementById('topbar-user-role');

      if (nameEl) nameEl.textContent = currentUser.nombres || 'Usuario';
      if (roleEl) roleEl.textContent = currentUser.rol || 'Cliente Corporativo';
      if (avatarEl) {
        const parts = (currentUser.nombres || 'U').trim().split(' ');
        const initials = parts.length > 1 
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }
    }

    // Vincular botón de cerrar sesión
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('crm_current_user');
        window.location.href = 'landing.html';
      });
    }
  }

  renderIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Carga configuración inicial de moneda e impuestos
  loadSettings() {
    const data = window.localCRMStore.getAll();
    if (data.settings) {
      this.currency = data.settings.currency || 'EUR';
      this.currencySymbol = this.currency === 'EUR' ? '€' : '$';
      this.vatRate = data.settings.vatRate !== undefined ? Number(data.settings.vatRate) : 21;
    }

    const curSelect = document.getElementById('global-currency-select');
    if (curSelect) curSelect.value = this.currency;

    const vatSelect = document.getElementById('global-vat-select');
    if (vatSelect) vatSelect.value = String(this.vatRate);

    this.updateCurrencySymbolsInUI();
  }

  updateCurrencySymbolsInUI() {
    document.querySelectorAll('.currency-symbol').forEach(el => {
      el.textContent = this.currencySymbol;
    });
  }

  formatMoney(amount) {
    const num = Number(amount) || 0;
    const formatted = num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return this.currency === 'EUR' ? `€${formatted}` : `$${formatted}`;
  }

  // Utilidad para debouncing en búsquedas en tiempo real
  debounce(func, wait = 150) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Recarga todos los datos desde el almacenamiento local
  refreshData() {
    this.clients = window.localCRMStore.getClients();
    this.products = window.localCRMStore.getProducts();
    this.orders = window.localCRMStore.getOrders();
    this.tickets = window.localCRMStore.getTickets();
  }

  // Vinculación de eventos de la interfaz
  bindEvents() {
    // 1. Navegación en sidebar
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Sidebar móvil toggle
    const mobileOpen = document.getElementById('mobile-open-sidebar');
    const mobileClose = document.getElementById('mobile-close-sidebar');
    const sidebar = document.getElementById('sidebar');

    if (mobileOpen && sidebar) {
      mobileOpen.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
      });
    }
    if (mobileClose && sidebar) {
      mobileClose.addEventListener('click', () => {
        sidebar.classList.add('hidden');
      });
    }

    // Botón rápido en sidebar para Respaldos / Ajustes
    const btnQuickConfig = document.getElementById('btn-quick-config-settings');
    if (btnQuickConfig) {
      btnQuickConfig.addEventListener('click', () => this.switchTab('settings'));
    }

    // Botón rápido nuevo pedido
    const btnQuickOrder = document.getElementById('btn-quick-new-order');
    if (btnQuickOrder) {
      btnQuickOrder.addEventListener('click', () => this.openOrderModal());
    }

    // Cambio global de moneda e IVA
    const curSelect = document.getElementById('global-currency-select');
    if (curSelect) {
      curSelect.addEventListener('change', (e) => {
        this.currency = e.target.value;
        this.currencySymbol = this.currency === 'EUR' ? '€' : '$';
        const data = window.localCRMStore.getAll();
        data.settings.currency = this.currency;
        data.settings.currencySymbol = this.currencySymbol;
        window.localCRMStore.saveAll(data);
        this.updateCurrencySymbolsInUI();
        this.renderCurrentView();
        this.showToast(`Moneda cambiada a ${this.currency}`, 'info');
      });
    }

    const vatSelect = document.getElementById('global-vat-select');
    if (vatSelect) {
      vatSelect.addEventListener('change', (e) => {
        this.vatRate = Number(e.target.value);
        const data = window.localCRMStore.getAll();
        data.settings.vatRate = this.vatRate;
        window.localCRMStore.saveAll(data);
        this.renderCurrentView();
        this.showToast(`Tasa de IVA global actualizada a ${this.vatRate}%`, 'info');
      });
    }

    // 2. Filtros de Clientes (con debounce)
    const clientSearch = document.getElementById('clients-search-input');
    if (clientSearch) clientSearch.addEventListener('input', this.debounce(() => this.renderClientsTable(), 150));
    const clientSegment = document.getElementById('clients-segment-filter');
    if (clientSegment) clientSegment.addEventListener('change', () => this.renderClientsTable());
    const btnNewClient = document.getElementById('btn-open-new-client-modal');
    if (btnNewClient) btnNewClient.addEventListener('click', () => this.openClientModal());
    const btnExportClients = document.getElementById('btn-export-clients-csv');
    if (btnExportClients) {
      btnExportClients.addEventListener('click', () => {
        window.localCRMStore.exportClientsCsv();
        this.showToast('Descargando archivo CSV de clientes para Excel...', 'info');
      });
    }

    // 3. Filtros de Productos y Toggle de Vistas (con debounce)
    const prodSearch = document.getElementById('products-search-input');
    if (prodSearch) prodSearch.addEventListener('input', this.debounce(() => this.renderProductsView(), 150));
    const prodCat = document.getElementById('products-category-filter');
    if (prodCat) prodCat.addEventListener('change', () => this.renderProductsView());
    const prodStock = document.getElementById('products-stock-filter');
    if (prodStock) prodStock.addEventListener('change', () => this.renderProductsView());
    const prodRot = document.getElementById('products-rotation-filter');
    if (prodRot) prodRot.addEventListener('change', () => this.renderProductsView());
    const btnExportProducts = document.getElementById('btn-export-products-csv');
    if (btnExportProducts) {
      btnExportProducts.addEventListener('click', () => {
        window.localCRMStore.exportProductsCsv();
        this.showToast('Descargando catálogo completo de licores en CSV...', 'info');
      });
    }

    const btnViewCards = document.getElementById('btn-view-cards');
    const btnViewTable = document.getElementById('btn-view-table');
    if (btnViewCards && btnViewTable) {
      btnViewCards.addEventListener('click', () => {
        this.viewMode = 'cards';
        btnViewCards.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-mega-500/20 text-mega-400 border border-mega-500/30';
        btnViewTable.className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white';
        document.getElementById('products-cards-container').classList.remove('hidden');
        document.getElementById('products-table-container').classList.add('hidden');
        this.renderProductsView();
      });

      btnViewTable.addEventListener('click', () => {
        this.viewMode = 'table';
        btnViewTable.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-mega-500/20 text-mega-400 border border-mega-500/30';
        btnViewCards.className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white';
        document.getElementById('products-cards-container').classList.add('hidden');
        document.getElementById('products-table-container').classList.remove('hidden');
        this.renderProductsView();
      });
    }

    const btnNewProd = document.getElementById('btn-open-new-product-modal');
    if (btnNewProd) btnNewProd.addEventListener('click', () => this.openProductModal());

    // Pestañas de las 7 Categorías del Modal de Producto
    document.querySelectorAll('.ptab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-ptab');
        document.querySelectorAll('.ptab-btn').forEach(b => {
          b.classList.remove('text-mega-400', 'border-b-2', 'border-mega-500', 'text-amber-400', 'border-amber-400');
          b.classList.add('text-gray-400');
        });
        btn.classList.remove('text-gray-400');
        btn.classList.add('text-mega-400', 'border-b-2', 'border-mega-500');

        document.querySelectorAll('.ptab-content').forEach(c => c.classList.add('hidden'));
        const targetContent = document.getElementById(`ptab-${targetId}`);
        if (targetContent) targetContent.classList.remove('hidden');
      });
    });

    // Calculadora dinámica de Margen de Utilidad
    const prodPrice = document.getElementById('prod-precio-venta');
    const prodCost = document.getElementById('prod-costo');
    if (prodPrice && prodCost) {
      const calcMargin = () => {
        const price = Math.max(0, parseFloat(prodPrice.value) || 0);
        const cost = Math.max(0, parseFloat(prodCost.value) || 0);
        const profit = price - cost;
        const marginPct = price > 0 ? ((profit / price) * 100).toFixed(2) : '0.00';
        const liveText = document.getElementById('live-margin-text');
        if (liveText) {
          liveText.textContent = `Utilidad: ${this.formatMoney(profit)} / ${marginPct}% margen`;
        }
        const utilUnit = document.getElementById('prod-utilidad-unidad');
        if (utilUnit) utilUnit.value = profit.toFixed(2);
        const utilPct = document.getElementById('prod-margen-porcentual');
        if (utilPct) utilPct.value = marginPct;
      };
      prodPrice.addEventListener('input', calcMargin);
      prodCost.addEventListener('input', calcMargin);
    }

    // 4. Pedidos Filtros y Botones (con debounce)
    const orderSearch = document.getElementById('orders-search-input');
    if (orderSearch) orderSearch.addEventListener('input', this.debounce(() => this.renderOrdersTable(), 150));
    const orderStatusFilter = document.getElementById('orders-status-filter');
    if (orderStatusFilter) orderStatusFilter.addEventListener('change', () => this.renderOrdersTable());
    const btnNewOrder = document.getElementById('btn-open-new-order-modal');
    if (btnNewOrder) btnNewOrder.addEventListener('click', () => this.openOrderModal());
    const btnExportOrders = document.getElementById('btn-export-orders-csv');
    if (btnExportOrders) {
      btnExportOrders.addEventListener('click', () => {
        window.localCRMStore.exportOrdersCsv();
        this.showToast('Descargando historial de pedidos en CSV...', 'info');
      });
    }

    const btnAddItem = document.getElementById('btn-add-order-item');
    if (btnAddItem) btnAddItem.addEventListener('click', () => this.addOrderItemRow());

    // 5. Tickets Filtros y Botones (con debounce)
    const ticketSearch = document.getElementById('tickets-search-input');
    if (ticketSearch) ticketSearch.addEventListener('input', this.debounce(() => this.renderTicketsTable(), 150));
    const ticketStatusFilter = document.getElementById('tickets-status-filter');
    if (ticketStatusFilter) ticketStatusFilter.addEventListener('change', () => this.renderTicketsTable());
    const btnNewTicket = document.getElementById('btn-open-new-ticket-modal');
    if (btnNewTicket) btnNewTicket.addEventListener('click', () => this.openTicketModal());

    // 6. Respaldos
    const btnExport = document.getElementById('btn-export-json');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        window.localCRMStore.exportJson();
        this.showToast('Respaldo JSON descargado.', 'success');
      });
    }

    // 7. Atajos de Teclado Globales y Cierre de Modales
    window.addEventListener('keydown', (e) => {
      // Escape: Cerrar cualquier modal abierto
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
      // Slash (/): Enfocar el buscador de la pestaña activa (si no se está escribiendo)
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        const searchInputMap = {
          clients: 'clients-search-input',
          products: 'products-search-input',
          orders: 'orders-search-input',
          tickets: 'tickets-search-input'
        };
        const activeSearchId = searchInputMap[this.currentTab];
        if (activeSearchId) {
          const input = document.getElementById(activeSearchId);
          if (input) {
            input.focus();
            input.select();
          }
        }
      }
    });

    // Cierre de modal al hacer clic en el backdrop oscuro
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    const inputImport = document.getElementById('input-import-json');
    if (inputImport) {
      inputImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = window.localCRMStore.importJson(evt.target.result);
          if (res.success) {
            this.refreshData();
            this.renderCurrentView();
            this.showToast('Respaldo importado correctamente.', 'success');
          } else {
            this.showToast(`Error al importar: ${res.error}`, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('¿Deseas restablecer todos los datos iniciales del PDF de la Licorera? Se perderán las modificaciones locales no respaldadas.')) {
          window.localCRMStore.resetToDefaults();
          this.refreshData();
          this.renderCurrentView();
          this.showToast('Datos de ejemplo del PDF restablecidos con éxito.', 'info');
        }
      });
    }

    // Cierre general de modales
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      });
    });

    // Validación de edad en formulario de cliente
    const dobInput = document.getElementById('client-fecha-nacimiento');
    if (dobInput) {
      dobInput.addEventListener('change', (e) => {
        this.verifyAge(e.target.value);
      });
    }

    // Envíos de Formulario
    document.getElementById('form-client')?.addEventListener('submit', (e) => this.handleClientSubmit(e));
    document.getElementById('form-product')?.addEventListener('submit', (e) => this.handleProductSubmit(e));
    document.getElementById('form-order')?.addEventListener('submit', (e) => this.handleOrderSubmit(e));
    document.getElementById('form-ticket')?.addEventListener('submit', (e) => this.handleTicketSubmit(e));
  }

  // Cambio de Pestaña Principal
  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`view-${tabId}`);
    if (targetSection) targetSection.classList.add('active');

    // Actualizar estilos en sidebar
    document.querySelectorAll('.nav-item').forEach(btn => {
      const bTab = btn.getAttribute('data-tab');
      if (bTab === tabId) {
        btn.className = 'nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-white bg-mega-500/20 border border-mega-500/40 shadow-sm shadow-mega-500/15';
      } else {
        btn.className = 'nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-obsidian-800';
      }
    });

    // Actualizar títulos en topbar
    const titles = {
      dashboard: { title: 'Dashboard & Métricas', sub: 'Resumen operativo de inventario, ventas y clientes de la licorera' },
      clients: { title: 'Gestión de Clientes (B2B / B2C)', sub: 'Directorio de compradores y verificación legal +18' },
      products: { title: 'Catálogo de Licores & Inventario', sub: 'Ficha técnica en 7 categorías, márgenes y control de bodega' },
      orders: { title: 'Gestión de Pedidos & Facturación', sub: 'Control de ventas con canasta dinámica, IVA y comprobantes de entrega' },
      tickets: { title: 'Atención al Cliente & Post-Venta', sub: 'Resolución de incidencias, entregas y pedidos especiales' },
      settings: { title: 'Respaldos de Datos & Despliegue', sub: 'Exportación/importación JSON y opciones de despliegue en producción' }
    };

    const titleEl = document.getElementById('view-title');
    const subEl = document.getElementById('view-subtitle');
    if (titleEl && titles[tabId]) titleEl.textContent = titles[tabId].title;
    if (subEl && titles[tabId]) subEl.textContent = titles[tabId].sub;

    this.renderCurrentView();
    this.renderIcons();

    // Redimensionar gráficos al cambiar a la pestaña de dashboard para asegurar nitidez
    if (tabId === 'dashboard') {
      setTimeout(() => {
        if (this.chartChannels) this.chartChannels.resize();
        if (this.chartProfitability) this.chartProfitability.resize();
      }, 50);
    }

    // En móvil, cerrar sidebar si estaba abierto
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('hidden')) {
      sidebar.classList.add('hidden');
    }
  }

  // Renderizar la vista activa
  renderCurrentView() {
    switch (this.currentTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'clients':
        this.renderClientsTable();
        break;
      case 'products':
        this.renderProductsView();
        break;
      case 'orders':
        this.renderOrdersTable();
        break;
      case 'tickets':
        this.renderTicketsTable();
        break;
      case 'settings':
        break;
    }
  }

  // ========================================================================
  // SECCIÓN 1: DASHBOARD
  // ========================================================================
  renderDashboard() {
    // 1. Cálculos de KPIs
    const totalSales = this.orders.reduce((acc, o) => acc + (Number(o.total_con_iva) || 0), 0);
    const mayoristasCount = this.clients.filter(c => c.segmento === 'Mayorista').length;
    const minoristasCount = this.clients.filter(c => c.segmento === 'Minorista' || c.segmento === 'Online').length;
    const totalStockUnits = this.products.reduce((acc, p) => acc + (Number(p.stock_disponible) || 0), 0);
    const lowStockProducts = this.products.filter(p => Number(p.stock_disponible) <= Number(p.stock_minimo));

    document.getElementById('kpi-total-sales').textContent = this.formatMoney(totalSales);
    document.getElementById('kpi-sales-count').textContent = `${this.orders.length} pedidos procesados`;
    document.getElementById('kpi-total-clients').textContent = this.clients.length;
    document.getElementById('kpi-clients-breakdown').textContent = `${mayoristasCount} Mayoristas · ${minoristasCount} Minoristas/Online`;
    document.getElementById('kpi-total-products').textContent = this.products.length;
    document.getElementById('kpi-stock-units').textContent = `${totalStockUnits} unidades en bodega`;
    document.getElementById('kpi-stock-alerts').textContent = lowStockProducts.length;

    // 2. Tabla de Alertas de Stock Mínimo
    const alertsTbody = document.getElementById('dashboard-stock-alerts-tbody');
    if (alertsTbody) {
      if (lowStockProducts.length === 0) {
        alertsTbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500 text-xs">✓ No hay licores en stock crítico. Existencias óptimas.</td></tr>';
      } else {
        alertsTbody.innerHTML = lowStockProducts.map(p => `
          <tr>
            <td>
              <span class="font-bold text-white text-xs">${p.nombre}</span>
              <span class="block text-[11px] text-gray-500 font-mono">${p.sku} · ${p.marca}</span>
            </td>
            <td>
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 stock-warning-badge">
                ${p.stock_disponible} unid.
              </span>
            </td>
            <td class="text-xs text-gray-400">${p.stock_minimo} unid.</td>
            <td class="text-xs text-gray-400">${p.ubicacion || 'Bodega General'}</td>
            <td>
              <button onclick="window.crmApp.quickRestock('${p.sku}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-obsidian-800 text-amber-400 hover:bg-amber-500 hover:text-obsidian-950 transition-colors border border-amber-500/30">
                + Reponer
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // 3. Tabla de Tickets Activos
    const ticketsTbody = document.getElementById('dashboard-tickets-tbody');
    if (ticketsTbody) {
      const activeTickets = this.tickets.filter(t => t.estado !== 'Cerrado');
      if (activeTickets.length === 0) {
        ticketsTbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500 text-xs">✓ No hay tickets de soporte pendientes.</td></tr>';
      } else {
        ticketsTbody.innerHTML = activeTickets.map(t => `
          <tr>
            <td>
              <span class="font-bold text-white text-xs">#${t.id}</span>
              <span class="block text-[11px] text-gray-400">${t.cliente_nombre || 'Cliente'}</span>
            </td>
            <td class="text-xs text-gray-300 max-w-[180px] truncate">${t.asunto}</td>
            <td>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${t.prioridad === 'Alta' ? 'bg-rose-500/20 text-rose-400' : t.prioridad === 'Media' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}">
                ${t.prioridad}
              </span>
            </td>
            <td>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${t.estado === 'Abierto' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}">
                ${t.estado}
              </span>
            </td>
          </tr>
        `).join('');
      }
    }

    // 4. Inicializar o Actualizar Gráficos con Chart.js
    this.renderCharts();
  }

  renderCharts() {
    if (!window.Chart) return;

    // Gráfico 1: Ventas por Canal
    const channelCanvas = document.getElementById('chart-channels');
    if (channelCanvas) {
      const ctx = channelCanvas.getContext('2d');
      const channelsMap = {};
      this.products.forEach(p => {
        const canal = p.canal_venta || 'Local';
        channelsMap[canal] = (channelsMap[canal] || 0) + (Number(p.ventas_periodo) || 0);
      });

      const labels = Object.keys(channelsMap);
      const data = Object.values(channelsMap);

      if (this.chartChannels) this.chartChannels.destroy();
      this.chartChannels = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['Local', 'WhatsApp', 'Delivery'],
          datasets: [{
            data: data.length ? data : [4200, 1890, 1190],
            backgroundColor: [
              '#f4060e', // Mega Red Primary
              '#ffffff', // Crisp White
              '#8a0005', // Deep Wine
              '#ff4a53', // Light Red Accent
              '#374151'  // Dark Slate
            ],
            borderColor: '#0e0e12',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#9ca3af', font: { size: 11 } }
            }
          }
        }
      });
    }

    // Gráfico 2: Rentabilidad y Margen (%) por Licor
    const profitCanvas = document.getElementById('chart-profitability');
    if (profitCanvas) {
      const ctx2 = profitCanvas.getContext('2d');
      const sortedProducts = [...this.products]
        .sort((a, b) => (Number(b.rentabilidad_producto) || 0) - (Number(a.rentabilidad_producto) || 0))
        .slice(0, 5);

      const labels2 = sortedProducts.map(p => p.nombre.length > 18 ? p.nombre.slice(0, 18) + '...' : p.nombre);
      const rentabilidadData = sortedProducts.map(p => Number(p.rentabilidad_producto) || 0);
      const margenData = sortedProducts.map(p => Number(p.margen_porcentual) || 0);

      if (this.chartProfitability) this.chartProfitability.destroy();
      this.chartProfitability = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: labels2,
          datasets: [
            {
              label: `Rentabilidad Mensual (${this.currencySymbol})`,
              data: rentabilidadData,
              backgroundColor: '#f4060e',
              borderRadius: 6,
              yAxisID: 'y'
            },
            {
              label: 'Margen de Utilidad (%)',
              data: margenData,
              type: 'line',
              borderColor: '#ffffff',
              backgroundColor: '#ffffff',
              tension: 0.3,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { color: '#9ca3af', font: { size: 10 } },
              grid: { display: false }
            },
            y: {
              type: 'linear',
              position: 'left',
              ticks: { color: '#9ca3af', font: { size: 10 } },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y1: {
              type: 'linear',
              position: 'right',
              ticks: { color: '#ffffff', font: { size: 10 } },
              grid: { display: false }
            }
          },
          plugins: {
            legend: {
              labels: { color: '#d1d5db', font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  // ========================================================================
  // SECCIÓN 2: CLIENTES (B2B / B2C)
  // ========================================================================
  renderClientsTable() {
    const tbody = document.getElementById('clients-table-tbody');
    if (!tbody) return;

    const query = (document.getElementById('clients-search-input')?.value || '').toLowerCase();
    const segmentFilter = document.getElementById('clients-segment-filter')?.value || 'ALL';

    const filtered = this.clients.filter(c => {
      const matchQuery = (c.nombre_razon_social || '').toLowerCase().includes(query) ||
                         (c.nif_cif || '').toLowerCase().includes(query) ||
                         (c.contacto_principal || '').toLowerCase().includes(query) ||
                         (c.email || '').toLowerCase().includes(query);
      const matchSegment = segmentFilter === 'ALL' || c.segmento === segmentFilter;
      return matchQuery && matchSegment;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-gray-500">No se encontraron clientes con los filtros aplicados.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      const isAdult = this.isAdult(c.fecha_nacimiento);
      const segmentBadgeClass = c.segmento === 'Mayorista'
        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        : c.segmento === 'Minorista'
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

      return `
        <tr>
          <td class="font-mono text-xs text-gray-400">#${c.id}</td>
          <td>
            <div class="font-bold text-white text-sm">${c.nombre_razon_social}</div>
            <div class="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
              <span>${c.direccion || 'Sin dirección'}</span>
              ${isAdult ? '<span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">+18 Verificado</span>' : '<span class="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-semibold">Menor de Edad</span>'}
            </div>
          </td>
          <td class="font-mono text-xs text-gray-300 font-semibold">${c.nif_cif}</td>
          <td>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${segmentBadgeClass}">
              ${c.segmento}
            </span>
          </td>
          <td>
            <div class="text-xs text-gray-300 font-medium">${c.contacto_principal || 'Sin contacto'}</div>
            <div class="text-[11px] text-gray-400">${c.telefono || ''} · ${c.email || ''}</div>
          </td>
          <td class="text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="window.crmApp.openOrderModal(${c.id})" title="Nuevo Pedido para este cliente" class="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
              </button>
              <button onclick="window.crmApp.editClient(${c.id})" title="Editar Cliente" class="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="window.crmApp.deleteClient(${c.id})" title="Eliminar Cliente" class="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderIcons();
  }

  isAdult(dobString) {
    if (!dobString) return true;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  }

  verifyAge(dobString) {
    const badge = document.getElementById('age-verification-badge');
    if (!badge) return;
    if (!dobString) {
      badge.textContent = 'Ingresa fecha para verificar edad legal de compra';
      badge.className = 'text-[11px] mt-1 font-semibold text-gray-400';
      return;
    }

    const adult = this.isAdult(dobString);
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (adult) {
      badge.textContent = `✓ Mayor de edad verificado: ${age} años cumplidos. Apto para compra de licor.`;
      badge.className = 'text-[11px] mt-1 font-semibold text-emerald-400';
    } else {
      badge.textContent = `✕ Alerta: ${age} años. La ley prohíbe la venta de bebidas alcohólicas a menores de 18 años.`;
      badge.className = 'text-[11px] mt-1 font-semibold text-rose-400';
    }
  }

  openClientModal(clientId = null) {
    const modal = document.getElementById('modal-client');
    const title = document.getElementById('modal-client-title');
    const form = document.getElementById('form-client');
    form.reset();

    if (clientId) {
      const client = this.clients.find(c => c.id === clientId);
      if (client) {
        title.textContent = 'Editar Cliente';
        document.getElementById('client-form-id').value = client.id;
        document.getElementById('client-nombre').value = client.nombre_razon_social;
        document.getElementById('client-nif').value = client.nif_cif;
        document.getElementById('client-fecha-nacimiento').value = client.fecha_nacimiento || '';
        document.getElementById('client-segmento').value = client.segmento;
        document.getElementById('client-contacto').value = client.contacto_principal || '';
        document.getElementById('client-email').value = client.email || '';
        document.getElementById('client-telefono').value = client.telefono || '';
        document.getElementById('client-direccion').value = client.direccion || '';
        document.getElementById('client-notas').value = client.notas_internas || '';
        this.verifyAge(client.fecha_nacimiento);
      }
    } else {
      title.textContent = 'Registrar Nuevo Cliente';
      document.getElementById('client-form-id').value = '';
      this.verifyAge('');
    }

    modal.classList.remove('hidden');
    this.renderIcons();
  }

  editClient(id) {
    this.openClientModal(id);
  }

  deleteClient(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      window.localCRMStore.deleteClient(id);
      this.refreshData();
      this.renderClientsTable();
      this.showToast('Cliente eliminado.', 'info');
    }
  }

  handleClientSubmit(e) {
    e.preventDefault();
    const dob = document.getElementById('client-fecha-nacimiento').value;
    if (!this.isAdult(dob)) {
      if (!confirm('ADVERTENCIA: El cliente registrado parece ser menor de 18 años. ¿Deseas guardarlo de todos modos bajo supervisión?')) {
        return;
      }
    }

    const idVal = document.getElementById('client-form-id').value;
    const clientData = {
      id: idVal ? Number(idVal) : Date.now(),
      nombre_razon_social: document.getElementById('client-nombre').value,
      nif_cif: document.getElementById('client-nif').value,
      fecha_nacimiento: dob,
      segmento: document.getElementById('client-segmento').value,
      contacto_principal: document.getElementById('client-contacto').value,
      email: document.getElementById('client-email').value,
      telefono: document.getElementById('client-telefono').value,
      direccion: document.getElementById('client-direccion').value,
      notas_internas: document.getElementById('client-notas').value
    };

    window.localCRMStore.saveClient(clientData);
    document.getElementById('modal-client').classList.add('hidden');
    this.refreshData();
    this.renderClientsTable();
    this.showToast('Cliente guardado exitosamente.', 'success');
  }

  // ========================================================================
  // SECCIÓN 3: CATÁLOGO DE LICORES & INVENTARIO (7 CATEGORÍAS DEL PDF)
  // ========================================================================
  renderProductsView() {
    const query = (document.getElementById('products-search-input')?.value || '').toLowerCase();
    const catFilter = document.getElementById('products-category-filter')?.value || 'ALL';
    const stockFilter = document.getElementById('products-stock-filter')?.value || 'ALL';
    const rotFilter = document.getElementById('products-rotation-filter')?.value || 'ALL';

    const filtered = this.products.filter(p => {
      const matchQuery = (p.sku || '').toLowerCase().includes(query) ||
                         (p.nombre || '').toLowerCase().includes(query) ||
                         (p.marca || '').toLowerCase().includes(query) ||
                         (p.codigo_barras || '').toLowerCase().includes(query);
      const matchCat = catFilter === 'ALL' || p.categoria === catFilter;
      const matchStock = stockFilter === 'ALL' ||
                         (stockFilter === 'LOW' && Number(p.stock_disponible) <= Number(p.stock_minimo)) ||
                         (stockFilter === 'OK' && Number(p.stock_disponible) > Number(p.stock_minimo));
      const matchRot = rotFilter === 'ALL' || p.rotacion === rotFilter;

      return matchQuery && matchCat && matchStock && matchRot;
    });

    if (this.viewMode === 'cards') {
      this.renderProductsCards(filtered);
    } else {
      this.renderProductsTableMode(filtered);
    }
    this.renderIcons();
  }

  renderProductsCards(products) {
    const container = document.getElementById('products-cards-container');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No hay licores que coincidan con los filtros seleccionados.</div>';
      return;
    }

    container.innerHTML = products.map(p => {
      const isLowStock = Number(p.stock_disponible) <= Number(p.stock_minimo);
      const rotClass = p.rotacion === 'Alta' ? 'badge-rotacion-alta' : p.rotacion === 'Media' ? 'badge-rotacion-media' : 'badge-rotacion-baja';

      return `
        <div class="bg-obsidian-850 rounded-2xl border ${isLowStock ? 'border-rose-500/40' : 'border-subtle'} product-card p-5 flex flex-col justify-between space-y-4">
          
          <!-- Cabecera de Tarjeta -->
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                ${p.sku}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${rotClass}">
                  Rotación ${p.rotacion}
                </span>
                ${isLowStock ? '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 stock-warning-badge">Stock Bajo</span>' : ''}
              </div>
            </div>

            <h3 class="font-serif font-bold text-base text-white mt-2 leading-snug">${p.nombre}</h3>
            <p class="text-xs text-gray-400 mt-0.5">${p.marca} · <span class="text-amber-400/90 font-medium">${p.categoria}</span> ${p.subcategoria ? `(${p.subcategoria})` : ''}</p>
          </div>

          <!-- Píldoras de Características (Cat 2) -->
          <div class="flex flex-wrap gap-1.5 text-[11px] text-gray-300">
            <span class="bg-obsidian-900 px-2.5 py-1 rounded-lg border border-subtle flex items-center gap-1">
              <i data-lucide="percent" class="w-3 h-3 text-amber-400"></i>
              ${p.graduacion || '40% ABV'}
            </span>
            <span class="bg-obsidian-900 px-2.5 py-1 rounded-lg border border-subtle flex items-center gap-1">
              <i data-lucide="flask-conical" class="w-3 h-3 text-amber-400"></i>
              ${p.contenido || '750 ml'}
            </span>
            <span class="bg-obsidian-900 px-2.5 py-1 rounded-lg border border-subtle">
              ${p.presentacion || 'Botella'}
            </span>
            ${p.pais_origen ? `<span class="bg-obsidian-900 px-2 py-1 rounded-lg border border-subtle text-gray-400">🏳️ ${p.pais_origen}</span>` : ''}
          </div>

          <!-- Comercialización & Rentabilidad (Cat 3 & 7) -->
          <div class="bg-obsidian-900 p-3 rounded-xl border border-subtle space-y-2 text-xs">
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-[10px] text-gray-400 uppercase font-semibold">Precio Venta</span>
                <p class="text-base font-bold text-white font-serif">${this.formatMoney(p.precio_venta)}</p>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-gray-400 uppercase font-semibold">Margen (%)</span>
                <p class="text-sm font-bold text-emerald-400 font-mono">+${p.margen_porcentual || 0}%</p>
              </div>
            </div>

            <div class="border-t border-subtle/50 pt-2 flex items-center justify-between text-[11px] text-gray-400">
              <span>Costo: <strong class="text-gray-200">${this.formatMoney(p.costo_adquisicion)}</strong></span>
              <span>Utilidad: <strong class="text-amber-400">${this.formatMoney(p.utilidad_unidad || (p.precio_venta - p.costo_adquisicion))}</strong></span>
            </div>
          </div>

          <!-- Barra de Inventario (Cat 4) -->
          <div class="space-y-1 text-xs">
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-gray-400">Existencias en Bodega:</span>
              <span class="font-bold ${isLowStock ? 'text-rose-400' : 'text-gray-200'}">${p.stock_disponible} / ${p.stock_maximo || 100} unid.</span>
            </div>
            <div class="w-full h-1.5 bg-obsidian-950 rounded-full overflow-hidden">
              <div class="h-full ${isLowStock ? 'bg-rose-500' : 'bg-amber-500'}" style="width: ${Math.min(100, (p.stock_disponible / (p.stock_maximo || 100)) * 100)}%"></div>
            </div>
            <p class="text-[10px] text-gray-500">Mínimo alerta: ${p.stock_minimo} unid. · Ubicación: ${p.ubicacion || 'Bodega Principal'}</p>
          </div>

          <!-- Acciones -->
          <div class="pt-2 flex items-center justify-between border-t border-subtle">
            <button onclick="window.crmApp.openProductModal('${p.sku}')" class="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
              <i data-lucide="layers" class="w-3.5 h-3.5"></i>
              <span>Ver Ficha (7 Cat.)</span>
            </button>
            <div class="flex items-center gap-1">
              <button onclick="window.crmApp.quickAdjustStock('${p.sku}', -1)" title="Restar 1 unidad en stock" class="w-6 h-6 rounded-md bg-obsidian-900 border border-subtle text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center text-xs font-bold transition-colors">-</button>
              <button onclick="window.crmApp.quickAdjustStock('${p.sku}', 1)" title="Sumar 1 unidad en stock" class="w-6 h-6 rounded-md bg-obsidian-900 border border-subtle text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center text-xs font-bold transition-colors">+</button>
              <button onclick="window.crmApp.deleteProduct('${p.sku}')" title="Eliminar Licor" class="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

        </div>
      `;
    }).join('');
  }

  renderProductsTableMode(products) {
    const tbody = document.getElementById('products-table-tbody');
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center py-6 text-gray-500">No hay licores coincidentes.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(p => {
      const isLowStock = Number(p.stock_disponible) <= Number(p.stock_minimo);
      return `
        <tr>
          <td class="font-mono text-xs font-bold text-amber-500">${p.sku}</td>
          <td>
            <div class="font-bold text-white text-xs">${p.nombre}</div>
            <div class="text-[11px] text-gray-500">${p.marca} · Barras: ${p.codigo_barras || 'N/A'}</div>
          </td>
          <td class="text-xs text-gray-300">${p.categoria}</td>
          <td class="text-xs text-gray-400">${p.graduacion} · ${p.contenido}</td>
          <td class="text-xs font-bold text-white font-mono">${this.formatMoney(p.precio_venta)}</td>
          <td class="text-xs text-gray-400 font-mono">${this.formatMoney(p.costo_adquisicion)}</td>
          <td class="text-xs text-emerald-400 font-bold font-mono">+${p.margen_porcentual}%</td>
          <td>
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded text-xs font-bold ${isLowStock ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-obsidian-900 text-gray-300'}">
                ${p.stock_disponible} unid.
              </span>
              <button onclick="window.crmApp.quickAdjustStock('${p.sku}', -1)" title="Restar 1 unidad" class="w-5 h-5 rounded bg-obsidian-900 border border-subtle text-gray-400 hover:text-white hover:border-gray-500 text-xs font-bold flex items-center justify-center transition-colors">-</button>
              <button onclick="window.crmApp.quickAdjustStock('${p.sku}', 1)" title="Sumar 1 unidad" class="w-5 h-5 rounded bg-obsidian-900 border border-subtle text-gray-400 hover:text-white hover:border-gray-500 text-xs font-bold flex items-center justify-center transition-colors">+</button>
            </div>
          </td>
          <td>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${p.rotacion === 'Alta' ? 'badge-rotacion-alta' : p.rotacion === 'Media' ? 'badge-rotacion-media' : 'badge-rotacion-baja'}">
              ${p.rotacion}
            </span>
          </td>
          <td class="text-right">
            <button onclick="window.crmApp.openProductModal('${p.sku}')" class="px-3 py-1 rounded-lg text-xs font-semibold bg-obsidian-800 text-amber-400 hover:bg-amber-500 hover:text-obsidian-950 transition-colors border border-amber-500/30">
              Ver Ficha
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  openProductModal(sku = null) {
    const modal = document.getElementById('modal-product');
    const title = document.getElementById('modal-product-title');
    const form = document.getElementById('form-product');
    form.reset();

    // Resetear a la pestaña 1
    document.querySelectorAll('.ptab-btn')[0]?.click();

    if (sku) {
      const prod = this.products.find(p => p.sku === sku);
      if (prod) {
        title.textContent = `Ficha Técnica: ${prod.nombre} (${prod.sku})`;
        // Pestaña 1
        document.getElementById('prod-sku').value = prod.sku;
        document.getElementById('prod-sku').readOnly = true;
        document.getElementById('prod-codigo-barras').value = prod.codigo_barras || '';
        document.getElementById('prod-nombre').value = prod.nombre;
        document.getElementById('prod-marca').value = prod.marca;
        document.getElementById('prod-categoria').value = prod.categoria;
        document.getElementById('prod-subcategoria').value = prod.subcategoria || '';
        // Pestaña 2
        document.getElementById('prod-tipo-bebida').value = prod.tipo_bebida || '';
        document.getElementById('prod-presentacion').value = prod.presentacion || 'Botella';
        document.getElementById('prod-contenido').value = prod.contenido || '';
        document.getElementById('prod-graduacion').value = prod.graduacion || '';
        document.getElementById('prod-pais').value = prod.pais_origen || '';
        document.getElementById('prod-descripcion').value = prod.descripcion || '';
        // Pestaña 3
        document.getElementById('prod-precio-venta').value = prod.precio_venta;
        document.getElementById('prod-costo').value = prod.costo_adquisicion;
        document.getElementById('prod-precio-mayorista').value = prod.precio_mayorista || '';
        document.getElementById('prod-precio-promocional').value = prod.precio_promocional || '';
        document.getElementById('prod-proveedor').value = prod.proveedor || '';
        document.getElementById('prod-marca-proveedor').value = prod.marca_proveedor_principal || '';
        // Pestaña 4
        document.getElementById('prod-stock-disponible').value = prod.stock_disponible;
        document.getElementById('prod-stock-minimo').value = prod.stock_minimo;
        document.getElementById('prod-stock-maximo').value = prod.stock_maximo || 100;
        document.getElementById('prod-ubicacion').value = prod.ubicacion || '';
        document.getElementById('prod-fecha-ingreso').value = prod.fecha_ingreso || '';
        document.getElementById('prod-lote').value = prod.lote || '';
        // Pestaña 5
        document.getElementById('prod-unidades-vendidas').value = prod.unidades_vendidas || 0;
        document.getElementById('prod-ventas-periodo').value = prod.ventas_periodo || 0;
        document.getElementById('prod-frecuencia').value = prod.frecuencia_venta || '';
        document.getElementById('prod-canal').value = prod.canal_venta || '';
        document.getElementById('prod-ticket-promedio').value = prod.ticket_promedio || '';
        // Pestaña 6
        document.getElementById('prod-promociones').value = prod.promociones_aplicadas || '';
        document.getElementById('prod-cupones').value = prod.cupones_utilizados || '';
        document.getElementById('prod-campanas').value = prod.campanas_asociadas || '';
        document.getElementById('prod-resultado-promocion').value = prod.resultado_promocion || '';
        // Pestaña 7
        document.getElementById('prod-utilidad-unidad').value = prod.utilidad_unidad || (prod.precio_venta - prod.costo_adquisicion);
        document.getElementById('prod-margen-porcentual').value = prod.margen_porcentual || 0;
        document.getElementById('prod-rentabilidad-producto').value = prod.rentabilidad_producto || 0;
        document.getElementById('prod-rotacion').value = prod.rotacion || 'Media';

        // Actualizar etiqueta en vivo
        document.getElementById('live-margin-text').textContent = `Utilidad: ${this.formatMoney(prod.utilidad_unidad || 0)} / ${prod.margen_porcentual}% margen`;
      }
    } else {
      title.textContent = 'Registrar Nuevo Licor (Ficha en 7 Categorías)';
      document.getElementById('prod-sku').readOnly = false;
      document.getElementById('prod-fecha-ingreso').value = new Date().toISOString().slice(0, 10);
    }

    modal.classList.remove('hidden');
    this.renderIcons();
  }

  deleteProduct(sku) {
    if (confirm(`¿Deseas eliminar el licor SKU: ${sku} del catálogo?`)) {
      window.localCRMStore.deleteProduct(sku);
      this.refreshData();
      this.renderProductsView();
      this.showToast('Licor eliminado del catálogo.', 'info');
    }
  }

  quickRestock(sku) {
    const prod = this.products.find(p => p.sku === sku);
    if (!prod) return;
    const qty = prompt(`Ingresa cantidad de unidades para reponer en ${prod.nombre}:`, "24");
    if (qty && !isNaN(qty) && Number(qty) > 0) {
      prod.stock_disponible = Number(prod.stock_disponible) + Number(qty);
      window.localCRMStore.saveProduct(prod);
      this.refreshData();
      this.renderCurrentView();
      this.renderDashboard();
      this.showToast(`Stock reabastecido (+${qty} unid. a ${prod.nombre})`, 'success');
    }
  }

  quickAdjustStock(sku, delta) {
    const prod = this.products.find(p => p.sku === sku);
    if (!prod) return;
    const currentStock = Number(prod.stock_disponible) || 0;
    const newStock = Math.max(0, currentStock + delta);
    prod.stock_disponible = newStock;
    window.localCRMStore.saveProduct(prod);
    this.refreshData();
    this.renderCurrentView();
    this.renderDashboard();
    this.showToast(`Stock de ${prod.nombre}: ${newStock} unid.`, 'info');
  }

  handleProductSubmit(e) {
    e.preventDefault();
    const sku = document.getElementById('prod-sku').value.trim();
    const price = parseFloat(document.getElementById('prod-precio-venta').value) || 0;
    const cost = parseFloat(document.getElementById('prod-costo').value) || 0;
    const profit = price - cost;
    const marginPct = price > 0 ? parseFloat(((profit / price) * 100).toFixed(2)) : 0;

    const productData = {
      sku,
      codigo_barras: document.getElementById('prod-codigo-barras').value,
      nombre: document.getElementById('prod-nombre').value,
      marca: document.getElementById('prod-marca').value,
      categoria: document.getElementById('prod-categoria').value,
      subcategoria: document.getElementById('prod-subcategoria').value,
      tipo_bebida: document.getElementById('prod-tipo-bebida').value,
      presentacion: document.getElementById('prod-presentacion').value,
      contenido: document.getElementById('prod-contenido').value,
      graduacion: document.getElementById('prod-graduacion').value,
      pais_origen: document.getElementById('prod-pais').value,
      descripcion: document.getElementById('prod-descripcion').value,
      precio_venta: price,
      costo_adquisicion: cost,
      margen_utilidad: profit,
      precio_mayorista: parseFloat(document.getElementById('prod-precio-mayorista').value) || 0,
      precio_promocional: parseFloat(document.getElementById('prod-precio-promocional').value) || 0,
      proveedor: document.getElementById('prod-proveedor').value,
      marca_proveedor_principal: document.getElementById('prod-marca-proveedor').value,
      stock_disponible: parseInt(document.getElementById('prod-stock-disponible').value) || 0,
      stock_minimo: parseInt(document.getElementById('prod-stock-minimo').value) || 5,
      stock_maximo: parseInt(document.getElementById('prod-stock-maximo').value) || 100,
      ubicacion: document.getElementById('prod-ubicacion').value,
      fecha_ingreso: document.getElementById('prod-fecha-ingreso').value,
      lote: document.getElementById('prod-lote').value,
      unidades_vendidas: parseInt(document.getElementById('prod-unidades-vendidas').value) || 0,
      ventas_periodo: parseFloat(document.getElementById('prod-ventas-periodo').value) || 0,
      frecuencia_venta: document.getElementById('prod-frecuencia').value,
      canal_venta: document.getElementById('prod-canal').value,
      ticket_promedio: parseFloat(document.getElementById('prod-ticket-promedio').value) || 0,
      promociones_aplicadas: document.getElementById('prod-promociones').value,
      cupones_utilizados: document.getElementById('prod-cupones').value,
      campanas_asociadas: document.getElementById('prod-campanas').value,
      resultado_promocion: document.getElementById('prod-resultado-promocion').value,
      utilidad_unidad: parseFloat(document.getElementById('prod-utilidad-unidad').value) || profit,
      margen_porcentual: marginPct,
      rentabilidad_producto: parseFloat(document.getElementById('prod-rentabilidad-producto').value) || 0,
      rotacion: document.getElementById('prod-rotacion').value
    };

    window.localCRMStore.saveProduct(productData);
    document.getElementById('modal-product').classList.add('hidden');
    this.refreshData();
    this.renderProductsView();
    this.showToast(`Licor ${productData.nombre} guardado correctamente.`, 'success');
  }

  // ========================================================================
  // SECCIÓN 4: PEDIDOS & FACTURACIÓN (FORMULARIO DEL PDF)
  // ========================================================================
  renderOrdersTable() {
    const tbody = document.getElementById('orders-table-tbody');
    if (!tbody) return;

    const query = (document.getElementById('orders-search-input')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('orders-status-filter')?.value || 'ALL';

    const filtered = this.orders.filter(o => {
      const matchQuery = String(o.id).includes(query) ||
                         (o.cliente_nombre || '').toLowerCase().includes(query) ||
                         (o.forma_pago || '').toLowerCase().includes(query);
      const matchStatus = statusFilter === 'ALL' || o.estado === statusFilter;
      return matchQuery && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center py-6 text-gray-500">No se encontraron pedidos registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(o => {
      const statusSelectClass = o.estado === 'Completo'
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : o.estado === 'Enviado'
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : o.estado === 'Pendiente'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30';

      const itemsSummary = Array.isArray(o.items)
        ? o.items.map(i => `${i.cantidad}x ${i.nombre || i.sku}`).join(', ')
        : 'Ver detalle';

      return `
        <tr>
          <td class="font-mono text-xs font-bold text-amber-500">#${o.id}</td>
          <td class="text-xs text-gray-400">${new Date(o.fecha_pedido).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
          <td>
            <span class="font-bold text-white text-xs">${o.cliente_nombre || 'Cliente'}</span>
          </td>
          <td class="text-xs text-gray-300 max-w-[200px] truncate" title="${itemsSummary}">${itemsSummary}</td>
          <td class="text-xs font-mono text-gray-300">${this.formatMoney(o.total_sin_iva)}</td>
          <td class="text-xs font-mono text-gray-400">${o.iva_porcentaje || 21}%</td>
          <td class="text-xs font-mono font-bold text-white">${this.formatMoney(o.total_con_iva)}</td>
          <td>
            <select class="select-status-badge ${statusSelectClass}" onchange="window.crmApp.changeOrderStatus(${o.id}, this.value)" title="Cambiar estado del pedido">
              <option value="Pendiente" ${o.estado === 'Pendiente' ? 'selected' : ''} class="bg-obsidian-900 text-amber-400">Pendiente</option>
              <option value="Enviado" ${o.estado === 'Enviado' ? 'selected' : ''} class="bg-obsidian-900 text-blue-400">Enviado</option>
              <option value="Completo" ${o.estado === 'Completo' ? 'selected' : ''} class="bg-obsidian-900 text-emerald-400">Completo</option>
              <option value="Cancelado" ${o.estado === 'Cancelado' ? 'selected' : ''} class="bg-obsidian-900 text-rose-400">Cancelado</option>
            </select>
          </td>
          <td class="text-xs text-gray-400">${o.forma_pago}</td>
          <td class="text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="window.crmApp.printReceipt(${o.id})" title="Ver e Imprimir Comprobante" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-obsidian-800 text-amber-400 hover:bg-amber-500 hover:text-obsidian-950 transition-colors border border-amber-500/30 flex items-center gap-1">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                <span>Recibo</span>
              </button>
              <button onclick="window.crmApp.deleteOrder(${o.id})" title="Eliminar Pedido" class="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderIcons();
  }

  openOrderModal(preselectedClientId = null) {
    const modal = document.getElementById('modal-order');
    const form = document.getElementById('form-order');
    form.reset();

    // ID generado secuencial o aleatorio basado en el PDF (#100045)
    const nextId = this.orders.length > 0
      ? Math.max(...this.orders.map(o => Number(o.id) || 100000)) + 1
      : 100048;
    document.getElementById('order-id').value = nextId;

    // Fecha actual formateada para datetime-local
    const now = new Date();
    const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    document.getElementById('order-fecha').value = localIso;

    // Poblar Selector de Clientes
    const clientSelect = document.getElementById('order-cliente-select');
    clientSelect.innerHTML = this.clients.map(c => `
      <option value="${c.id}" ${c.id === preselectedClientId ? 'selected' : ''}>
        ${c.nombre_razon_social} (${c.segmento} - NIF: ${c.nif_cif})
      </option>
    `).join('');

    // Limpiar tabla de productos del pedido y agregar una fila inicial
    const tbody = document.getElementById('order-items-tbody');
    tbody.innerHTML = '';
    this.addOrderItemRow();

    // Actualizar etiqueta de IVA
    document.getElementById('order-vat-rate-label').textContent = `${this.vatRate}%`;

    this.calcOrderTotals();
    modal.classList.remove('hidden');
    this.renderIcons();
  }

  addOrderItemRow() {
    const tbody = document.getElementById('order-items-tbody');
    if (!tbody) return;

    const rowId = `item-row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tr = document.createElement('tr');
    tr.id = rowId;

    const productOptions = this.products.map(p => `
      <option value="${p.sku}" data-price="${p.precio_venta}" data-stock="${p.stock_disponible}">
        ${p.nombre} (Stock: ${p.stock_disponible}) - ${this.formatMoney(p.precio_venta)}
      </option>
    `).join('');

    const initialProduct = this.products[0] || { sku: '', precio_venta: 0, stock_disponible: 0 };

    tr.innerHTML = `
      <td>
        <select class="order-item-sku w-full px-2 py-1.5 bg-obsidian-900 border border-subtle rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
          ${productOptions}
        </select>
      </td>
      <td>
        <input type="number" min="1" max="${initialProduct.stock_disponible || 999}" value="1" class="order-item-qty w-full px-2 py-1.5 bg-obsidian-900 border border-subtle rounded-lg text-xs text-white font-bold text-center">
      </td>
      <td>
        <input type="number" step="0.01" min="0" value="${initialProduct.precio_venta}" class="order-item-price w-full px-2 py-1.5 bg-obsidian-900 border border-subtle rounded-lg text-xs text-white font-mono text-right">
      </td>
      <td>
        <input type="number" min="0" max="100" value="0" class="order-item-disc w-full px-2 py-1.5 bg-obsidian-900 border border-subtle rounded-lg text-xs text-white text-center">
      </td>
      <td class="text-right font-mono font-semibold text-white order-item-subtotal">
        ${this.formatMoney(initialProduct.precio_venta)}
      </td>
      <td class="text-center">
        <button type="button" onclick="document.getElementById('${rowId}').remove(); window.crmApp.calcOrderTotals();" class="text-gray-500 hover:text-rose-400 p-1">
          ✕
        </button>
      </td>
    `;

    tbody.appendChild(tr);

    // Eventos interactivos en la fila
    const skuSelect = tr.querySelector('.order-item-sku');
    const qtyInput = tr.querySelector('.order-item-qty');
    const priceInput = tr.querySelector('.order-item-price');
    const discInput = tr.querySelector('.order-item-disc');

    skuSelect.addEventListener('change', () => {
      const selectedOption = skuSelect.options[skuSelect.selectedIndex];
      const newPrice = parseFloat(selectedOption.getAttribute('data-price')) || 0;
      const stock = parseInt(selectedOption.getAttribute('data-stock')) || 999;
      priceInput.value = newPrice.toFixed(2);
      qtyInput.max = stock;
      this.calcOrderTotals();
    });

    [qtyInput, priceInput, discInput].forEach(inp => {
      inp.addEventListener('input', () => this.calcOrderTotals());
    });

    this.calcOrderTotals();
  }

  calcOrderTotals() {
    let subtotalSinIva = 0;
    document.querySelectorAll('#order-items-tbody tr').forEach(tr => {
      const qty = parseFloat(tr.querySelector('.order-item-qty')?.value) || 0;
      const price = parseFloat(tr.querySelector('.order-item-price')?.value) || 0;
      const discPct = parseFloat(tr.querySelector('.order-item-disc')?.value) || 0;

      const rawLine = qty * price;
      const discount = rawLine * (discPct / 100);
      const totalLine = rawLine - discount;

      const subtotalDisplay = tr.querySelector('.order-item-subtotal');
      if (subtotalDisplay) {
        subtotalDisplay.textContent = this.formatMoney(totalLine);
      }
      subtotalSinIva += totalLine;
    });

    const vatAmount = subtotalSinIva * (this.vatRate / 100);
    const totalConIva = subtotalSinIva + vatAmount;

    document.getElementById('order-subtotal-display').textContent = this.formatMoney(subtotalSinIva);
    document.getElementById('order-vat-amount-display').textContent = this.formatMoney(vatAmount);
    document.getElementById('order-total-with-vat-display').textContent = this.formatMoney(totalConIva);
  }

  handleOrderSubmit(e) {
    e.preventDefault();
    const rows = document.querySelectorAll('#order-items-tbody tr');
    if (rows.length === 0) {
      alert('Debes agregar al menos un licor al pedido.');
      return;
    }

    const clienteId = Number(document.getElementById('order-cliente-select').value);
    const cliente = this.clients.find(c => c.id === clienteId);

    const items = [];
    let subtotalSinIva = 0;

    for (const tr of rows) {
      const sku = tr.querySelector('.order-item-sku').value;
      const prod = this.products.find(p => p.sku === sku);
      const qty = parseInt(tr.querySelector('.order-item-qty').value) || 1;
      const unitPrice = parseFloat(tr.querySelector('.order-item-price').value) || 0;
      const disc = parseFloat(tr.querySelector('.order-item-disc').value) || 0;

      const totalLine = (qty * unitPrice) * (1 - (disc / 100));
      subtotalSinIva += totalLine;

      items.push({
        sku,
        nombre: prod ? prod.nombre : sku,
        cantidad: qty,
        precio_unitario: unitPrice,
        descuento: disc,
        total_sin_iva: parseFloat(totalLine.toFixed(2))
      });

      // Validar si hay stock
      if (prod && prod.stock_disponible < qty) {
        if (!confirm(`Advertencia: El stock disponible de ${prod.nombre} (${prod.stock_disponible}) es menor que la cantidad solicitada (${qty}). ¿Deseas procesar el pedido como orden anticipada?`)) {
          return;
        }
      }
    }

    const vatAmount = subtotalSinIva * (this.vatRate / 100);
    const totalConIva = subtotalSinIva + vatAmount;
    const estado = document.getElementById('order-estado').value;

    const orderData = {
      id: Number(document.getElementById('order-id').value),
      fecha_pedido: new Date(document.getElementById('order-fecha').value).toISOString(),
      cliente_id: clienteId,
      cliente_nombre: cliente ? cliente.nombre_razon_social : 'Cliente',
      items,
      total_sin_iva: parseFloat(subtotalSinIva.toFixed(2)),
      iva_porcentaje: this.vatRate,
      total_con_iva: parseFloat(totalConIva.toFixed(2)),
      estado,
      forma_pago: document.getElementById('order-forma-pago').value,
      notas_entrega: document.getElementById('order-notas-entrega').value,
      stock_deducted: (estado === 'Enviado' || estado === 'Completo')
    };

    // Si el pedido se marca como Enviado o Completo, descontar stock de bodega
    if (estado === 'Enviado' || estado === 'Completo') {
      for (const item of items) {
        const prod = this.products.find(p => p.sku === item.sku);
        if (prod) {
          prod.stock_disponible = Math.max(0, prod.stock_disponible - item.cantidad);
          prod.unidades_vendidas = (prod.unidades_vendidas || 0) + item.cantidad;
          prod.ventas_periodo = (prod.ventas_periodo || 0) + item.total_sin_iva;
          window.localCRMStore.saveProduct(prod);
        }
      }
    }

    window.localCRMStore.saveOrder(orderData);
    document.getElementById('modal-order').classList.add('hidden');
    this.refreshData();
    this.renderOrdersTable();
    this.renderDashboard();
    this.showToast(`Pedido #${orderData.id} registrado con éxito.`, 'success');
  }

  // Cambio interactivo rápido de estado de pedido con deducción inteligente de stock
  changeOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => String(o.id) === String(orderId));
    if (!order) return;

    const oldStatus = order.estado;
    if (oldStatus === newStatus) return;

    // Deducción automática de stock si pasa a Enviado o Completo y no se había descontado previamente
    if ((newStatus === 'Enviado' || newStatus === 'Completo') && !order.stock_deducted) {
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const prod = this.products.find(p => p.sku === item.sku);
          if (prod) {
            prod.stock_disponible = Math.max(0, Number(prod.stock_disponible) - Number(item.cantidad));
            prod.unidades_vendidas = (Number(prod.unidades_vendidas) || 0) + Number(item.cantidad);
            prod.ventas_periodo = (Number(prod.ventas_periodo) || 0) + (Number(item.total_sin_iva) || 0);
            window.localCRMStore.saveProduct(prod);
          }
        }
      }
      order.stock_deducted = true;
    } else if (newStatus === 'Cancelado' && order.stock_deducted) {
      // Revertir deducción de inventario si se cancela un pedido previamente enviado/completado
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const prod = this.products.find(p => p.sku === item.sku);
          if (prod) {
            prod.stock_disponible = Number(prod.stock_disponible) + Number(item.cantidad);
            prod.unidades_vendidas = Math.max(0, (Number(prod.unidades_vendidas) || 0) - Number(item.cantidad));
            prod.ventas_periodo = Math.max(0, (Number(prod.ventas_periodo) || 0) - (Number(item.total_sin_iva) || 0));
            window.localCRMStore.saveProduct(prod);
          }
        }
      }
      order.stock_deducted = false;
    }

    order.estado = newStatus;
    window.localCRMStore.saveOrder(order);
    this.refreshData();
    this.renderOrdersTable();
    this.renderDashboard();
    this.showToast(`Estado del pedido #${orderId} actualizado a "${newStatus}".`, 'success');
  }

  // Eliminar Pedido
  deleteOrder(id) {
    if (confirm(`¿Estás seguro de que deseas eliminar el pedido #${id}? Esta acción no se puede deshacer.`)) {
      window.localCRMStore.deleteOrder(id);
      this.refreshData();
      this.renderOrdersTable();
      this.renderDashboard();
      this.showToast(`Pedido #${id} eliminado correctamente.`, 'info');
    }
  }

  // Comprobante / Factura Imprimible
  printReceipt(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const client = this.clients.find(c => c.id === order.cliente_id) || {
      nombre_razon_social: order.cliente_nombre,
      nif_cif: 'Consumidor Final',
      direccion: 'Despacho Local',
      contacto_principal: 'General'
    };

    document.getElementById('receipt-order-id').textContent = `#${order.id}`;
    document.getElementById('receipt-order-date').textContent = new Date(order.fecha_pedido).toLocaleString('es-ES');
    document.getElementById('receipt-order-payment').textContent = `Pago: ${order.forma_pago} (${order.estado})`;
    document.getElementById('receipt-client-name').textContent = client.nombre_razon_social;
    document.getElementById('receipt-client-nif').textContent = `NIF/CIF/Identidad: ${client.nif_cif}`;
    document.getElementById('receipt-client-address').textContent = `Dirección: ${client.direccion || 'No especificada'}`;
    document.getElementById('receipt-client-contact').textContent = `Contacto: ${client.contacto_principal || client.telefono || 'Directo'}`;

    const itemsTbody = document.getElementById('receipt-items-tbody');
    itemsTbody.innerHTML = (order.items || []).map(i => `
      <tr>
        <td>
          <span class="font-bold text-white text-xs">${i.nombre || i.sku}</span>
          <span class="block text-[10px] text-gray-400 font-mono">${i.sku}</span>
        </td>
        <td class="text-center font-bold text-xs">${i.cantidad}</td>
        <td class="text-right font-mono text-xs">${this.formatMoney(i.precio_unitario)}</td>
        <td class="text-center text-xs text-amber-400">${i.descuento ? `${i.descuento}%` : '-'}</td>
        <td class="text-right font-mono font-semibold text-xs">${this.formatMoney(i.total_sin_iva)}</td>
      </tr>
    `).join('');

    document.getElementById('receipt-subtotal').textContent = this.formatMoney(order.total_sin_iva);
    document.getElementById('receipt-vat-rate').textContent = `${order.iva_porcentaje || 21}%`;
    const vatAmount = (order.total_sin_iva * ((order.iva_porcentaje || 21) / 100));
    document.getElementById('receipt-vat').textContent = this.formatMoney(vatAmount);
    document.getElementById('receipt-total').textContent = this.formatMoney(order.total_con_iva);
    document.getElementById('receipt-delivery-notes').textContent = order.notas_entrega || 'Sin notas especiales.';

    document.getElementById('printable-receipt-modal').classList.remove('hidden');
    this.renderIcons();
  }

  // ========================================================================
  // SECCIÓN 5: TICKETS DE SOPORTE & POST-VENTA
  // ========================================================================
  renderTicketsTable() {
    const tbody = document.getElementById('tickets-table-tbody');
    if (!tbody) return;

    const query = (document.getElementById('tickets-search-input')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('tickets-status-filter')?.value || 'ALL';

    const filtered = this.tickets.filter(t => {
      const matchQuery = String(t.id).includes(query) ||
                         (t.cliente_nombre || '').toLowerCase().includes(query) ||
                         (t.asunto || '').toLowerCase().includes(query) ||
                         (t.asignado_a || '').toLowerCase().includes(query);
      const matchStatus = statusFilter === 'ALL' || t.estado === statusFilter;
      return matchQuery && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center py-6 text-gray-500">No hay tickets de soporte registrados con estos criterios.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const prioClass = t.prioridad === 'Alta'
        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        : t.prioridad === 'Media'
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';

      const statusClass = t.estado === 'Cerrado'
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : t.estado === 'En Proceso'
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';

      return `
        <tr>
          <td class="font-mono text-xs font-bold text-amber-500">#${t.id}</td>
          <td class="text-xs text-gray-400">${new Date(t.fecha_hora).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
          <td class="font-bold text-white text-xs">${t.cliente_nombre || 'Cliente'}</td>
          <td>
            <div class="font-semibold text-white text-xs">${t.asunto}</div>
            <div class="text-[11px] text-gray-400 truncate max-w-[220px]" title="${t.descripcion}">${t.descripcion}</div>
          </td>
          <td>
            <span class="px-2 py-0.5 rounded text-xs font-semibold ${statusClass}">
              ${t.estado}
            </span>
          </td>
          <td>
            <span class="px-2 py-0.5 rounded text-xs font-semibold ${prioClass}">
              ${t.prioridad}
            </span>
          </td>
          <td class="text-xs text-gray-300">${t.asignado_a || 'Sin asignar'}</td>
          <td class="text-xs text-gray-400 max-w-[180px] truncate" title="${t.resolucion || 'Pendiente de resolución'}">
            ${t.resolucion ? `✓ ${t.resolucion}` : '<span class="italic text-gray-500">Pendiente</span>'}
          </td>
          <td class="text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="window.crmApp.openTicketModal(${t.id})" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-obsidian-800 text-amber-400 hover:bg-amber-500 hover:text-obsidian-950 transition-colors border border-amber-500/30">
                Gestionar
              </button>
              <button onclick="window.crmApp.deleteTicket(${t.id})" title="Eliminar Ticket" class="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderIcons();
  }

  openTicketModal(ticketId = null) {
    const modal = document.getElementById('modal-ticket');
    const title = document.getElementById('modal-ticket-title');
    const form = document.getElementById('form-ticket');
    form.reset();

    // Poblar Selector de Clientes
    const clientSelect = document.getElementById('ticket-cliente-select');
    clientSelect.innerHTML = this.clients.map(c => `
      <option value="${c.id}">${c.nombre_razon_social}</option>
    `).join('');

    if (ticketId) {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (ticket) {
        title.textContent = `Gestionar Ticket #${ticket.id}`;
        document.getElementById('ticket-form-id').value = ticket.id;
        document.getElementById('ticket-id').value = ticket.id;
        document.getElementById('ticket-fecha').value = new Date(ticket.fecha_hora).toISOString().slice(0, 16);
        document.getElementById('ticket-cliente-select').value = ticket.cliente_id;
        document.getElementById('ticket-asunto').value = ticket.asunto;
        document.getElementById('ticket-descripcion').value = ticket.descripcion;
        document.getElementById('ticket-estado').value = ticket.estado;
        document.getElementById('ticket-prioridad').value = ticket.prioridad;
        document.getElementById('ticket-asignado').value = ticket.asignado_a || '';
        document.getElementById('ticket-resolucion').value = ticket.resolucion || '';
      }
    } else {
      title.textContent = 'Registrar Ticket de Soporte Post-Venta';
      const nextId = this.tickets.length > 0
        ? Math.max(...this.tickets.map(t => Number(t.id) || 202640)) + 1
        : 202648;
      document.getElementById('ticket-form-id').value = '';
      document.getElementById('ticket-id').value = nextId;

      const now = new Date();
      const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      document.getElementById('ticket-fecha').value = localIso;
    }

    modal.classList.remove('hidden');
    this.renderIcons();
  }

  handleTicketSubmit(e) {
    e.preventDefault();
    const idVal = document.getElementById('ticket-form-id').value;
    const ticketId = idVal ? Number(idVal) : Number(document.getElementById('ticket-id').value);
    const clienteId = Number(document.getElementById('ticket-cliente-select').value);
    const cliente = this.clients.find(c => c.id === clienteId);

    const ticketData = {
      id: ticketId,
      fecha_hora: new Date(document.getElementById('ticket-fecha').value).toISOString(),
      cliente_id: clienteId,
      cliente_nombre: cliente ? cliente.nombre_razon_social : 'Cliente',
      asunto: document.getElementById('ticket-asunto').value,
      descripcion: document.getElementById('ticket-descripcion').value,
      estado: document.getElementById('ticket-estado').value,
      prioridad: document.getElementById('ticket-prioridad').value,
      asignado_a: document.getElementById('ticket-asignado').value,
      resolucion: document.getElementById('ticket-resolucion').value
    };

    window.localCRMStore.saveTicket(ticketData);
    document.getElementById('modal-ticket').classList.add('hidden');
    this.refreshData();
    this.renderTicketsTable();
    this.renderDashboard();
    this.showToast(`Ticket #${ticketData.id} actualizado con éxito.`, 'success');
  }

  deleteTicket(id) {
    if (confirm(`¿Estás seguro de que deseas eliminar el ticket #${id}?`)) {
      window.localCRMStore.deleteTicket(id);
      this.refreshData();
      this.renderTicketsTable();
      this.renderDashboard();
      this.showToast(`Ticket #${id} eliminado correctamente.`, 'info');
    }
  }

  // Toast Notificaciones
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const typeClasses = {
      success: 'bg-obsidian-900 border border-emerald-500/40 text-emerald-300',
      error: 'bg-obsidian-900 border border-mega-500/50 text-mega-400',
      info: 'bg-obsidian-900 border border-mega-500/40 text-white'
    };

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };

    toast.className = `toast ${typeClasses[type] || typeClasses.info}`;
    toast.innerHTML = `
      <span class="font-bold text-base">${icons[type] || 'ℹ'}</span>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.crmApp = new LicoreraCRMApp();
});
