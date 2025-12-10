document.addEventListener('DOMContentLoaded', function () {

  /* ========== ANO NO RODAPÉ ========== */
  const spanAno = document.getElementById('ano-atual');
  if (spanAno) {
    spanAno.textContent = new Date().getFullYear();
  }

  /* ========== MENU MOBILE ========== */
  const navToggle = document.getElementById('nav-toggle');
  const mobilePanel = document.getElementById('mobile-panel');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', () => {
      const aberto = mobilePanel.classList.toggle('mobile-open');
      navToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    // fecha ao clicar em um item do menu mobile
    mobilePanel.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        mobilePanel.classList.remove('mobile-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ========== SMOOTH SCROLL PARA LINKS INTERNOS ========== */
  const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  internalLinks.forEach(link => {
    link.addEventListener('click', evt => {
      const alvoId = link.getAttribute('href');
      const destino = document.querySelector(alvoId);
      if (destino) {
        evt.preventDefault();
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', alvoId);
      }
    });
  });

  /* ========== SCROLLSPY (LINK ATIVO NA NAV) ========== */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a, .mobile-panel a');

  function setActiveById(hash) {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === hash;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if (sections.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          setActiveById(id);
        }
      });
    }, { threshold: 0.6 });

    sections.forEach(sec => spyObserver.observe(sec));

    // fallback inicial
    setActiveById('#' + sections[0].id);
  }

  /* ========== SCROLL REVEAL SIMPLES ========== */
  const animaveis = document.querySelectorAll('[data-animate]');
  if (animaveis.length) {
    const obsAnim = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obsAnim.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    animaveis.forEach(el => obsAnim.observe(el));
  }

  /* ======================================================
     GALERIAS DE FOTOS POR IMÓVEL (ARRAY / "JSON")
     ====================================================== */

  const galeriasImoveis = {
    // você pode incluir mais fotos depois, é só adicionar objetos no array
    casa1: [
      { src: 'img/fachadacasarua1.jpg', legenda: 'Fachada principal da casa na 26 de Setembro, Rua 1.' }
      // { src: 'img/fachadacasarua1_interna.jpg', legenda: 'Sala integrada.' },
      // { src: 'img/fachadacasarua1_quintal.jpg', legenda: 'Quintal amplo com possibilidade de área gourmet.' }
    ],
    lote1: [
      { src: 'img/loterua1condominio.jpg', legenda: 'Lote murado pronto para construir na Rua 1.' }
      // mais fotos do lote aqui...
    ],
    chacara1: [
      { src: 'img/cafesemtrocolago.jpg', legenda: 'Vista da chácara na região Café Sem Troco, com espelho d’água.' }
      // mais fotos da chácara aqui...
    ]
  };

  let galeriaAtualId = null;
  let galeriaIndex = 0;

  const modalGaleria = document.getElementById('modal-galeria');
  const modalGaleriaImg = document.getElementById('modal-galeria-imagem');
  const modalGaleriaLeg = document.getElementById('modal-galeria-legenda');
  const modalGaleriaCont = document.getElementById('modal-galeria-contador');
  const modalGaleriaFechar = document.getElementById('modal-galeria-fechar');
  const modalPrev = document.getElementById('modal-galeria-prev');
  const modalNext = document.getElementById('modal-galeria-next');

  function obterGaleria(id, fallbackSrc) {
    if (galeriasImoveis[id] && galeriasImoveis[id].length) {
      return galeriasImoveis[id];
    }
    if (fallbackSrc) {
      return [{ src: fallbackSrc, legenda: '' }];
    }
    return [];
  }

  function renderizarFotoAtual() {
    if (!galeriaAtualId || !modalGaleriaImg) return;

    const galeria = galeriasImoveis[galeriaAtualId];
    if (!galeria || !galeria.length) return;

    const item = galeria[galeriaIndex];
    modalGaleriaImg.src = item.src;
    modalGaleriaImg.alt = item.legenda || 'Foto do imóvel selecionado';

    if (modalGaleriaLeg) {
      modalGaleriaLeg.textContent = item.legenda || '';
    }
    if (modalGaleriaCont) {
      const total = galeria.length;
      modalGaleriaCont.textContent = total > 1
        ? `Foto ${galeriaIndex + 1} de ${total}`
        : 'Foto única do imóvel';
    }

    if (modalPrev && modalNext) {
      const total = galeria.length;
      const showNav = total > 1;
      modalPrev.style.display = showNav ? 'flex' : 'none';
      modalNext.style.display = showNav ? 'flex' : 'none';

      modalPrev.disabled = galeriaIndex === 0;
      modalNext.disabled = galeriaIndex === total - 1;
    }
  }

  function abrirGaleria(id, fallbackSrc) {
    const galeria = obterGaleria(id, fallbackSrc);
    if (!galeria.length || !modalGaleria) return;

    // se não existir ainda no "banco", registramos usando fallback
    if (!galeriasImoveis[id]) {
      galeriasImoveis[id] = galeria;
    }

    galeriaAtualId = id;
    galeriaIndex = 0;

    modalGaleria.classList.add('is-open');
    modalGaleria.setAttribute('aria-hidden', 'false');
    renderizarFotoAtual();
  }

  function fecharGaleria() {
    if (!modalGaleria) return;
    modalGaleria.classList.remove('is-open');
    modalGaleria.setAttribute('aria-hidden', 'true');
    if (modalGaleriaImg) modalGaleriaImg.src = '';
    galeriaAtualId = null;
    galeriaIndex = 0;
  }

  if (modalPrev) {
    modalPrev.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const galeria = galeriasImoveis[galeriaAtualId];
      if (!galeria || galeriaIndex === 0) return;
      galeriaIndex--;
      renderizarFotoAtual();
    });
  }

  if (modalNext) {
    modalNext.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const galeria = galeriasImoveis[galeriaAtualId];
      if (!galeria || galeriaIndex >= galeria.length - 1) return;
      galeriaIndex++;
      renderizarFotoAtual();
    });
  }

  if (modalGaleriaFechar) {
    modalGaleriaFechar.addEventListener('click', (ev) => {
      ev.stopPropagation();
      fecharGaleria();
    });
  }

  if (modalGaleria) {
    modalGaleria.addEventListener('click', (event) => {
      if (event.target === modalGaleria) {
        fecharGaleria();
      }
    });
  }

  // navegação por teclado (Esc, setas)
  document.addEventListener('keydown', (ev) => {
    if (!modalGaleria || !modalGaleria.classList.contains('is-open')) return;

    if (ev.key === 'Escape') {
      fecharGaleria();
    } else if (ev.key === 'ArrowLeft') {
      if (modalPrev && !modalPrev.disabled) modalPrev.click();
    } else if (ev.key === 'ArrowRight') {
      if (modalNext && !modalNext.disabled) modalNext.click();
    }
  });

  /* ========== FLIP DOS CARDS (mantido) ========== */

  const cardsImovel = document.querySelectorAll('.imovel-card');
  const botoesFotos = document.querySelectorAll('.imovel-btn-fotos');

  cardsImovel.forEach(card => {
    card.addEventListener('click', function (event) {
      const target = event.target;
      if (target.closest('.imovel-btn-whatsapp') || target.closest('.imovel-btn-fotos')) {
        return;
      }
      card.classList.toggle('is-flipped');
    });
  });

  // abre galeria ao clicar no botão
  botoesFotos.forEach(botao => {
    botao.addEventListener('click', function (event) {
      event.stopPropagation();
      const idGaleria = botao.getAttribute('data-galeria');
      const fallbackSrc = botao.getAttribute('data-img') || '';
      if (idGaleria) {
        abrirGaleria(idGaleria, fallbackSrc);
      }
    });
  });

  /* ========== FILTRO DE IMÓVEIS ========== */

  const filtroBtn = document.getElementById('btn-aplicar-filtros');
  const filtroLimpar = document.getElementById('btn-limpar-filtros');
  const filtroFinalidade = document.getElementById('finalidade');
  const filtroTipo = document.getElementById('tipo-imovel');
  const filtroRegiao = document.getElementById('regiao');
  const filtroMin = document.getElementById('valor-min');
  const filtroMax = document.getElementById('valor-max');

  if (filtroBtn && cardsImovel.length) {
    filtroBtn.addEventListener('click', () => {
      const fin = filtroFinalidade ? filtroFinalidade.value : '';
      const tipo = filtroTipo ? filtroTipo.value : '';
      const reg = filtroRegiao ? filtroRegiao.value : '';
      const vMin = filtroMin && filtroMin.value ? Number(filtroMin.value) : 0;
      const vMax = filtroMax && filtroMax.value ? Number(filtroMax.value) : Infinity;

      cardsImovel.forEach(card => {
        const cFin = card.dataset.finalidade || '';
        const cTipo = card.dataset.tipo || '';
        const cReg = card.dataset.regiao || '';
        const cPreco = Number(card.dataset.preco || 0);

        const atende =
          (!fin || cFin === fin) &&
          (!tipo || cTipo === tipo) &&
          (!reg || cReg === reg) &&
          (cPreco >= vMin) &&
          (cPreco <= vMax);

        card.style.display = atende ? '' : 'none';
      });
    });
  }

  if (filtroLimpar && cardsImovel.length) {
    filtroLimpar.addEventListener('click', () => {
      cardsImovel.forEach(card => {
        card.style.display = '';
      });
    });
  }

  /* ========== CONTADORES ANIMADOS ========== */

  const indicadores = document.querySelectorAll('.indicador-numero');

  if (indicadores.length) {
    const obsIndic = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.dataset.done) return;

          const alvo = Number(el.dataset.target || 0);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '+';
          let atual = 0;
          const dur = 1200;
          const inicio = performance.now();

          function anima(t) {
            const progresso = Math.min((t - inicio) / dur, 1);
            atual = Math.floor(alvo * progresso);
            el.textContent = `${prefix}${atual}${suffix}`;
            if (progresso < 1) {
              requestAnimationFrame(anima);
            } else {
              el.dataset.done = '1';
            }
          }

          requestAnimationFrame(anima);
          obsIndic.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    indicadores.forEach(el => obsIndic.observe(el));
  }

  /* ========== FORMULÁRIO DE CADASTRO – FEEDBACK SIMPLES ========== */

  const formCadastro = document.getElementById('form-cadastro-interesse');

  if (formCadastro) {
    formCadastro.addEventListener('submit', (evt) => {
      evt.preventDefault();

      const tipoDemanda = formCadastro.querySelector('#tipo-demanda');
      const telefone = formCadastro.querySelector('#telefone');
      const email = formCadastro.querySelector('#email');

      const temContato = (telefone && telefone.value.trim()) || (email && email.value.trim());

      if (!tipoDemanda.value || !temContato) {
        alert('Por favor, informe o que você deseja (comprar, vender ou avaliar) e um telefone ou e-mail para contato.');
        return;
      }

      alert('Recebemos seu interesse. Em breve a R Lacerda Imóveis entra em contato para dar sequência na negociação.');
      formCadastro.reset();
    });
  }

});