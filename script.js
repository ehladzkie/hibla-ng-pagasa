document.addEventListener('DOMContentLoaded', () => {
  const save = (type, data) => {
    try {
      const existing = JSON.parse(localStorage.getItem(type) || '[]');
      existing.push(data);
      localStorage.setItem(type, JSON.stringify(existing));
    } catch (e) {}
    fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    }).catch(() => {});
  };

  const burgerBtn = document.getElementById('burger');
  const navMenu = document.getElementById('nav');
  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        navMenu.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('open');
    }
  };

  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal(btn.dataset.open);
    });
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.classList.remove('open');
      }
    });
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  const donateProgSelect = document.getElementById('dprog');
  document.querySelectorAll('.prog[data-prog]').forEach((card) => {
    card.addEventListener('click', () => {
      if (donateProgSelect) {
        donateProgSelect.value = card.dataset.prog;
      }
      openModal('donate');
    });
  });

  const donateAmtInput = document.getElementById('damt');
  const amtButtons = document.querySelectorAll('.amts button');
  amtButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      amtButtons.forEach((b) => b.classList.remove('sel'));
      btn.classList.add('sel');
      if (donateAmtInput) {
        donateAmtInput.value = btn.dataset.a;
      }
    });
  });
  if (donateAmtInput) {
    donateAmtInput.addEventListener('input', () => {
      amtButtons.forEach((b) => {
        b.classList.toggle('sel', b.dataset.a === donateAmtInput.value);
      });
    });
  }

  const donateSubmitBtn = document.getElementById('dgo');
  const donateNameInput = document.getElementById('dname');
  const donateFeedback = document.getElementById('dok');
  if (donateSubmitBtn) {
    donateSubmitBtn.addEventListener('click', () => {
      const amount = Number(donateAmtInput.value);
      if (!amount || amount < 1) {
        donateFeedback.textContent = 'Maglagay ng halaga.';
        return;
      }
      const name = donateNameInput.value.trim();
      const program = donateProgSelect.value;
      save('donations', { a: amount, n: name, p: program });
      donateFeedback.textContent =
        'Salamat' + (name ? ', ' + name : '') + '! ₱' + amount.toLocaleString() + ' para sa ' + program + ' 💚';
    });
  }

  const volunteerSubmitBtn = document.getElementById('vgo');
  const volunteerNameInput = document.getElementById('vname');
  const volunteerEmailInput = document.getElementById('vmail');
  const volunteerProgSelect = document.getElementById('vprog');
  const volunteerFeedback = document.getElementById('vok');
  if (volunteerSubmitBtn) {
    volunteerSubmitBtn.addEventListener('click', () => {
      const name = volunteerNameInput.value.trim();
      const email = volunteerEmailInput.value.trim();
      if (!name || !email) {
        volunteerFeedback.textContent = 'Punan ang pangalan at email.';
        return;
      }
      const program = volunteerProgSelect.value;
      save('volunteers', { n: name, e: email, p: program });
      volunteerFeedback.textContent = 'Maraming salamat, ' + name + '! Kokontakin ka namin.';
    });
  }

  const contactForm = document.getElementById('cform');
  const contactFeedback = document.getElementById('cok');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      save('messages', Object.fromEntries(new FormData(contactForm)));
      contactForm.reset();
      contactFeedback.textContent = 'Naipadala na! Salamat sa pagsulat.';
    });
  }

  const quotes = [
    ['“Dahil sa feeding program, nakakakain na ng tatlong beses ang mga anak ko.”', '— Aling Rosa, Taguig'],
    ['“Nakapasok ulit ako sa school dahil sa education support.”', '— Miguel, 12'],
    ['“Masaya akong maging volunteer. Maliit na tulong, malaking pagbabago.”', '— Ate Liza']
  ];
  let quoteIndex = 0;
  const quoteBlock = document.getElementById('quote');
  const renderQuote = () => {
    if (!quoteBlock) return;
    const textNode = document.createTextNode(quotes[quoteIndex][0]);
    const citeEl = document.createElement('cite');
    citeEl.textContent = quotes[quoteIndex][1];
    quoteBlock.replaceChildren(textNode, citeEl);
    quoteIndex = (quoteIndex + 1) % quotes.length;
  };
  renderQuote();
  setInterval(renderQuote, 5000);

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      const targetVal = Number(entry.target.dataset.n);
      let currentVal = 0;
      const step = targetVal / 50;
      const timer = setInterval(() => {
        currentVal += step;
        if (currentVal >= targetVal) {
          currentVal = targetVal;
          clearInterval(timer);
        }
        entry.target.textContent = Math.round(currentVal).toLocaleString();
      }, 25);
    });
  });

  document.querySelectorAll('[data-n]').forEach((counterEl) => {
    counterObserver.observe(counterEl);
  });
});
