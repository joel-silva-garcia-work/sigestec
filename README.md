# SIGEDOC - Sistema de Gestión Documental

## Descripción

SIGEDOC es un sistema de gestión documental desarrollado con NestJS que incluye funcionalidades de autenticación, gestión de usuarios, roles, permisos y sincronización con Active Directory.

## Características Principales

### 🔐 Autenticación y Autorización
- Sistema de autenticación JWT
- Gestión de roles y permisos
- Integración con Active Directory (LDAP)
- Rol Super Admin con sincronización automática

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de roles
- Sincronización automática con LDAP
- Fallback a usuarios fake si LDAP no está disponible

### 🔄 Sincronización LDAP
- Conexión automática a Active Directory
- Sincronización de usuarios
- Mapeo de atributos AD a usuarios locales
- Manejo robusto de errores

### 🛡️ Sistema de Permisos
- Gestión granular de permisos
- Rol Super Admin con acceso completo
- Sincronización automática de nuevos permisos
- Estadísticas de sincronización

## Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd sigedoc

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
npm run migration:run-dev

# Crear rol Super Admin inicial
npm run create:super-admin

# Iniciar en desarrollo
npm run start:dev
```

## Configuración

### Variables de Entorno

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=sigedoc

# LDAP/Active Directory
LDAP_URL=ldap://your-domain-controller:636
LDAP_BIND_DN=cn=admin,dc=example,dc=com
LDAP_BIND_PASSWORD=admin_password
LDAP_BASE_DN=dc=example,dc=com
LDAP_USERS_OU=ou=users,dc=example,dc=com
LDAP_DOMAIN=example.com
LDAP_TLS_ENABLED=true

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
```

## Uso

### Autenticación

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password"}'
```

### Gestión de Usuarios

```bash
# Obtener todos los usuarios
curl -X GET http://localhost:3000/user/all

# Crear usuario
curl -X POST http://localhost:3000/user/add \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "email": "user@example.com"}'
```

### Sincronización LDAP

```bash
# Sincronizar usuarios desde LDAP
curl -X POST http://localhost:3000/ldap/sync-users

# Obtener estadísticas de sincronización
curl -X GET http://localhost:3000/ldap/sync-stats
```

### Super Admin

```bash
# Sincronizar rol Super Admin
curl -X POST http://localhost:3000/super-admin/sync

# Obtener estadísticas del Super Admin
curl -X GET http://localhost:3000/super-admin/stats
```

## Estructura del Proyecto

```
src/
├── common/           # Utilidades comunes
├── security/         # Autenticación y autorización
│   ├── auth/         # Autenticación JWT
│   ├── user/         # Gestión de usuarios
│   ├── rol/          # Gestión de roles
│   ├── permission/   # Gestión de permisos
│   └── rol_permiso/  # Relación roles-permisos
├── ldap-service/     # Servicio LDAP
├── nomenclator/      # Nomencladores
├── reunion/          # Gestión de reuniones
└── reporte/          # Reportes
```

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo
npm run start:debug        # Iniciar con debug

# Base de datos
npm run migration:generate # Generar migración
npm run migration:run-dev  # Ejecutar migraciones
npm run migration:revert-dev # Revertir migración

# Super Admin
npm run create:super-admin # Crear Super Admin inicial

# Generación de recursos
npm run generate:resource  # Generar nuevo recurso
npm run generate:schema    # Generar esquema PostgreSQL
```

## Documentación Adicional

- [Documentación LDAP](src/ldap-service/README.md)
- [Documentación Super Admin](docs/SUPER_ADMIN_SYNC.md)

## API Documentation

Una vez iniciada la aplicación, la documentación de la API estará disponible en:
- Swagger UI: http://localhost:3000/api
- OpenAPI JSON: http://localhost:3000/api-json

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 