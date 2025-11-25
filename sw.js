const CACHE_NAME = 'financas-v1';
const ASSETS_TO_CACHE = [
    './Aplicativo.html',
    './Styles/estilos.css',
    './Java/Aplicativo.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

//Instalação do Service Worker e Cache dos arquivos
self.addEventListener('install', (e) =>{
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>{
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

//Intercepta as requisições para servir o cache quando offline
self.addEventListener('fetch', (e) =>{
    e.respondWith(
        caches.match(e.request).then((response) =>{
            return response || fetch(e.request);
        })
    );
});