// scanner.js — lógica da câmera e detecção (comentários em português)

// Referências DOM
let video;
let btnEntrada;
let btnSaida;
let btnCapture;
let aiStatus;
let equipmentInfo;
let equipmentName;
let confidence;
let detectionBox;
let detectionLabel;

// Variáveis globais
let stream = null;
let isAnalyzing = false;

// Inicializa a câmera, preferindo a traseira (environment)
async function initCamera() {
  aiStatus && (aiStatus.textContent = '📷 Iniciando câmera...');

  const constraints = {
    audio: false,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: { ideal: 'environment' }
    }
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    // Atribui o stream ao elemento de vídeo
    if ('srcObject' in video) {
      video.srcObject = stream;
    } else {
      // Fallback para navegadores antigos
      video.src = URL.createObjectURL(stream);
    }

    // Garante que o vídeo reproduza automaticamente
    await video.play();

    aiStatus && (aiStatus.textContent = '🔍 Aponte para um equipamento');
  } catch (erro) {
    console.error('Erro ao iniciar câmera:', erro);
    aiStatus && (aiStatus.textContent = '⚠️ Erro ao acessar a câmera. Verifique permissões.');
  }
}

// Captura o frame atual do vídeo e retorna um canvas
function captureFrame() {
  if (!video) return null;

  // Cria canvas com as dimensões do vídeo
  const w = video.videoWidth || video.clientWidth || 1280;
  const h = video.videoHeight || video.clientHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Desenha o frame atual
  try {
    ctx.drawImage(video, 0, 0, w, h);
  } catch (err) {
    console.warn('Não foi possível desenhar o frame no canvas:', err);
  }

  // Chama a simulação de detecção
  simulateDetection();

  return canvas;
}

// Simula a detecção/identificação do equipamento
function simulateDetection() {
  if (isAnalyzing) return;
  isAnalyzing = true;

  aiStatus && (aiStatus.textContent = '🤖 Analisando...');

  setTimeout(() => {
    // Lista de equipamentos simulados
    const equipamentos = [
      'Mangueira de Incêndio',
      'Machado de Resgate',
      'Capacete de Combate',
      'Rádio Comunicador',
      'Lanterna Tática'
    ];

    // Sorteia um equipamento
    const nome = equipamentos[Math.floor(Math.random() * equipamentos.length)];

    // Gera confiança entre 80 e 100
    const conf = Math.floor(80 + Math.random() * 21); // 80..100

    // Preenche os campos da interface
    if (equipmentName) equipmentName.value = nome;
    if (confidence) confidence.textContent = `${conf}%`;
    if (detectionLabel) detectionLabel.textContent = nome;

    // Mostra painel de equipamento e caixa de detecção
    equipmentInfo && equipmentInfo.classList.remove('hidden');
    detectionBox && detectionBox.classList.remove('hidden');

    // Habilita botões de entrada/saída
    if (btnEntrada) { btnEntrada.disabled = false; btnEntrada.removeAttribute('aria-disabled'); }
    if (btnSaida) { btnSaida.disabled = false; btnSaida.removeAttribute('aria-disabled'); }

    aiStatus && (aiStatus.textContent = '✅ Equipamento identificado!');

    isAnalyzing = false;
  }, 1500);
}

// Registra a movimentação (entrada/saída)
function registrarMovimentacao(tipo) {
  const nome = equipmentName && equipmentName.value ? equipmentName.value.trim() : '';
  if (!nome) {
    alert('Nenhum equipamento identificado para registrar.');
    return;
  }

  const registro = {
    id: Date.now(),
    equipamento: nome,
    tipo: tipo === 'entrada' ? 'entrada' : 'saida',
    data: new Date().toISOString()
  };

  // Log do registro (poderia ser enviado para backend ou armazenado localmente)
  console.log('Movimentação registrada:', registro);

  // Confirmação para o operador
  alert(`Registro ${registro.tipo.toUpperCase()} confirmado para: ${registro.equipamento}`);

  // Reseta a interface
  if (equipmentInfo) equipmentInfo.classList.add('hidden');
  if (detectionBox) detectionBox.classList.add('hidden');
  if (equipmentName) equipmentName.value = '';
  if (confidence) confidence.textContent = '--%';
  if (btnEntrada) { btnEntrada.disabled = true; btnEntrada.setAttribute('aria-disabled', 'true'); }
  if (btnSaida) { btnSaida.disabled = true; btnSaida.setAttribute('aria-disabled', 'true'); }
  if (aiStatus) aiStatus.textContent = '🔍 Aguardando equipamento...';
}

// Ao carregar o documento, inicializa referências e configura handlers
document.addEventListener('DOMContentLoaded', () => {
  // Referências DOM
  video = document.getElementById('video');
  btnEntrada = document.getElementById('btn-entrada');
  btnSaida = document.getElementById('btn-saida');
  btnCapture = document.getElementById('btn-capture');
  aiStatus = document.getElementById('ai-status');
  equipmentInfo = document.getElementById('equipment-info');
  equipmentName = document.getElementById('equip-name');
  confidence = document.getElementById('confidence');
  detectionBox = document.getElementById('detection-box');
  detectionLabel = document.getElementById('detection-label'); // opcional

  // Listeners de botões
  if (btnCapture) {
    btnCapture.addEventListener('click', (e) => {
      e.preventDefault();
      captureFrame();
    });
  }

  if (btnEntrada) {
    btnEntrada.addEventListener('click', (e) => {
      e.preventDefault();
      registrarMovimentacao('entrada');
    });
  }

  if (btnSaida) {
    btnSaida.addEventListener('click', (e) => {
      e.preventDefault();
      registrarMovimentacao('saida');
    });
  }

  // Inicializa a câmera automaticamente
  initCamera();
});

// Ao sair da página, garantir que as tracks sejam paradas
window.addEventListener('beforeunload', () => {
  if (stream && stream.getTracks) {
    stream.getTracks().forEach(track => track.stop());
  }
});
