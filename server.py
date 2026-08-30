#!/usr/bin/env python3
"""
Market Shopping - Servidor local para guardar datos en JSON.

Uso:
    python server.py [puerto]

Sirve la app y expone endpoints para guardar compras y mercados
en archivos JSON del disco. Recomendable ejecutarlo en la carpeta
de la app.

Endpoints:
    GET  /                 -> index.html (y demas archivos)
    GET  /api/compras      -> devuelve las compras guardadas
    GET  /api/mercados     -> devuelve los mercados personalizados
    POST /api/compras      -> guarda las compras (body: {"compras": [...]})
    POST /api/mercados     -> guarda los mercados (body: {"mercados": [...]})
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

COMPRAS_FILE = os.path.join(BASE_DIR, "compras.json")
MERCADOS_FILE = os.path.join(BASE_DIR, "mercados.json")
MERCADOS_PERS_FILE = os.path.join(BASE_DIR, "mercados-personalizados.json")

# Tipos de archivo soportados para servir
MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
}


def leer_json(ruta, vacio):
    """Lee un archivo JSON, devolviendo 'vacio' si no existe o es invalido."""
    if not os.path.exists(ruta):
        return vacio
    try:
        with open(ruta, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return vacio


def escribir_json(ruta, data):
    """Escribe los datos en un archivo JSON de forma atomica."""
    tmp = ruta + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, ruta)


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length == 0:
            return None
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None

    def _servir_archivo(self, ruta):
        # Evitar salir del directorio base
        ruta = os.path.normpath(ruta)
        if ruta.startswith(".."):
            self.send_error(403)
            return

        if ruta == "" or ruta.endswith("/"):
            ruta = os.path.join(ruta, "index.html")

        archivo = os.path.join(BASE_DIR, ruta)
        if not os.path.isfile(archivo):
            self.send_error(404)
            return

        ext = os.path.splitext(archivo)[1].lower()
        mime = MIME_TYPES.get(ext, "application/octet-stream")

        try:
            with open(archivo, "rb") as f:
                contenido = f.read()
        except OSError:
            self.send_error(404)
            return

        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(contenido)))
        self.end_headers()
        self.wfile.write(contenido)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/compras":
            compras = leer_json(COMPRAS_FILE, [])
            self._send_json(compras)
            return
        elif path == "/api/mercados":
            mercados = leer_json(MERCADOS_PERS_FILE, [])
            self._send_json(mercados)
            return

        # Servir archivos estaticos
        ruta = path.lstrip("/")
        self._servir_archivo(ruta)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/compras":
            data = self._read_body()
            if data is None or not isinstance(data, dict):
                self._send_json({"ok": False, "error": "Cuerpo JSON invalido"}, 400)
                return
            compras = data.get("compras", [])
            escribir_json(COMPRAS_FILE, compras)
            self._send_json({"ok": True, "guardadas": len(compras)})

        elif path == "/api/mercados":
            data = self._read_body()
            if data is None or not isinstance(data, dict):
                self._send_json({"ok": False, "error": "Cuerpo JSON invalido"}, 400)
                return
            mercados = data.get("mercados", [])
            escribir_json(MERCADOS_PERS_FILE, mercados)
            self._send_json({"ok": True, "guardados": len(mercados)})

        else:
            self._send_json({"ok": False, "error": "Endpoint no encontrado"}, 404)

    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" % (
            self.address_string(),
            self.log_date_time_string(),
            format % args,
        ))


def main():
    puerto = 8000
    if len(sys.argv) > 1:
        try:
            puerto = int(sys.argv[1])
        except ValueError:
            print("Puerto invalido. Usando 8000.")

    print("=" * 50)
    print(" Market Shopping - Servidor Local")
    print("=" * 50)
    print(" Servidor:  http://localhost:%d" % puerto)
    print("")
    print(" Endpoints de guardado:")
    print("  POST /api/compras  -> escribe compras.json")
    print("  POST /api/mercados -> escribe mercados.json")
    print("")
    print(" Presiona Ctrl+C para detener.")
    print("=" * 50)

    try:
        servidor = ThreadingHTTPServer(("0.0.0.0", puerto), Handler)
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    except OSError as e:
        print("\nError al iniciar el servidor: %s" % e)
        sys.exit(1)


if __name__ == "__main__":
    main()
