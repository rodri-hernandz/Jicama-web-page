/* ============================================
   JICAMA Casa Creativa — Main JS
   Navigation, Reveal animations, Stats counter,
   Portfolio filter, Brief form → WhatsApp, Smooth scroll
   ============================================ */

(function () {
  'use strict';

  // ---- DOM READY ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initNav();
    initReveal();
    initStatsCounter();
    initPortfolioFilter();
    initBriefForm();
    initSmoothScroll();
  }

  // ============ NAVIGATION ============
  function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const links = menu.querySelectorAll('.nav__link');

    // Scroll detection
    function onScroll() {
      if (window.scrollY > 80) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ============ REVEAL ON SCROLL ============
  function initReveal() {
    var reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    // Use IntersectionObserver if available
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      reveals.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show all
      reveals.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  // ============ STATS COUNTER ============
  function initStatsCounter() {
    var statNumbers = document.querySelectorAll('.stat__number[data-target]');
    if (!statNumbers.length) return;

    var counted = false;

    function animateCounters() {
      statNumbers.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 2000;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          // Ease out quad
          var eased = 1 - (1 - progress) * (1 - progress);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(step);
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted) {
            counted = true;
            animateCounters();
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });

      var statsSection = document.querySelector('.stats');
      if (statsSection) observer.observe(statsSection);
    } else {
      animateCounters();
    }
  }

  // ============ PORTFOLIO FILTER ============
  function initPortfolioFilter() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.caso-card');

    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');

        // Active state
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Filter cards
        cards.forEach(function (card) {
          var cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(function () {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(function () {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // ============ BRIEF FORM → WHATSAPP ============
  function initBriefForm() {
    var form = document.getElementById('briefForm');
    var confirm = document.getElementById('briefConfirm');
    var copyBtn = document.getElementById('copyBrief');
    var waLink = document.getElementById('whatsappLink');

    if (!form) return;

    var briefData = {};

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      var required = form.querySelectorAll('[required]');
      var valid = true;

      required.forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#C1633E';
          valid = false;
        }
      });

      // Email validation
      var emailField = document.getElementById('email');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.style.borderColor = '#C1633E';
        valid = false;
      }

      if (!valid) return;

      // Collect data
      briefData = {
        nombre: getValue('nombre'),
        empresa: getValue('empresa'),
        sitio: getValue('sitio'),
        email: getValue('email'),
        telefono: getValue('telefono'),
        servicio: getValue('servicio'),
        presupuesto: getValue('presupuesto'),
        objetivo: getValue('objetivo'),
        inicio: getValue('inicio'),
        mensaje: getValue('mensaje')
      };

      // Build WhatsApp message
      var waMsg = buildWhatsAppMessage(briefData);
      var waUrl = 'https://wa.me/5215512345678?text=' + encodeURIComponent(waMsg);

      waLink.href = waUrl;

      // Show confirmation
      form.style.display = 'none';
      confirm.hidden = false;
      confirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Copy brief
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = buildBriefText(briefData);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'Copiado!';
            setTimeout(function () { copyBtn.textContent = 'Copiar Brief'; }, 2000);
          });
        } else {
          // Fallback
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = 'Copiado!';
          setTimeout(function () { copyBtn.textContent = 'Copiar Brief'; }, 2000);
        }
      });
    }

    function getValue(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    function buildWhatsAppMessage(data) {
      var lines = [
        'Hola JICAMA! Les comparto mi brief:',
        '',
        'Nombre: ' + data.nombre,
        'Empresa: ' + data.empresa
      ];

      if (data.sitio) lines.push('Web/IG: ' + data.sitio);
      lines.push('Email: ' + data.email);
      lines.push('Tel: ' + data.telefono);
      if (data.servicio) lines.push('Servicio: ' + data.servicio);
      if (data.presupuesto) lines.push('Presupuesto: ' + data.presupuesto);
      if (data.objetivo) lines.push('Objetivo: ' + data.objetivo);
      if (data.inicio) lines.push('Inicio: ' + data.inicio);
      if (data.mensaje) lines.push('', 'Mensaje: ' + data.mensaje);

      lines.push('', 'Enviado desde jicama.mx');

      return lines.join('\n');
    }

    function buildBriefText(data) {
      var lines = [
        '=== BRIEF JICAMA ===',
        'Nombre: ' + data.nombre,
        'Empresa: ' + data.empresa,
        'Web/IG: ' + (data.sitio || 'N/A'),
        'Email: ' + data.email,
        'Telefono: ' + data.telefono,
        'Servicio: ' + (data.servicio || 'N/A'),
        'Presupuesto: ' + (data.presupuesto || 'N/A'),
        'Objetivo: ' + (data.objetivo || 'N/A'),
        'Inicio: ' + (data.inicio || 'N/A'),
        'Mensaje: ' + (data.mensaje || 'N/A'),
        '===================='
      ];
      return lines.join('\n');
    }
  }

  // ============ SMOOTH SCROLL ============
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var navHeight = document.getElementById('nav').offsetHeight;
          var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

})();
