const stampEs = document.querySelector('.stamp-es');
const stampEn = document.querySelector('.stamp-en');
const languageLabel = document.querySelector('.language-label');

const passportIntro = document.querySelector('.passport-intro');
const passportInner = document.querySelector('.passport-intro-inner');
const passportSeal = document.querySelector('.passport-seal');
const passportGif = document.querySelector('.passport-gif');
const invitationContainer = document.querySelector('.invitation-container');
const weddingSite = document.querySelector('.wedding-site');

// Preloader elements
const preloaderOverlay = document.getElementById('preloader-overlay');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderPercentage = document.getElementById('preloader-percentage');

// Helper to preload small critical assets using standard Image
const preloadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = resolve;
    img.onerror = resolve; // Resolve anyway to avoid blocking execution
  });
};

// Helper to preload large GIF using fetch and ReadableStream to track progress
const preloadGifWithProgress = async (url, onProgress) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const contentLength = +response.headers.get('Content-Length');
    if (!contentLength) {
      console.warn('Content-Length missing, falling back to standard loading');
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }

    const reader = response.body.getReader();
    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;
      
      const progress = (receivedLength / contentLength) * 100;
      onProgress(progress);
    }

    const blob = new Blob(chunks, { type: 'image/gif' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to preload GIF with progress, falling back:', error);
    return url;
  }
};

let loadedGifUrl = '';

// Start preloading critical assets as soon as the page loads
const startPreloading = async () => {
  const gifUrl = '/passport-open.gif';
  const criticalImages = [
    '/passport-closed.png',
    '/fondo-canva.jpg',
    '/arco-top.png',
    '/arco-mid.png',
    '/arco-bottom.png',
    '/ingles.png',
    '/espanol.png'
  ];

  // Start preloading small assets in parallel
  const assetsPromise = Promise.all(criticalImages.map(preloadImage));

  // Preload huge GIF with progress tracking
  try {
    loadedGifUrl = await preloadGifWithProgress(gifUrl, (progress) => {
      const roundedProgress = Math.min(Math.round(progress), 100);
      if (preloaderBar) preloaderBar.style.width = `${roundedProgress}%`;
      if (preloaderPercentage) preloaderPercentage.textContent = `${roundedProgress}%`;
      if (preloaderOverlay) preloaderOverlay.setAttribute('aria-valuenow', roundedProgress);
    });
  } catch (err) {
    console.error('Error loading main GIF:', err);
    loadedGifUrl = gifUrl;
  }

  // Ensure other assets are also done loading
  await assetsPromise;

  // Complete preloading UI transition
  if (preloaderBar) preloaderBar.style.width = '100%';
  if (preloaderPercentage) preloaderPercentage.textContent = '100%';
  if (preloaderOverlay) preloaderOverlay.setAttribute('aria-valuenow', '100');

  setTimeout(() => {
    if (preloaderOverlay) {
      preloaderOverlay.classList.add('is-hidden');
      preloaderOverlay.addEventListener('transitionend', () => preloaderOverlay.remove(), { once: true });
    }
    
    // Enable the wax seal button
    if (passportSeal) {
      passportSeal.disabled = false;
    }
  }, 400); // Wait for the bar animation to finish
};

startPreloading();

const showWeddingSite = (language) => {
  if (!weddingSite) return;

  document.documentElement.lang = language;
  document.querySelectorAll('[data-es][data-en]').forEach((element) => {
    element.innerHTML = element.dataset[language];
  });

  document.querySelectorAll('[data-placeholder-es][data-placeholder-en]').forEach((element) => {
    const key = 'placeholder' + language.charAt(0).toUpperCase() + language.slice(1);
    element.placeholder = element.dataset[key];
  });

  const pageShell = document.querySelector('.page-shell');
  if (pageShell) {
    pageShell.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    pageShell.style.opacity = '0';
    pageShell.style.transform = 'scale(0.96)';

    setTimeout(() => {
      pageShell.style.display = 'none';
      document.body.classList.add('in-wedding-site');
      weddingSite.hidden = false;

      // Unlock scroll after page shell is hidden and wedding site is shown
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');

      requestAnimationFrame(() => {
        weddingSite.classList.add('is-visible');
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    }, 500);
  } else {
    document.body.classList.add('in-wedding-site');
    weddingSite.hidden = false;

    // Unlock scroll
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    requestAnimationFrame(() => {
      weddingSite.classList.add('is-visible');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
};


if (passportSeal && passportInner && passportGif && passportIntro && invitationContainer) {
  let hasOpened = false;
  let hasRevealed = false;
  let bgMusic = null;
  const TRANSITION_DELAY = 5200; // 6 seconds

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

    // Iniciar la subida de volumen progresiva de la música que ya se está reproduciendo
    if (bgMusic) {
      let vol = 0;
      const fadeInterval = setInterval(() => {
        if (vol < 0.6) { // Volumen máximo de 0.6
          vol += 0.03;
          bgMusic.volume = Math.min(vol, 0.6);
        } else {
          clearInterval(fadeInterval);
        }
      }, 150); // Incrementa el volumen cada 150ms
    }
  };

  passportSeal.addEventListener('click', () => {
    if (hasOpened) return;
    hasOpened = true;

    // Inicializar y reproducir música de fondo en volumen 0 inmediatamente.
    // Esto se realiza de manera síncrona dentro del evento de interacción del usuario
    // para desbloquear la reproducción de audio en iOS (Safari y Chrome para iPhone).
    bgMusic = new Audio('/Cancion-fondo.mp3');
    bgMusic.volume = 0;
    bgMusic.loop = true;
    bgMusic.play().catch((err) => {
      console.log('La música de fondo no pudo pre-iniciarse:', err);
    });

    // Cargar el GIF usando la URL pre-cargada
    passportGif.src = loadedGifUrl || '/passport-open.gif';
    passportInner.classList.add('is-playing');

    // Reproducir el sonido del aeropuerto
    const audio = new Audio('/Sonido-aeropuerto.mp3');
    audio.play().catch((err) => {
      console.log('El audio no pudo reproducirse por políticas de reproducción automática:', err);
    });

    // Desvanecer el sonido un poco antes de los 4 segundos (para que dure solo 4 segundos)
    setTimeout(() => {
      let currentVolume = 1.0;
      const fadeInterval = setInterval(() => {
        currentVolume -= 0.1;
        if (currentVolume > 0) {
          try {
            audio.volume = Math.max(0, currentVolume);
          } catch (e) {
            console.warn('No se pudo ajustar el volumen programáticamente:', e);
          }
        } else {
          clearInterval(fadeInterval);
          audio.pause();
        }
      }, 50);
    }, 3500); // Se desvanece durante los últimos 500ms

    // Revelar la invitación después de la transición
    setTimeout(revealInvitation, TRANSITION_DELAY);
  });

  // Pausar la música si el usuario minimiza el navegador, cambia de pestaña o bloquea el móvil
  document.addEventListener('visibilitychange', () => {
    if (!bgMusic) return;
    if (document.visibilityState === 'hidden') {
      bgMusic.pause();
    } else if (document.visibilityState === 'visible' && hasRevealed) {
      bgMusic.play().catch((err) => {
        console.log('La música no pudo reanudarse automáticamente:', err);
      });
    }
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

const rsvpData = {
  name: '',
  attending: '',
  needsAccommodation: '',
  peopleCount: '',
  shareWith: ''
};

const sendRSVPData = (data) => {
  const url = 'https://script.google.com/macros/s/AKfycbyg_-SjVL10h5ep5QgFISco1N3IOLpkYmBmCesZ-JsHb8CoTY6BXwliS5j_fdB7M0FJ/exec';
  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(() => console.log('RSVP enviado correctamente'))
  .catch(err => console.error('Error al enviar RSVP:', err));
};

// El botón de confirmar asistencia llevará a la selección de RSVP con transición suave
const rsvpButton = document.querySelector('.rsvp-btn, .rsvp-button');
const rsvpSelectionSite = document.getElementById('rsvp-selection-site');
if (rsvpButton && rsvpSelectionSite && weddingSite) {
  rsvpButton.addEventListener('click', () => {
    // Transición de salida para weddingSite
    weddingSite.style.transition = 'opacity 0.5s ease-in-out';
    weddingSite.style.opacity = '0';
    
    setTimeout(() => {
      weddingSite.hidden = true;
      weddingSite.classList.remove('is-visible');
      
      // Preparar rsvpSelectionSite invisible
      rsvpSelectionSite.style.opacity = '0';
      rsvpSelectionSite.hidden = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Transición de entrada para rsvpSelectionSite
      requestAnimationFrame(() => {
        rsvpSelectionSite.style.transition = 'opacity 0.6s ease-in-out';
        rsvpSelectionSite.style.opacity = '1';
        rsvpSelectionSite.classList.add('is-visible');
      });
    }, 500);
  });
}

// Al hacer click en las opciones de la primera página RSVP
const rsvpOptionButtons = document.querySelectorAll('#rsvp-selection-site .rsvp-option-btn');
const rsvpAccommodationSite = document.getElementById('rsvp-accommodation-site');

if (rsvpOptionButtons.length > 0) {
  rsvpOptionButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (rsvpSelectionSite) {
        // Transición de salida para rsvpSelectionSite
        rsvpSelectionSite.style.transition = 'opacity 0.5s ease-in-out';
        rsvpSelectionSite.style.opacity = '0';
        
        setTimeout(() => {
          rsvpSelectionSite.hidden = true;
          rsvpSelectionSite.classList.remove('is-visible');
          
          if (index === 0) {
            rsvpData.attending = 'Sí';
            // "Sí, ahí estaré" -> Ir a la página de Alojamiento
            if (rsvpAccommodationSite) {
              rsvpAccommodationSite.style.opacity = '0';
              rsvpAccommodationSite.hidden = false;
              window.scrollTo({ top: 0, behavior: 'instant' });
              
              requestAnimationFrame(() => {
                rsvpAccommodationSite.style.transition = 'opacity 0.6s ease-in-out';
                rsvpAccommodationSite.style.opacity = '1';
                rsvpAccommodationSite.classList.add('is-visible');
              });
            }
          } else {
            rsvpData.attending = index === 1 ? 'No' : 'Aun no lo se';
            rsvpData.needsAccommodation = 'No';
            rsvpData.peopleCount = '';
            rsvpData.shareWith = '';
            sendRSVPData(rsvpData);
            
            // "No será posible" o "Aun no lo se" -> Ir a Agradecimiento (Sección 7)
            if (weddingSite) {
              weddingSite.style.opacity = '0';
              weddingSite.hidden = false;
              
              const sec7 = document.getElementById('sec-7');
              if (sec7) {
                sec7.scrollIntoView({ behavior: 'instant', block: 'center' });
              }
              
              requestAnimationFrame(() => {
                weddingSite.style.transition = 'opacity 0.6s ease-in-out';
                weddingSite.style.opacity = '1';
                weddingSite.classList.add('is-visible');
              });
            }
          }
        }, 500);
      }
    });
  });
}

// Al hacer click en las opciones de la página de Alojamiento
const accommodationOptionButtons = document.querySelectorAll('#rsvp-accommodation-site .rsvp-option-btn');
const rsvpDetailsSite = document.getElementById('rsvp-details-site');

if (accommodationOptionButtons.length > 0) {
  accommodationOptionButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (rsvpAccommodationSite) {
        rsvpAccommodationSite.style.transition = 'opacity 0.5s ease-in-out';
        rsvpAccommodationSite.style.opacity = '0';
        
        setTimeout(() => {
          rsvpAccommodationSite.hidden = true;
          rsvpAccommodationSite.classList.remove('is-visible');
          
          if (index === 0) {
            rsvpData.needsAccommodation = 'Sí';
            // "Sí, lo necesitaré" -> Ir a la página de Detalles (Preguntas)
            if (rsvpDetailsSite) {
              rsvpDetailsSite.style.opacity = '0';
              rsvpDetailsSite.hidden = false;
              window.scrollTo({ top: 0, behavior: 'instant' });
              
              requestAnimationFrame(() => {
                rsvpDetailsSite.style.transition = 'opacity 0.6s ease-in-out';
                rsvpDetailsSite.style.opacity = '1';
                rsvpDetailsSite.classList.add('is-visible');
              });
            }
          } else {
            rsvpData.needsAccommodation = 'No';
            rsvpData.peopleCount = '';
            rsvpData.shareWith = '';
            sendRSVPData(rsvpData);
            
            // "No / Aun no lo se" -> Ir a Agradecimiento (Sección 7)
            if (weddingSite) {
              weddingSite.style.opacity = '0';
              weddingSite.hidden = false;
              
              const sec7 = document.getElementById('sec-7');
              if (sec7) {
                sec7.scrollIntoView({ behavior: 'instant', block: 'center' });
              }
              
              requestAnimationFrame(() => {
                weddingSite.style.transition = 'opacity 0.6s ease-in-out';
                weddingSite.style.opacity = '1';
                weddingSite.classList.add('is-visible');
              });
            }
          }
        }, 500);
      }
    });
  });
}

// Al hacer click en el botón de Confirmar de la página de Detalles -> Ir a Agradecimiento (Sección 7)
const rsvpSubmitBtn = document.querySelector('#rsvp-details-site .rsvp-submit-btn');
const rsvpInputs = document.querySelectorAll('#sec-rsvp-details .rsvp-text-input');
const guestsInput = rsvpInputs[0];
const shareInput = rsvpInputs[1];

if (guestsInput) {
  guestsInput.addEventListener('input', () => {
    guestsInput.classList.remove('rsvp-input-error');
  });
}

if (rsvpSubmitBtn) {
  rsvpSubmitBtn.addEventListener('click', () => {
    if (guestsInput) {
      const val = guestsInput.value.trim();
      if (!val) {
        guestsInput.classList.add('rsvp-input-error');
        guestsInput.focus();
        
        // Efecto visual de sacudida (shake)
        guestsInput.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)' }
        ], { duration: 300, easing: 'ease-in-out' });
        
        return; // Cancelar confirmación
      }
      rsvpData.peopleCount = val;
    }
    
    if (shareInput) {
      rsvpData.shareWith = shareInput.value.trim();
    }
    
    sendRSVPData(rsvpData);

    if (rsvpDetailsSite) {
      rsvpDetailsSite.style.transition = 'opacity 0.5s ease-in-out';
      rsvpDetailsSite.style.opacity = '0';
      
      setTimeout(() => {
        rsvpDetailsSite.hidden = true;
        rsvpDetailsSite.classList.remove('is-visible');
        
        if (weddingSite) {
          weddingSite.style.opacity = '0';
          weddingSite.hidden = false;
          
          const sec7 = document.getElementById('sec-7');
          if (sec7) {
            sec7.scrollIntoView({ behavior: 'instant', block: 'center' });
          }
          
          requestAnimationFrame(() => {
            weddingSite.style.transition = 'opacity 0.6s ease-in-out';
            weddingSite.style.opacity = '1';
            weddingSite.classList.add('is-visible');
          });
        }
      }, 500);
    }
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

const initPersonalization = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawName = urlParams.get('name') || urlParams.get('invitado');
  const guestTitle = document.querySelector('#sec-rsvp-select .rsvp-select-title');
  const guestElement = document.querySelector('#sec-rsvp-select .rsvp-select-guest');
  const thanksTitle = document.querySelector('.thanks-title');

  if (rawName) {
    // Reemplaza guiones bajos por espacios y decodifica
    const guestName = decodeURIComponent(rawName).replace(/_/g, ' ');
    rsvpData.name = guestName;
    if (guestElement) {
      guestElement.textContent = guestName;
      guestElement.style.display = '';
    }
    if (guestTitle) {
      guestTitle.style.display = '';
    }

    // Personalizar título de agradecimiento con soporte bilingüe
    if (thanksTitle) {
      thanksTitle.dataset.es = `¡ Muchas gracias por tu atención, ${guestName} !`;
      thanksTitle.dataset.en = `Thank you very much for your attention, ${guestName} !`;
      
      const currentLang = document.documentElement.lang || 'es';
      thanksTitle.innerHTML = thanksTitle.dataset[currentLang] || thanksTitle.dataset.es;
    }
  } else {
    // Ocultar placeholders si no hay parámetro en la URL
    if (guestElement) {
      guestElement.style.display = 'none';
    }
    if (guestTitle) {
      guestTitle.style.display = 'none';
    }
  }
};

initPersonalization();


