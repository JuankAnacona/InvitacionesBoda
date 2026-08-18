const stampEs = document.querySelector('.stamp-es');
const stampEn = document.querySelector('.stamp-en');
const languageLabel = document.querySelector('.language-label');

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
