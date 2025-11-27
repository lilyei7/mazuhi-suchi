# 🍣 Sushi Restaurant Landing Page

Una landing page moderna y elegante para un restaurante de sushi, construida con las últimas tecnologías web.

## ✨ Características

- **Diseño Moderno**: Interfaz limpia con colores blancos, grises suaves y el color principal #E09E7D
- **Animaciones Fluidas**: Efectos y transiciones suaves usando Framer Motion
- **Completamente Responsive**: Adaptado para dispositivos móviles, tablets y desktop
- **Performance Optimizada**: Construido con Next.js 14 y App Router
- **Componentes Modulares**: Arquitectura escalable con componentes reutilizables

## 🛠️ Tecnologías Utilizadas

- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework de CSS utilitario
- **Framer Motion** - Librería de animaciones para React
- **Responsive Design** - Diseño adaptativo para todos los dispositivos

## 📱 Secciones Principales

1. **Header/Navegación** - Menú moderno con scroll suave y menú móvil
2. **Hero Section** - Sección principal con llamada a la acción
3. **Menú Popular** - Grid de platos destacados con efectos hover
4. **Página de Menú Completa** - Sistema interactivo con 9 categorías
5. **Acerca de Nosotros** - Información sobre la empresa y servicios
6. **Sucursales** - Ubicaciones con información de contacto
7. **Footer** - Enlaces adicionales y información de contacto

### 🍣 **Página de Menú Interactiva**

**Nueva funcionalidad:** Página completa de menú en `/menu` con:
- **9 Categorías:** Entradas, Arroces, Rollos Naturales, Rollos Empanizados, Rollos Especiales, Rollos Horneados, Bebidas, Postres, Extras
- **Navegación móvil optimizada:** Carrusel horizontal deslizable en dispositivos móviles
- **Filtros animados:** Transiciones suaves entre categorías
- **32+ platillos** con información detallada, ingredientes y precios
- **Badges inteligentes:** Indicadores de "Nuevo", "Picante", "Vegetariano"

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm, yarn, pnpm o bun

### Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

### Scripts Disponibles

- \`npm run dev\` - Ejecuta el servidor de desarrollo
- \`npm run build\` - Construye la aplicación para producción
- \`npm run start\` - Ejecuta el servidor de producción
- \`npm run lint\` - Ejecuta ESLint para verificar el código

## 🎨 Personalización

### Colores
Los colores están definidos en \`tailwind.config.js\`:
- **Primary**: #E09E7D (color principal para botones)
- **Grays**: Tonos suaves de gris
- **White**: Fondo principal

### Componentes
Todos los componentes están en \`src/components/\`:
- \`Header.tsx\` - Navegación principal
- \`Hero.tsx\` - Sección hero
- \`PopularDishes.tsx\` - Menú popular
- \`AboutSection.tsx\` - Sección acerca de
- \`Locations.tsx\` - Sucursales
- \`Footer.tsx\` - Pie de página

## 📁 Estructura del Proyecto

\`\`\`
src/
├── app/
│   ├── menu/
│   │   └── page.tsx          # Página de menú completa
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Página principal
├── components/
│   ├── Header.tsx            # Navegación principal con logo
│   ├── Hero.tsx              # Sección hero
│   ├── MenuSection.tsx       # Vista previa del menú
│   ├── MenuPage.tsx          # Página completa del menú
│   ├── About.tsx             # Sección acerca de
│   └── Footer.tsx            # Pie de página
├── data/
│   └── menuData.ts           # Datos del menú completo
└── public/
    └── images/
        └── logo.svg          # Logo del restaurante
\`\`\`

## 🌟 Características Técnicas

- **SSG (Static Site Generation)** - Páginas pre-renderizadas para mejor performance
- **SEO Optimizado** - Meta tags y estructura semántica
- **Accesibilidad** - Cumple con estándares de accesibilidad web
- **Animaciones Performantes** - Optimizadas para 60fps
- **Diseño Mobile-First** - Desarrollado pensando primero en dispositivos móviles

## 🚀 Deploy

Este proyecto está listo para ser desplegado en:
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

### Deploy en Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Contacto

Para más información sobre este proyecto, puedes contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ usando Next.js y Tailwind CSS**