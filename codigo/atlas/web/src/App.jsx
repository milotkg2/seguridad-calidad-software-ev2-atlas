import { useEffect, useState } from 'react';

const SESION = 'atlas.sesion';

async function api(ruta, { method = 'GET', body, token, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(ruta, { method, headers, body: payload });
  const texto = await res.text();
  const data = texto ? JSON.parse(texto) : null;
  if (!res.ok) {
    const error = new Error(data?.error || 'No se pudo completar la acción.');
    error.status = res.status;
    throw error;
  }
  return data;
}

function guardar(sesion) {
  sessionStorage.setItem(SESION, JSON.stringify(sesion));
}

export default function App() {
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESION) || 'null');
    } catch {
      return null;
    }
  });
  const [vista, setVista] = useState(sesion ? 'clientes' : 'login');
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');

  function entrar(datos) {
    const siguiente = { token: datos.token, refreshToken: datos.refreshToken, usuario: datos.usuario };
    setSesion(siguiente);
    guardar(siguiente);
    setVista(datos.usuario.empresaId ? 'clientes' : 'empresa');
    setError('');
  }

  async function salir() {
    try {
      if (sesion?.token) await api('/api/auth/logout', { method: 'POST', token: sesion.token, body: { refreshToken: sesion.refreshToken } });
    } catch {
      /* la sesión local se cierra igual */
    }
    sessionStorage.removeItem(SESION);
    setSesion(null);
    setVista('login');
  }

  const token = sesion?.token;
  const usuario = sesion?.usuario;
  const esAdmin = usuario?.rol === 'administrador';

  return (
    <div className="pagina">
      <header className="barra">
        <div>
          <p className="marca">Atlas</p>
          <p className="sub">Clientes y contratos para pymes</p>
        </div>
        {usuario && (
          <nav aria-label="Principal">
            <button type="button" onClick={() => setVista('clientes')}>Clientes</button>
            <button type="button" onClick={() => setVista('usuarios')}>Usuarios</button>
            <button type="button" onClick={() => setVista('auditoria')}>Auditoría</button>
            <button type="button" onClick={() => setVista('ayuda')}>Ayuda</button>
            <button type="button" onClick={salir}>Salir</button>
          </nav>
        )}
      </header>
      {error && <p className="alerta" role="alert">{error}</p>}
      {aviso && <p className="ok" role="status">{aviso}</p>}
      {!usuario && vista === 'login' && <Login onOk={entrar} onError={setError} irRegistro={() => { setVista('registro'); setError(''); }} />}
      {!usuario && vista === 'registro' && <Registro onOk={entrar} onError={setError} irLogin={() => setVista('login')} />}
      {usuario && !usuario.empresaId && <Empresa token={token} onError={setError} onCreada={async () => {
        const yo = await api('/api/auth/yo', { token });
        const siguiente = { ...sesion, usuario: yo.usuario };
        setSesion(siguiente);
        guardar(siguiente);
        setVista('clientes');
        setAviso('Empresa creada. Ya puede administrar sus datos.');
      }} />}
      {usuario?.empresaId && vista === 'clientes' && (
        <Clientes token={token} empresaId={usuario.empresaId} esAdmin={esAdmin} onError={setError} setAviso={setAviso} abrir={(id) => setVista(`cliente:${id}`)} />
      )}
      {usuario?.empresaId && vista.startsWith('cliente:') && (
        <ClienteDetalle
          token={token}
          empresaId={usuario.empresaId}
          clienteId={vista.split(':')[1]}
          esAdmin={esAdmin}
          onError={setError}
          setAviso={setAviso}
          volver={() => setVista('clientes')}
          abrirContrato={(id) => setVista(`contrato:${id}`)}
        />
      )}
      {usuario?.empresaId && vista.startsWith('contrato:') && (
        <ContratoDetalle token={token} contratoId={vista.split(':')[1]} esAdmin={esAdmin} onError={setError} setAviso={setAviso} volver={() => setVista('clientes')} />
      )}
      {usuario?.empresaId && vista === 'usuarios' && <Usuarios token={token} empresaId={usuario.empresaId} esAdmin={esAdmin} onError={setError} setAviso={setAviso} />}
      {usuario?.empresaId && vista === 'auditoria' && <Auditoria token={token} empresaId={usuario.empresaId} onError={setError} />}
      {usuario && vista === 'ayuda' && <Ayuda />}
    </div>
  );
}

function Login({ onOk, onError, irRegistro }) {
  const [nombre, setNombre] = useState('jperez');
  const [password, setPassword] = useState('');
  async function enviar(e) {
    e.preventDefault();
    try {
      onOk(await api('/api/auth/login', { method: 'POST', body: { nombre_usuario: nombre, password } }));
    } catch (error) {
      onError(error.message);
    }
  }
  return (
    <form className="tarjeta" onSubmit={enviar}>
      <h1>Iniciar sesión</h1>
      <label htmlFor="usuario">Usuario</label>
      <input id="usuario" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="username" required />
      <label htmlFor="clave">Contraseña</label>
      <input id="clave" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      <button type="submit">Entrar</button>
      <p className="ayuda">Ambiente de prueba: jperez o editor1. La contraseña de QA está en el README de Atlas.</p>
      <button type="button" className="secundario" onClick={irRegistro}>Crear una cuenta</button>
    </form>
  );
}

function Registro({ onOk, onError, irLogin }) {
  const [form, setForm] = useState({ nombre_usuario: '', correo: '', password: '' });
  function set(k, v) { setForm({ ...form, [k]: v }); }
  async function enviar(e) {
    e.preventDefault();
    try { onOk(await api('/api/auth/register', { method: 'POST', body: form })); }
    catch (error) { onError(error.message); }
  }
  return (
    <form className="tarjeta" onSubmit={enviar}>
      <h1>Registro</h1>
      <p className="ayuda">Después podrá crear su empresa. El primer usuario queda como administrador.</p>
      <label htmlFor="ru">Usuario</label>
      <input id="ru" value={form.nombre_usuario} onChange={(e) => set('nombre_usuario', e.target.value)} required />
      <label htmlFor="rc">Correo</label>
      <input id="rc" type="email" value={form.correo} onChange={(e) => set('correo', e.target.value)} required />
      <label htmlFor="rp">Contraseña</label>
      <input id="rp" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
      <p className="ayuda">Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.</p>
      <button type="submit">Registrarme</button>
      <button type="button" className="secundario" onClick={irLogin}>Ya tengo cuenta</button>
    </form>
  );
}

function Empresa({ token, onError, onCreada }) {
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', correo: '' });
  async function enviar(e) {
    e.preventDefault();
    try { await api('/api/empresas', { method: 'POST', token, body: form }); await onCreada(); }
    catch (error) { onError(error.message); }
  }
  return (
    <form className="tarjeta" onSubmit={enviar}>
      <h1>Crear empresa</h1>
      {['nombre', 'direccion', 'telefono', 'correo'].map((campo) => (
        <span key={campo}>
          <label htmlFor={campo}>{campo}</label>
          <input id={campo} value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} required />
        </span>
      ))}
      <button type="submit">Crear y continuar</button>
    </form>
  );
}

function Clientes({ token, empresaId, esAdmin, onError, setAviso, abrir }) {
  const [nombre, setNombre] = useState('');
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', direccion: '', contacto: '', datosBancarios: '', rut: '' });
  const [confirmar, setConfirmar] = useState(null);

  async function cargar(filtro = nombre) {
    const data = await api(`/api/empresas/${empresaId}/clients?nombre=${encodeURIComponent(filtro)}`, { token });
    setLista(data.data);
  }
  useEffect(() => { cargar('').catch((e) => onError(e.message)); }, []);

  async function crear(e) {
    e.preventDefault();
    try {
      await api(`/api/empresas/${empresaId}/clients`, { method: 'POST', token, body: form });
      setForm({ nombre: '', descripcion: '', direccion: '', contacto: '', datosBancarios: '', rut: '' });
      setAviso('Cliente creado.');
      await cargar();
    } catch (error) { onError(error.message); }
  }

  async function borrar() {
    try {
      await api(`/api/empresas/${empresaId}/clients/${confirmar.id}`, { method: 'DELETE', token });
      setAviso(`Se marcó como eliminado a ${confirmar.nombre}. El registro no se borra de la base.`);
      setConfirmar(null);
      await cargar();
    } catch (error) { onError(error.message); }
  }

  return (
    <section>
      <h1>Clientes</h1>
      <form className="fila" onSubmit={(e) => { e.preventDefault(); cargar().catch((err) => onError(err.message)); }}>
        <label htmlFor="buscar">Buscar por nombre</label>
        <input id="buscar" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <button type="submit">Filtrar</button>
      </form>
      <ul className="lista">
        {lista.map((c) => (
          <li key={c.id}>
            <button type="button" className="enlace" onClick={() => abrir(c.id)}>{c.nombre}</button>
            <span>{c.rut}</span>
            {esAdmin && <button type="button" className="peligro" onClick={() => setConfirmar(c)}>Eliminar</button>}
          </li>
        ))}
      </ul>
      {confirmar && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="conf-titulo">
          <h2 id="conf-titulo">Confirmar eliminación</h2>
          <p>¿Marcar como eliminado a {confirmar.nombre}? Es una baja lógica: el dato queda auditado y no se muestra en el listado.</p>
          <button type="button" className="peligro" onClick={borrar}>Sí, eliminar</button>
          <button type="button" className="secundario" onClick={() => setConfirmar(null)}>Cancelar</button>
        </div>
      )}
      {esAdmin && (
        <form className="tarjeta" onSubmit={crear}>
          <h2>Nuevo cliente</h2>
          {['nombre', 'descripcion', 'direccion', 'contacto', 'datosBancarios', 'rut'].map((campo) => (
            <span key={campo}>
              <label htmlFor={`c-${campo}`}>{campo}</label>
              <input id={`c-${campo}`} value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} required={campo === 'nombre'} />
            </span>
          ))}
          <button type="submit">Guardar cliente</button>
        </form>
      )}
    </section>
  );
}

function ClienteDetalle({ token, empresaId, clienteId, esAdmin, onError, setAviso, volver, abrirContrato }) {
  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [form, setForm] = useState({ titulo: '', descripcion: '', fechaInicio: '2026-10-01', fechaTermino: '2027-10-01', codigo: '' });
  useEffect(() => {
    api(`/api/empresas/${empresaId}/clients/${clienteId}`, { token }).then(setCliente).catch((e) => onError(e.message));
    api(`/api/clientes/${clienteId}/contratos`, { token }).then((d) => setContratos(d.data)).catch((e) => onError(e.message));
  }, [clienteId]);
  async function crear(e) {
    e.preventDefault();
    try {
      await api('/api/contratos', { method: 'POST', token, body: { ...form, clienteId: Number(clienteId) } });
      setAviso('Contrato creado.');
      const d = await api(`/api/clientes/${clienteId}/contratos`, { token });
      setContratos(d.data);
    } catch (error) { onError(error.message); }
  }
  if (!cliente) return <p>Cargando cliente…</p>;
  return (
    <section>
      <button type="button" className="secundario" onClick={volver}>Volver a clientes</button>
      <h1>{cliente.nombre}</h1>
      <p>{cliente.descripcion}</p>
      <p>{cliente.direccion} · {cliente.contacto}</p>
      <h2>Contratos</h2>
      <ul className="lista">
        {contratos.map((c) => (
          <li key={c.id}>
            <button type="button" className="enlace" onClick={() => abrirContrato(c.id)}>{c.codigo} · {c.titulo}</button>
            <span className={`estado ${c.estado}`}>{c.estado}</span>
          </li>
        ))}
      </ul>
      {esAdmin && (
        <form className="tarjeta" onSubmit={crear}>
          <h2>Nuevo contrato</h2>
          <label htmlFor="titulo">Título</label>
          <input id="titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
          <label htmlFor="desc">Descripción</label>
          <input id="desc" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <label htmlFor="fi">Fecha de inicio</label>
          <input id="fi" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required />
          <label htmlFor="ft">Fecha de término</label>
          <input id="ft" type="date" value={form.fechaTermino} onChange={(e) => setForm({ ...form, fechaTermino: e.target.value })} required />
          <button type="submit">Guardar contrato</button>
        </form>
      )}
    </section>
  );
}

function ContratoDetalle({ token, contratoId, esAdmin, onError, setAviso, volver }) {
  const [contrato, setContrato] = useState(null);
  const [enlace, setEnlace] = useState('');
  async function cargar() {
    setContrato(await api(`/api/contratos/${contratoId}`, { token }));
  }
  useEffect(() => { cargar().catch((e) => onError(e.message)); }, [contratoId]);
  async function subir(e) {
    e.preventDefault();
    const archivo = e.target.archivo.files[0];
    if (!archivo) return;
    const form = new FormData();
    form.append('archivo', archivo);
    try {
      await api(`/api/contratos/${contratoId}/documentos`, { method: 'POST', token, form });
      setAviso('Documento guardado en el storage y referenciado en la base.');
      await cargar();
    } catch (error) { onError(error.message); }
  }
  async function compartir() {
    try {
      const data = await api(`/api/contratos/${contratoId}/enlace`, { method: 'POST', token, body: {} });
      setEnlace(data.url);
      setAviso('Enlace temporal creado por 7 días.');
    } catch (error) { onError(error.message); }
  }
  if (!contrato) return <p>Cargando contrato…</p>;
  return (
    <section>
      <button type="button" className="secundario" onClick={volver}>Volver</button>
      <h1>{contrato.codigo} · {contrato.titulo}</h1>
      <p>Cliente: {contrato.cliente}</p>
      <p>Estado: <strong className={`estado ${contrato.estado}`}>{contrato.estado}</strong></p>
      <p>{String(contrato.fecha_inicio).slice(0, 10)} → {String(contrato.fecha_termino).slice(0, 10)}</p>
      <h2>Documentos</h2>
      <ul className="lista">
        {contrato.documentos.map((d) => (
          <li key={d.id}>
            <span>{d.nombre}</span>
            <a href={`/api/documentos/${d.id}/descarga`} onClick={(e) => {
              e.preventDefault();
              fetch(`/api/documentos/${d.id}/descarga`, { headers: { Authorization: `Bearer ${token}` } })
                .then((r) => r.blob())
                .then((b) => {
                  const url = URL.createObjectURL(b);
                  const a = document.createElement('a');
                  a.href = url; a.download = d.nombre; a.click();
                });
            }}>Descargar</a>
          </li>
        ))}
      </ul>
      {esAdmin && (
        <>
          <form className="tarjeta" onSubmit={subir}>
            <label htmlFor="archivo">Adjuntar PDF, DOC, PPT, JPG o PNG</label>
            <input id="archivo" name="archivo" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" />
            <button type="submit">Subir documento</button>
          </form>
          <button type="button" onClick={compartir}>Generar enlace para compartir</button>
          {enlace && <p>Enlace: {enlace}</p>}
        </>
      )}
    </section>
  );
}

function Usuarios({ token, empresaId, esAdmin, onError, setAviso }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ nombre_usuario: '', correo: '', password: '', rol: 'editor' });
  async function cargar() {
    const data = await api(`/api/empresas/${empresaId}/usuarios`, { token });
    setLista(data.data);
  }
  useEffect(() => { cargar().catch((e) => onError(e.message)); }, []);
  async function crear(e) {
    e.preventDefault();
    try {
      await api(`/api/empresas/${empresaId}/usuarios`, { method: 'POST', token, body: form });
      setAviso('Usuario agregado a la empresa.');
      await cargar();
    } catch (error) { onError(error.message); }
  }
  return (
    <section>
      <h1>Usuarios de la empresa</h1>
      <ul className="lista">{lista.map((u) => <li key={u.id}><span>{u.nombre_usuario}</span><span>{u.rol}</span></li>)}</ul>
      {esAdmin ? (
        <form className="tarjeta" onSubmit={crear}>
          <h2>Invitar usuario</h2>
          <label htmlFor="nu">Usuario</label>
          <input id="nu" value={form.nombre_usuario} onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })} required />
          <label htmlFor="nc">Correo</label>
          <input id="nc" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
          <label htmlFor="np">Contraseña inicial</label>
          <input id="np" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <label htmlFor="nr">Rol</label>
          <select id="nr" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            <option value="editor">Editor (solo lectura)</option>
            <option value="administrador">Administrador</option>
          </select>
          <button type="submit">Crear usuario</button>
        </form>
      ) : <p className="ayuda">Su rol es editor: puede ver la lista, no modificarla.</p>}
    </section>
  );
}

function Auditoria({ token, empresaId, onError }) {
  const [lista, setLista] = useState([]);
  useEffect(() => {
    api(`/api/empresas/${empresaId}/auditoria`, { token }).then((d) => setLista(d.data)).catch((e) => onError(e.message));
  }, []);
  return (
    <section>
      <h1>Auditoría</h1>
      <table>
        <thead><tr><th>Cuándo</th><th>Quién</th><th>Acción</th><th>Detalle</th></tr></thead>
        <tbody>
          {lista.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.creado_en).toLocaleString('es-CL')}</td>
              <td>{a.nombre_usuario || '—'}</td>
              <td>{a.accion} {a.entidad}</td>
              <td>{a.detalle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Ayuda() {
  return (
    <section className="tarjeta">
      <h1>Ayuda</h1>
      <p>Primero elija un cliente y después abra sus contratos. El editor solo visualiza: crear, editar o eliminar responde 403 en la API.</p>
      <p>Eliminar un cliente pide confirmación y hace una baja lógica. La acción queda en auditoría.</p>
      <p>Los documentos se guardan en el storage del servidor y la base solo guarda la referencia.</p>
    </section>
  );
}
