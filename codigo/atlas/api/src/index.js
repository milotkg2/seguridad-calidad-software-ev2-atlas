const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { Pool } = require('pg');
const swaggerUi = require('swagger-ui-express');

const PORT = Number(process.env.PORT || 3000);
const STORAGE = process.env.STORAGE_DIR || '/data/docs';
const JWT_SECRET = process.env.JWT_SECRET || 'atlas-qa-jwt-solo-local-2026';
const DATA_KEY = Buffer.from(
  process.env.DATA_KEY || 'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00',
  'hex'
);

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'atlas',
  user: process.env.PGUSER || 'atlas',
  password: process.env.PGPASSWORD || 'atlas_qa_2026'
});

const fallosLogin = new Map();
const EXT_OK = new Set(['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png']);

function texto(valor, max) {
  if (valor == null) return '';
  return String(valor).trim().slice(0, max);
}

function correoValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function passwordValida(valor) {
  return (
    typeof valor === 'string' &&
    valor.length >= 12 &&
    /[A-Z]/.test(valor) &&
    /[a-z]/.test(valor) &&
    /\d/.test(valor) &&
    /[^A-Za-z0-9]/.test(valor)
  );
}

function cifrar(plano) {
  if (!plano) return null;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', DATA_KEY, iv);
  const enc = Buffer.concat([c.update(String(plano), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
}

function descifrar(paquete) {
  if (!paquete) return '';
  const buf = Buffer.from(paquete, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const d = crypto.createDecipheriv('aes-256-gcm', DATA_KEY, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
}

function estadoContrato(inicio, termino) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(termino);
  if (hoy > fin) return 'expirado';
  const dias = (fin - hoy) / 86400000;
  if (dias <= 30) return 'vence';
  return 'activo';
}

async function auditar(empresaId, usuarioId, accion, entidad, entidadId, detalle) {
  await pool.query(
    `INSERT INTO auditoria (empresa_id, usuario_id, accion, entidad, entidad_id, detalle)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [empresaId, usuarioId, accion, entidad, entidadId == null ? null : String(entidadId), detalle || null]
  );
}

async function membresiaDe(usuarioId) {
  const { rows } = await pool.query(
    `SELECT eu.empresa_id, eu.rol, e.nombre
     FROM empresa_usuarios eu
     JOIN empresas e ON e.id = eu.empresa_id
     WHERE eu.usuario_id = $1
     ORDER BY eu.empresa_id`,
    [usuarioId]
  );
  return rows;
}

function firmarAcceso(usuario, membresia) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      sub: usuario.id,
      usuario: usuario.nombre_usuario,
      empresaId: membresia ? membresia.empresa_id : null,
      rol: membresia ? membresia.rol : null,
      jti,
      typ: 'access'
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  return token;
}

async function crearRefresh(usuarioId) {
  const id = crypto.randomUUID();
  const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query('INSERT INTO refresh_tokens (id, usuario_id, expira) VALUES ($1, $2, $3)', [
    id,
    usuarioId,
    expira
  ]);
  return id;
}

async function usuarioPublico(usuario) {
  const empresas = await membresiaDe(usuario.id);
  const principal = empresas[0] || null;
  return {
    id: usuario.id,
    nombre_usuario: usuario.nombre_usuario,
    correo: usuario.correo,
    rol: principal ? principal.rol : null,
    empresaId: principal ? principal.empresa_id : null,
    empresas
  };
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Debe iniciar sesión.' });
  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err || payload.typ !== 'access') return res.status(401).json({ error: 'La sesión no es válida o expiró.' });
    const revocado = await pool.query('SELECT 1 FROM tokens_revocados WHERE jti = $1', [payload.jti]);
    if (revocado.rowCount) return res.status(401).json({ error: 'La sesión fue cerrada.' });
    req.user = payload;
    next();
  });
}

async function exigirEmpresa(req, res, next) {
  const empresaId = Number(req.params.id);
  if (!empresaId) return res.status(400).json({ error: 'Empresa no indicada.' });
  const { rows } = await pool.query(
    'SELECT rol FROM empresa_usuarios WHERE empresa_id = $1 AND usuario_id = $2',
    [empresaId, req.user.sub]
  );
  if (!rows[0]) return res.status(403).json({ error: 'No pertenece a esta empresa.' });
  req.membership = { empresaId, rol: rows[0].rol };
  next();
}

function exigirEscritura(req, res, next) {
  if (req.membership.rol !== 'administrador') {
    return res.status(403).json({ error: 'El rol editor solo puede visualizar datos.' });
  }
  next();
}

function clienteVisible(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    direccion: fila.direccion,
    rut: fila.rut,
    contacto: descifrar(fila.contacto_cifrado),
    datosBancarios: descifrar(fila.banco_cifrado),
    eliminado: fila.eliminado
  };
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, STORAGE),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!EXT_OK.has(ext)) return cb(new Error('Formato no permitido. Use PDF, DOC, PPT, JPG o PNG.'));
    cb(null, true);
  }
});

async function sembrar() {
  const ya = await pool.query('SELECT COUNT(*)::int AS n FROM usuarios');
  if (ya.rows[0].n > 0) return;
  const hash = bcrypt.hashSync('Clave#Segura2026', 12);
  const empresa = await pool.query(
    `INSERT INTO empresas (nombre, direccion, telefono, correo)
     VALUES ('CreaLab Spa', 'Av. Apoquindo 3000, Las Condes', '+56 2 2345 6700', 'contacto@crealab.cl')
     RETURNING id`
  );
  const admin = await pool.query(
    `INSERT INTO usuarios (nombre_usuario, correo, password_hash)
     VALUES ('jperez', 'jperez@crealab.cl', $1) RETURNING id`,
    [hash]
  );
  const editor = await pool.query(
    `INSERT INTO usuarios (nombre_usuario, correo, password_hash)
     VALUES ('editor1', 'editor1@crealab.cl', $1) RETURNING id`,
    [hash]
  );
  await pool.query(
    `INSERT INTO empresa_usuarios (empresa_id, usuario_id, rol) VALUES ($1, $2, 'administrador'), ($1, $3, 'editor')`,
    [empresa.rows[0].id, admin.rows[0].id, editor.rows[0].id]
  );
  await pool.query(
    `INSERT INTO clientes (id, empresa_id, nombre, descripcion, direccion, contacto_cifrado, banco_cifrado, rut)
     VALUES (101, $1, 'Distribuidora Andina SpA', 'Cliente pyme de referencia', 'Bandera 120, Santiago', $2, $3, '76.543.210-8')`,
    [empresa.rows[0].id, cifrar('contacto@andina.cl · +56 9 8765 4321'), cifrar('BancoEstado · 123456789 · cuenta vista')]
  );
  await pool.query(`SELECT setval('clientes_id_seq', GREATEST((SELECT MAX(id) FROM clientes), 1))`);
  await pool.query(
    `INSERT INTO contratos (cliente_id, codigo, titulo, descripcion, fecha_inicio, fecha_termino)
     VALUES (101, 'CT-0012', 'Mantención anual de sistemas', 'Contrato de referencia del caso de prueba', '2026-01-01', '2026-12-31')`
  );
}

async function esperarDb() {
  for (let i = 0; i < 30; i += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      console.log(`Esperando PostgreSQL (${i + 1}/30)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('PostgreSQL no respondió');
}

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (!req.path.startsWith('/api/docs')) {
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  }
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - inicio}ms`);
  });
  next();
});

app.get('/api/salud', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ servicio: 'atlas', estado: 'ok' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(require('./openapi.json')));

app.post('/api/auth/register', async (req, res) => {
  const nombre = texto(req.body.nombre_usuario, 40);
  const correo = texto(req.body.correo, 120).toLowerCase();
  const password = req.body.password || '';
  if (!nombre || !correoValido(correo)) return res.status(400).json({ error: 'Indique usuario y un correo válido.' });
  if (!passwordValida(password)) {
    return res.status(400).json({
      error: 'La contraseña debe tener al menos 12 caracteres, con mayúscula, minúscula, número y símbolo.'
    });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre_usuario, correo, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre_usuario, correo`,
      [nombre, correo, bcrypt.hashSync(password, 12)]
    );
    const token = firmarAcceso(rows[0], null);
    const refreshToken = await crearRefresh(rows[0].id);
    res.status(201).json({ token, refreshToken, usuario: await usuarioPublico(rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese usuario o correo ya está registrado.' });
    throw error;
  }
});

app.post('/api/auth/login', async (req, res) => {
  const nombre = texto(req.body.nombre_usuario, 40);
  const password = req.body.password || '';
  const clave = nombre.toLowerCase();
  const previo = fallosLogin.get(clave) || { n: 0, hasta: 0 };
  if (previo.n >= 5 && previo.hasta > Date.now()) {
    return res.status(429).json({ error: 'Demasiados intentos. Espere unos minutos e intente de nuevo.' });
  }
  const { rows } = await pool.query(
    'SELECT id, nombre_usuario, correo, password_hash FROM usuarios WHERE nombre_usuario = $1',
    [nombre]
  );
  const usuario = rows[0];
  if (!usuario || !bcrypt.compareSync(password, usuario.password_hash)) {
    fallosLogin.set(clave, { n: previo.n + 1, hasta: Date.now() + 10 * 60 * 1000 });
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  fallosLogin.delete(clave);
  const empresas = await membresiaDe(usuario.id);
  const token = firmarAcceso(usuario, empresas[0] || null);
  const refreshToken = await crearRefresh(usuario.id);
  res.json({ token, refreshToken, usuario: await usuarioPublico(usuario) });
});

app.post('/api/auth/refresh', async (req, res) => {
  const id = texto(req.body.refreshToken, 80);
  const { rows } = await pool.query(
    `SELECT r.usuario_id, u.nombre_usuario, u.correo
     FROM refresh_tokens r JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.id = $1 AND r.revocado = FALSE AND r.expira > now()`,
    [id]
  );
  if (!rows[0]) return res.status(401).json({ error: 'El refresh token no es válido.' });
  await pool.query('UPDATE refresh_tokens SET revocado = TRUE WHERE id = $1', [id]);
  const empresas = await membresiaDe(rows[0].usuario_id);
  const usuario = { id: rows[0].usuario_id, nombre_usuario: rows[0].nombre_usuario, correo: rows[0].correo };
  const token = firmarAcceso(usuario, empresas[0] || null);
  const refreshToken = await crearRefresh(usuario.id);
  res.json({ token, refreshToken, usuario: await usuarioPublico(usuario) });
});

app.post('/api/auth/logout', auth, async (req, res) => {
  const expira = new Date(req.user.exp * 1000);
  await pool.query(
    'INSERT INTO tokens_revocados (jti, expira) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.jti, expira]
  );
  if (req.body.refreshToken) {
    await pool.query('UPDATE refresh_tokens SET revocado = TRUE WHERE id = $1 AND usuario_id = $2', [
      texto(req.body.refreshToken, 80),
      req.user.sub
    ]);
  }
  res.json({ ok: true });
});

app.get('/api/auth/yo', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, nombre_usuario, correo FROM usuarios WHERE id = $1', [req.user.sub]);
  if (!rows[0]) return res.status(401).json({ error: 'Usuario no encontrado.' });
  res.json({ usuario: await usuarioPublico(rows[0]) });
});

app.post('/api/empresas', auth, async (req, res) => {
  const nombre = texto(req.body.nombre, 120);
  const direccion = texto(req.body.direccion, 200);
  const telefono = texto(req.body.telefono, 40);
  const correo = texto(req.body.correo, 120).toLowerCase();
  if (!nombre || !direccion || !telefono || !correoValido(correo)) {
    return res.status(400).json({ error: 'Complete nombre, dirección, teléfono y correo de la empresa.' });
  }
  try {
    const creada = await pool.query(
      `INSERT INTO empresas (nombre, direccion, telefono, correo) VALUES ($1, $2, $3, $4) RETURNING id, nombre`,
      [nombre, direccion, telefono, correo]
    );
    await pool.query(
      `INSERT INTO empresa_usuarios (empresa_id, usuario_id, rol) VALUES ($1, $2, 'administrador')`,
      [creada.rows[0].id, req.user.sub]
    );
    await auditar(creada.rows[0].id, req.user.sub, 'crear', 'empresa', creada.rows[0].id, nombre);
    res.status(201).json(creada.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo de empresa ya está registrado.' });
    throw error;
  }
});

app.get('/api/empresas/:id/clients', auth, exigirEmpresa, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 20));
  const nombre = texto(req.query.nombre, 120);
  const filtro = `%${nombre}%`;
  const total = await pool.query(
    `SELECT COUNT(*)::int AS n FROM clientes
     WHERE empresa_id = $1 AND NOT eliminado AND ($2 = '' OR nombre ILIKE $3)`,
    [req.membership.empresaId, nombre, filtro]
  );
  const { rows } = await pool.query(
    `SELECT * FROM clientes
     WHERE empresa_id = $1 AND NOT eliminado AND ($2 = '' OR nombre ILIKE $3)
     ORDER BY nombre
     LIMIT $4 OFFSET $5`,
    [req.membership.empresaId, nombre, filtro, limite, (page - 1) * limite]
  );
  res.json({ data: rows.map(clienteVisible), total: total.rows[0].n, page, limite });
});

app.post('/api/empresas/:id/clients', auth, exigirEmpresa, exigirEscritura, async (req, res) => {
  const nombre = texto(req.body.nombre || req.body.razonSocial, 160);
  const descripcion = texto(req.body.descripcion, 500);
  const direccion = texto(req.body.direccion, 200);
  const contacto = texto(req.body.contacto, 200);
  const banco = texto(req.body.datosBancarios, 200);
  const rut = texto(req.body.rut, 20);
  if (!nombre) return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
  const { rows } = await pool.query(
    `INSERT INTO clientes (empresa_id, nombre, descripcion, direccion, contacto_cifrado, banco_cifrado, rut)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [req.membership.empresaId, nombre, descripcion, direccion, cifrar(contacto), cifrar(banco), rut || null]
  );
  await auditar(req.membership.empresaId, req.user.sub, 'crear', 'cliente', rows[0].id, nombre);
  res.status(201).json(clienteVisible(rows[0]));
});

app.get('/api/empresas/:id/clients/:clienteId', auth, exigirEmpresa, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM clientes WHERE id = $1 AND empresa_id = $2 AND NOT eliminado',
    [req.params.clienteId, req.membership.empresaId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado.' });
  res.json(clienteVisible(rows[0]));
});

app.put('/api/empresas/:id/clients/:clienteId', auth, exigirEmpresa, exigirEscritura, async (req, res) => {
  const nombre = texto(req.body.nombre || req.body.razonSocial, 160);
  if (!nombre) return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
  const { rows } = await pool.query(
    `UPDATE clientes
     SET nombre = $3, descripcion = $4, direccion = $5, contacto_cifrado = $6, banco_cifrado = $7, rut = $8
     WHERE id = $1 AND empresa_id = $2 AND NOT eliminado
     RETURNING *`,
    [
      req.params.clienteId,
      req.membership.empresaId,
      nombre,
      texto(req.body.descripcion, 500),
      texto(req.body.direccion, 200),
      cifrar(texto(req.body.contacto, 200)),
      cifrar(texto(req.body.datosBancarios, 200)),
      texto(req.body.rut, 20) || null
    ]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado.' });
  await auditar(req.membership.empresaId, req.user.sub, 'editar', 'cliente', rows[0].id, nombre);
  res.json(clienteVisible(rows[0]));
});

app.delete('/api/empresas/:id/clients/:clienteId', auth, exigirEmpresa, exigirEscritura, async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE clientes SET eliminado = TRUE, eliminado_en = now()
     WHERE id = $1 AND empresa_id = $2 AND NOT eliminado
     RETURNING id, nombre`,
    [req.params.clienteId, req.membership.empresaId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado.' });
  await auditar(req.membership.empresaId, req.user.sub, 'eliminar', 'cliente', rows[0].id, `Baja lógica de ${rows[0].nombre}`);
  res.json({ ok: true, eliminacion: 'logica' });
});

app.get('/api/empresas/:id/usuarios', auth, exigirEmpresa, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.nombre_usuario, u.correo, eu.rol
     FROM empresa_usuarios eu JOIN usuarios u ON u.id = eu.usuario_id
     WHERE eu.empresa_id = $1 ORDER BY u.nombre_usuario`,
    [req.membership.empresaId]
  );
  res.json({ data: rows });
});

app.post('/api/empresas/:id/usuarios', auth, exigirEmpresa, exigirEscritura, async (req, res) => {
  const nombre = texto(req.body.nombre_usuario, 40);
  const correo = texto(req.body.correo, 120).toLowerCase();
  const password = req.body.password || '';
  const rol = req.body.rol === 'administrador' ? 'administrador' : 'editor';
  if (!nombre || !correoValido(correo) || !passwordValida(password)) {
    return res.status(400).json({ error: 'Revise usuario, correo y la política de contraseña.' });
  }
  let usuarioId;
  const existente = await pool.query('SELECT id FROM usuarios WHERE nombre_usuario = $1 OR correo = $2', [nombre, correo]);
  if (existente.rows[0]) {
    usuarioId = existente.rows[0].id;
  } else {
    const creado = await pool.query(
      `INSERT INTO usuarios (nombre_usuario, correo, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      [nombre, correo, bcrypt.hashSync(password, 12)]
    );
    usuarioId = creado.rows[0].id;
  }
  try {
    await pool.query(
      `INSERT INTO empresa_usuarios (empresa_id, usuario_id, rol) VALUES ($1, $2, $3)`,
      [req.membership.empresaId, usuarioId, rol]
    );
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese usuario ya pertenece a la empresa.' });
    throw error;
  }
  await auditar(req.membership.empresaId, req.user.sub, 'crear', 'usuario', usuarioId, `${nombre} como ${rol}`);
  res.status(201).json({ id: usuarioId, nombre_usuario: nombre, correo, rol });
});

app.delete('/api/empresas/:id/usuarios/:usuarioId', auth, exigirEmpresa, exigirEscritura, async (req, res) => {
  if (Number(req.params.usuarioId) === req.user.sub) {
    return res.status(400).json({ error: 'No puede quitarse a sí mismo de la empresa.' });
  }
  const { rowCount } = await pool.query(
    'DELETE FROM empresa_usuarios WHERE empresa_id = $1 AND usuario_id = $2',
    [req.membership.empresaId, req.params.usuarioId]
  );
  if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado en la empresa.' });
  await auditar(req.membership.empresaId, req.user.sub, 'eliminar', 'usuario', req.params.usuarioId, 'Se quitó el acceso a la empresa');
  res.json({ ok: true });
});

app.get('/api/clientes/:clienteId/contratos', auth, async (req, res) => {
  const { rows: cliente } = await pool.query(
    `SELECT c.*, eu.rol FROM clientes c
     JOIN empresa_usuarios eu ON eu.empresa_id = c.empresa_id AND eu.usuario_id = $2
     WHERE c.id = $1 AND NOT c.eliminado`,
    [req.params.clienteId, req.user.sub]
  );
  if (!cliente[0]) return res.status(404).json({ error: 'Cliente no encontrado.' });
  const { rows } = await pool.query(
    'SELECT * FROM contratos WHERE cliente_id = $1 ORDER BY codigo',
    [req.params.clienteId]
  );
  res.json({
    data: rows.map((c) => ({
      ...c,
      estado: estadoContrato(c.fecha_inicio, c.fecha_termino)
    }))
  });
});

app.post('/api/contratos', auth, async (req, res) => {
  const clienteId = Number(req.body.clienteId);
  const titulo = texto(req.body.titulo, 160);
  const descripcion = texto(req.body.descripcion, 500);
  const inicio = texto(req.body.fechaInicio, 10);
  const termino = texto(req.body.fechaTermino, 10);
  const codigo = texto(req.body.codigo, 40) || `CT-${Date.now().toString().slice(-6)}`;
  if (!clienteId || !titulo || !inicio || !termino) {
    return res.status(400).json({ error: 'Indique cliente, título, fecha de inicio y fecha de término.' });
  }
  if (termino < inicio) return res.status(400).json({ error: 'La fecha de término no puede ser anterior al inicio.' });
  const { rows: cliente } = await pool.query(
    `SELECT c.empresa_id, eu.rol FROM clientes c
     JOIN empresa_usuarios eu ON eu.empresa_id = c.empresa_id AND eu.usuario_id = $2
     WHERE c.id = $1 AND NOT c.eliminado`,
    [clienteId, req.user.sub]
  );
  if (!cliente[0]) return res.status(404).json({ error: 'Cliente no encontrado.' });
  if (cliente[0].rol !== 'administrador') return res.status(403).json({ error: 'El rol editor solo puede visualizar datos.' });
  const { rows } = await pool.query(
    `INSERT INTO contratos (cliente_id, codigo, titulo, descripcion, fecha_inicio, fecha_termino)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [clienteId, codigo, titulo, descripcion, inicio, termino]
  );
  await auditar(cliente[0].empresa_id, req.user.sub, 'crear', 'contrato', rows[0].id, `${codigo} · ${titulo}`);
  res.status(201).json({ ...rows[0], estado: estadoContrato(rows[0].fecha_inicio, rows[0].fecha_termino) });
});

app.get('/api/contratos/:id', auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ct.*, c.nombre AS cliente, c.empresa_id, eu.rol
     FROM contratos ct
     JOIN clientes c ON c.id = ct.cliente_id
     JOIN empresa_usuarios eu ON eu.empresa_id = c.empresa_id AND eu.usuario_id = $2
     WHERE ct.id = $1 AND NOT c.eliminado`,
    [req.params.id, req.user.sub]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Contrato no encontrado.' });
  const docs = await pool.query(
    'SELECT id, nombre, mime, tamano, creado_en FROM documentos WHERE contrato_id = $1 ORDER BY id',
    [rows[0].id]
  );
  res.json({
    id: rows[0].id,
    codigo: rows[0].codigo,
    titulo: rows[0].titulo,
    descripcion: rows[0].descripcion,
    fecha_inicio: rows[0].fecha_inicio,
    fecha_termino: rows[0].fecha_termino,
    cliente: rows[0].cliente,
    clienteId: rows[0].cliente_id,
    empresaId: rows[0].empresa_id,
    estado: estadoContrato(rows[0].fecha_inicio, rows[0].fecha_termino),
    documentos: docs.rows
  });
});

app.post('/api/contratos/:id/documentos', auth, (req, res, next) => {
  upload.single('archivo')(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message || 'No se pudo recibir el archivo.' });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Adjunte un archivo.' });
  const { rows } = await pool.query(
    `SELECT ct.id, c.empresa_id, eu.rol
     FROM contratos ct
     JOIN clientes c ON c.id = ct.cliente_id
     JOIN empresa_usuarios eu ON eu.empresa_id = c.empresa_id AND eu.usuario_id = $2
     WHERE ct.id = $1`,
    [req.params.id, req.user.sub]
  );
  if (!rows[0]) {
    fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: 'Contrato no encontrado.' });
  }
  if (rows[0].rol !== 'administrador') {
    fs.unlink(req.file.path, () => {});
    return res.status(403).json({ error: 'El rol editor solo puede visualizar datos.' });
  }
  const guardado = await pool.query(
    `INSERT INTO documentos (contrato_id, nombre, mime, tamano, ruta) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, mime, tamano`,
    [rows[0].id, path.basename(req.file.originalname), req.file.mimetype, req.file.size, req.file.filename]
  );
  await auditar(rows[0].empresa_id, req.user.sub, 'subir', 'documento', guardado.rows[0].id, guardado.rows[0].nombre);
  res.status(201).json(guardado.rows[0]);
});

async function puedeVerDocumento(documentoId, usuarioId) {
  const { rows } = await pool.query(
    `SELECT d.*, c.empresa_id FROM documentos d
     JOIN contratos ct ON ct.id = d.contrato_id
     JOIN clientes c ON c.id = ct.cliente_id
     JOIN empresa_usuarios eu ON eu.empresa_id = c.empresa_id AND eu.usuario_id = $2
     WHERE d.id = $1`,
    [documentoId, usuarioId]
  );
  return rows[0] || null;
}

app.get('/api/documentos/:id/descarga', auth, async (req, res) => {
  const doc = await puedeVerDocumento(req.params.id, req.user.sub);
  if (!doc) return res.status(404).json({ error: 'Documento no encontrado.' });
  await auditar(doc.empresa_id, req.user.sub, 'descargar', 'documento', doc.id, doc.nombre);
  res.download(path.join(STORAGE, doc.ruta), doc.nombre);
});

app.post('/api/contratos/:id/enlace', auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT d.id, c.empresa_id, eu.rol
     FROM documentos d
     JOIN contratos ct ON ct.id = d.contrato_id
     JOIN clientes c ON c.id = ct.cliente_id
     JOIN empresa_usuarios eu ON eu.empresa_id = c.empresa_id AND eu.usuario_id = $2
     WHERE ct.id = $1
     ORDER BY d.id DESC LIMIT 1`,
    [req.params.id, req.user.sub]
  );
  if (!rows[0]) return res.status(404).json({ error: 'El contrato no tiene documentos para compartir.' });
  if (rows[0].rol !== 'administrador') return res.status(403).json({ error: 'El rol editor solo puede visualizar datos.' });
  const token = crypto.randomBytes(24).toString('hex');
  const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query('INSERT INTO enlaces (token, documento_id, expira) VALUES ($1, $2, $3)', [token, rows[0].id, expira]);
  await auditar(rows[0].empresa_id, req.user.sub, 'compartir', 'documento', rows[0].id, 'Enlace temporal de 7 días');
  res.status(201).json({ token, expira, url: `/api/compartir/${token}` });
});

app.get('/api/compartir/:token', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT d.nombre, d.ruta, d.mime, e.expira
     FROM enlaces e JOIN documentos d ON d.id = e.documento_id
     WHERE e.token = $1 AND e.expira > now()`,
    [req.params.token]
  );
  if (!rows[0]) return res.status(404).json({ error: 'El enlace no existe o expiró.' });
  res.download(path.join(STORAGE, rows[0].ruta), rows[0].nombre);
});

app.get('/api/empresas/:id/auditoria', auth, exigirEmpresa, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.id, a.accion, a.entidad, a.entidad_id, a.detalle, a.creado_en, u.nombre_usuario
     FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
     WHERE a.empresa_id = $1
     ORDER BY a.id DESC LIMIT 200`,
    [req.membership.empresaId]
  );
  res.json({ data: rows });
});

app.use((error, _req, res, _next) => {
  console.error('Error interno');
  res.status(500).json({ error: 'Ocurrió un problema. Intente nuevamente.' });
});

async function main() {
  fs.mkdirSync(STORAGE, { recursive: true });
  await esperarDb();
  await sembrar();
  app.listen(PORT, () => console.log(`Atlas API en puerto ${PORT}`));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
