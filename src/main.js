const stampEs = document.querySelector('.stamp-es');
const stampEn = document.querySelector('.stamp-en');
const languageLabel = document.querySelector('.language-label');

const passportIntro = document.querySelector('.passport-intro');
const passportInner = document.querySelector('.passport-intro-inner');
const passportSeal = document.querySelector('.passport-seal');
const passportVideo = document.querySelector('.passport-video');
const invitationContainer = document.querySelector('.invitation-container');

if (passportSeal && passportInner && passportVideo && passportIntro && invitationContainer) {
  let hasOpened = false;
  let hasRevealed = false;
  const FALLBACK_DURATION = 5.1; // duración conocida del export de Canva
  const LEAD_TIME = 1; // segundos: la transición empieza durante el último segundo del video

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
  };

  passportSeal.addEventListener('click', () => {
    if (hasOpened) return;
    hasOpened = true;

    passportInner.classList.add('is-playing');
    passportVideo.currentTime = 0;
    passportVideo.play().catch(() => {
      // Autoplay bloqueado: revela la invitación igualmente tras una breve pausa.
      setTimeout(revealInvitation, 800);
    });

    // No esperar a que el video termine: adelantar la transición al último segundo.
    passportVideo.addEventListener('timeupdate', () => {
      const duration = Number.isFinite(passportVideo.duration) ? passportVideo.duration : FALLBACK_DURATION;
      if (passportVideo.currentTime >= duration - LEAD_TIME) {
        revealInvitation();
      }
    });
    passportVideo.addEventListener('ended', revealInvitation, { once: true });
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
