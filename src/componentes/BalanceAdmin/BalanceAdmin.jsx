import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, writeBatch, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useToast } from '../../hooks/useToast';
import './BalanceAdmin.css';

export default function BalanceAdmin() {
    const toast = useToast();
    const [inventario, setInventario] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados del Formulario de Gastos
    const [descripcionGasto, setDescripcionGasto] = useState('');
    const [valorGasto, setValorGasto] = useState('');
    const [quienGasto, setQuienGasto] = useState('');
    // Estados para el Historial de Ciclos
    const [historialCiclos, setHistorialCiclos] = useState([]);
    const [cicloSeleccionadoId, setCicloSeleccionadoId] = useState('');
    const [datosCicloSeleccionado, setDatosCicloSeleccionado] = useState(null);
    const [ventasCicloSeleccionado, setVentasCicloSeleccionado] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            // 1. Cargar Inventario Total
            const invSnap = await getDocs(collection(db, 'inventario'));
            const invData = invSnap.docs.map(d => d.data());

            // 2. Cargar SOLO Ventas del ciclo actual (ID_Ciclo == "") - Consulta explícita y optimizada
            const qVentas = query(collection(db, 'ventas'), where('ID_Ciclo', '==', ''));
            const ventasSnap = await getDocs(qVentas);
            const ventasData = ventasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // 3. Cargar SOLO Gastos del ciclo actual (ID_Ciclo == "")
            const qGastos = query(collection(db, 'gastos'), where('ID_Ciclo', '==', ''));
            const gastosSnap = await getDocs(qGastos);
            const gastosData = gastosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // 4. Cargar Historial de Ciclos (Solo los resúmenes, no todas las ventas)
            const historialSnap = await getDocs(collection(db, 'historial_ciclos'));
            const historialData = historialSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            setHistorialCiclos(historialData);
            setInventario(invData);
            setVentas(ventasData);
            setGastos(gastosData);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setCargando(false);
        }
    };

    const manejarSeleccionCiclo = async (idCiclo) => {
        setCicloSeleccionadoId(idCiclo);

        if (!idCiclo) {
            setDatosCicloSeleccionado(null);
            setVentasCicloSeleccionado([]);
            return;
        }

        // Obtenemos los datos matemáticos del ciclo seleccionado
        const ciclo = historialCiclos.find(c => c.ID_Ciclo === idCiclo);
        setDatosCicloSeleccionado(ciclo);

        // Consultamos a la base de datos SOLO las ventas que tengan este ID_Ciclo
        try {
            const qVentasCiclo = query(collection(db, 'ventas'), where('ID_Ciclo', '==', idCiclo));
            const ventasSnap = await getDocs(qVentasCiclo);
            const ventasData = ventasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setVentasCicloSeleccionado(ventasData);
        } catch (error) {
            console.error("Error cargando ventas del ciclo histórico:", error);
        }
    };

    // CÁLCULOS MATEMÁTICOS (Estado Derivado: se calcula solo al renderizar, no se guarda en variables de estado extras)
    const valorTotalInventario = inventario.reduce((acc, item) => acc + (item.costo * item.stock), 0);
    const totalVendido = ventas.reduce((acc, v) => acc + Number(v.Total), 0);
    const costosTotalesVentas = ventas.reduce((acc, v) => acc + Number(v.CostoTotal), 0);
    const totalGastos = gastos.reduce((acc, g) => acc + Number(g.Valor), 0);

    const ganancia = (totalVendido - costosTotalesVentas) - totalGastos;
    const dineroDisponible = totalVendido - totalGastos;

    // FUNCIONES
    const registrarGasto = async (e) => {
        e.preventDefault();
        if (!descripcionGasto || !valorGasto || !quienGasto) return toast.error('Llena todos los campos del gasto');

        const nuevoGasto = {
            Fecha: new Date().toLocaleDateString('es-CO'),
            Descripcion: descripcionGasto,
            QuienLoHizo: quienGasto,
            Valor: Number(valorGasto),
            ID_Ciclo: "" // Nace abierto igual que las ventas
        };

        try {
            const docRef = await addDoc(collection(db, 'gastos'), nuevoGasto);
            // Actualizamos la vista sin recargar Firebase
            setGastos([...gastos, { id: docRef.id, ...nuevoGasto }]);
            setDescripcionGasto('');
            setValorGasto('');
            setQuienGasto('');
            toast.success('Gasto registrado');
        } catch (error) {
            console.error('Error al registrar gasto:', error);
        }
    };

    const procesarCierreCiclo = async () => {
        if (ventas.length === 0 && gastos.length === 0) {
            return toast.warning('No hay ventas ni gastos para cerrar en este ciclo.');
        }

        if (!window.confirm('¿Estás seguro de cerrar el ciclo? Esto agrupará todas las ventas y gastos actuales en el historial y limpiará el tablero principal.')) {
            return;
        }

        setCargando(true);
        try {
            // Generar identificador único y fechas
            const fechaActual = new Date();
            const nuevoIdCiclo = `C-${fechaActual.getFullYear()}${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

            const fechaFinStr = fechaActual.toLocaleDateString('es-CO');
            const mesFinStr = fechaActual.toLocaleString('es-CO', { month: 'long' });

            // Asumimos que la fecha de inicio es la de la primera venta o gasto (la más antigua)
            const primeraVenta = ventas.length > 0 ? ventas[0].Fecha : fechaFinStr;

            // Objeto estructurado tal como lo pediste
            const resumenCiclo = {
                ID_Ciclo: nuevoIdCiclo,
                FechaInicio: primeraVenta,
                FechaFin: fechaFinStr,
                MesInicio: primeraVenta.split('/')[1] || mesFinStr, // Simplificación del mes
                MesFin: mesFinStr,
                TotalVendido: totalVendido,
                CostoProductos: costosTotalesVentas,
                GananciaVentas: ganancia,
                TotalGastos: totalGastos,
                CantidadVentas: ventas.length,
                CantidadGastos: gastos.length
            };

            // Usamos writeBatch para hacer TODAS las actualizaciones en un solo viaje a la base de datos
            const batch = writeBatch(db);

            // 1. Marcar ventas
            ventas.forEach(venta => {
                const ventaRef = doc(db, 'ventas', venta.id);
                batch.update(ventaRef, { ID_Ciclo: nuevoIdCiclo });
            });

            // 2. Marcar gastos
            gastos.forEach(gasto => {
                const gastoRef = doc(db, 'gastos', gasto.id);
                batch.update(gastoRef, { ID_Ciclo: nuevoIdCiclo });
            });

            // 3. Guardar en historial
            const historialRef = doc(collection(db, 'historial_ciclos'));
            batch.set(historialRef, resumenCiclo);

            // Ejecutar el lote completo
            await batch.commit();

            toast.success(`Ciclo cerrado con éxito. ID: ${nuevoIdCiclo}`);

            // Limpiar pantalla
            setVentas([]);
            setGastos([]);

        } catch (error) {
            console.error('Error al cerrar el ciclo:', error);
            toast.error('Hubo un error al cerrar el ciclo.');
        } finally {
            setCargando(false);
        }
    };

    if (cargando) return <div className="loading">Calculando balance del ciclo...</div>;

    return (
        <div className="balance-admin-container">
            <div className="balance-header-row">
                <h2>Balance General y Cierre de Ciclo</h2>
                <button className="btn-cerrar-ciclo" onClick={procesarCierreCiclo}>
                    Cerrar Ciclo de Inventario
                </button>
            </div>

            {/* TARJETAS DE INDICADORES (KPIs) */}
            <div className="kpi-grid">
                <div className="kpi-card neutro">
                    <p>Total Inventario (Costos)</p>
                    <h3>${valorTotalInventario.toLocaleString()}</h3>
                </div>
                <div className="kpi-card ventas">
                    <p>Total Vendido</p>
                    <h3>${totalVendido.toLocaleString()}</h3>
                </div>
                <div className="kpi-card costos">
                    <p>Costo de Ventas</p>
                    <h3>${costosTotalesVentas.toLocaleString()}</h3>
                </div>
                <div className="kpi-card gastos-kpi">
                    <p>Total Gastos</p>
                    <h3>${totalGastos.toLocaleString()}</h3>
                </div>
                <div className="kpi-card ganancia">
                    <p>Ganancia Neta</p>
                    <h3>${ganancia.toLocaleString()}</h3>
                </div>
                <div className="kpi-card disponible">
                    <p>Dinero Disponible (Caja)</p>
                    <h3>${dineroDisponible.toLocaleString()}</h3>
                </div>
            </div>

            <div className="balance-workspace">

                {/* COLUMNA IZQUIERDA: GASTOS */}
                <div className="columna-gastos">
                    <div className="bloque-formulario">
                        <h3>Registrar Gasto Operativo</h3>
                        <form onSubmit={registrarGasto} className="form-gastos">
                            <input type="text" placeholder="Descripción del gasto" value={descripcionGasto} onChange={(e) => setDescripcionGasto(e.target.value)} required />
                            <input type="number" placeholder="Valor ($)" value={valorGasto} onChange={(e) => setValorGasto(e.target.value)} required />
                            <select value={quienGasto} onChange={(e) => setQuienGasto(e.target.value)} required>
                                <option value="">-- ¿Quién hizo el gasto? --</option>
                                <option value="Mauricio">Mauricio</option>
                                <option value="Almario">Almario</option>
                            </select>
                            <button type="submit" className="btn-agregar-gasto">Añadir Gasto</button>
                        </form>
                    </div>

                    <div className="lista-bloque">
                        <h3>Gastos del Ciclo Actual</h3>
                        {gastos.length === 0 ? <p className="vacio">No hay gastos en este ciclo.</p> : (
                            <table className="tabla-balance">
                                <thead><tr><th>Fecha</th><th>Descripción</th><th>Autor</th><th>Valor</th></tr></thead>
                                <tbody>
                                    {gastos.map(g => (
                                        <tr key={g.id}>
                                            <td>{g.Fecha}</td>
                                            <td>{g.Descripcion}</td>
                                            <td>{g.QuienLoHizo}</td>
                                            <td className="texto-rojo">-${g.Valor.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: VENTAS */}
                <div className="columna-ventas">
                    <div className="lista-bloque">
                        <h3>Ventas del Ciclo Actual</h3>
                        {ventas.length === 0 ? <p className="vacio">No hay ventas registradas aún.</p> : (
                            <div className="tabla-scroll">
                                <table className="tabla-balance">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Cliente</th>
                                            <th>Productos</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ventas.map(v => (
                                            <tr key={v.id}>
                                                <td>{v.Fecha}</td>
                                                <td>{v.Cliente}</td>
                                                <td className="texto-pequeno">{v.Productos}</td>
                                                <td className="texto-verde">${v.Total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            {/* --- SECCIÓN DE HISTORIAL DE CICLOS (NUEVO) --- */}
            <div className="historial-ciclos-seccion">
                <h2 style={{ marginTop: '40px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                    Ciclos Anteriores
                </h2>

                <div className="selector-ciclo bloque-formulario">
                    <label>Selecciona un periodo:</label>
                    <select
                        value={cicloSeleccionadoId}
                        onChange={(e) => manejarSeleccionCiclo(e.target.value)}
                    >
                        <option value="">Ninguno</option>
                        {historialCiclos.map(c => (
                            <option key={c.id} value={c.ID_Ciclo}>
                                {c.MesFin} ({c.FechaInicio} al {c.FechaFin}) - ID: {c.ID_Ciclo}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Si hay un ciclo seleccionado, mostramos sus datos */}
                {datosCicloSeleccionado && (
                    <div className="detalles-ciclo-seleccionado" style={{ marginTop: '20px' }}>

                        {/* KPIs del Ciclo Histórico */}
                        <div className="kpi-grid">
                            <div className="kpi-card ventas">
                                <p>Total Vendido ({datosCicloSeleccionado.MesFin})</p>
                                <h3>${datosCicloSeleccionado.TotalVendido.toLocaleString()}</h3>
                            </div>
                            <div className="kpi-card gastos-kpi">
                                <p>Total Gastos</p>
                                <h3>${datosCicloSeleccionado.TotalGastos.toLocaleString()}</h3>
                            </div>
                            <div className="kpi-card ganancia">
                                <p>Ganancia Neta</p>
                                <h3>${datosCicloSeleccionado.GananciaVentas.toLocaleString()}</h3>
                            </div>
                        </div>

                        {/* Tabla de ventas del Ciclo Histórico */}
                        <div className="lista-bloque" style={{ marginTop: '20px' }}>
                            <h3>Ventas Registradas en el Ciclo: {datosCicloSeleccionado.ID_Ciclo}</h3>
                            {ventasCicloSeleccionado.length === 0 ? (
                                <p className="vacio">No se encontraron ventas para este ciclo.</p>
                            ) : (
                                <div className="tabla-scroll">
                                    <table className="tabla-balance">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Cliente</th>
                                                <th>Productos</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ventasCicloSeleccionado.map(v => (
                                                <tr key={v.id}>
                                                    <td>{v.Fecha}</td>
                                                    <td>{v.Cliente}</td>
                                                    <td className="texto-pequeno">{v.Productos}</td>
                                                    <td className="texto-verde">${v.Total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}