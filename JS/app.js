/* app.js - Kanas Pokedex (VERSIÓN FINAL Y FUNCIONAL) */

/* =======================================
   CONFIGURACIÓN Y SELECTORES
   ======================================= */
const API_BASE = 'https://pokeapi.co/api/v2';
const popularIds = [25, 1, 4, 6, 150, 149, 143, 94, 130, 445];
const STORAGE_KEY = 'kanas_pokedex_favs_final_v1';

/* Selectores de UI y Paneles (DEBEN EXISTIR EN EL HTML) */
const overlay = document.getElementById('overlay');
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const menuItems = Array.from(document.querySelectorAll('.menu__item'));
const popularGrid = document.getElementById('popularGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const allList = document.getElementById('allList');
const detailCenter = document.getElementById('detailCenter');
const contentPanels = Array.from(document.querySelectorAll('.panel'));

// Selectores específicos para TIPOS y NATURALEZA
const typesGrid = document.getElementById('typesGrid');
const typeFilterTitle = document.getElementById('typeFilterTitle');
const currentTypeSpan = document.getElementById('currentType');
const typeFilteredList = document.getElementById('typeFilteredList');
const natureList = document.getElementById('natureList');

/* Estado Global */
let favorites = loadFavorites(); 
let currentSection = 'inicio';

/* =======================================
   INICIALIZACIÓN
   ======================================= */
document.addEventListener('DOMContentLoaded', () => {
  attachUIHandlers();
  
  // Cargamos datos de todas las secciones al inicio
  loadPopular();
  loadAllList();
  loadTypesSection();
  loadNatureSection();
  
  // Establecemos 'inicio' como la vista por defecto
  switchPanel('inicio');
});

/* =======================================
   UTILIDADES Y HELPERS
   ======================================= */

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(raw.map(Number).filter(n => !Number.isNaN(n)));
  } catch (e) {
    return new Set();
  }
}
function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
}
function getSpriteUrl(pokemon) {
  if (!pokemon || !pokemon.sprites) return placeholderDataURI();
  const s = pokemon.sprites;
  return s.other?.['official-artwork']?.front_default || s.other?.dream_world?.front_default || s.front_default || placeholderDataURI();
}
function placeholderDataURI() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='#0f1530'/><text x='50%' y='50%' fill='#9fb0df' font-size='18' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Helpers de Fetch API
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function fetchPokemon(nameOrId) {
  const query = String(nameOrId).toLowerCase().trim();
  if (!query) throw new Error('Query cannot be empty');
  
  return fetchJson(`${API_BASE}/pokemon/${encodeURIComponent(query)}`);
}

/* Mapeo de colores y iconos para TIPOS */
function typeColor(typeName) {
  const map = {
    normal: 'A8A77A', fire: 'EE8130', water: '6390F0', electric: 'F7D02C',
    grass: '7AC74C', ice: '96D9D6', fighting: 'C22E28', poison: 'A33EA1',
    ground: 'E2BF65', flying: 'A98FF3', psychic: 'F95587', bug: 'A6B91A',
    rock: 'B6A136', ghost: '735797', dragon: '6F35FC', dark: '705746',
    steel: 'B7B7CE', fairy: 'D685AD'
  };
  return map[typeName] || '777777';
}
const typeIcons = {
    normal: 'fa-user', fire: 'fa-fire', water: 'fa-tint', electric: 'fa-bolt',
    grass: 'fa-leaf', ice: 'fa-snowflake', fighting: 'fa-hand-rock', poison: 'fa-vial',
    ground: 'fa-mountain', flying: 'fa-feather', psychic: 'fa-brain', bug: 'fa-bug',
    rock: 'fa-gem', ghost: 'fa-ghost', dragon: 'fa-dragon', dark: 'fa-moon',
    steel: 'fa-cog', fairy: 'fa-magic'
};

/* =======================================
   MANEJO DE UI (Sidebar, Menú, Paneles)
   ======================================= */

function openSidebar() {
  sidebar?.classList.add('open');
  sidebar?.classList.remove('hidden');
  overlay?.classList.add('visible');
}

function closeSidebar() {
  if (window.innerWidth <= 900) {
    sidebar?.classList.remove('open');
    sidebar?.classList.add('hidden');
    overlay?.classList.remove('visible');
  } else {
    sidebar?.classList.add('hidden');
  }
}

function switchPanel(name) {
  contentPanels.forEach(p => p.classList.remove('panel--active'));
  if (name !== 'detailCenter' && detailCenter) detailCenter.innerHTML = '';
  const panel = document.getElementById(name);
  if (panel) panel.classList.add('panel--active');
}

function attachUIHandlers() {
  // Sidebar toggling (Desktop/Mobile)
  hamburger?.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    } else {
      sidebar.classList.toggle('hidden');
    }
  });
  sidebarClose?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);
  if (window.innerWidth <= 900 && sidebar) {
    sidebar.classList.add('hidden');
  }

  // Tecla ESC para volver del detalle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailCenter?.classList.contains('panel--active')) {
      const activeMenuItem = document.querySelector('.menu__item--active');
      let targetSection = 'inicio'; 
      if (activeMenuItem) {     
        targetSection = activeMenuItem.dataset.section;
      }
      switchPanel(targetSection); 
    }
  });

  // Navegación del menú
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(m => m.classList.remove('menu__item--active'));
      item.classList.add('menu__item--active');
      const section = item.dataset.section;
      currentSection = section;
      switchPanel(section);
      
      if (section === 'favoritos') loadFavoritesSection();
      
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  // Búsqueda (CRÍTICO: Verificamos selectores antes de adjuntar listeners)
  if(searchButton && searchInput) {
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => { 
      if (e.key === 'Enter') handleSearch(); 
    });
  } else {
      console.error("CRÍTICO: searchButton o searchInput no encontrados. La función de búsqueda está deshabilitada.");
  }
}

/* =======================================
   RENDERIZADO DE COMPONENTES
   ======================================= */

// 1. Crea el elemento compacto (TODOS, TIPOS filtrado)
function createCompactItem(p) {
    const item = document.createElement('div');
    item.className = 'all-item-compact';
    item.innerHTML = `
        <img src="${getSpriteUrl(p)}" alt="${p.name}">
        <div class="all-item-number">#${p.id}</div>
        <div class="all-item-name">${p.name}</div>
    `;
    item.addEventListener('click', () => { showDetail(p); }); 
    return item;
}

// 2. Crea la tarjeta grande (INICIO, FAVORITOS)
function createPopularCard(poke) {
  const totalStats = (poke.stats || []).reduce((s, st) => s + (st.base_stat || 0), 0);
  const popularity = Math.min(100, Math.round((totalStats / 600) * 100));
  const isFav = favorites.has(Number(poke.id));

  const card = document.createElement('article');
  card.className = 'popular-card';
  card.innerHTML = `
    <div class="popular-card__head">
      <div>
        <div class="popular-card__title">${poke.name} <small style="opacity:.75">#${poke.id}</small></div>
        <div>${(poke.types || []).map(t => `<span class="type-badge" style="background: linear-gradient(90deg,#${typeColor(t.type.name)}33,#${typeColor(t.type.name)}88);">${t.type.name}</span>`).join('')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <button class="favorite-btn" data-id="${poke.id}" aria-label="Favorito">${isFav ? '<i class="fa-solid fa-star"></i> Favorito' : '<i class="fa-regular fa-star"></i> Agregar'}</button>
        <button class="detail-btn" data-id="${poke.id}">Ver</button>
      </div>
    </div>
    <div class="popular-card__img"><img src="${getSpriteUrl(poke)}" alt="${poke.name}"></div>
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-weight:600">Popularidad</div><div style="opacity:.85">${popularity}%</div>
      </div>
      <div class="popular-card__bar"><div class="popular-card__bar-fill" data-width="${popularity}"></div></div>
    </div>
  `;

  // Handlers
  const favBtn = card.querySelector('.favorite-btn');
  const detailBtn = card.querySelector('.detail-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = Number(e.currentTarget.dataset.id);
    toggleFavorite(id);
    renderFavButtonState(favBtn, id);
    if (document.getElementById('favoritos')?.classList.contains('panel--active')) loadFavoritesSection();
  });

  const showDetailHandler = async (e) => {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id || poke.id;
    try {
      const p = await fetchPokemon(id); 
      showDetail(p);
    } catch (err) { 
        showDetail(poke);
        console.warn("Error al cargar detalle fresco, mostrando datos previos:", err); 
    }
  };
  detailBtn.addEventListener('click', showDetailHandler);
  card.querySelector('.popular-card__img').addEventListener('click', showDetailHandler);

  return card;
}
function renderFavButtonState(btnEl, id) {
  const isFav = favorites.has(Number(id));
  btnEl.dataset.id = String(id);
  btnEl.innerHTML = isFav ? '<i class="fa-solid fa-star"></i> Favorito' : '<i class="fa-regular fa-star"></i> Agregar';
}
function toggleFavorite(id) {
  const n = Number(id);
  if (favorites.has(n)) favorites.delete(n);
  else favorites.add(n);
  saveFavorites();
}

/* =======================================
   CARGA DE SECCIONES DE DATOS
   ======================================= */

async function loadPopular() {
  if (popularGrid && popularGrid.childElementCount > 0) return; 
  if(popularGrid) popularGrid.innerHTML = `<p style="color:rgba(255,255,255,0.6)">Cargando populares...</p>`;
  const promises = popularIds.map(id => fetchPokemon(id).catch(e => { console.error(`Error en popular ID ${id}:`, e); return null; }));
  try {
      const pokemons = (await Promise.all(promises)).filter(p => p !== null);
      if(popularGrid) popularGrid.innerHTML = '';
      pokemons.forEach(p => popularGrid.appendChild(createPopularCard(p)));
      requestAnimationFrame(() => {
        document.querySelectorAll('.popular-card__bar-fill').forEach(el => {
          const val = Number(el.dataset.width) || 0;
          el.style.width = `${val}%`;
        });
      });
  } catch(err) {
      if(popularGrid) popularGrid.innerHTML = `<p style="color:#ff8a8a">Error cargando populares. Inténtalo más tarde.</p>`;
  }
}

async function loadFavoritesSection() {
  if(favoritesGrid) favoritesGrid.innerHTML = `<p style="color:rgba(255,255,255,0.6)">Cargando favoritos...</p>`;
  if (favorites.size === 0) {
    if(favoritesGrid) favoritesGrid.innerHTML = `<p style="color:rgba(255,255,255,0.7)">No hay favoritos aún.</p>`;
    return;
  }
  if(favoritesGrid) favoritesGrid.innerHTML = '';
  const promises = Array.from(favorites).map(id => fetchPokemon(id).catch(e => { console.error(`Error en favorito ID ${id}:`, e); return null; }));
  try {
      const pokemons = (await Promise.all(promises)).filter(p => p !== null);
      pokemons.forEach(p => favoritesGrid.appendChild(createPopularCard(p)));
  } catch(err) {
      if(favoritesGrid) favoritesGrid.innerHTML = `<p style="color:#ff8a8a">Error al cargar favoritos.</p>`;
  }
}

async function loadAllList() {
  if (allList && allList.childElementCount > 0) return;
  if(allList) allList.innerHTML = `<p style="color:rgba(255,255,255,0.6)">Cargando lista...</p>`;
  try {
    const list = await fetchJson(`${API_BASE}/pokemon?limit=151&offset=0`); 
    const promises = (list.results || []).map(r => fetch(r.url).then(res => res.json()).catch(() => null));
    const settled = await Promise.allSettled(promises);
    if(allList) allList.innerHTML = '';
    settled.forEach(s => {
      if (s.status === 'fulfilled' && s.value) {
        allList.appendChild(createCompactItem(s.value));
      }
    });
  } catch (err) {
    if(allList) allList.innerHTML = `<p style="color:#ff8a8a">Error cargando lista: ${err.message}</p>`;
    console.error(err);
  }
}

async function loadTypesSection() {
    if (typesGrid && typesGrid.childElementCount > 0 && typesGrid.firstElementChild.className === 'type-item') return;

    if (!typesGrid) { console.error("typesGrid no encontrado."); return; }
    
    typesGrid.innerHTML = `<p style="color:rgba(255,255,255,0.6)">Cargando tipos...</p>`;
    typesGrid.classList.add('types-grid'); 
    if (typeFilterTitle) typeFilterTitle.style.display = 'none';
    if (typeFilteredList) typeFilteredList.innerHTML = '';

    try {
        const data = await fetchJson(`${API_BASE}/type`);
        typesGrid.innerHTML = '';
        const relevantTypes = data.results.filter(t => t.name !== 'unknown' && t.name !== 'shadow');

        relevantTypes.forEach(type => {
            const typeName = type.name;
            const item = document.createElement('div');
            item.className = 'type-item';
            const colorCode = typeColor(typeName);
            item.style.backgroundColor = `#${colorCode}33`;
            item.style.border = `2px solid #${colorCode}99`;
            item.innerHTML = `
                <i class="fa-solid ${typeIcons[typeName] || 'fa-question'} type-item__icon" style="color:#${colorCode}"></i>
                <div>${typeName}</div>
            `;
            item.addEventListener('click', () => { filterByType(typeName, type.url); });
            typesGrid.appendChild(item);
        });

    } catch (err) {
        typesGrid.innerHTML = `<p style="color:#ff8a8a">Error cargando tipos: ${err.message}</p>`;
        console.error("Error al cargar tipos:", err);
    }
}

async function filterByType(typeName, url) {
    if (typeFilterTitle) typeFilterTitle.style.display = 'block';
    if (currentTypeSpan) currentTypeSpan.textContent = typeName.toUpperCase();
    if (typeFilteredList) {
        typeFilteredList.innerHTML = `<p style="color:rgba(255,255,255,0.6)">Cargando Pokémon de tipo ${typeName}...</p>`;
        typeFilteredList.classList.add('all-list-grid'); 
        typeFilteredList.classList.remove('nature-grid');
    }

    try {
        const typeData = await fetchJson(url);
        if (typeFilteredList) typeFilteredList.innerHTML = '';

        const promises = typeData.pokemon
            .slice(0, 100)
            .map(p => fetch(p.pokemon.url).then(res => res.json()));

        const settled = await Promise.allSettled(promises);

        settled.forEach(s => {
            if (s.status === 'fulfilled' && s.value && typeFilteredList) {
                typeFilteredList.appendChild(createCompactItem(s.value));
            }
        });

        if (typeFilteredList && typeFilteredList.childElementCount === 0) {
             typeFilteredList.innerHTML = `<p style="color:rgba(255,255,255,0.7)">No se encontraron Pokémon de tipo ${typeName}.</p>`;
        }

    } catch (err) {
        if (typeFilteredList) typeFilteredList.innerHTML = `<p style="color:#ff8a8a">Error filtrando por tipo: ${err.message}</p>`;
        console.error("Error al filtrar por tipo:", err);
    }
}

async function loadNatureSection() {
    if (natureList && natureList.childElementCount > 0 && natureList.firstElementChild.className === 'nature-card') return;
    if (!natureList) { console.error("natureList no encontrado."); return; }

    natureList.innerHTML = `<p style="color:rgba(255,255,255,0.6)">Cargando información de Naturaleza...</p>`;
    
    try {
        const data = await fetchJson(`${API_BASE}/nature?limit=50`);
        const detailPromises = data.results.map(n => fetch(n.url).then(res => res.json()));
        const settled = await Promise.allSettled(detailPromises);

        natureList.innerHTML = '';
        natureList.classList.add('nature-grid'); 

        settled.forEach(s => {
            if (s.status === 'fulfilled' && s.value) {
                const details = s.value;

                const card = document.createElement('div');
                card.className = 'nature-card'; 

                const increased = details.increased_stat ? details.increased_stat.name.replace(/-/g, ' ') : 'NINGUNO';
                const decreased = details.decreased_stat ? details.decreased_stat.name.replace(/-/g, ' ') : 'NINGUNO';
                
                let effectHTML = '';
                
                if (increased !== 'NINGUNO' || decreased !== 'NINGUNO') {
                    effectHTML = `
                        <div class="nature-effect__stats">
                            <span style="color: #6ed394; font-weight: 600;">Sube: ${increased.toUpperCase()}</span>
                            <span style="color: #ff6b6b; font-weight: 600;">Baja: ${decreased.toUpperCase()}</span>
                        </div>
                    `;
                } else {
                    effectHTML = `<div class="nature-effect__stats"><span style="color: #dfe7ff;">Efecto: NEUTRO</span></div>`;
                }

                const favoriteFlavor = details.likes_flavor ? details.likes_flavor.name : 'Ninguno';
                const hatedFlavor = details.hates_flavor ? details.hates_flavor.name : 'Ninguno';

                card.innerHTML = `
                    <h3 class="nature-card__name">${details.name.toUpperCase()}</h3>
                    ${effectHTML}
                    <div class="nature-card__flavors">
                        <div style="opacity: 0.8;">Gusta: <span>${favoriteFlavor.toUpperCase()}</span></div>
                        <div style="opacity: 0.8;">Disgusta: <span>${hatedFlavor.toUpperCase()}</span></div>
                    </div>
                `;
                natureList.appendChild(card);
            }
        });

    } catch (err) {
        natureList.innerHTML = `<p style="color:#ff8a8a">Error cargando Naturaleza: ${err.message}</p>`;
        console.error("Error al cargar Naturaleza:", err);
    }
}

/* =======================================
   BÚSQUEDA Y DETALLE
   ======================================= */

async function handleSearch() {
  if (!searchInput) return;

  const q = searchInput.value.trim();
  if (!q) {
    alert('Escribe nombre o número del Pokémon.');
    return;
  }
  
  if (detailCenter) detailCenter.innerHTML = `<p style="color:rgba(255,255,255,0.85)">Buscando ${q}...</p>`;
  switchPanel('detailCenter');

  try {
    const p = await fetchPokemon(q); 
    showDetail(p);
  } catch (err) {
    if (detailCenter) detailCenter.innerHTML = `<p style="color:#ff6b6b">No se encontró el Pokémon: <strong>${q}</strong></p>`;
    console.warn("Error de búsqueda:", err);
  }
}

function showDetail(poke) {
  if (!poke || !poke.id || !detailCenter) {
      if(detailCenter) detailCenter.innerHTML = `<p style="color:#ff6b6b">Error de datos: No se pudo cargar la información detallada.</p>`;
      return;
  }

  detailCenter.innerHTML = '';
  switchPanel('detailCenter');

  const statsMap = {};
  (poke.stats || []).forEach(s => statsMap[s.stat.name] = Number(s.base_stat || 0));
  const atk = statsMap.attack || 0;
  const def = statsMap.defense || 0;

  const container = document.createElement('div');
  container.className = 'detail';
  container.innerHTML = `
    <div class="detail__left"><img src="${getSpriteUrl(poke)}" alt="${poke.name}"></div>
    <div class="detail__right">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="detail__title">${poke.name} <small style="opacity:.75">#${poke.id}</small></div>
          <div class="detail__meta">Altura: ${poke.height/10} m • Peso: ${poke.weight/10} kg</div>
          <div style="margin-top:8px">${(poke.types || []).map(t => `<span class="type-badge" style="background: linear-gradient(90deg,#${typeColor(t.type.name)}33,#${typeColor(t.type.name)}88);">${t.type.name}</span>`).join('')}</div>
        </div>

        <div>
          <button class="favorite-btn" data-id="${poke.id}">${favorites.has(Number(poke.id)) ? '<i class="fa-solid fa-star"></i> Favorito' : '<i class="fa-regular fa-star"></i> Agregar'}</button>
        </div>
      </div>

      <div style="margin-top:16px;">
        <div style="font-weight:600;margin-bottom:6px">Ataque: ${atk}</div>
        <div class="stat-hr"><div class="stat-fill" data-val="${atk}"></div></div>

        <div style="font-weight:600;margin-top:10px;margin-bottom:6px">Defensa: ${def}</div>
        <div class="stat-hr"><div class="stat-fill" data-val="${def}"></div></div>
      </div>

      <div style="margin-top:14px;">
        <div style="font-weight:600;margin-bottom:6px">Otros stats</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${(poke.stats || []).map(s => `<div style="background:rgba(255,255,255,0.02);padding:6px 8px;border-radius:8px;font-size:13px">${s.stat.name}: ${s.base_stat}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

  detailCenter.appendChild(container);

  requestAnimationFrame(() => {
    container.querySelectorAll('.stat-fill').forEach(el => {
      const val = Number(el.dataset.val) || 0;
      const pct = Math.min(100, Math.round((val / 150) * 100)); 
      el.style.width = `${pct}%`;
    });
  });

  const favBtn = container.querySelector('.favorite-btn');
  favBtn.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.id);
    toggleFavorite(id);
    renderFavButtonState(favBtn, id);
    if (document.getElementById('favoritos')?.classList.contains('panel--active')) loadFavoritesSection();
  });
}