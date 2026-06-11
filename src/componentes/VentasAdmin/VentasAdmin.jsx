import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useToast } from '../../hooks/useToast';
import './VentasAdmin.css';

export default function VentasAdmin() {
    const toast = useToast();
    const [productosInventario, setProductosInventario] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados del Formulario de Registro (Izquierda) - SE ELIMINÓ idCiclo
    const [cliente, setCliente] = useState('');
    const [telefono, setTelefono] = useState('');
    const [vendedor, setVendedor] = useState('');
    const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
    const [cantidad, setCantidad] = useState(1);

    // Estados del Carrito de Compras (Derecha)
    const [carrito, setCarrito] = useState([]);
    const [precioFinal, setPrecioFinal] = useState('');

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'inventario'));
                const productos = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProductosInventario(productos);
                setLoading(false);
            } catch (error) {
                console.log('Error al cargar productos:', error);
                setLoading(false);
            }
        };
        obtenerProductos();
    }, []);

    const agregarAlCarrito = (e) => {
        e.preventDefault();
        if (!productoSeleccionadoId) return toast.error('Selecciona un producto válido');
        if (cantidad <= 0) return toast.error('La cantidad debe ser mayor a 0');

        const producto = productosInventario.find(p => p.id === productoSeleccionadoId);

        if (producto.stock < cantidad) {
            return toast.error(`Stock insuficiente. Solo quedan ${producto.stock} unidades.`);
        }

        const existe = carrito.find(item => item.id === producto.id);
        if (existe) {
            setCarrito(carrito.map(item =>
                item.id === producto.id ? { ...item, cantidad: item.cantidad + Number(cantidad) } : item
            ));
        } else {
            setCarrito([...carrito, {
                id: producto.id,
                nombre: producto.nombre,
                cantidad: Number(cantidad),
                precioUnidad: producto.precio,
                costoUnidad: producto.costo
            }]);
        }

        setProductoSeleccionadoId('');
        setCantidad(1);
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    // FUNCIÓN PARA ACTUALIZAR EL INVENTARIO
    const actualizarInventario = async () => {
        try {
            for (const item of carrito) {
                const productoRef = doc(db, 'inventario', item.id);
                const productoActual = productosInventario.find(p => p.id === item.id);
                
                if (productoActual) {
                    const nuevoStock = productoActual.stock - item.cantidad;
                    await updateDoc(productoRef, {
                        stock: nuevoStock
                    });
                }
            }
            return true; // Éxito
        } catch (error) {
            console.log('Error al actualizar inventario:', error);
            toast.error('Error al actualizar el inventario');
            return false; // Fallo
        }
    };

    const subtotalCarrito = carrito.reduce((acc, item) => acc + (item.precioUnidad * item.cantidad), 0);
    const costoTotalCarrito = carrito.reduce((acc, item) => acc + (item.costoUnidad * item.cantidad), 0);

    const registrarVentaFinal = async (e) => {
        e.preventDefault();

        if (carrito.length === 0) return toast.error('El carrito está vacío');
        if (!cliente || !telefono || !vendedor) return toast.error('Por favor llena todos los datos del cliente y vendedor');

        const valorVentaEfectiva = precioFinal === '' ? subtotalCarrito : Number(precioFinal);

        if (valorVentaEfectiva < costoTotalCarrito) {
            return toast.error(`Error: El precio definitivo ($${valorVentaEfectiva}) no puede ser menor al costo total de los materiales ($${costoTotalCarrito}).`);
        }

        try {
            // PASO 1: ACTUALIZAR EL INVENTARIO PRIMERO
            const inventarioActualizado = await actualizarInventario();
            
            if (!inventarioActualizado) {
                return; // Si falla, cancela la venta
            }

            // PASO 2: SI EL INVENTARIO SE ACTUALIZÓ, REGISTRA LA VENTA
            const listaProductosGuardar = carrito.map(item => `${item.nombre} (x${item.cantidad})`).join(', ');

            await addDoc(collection(db, 'ventas'), {
                Fecha: new Date().toLocaleDateString('es-CO'),
                Cliente: cliente,
                Telefono: telefono,
                Productos: listaProductosGuardar,
                Total: valorVentaEfectiva,
                CostoTotal: costoTotalCarrito,
                ID_Ciclo: "",
                Vendedor: vendedor
            });

            toast.success('Venta registrada exitosamente y stock actualizado');

            setCarrito([]);
            setPrecioFinal('');
            setCliente('');
            setTelefono('');
            setVendedor('');

        } catch (error) {
            console.log('Error al registrar venta:', error);
            toast.error('Ocurrió un error al guardar la venta');
        }
    };

    if (loading) return <div className="loading">Cargando registro de ventas...</div>;

    return (
        <div className="ventas-admin-container">
            <h2>Registro de Ventas</h2>

            <div className="ventas-workspace">

                {/* COLUMNA IZQUIERDA: FORMULARIOS */}
                <div className="columna-registro">

                    <div className="bloque-formulario">
                        <div className="form-grupo-inputs">
                            <input type="text" placeholder="Nombre del Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} required />
                            <input type="text" placeholder="Teléfono / Contacto" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />

                            {/* Se eliminó el input de ID_Ciclo de aquí */}

                            <select value={vendedor} onChange={(e) => setVendedor(e.target.value)} required>
                                <option value="">¿Quién vende?</option>
                                <option value="Mauricio">Mauricio</option>
                                <option value="Almario">Almario</option>
                            </select>
                        </div>
                    </div>

                    <div className="bloque-formulario">
                        <form onSubmit={agregarAlCarrito} className="form-agregar-carrito">
                            <select value={productoSeleccionadoId} onChange={(e) => setProductoSeleccionadoId(e.target.value)} required>
                                <option value="">-- Elige un producto del inventario --</option>
                                {productosInventario.map(prod => (
                                    <option key={prod.id} value={prod.id}>
                                        {prod.nombre} ({prod.categoria}) - P.U: ${prod.precio} (Stock: {prod.stock})
                                    </option>
                                ))}
                            </select>

                            <div className="input-cantidad-wrapper">
                                <label>Cantidad:</label>
                                <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
                            </div>

                            <button type="submit" className="btn-agregar-item">Añadir al Carrito</button>
                        </form>
                    </div>

                </div>

                {/* COLUMNA DERECHA: CARRITO DE COMPRAS */}
                <div className="columna-carrito">
                    <h3>Carrito</h3>

                    <div className="lista-carrito">
                        {carrito.length === 0 ? (
                            <p className="carrito-vacio">No has añadido productos al carrito todavía.</p>
                        ) : (
                            carrito.map(item => (
                                <div key={item.id} className="item-carrito">
                                    <div className="item-detalles">
                                        <h4>{item.nombre}</h4>
                                        <p>Cant: {item.cantidad} x ${item.precioUnidad} | Sub: ${item.precioUnidad * item.cantidad}</p>
                                    </div>
                                    <button type="button" className="btn-quitar-item" onClick={() => eliminarDelCarrito(item.id)}>✕</button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="totales-carrito">
                        <div className="fila-total">
                            <span>Subtotal Sugerido:</span>
                            <span>${subtotalCarrito}</span>
                        </div>
                        <div className="fila-total costo-base">
                            <span>Costo Total Base:</span>
                            <span>${costoTotalCarrito}</span>
                        </div>

                        <div className="input-precio-final-container">
                            <label htmlFor="precio-definitivo">Precio Final Acordado ($):</label>
                            <input
                                id="precio-definitivo"
                                type="number"
                                placeholder={`Por defecto: $${subtotalCarrito}`}
                                value={precioFinal}
                                onChange={(e) => setPrecioFinal(e.target.value)}
                            />
                            <small className="ayuda-input">Si se pactó un valor diferente, escríbelo aquí. No puede ser inferior al costo base.</small>
                        </div>

                        <button
                            type="button"
                            className="btn-registrar-venta-firestore"
                            onClick={registrarVentaFinal}
                            disabled={carrito.length === 0}
                        >
                            Confirmar y Registrar Venta
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}