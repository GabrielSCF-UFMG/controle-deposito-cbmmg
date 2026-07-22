// app.js — funcionalidades PWA e status de conexão (comentários em português)

// Registra o Service Worker (sw.js) se suportado pelo navegador
async function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Registro relativo à raiz do site — garante que o SW controle toda a aplicação
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registrado em:', reg.scope);
    } catch (err) {
      // Falha no registro — log para depuração
      console.error('Erro ao registrar Service Worker:', err);
    }
  } else {
    // Navegador não suporta Service Worker
    console.log('Service Worker não suportado.');
  }
}

// Atualiza o elemento #status com o estado de conectividade
function updateStatus() {
  const el = document.getElementById('status');
  if (!el) return; // se não existir, nada a fazer

  if (navigator.onLine) {
    el.textContent = '🟢 Online';
  } else {
    el.textContent = '🔴 Offline (funcionando localmente)';
  }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // Registra o Service Worker para ativar o PWA
  registrarServiceWorker();

  // Atualiza o status imediatamente
  updateStatus();

  // Atualiza o status ao mudar a conectividade
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
});
