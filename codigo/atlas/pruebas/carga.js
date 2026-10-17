import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 200,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300']
  }
};

export function setup() {
  const res = http.post(
    'http://host.docker.internal:3010/api/auth/login',
    JSON.stringify({ nombre_usuario: 'jperez', password: 'Clave#Segura2026' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: res.json('token') };
}

export default function (data) {
  const res = http.get('http://host.docker.internal:3010/api/empresas/1/clients?nombre=Andina', {
    headers: { Authorization: `Bearer ${data.token}` }
  });
  check(res, { 'listado 200': (r) => r.status === 200 });
}
