/**
 * CRM LICORERA PREMIUM - DATOS INICIALES Y GESTOR DE ALMACENAMIENTO
 * Basado fielmente en el Informe CRM para Empresa Licorera (Universidad Técnica de Ambato)
 */

const DEFAULT_INITIAL_DATA = {
  settings: {
    currency: 'EUR', // 'EUR' o 'USD' (el PDF muestra EUR y $)
    currencySymbol: '€',
    vatRate: 21, // 21% según el PDF
    storeName: 'LICORES MEGA',
    storeNif: '1792348571001',
    storePhone: '+593 98 765 4321',
    storeAddress: 'Av. Principal y Los Álamos, Bodega Central',
    storeEmail: 'contacto@licoresmega.com'
  },
  clients: [
    {
      id: 101,
      nombre_razon_social: 'Distribuidora La Luz S.A.',
      nif_cif: 'B12345678',
      fecha_nacimiento: '1980-05-15',
      contacto_principal: 'Juan Gómez - 987654321',
      email: 'contacto@distribuidoralaluz.com',
      telefono: '+34 600 123 456',
      direccion: 'Calle Falsa 123, Ciudad',
      segmento: 'Mayorista',
      notas_internas: 'Histórico del cliente: cliente VIP mayorista desde 2024. Prefiere entregas matutinas y pedidos en pallets.'
    },
    {
      id: 102,
      nombre_razon_social: 'María Pérez Cárdenas',
      nif_cif: '1712498765',
      fecha_nacimiento: '1992-08-22',
      contacto_principal: 'María Pérez',
      email: 'maria.perez@email.com',
      telefono: '+593 98 765 4321',
      direccion: 'Av. De Las Américas 450, Res. El Bosque',
      segmento: 'Minorista',
      notas_internas: 'Cliente recurrente. Coleccionista de vinos de autor y whiskies single malt.'
    },
    {
      id: 103,
      nombre_razon_social: 'Bar & Lounge Eclipse Nocturno',
      nif_cif: 'B98765432',
      fecha_nacimiento: '1988-11-04',
      contacto_principal: 'Carlos Mendoza',
      email: 'eventos@eclipsebar.com',
      telefono: '+34 655 443 221',
      direccion: 'Plaza Mayor 14, Centro Histórico',
      segmento: 'Mayorista',
      notas_internas: 'Alto volumen mensual. Consumo clave: Ginebra premium, whisky blended y cervezas artesanales para coctelería.'
    },
    {
      id: 104,
      nombre_razon_social: 'Andrés Salazar Viteri',
      nif_cif: '0928374615',
      fecha_nacimiento: '1995-03-10',
      contacto_principal: 'Andrés Salazar',
      email: 'andres.salazar@mail.com',
      telefono: '+593 99 112 2334',
      direccion: 'Urbanización Los Cedros, Villa 12',
      segmento: 'Online',
      notas_internas: 'Canal digital. Realiza pedidos frecuentes los viernes por la tarde mediante WhatsApp y entrega por delivery.'
    }
  ],
  products: [
    {
      // 1. Identificación
      sku: 'LIC-001',
      nombre: 'Whisky Johnnie Walker Red Label',
      marca: 'Johnnie Walker',
      categoria: 'Whisky',
      subcategoria: 'Whisky escocés',
      codigo_barras: '5000267023650',
      // 2. Características
      tipo_bebida: 'Whisky',
      presentacion: 'Botella',
      contenido: '750 ml',
      graduacion: '40%',
      pais_origen: 'Escocia',
      descripcion: 'Whisky blended de perfil suave, vibrante y versátil, con toques ahumados, vainilla y especias canela.',
      // 3. Comercialización
      precio_venta: 35.00,
      costo_adquisicion: 25.00,
      margen_utilidad: 10.00,
      precio_mayorista: 31.00,
      precio_promocional: 32.99,
      proveedor: 'Distribuidor X',
      marca_proveedor_principal: 'Distribuidor autorizado',
      // 4. Inventario
      stock_disponible: 45,
      stock_minimo: 10,
      stock_maximo: 100,
      ubicacion: 'Bodega – Estante 3',
      fecha_ingreso: '2026-09-05',
      lote: 'L-2026-045',
      // 5. Ventas
      unidades_vendidas: 120,
      ventas_periodo: 4200.00,
      frecuencia_venta: '15 unidades/semana',
      canal_venta: 'Local / WhatsApp / delivery',
      ticket_promedio: 48.00,
      // 6. Promociones
      promociones_aplicadas: '10% de descuento',
      cupones_utilizados: 'CUP-001',
      campanas_asociadas: 'Campaña Día del Padre',
      resultado_promocion: '+25% ventas',
      // 7. Rentabilidad
      utilidad_unidad: 10.00,
      margen_porcentual: 28.57,
      rentabilidad_producto: 1200.00,
      rotacion: 'Alta'
    },
    {
      sku: 'LIC-002',
      nombre: 'Vino Tinto Reserva Marques de Riscal',
      marca: 'Marqués de Riscal',
      categoria: 'Vino',
      subcategoria: 'Tinto Reserva Rioja',
      codigo_barras: '8410870001015',
      tipo_bebida: 'Vino Tinto',
      presentacion: 'Botella',
      contenido: '750 ml',
      graduacion: '14%',
      pais_origen: 'España',
      descripcion: 'Vino tinto reserva de gran equilibrio y finura, envejecido en barricas de roble americano y francés.',
      precio_venta: 22.00,
      costo_adquisicion: 15.00,
      margen_utilidad: 7.00,
      precio_mayorista: 19.50,
      precio_promocional: 20.00,
      proveedor: 'Bodegas del Duero Import',
      marca_proveedor_principal: 'Marqués de Riscal S.A.',
      stock_disponible: 80,
      stock_minimo: 15,
      stock_maximo: 150,
      ubicacion: 'Cava Climatizada – Estante 1',
      fecha_ingreso: '2026-08-28',
      lote: 'L-2026-022',
      unidades_vendidas: 95,
      ventas_periodo: 2090.00,
      frecuencia_venta: '12 unidades/semana',
      canal_venta: 'Local / Restaurantes',
      ticket_promedio: 66.00,
      promociones_aplicadas: '5% en compras sobre 6 botellas',
      cupones_utilizados: 'CUP-RIOJA',
      campanas_asociadas: 'Festival de Otoño',
      resultado_promocion: '+18% ventas',
      utilidad_unidad: 7.00,
      margen_porcentual: 31.82,
      rentabilidad_producto: 665.00,
      rotacion: 'Alta'
    },
    {
      sku: 'LIC-003',
      nombre: 'Cerveza Artesanal IPA Doble Lúpulo',
      marca: 'Cervecería Andina',
      categoria: 'Cerveza',
      subcategoria: 'India Pale Ale',
      codigo_barras: '7861009923841',
      tipo_bebida: 'Cerveza Artesanal',
      presentacion: 'Botella',
      contenido: '330 ml',
      graduacion: '6.5%',
      pais_origen: 'Ecuador',
      descripcion: 'Intenso aroma cítrico, maracuyá y pino gracias a la técnica de dry hopping con lúpulos Cascade y Citra.',
      precio_venta: 3.50,
      costo_adquisicion: 2.00,
      margen_utilidad: 1.50,
      precio_mayorista: 2.80,
      precio_promocional: 3.00,
      proveedor: 'Craft Brewers Co.',
      marca_proveedor_principal: 'Cervecería Andina Cía.',
      stock_disponible: 120,
      stock_minimo: 24,
      stock_maximo: 250,
      ubicacion: 'Cámara Fría – Nivel 2',
      fecha_ingreso: '2026-09-08',
      lote: 'L-2026-IPA-12',
      unidades_vendidas: 340,
      ventas_periodo: 1190.00,
      frecuencia_venta: '40 unidades/semana',
      canal_venta: 'Local / Delivery',
      ticket_promedio: 21.00,
      promociones_aplicadas: 'Pack 6x5',
      cupones_utilizados: 'CUP-BEER6',
      campanas_asociadas: 'Tardes de Verano',
      resultado_promocion: '+30% ventas',
      utilidad_unidad: 1.50,
      margen_porcentual: 42.86,
      rentabilidad_producto: 510.00,
      rotacion: 'Alta'
    },
    {
      sku: 'LIC-004',
      nombre: 'Gin Hendrick\'s Premium Botánico',
      marca: 'Hendrick\'s',
      categoria: 'Ginebra',
      subcategoria: 'Gin Escocés Botánico',
      codigo_barras: '5010314050012',
      tipo_bebida: 'Gin Premium',
      presentacion: 'Botella',
      contenido: '750 ml',
      graduacion: '41.4%',
      pais_origen: 'Escocia',
      descripcion: 'Destilación única en alambiques Carter-Head y Bennett con infusión final de pepino fresco y rosas de Bulgaria.',
      precio_venta: 42.00,
      costo_adquisicion: 29.00,
      margen_utilidad: 13.00,
      precio_mayorista: 37.00,
      precio_promocional: 39.50,
      proveedor: 'Global Spirits Alliance',
      marca_proveedor_principal: 'William Grant & Sons',
      stock_disponible: 28,
      stock_minimo: 8,
      stock_maximo: 60,
      ubicacion: 'Vitrina VIP – Estante A',
      fecha_ingreso: '2026-09-01',
      lote: 'L-2026-GIN-88',
      unidades_vendidas: 45,
      ventas_periodo: 1890.00,
      frecuencia_venta: '6 unidades/semana',
      canal_venta: 'WhatsApp / Local',
      ticket_promedio: 84.00,
      promociones_aplicadas: 'Mixer tónica de regalo',
      cupones_utilizados: 'CUP-TONIC',
      campanas_asociadas: 'Coctelería de Autor',
      resultado_promocion: '+15% ventas',
      utilidad_unidad: 13.00,
      margen_porcentual: 30.95,
      rentabilidad_producto: 585.00,
      rotacion: 'Media'
    },
    {
      sku: 'LIC-005',
      nombre: 'Tequila Don Julio 1942 Añejo',
      marca: 'Don Julio',
      categoria: 'Tequila',
      subcategoria: 'Tequila Añejo',
      codigo_barras: '7501007788992',
      tipo_bebida: 'Tequila Ultra Premium',
      presentacion: 'Botella de Lujo',
      contenido: '750 ml',
      graduacion: '38%',
      pais_origen: 'México',
      descripcion: 'Elaborado 100% de agave azul seleccionado y reposado por 2.5 años en barricas de roble blanco americano.',
      precio_venta: 165.00,
      costo_adquisicion: 115.00,
      margen_utilidad: 50.00,
      precio_mayorista: 145.00,
      precio_promocional: 155.00,
      proveedor: 'Agave Imports International',
      marca_proveedor_principal: 'Diageo México',
      stock_disponible: 7, // Cerca del stock mínimo (alerta)
      stock_minimo: 8,
      stock_maximo: 20,
      ubicacion: 'Caja Fuerte / Vitrina Cerrada',
      fecha_ingreso: '2026-08-15',
      lote: 'L-2026-TEQ-03',
      unidades_vendidas: 14,
      ventas_periodo: 2310.00,
      frecuencia_venta: '2 unidades/semana',
      canal_venta: 'Local VIP / Eventos',
      ticket_promedio: 165.00,
      promociones_aplicadas: 'Sin promoción',
      cupones_utilizados: '',
      campanas_asociadas: 'Edición Coleccionista',
      resultado_promocion: 'Estable',
      utilidad_unidad: 50.00,
      margen_porcentual: 30.30,
      rentabilidad_producto: 700.00,
      rotacion: 'Baja'
    },
    {
      sku: 'LIC-006',
      nombre: 'Ron Zacapa Centenario 23 Solera',
      marca: 'Zacapa',
      categoria: 'Ron',
      subcategoria: 'Ron Añejo Solera Gran Reserva',
      codigo_barras: '7401005001123',
      tipo_bebida: 'Ron Premium',
      presentacion: 'Botella',
      contenido: '750 ml',
      graduacion: '40%',
      pais_origen: 'Guatemala',
      descripcion: 'Miel virgen de caña destilada y añejada en las nubes a 2.300 m de altitud por sistema Solera tradicional.',
      precio_venta: 58.00,
      costo_adquisicion: 40.00,
      margen_utilidad: 18.00,
      precio_mayorista: 50.00,
      precio_promocional: 52.00,
      proveedor: 'Caribe Spirits S.A.',
      marca_proveedor_principal: 'Industrias Licoreras de Guatemala',
      stock_disponible: 18,
      stock_minimo: 5,
      stock_maximo: 40,
      ubicacion: 'Bodega – Estante 2',
      fecha_ingreso: '2026-09-02',
      lote: 'L-2026-RON-44',
      unidades_vendidas: 38,
      ventas_periodo: 2204.00,
      frecuencia_venta: '5 unidades/semana',
      canal_venta: 'Local / Delivery',
      ticket_promedio: 116.00,
      promociones_aplicadas: 'Copa de cata grabada',
      cupones_utilizados: 'CUP-CATA',
      campanas_asociadas: 'Gourmet Club',
      resultado_promocion: '+12% ventas',
      utilidad_unidad: 18.00,
      margen_porcentual: 31.03,
      rentabilidad_producto: 684.00,
      rotacion: 'Media'
    }
  ],
  orders: [
    {
      id: 100045,
      fecha_pedido: '2026-09-01T10:15:00',
      cliente_id: 101,
      cliente_nombre: 'Distribuidora La Luz S.A.',
      items: [
        {
          sku: 'LIC-002',
          nombre: 'Vino Tinto Reserva Marques de Riscal',
          cantidad: 50,
          precio_unitario: 5.00,
          descuento: 0,
          total_sin_iva: 250.00
        },
        {
          sku: 'LIC-003',
          nombre: 'Cerveza Artesanal IPA Doble Lúpulo',
          cantidad: 100,
          precio_unitario: 1.50,
          descuento: 10,
          total_sin_iva: 135.00
        },
        {
          sku: 'LIC-004',
          nombre: 'Gin Hendrick\'s Premium Botánico',
          cantidad: 20,
          precio_unitario: 12.00,
          descuento: 5,
          total_sin_iva: 228.00
        }
      ],
      total_sin_iva: 2350.00, // Según tabla resumen del PDF
      iva_porcentaje: 21,
      total_con_iva: 2843.50, // Según tabla resumen del PDF
      estado: 'Pendiente', // Pendiente / Enviado / Completo
      forma_pago: 'Transferencia', // Transferencia / Tarjeta / Contado
      notas_entrega: 'Entregar en horario matutino. Verificar sellos fiscales en cajas de vino.'
    },
    {
      id: 100046,
      fecha_pedido: '2026-09-03T16:45:00',
      cliente_id: 103,
      cliente_nombre: 'Bar & Lounge Eclipse Nocturno',
      items: [
        {
          sku: 'LIC-001',
          nombre: 'Whisky Johnnie Walker Red Label',
          cantidad: 12,
          precio_unitario: 31.00,
          descuento: 5,
          total_sin_iva: 353.40
        },
        {
          sku: 'LIC-004',
          nombre: 'Gin Hendrick\'s Premium Botánico',
          cantidad: 6,
          precio_unitario: 37.00,
          descuento: 0,
          total_sin_iva: 222.00
        }
      ],
      total_sin_iva: 575.40,
      iva_porcentaje: 21,
      total_con_iva: 696.23,
      estado: 'Completo',
      forma_pago: 'Tarjeta',
      notas_entrega: 'Entrega prioritaria para abastecimiento de fin de semana en barra VIP.'
    },
    {
      id: 100047,
      fecha_pedido: '2026-09-04T12:30:00',
      cliente_id: 102,
      cliente_nombre: 'María Pérez Cárdenas',
      items: [
        {
          sku: 'LIC-006',
          nombre: 'Ron Zacapa Centenario 23 Solera',
          cantidad: 2,
          precio_unitario: 58.00,
          descuento: 0,
          total_sin_iva: 116.00
        }
      ],
      total_sin_iva: 116.00,
      iva_porcentaje: 21,
      total_con_iva: 140.36,
      estado: 'Enviado',
      forma_pago: 'Contado',
      notas_entrega: 'Empaque de regalo con moño y tarjeta dedicatoria.'
    }
  ],
  tickets: [
    {
      id: 202645,
      fecha_hora: '2026-09-02T14:30:00',
      cliente_id: 101,
      cliente_nombre: 'Distribuidora La Luz S.A.',
      asunto: 'Consulta sobre pedido #100045',
      descripcion: 'Cliente pregunta cuándo llegará el pedido con las cajas de vino y ginebras.',
      estado: 'Cerrado', // Abierto / En Proceso / Cerrado
      prioridad: 'Alta', // Alta / Media / Baja
      asignado_a: 'Soporte Técnico - Ana López',
      resolucion: 'Se confirmó entrega para el 3/9 en horario matutino. Guía de transporte compartida por WhatsApp.'
    },
    {
      id: 202646,
      fecha_hora: '2026-09-04T11:20:00',
      cliente_id: 103,
      cliente_nombre: 'Bar & Lounge Eclipse Nocturno',
      asunto: 'Solicitud de ampliación de límite de crédito para temporada alta',
      descripcion: 'El cliente solicita elevar el límite de crédito de 8.000 EUR a 12.000 EUR por aperturas de nuevas salas y eventos corporativos.',
      estado: 'En Proceso',
      prioridad: 'Media',
      asignado_a: 'Finanzas - Roberto Paz',
      resolucion: 'Revisando estados de cuenta y puntualidad de pago de los últimos 6 meses. Comportamiento intachable.'
    },
    {
      id: 202647,
      fecha_hora: '2026-09-05T09:15:00',
      cliente_id: 104,
      cliente_nombre: 'Andrés Salazar Viteri',
      asunto: 'Duda sobre tiempo estimado de entrega delivery express',
      descripcion: 'Pregunta si los pedidos hechos el viernes después de las 18:00 tienen recargo o llegan antes de las 20:00.',
      estado: 'Abierto',
      prioridad: 'Baja',
      asignado_a: 'Logística - Diego Morales',
      resolucion: ''
    }
  ]
};

/**
 * Gestor de Almacenamiento Local (Persistencia híbrida)
 */
class LocalStorageStore {
  constructor(storageKey = 'crm_licorera_db_v3') {
    this.storageKey = storageKey;
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      this.resetToDefaults();
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : DEFAULT_INITIAL_DATA;
    } catch (e) {
      console.error('Error leyendo LocalStorage:', e);
      return DEFAULT_INITIAL_DATA;
    }
  }

  saveAll(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error guardando en LocalStorage:', e);
      return false;
    }
  }

  resetToDefaults() {
    this.saveAll(JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA)));
    return this.getAll();
  }

  exportJson() {
    const data = this.getAll();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crm_licorera_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.clients && parsed.products && parsed.orders) {
        this.saveAll(parsed);
        return { success: true };
      } else {
        return { success: false, error: 'Estructura de respaldo inválida' };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // --- Clientes ---
  getClients() {
    return this.getAll().clients || [];
  }
  saveClient(client) {
    const data = this.getAll();
    const idx = data.clients.findIndex(c => String(c.id) === String(client.id));
    if (idx >= 0) data.clients[idx] = client;
    else data.clients.push(client);
    this.saveAll(data);
    return client;
  }
  deleteClient(id) {
    const data = this.getAll();
    data.clients = data.clients.filter(c => String(c.id) !== String(id));
    this.saveAll(data);
    return true;
  }

  // --- Productos ---
  getProducts() {
    return this.getAll().products || [];
  }
  saveProduct(product) {
    const data = this.getAll();
    const idx = data.products.findIndex(p => p.sku === product.sku);
    if (idx >= 0) data.products[idx] = product;
    else data.products.push(product);
    this.saveAll(data);
    return product;
  }
  deleteProduct(sku) {
    const data = this.getAll();
    data.products = data.products.filter(p => p.sku !== sku);
    this.saveAll(data);
    return true;
  }

  // --- Pedidos ---
  getOrders() {
    return this.getAll().orders || [];
  }
  saveOrder(order) {
    const data = this.getAll();
    const idx = data.orders.findIndex(o => String(o.id) === String(order.id));
    if (idx >= 0) data.orders[idx] = order;
    else data.orders.unshift(order);
    this.saveAll(data);
    return order;
  }

  deleteOrder(id) {
    const data = this.getAll();
    data.orders = data.orders.filter(o => String(o.id) !== String(id));
    this.saveAll(data);
    return true;
  }

  // --- Tickets ---
  getTickets() {
    return this.getAll().tickets || [];
  }
  saveTicket(ticket) {
    const data = this.getAll();
    const idx = data.tickets.findIndex(t => String(t.id) === String(ticket.id));
    if (idx >= 0) data.tickets[idx] = ticket;
    else data.tickets.unshift(ticket);
    this.saveAll(data);
    return ticket;
  }
  deleteTicket(id) {
    const data = this.getAll();
    data.tickets = data.tickets.filter(t => String(t.id) !== String(id));
    this.saveAll(data);
    return true;
  }

  // ========================================================================
  // EXPORTACIÓN A CSV NATIVA (COMPATIBLE CON EXCEL / SHEETS)
  // ========================================================================
  downloadCsv(filename, csvContent) {
    // UTF-8 BOM (\uFEFF) para que Excel abra acentos, tildes y ñ sin errores de codificación
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  exportClientsCsv() {
    const clients = this.getClients();
    const headers = ['ID', 'Nombre / Razon Social', 'NIF/CIF', 'Fecha Nacimiento', 'Mayor de Edad (+18)', 'Segmento', 'Contacto Principal', 'Telefono', 'Email', 'Direccion', 'Notas'];
    const rows = clients.map(c => {
      const isAdult = c.fecha_nacimiento ? (new Date().getFullYear() - new Date(c.fecha_nacimiento).getFullYear() >= 18 ? 'SI' : 'NO') : 'SI';
      return [
        c.id,
        `"${(c.nombre_razon_social || '').replace(/"/g, '""')}"`,
        `"${(c.nif_cif || '').replace(/"/g, '""')}"`,
        c.fecha_nacimiento || '',
        isAdult,
        `"${(c.segmento || '').replace(/"/g, '""')}"`,
        `"${(c.contacto_principal || '').replace(/"/g, '""')}"`,
        `"${(c.telefono || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.direccion || '').replace(/"/g, '""')}"`,
        `"${(c.notas_internas || '').replace(/"/g, '""')}"`
      ].join(';');
    });
    const csvContent = [headers.join(';'), ...rows].join('\r\n');
    this.downloadCsv(`clientes_licores_mega_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  }

  exportProductsCsv() {
    const products = this.getProducts();
    const headers = [
      'SKU', 'Nombre', 'Marca', 'Categoria', 'Subcategoria', 'Tipo Bebida',
      'Presentacion', 'Contenido (ml)', 'Graduacion (% ABV)', 'Pais Origen',
      'Precio Venta', 'Costo', 'Utilidad Unidad', 'Margen %',
      'Stock Disponible', 'Stock Minimo', 'Ubicacion Bodega', 'Lote',
      'Unidades Vendidas', 'Ventas Periodo', 'Canal Venta', 'Rotacion'
    ];
    const rows = products.map(p => {
      return [
        `"${(p.sku || '').replace(/"/g, '""')}"`,
        `"${(p.nombre || '').replace(/"/g, '""')}"`,
        `"${(p.marca || '').replace(/"/g, '""')}"`,
        `"${(p.categoria || '').replace(/"/g, '""')}"`,
        `"${(p.subcategoria || '').replace(/"/g, '""')}"`,
        `"${(p.tipo_bebida || '').replace(/"/g, '""')}"`,
        `"${(p.presentacion || '').replace(/"/g, '""')}"`,
        p.contenido || '',
        p.graduacion || '',
        `"${(p.pais_origen || '').replace(/"/g, '""')}"`,
        p.precio_venta || 0,
        p.costo_adquisicion || 0,
        p.utilidad_unidad || 0,
        p.margen_porcentual || 0,
        p.stock_disponible || 0,
        p.stock_minimo || 0,
        `"${(p.ubicacion || '').replace(/"/g, '""')}"`,
        `"${(p.lote || '').replace(/"/g, '""')}"`,
        p.unidades_vendidas || 0,
        p.ventas_periodo || 0,
        `"${(p.canal_venta || '').replace(/"/g, '""')}"`,
        `"${(p.rotacion || '').replace(/"/g, '""')}"`
      ].join(';');
    });
    const csvContent = [headers.join(';'), ...rows].join('\r\n');
    this.downloadCsv(`catalogo_licores_mega_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  }

  exportOrdersCsv() {
    const orders = this.getOrders();
    const headers = ['ID Pedido', 'Fecha', 'Cliente', 'Items (Detalle)', 'Total sin IVA', 'IVA %', 'Total con IVA', 'Estado', 'Forma Pago', 'Notas Entrega'];
    const rows = orders.map(o => {
      const itemsStr = Array.isArray(o.items)
        ? o.items.map(i => `${i.cantidad}x ${i.nombre || i.sku} (${i.precio_unitario}€)`).join(' | ')
        : '';
      return [
        o.id,
        o.fecha_pedido || '',
        `"${(o.cliente_nombre || '').replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.total_sin_iva || 0,
        o.iva_porcentaje || 21,
        o.total_con_iva || 0,
        `"${(o.estado || '').replace(/"/g, '""')}"`,
        `"${(o.forma_pago || '').replace(/"/g, '""')}"`,
        `"${(o.notas_entrega || '').replace(/"/g, '""')}"`
      ].join(';');
    });
    const csvContent = [headers.join(';'), ...rows].join('\r\n');
    this.downloadCsv(`pedidos_licores_mega_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  }
}

// Instancia global del almacenamiento local
window.localCRMStore = new LocalStorageStore();
