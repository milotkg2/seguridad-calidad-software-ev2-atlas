-- Atlas · esquema según ERS EP1 (CreaLab Spa)
-- RB-1 correo principal de empresa único
-- RB-2 acceso solo con fila en empresa_usuarios
-- RB-3 un contrato pertenece a un solo cliente

CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre_usuario TEXT NOT NULL UNIQUE,
  correo TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE empresa_usuarios (
  empresa_id INTEGER NOT NULL REFERENCES empresas(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  rol TEXT NOT NULL CHECK (rol IN ('administrador', 'editor')),
  PRIMARY KEY (empresa_id, usuario_id)
);

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT,
  contacto_cifrado TEXT,
  banco_cifrado TEXT,
  rut TEXT,
  eliminado BOOLEAN NOT NULL DEFAULT FALSE,
  eliminado_en TIMESTAMPTZ
);

CREATE INDEX clientes_empresa_nombre ON clientes (empresa_id, nombre) WHERE NOT eliminado;

CREATE TABLE contratos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  codigo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  UNIQUE (cliente_id, codigo)
);

CREATE TABLE documentos (
  id SERIAL PRIMARY KEY,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id),
  nombre TEXT NOT NULL,
  mime TEXT NOT NULL,
  tamano INTEGER NOT NULL,
  ruta TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE enlaces (
  token TEXT PRIMARY KEY,
  documento_id INTEGER NOT NULL REFERENCES documentos(id),
  expira TIMESTAMPTZ NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  entidad TEXT NOT NULL,
  entidad_id TEXT,
  detalle TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  expira TIMESTAMPTZ NOT NULL,
  revocado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE tokens_revocados (
  jti TEXT PRIMARY KEY,
  expira TIMESTAMPTZ NOT NULL
);
