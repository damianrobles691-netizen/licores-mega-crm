[README.md](https://github.com/user-attachments/files/32585664/README.md)
# 🍷 LICORES MEGA - CRM LICORERA PREMIUM

Aplicación web tipo CRM diseñada específicamente para **LICORES MEGA**, con una interfaz moderna, minimalista y profesional con la identidad corporativa oficial: **Rojo Carmesí Mega**, **Negro Obsidiana Profundo** y **Blanco Puro**.

Desarrollada con base en el **Informe CRM para Empresa Licorera** de la **Universidad Técnica de Ambato (Mercadotecnia - Séptimo "B")**.

---

## 🎨 Identidad Visual & Paleta de Colores

- **Isotipo Oficial**: Botella estilizada con emblema "M" en rojo sobre fondo negro (`assets/isotipo.png`), integrado como Favicon del navegador, avatar en la barra superior y distintivo en los modales.
- **Logo Oficial**: Emblema con la marca nominativa "LICORES MEGA" (`assets/logo.png`), ubicado en la cabecera del panel lateral y en el encabezado del comprobante de venta imprimible.
- **Paleta Cromática de Marca**:
  - **Rojo Carmesí Mega (`#F4060E` / rgb(244, 6, 14))**: Color de acción principal, botones con resplandor carmesí, estados activos y acentos de navegación.
  - **Negro Obsidiana (`#08080A` / `#0E0E12` / `#14141A`)**: Fondos de ultra alto contraste inspirados en las botellas de licor de lujo.
  - **Blanco Puro (`#FFFFFF`)**: Tipografía principal nítida, métricas de alto impacto y líneas de datos en gráficos.

---

## 🚀 Características Principales

### 1. Gestión de Clientes (B2B / B2C)
- Directorio de clientes con clasificación por segmento: **Mayorista**, **Minorista** y **Online**.
- **Verificación obligatoria de mayoría de edad (+18)** mediante cálculo automático de fecha de nacimiento.
- Registro de datos de contacto, dirección de despacho, historial de visitas y notas internas.

### 2. Catálogo Maestro y Ficha Técnica de Licores (Las 7 Dimensiones del PDF)
Cada licor se gestiona mediante una ficha interactiva estructurada en 7 pestañas:
1. **Identificación**: SKU (Código interno), Nombre del producto, Marca, Categoría, Subcategoría y Código de barras.
2. **Características**: Tipo de bebida, Presentación (Botella, Pack, Barril, Caja), Contenido (ml), Graduación alcohólica (% ABV), País de origen y Descripción / Notas de cata.
3. **Comercialización**: Precio de venta, Costo de adquisición, **Calculadora en vivo de Margen de Utilidad ($ y %)**, Precio mayorista, Precio promocional y Proveedor principal.
4. **Inventario**: Stock disponible, **Stock mínimo (con alerta visual y semáforo)**, Stock máximo, Ubicación en bodega/cava (ej. Bodega Central – Estante 3), Fecha de ingreso y Lote.
5. **Ventas**: Unidades vendidas, Ventas por período, Frecuencia de venta (unidades/semana), Canal de venta habitual y Ticket promedio.
6. **Promociones**: Promociones aplicadas, Cupones utilizados (ej. `CUP-001`), Campañas asociadas y Resultado de la promoción (% impacto en ventas).
7. **Rentabilidad**: Utilidad por unidad, Margen porcentual, Rentabilidad mensual acumulada y Nivel de Rotación (**Alta**, **Media**, **Baja**).

### 3. Gestión de Pedidos & Facturación
- Registro de pedidos con fecha/hora y asociación directa al cliente.
- **Canasta dinámica de productos**: agregar licores, regular cantidad, validar stock disponible, aplicar % de descuento por ítem y cálculo en tiempo real.
- Desglose fiel al PDF: **Total sin IVA**, **IVA configurable** (21% / 15% / 12% / 0%) y **Total con IVA**.
- Formas de pago: **Transferencia**, **Tarjeta**, **Contado**.
- **Comprobante / Recibo de Venta Imprimible**: diseño con el logotipo oficial de **LICORES MEGA** optimizado para pantalla, ticket térmico o exportación a PDF (`window.print()`).
- Descuento automático de existencias en bodega cuando el pedido se marca como *Enviado* o *Completo*.

### 4. Atención al Cliente & Post-Venta (Tickets de Soporte)
- Gestión de tickets de servicio e incidencias post-venta (consultas sobre despacho, consultas comerciales, roturas o incidencias).
- Clasificación por Estado (*Abierto*, *En Proceso*, *Cerrado*) y Prioridad (*Alta*, *Media*, *Baja*).
- Asignación de agente y registro detallado de resolución con distintivo corporativo.

### 5. Dashboard Analítico & Métricas
- 4 KPIs ejecutivos en tiempo real: Ventas Totales, Clientes (Mayoristas vs Minoristas), Unidades en Bodega y Alertas de Stock Crítico.
- **Gráfico de Ventas por Canal** (Local, WhatsApp, Delivery, Restaurantes) con Chart.js en la paleta de Licores Mega.
- **Gráfico de Rentabilidad y Margen (%)** de los licores más vendidos.
- Tabla interactiva de reabastecimiento rápido con botón `+ Reponer`.

### 6. Respaldos & Persistencia de Datos
- **Almacenamiento Local Seguro**: Todos los clientes, licores, pedidos y tickets se guardan de forma instantánea y persistente en el navegador (`localStorage`).
- **Exportación de Copias de Seguridad (JSON)**: Descarga un archivo completo con todos tus datos en un solo clic desde la sección *Respaldos & Vercel*.
- **Restauración de Copias de Seguridad**: Sube cualquier respaldo previo en JSON para restaurar inmediatamente la información.
- **Restablecimiento a Datos Iniciales**: Opción para recargar el catálogo y datos de muestra basados en el estudio académico.

---

## ⚡ Arquitectura Técnica

- **Frontend**: Single Page Application (SPA) ultraligera con HTML5, Tailwind CSS, Vanilla JavaScript modular, Lucide Icons y Chart.js.
- **Sin Dependencias de Servidor**: Funciona de inmediato al abrir `index.html` en cualquier navegador web moderno, sin necesidad de compilar ni instalar entornos pesados.
- **100% Privado y Seguro**: Los datos de tu licorera residen en tu navegador y en tus archivos de copia de seguridad.

---

## 📦 Despliegue en Vercel

El proyecto incluye el archivo `vercel.json` listo para desplegarse como sitio estático de alto rendimiento.

### Opción 1: Conexión vía GitHub (Recomendada)
1. Sube este repositorio a tu cuenta de **GitHub**.
2. Ingresa a [Vercel](https://vercel.com) y selecciona **Add New Project** &rarr; **Import Git Repository**.
3. Deja la configuración por defecto (Framework Preset: *Other*) y haz clic en **Deploy**.
4. ¡Tu CRM de Licorera estará en línea en segundos con HTTPS y CDN global gratuito!

### Opción 2: Con Vercel CLI
```bash
# Instalar Vercel CLI (si se cuenta con Node.js)
npm i -g vercel

# Desplegar en producción
vercel --prod
```

---

## 💻 Uso Local

Para usar la aplicación en tu computadora:
1. Haz doble clic en `index.html` o ábrelo con tu navegador preferido (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
2. ¡Listo! Todas las funciones, gráficos y gestión de pedidos están operativas de inmediato con la identidad oficial de **LICORES MEGA**.

---

## 📄 Créditos del Estudio
- **Institución**: Universidad Técnica de Ambato
- **Materia**: Mercadotecnia
- **Curso**: Séptimo "B"
- **Autores**: Damián Robles, Eduardo Ferrín, Kevin Moreno, Verónica Castro, Evelyn Mora.
