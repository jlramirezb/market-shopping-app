# Guía para Acceder a Market Shopping desde tu Teléfono

## 🌐 Opción 1: Servidor Local vía WiFi (Recomendado)

### Requisitos:
- Computadora con los archivos de la app
- Teléfono conectado a la misma red WiFi
- Python instalado (o Node.js)

### Pasos:

#### **En tu computadora:**
1. Abre terminal/símbolo del sistema
2. Navega a la carpeta de la app:
   ```bash
   cd market-shopping-web
   ```
3. Inicia servidor local:
   ```bash
   # Con Python (método recomendado)
   python -m http.server 8000
   
   # O con Python 3:
   python3 -m http.server 8000
   
   # O con Node.js:
   npx serve -s . -p 8000
   ```
4. Anota tu dirección IP local:
   - **Windows**: `ipconfig` (busca "IPv4 Address")
   - **Mac/Linux**: `ifconfig` o `ip addr` (busca "inet")

#### **En tu teléfono:**
1. Asegura que estás conectado a la misma WiFi
2. Abre el navegador web
3. Ingresa la dirección: `http://[IP_DE_TU_PC]:8000`
   - Ejemplo: `http://192.168.1.100:8000`
4. ¡Listo! La app funcionará en tu teléfono

#### **Ventajas:**
✅ Acceso inmediato
✅ Los datos se guardan localmente
✅ Sin necesidad de internet externo
✅ Modo offline funcionando

---

## ☁️ Opción 2: GitHub Pages (Gratis y Permanente)

### Pasos:

#### **1. Crear cuenta en GitHub:**
- Ve a [github.com](https://github.com)
- Regístrate gratuitamente

#### **2. Crear nuevo repositorio:**
- Click en "New repository"
- Nombre: `market-shopping-app`
- Público (Public)
- Click "Create repository"

#### **3. Subir archivos:**
- Click "uploading an existing file"
- Arrastra todos los archivos de la carpeta `market-shopping-web`
- Incluye: `index.html`, `styles.css`, `script.js`
- Click "Commit changes"

#### **4. Activar GitHub Pages:**
- En tu repositorio, ve a "Settings"
- Busca "Pages" en el menú izquierdo
- En "Source", selecciona "Deploy from a branch"
- Rama: "main"
- Click "Save"

#### **5. Obtener URL:**
- Espera 2-3 minutos
- GitHub te dará una URL como:
  `https://[tu-usuario].github.io/market-shopping-app/`

#### **En tu teléfono:**
- Abre esa URL en el navegador
- Agrega a pantalla de inicio para acceso rápido

#### **Ventajas:**
✅ Acceso desde cualquier lugar
✅ URL permanente
✅ Gratis para siempre
✅ Funciona en cualquier dispositivo

---

## 📁 Opción 3: Transferencia Directa de Archivos

### Pasos:

#### **Método A: USB**
1. Copia la carpeta `market-shopping-web` a tu teléfono
2. Usa un explorador de archivos (como "Archivos" de Google)
3. Busca `index.html` y ábrelo con el navegador

#### **Método B: WhatsApp/Telegram**
1. Comprime la carpeta en ZIP
2. Envíala a tu propio número
3. Descarga y descomprime en tu teléfono
4. Abre `index.html` con el navegador

#### **Método C: Google Drive/Dropbox**
1. Sube la carpeta a la nube
2. Accede desde tu teléfono
3. Abre `index.html`

#### **Limitaciones:**
⚠️ Algunas funciones pueden no funcionar perfectamente
⚠️ El guardado de datos puede tener restricciones

---

## 🎯 Recomendación Final

### **Para uso diario:** Opción 1 (Servidor Local)
- Más rápido y confiable
- Datos guardados localmente
- Sin dependencias de internet

### **Para compartir o acceso remoto:** Opción 2 (GitHub Pages)
- Acceso desde cualquier lugar
- URL permanente y fácil de compartir
- Configuración única

### **Para prueba rápida:** Opción 3 (Transferencia Directa)
- Sin configuración adicional
- Bueno para demostración

---

## 🔧 Solución de Problemas

### **Si no funciona el servidor local:**
- Verifica firewall en tu computadora
- Confirma misma red WiFi
- Prueba diferentes puertos (8080, 3000)

### **Si los datos no se guardan:**
- Asegura usar el mismo navegador
- Verifica que localStorage esté habilitado
- Limpia caché del navegador

### **Si la app se ve mal:**
- Actualiza el navegador
- Verifica orientación del teléfono
- Prueba en modo horizontal

---

## 📱 Agregar a Pantalla de Inicio (iOS/Android)

### **En Chrome (Android):**
1. Abre la app en el navegador
2. Click en los tres puntos (⋮)
3. "Agregar a pantalla de inicio"
4. Confirma nombre y agrega

### **En Safari (iOS):**
1. Abre la app en Safari
2. Click en el ícono de compartir (📤)
3. "Agregar a pantalla de inicio"
4. Confirma y agrega

¡Listo! Tu app se verá como una aplicación nativa.