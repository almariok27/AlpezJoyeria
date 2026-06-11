import React, { useState } from 'react';
import './DetalleProducto.css';

export default function DetalleProducto({ producto, onVolver }) {

  if (!producto) return null;

  const [seccionAbierta, setSeccionAbierta] = useState(null);
  const [modalTelefonoAbierto, setModalTelefonoAbierto] = useState(false);

  const [imagenActiva, setImagenActiva] = useState(
    producto.imagenes[0]
  );

  const [cantidad, setCantidad] = useState(1);

  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(
    producto.opciones?.tamaños?.[0] || ''
  );

  const [anchoSeleccionado, setAnchoSeleccionado] = useState(
    producto.opciones?.anchos?.[0] || ''
  );

  const [colorSeleccionado, setColorSeleccionado] = useState(
    producto.opciones?.coloresHilo?.[0] || ''
  );

  const alternarSeccion = (seccion) => {
    setSeccionAbierta(
      seccionAbierta === seccion ? null : seccion
    );
  };

  const numeros = [
    { numero: "3155556523", etiqueta: "3155556523" },
    { numero: "3219129345", etiqueta: "3219129345" }
  ];

  const construirMensaje = () => {
    let mensaje = `Hola, quiero comprar: ${cantidad} ${producto.nombre}`;
    
    const atributos = [];
    
    if (tamanoSeleccionado) {
      atributos.push(`tamaño ${tamanoSeleccionado}`);
    }
    if (anchoSeleccionado) {
      atributos.push(`ancho ${anchoSeleccionado}`);
    }
    if (colorSeleccionado) {
      atributos.push(`color ${colorSeleccionado}`);
    }
    
    if (atributos.length > 0) {
      mensaje += ` de ${atributos.join(', ')}`;
    }
    
    mensaje += ` con precio de $${producto.precio.toLocaleString()}`;
    
    return mensaje;
  };

  const handleEnviarWhatsApp = (numeroWhatsApp) => {
    const mensaje = construirMensaje();
    const enlace = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(enlace, '_blank');
    setModalTelefonoAbierto(false);
  };

  return (
    <main className="detalle-pagina">

      <button className="boton-volver" onClick={onVolver}>
        ← Volver al catálogo
      </button>

      <div className="detalle-contenedor">

        {/* ---------------- IMÁGENES ---------------- */}

        <div className="columna-imagenes">

          <div className="imagen-principal-contenedor">
            <img
              src={imagenActiva}
              alt={producto.nombre}
              className="imagen-principal"
            />
          </div>

          <div className="miniaturas-contenedor">

            {producto.imagenes.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={producto.nombre}
                className={`miniatura ${imagenActiva === img ? 'activa' : ''}`}
                onClick={() => setImagenActiva(img)}
              />
            ))}

          </div>

        </div>

        {/* ---------------- INFO ---------------- */}

        <div className="columna-info">

          <h1 className="detalle-titulo">
            {producto.nombre}
          </h1>

          <p className="detalle-material">
            {producto.material}
          </p>

          <p className="detalle-precio">
            $ {producto.precio.toLocaleString()}
          </p>

          {/* -------- TAMAÑOS -------- */}

          {producto.opciones?.tamaños && (
            <div className="selector-grupo">

              <label>Tamaño</label>

              <div className="opciones-botones">
                {producto.opciones.tamaños.map((tamano) => (
                  <button
                    key={tamano}
                    className={`opcion-boton ${tamanoSeleccionado === tamano ? 'activo' : ''}`}
                    onClick={() => setTamanoSeleccionado(tamano)}
                  >
                    {tamano}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* -------- ANCHOS -------- */}

          {producto.opciones?.anchos && (
            <div className="selector-grupo">

              <label>Ancho</label>

              <div className="opciones-botones">
                {producto.opciones.anchos.map((ancho) => (
                  <button
                    key={ancho}
                    className={`opcion-boton ${anchoSeleccionado === ancho ? 'activo' : ''}`}
                    onClick={() => setAnchoSeleccionado(ancho)}
                  >
                    {ancho}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* -------- COLORES -------- */}

          {producto.opciones?.coloresHilo && (
            <div className="selector-grupo">

              <label>Color</label>

              <div className="opciones-botones">
                {producto.opciones.coloresHilo.map((color) => (
                  <button
                    key={color}
                    className={`opcion-boton ${colorSeleccionado === color ? 'activo' : ''}`}
                    onClick={() => setColorSeleccionado(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* -------- CANTIDAD -------- */}

          <div className="cantidad-contenedor">

            <button
              className="cantidad-boton"
              onClick={() =>
                cantidad > 1 &&
                setCantidad(cantidad - 1)
              }
            >
              -
            </button>

            <span className="cantidad-numero">
              {cantidad}
            </span>

            <button
              className="cantidad-boton"
              onClick={() =>
                setCantidad(cantidad + 1)
              }
            >
              +
            </button>

          </div>

          {/* -------- BOTÓN -------- */}

          <button
            onClick={() => setModalTelefonoAbierto(true)}
            className="btn-whatsapp"
          >
            COMPRAR POR WHATSAPP
          </button>

          {/* ---------------- ACORDEONES ---------------- */}

          <div className="acordeon-contenedor">

            {/* DESCRIPCIÓN */}

            <div className="acordeon-item">

              <button
                className="acordeon-titulo"
                onClick={() => alternarSeccion('descripcion')}
              >
                <span>Descripción</span>

                <span>
                  {seccionAbierta === 'descripcion' ? '-' : '+'}
                </span>
              </button>

              <div
                className={`acordeon-contenido ${seccionAbierta === 'descripcion' ? 'abierto' : ''}`}
              >
                <p>
                  {producto.descripcion}
                </p>
              </div>

            </div>

            {/* GARANTÍA */}

            <div className="acordeon-item">

              <button
                className="acordeon-titulo"
                onClick={() => alternarSeccion('garantia')}
              >
                <span>Garantía</span>

                <span>
                  {seccionAbierta === 'garantia' ? '-' : '+'}
                </span>
              </button>

              <div
                className={`acordeon-contenido ${seccionAbierta === 'garantia' ? 'abierto' : ''}`}
              >
                <p>
                  Garantía de 1 año únicamente por cambio de tono del oro laminado 18K. La garantía aplica siempre y cuando el cambio de color no haya sido ocasionado por mal uso, químicos, golpes, humedad extrema o daños producidos por el comprador. No cubre rupturas, estiramientos, rayones, daños físicos ni cualquier otro tipo de afectación diferente al cambio natural de tono.                </p>
              </div>

            </div>

            {/* CUIDADOS */}

            <div className="acordeon-item">

              <button
                className="acordeon-titulo"
                onClick={() => alternarSeccion('cuidados')}
              >
                <span>Cuidados de la joya</span>

                <span>
                  {seccionAbierta === 'cuidados' ? '-' : '+'}
                </span>
              </button>

              <div
                className={`acordeon-contenido ${seccionAbierta === 'cuidados' ? 'abierto' : ''}`}
              >
                <p>
                  Resistente a perfumes, cremas, agua de piscina, agua de mar y al sudor. 
                  Para una mejor durabilidad de la prenda se recomienda evitar el contacto con productos químicos, así como evitar usarla durante actividades que puedan ocasionar golpes o roces fuertes. Para limpiar la joya, se recomienda usar un paño suave y seco para eliminar cualquier suciedad o residuo. Se recomienda limpiarlo suavemente con jabon liquido, así tendran su prenda de nuevo totalmente nueva. 
                </p>
              </div>

            </div>

            {/* ENVÍOS */}

            <div className="acordeon-item">

              <button
                className="acordeon-titulo"
                onClick={() => alternarSeccion('envios')}
              >
                <span>Envíos</span>

                <span>
                  {seccionAbierta === 'envios' ? '-' : '+'}
                </span>
              </button>

              <div
                className={`acordeon-contenido ${seccionAbierta === 'envios' ? 'abierto' : ''}`}
              >
                <p>
                  Contamos con servicio de domicilio a toda Florencia Cauqetá, tambien tenemos envios a toda colombia y envios internacionales. El costo del envío varía según la ubicación del cliente y el peso del paquete. Para envíos dentro de Florencia Cauqetá, el costo es de $5.000 COP. Para envíos nacionales dentro de Colombia, el costo es de $10.000 COP. Para envíos internacionales, el costo se calcula según el destino y el peso del paquete, por lo que se recomienda contactar con nuestro equipo para obtener una cotización personalizada.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* MODAL SELECCIONAR TELÉFONO */}
      {modalTelefonoAbierto && (
        <div className="modal-overlay" onClick={() => setModalTelefonoAbierto(false)}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <h2>Selecciona un número para enviar tu compra</h2>
            <div className="modal-botones">
              {numeros.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleEnviarWhatsApp(item.numero)}
                  className="modal-boton-telefono"
                >
                  {item.etiqueta}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalTelefonoAbierto(false)}
              className="modal-boton-cerrar"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </main>
  );
}