// Service Worker para PWA — caching básico em cache nomeado
// CACHE_NAME: versão do cache para facilitar atualizações futuras
const CACHE_NAME = 'controle-deposito-v1';

// URLs que queremos armazenar em cache para funcionamento offline
const urlsToCache = [
  '/',
  '/index.html',
  '/scanner.html',
  '/css/style.css',
  '/js/app.js',
  '/js/scanner.js'
];

// Evento install: abrir o cache e pré-carregar os recursos
self.addEventListener('install', (event) => {
  // Comentário: durante a instalação, fazer o cache dos arquivos essenciais
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Adiciona todos os URLs definidos ao cache
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Forçar ativação imediata do SW em algumas situações
        return self.skipWaiting();
      })
  );
});

// Evento activate: limpar caches antigos se necessário (boa prática)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            // Remove caches de versões anteriores
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Toma posse imediata dos clientes
      return self.clients.claim();
    })
  );
});

// Evento fetch: responde com cache primeiro, fallback para rede
self.addEventListener('fetch', (event) => {
  // Comentário: tenta atender a requisição a partir do cache e, se não existir, faz fetch na rede
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Retorna recurso em cache
          return response;
        }
        // Recurso não está em cache — buscar na rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Opcional: pode-se acrescentar ao cache para uso futuro
            return networkResponse;
          })
          .catch(() => {
            // Em caso de falha na rede, pode-se retornar um fallback (opcional)
            return new Response('Offline', { status: 503, statusText: 'Offline' });
          });
      })
  );
});
