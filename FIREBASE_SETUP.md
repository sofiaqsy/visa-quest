# 🔥 Firebase Setup para VisaQuest

Guía completa para configurar Firebase en tu proyecto VisaQuest.

## 📋 Prerequisitos

- Cuenta de Google
- Proyecto VisaQuest corriendo localmente
- Node.js y npm instalados

## 🚀 Configuración paso a paso

### 1. Crear proyecto Firebase

1. **Ve a [Firebase Console](https://console.firebase.google.com/)**
2. **Clic en "Agregar proyecto"**
3. **Nombre del proyecto:** `visa-quest-app`
4. **Habilita Google Analytics** (recomendado)
5. **Crear proyecto**

### 2. Configurar aplicación web

1. **En el dashboard, clic en el ícono web** `</>`
2. **Nickname de la app:** `VisaQuest PWA`
3. **✅ Marcar "Configurar Firebase Hosting"**
4. **Registrar app**

### 3. Configurar servicios necesarios

#### **Firestore Database:**
1. **Ir a "Firestore Database"**
2. **Crear base de datos**
3. **Modo:** Empezar en modo de prueba (cambiaremos las reglas después)
4. **Ubicación:** us-central1 (o la más cercana)

#### **Authentication:**
1. **Ir a "Authentication"**
2. **Comenzar**
3. **Pestaña "Sign-in method"**
4. **Habilitar "Anónimo"** ✅

#### **Cloud Messaging (Push Notifications):**
1. **Ir a "Cloud Messaging"**
2. **Generar certificados web push**
3. **Copiar el "Vapid Key"**

### 4. Configurar credenciales

1. **En "Configuración del proyecto" → "General"**
2. **Scroll hasta "Tus apps"**
3. **Copiar la configuración** que se ve así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "visa-quest-app.firebaseapp.com",
  projectId: "visa-quest-app",
  storageBucket: "visa-quest-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-XXXXXXXXXX"
};
```

### 5. Actualizar configuración en el código

**Edita `src/firebase/config.js`:**

```javascript
// Reemplaza estas líneas con tus credenciales reales:
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-XXXXXXXXXX"
};

// Y agrega tu VAPID key:
vapidKey: 'TU_VAPID_KEY_AQUI'
```

### 6. Configurar reglas de seguridad

**Ve a Firestore → Reglas y pega esto:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Mood data - users can only access their own
    match /moods/{moodId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Completed tasks - users can only access their own
    match /completedTasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User progress - users can only access their own
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Success stories - read public, write own
    match /successStories/{storyId} {
      allow read: if resource.data.approved == true;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Community posts - read public, write own
    match /communityPosts/{postId} {
      allow read: if true;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User actions for analytics
    match /userActions/{actionId} {
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Instalar dependencias

```bash
npm install firebase
```

### 8. Probar la conexión

**Ejecuta tu app:**
```bash
npm start
```

**Verifica en la consola del navegador:**
- ✅ "VisaQuest: Anonymous sign in successful"
- ✅ "VisaQuest: User signed in: [user-id]"

## 🔧 Estructura de datos en Firestore

### **Colecciones que se crearán automáticamente:**

```
firestore/
├── users/
│   └── {userId}/
│       ├── name: string
│       ├── targetCountry: string
│       ├── startDate: timestamp
│       └── createdAt: timestamp
│
├── moods/
│   └── {moodId}/
│       ├── userId: string
│       ├── mood: string
│       ├── message: string
│       ├── date: string
│       └── timestamp: timestamp
│
├── completedTasks/
│   └── {taskId}/
│       ├── userId: string
│       ├── taskId: string
│       ├── week: number
│       ├── day: number
│       ├── points: number
│       └── completedAt: timestamp
│
├── userProgress/
│   └── {userId}/
│       ├── totalTasks: number
│       ├── completedTasks: number
│       ├── currentWeek: number
│       ├── totalPoints: number
│       └── updatedAt: timestamp
│
├── successStories/
│   └── {storyId}/
│       ├── userId: string
│       ├── title: string
│       ├── content: string
│       ├── country: string
│       ├── approved: boolean
│       └── createdAt: timestamp
│
├── communityPosts/
│   └── {postId}/
│       ├── userId: string
│       ├── content: string
│       ├── likes: number
│       ├── replies: number
│       └── createdAt: timestamp
│
└── userActions/
    └── {actionId}/
        ├── userId: string
        ├── action: string
        ├── data: object
        └── timestamp: timestamp
```

## 🔒 Seguridad y mejores prácticas

### **Autenticación anónima:**
- Los usuarios se registran automáticamente sin email/password
- Cada dispositivo tiene un ID único
- Los datos están protegidos por reglas de Firestore

### **Datos offline:**
- Firebase almacena automáticamente en cache local
- Los cambios se sincronizan cuando hay conexión
- Tu PWA funciona perfectamente offline

### **Escalabilidad:**
- Firebase maneja automáticamente el escalado
- Plan gratuito incluye:
  - 50,000 lecturas/día
  - 20,000 escrituras/día
  - 1GB almacenamiento

## 🚀 Deployment con Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar hosting
firebase init hosting

# Build y deploy
npm run build
firebase deploy
```

## 📊 Analytics y monitoreo

**Firebase Analytics automaticamente trackea:**
- Usuarios activos
- Retención de usuarios
- Eventos personalizados (mood, tasks, etc.)
- Performance de la app

**Accede a los datos en:**
Firebase Console → Analytics

## ❗ Problemas comunes

### **Error de permisos:**
- Verifica que las reglas de Firestore estén configuradas
- Asegúrate de que la autenticación anónima esté habilitada

### **App no se conecta:**
- Verifica que las credenciales en `config.js` sean correctas
- Revisa la consola del navegador para errores

### **Datos no se guardan:**
- Verifica que el usuario esté autenticado
- Revisa las reglas de Firestore
- Chequea la consola para errores de permisos

## 🎯 Siguientes pasos

Una vez configurado Firebase:

1. ✅ **Probar el onboarding** - nombres y moods se guardan en Firestore
2. ✅ **Verificar sync offline** - datos se sincronizan al volver online
3. ✅ **Testing en múltiples dispositivos** - cada uno tiene su propio usuario
4. ✅ **Analytics dashboard** - ver el comportamiento de usuarios

¡Con esto tendrás VisaQuest funcionando con una base de datos real en la nube! 🔥