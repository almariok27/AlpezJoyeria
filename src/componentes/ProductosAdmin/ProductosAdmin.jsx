import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useToast } from '../../hooks/useToast';
import './ProductosAdmin.css';

export default function ProductosAdmin() {
    const toast = useToast();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para saber si estamos editando (guardará el ID del producto)
    const [editandoId, setEditandoId] = useState(null);
    // Estado para controlar el filtro de categoría seleccionado
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [material, setMaterial] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [imagenes, setImagenes] = useState('');
    const [anchos, setAnchos] = useState('');
    const [coloresHilo, setColoresHilo] = useState('');
    const [tamaños, setTamaños] = useState('');

    useEffect(() => {
        obtenerProductos();
    }, []);

    const obtenerProductos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'productos'));
            const productosFirebase = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProductos(productosFirebase);
            setLoading(false);
        } catch (error) {
            console.log('Error al obtener productos:', error);
            setLoading(false);
        }
    };

    // Función para procesar los inputs de opciones (separados por comas)
    const procesarOpciones = (anchosStr, coloresStr, tamañosStr) => {
        const opciones = {};
        
        if (anchosStr.trim()) {
            opciones.anchos = anchosStr.split(',').map(a => a.trim()).filter(a => a);
        }
        if (coloresStr.trim()) {
            opciones.coloresHilo = coloresStr.split(',').map(c => c.trim()).filter(c => c);
        }
        if (tamañosStr.trim()) {
            opciones.tamaños = tamañosStr.split(',').map(t => t.trim()).filter(t => t);
        }
        
        return opciones;
    };

    // Función para procesar las imágenes (separadas por comas)
    const procesarImagenes = (imagenesStr) => {
        if (!imagenesStr.trim()) return [];
        return imagenesStr.split(',').map(img => img.trim()).filter(img => img);
    };

    // Función combinada: Sirve para Agregar o para Editar dependiendo del estado
    const manejarSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const opciones = procesarOpciones(anchos, coloresHilo, tamaños);
            const imagenesArray = procesarImagenes(imagenes);

            if (editandoId) {
                // LÓGICA DE EDICIÓN
                const productoRef = doc(db, 'productos', editandoId);
                await updateDoc(productoRef, {
                    nombre,
                    categoria,
                    descripcion,
                    material,
                    precio: Number(precio),
                    stock: Number(stock),
                    imagenes: imagenesArray,
                    opciones
                });
                toast.success('Producto actualizado correctamente');
            } else {
                // LÓGICA DE AGREGAR
                await addDoc(collection(db, 'productos'), {
                    nombre,
                    categoria,
                    descripcion,
                    material,
                    precio: Number(precio),
                    stock: Number(stock),
                    imagenes: imagenesArray,
                    opciones
                });
                toast.success('Producto agregado al catálogo');
            }

            cancelarEdicion(); // Limpiamos el formulario
            obtenerProductos(); // Recargamos la tabla

        } catch (error) {
            console.log('Error al guardar:', error);
            toast.error('Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    // Función para subir los datos del producto a los inputs
    const iniciarEdicion = (producto) => {
        setNombre(producto.nombre);
        setCategoria(producto.categoria);
        setDescripcion(producto.descripcion || '');
        setMaterial(producto.material);
        setPrecio(producto.precio);
        setStock(producto.stock);
        
        // Procesar imágenes de array a string separado por comas
        setImagenes(producto.imagenes && Array.isArray(producto.imagenes) 
            ? producto.imagenes.join(', ') 
            : '');
        
        // Procesar opciones de objeto a strings
        const opciones = producto.opciones || {};
        setAnchos(opciones.anchos && Array.isArray(opciones.anchos) 
            ? opciones.anchos.join(', ') 
            : '');
        setColoresHilo(opciones.coloresHilo && Array.isArray(opciones.coloresHilo) 
            ? opciones.coloresHilo.join(', ') 
            : '');
        setTamaños(opciones.tamaños && Array.isArray(opciones.tamaños) 
            ? opciones.tamaños.join(', ') 
            : '');
        
        setEditandoId(producto.id);

        // Scroll suave hacia arriba para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Función para limpiar el formulario y salir del modo edición
    const cancelarEdicion = () => {
        setNombre('');
        setCategoria('');
        setDescripcion('');
        setMaterial('');
        setPrecio('');
        setStock('');
        setImagenes('');
        setAnchos('');
        setColoresHilo('');
        setTamaños('');
        setEditandoId(null);
    };

    const eliminarProducto = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) {
            try {
                await deleteDoc(doc(db, 'productos', id));
                setProductos(productos.filter(producto => producto.id !== id));
                toast.success('Producto eliminado');
            } catch (error) {
                console.log('Error al eliminar:', error);
                toast.error('Error al eliminar el producto');
            }
        }
    };

    // Filtrado explícito: si no hay filtro, muestra todos; si hay, filtra por coincidencia exacta
    const productosFiltrados = productos.filter(producto =>
        categoriaFiltro === '' || producto.categoria === categoriaFiltro
    );

    if (loading) return <div className="loading">Cargando productos...</div>;

    return (
        <div className="productos-admin">
            <h2>Gestión del Catálogo de Productos</h2>

            {/* Formulario que se adapta para agregar o editar */}
            <div className="formulario-rapido">
                <h3>{editandoId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
                <form onSubmit={manejarSubmit} className="form-productos">
                    
                    <div className="form-row">
                        <input 
                            type="text" 
                            placeholder="Nombre del Producto" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                        />
                        
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                            <option value="">Selecciona una categoría</option>
                            <option value="Cadenas">Cadenas</option>
                            <option value="Pulsos">Pulsos</option>
                            <option value="Manillas Tejidas">Manillas Tejidas</option>
                            <option value="Anillos Tejidos">Anillos Tejidos</option>
                            <option value="Aretes y Topos">Aretes y Topos</option>
                        </select>
                    </div>

                    <textarea 
                        placeholder="Descripción del Producto (puedes pegar descripciones largas)" 
                        value={descripcion} 
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows="4"
                        required
                    />

                    <div className="form-row">
                        <select value={material} onChange={(e) => setMaterial(e.target.value)} required>   
                            <option value="">Selecciona material</option>
                            <option value="Oro Laminado">Oro Laminado</option>
                            <option value="Oro 18k">Oro 18k</option>
                            <option value="Plata 925">Plata 925</option>
                        </select>

                        <input 
                            type="number" 
                            placeholder="Precio ($)" 
                            value={precio} 
                            onChange={(e) => setPrecio(e.target.value)} 
                            required 
                        />

                        <input 
                            type="number" 
                            placeholder="Stock" 
                            value={stock} 
                            onChange={(e) => setStock(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-section">
                        <label><strong>Imágenes</strong> (URLs separadas por comas)</label>
                        <input 
                            type="text" 
                            placeholder="URL1, URL2, URL3..." 
                            value={imagenes} 
                            onChange={(e) => setImagenes(e.target.value)}
                        />
                    </div>

                    <div className="form-section">
                        <label><strong>Opciones disponibles</strong></label>
                        
                        <input 
                            type="text" 
                            placeholder="Anchos (Ej: 3mm, 5mm, 8mm)" 
                            value={anchos} 
                            onChange={(e) => setAnchos(e.target.value)}
                        />
                        
                        <input 
                            type="text" 
                            placeholder="Colores de Hilo (Ej: Dorado, Plateado)" 
                            value={coloresHilo} 
                            onChange={(e) => setColoresHilo(e.target.value)}
                        />
                        
                        <input 
                            type="text" 
                            placeholder="Tamaños (Ej: 60cm, 70cm)" 
                            value={tamaños} 
                            onChange={(e) => setTamaños(e.target.value)}
                        />
                    </div>

                    <div className="form-botones">
                        <button type="submit" disabled={loading} className="btn-guardar">
                            {editandoId ? 'Guardar Cambios' : 'Agregar Producto'}
                        </button>
                        {editandoId && (
                            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Contenedor del Filtro */}
            <div className="filtro-contenedor">
                <select
                    id="filtro-categoria"
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="select-filtro"
                >
                    <option value="">Todas las categorías</option>
                    <option value="Cadenas">Cadenas</option>
                    <option value="Pulsos">Pulsos</option>
                    <option value="Balines lisos">Balines lisos</option>
                    <option value="Balines diamantados">Balines diamantados</option>
                    <option value="Herrajes">Herrajes</option>
                    <option value="Dijes">Dijes</option>
                    <option value="Topos">Aretes y Topos</option>
                </select>
            </div>

            {/* Tabla de Productos */}
            <div className="tabla-contenedor">
                <table className="tabla-productos">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Material</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', color: '#777', padding: '30px' }}>
                                    No hay productos registrados en esta categoría.
                                </td>
                            </tr>
                        ) : (
                            productosFiltrados.map(producto => (
                                <tr key={producto.id} className={editandoId === producto.id ? 'fila-editando' : ''}>
                                    <td className="celda-imagen">
                                        {producto.imagenes && producto.imagenes.length > 0 ? (
                                            <img 
                                                src={producto.imagenes[0]} 
                                                alt={producto.nombre} 
                                                width="50" 
                                                height="50" 
                                                style={{ borderRadius: '6px', objectFit: 'cover' }} 
                                            />
                                        ) : 'Sin imagen'}
                                    </td>
                                    <td className="celda-nombre"><strong>{producto.nombre}</strong></td>
                                    <td className="celda-categoria"><span className="badge-categoria">{producto.categoria}</span></td>
                                    <td>{producto.material}</td>
                                    <td className="celda-precio"><strong>${Number(producto.precio).toFixed(2)}</strong></td>
                                    <td className="celda-stock">
                                        <span className={`stock-badge ${producto.stock < 20 ? 'stock-bajo' : 'stock-ok'}`}>
                                            {producto.stock}
                                        </span>
                                    </td>
                                    <td className="celda-acciones">
                                        <button className="btn-editar-sm" onClick={() => iniciarEdicion(producto)} title="Editar">✏️</button>
                                        <button className="btn-eliminar-sm" onClick={() => eliminarProducto(producto.id)} title="Eliminar">🗑️</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
