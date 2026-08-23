const stampEs = document.querySelector('.stamp-es');
const stampEn = document.querySelector('.stamp-en');
const languageLabel = document.querySelector('.language-label');

const passportIntro = document.querySelector('.passport-intro');
const passportInner = document.querySelector('.passport-intro-inner');
const passportSeal = document.querySelector('.passport-seal');
const passportGif = document.querySelector('.passport-gif');
const invitationContainer = document.querySelector('.invitation-container');
const weddingSite = document.querySelector('.wedding-site');

const showWeddingSite = (language) => {
  if (!weddingSite) return;

  document.documentElement.lang = language;
  document.querySelectorAll('[data-es][data-en]').forEach((element) => {
    element.innerHTML = element.dataset[language];
  });

  const pageShell = document.querySelector('.page-shell');
  if (pageShell) {
    pageShell.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    pageShell.style.opacity = '0';
    pageShell.style.transform = 'scale(0.96)';

    setTimeout(() => {
      pageShell.style.display = 'none';
      weddingSite.hidden = false;
      requestAnimationFrame(() => {
        weddingSite.classList.add('is-visible');
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    }, 500);
  } else {
    weddingSite.hidden = false;
    requestAnimationFrame(() => {
      weddingSite.classList.add('is-visible');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
};


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
    showWeddingSite('es');
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
    showWeddingSite('en');
  });
}

// El botón de confirmar asistencia llevará a otra página más adelante
const rsvpButton = document.querySelector('.rsvp-btn, .rsvp-button');
if (rsvpButton) {
  rsvpButton.addEventListener('click', () => {
    // Lógica de navegación pendiente de definir
  });
}

const initCountdown = () => {
  const targetDate = new Date('2027-09-02T00:00:00').getTime();

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      const elDays = document.getElementById('cd-days');
      const elHours = document.getElementById('cd-hours');
      const elMinutes = document.getElementById('cd-minutes');
      const elSeconds = document.getElementById('cd-seconds');
      if (elDays) elDays.textContent = '000';
      if (elHours) elHours.textContent = '00';
      if (elMinutes) elMinutes.textContent = '00';
      if (elSeconds) elSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMinutes = document.getElementById('cd-minutes');
    const elSeconds = document.getElementById('cd-seconds');

    if (elDays) elDays.textContent = String(days).padStart(3, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
};

initCountdown();


