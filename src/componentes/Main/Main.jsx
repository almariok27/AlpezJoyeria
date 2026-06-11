import React, { useEffect, useState } from 'react';

import {
    collection,
    getDocs
} from 'firebase/firestore';

import { db } from '../../firebase/firebase';

import TarjetaProducto from '../ProductoTarjeta/ProductoTarjeta';
import FiltrosProductos from '../FiltrosProductos/FiltrosProductos';

import './Main.css';

function Main() {

    const [productos, setProductos] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [termino, setTermino] = useState('');
    const [precioOrden, setPrecioOrden] = useState('');
    const [categoriaFiltro, setCategoria] = useState('');

    useEffect(() => {

        const obtenerProductos = async () => {

            try {

                const querySnapshot = await getDocs(
                    collection(db, "productos")
                );

                const productosFirebase = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setProductos(productosFirebase);
                setResultados(productosFirebase);

            } catch (error) {

                console.log(error);

            }

        };

        obtenerProductos();

    }, []);

    // BÚSQUEDA Y FILTROS EN TIEMPO REAL
    useEffect(() => {
        let productosFiltrados = [...productos];

        // 1. Filtrar por búsqueda
        if (termino.trim() !== '') {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.nombre.toLowerCase().includes(termino.toLowerCase())
            );
        }

        // 2. Filtrar por categoría
        if (categoriaFiltro !== '') {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.categoria === categoriaFiltro
            );
        }

        // 3. Ordenar por precio
        if (precioOrden !== '') {
            productosFiltrados.sort((a, b) => {
                if (precioOrden === 'asc') {
                    return a.precio - b.precio;
                } else if (precioOrden === 'desc') {
                    return b.precio - a.precio;
                }
                return 0;
            });
        }

        setResultados(productosFiltrados);
    }, [termino, precioOrden, categoriaFiltro, productos]);

    // EXTRAER CATEGORÍAS ÚNICAS DE TODOS LOS PRODUCTOS
    const categoriasUnicas = [
        ...new Set(
            productos.map(producto => producto.categoria)
        )
    ].sort();

    // EXTRAER CATEGORÍAS ÚNICAS DEL RESULTADO (para mostrar solo las que hay)
    const categoriasResultado = [
        ...new Set(
            resultados.map(producto => producto.categoria)
        )
    ];

    // FORMATEAR TÍTULO
    const formatearTitulo = (texto) => {
        return texto.replace(/-/g, ' ').toUpperCase();
    };

    return (

        <main className="contenedor-principal">

            {/* BUSCADOR Y FILTROS - LADO A LADO */}
            <div className="buscador-filtros-container">
                {/* BUSCADOR PEQUEÑO */}
                <div className="buscador-main-wrapper">
                    <svg className="buscador-main-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={termino}
                        onChange={(e) => setTermino(e.target.value)}
                        className="buscador-main-input"
                    />
                    {termino && (
                        <button 
                            className="buscador-main-clear"
                            onClick={() => setTermino('')}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* FILTROS */}
                <FiltrosProductos
                    precioOrden={precioOrden}
                    setPrecioOrden={setPrecioOrden}
                    categoriaFiltro={categoriaFiltro}
                    setCategoria={setCategoria}
                    categoriasDisponibles={categoriasUnicas}
                />
            </div>

            {/* MENSAJE SI HAY BÚSQUEDA ACTIVA */}
            {termino && (
                <>
                    <p className="resultados-info">
                        {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
                    </p>
                </>
            )}

            {/* MENSAJE SI NO HAY RESULTADOS */}
            {termino && resultados.length === 0 && (
                <div className="sin-resultados">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3>No encontramos "{termino}"</h3>
                    <p>Intenta con otro nombre de producto</p>
                </div>
            )}

            {/* CATEGORÍAS Y PRODUCTOS */}
            {categoriasResultado.map((categoria) => (

                <section
                    key={categoria}
                    className="seccion-categoria"
                >

                    <h3 className="titulo-categoria">
                        {formatearTitulo(categoria)}
                    </h3>

                    <div className="cuadricula-productos">

                        {resultados
                            .filter(producto =>
                                producto.categoria === categoria
                            )
                            .map((producto) => (

                                <TarjetaProducto
                                    key={producto.id}
                                    producto={producto}
                                />

                            ))}

                    </div>

                </section>

            ))}

        </main>
    );
}

export default Main;