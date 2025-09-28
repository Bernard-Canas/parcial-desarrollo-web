# ⚡ Kanas Pokedex — Primer Parcial
# Curso: Desarrollo Web
# Nombre: Bernardo Canas    
# Carné: 202401637

Este proyecto es una Pokedex moderna y dinámica que consume la [PokeAPI](https://pokeapi.co/) utilizando `fetch` para mostrar información detallada sobre los Pokémon de la primera generación. La interfaz de usuario está diseñada con un estilo limpio y se organiza mediante la metodología **BEM** (Block, Element, Modifier).

---

## 🛠️ Estructura del Proyecto y Tecnologías Solictads en el parcial

El proyecto se compone de archivos esenciales de desarrollo web:

* **`index.html`**: Estructura principal de la aplicación.
* **`style.css`**: Hoja de estilos principal, siguiendo la metodología BEM.
* **`app.js`**: Lógica principal de la aplicación, manejo de eventos y consumo de API.

**Tecnologías Clave:**

| Tecnología | Propósito |
| :--- | :--- |
| **HTML5** | Estructura semántica de la interfaz. |
| **CSS3 (BEM)** | Estilos modernos, responsivos y modulares. |
| **JavaScript (ES6+)** | Lógica, manejo de DOM y `fetch` asíncrono. |
| **PokeAPI** | Fuente de datos para Pokémon, Tipos y Naturaleza. |
| **Font Awesome** | Iconografía para Tipos y la interfaz general. |

---

## Criterios de Evaluación y Cumplimiento
El proyecto está diseñado para cumplir con los siguientes requisitos de implementación:

### Parte I – Estructura HTML y CSS BEM

| Requisito | Cumplimiento | Descripción |
| :--- | :--- | :--- |
| **Maquetación Correcta** | Implementado | La estructura del `index.html` es semántica (`<header>`, `<aside>`, `<main>`, `<section>`) y permite un *layout* moderno y responsivo. |
| **Uso Coherente de BEM** | Implementado | Todos los selectores en `style.css` siguen la nomenclatura **BEM** (`.block`, `.block__element`, `.block--modifier`), asegurando un CSS modular y fácil de mantener. |

### Parte II – Consumo de la API

| Requisito | Cumplimiento | Descripción |
| :--- | :--- | :--- |
| **Llamadas a la PokeAPI (`fetch`)** | Implementado | Se utiliza `fetch` para todas las operaciones de datos: carga inicial, búsqueda, carga de detalles, lista de tipos y lista de naturalezas. |
| **Manejo Asíncrono** | Implementado | Todas las llamadas usan funciones `async/await` dentro de bloques `try...catch` para manejar la asincronía y los posibles errores de la red/API de forma segura. |

### Parte III – Renderizado Dinámico

| Requisito | Cumplimiento | Descripción |
| :--- | :--- | :--- |
| **Mostrar Lista Principal** | Implementado | Las secciones **Inicio** y **Todos** cargan y renderizan una lista de Pokémon (tarjetas populares y elementos compactos). |
| **Mostrar Detalle** | mplementado | La función de **Búsqueda** y el clic en cualquier tarjeta activa el panel **`detailCenter`**, mostrando la imagen, estadísticas clave, tipos y otra metadata del Pokémon. |
| **Secciones Adicionales** | Implementado | Las secciones **Tipos** (botones interactivos) y **Naturaleza** (cards informativas) también consumen la API y renderizan contenido dinámicamente. |

### Parte IV – Favoritos y Persistencia (10 pts)

| Requisito | Cumplimiento | Descripción |
| :--- | :--- | :--- |
| **Gestión de Favoritos** | Implementado | Los botones de estrella en las tarjetas permiten agregar o remover Pokémon de una colección. |
| **Persistencia (`localStorage`)** | Implementado | El estado de los favoritos se guarda en **`localStorage`** al modificar la lista y se recupera al cargar la aplicación, manteniendo los favoritos entre sesiones. |

---

## 🚀 Funcionalidades Principales

1.  **Navegación por Secciones**: Menú lateral para navegar entre Inicio, Favoritos, Todos, Tipos, Naturaleza y Acerca.
2.  **Búsqueda Rápida**: El buscador permite encontrar Pokémon por nombre o ID, mostrando instantáneamente la ficha de detalle.
3.  **Filtrado por Tipos**: La sección "Tipos" genera botones interactivos que al ser clicados filtran y muestran la lista de Pokémon de ese tipo específico.
4.  **Botones de Favoritos**: Permite marcar y desmarcar Pokémon, persistiendo la selección gracias a `localStorage`.
5.  **Animaciones y UX**: Se utilizan transiciones y animaciones sutiles (ej. `hover` en botones de tipo y barras de popularidad) para una mejor experiencia de usuario.

---

## 📋 Cómo Ejecutar el Proyecto

1.  Clona el repositorio o descarga los archivos.
2.  Asegúrate de que los archivos `index.html`, `style.css` y `app.js` estén en sus carpetas correspondientes.
3.  Abre el archivo **`index.html`** directamente en tu navegador web.