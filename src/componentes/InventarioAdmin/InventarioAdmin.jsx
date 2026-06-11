import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useToast } from '../../hooks/useToast';
import './InventarioAdmin.css';

export default function InventarioAdmin() {
    const toast = useToast();
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para saber si estamos editando (guardará el ID del insumo)
    const [editandoId, setEditandoId] = useState(null);
    // Estado para controlar el filtro de categoría seleccionado
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [material, setMaterial] = useState('');
    const [costo, setCosto] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [imagen, setImagen] = useState('');

    useEffect(() => {
        obtenerInventario();
    }, []);

    const obtenerInventario = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'inventario'));
            const inventarioFirebase = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInsumos(inventarioFirebase);
            setLoading(false);
        } catch (error) {
            console.log('Error al obtener inventario:', error);
            setLoading(false);
        }
    };

    // Función combinada: Sirve para Agregar o para Editar dependiendo del estado
    const manejarSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editandoId) {
                // LÓGICA DE EDICIÓN
                const insumoRef = doc(db, 'inventario', editandoId);
                await updateDoc(insumoRef, {
                    nombre,
                    categoria,
                    material,
                    costo: Number(costo),
                    precio: Number(precio),
                    stock: Number(stock),
                    imagen
                });
                toast.success('Insumo actualizado correctamente');
            } else {
                // LÓGICA DE AGREGAR (La que ya tenías)
                await addDoc(collection(db, 'inventario'), {
                    nombre,
                    categoria,
                    material,
                    costo: Number(costo),
                    precio: Number(precio),
                    stock: Number(stock),
                    imagen
                });
                toast.success('Insumo agregado al inventario');
            }

            cancelarEdicion(); // Limpiamos el formulario
            obtenerInventario(); // Recargamos la tabla

        } catch (error) {
            console.log('Error al guardar:', error);
            toast.error('Error al guardar el insumo');
        } finally {
            setLoading(false);
        }
    };

    // Función para subir los datos del insumo a los inputs
    const iniciarEdicion = (insumo) => {
        setNombre(insumo.nombre);
        setCategoria(insumo.categoria);
        setMaterial(insumo.material);
        setCosto(insumo.costo);
        setPrecio(insumo.precio);
        setStock(insumo.stock);
        setImagen(insumo.imagen || '');
        setEditandoId(insumo.id);

        // Opcional: Hace scroll suave hacia arriba para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Función para limpiar el formulario y salir del modo edición
    const cancelarEdicion = () => {
        setNombre(''); setCategoria(''); setMaterial('');
        setCosto(''); setPrecio(''); setStock(''); setImagen('');
        setEditandoId(null);
    };

    const eliminarInsumo = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este insumo del inventario?')) {
            try {
                await deleteDoc(doc(db, 'inventario', id));
                setInsumos(insumos.filter(insumo => insumo.id !== id));
                toast.success('Insumo eliminado');
            } catch (error) {
                console.log('Error al eliminar:', error);
            }
        }
    };

    // Filtrado explícito: si no hay filtro, muestra todos; si hay, filtra por coincidencia exacta
    const insumosFiltrados = insumos.filter(insumo =>
        categoriaFiltro === '' || insumo.categoria === categoriaFiltro
    );

    if (loading) return <div className="loading">Cargando inventario...</div>;


    return (
        <div className="inventario-admin">
            <h2>Gestión de Inventario</h2>

            {/* Formulario que se adapta para agregar o editar */}
            <div className="formulario-rapido">
                <h3>{editandoId ? '✏️ Editar Insumo' : 'Añadir Nuevo Insumo'}</h3>
                <form onSubmit={manejarSubmit} className="form-inventario">
                    <input type="text" placeholder="Nombre (Ej: Balín #5)" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                        <option value="">Selecciona una categoría</option>
                        <option value="Cadenas">Cadenas</option>
                        <option value="Pulsos">Pulsos</option>
                        <option value="Balines lisos">Balines lisos</option>
                        <option value="Balines diamantados">Balines diamantados</option>
                        <option value="Herrajes">Herrajes</option>
                        <option value="Dijes">Dijes</option>
                        <option value="Topos">Aretes y Topos</option>
                    </select>

                    <select value={material} onChange={(e) => setMaterial(e.target.value)} required>   
                        <option value="Oro Laminado">Oro Laminado</option>
                        <option value="Oro 18k">Oro 18k</option>
                        <option value="Plata 925">Plata 925</option>
                    </select>

                    <input type="number" placeholder="Costo ($)" value={costo} onChange={(e) => setCosto(e.target.value)} required />
                    <input type="number" placeholder="Precio Unidad ($)" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
                    <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required />
                    <input type="text" placeholder="URL Imagen" value={imagen} onChange={(e) => setImagen(e.target.value)} />

                    <div className="form-botones">
                        <button type="submit" disabled={loading} className="btn-guardar">
                            {editandoId ? 'Guardar Cambios' : 'Añadir Insumo'}
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
                    <option value="">Todo</option>
                    <option value="Cadenas">Cadenas</option>
                    <option value="Pulsos">Pulsos</option>
                    <option value="Balines lisos">Balines lisos</option>
                    <option value="Balines diamantados">Balines diamantados</option>
                    <option value="Herrajes">Herrajes</option>
                    <option value="Dijes">Dijes</option>
                    <option value="Topos">Topos</option>
                    <option value="Aretes">Aretes</option>
                </select>
            </div>

            {/* Tabla de Inventario */}
            <div className="tabla-contenedor">
                <table className="tabla-inventario">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Material</th>
                            <th>Costo</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', color: '#777', padding: '30px' }}>
                                    No hay insumos registrados en esta categoría.
                                </td>
                            </tr>
                        ) : (
                            insumosFiltrados.map(insumo => (
                                <tr key={insumo.id} className={editandoId === insumo.id ? 'fila-editando' : ''}>
                                    <td className="celda-imagen">
                                        {insumo.imagen ? <img src={insumo.imagen} alt={insumo.nombre} width="50" height="50" style={{ borderRadius: '6px', objectFit: 'cover' }} /> : 'Sin imagen'}
                                    </td>
                                    <td className="celda-nombre"><strong>{insumo.nombre}</strong></td>
                                    <td className="celda-categoria"><span className="badge-categoria">{insumo.categoria}</span></td>
                                    <td>{insumo.material}</td>
                                    <td className="celda-precio">${Number(insumo.costo).toFixed(2)}</td>
                                    <td className="celda-precio"><strong>${Number(insumo.precio).toFixed(2)}</strong></td>
                                    <td className="celda-stock">
                                        <span className={`stock-badge ${insumo.stock < 20 ? 'stock-bajo' : 'stock-ok'}`}>
                                            {insumo.stock}
                                        </span>
                                    </td>
                                    <td className="celda-acciones">
                                        <button className="btn-editar-sm" onClick={() => iniciarEdicion(insumo)} title="Editar">✏️</button>
                                        <button className="btn-eliminar-sm" onClick={() => eliminarInsumo(insumo.id)} title="Eliminar">🗑️</button>
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