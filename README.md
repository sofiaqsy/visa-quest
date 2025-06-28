# 🇨🇦 VisaQuest PWA

Tu guía gamificada para obtener visas de manera fácil y motivacional. Convierte el proceso de visa en una aventura paso a paso.

> **🆕 Nueva funcionalidad:** ¡Ahora es una PWA (Progressive Web App) instalable!

## 📱 Características PWA

### ✨ **Instalación Nativa**
- 📱 **Se instala como app nativa** - Desde cualquier navegador móvil
- 🏠 **Ícono en pantalla principal** - Acceso directo desde home screen
- 🔄 **Actualizaciones automáticas** - Siempre la última versión

### 🔄 **Funcionalidad Offline**
- 📊 **Funciona sin internet** - Revisa tu progreso offline
- 💾 **Datos guardados localmente** - Tu información siempre disponible
- 🔄 **Sincronización automática** - Cuando vuelva la conexión

### 📸 **Funciones Nativas**
- 📸 **Acceso a cámara** - Para escanear documentos
- 🔔 **Notificaciones push** - Recordatorios de tareas importantes
- 🔗 **Compartir contenido** - Comparte tu progreso fácilmente

## 🚀 Instalación en Móvil

### **iPhone/iPad (Safari):**
1. Abre la app en Safari
2. Toca el botón "Compartir" (📤)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma la instalación

### **Android (Chrome):**
1. Abre la app en Chrome
2. Toca el menú (⋮) o verás un prompt automático
3. Selecciona "Instalar app" o "Añadir a pantalla de inicio"
4. Confirma la instalación

### **Desktop (Chrome/Edge):**
1. Abre la app en el navegador
2. Busca el ícono de instalación (⊕) en la barra de direcciones
3. Haz clic en "Instalar VisaQuest"
4. La app se abrirá en ventana independiente

## 🛠️ Desarrollo Local

### Prerequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación
```bash
# 1. Clona el repositorio
git clone https://github.com/sofiaqsy/visa-quest.git
cd visa-quest

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm start
```

### 🔧 **Configuración PWA**
El proyecto ya incluye toda la configuración PWA:
- ✅ `manifest.json` - Configuración de la app
- ✅ `sw.js` - Service Worker para offline
- ✅ Meta tags PWA en `index.html`
- ✅ Hooks y componentes PWA en React

### 📱 **Testing PWA Localmente**
```bash
# 1. Build de producción
npm run build

# 2. Sirve la build localmente
npx serve -s build

# 3. Abre en móvil usando tu IP local
# Ejemplo: http://192.168.1.100:3000
```

## 🎯 Roadmap PWA

### ✅ **Completado (v1.0)**
- [x] Instalación como app nativa
- [x] Funcionalidad offline básica
- [x] Service Worker configurado
- [x] Manifest completo con iconos
- [x] Meta tags para todas las plataformas

### 🔄 **En Desarrollo (v1.1)**
- [ ] Push notifications programadas
- [ ] Background sync para datos
- [ ] Acceso a cámara para documentos
- [ ] Shortcuts de app para tareas rápidas

### 🚀 **Futuro (v2.0)**
- [ ] Web Share API para compartir progreso
- [ ] Badge API para mostrar tareas pendientes
- [ ] Contact Picker para referencias
- [ ] File System Access para importar documentos

## 📱 **Ventajas de PWA vs App Nativa**

| Característica | PWA VisaQuest | App Nativa |
|----------------|---------------|------------|
| **Instalación** | ✅ Directa desde navegador | ❌ App Store required |
| **Tamaño** | ✅ ~2MB | ❌ 50-100MB+ |
| **Actualizaciones** | ✅ Automáticas | ❌ Manual del usuario |
| **Offline** | ✅ Funciona offline | ✅ Funciona offline |
| **Notificaciones** | ✅ Push notifications | ✅ Push notifications |
| **Cámara** | ✅ API de cámara | ✅ Acceso nativo |
| **Performance** | ✅ Muy buena | ✅ Excelente |
| **Costo desarrollo** | ✅ Una codebase | ❌ iOS + Android |

## 🔍 **Debugging PWA**

### **Chrome DevTools:**
1. F12 → Application tab
2. Service Workers → Check registration
3. Manifest → Verify configuration
4. Storage → Check offline data

### **Lighthouse PWA Audit:**
```bash
# Instala Lighthouse
npm install -g lighthouse

# Audit PWA
lighthouse http://localhost:3000 --preset=pwa
```

## 🎮 **Funcionalidades Gamificadas**

### **Sistema de Notificaciones PWA:**
- 🔔 **Recordatorios diarios** - "¡Tienes 2 tareas pendientes!"
- 🏆 **Logros desbloqueados** - "¡Completaste la Semana 1!"
- ⚡ **Urgencias** - "Solo quedan 3 días para tu cita"

### **Shortcuts de App:**
- 📊 **Mi Progreso** - Acceso directo al dashboard
- ✅ **Tareas de Hoy** - Lista de pendientes
- 👥 **Comunidad** - Chat y soporte

## 🔒 **Privacidad y Seguridad**

- 🔐 **Datos locales** - Todo se guarda en tu dispositivo
- 🚫 **Sin tracking** - No recopilamos datos personales
- 🔒 **HTTPS obligatorio** - Conexión segura siempre
- 💾 **Storage encriptado** - Información protegida

## 📞 **Soporte**

¿Problemas con la instalación PWA?
- 📧 Email: support@visa-quest.app
- 💬 GitHub Issues: [Crear issue](https://github.com/sofiaqsy/visa-quest/issues)
- 📱 Comunidad: Canal #pwa-support

---

⭐ **¡Dale una estrella si te gusta el proyecto!**  
📱 **¡Instala la app y cuéntanos tu experiencia!**