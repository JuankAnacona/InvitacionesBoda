const stampEs = document.querySelector('.stamp-es');
const stampEn = document.querySelector('.stamp-en');
const languageLabel = document.querySelector('.language-label');

const passportIntro = document.querySelector('.passport-intro');
const passportInner = document.querySelector('.passport-intro-inner');
const passportSeal = document.querySelector('.passport-seal');
const passportGif = document.querySelector('.passport-gif');
const invitationContainer = document.querySelector('.invitation-container');

if (passportSeal && passportInner && passportGif && passportIntro && invitationContainer) {
  let hasOpened = false;
  let hasRevealed = false;
  const TRANSITION_DELAY = 4000; // 4 seconds

  const revealInvitation = () => {
    if (hasRevealed) return;
    hasRevealed = true;
    passportIntro.classList.add('is-leaving');
    invitationContainer.classList.remove('is-hidden');
    passportIntro.addEventListener(
      'transitionend',
      () => passportIntro.remove(),
      { once: true }
    );

    // Reproducir la música de fondo con volumen progresivo
    const bgMusic = new Audio('/Cancion-fondo.mp3');
    bgMusic.volume = 0;
    bgMusic.loop = true;
    bgMusic.play().then(() => {
      let vol = 0;
      const fadeInterval = setInterval(() => {
        if (vol < 0.6) { // Volumen máximo de 0.6
          vol += 0.03;
          bgMusic.volume = Math.min(vol, 1);
        } else {
          clearInterval(fadeInterval);
        }
      }, 150); // Incrementa el volumen cada 150ms
    }).catch((err) => {
      console.log('La música de fondo fue bloqueada o falló:', err);
    });
  };

  passportSeal.addEventListener('click', () => {
    if (hasOpened) return;
    hasOpened = true;

    // Cargar el GIF al hacer clic para que inicie la animación desde el principio
    passportGif.src = '/passport-open.gif';
    passportInner.classList.add('is-playing');

    // Reproducir el sonido del aeropuerto
    const audio = new Audio('/Sonido-aeropuerto.mp3');
    audio.play().catch((err) => {
      console.log('El audio no pudo reproducirse por políticas de reproducción automática:', err);
    });

    // Desvanecer el sonido un poco antes de los 4 segundos
    setTimeout(() => {
      let fadeInterval = setInterval(() => {
        if (audio.volume > 0.1) {
          audio.volume -= 0.1;
        } else {
          clearInterval(fadeInterval);
          audio.pause();
        }
      }, 50);
    }, 3500); // Se desvanece durante los últimos 500ms

    // Revelar la invitación después de 4 segundos
    setTimeout(revealInvitation, TRANSITION_DELAY);
  });
}


if (stampEs) {
  stampEs.addEventListener('click', () => {
    stampEs.animate(
      [
        { transform: 'scale(1) rotate(-3deg)' },
        { transform: 'scale(1.08) rotate(0deg)' },
        { transform: 'scale(1) rotate(-3deg)' }
      ],
      { duration: 250, easing: 'ease-out' }
    );
    if (languageLabel) languageLabel.textContent = 'Idioma/Language';
  });
}

if (stampEn) {
  stampEn.addEventListener('click', () => {
    stampEn.animate(
      [
        { transform: 'scale(1) rotate(3deg)' },
        { transform: 'scale(1.08) rotate(0deg)' },
        { transform: 'scale(1) rotate(3deg)' }
      ],
      { duration: 250, easing: 'ease-out' }
    );
    if (languageLabel) languageLabel.textContent = 'Language/Idioma';
  });
}
