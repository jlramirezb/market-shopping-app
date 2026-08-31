class MarketShoppingApp {
    constructor() {
        this.productos = [];
        this.compras = [];
        this.mercadosPredefinidos = [
            "La Granja",
            "Chacal",
            "Kromi",
            "Catania",
            "Luxor",
            "Forum",
            "Plazas",
            "Makro",
            "RedVital",
            "Farmatodo"
        ];
        this.mercadosPersonalizados = [];
        this.inicializar();
    }

    inicializar() {
        this.cargarComprasGuardadas();
        this.cargarMercadosPersonalizados();
        this.configurarEventos();
        this.configurarFechaActual();
        this.cargarMercadosPredefinidos().then(() => {
            this.cargarMercadosEnSelector();
        });
        this.cargarUltimaCompra();
        this.actualizarTotales();
        // Intentar cargar datos desde el servidor si esta disponible
        this.cargarComprasServidor();
        this.cargarMercadosServidor();
    }

    // Carga los productos de la ultima compra en el formulario para agilizar una nueva compra
    cargarUltimaCompra() {
        if (this.compras.length === 0) return;
        // La ultima compra es la de mayor fechaGuardado
        const ultima = this.compras.reduce((a, b) =>
            new Date(a.fechaGuardado) > new Date(b.fechaGuardado) ? a : b
        );

        if (ultima && Array.isArray(ultima.productos)) {
            this.productos = ultima.productos.map(p => ({
                id: Date.now() + Math.random(),
                nombre: p.nombre,
                precio: p.precio,
                cantidad: p.cantidad,
                tipoMedida: p.tipoMedida || 'unidad',
                tipoMoneda: p.tipoMoneda || 'dolar'
            }));
            this.actualizarListaProductos();
            this.actualizarTotales();
        }
    }

    cargarMercadosPredefinidos() {
        return fetch('mercados.json')
            .then((res) => res.json())
            .then((data) => {
                if (data && Array.isArray(data.mercadosPredefinidos) && data.mercadosPredefinidos.length > 0) {
                    this.mercadosPredefinidos = data.mercadosPredefinidos;
                }
                // Cargar el selector una vez se tenga la lista
                this.cargarMercadosEnSelector();
            })
            .catch(() => {
                // Si no se puede cargar el archivo JSON, usar la lista por defecto
                this.cargarMercadosEnSelector();
            });
    }

    configurarEventos() {
        // Botones principales
        document.getElementById('btnAgregarProducto').addEventListener('click', () => this.validarConfiguracionInicial());
        document.getElementById('btnGuardar').addEventListener('click', () => this.guardarCompra());
        document.getElementById('btnCargar').addEventListener('click', () => this.mostrarModalCompras());
        document.getElementById('btnDashboard').addEventListener('click', () => this.mostrarDashboard());

        // Modal de dashboard
        document.querySelector('.close-dashboard').addEventListener('click', () => this.cerrarDashboard());
        document.getElementById('btnCerrarDashboard').addEventListener('click', () => this.cerrarDashboard());
        document.getElementById('filtroTexto').addEventListener('input', () => this.renderTablaCompras());
        document.getElementById('filtroMercado').addEventListener('change', () => this.renderTablaCompras());

        // Modal de producto
        document.querySelector('.close').addEventListener('click', () => this.cerrarModalProducto());
        document.getElementById('btnCancelarProducto').addEventListener('click', () => this.cerrarModalProducto());
        document.getElementById('btnAceptarProducto').addEventListener('click', () => this.agregarProducto());

        // Modal de compras
        document.querySelector('.close-compras').addEventListener('click', () => this.cerrarModalCompras());

        // Modal de editar producto
        document.querySelector('.close-editar').addEventListener('click', () => this.cerrarModalEditarProducto());
        document.getElementById('btnCancelarEditarProducto').addEventListener('click', () => this.cerrarModalEditarProducto());
        document.getElementById('btnAceptarEditarProducto').addEventListener('click', () => this.actualizarProducto());

        // Modal de agregar mercado
        document.querySelector('.close-agregar-mercado').addEventListener('click', () => this.cerrarModalAgregarMercado());
        document.getElementById('btnCancelarAgregarMercado').addEventListener('click', () => this.cerrarModalAgregarMercado());
        document.getElementById('btnAceptarAgregarMercado').addEventListener('click', () => this.agregarNuevoMercado());
        document.getElementById('btnAgregarMercado').addEventListener('click', () => this.mostrarModalAgregarMercado());

        // Exportar / Importar datos en JSON
        document.getElementById('btnExportar').addEventListener('click', () => this.exportarDatos());
        document.getElementById('btnImportar').addEventListener('click', () => document.getElementById('inputImportar').click());
        document.getElementById('inputImportar').addEventListener('change', (e) => this.importarDatos(e));

        // Eventos para validación de configuración
        document.getElementById('tasaCambio').addEventListener('input', () => this.verificarConfiguracion());
        document.getElementById('fecha').addEventListener('change', () => this.verificarConfiguracion());
        document.getElementById('automercado').addEventListener('change', () => this.verificarConfiguracion());
        
        // Eventos para actualización automática
        document.getElementById('tasaCambio').addEventListener('input', () => this.actualizarTotales());

        // Eventos para tipo de medida en modal
        document.querySelectorAll('input[name="tipoMedida"]').forEach(radio => {
            radio.addEventListener('change', () => this.actualizarAyudaCantidad());
        });

        // Eventos para tipo de medida en modal de edición
        document.querySelectorAll('input[name="editarTipoMedida"]').forEach(radio => {
            radio.addEventListener('change', () => this.actualizarAyudaCantidadEditar());
        });

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
    }

    configurarFechaActual() {
        const fechaInput = document.getElementById('fecha');
        const hoy = new Date();
        // Obtener fecha en formato YYYY-MM-DD para la zona horaria local
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const día = String(hoy.getDate()).padStart(2, '0');
        fechaInput.value = `${año}-${mes}-${día}`;
    }

    verificarConfiguracion() {
        const tasaCambio = document.getElementById('tasaCambio').value;
        const fecha = document.getElementById('fecha').value;
        const automercado = document.getElementById('automercado').value;
        const btnAgregar = document.getElementById('btnAgregarProducto');
        const mensajeConfig = document.getElementById('mensajeConfiguracion');

        const configuracionCompleta = tasaCambio && fecha && automercado;

        if (configuracionCompleta) {
            btnAgregar.disabled = false;
            mensajeConfig.style.display = 'none';
        } else {
            btnAgregar.disabled = true;
            mensajeConfig.style.display = 'block';
        }

        return configuracionCompleta;
    }

    validarConfiguracionInicial() {
        if (this.verificarConfiguracion()) {
            this.mostrarModalProducto();
        } else {
            this.mostrarMensaje('Complete primero la configuración inicial', 'warning');
        }
    }

    mostrarModalProducto() {
        document.getElementById('modalProducto').style.display = 'block';
        document.getElementById('nombreProducto').focus();
        this.actualizarAyudaCantidad();
    }

    actualizarAyudaCantidad() {
        const tipoMedida = document.querySelector('input[name="tipoMedida"]:checked').value;
        const ayudaCantidad = document.getElementById('ayudaCantidad');
        
        if (tipoMedida === 'unidad') {
            ayudaCantidad.textContent = 'Ingrese el número de unidades (ej: 3, 5, 10)';
        } else {
            ayudaCantidad.textContent = 'Ingrese el peso en kilogramos (ej: 1.5, 2.5, 0.5)';
        }
    }

    actualizarAyudaCantidadEditar() {
        const tipoMedida = document.querySelector('input[name="editarTipoMedida"]:checked').value;
        const ayudaCantidad = document.getElementById('editarAyudaCantidad');
        
        if (tipoMedida === 'unidad') {
            ayudaCantidad.textContent = 'Ingrese el número de unidades (ej: 3, 5, 10)';
        } else {
            ayudaCantidad.textContent = 'Ingrese el peso en kilogramos (ej: 1.5, 2.5, 0.5)';
        }
    }

    cerrarModalProducto() {
        document.getElementById('modalProducto').style.display = 'none';
        this.limpiarFormularioProducto();
    }

    mostrarModalCompras() {
        document.getElementById('modalCompras').style.display = 'block';
        this.mostrarListaCompras();
    }

    cerrarModalCompras() {
        document.getElementById('modalCompras').style.display = 'none';
    }

    limpiarFormularioProducto() {
        document.getElementById('nombreProducto').value = '';
        document.getElementById('precioProducto').value = '';
        document.getElementById('cantidadProducto').value = '';
        document.querySelector('input[name="tipoMedida"][value="unidad"]').checked = true;
        document.querySelector('input[name="tipoMoneda"][value="dolar"]').checked = true;
    }

    mostrarModalEditarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (!producto) return;

        // Cargar datos del producto en el formulario
        document.getElementById('editarNombreProducto').value = producto.nombre;
        document.getElementById('editarPrecioProducto').value = producto.precio;
        document.getElementById('editarCantidadProducto').value = producto.cantidad;
        
        // Seleccionar tipo de medida
        document.querySelector(`input[name="editarTipoMedida"][value="${producto.tipoMedida}"]`).checked = true;
        
        // Seleccionar tipo de moneda
        document.querySelector(`input[name="editarTipoMoneda"][value="${producto.tipoMoneda}"]`).checked = true;

        // Actualizar ayuda contextual
        this.actualizarAyudaCantidadEditar();

        // Guardar ID del producto a editar
        this.productoEditandoId = id;

        // Mostrar modal
        document.getElementById('modalEditarProducto').style.display = 'block';
        document.getElementById('editarNombreProducto').focus();
    }

    cerrarModalEditarProducto() {
        document.getElementById('modalEditarProducto').style.display = 'none';
        this.productoEditandoId = null;
    }

    actualizarProducto() {
        const nombre = document.getElementById('editarNombreProducto').value.trim();
        const precio = parseFloat(document.getElementById('editarPrecioProducto').value);
        const cantidad = parseFloat(document.getElementById('editarCantidadProducto').value);
        const tipoMedida = document.querySelector('input[name="editarTipoMedida"]:checked').value;
        const tipoMoneda = document.querySelector('input[name="editarTipoMoneda"]:checked').value;

        // Validaciones
        if (!nombre) {
            this.mostrarError('editarNombreProducto', 'Ingrese el nombre del producto');
            return;
        }

        if (isNaN(precio) || precio <= 0) {
            this.mostrarError('editarPrecioProducto', 'Ingrese un precio válido');
            return;
        }

        if (isNaN(cantidad) || cantidad <= 0) {
            this.mostrarError('editarCantidadProducto', 'Ingrese una cantidad válida');
            return;
        }

        // Encontrar y actualizar el producto
        const index = this.productos.findIndex(p => p.id === this.productoEditandoId);
        if (index !== -1) {
            this.productos[index] = {
                id: this.productoEditandoId,
                nombre: nombre,
                precio: precio,
                cantidad: cantidad,
                tipoMedida: tipoMedida,
                tipoMoneda: tipoMoneda
            };

            this.actualizarListaProductos();
            this.actualizarTotales();
            this.cerrarModalEditarProducto();
            this.mostrarMensaje('Producto actualizado exitosamente', 'success');
        }
    }

    agregarProducto() {
        const nombre = document.getElementById('nombreProducto').value.trim();
        const precio = parseFloat(document.getElementById('precioProducto').value);
        const cantidad = parseFloat(document.getElementById('cantidadProducto').value);
        const tipoMedida = document.querySelector('input[name="tipoMedida"]:checked').value;
        const tipoMoneda = document.querySelector('input[name="tipoMoneda"]:checked').value;

        // Validaciones
        if (!nombre) {
            this.mostrarError('nombreProducto', 'Ingrese el nombre del producto');
            return;
        }

        if (isNaN(precio) || precio <= 0) {
            this.mostrarError('precioProducto', 'Ingrese un precio válido');
            return;
        }

        if (isNaN(cantidad) || cantidad <= 0) {
            this.mostrarError('cantidadProducto', 'Ingrese una cantidad válida');
            return;
        }

        const producto = {
            id: Date.now(),
            nombre: nombre,
            precio: precio,
            cantidad: cantidad,
            tipoMedida: tipoMedida,
            tipoMoneda: tipoMoneda
        };

        this.productos.push(producto);
        this.actualizarListaProductos();
        this.actualizarTotales();
        this.cerrarModalProducto();
        this.mostrarMensaje('Producto agregado exitosamente', 'success');
    }

    eliminarProducto(id) {
        this.productos = this.productos.filter(p => p.id !== id);
        this.actualizarListaProductos();
        this.actualizarTotales();
        this.mostrarMensaje('Producto eliminado', 'info');
    }

    actualizarListaProductos() {
        const contenedor = document.getElementById('listaProductos');
        const tasaCambio = parseFloat(document.getElementById('tasaCambio').value) || 1;
        
        if (this.productos.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay productos agregados</p>';
            return;
        }

        contenedor.innerHTML = this.productos.map(producto => {
            const subtotal = producto.precio * producto.cantidad;
            let subtotalDolares, subtotalBolivares;
            
            if (producto.tipoMoneda === 'dolar') {
                subtotalDolares = subtotal;
                subtotalBolivares = subtotal * tasaCambio;
            } else {
                subtotalBolivares = subtotal;
                subtotalDolares = subtotal / tasaCambio;
            }
            
            return `
                <div class="product-item">
                    <div class="product-info">
                        <div class="product-name">${producto.nombre}</div>
                        <div class="product-details">
                            ${this.formatearCantidad(producto.cantidad, producto.tipoMedida)} × 
                            ${this.formatearMoneda(producto.precio, producto.tipoMoneda)}
                        </div>
                        <div class="product-price">
                            <div class="price-row">
                                <span class="price-label">Total:</span>
                                <span class="price-amount">${this.formatearMoneda(subtotal, producto.tipoMoneda)}</span>
                            </div>
                            <div class="price-row">
                                <span class="price-label">Equivalente:</span>
                                <span class="price-amount price-converted">
                                    ${producto.tipoMoneda === 'dolar' ? 
                                        this.formatearMoneda(subtotalBolivares, 'bolivar') : 
                                        this.formatearMoneda(subtotalDolares, 'dolar')
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn-editar" onclick="app.mostrarModalEditarProducto(${producto.id})" title="Editar producto">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="btn-eliminar" onclick="app.eliminarProducto(${producto.id})" title="Eliminar producto">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    actualizarTotales() {
        const tasaCambio = parseFloat(document.getElementById('tasaCambio').value) || 1;
        
        let totalDolares = 0;
        let totalBolivares = 0;

        this.productos.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            if (producto.tipoMoneda === 'dolar') {
                totalDolares += subtotal;
                totalBolivares += subtotal * tasaCambio;
            } else {
                totalBolivares += subtotal;
                totalDolares += subtotal / tasaCambio;
            }
        });

        document.getElementById('totalDolares').textContent = this.formatearMoneda(totalDolares, 'dolar');
        document.getElementById('totalBolivares').textContent = this.formatearMoneda(totalBolivares, 'bolivar');
    }

    guardarCompra() {
        const tasaCambio = parseFloat(document.getElementById('tasaCambio').value);
        const fecha = document.getElementById('fecha').value;
        const automercado = document.getElementById('automercado').value.trim();

        // Validaciones
        if (isNaN(tasaCambio) || tasaCambio <= 0) {
            this.mostrarError('tasaCambio', 'Ingrese una tasa de cambio válida');
            return;
        }

        if (!fecha) {
            this.mostrarError('fecha', 'Seleccione la fecha');
            return;
        }

        if (!automercado) {
            this.mostrarError('automercado', 'Ingrese el nombre del automercado');
            return;
        }

        if (this.productos.length === 0) {
            this.mostrarMensaje('Agregue al menos un producto', 'warning');
            return;
        }

        const compra = {
            id: Date.now(),
            fecha: fecha,
            automercado: automercado,
            tasaCambio: tasaCambio,
            productos: [...this.productos],
            totalDolares: this.calcularTotalDolares(tasaCambio),
            totalBolivares: this.calcularTotalBolivares(tasaCambio),
            fechaGuardado: new Date().toISOString()
        };

        this.compras.push(compra);
        this.guardarComprasEnStorage();
        this.limpiarFormulario();
        this.mostrarMensaje('Compra guardada exitosamente', 'success');
    }

    calcularTotalDolares(tasaCambio) {
        return this.productos.reduce((total, producto) => {
            const subtotal = producto.precio * producto.cantidad;
            if (producto.tipoMoneda === 'dolar') {
                return total + subtotal;
            } else {
                return total + (subtotal / tasaCambio);
            }
        }, 0);
    }

    calcularTotalBolivares(tasaCambio) {
        return this.productos.reduce((total, producto) => {
            const subtotal = producto.precio * producto.cantidad;
            if (producto.tipoMoneda === 'bolivar') {
                return total + subtotal;
            } else {
                return total + (subtotal * tasaCambio);
            }
        }, 0);
    }

    mostrarListaCompras() {
        const contenedor = document.getElementById('listaCompras');
        
        if (this.compras.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay compras guardadas</p>';
            return;
        }

        contenedor.innerHTML = this.compras.map((compra, index) => `
            <div class="compra-item" onclick="app.mostrarDetalleCompra(${index})">
                <div class="compra-item-top">
                    <div class="compra-header">
                        📅 ${this.formatearFecha(compra.fecha)} - 🏪 ${compra.automercado}
                    </div>
                    <button class="btn-eliminar" onclick="event.stopPropagation(); app.eliminarCompra(${index})" title="Eliminar compra">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
                <div class="compra-details">
                    📦 ${compra.productos.length} productos | 💱 Tasa: ${compra.tasaCambio}
                </div>
                <div class="compra-totals">
                    <span>$${compra.totalDolares.toFixed(2)}</span>
                    <span>Bs${compra.totalBolivares.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    eliminarCompra(index) {
        const compra = this.compras[index];
        if (!compra) return;

        if (!confirm(`¿Eliminar la compra del ${this.formatearFecha(compra.fecha)} en ${compra.automercado}?`)) return;

        this.compras.splice(index, 1);
        this.guardarComprasEnStorage();
        this.mostrarListaCompras();
        this.mostrarMensaje('Compra eliminada', 'success');
    }

    mostrarDetalleCompra(index) {
        const compra = this.compras[index];
        
        let detalle = `
            <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                <h3 style="color: #5a67d8; margin-bottom: 15px;">📋 Detalle de Compra</h3>
                <p><strong>📅 Fecha:</strong> ${this.formatearFecha(compra.fecha)}</p>
                <p><strong>🏪 Automercado:</strong> ${compra.automercado}</p>
                <p><strong>💱 Tasa de Cambio:</strong> $${compra.tasaCambio.toFixed(2)}</p>
                <hr style="margin: 15px 0; border: 1px solid #e2e8f0;">
                <h4 style="color: #4a5568; margin-bottom: 10px;">📦 Productos:</h4>
        `;

        compra.productos.forEach((producto, i) => {
            const subtotal = producto.precio * producto.cantidad;
            let subtotalDolares, subtotalBolivares;
            
            if (producto.tipoMoneda === 'dolar') {
                subtotalDolares = subtotal;
                subtotalBolivares = subtotal * compra.tasaCambio;
            } else {
                subtotalBolivares = subtotal;
                subtotalDolares = subtotal / compra.tasaCambio;
            }
            
            detalle += `
                <p style="margin: 5px 0;">
                    <strong>${i + 1}.</strong> ${producto.nombre}<br>
                    <small style="color: #718096;">
                        ${this.formatearCantidad(producto.cantidad, producto.tipoMedida)} × 
                        ${this.formatearMoneda(producto.precio, producto.tipoMoneda)} = 
                        ${this.formatearMoneda(subtotal, producto.tipoMoneda)}
                    </small>
                    <br>
                    <small style="color: #38a169;">
                        Equivalente: ${producto.tipoMoneda === 'dolar' ? 
                            this.formatearMoneda(subtotalBolivares, 'bolivar') : 
                            this.formatearMoneda(subtotalDolares, 'dolar')
                        }
                    </small>
                </p>
            `;
        });

        detalle += `
                <hr style="margin: 15px 0; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>Total ($):</span>
                    <span style="color: #5a67d8;">$${compra.totalDolares.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>Total (Bs):</span>
                    <span style="color: #5a67d8;">Bs${compra.totalBolivares.toFixed(2)}</span>
                </div>
            </div>
        `;

        this.mostrarModalDetalle(detalle);
    }

    mostrarModalDetalle(contenido) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalle de Compra</h3>
                    <span class="close-detalle">&times;</span>
                </div>
                <div class="modal-body">
                    ${contenido}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal
        modal.querySelector('.close-detalle').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    limpiarFormulario() {
        this.productos = [];
        this.actualizarListaProductos();
        this.actualizarTotales();
        document.getElementById('tasaCambio').value = '';
        document.getElementById('automercado').value = '';
        this.configurarFechaActual();
    }

    // Métodos de almacenamiento

    // Comprueba si el servidor local esta disponible (para guardar en JSON)
    servidorDisponible() {
        return new Promise((resolve) => {
            // Si ya lo comprobamos, usamos el resultado cacheado
            if (this._servidorOk !== undefined) {
                resolve(this._servidorOk);
                return;
            }
            fetch('/api/compras', { method: 'GET' })
                .then((res) => {
                    this._servidorOk = res.ok;
                    resolve(this._servidorOk);
                })
                .catch(() => {
                    this._servidorOk = false;
                    resolve(false);
                });
        });
    }

    // Envia las compras al servidor (si esta disponible) y las guarda en localStorage
    guardarComprasEnStorage() {
        localStorage.setItem('marketShopping_compras', JSON.stringify(this.compras));
        this.servidorDisponible().then((ok) => {
            if (ok) {
                fetch('/api/compras', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ compras: this.compras })
                }).catch(() => {});
            }
        });
    }

    cargarComprasGuardadas() {
        const guardadas = localStorage.getItem('marketShopping_compras');
        if (guardadas) {
            this.compras = JSON.parse(guardadas);
        }
    }

    // Intentar cargar las compras desde el servidor (si esta disponible)
    cargarComprasServidor() {
        this.servidorDisponible().then((ok) => {
            if (!ok) return;
            fetch('/api/compras')
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        this.compras = data;
                        localStorage.setItem('marketShopping_compras', JSON.stringify(this.compras));
                    }
                })
                .catch(() => {});
        });
    }

    // Métodos de utilidad
    formatearMoneda(monto, tipo) {
        const simbolo = tipo === 'dolar' ? '$' : 'Bs';
        return `${simbolo}${monto.toFixed(2)}`;
    }

    formatearCantidad(cantidad, tipoMedida) {
        if (tipoMedida === 'unidad') {
            return cantidad % 1 === 0 ? `${cantidad} unid.` : `${cantidad} unid.`;
        } else {
            return `${cantidad} kg`;
        }
    }

    // Métodos para gestión de mercados
    cargarMercadosPersonalizados() {
        const guardados = localStorage.getItem('marketShopping_mercados');
        if (guardados) {
            this.mercadosPersonalizados = JSON.parse(guardados);
        }
    }

    guardarMercadosPersonalizados() {
        localStorage.setItem('marketShopping_mercados', JSON.stringify(this.mercadosPersonalizados));
        this.servidorDisponible().then((ok) => {
            if (ok) {
                fetch('/api/mercados', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mercados: this.mercadosPersonalizados })
                }).catch(() => {});
            }
        });
    }

    // Intentar cargar los mercados personalizados desde el servidor
    cargarMercadosServidor() {
        this.servidorDisponible().then((ok) => {
            if (!ok) return;
            fetch('/api/mercados')
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        this.mercadosPersonalizados = data;
                        localStorage.setItem('marketShopping_mercados', JSON.stringify(this.mercadosPersonalizados));
                        this.cargarMercadosEnSelector();
                    }
                })
                .catch(() => {});
        });
    }

    cargarMercadosEnSelector() {
        const selector = document.getElementById('automercado');
        selector.innerHTML = '<option value="">Seleccione un automercado...</option>';
        
        // Agregar mercados predefinidos
        this.mercadosPredefinidos.forEach(mercado => {
            const option = document.createElement('option');
            option.value = mercado;
            option.textContent = mercado;
            selector.appendChild(option);
        });
        
        // Agregar mercados personalizados
        this.mercadosPersonalizados.forEach(mercado => {
            const option = document.createElement('option');
            option.value = mercado;
            option.textContent = mercado;
            selector.appendChild(option);
        });
    }

    // Exportar todos los datos a un archivo JSON
    exportarDatos() {
        const datos = {
            version: 1,
            exportado: new Date().toISOString(),
            compras: this.compras,
            mercadosPersonalizados: this.mercadosPersonalizados
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market-shopping-datos-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.mostrarMensaje('Datos exportados a JSON', 'success');
    }

    // Importar datos desde un archivo JSON
    importarDatos(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = (e) => {
            try {
                const datos = JSON.parse(e.target.result);

                if (!datos || typeof datos !== 'object') {
                    throw new Error('Formato no válido');
                }

                if (Array.isArray(datos.compras)) {
                    this.compras = datos.compras;
                    this.guardarComprasEnStorage();
                }

                if (Array.isArray(datos.mercadosPersonalizados)) {
                    this.mercadosPersonalizados = datos.mercadosPersonalizados;
                    this.guardarMercadosPersonalizados();
                    this.cargarMercadosEnSelector();
                }

                this.mostrarListaCompras();
                this.mostrarMensaje('Datos importados correctamente', 'success');
            } catch (err) {
                this.mostrarMensaje('Archivo JSON no válido', 'error');
            }
        };
        lector.readAsText(archivo);

        // Resetear el input para permitir importar el mismo archivo de nuevo
        event.target.value = '';
    }

    // ====== DASHBOARD ======
    mostrarDashboard() {
        document.getElementById('modalDashboard').style.display = 'block';
        this.renderResumenDashboard();
        this.renderGraficoFechas();
        this.renderGraficoMercados();
        this.cargarFiltroMercados();
        this.renderTablaCompras();
    }

    cerrarDashboard() {
        document.getElementById('modalDashboard').style.display = 'none';
    }

    renderResumenDashboard() {
        const cont = document.getElementById('dashboardResumen');
        if (this.compras.length === 0) {
            cont.innerHTML = '<p class="empty-message">No hay compras para mostrar</p>';
            return;
        }

        let totalUsd = 0, totalBs = 0;
        const mercadoConteo = {};
        const productoConteo = {};

        this.compras.forEach(c => {
            const tasa = c.tasaCambio || 1;
            totalUsd += c.totalDolares;
            totalBs += c.totalBolivares;
            mercadoConteo[c.automercado] = (mercadoConteo[c.automercado] || 0) + 1;
            (c.productos || []).forEach(p => {
                productoConteo[p.nombre] = (productoConteo[p.nombre] || 0) + p.cantidad;
            });
        });

        const mercadoMas = Object.keys(mercadoConteo).sort((a, b) => mercadoConteo[b] - mercadoConteo[a])[0];
        const productoMas = Object.keys(productoConteo).sort((a, b) => productoConteo[b] - productoConteo[a])[0];

        cont.innerHTML = `
            <div class="resumen-grid">
                <div class="resumen-item"><span>Compras</span><strong>${this.compras.length}</strong></div>
                <div class="resumen-item"><span>Total ($)</span><strong>$${totalUsd.toFixed(2)}</strong></div>
                <div class="resumen-item"><span>Total (Bs)</span><strong>Bs${totalBs.toFixed(2)}</strong></div>
                <div class="resumen-item"><span>Mercado + usado</span><strong title="${mercadoMas}">${mercadoMas || '-'}</strong></div>
                <div class="resumen-item"><span>Producto + comprado</span><strong title="${productoMas}">${productoMas || '-'}</strong></div>
            </div>
        `;
    }

    // Grafico de barras simple con CSS
    renderGraficoFechas() {
        const cont = document.getElementById('graficoFechas');
        if (this.compras.length === 0) {
            cont.innerHTML = '<p class="empty-message">Sin datos</p>';
            return;
        }

        // Agrupar total por fecha
        const porFecha = {};
        this.compras.forEach(c => {
            const f = this.formatearFecha(c.fecha);
            porFecha[f] = (porFecha[f] || 0) + c.totalDolares;
        });

        const fechas = Object.keys(porFecha);
        const max = Math.max(...Object.values(porFecha));

        cont.innerHTML = fechas.map(f => {
            const h = max > 0 ? Math.round((porFecha[f] / max) * 100) : 0;
            return `
                <div class="bar-row">
                    <span class="bar-label">${f}</span>
                    <div class="bar-track">
                        <div class="bar-fill" style="width:${h}%"></div>
                    </div>
                    <span class="bar-value">$${porFecha[f].toFixed(2)}</span>
                </div>
            `;
        }).join('');
    }

    renderGraficoMercados() {
        const cont = document.getElementById('graficoMercados');
        if (this.compras.length === 0) {
            cont.innerHTML = '<p class="empty-message">Sin datos</p>';
            return;
        }

        const porMercado = {};
        this.compras.forEach(c => {
            porMercado[c.automercado] = (porMercado[c.automercado] || 0) + c.totalDolares;
        });

        const mercados = Object.keys(porMercado);
        const max = Math.max(...Object.values(porMercado));

        cont.innerHTML = mercados.map(m => {
            const h = max > 0 ? Math.round((porMercado[m] / max) * 100) : 0;
            return `
                <div class="bar-row">
                    <span class="bar-label">${m}</span>
                    <div class="bar-track">
                        <div class="bar-fill bar-fill-alter" style="width:${h}%"></div>
                    </div>
                    <span class="bar-value">$${porMercado[m].toFixed(2)}</span>
                </div>
            `;
        }).join('');
    }

    cargarFiltroMercados() {
        const select = document.getElementById('filtroMercado');
        const mercados = [...new Set(this.compras.map(c => c.automercado))];
        select.innerHTML = '<option value="">Todos los mercados</option>';
        mercados.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            select.appendChild(opt);
        });
    }

    renderTablaCompras() {
        const cont = document.getElementById('tablaCompras');
        const texto = (document.getElementById('filtroTexto').value || '').toLowerCase();
        const mercado = document.getElementById('filtroMercado').value;

        if (this.compras.length === 0) {
            cont.innerHTML = '<p class="empty-message">No hay compras guardadas</p>';
            return;
        }

        let filtradas = this.compras;
        if (mercado) filtradas = filtradas.filter(c => c.automercado === mercado);
        if (texto) {
            filtradas = filtradas.filter(c =>
                c.automercado.toLowerCase().includes(texto) ||
                this.formatearFecha(c.fecha).toLowerCase().includes(texto)
            );
        }

        if (filtradas.length === 0) {
            cont.innerHTML = '<p class="empty-message">Sin resultados</p>';
            return;
        }

        // Ordenar por fecha mas reciente
        const ordenadas = [...filtradas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        cont.innerHTML = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Mercado</th>
                        <th>Productos</th>
                        <th>Total ($)</th>
                        <th>Total (Bs)</th>
                    </tr>
                </thead>
                <tbody>
                    ${ordenadas.map((c, i) => `
                        <tr class="tabla-row" data-idx="${this.compras.indexOf(c)}">
                            <td>${this.formatearFecha(c.fecha)}</td>
                            <td>${c.automercado}</td>
                            <td>${(c.productos || []).length}</td>
                            <td>$${c.totalDolares.toFixed(2)}</td>
                            <td>Bs${c.totalBolivares.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        cont.querySelectorAll('.tabla-row').forEach(row => {
            row.addEventListener('click', () => {
                const idx = parseInt(row.getAttribute('data-idx'), 10);
                this.mostrarDetalleCompra(idx);
            });
        });
    }

    mostrarModalAgregarMercado() {
        this.actualizarListaMercadosModal();
        document.getElementById('modalAgregarMercado').style.display = 'block';
        document.getElementById('nombreNuevoMercado').focus();
    }

    actualizarListaMercadosModal() {
        const contenedor = document.getElementById('listaMercadosGestion');
        if (!contenedor) return;

        const todos = [...this.mercadosPredefinidos, ...this.mercadosPersonalizados];

        if (todos.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay mercados</p>';
            return;
        }

        contenedor.innerHTML = todos.map((nombre) => {
            return `
                <div class="mercado-gestion-item">
                    <span>${nombre}</span>
                    <button class="btn-eliminar btn-small-eliminar" data-mercado="${nombre.replace(/"/g, '&quot;')}" title="Eliminar mercado">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            `;
        }).join('');

        contenedor.querySelectorAll('.btn-small-eliminar').forEach((btn) => {
            btn.addEventListener('click', () => {
                const nombre = btn.getAttribute('data-mercado');
                this.eliminarMercado(nombre);
            });
        });
    }

    eliminarMercado(nombre) {
        // Solo se permiten eliminar mercados personalizados desde la app.
        // Para eliminar mercados predefinidos, edita el archivo mercados.json.
        if (!this.mercadosPersonalizados.includes(nombre)) {
            this.mostrarMensaje('Los mercados de la lista base se editan en mercados.json', 'info');
            return;
        }

        if (!confirm(`¿Eliminar el mercado "${nombre}"?`)) return;

        this.mercadosPersonalizados = this.mercadosPersonalizados.filter(m => m !== nombre);
        this.guardarMercadosPersonalizados();

        // Si el mercado seleccionado fue eliminado, limpiar el selector
        if (document.getElementById('automercado').value === nombre) {
            document.getElementById('automercado').value = '';
            this.verificarConfiguracion();
        }

        this.cargarMercadosEnSelector();
        this.actualizarListaMercadosModal();
        this.mostrarMensaje('Mercado eliminado', 'success');
    }

    cerrarModalAgregarMercado() {
        document.getElementById('modalAgregarMercado').style.display = 'none';
        document.getElementById('nombreNuevoMercado').value = '';
    }

    agregarNuevoMercado() {
        const nombre = document.getElementById('nombreNuevoMercado').value.trim();
        
        if (!nombre) {
            this.mostrarError('nombreNuevoMercado', 'Ingrese el nombre del automercado');
            return;
        }
        
        // Verificar si ya existe
        const todosLosMercados = [...this.mercadosPredefinidos, ...this.mercadosPersonalizados];
        if (todosLosMercados.includes(nombre)) {
            this.mostrarError('nombreNuevoMercado', 'Este automercado ya existe');
            return;
        }
        
        // Agregar a mercados personalizados
        this.mercadosPersonalizados.push(nombre);
        this.guardarMercadosPersonalizados();
        this.cargarMercadosEnSelector();
        
        // Seleccionar el nuevo mercado
        document.getElementById('automercado').value = nombre;
        this.verificarConfiguracion();
        
        this.cerrarModalAgregarMercado();
        this.mostrarMensaje('Automercado agregado exitosamente', 'success');
    }

    formatearFecha(fechaISO) {
        // Si la fecha está en formato YYYY-MM-DD, procesarla directamente
        if (fechaISO && fechaISO.length === 10 && fechaISO.includes('-')) {
            const [year, month, day] = fechaISO.split('-');
            // Crear fecha en zona horaria local
            const fecha = new Date(year, month - 1, day);
            return fecha.toLocaleDateString('es-VE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        
        // Para otros formatos, usar el método original
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-VE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    mostrarError(campoId, mensaje) {
        const campo = document.getElementById(campoId);
        campo.style.borderColor = '#f56565';
        campo.focus();
        
        // Mostrar mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.style.color = '#f56565';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = mensaje;
        
        campo.parentNode.appendChild(errorDiv);
        
        // Remover error después de 3 segundos
        setTimeout(() => {
            campo.style.borderColor = '#e2e8f0';
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    mostrarMensaje(mensaje, tipo) {
        const colores = {
            success: '#48bb78',
            error: '#f56565',
            warning: '#ed8936',
            info: '#4299e1'
        };

        const mensajeDiv = document.createElement('div');
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colores[tipo] || colores.info};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        mensajeDiv.textContent = mensaje;

        document.body.appendChild(mensajeDiv);

        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => mensajeDiv.remove(), 300);
            }
        }, 3000);
    }
}

// Inicializar la aplicación
const app = new MarketShoppingApp();

// Registrar Service Worker para funcionamiento offline
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Agregar animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);