const CACHE_NAME = 'financas-v6';

const ASSETS_TO_CACHE = [
    './',
    './Aplicativo.html',
    './Styles/estilos.css',
    './Java/Aplicativo.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css',
  'https://cdn.jsdelivr.net/npm/toastify-js'
];

//Instalação: Cacheia os arquivos e força a atualização imediata
self.addEventListener('install', (e) =>{
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>{
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    //Força o sw a ativar imediatamente (pula a espera)
    self.skipWaiting();
});

//Ativação: Limpa caches antigos e assume o controle da página
self.addEventListener("activate", (e) =>{
    e.waitUntil(
        caches.keys().then((keylist) =>{
            return Promisse.all(
                keylist.map((key) =>{
                    if(key !== CACHE_NAME){
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    //Garante que a página aberta já use o novo sw
    return self.clients.claim();
})

//Intercepta as requisições para servir o cache quando offline
self.addEventListener('fetch', (e) =>{
    e.respondWith(
        caches.match(e.request).then((response) =>{
            return response || fetch(e.request);
        })
    );
});
