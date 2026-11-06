/**
 * Girginler Sürücü Kursu - Core Application Logic
 * UI/UX Pro Max Architecture
 * Color Palette: Pure Black background with Yellow (#facc15), Green (#22c55e), Red (#ef4444)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Hero Scene
  let scene3D = null;
  const canvasContainer = document.getElementById('hero-canvas-container');
  if (canvasContainer && typeof DrivingSchool3DScene !== 'undefined') {
    scene3D = new DrivingSchool3DScene('hero-canvas-container');
  }

  // 2. Setup 3D Card Interactive Controls
  setup3DControls(scene3D);

  // 3. Card Personalization Live Studio
  setupCardCustomizer(scene3D);

  // 4. Cost & Installment Calculator
  setupCostCalculator();

  // 5. License Eligibility Wizard
  setupEligibilityWizard();

  // 6. License Categories Tab Filters
  setupCategoryTabs();

  // 7. FAQ Accordion
  setupFAQ();

  // 8. Pre-Registration Modal & Confetti
  setupRegistrationModal();

  // 9. Mobile Navigation
  setupMobileNav();

  // 10. Sticky Header on Scroll
  setupStickyHeader();
});

/* ==========================================================
   1. 3D HERO CONTROLS
   ========================================================== */
function setup3DControls(scene3D) {
  if (!scene3D) return;

  const btnFlip = document.getElementById('btn-flip-card');
  const btnOrbit = document.getElementById('btn-toggle-orbit');
  const orbitSpeedSlider = document.getElementById('orbit-speed-slider');
  const activeSideBadge = document.getElementById('card-side-badge');

  if (btnFlip) {
    btnFlip.addEventListener('click', (e) => {
      e.stopPropagation();
      scene3D.flipCard();
    });
  }

  window.addEventListener('cardFlipped', (e) => {
    if (activeSideBadge) {
      activeSideBadge.textContent = e.detail.isFlipped ? 'Arka Yüz (Sınıflar & Kodlar)' : 'Ön Yüz (Kimlik & B Sınıfı)';
    }
  });

  if (btnOrbit) {
    btnOrbit.addEventListener('click', () => {
      const isPaused = scene3D.toggleOrbit();
      btnOrbit.innerHTML = isPaused 
        ? '<i class="fas fa-play text-green-400"></i> Devam Et' 
        : '<i class="fas fa-pause text-yellow-400"></i> Duraklat';
    });
  }

  if (orbitSpeedSlider) {
    orbitSpeedSlider.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      scene3D.setOrbitSpeed(speed);
    });
  }
}

/* ==========================================================
   2. CARD PERSONALIZATION STUDIO
   ========================================================== */
function setupCardCustomizer(scene3D) {
  if (!scene3D) return;

  const inputName = document.getElementById('custom-name');
  const inputSurname = document.getElementById('custom-surname');
  const selectClass = document.getElementById('custom-class');
  const btnApply = document.getElementById('btn-apply-custom');

  function updateCard() {
    const name = (inputName?.value || 'ÖMER FARUK').toUpperCase();
    const surname = (inputSurname?.value || 'GİRGİN').toUpperCase();
    const lClass = selectClass?.value || 'B';

    scene3D.setCandidateData({
      name: name,
      surname: surname,
      licenseClass: lClass
    });
  }

  if (inputName) inputName.addEventListener('input', updateCard);
  if (inputSurname) inputSurname.addEventListener('input', updateCard);
  if (selectClass) selectClass.addEventListener('change', updateCard);
  if (btnApply) {
    btnApply.addEventListener('click', (e) => {
      e.preventDefault();
      updateCard();
      showToast('T.C. Ehliyet Kartınız 3D Sahneye Başarıyla Güncellendi!');
    });
  }
}

/* ==========================================================
   3. EHLİYET MASRAF & FİYAT HESAPLAYICI (COST CALCULATOR)
   ========================================================== */
function setupCostCalculator() {
  const classSelect = document.getElementById('calc-class');
  const experienceSelect = document.getElementById('calc-exp');
  const installmentSelect = document.getElementById('calc-installment');

  const elCoursePrice = document.getElementById('price-course');
  const elTheoryFee = document.getElementById('price-theory');
  const elDrivingFee = document.getElementById('price-driving');
  const elGovernmentFee = document.getElementById('price-government');
  const elTotalPrice = document.getElementById('price-total');
  const elMonthlyPrice = document.getElementById('price-monthly');
  const elInstallmentLabel = document.getElementById('installment-label');

  const priceData = {
    'B-MANUAL': { name: 'B Sınıfı (Manuel)', course: 14500, gov: 5165, theory: 750, driving: 1250 },
    'B-AUTO':   { name: 'B Sınıfı (Otomatik)', course: 14500, gov: 5165, theory: 750, driving: 1250 },
    'A2':       { name: 'A2 Sınıfı Motosiklet', course: 11000, gov: 2525, theory: 750, driving: 1250 },
    'A':        { name: 'A Sınıfı Ağır Motor', course: 13500, gov: 2525, theory: 750, driving: 1250 },
    'C':        { name: 'C Sınıfı Kamyon', course: 18500, gov: 7800, theory: 0, driving: 1400 },
    'CE':       { name: 'CE Sınıfı Tır / Çekici', course: 16000, gov: 7800, theory: 0, driving: 1400 },
    'D':        { name: 'D Sınıfı Otobüs', course: 17500, gov: 7800, theory: 0, driving: 1400 },
    'G':        { name: 'G Sınıfı Forklift / İş Makinesi', course: 12500, gov: 3200, theory: 600, driving: 1000 }
  };

  function calculate() {
    if (!classSelect) return;
    const key = classSelect.value;
    const hasExp = experienceSelect ? experienceSelect.value === 'yes' : false;
    const installments = installmentSelect ? parseInt(installmentSelect.value) : 1;

    const data = priceData[key] || priceData['B-MANUAL'];

    let course = data.course;
    let theory = data.theory;
    let driving = data.driving;
    let gov = data.gov;

    if (hasExp && (key.startsWith('A') || key.startsWith('B'))) {
      theory = 0;
      course = Math.round(course * 0.9);
    }

    const total = course + theory + driving + gov;
    const monthly = Math.round(total / installments);

    if (elCoursePrice) elCoursePrice.textContent = course.toLocaleString('tr-TR') + ' ₺';
    if (elTheoryFee) elTheoryFee.textContent = (theory > 0 ? theory.toLocaleString('tr-TR') + ' ₺' : 'Muaf (0 ₺)');
    if (elDrivingFee) elDrivingFee.textContent = driving.toLocaleString('tr-TR') + ' ₺';
    if (elGovernmentFee) elGovernmentFee.textContent = gov.toLocaleString('tr-TR') + ' ₺';
    if (elTotalPrice) elTotalPrice.textContent = total.toLocaleString('tr-TR') + ' ₺';
    if (elMonthlyPrice) elMonthlyPrice.textContent = monthly.toLocaleString('tr-TR') + ' ₺';
    if (elInstallmentLabel) elInstallmentLabel.textContent = `${installments} Taksit / Aylık:`;
  }

  if (classSelect) classSelect.addEventListener('change', calculate);
  if (experienceSelect) experienceSelect.addEventListener('change', calculate);
  if (installmentSelect) installmentSelect.addEventListener('change', calculate);

  calculate();
}

/* ==========================================================
   4. EHLİYET UYGUNLUK SİHİRBAZI (WIZARD)
   ========================================================== */
function setupEligibilityWizard() {
  const ageInput = document.getElementById('wiz-age');
  const vehicleType = document.getElementById('wiz-type');
  const btnCheck = document.getElementById('btn-wiz-check');
  const resultBox = document.getElementById('wiz-result');

  if (!btnCheck || !resultBox) return;

  btnCheck.addEventListener('click', () => {
    const age = parseInt(ageInput?.value || 18);
    const type = vehicleType?.value || 'car';

    let resultHtml = '';

    if (type === 'moto_light') {
      if (age >= 16) {
        resultHtml = `
          <div class="p-4 rounded-xl bg-green-950/50 border border-green-500/50 text-green-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i> Tebrikler! A1 Sınıfı için Uygunluk Sağlandı.</h5>
            <p class="text-xs mt-1 text-slate-300">16 yaşını doldurduğunuz için 125 cc motosikletleri kullanabilirsiniz. Girginler Sürücü Kursu'nda hemen kaydınızı başlatabilirsiniz!</p>
          </div>
        `;
      } else {
        resultHtml = `
          <div class="p-4 rounded-xl bg-yellow-950/50 border border-yellow-500/50 text-yellow-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle text-yellow-400"></i> Yaş Şartı Henüz Dolmadı</h5>
            <p class="text-xs mt-1 text-slate-300">A1 sınıfı motosiklet için en az 16 yaşını bitirmiş olmanız gerekmektedir. (${16 - age} yıl sonra başvurabilirsiniz).</p>
          </div>
        `;
      }
    } else if (type === 'car') {
      if (age >= 18) {
        resultHtml = `
          <div class="p-4 rounded-xl bg-green-950/50 border border-green-500/50 text-green-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i> B Sınıfı Otomobil İçin Mükemmel Uygunluk!</h5>
            <p class="text-xs mt-1 text-slate-300">18 yaşını doldurdunuz. Manuel veya Otomatik vites seçeneklerimiz, simülatör eğitimi ve %98.4 ilk sınav başarı garantimizle hemen başlayabilirsiniz.</p>
          </div>
        `;
      } else {
        resultHtml = `
          <div class="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-clock text-red-400"></i> 18 Yaşını Beklemelisiniz</h5>
            <p class="text-xs mt-1 text-slate-300">B sınıfı otomobil ehliyeti için 18 yaşını doldurmuş olmak kanunen zorunludur. Doğum gününüzden 1 ay önce ön kayıt yaptırabilirsiniz.</p>
          </div>
        `;
      }
    } else if (type === 'truck') {
      if (age >= 21) {
        resultHtml = `
          <div class="p-4 rounded-xl bg-green-950/50 border border-green-500/50 text-green-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i> C Sınıfı Kamyon İçin Uygun!</h5>
            <p class="text-xs mt-1 text-slate-300">21 yaş ve üzeri adaylarımız, en az B sınıfı ehliyete sahip olmak koşuluyla C sınıfı Kamyon/Çekici eğitimimize katılabilir.</p>
          </div>
        `;
      } else {
        resultHtml = `
          <div class="p-4 rounded-xl bg-yellow-950/50 border border-yellow-500/50 text-yellow-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-shield-alt text-yellow-400"></i> C Sınıfı İçin 21 Yaş Şartı</h5>
            <p class="text-xs mt-1 text-slate-300">Kamyon (C sınıfı) ehliyeti için 21 yaşını doldurmuş olmanız ve mevcut bir B sınıfı ehliyetinizin bulunması gerekmektedir.</p>
          </div>
        `;
      }
    } else if (type === 'bus') {
      if (age >= 24) {
        resultHtml = `
          <div class="p-4 rounded-xl bg-green-950/50 border border-green-500/50 text-green-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i> D Sınıfı Otobüs İçin Hazırsınız!</h5>
            <p class="text-xs mt-1 text-slate-300">24 yaşını doldurmuş adaylar en az B sınıfı ehliyetle Otobüs (D sınıfı) kursumuza kayıt yaptırabilir.</p>
          </div>
        `;
      } else {
        resultHtml = `
          <div class="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle text-red-400"></i> D Sınıfı İçin 24 Yaş Şartı</h5>
            <p class="text-xs mt-1 text-slate-300">Otobüs (D sınıfı) için mevzuat gereği 24 yaşını doldurmuş olmanız ve en az B sınıfı ehliyet sahibi olmanız şarttır.</p>
          </div>
        `;
      }
    }

    resultBox.innerHTML = resultHtml;
    resultBox.classList.remove('hidden');
  });
}

/* ==========================================================
   5. CATEGORY TABS FILTER
   ========================================================== */
function setupCategoryTabs() {
  const tabButtons = document.querySelectorAll('.category-tab-btn');
  const categoryCards = document.querySelectorAll('.license-card-item');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active', 'bg-yellow-500', 'text-black', 'border-yellow-400');
        b.classList.add('bg-zinc-900', 'text-slate-300', 'border-zinc-800');
      });
      btn.classList.add('active', 'bg-yellow-500', 'text-black', 'border-yellow-400');
      btn.classList.remove('bg-zinc-900', 'text-slate-300', 'border-zinc-800');

      const filter = btn.getAttribute('data-filter');

      categoryCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================
   6. FAQ ACCORDION
   ========================================================== */
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');

        document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

        if (!isOpen) {
          answer.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });
}

/* ==========================================================
   7. PRE-REGISTRATION MODAL & CELEBRATION
   ========================================================== */
function setupRegistrationModal() {
  const modal = document.getElementById('reg-modal');
  const openButtons = document.querySelectorAll('.btn-open-modal');
  const closeButton = document.getElementById('btn-close-modal');
  const regForm = document.getElementById('reg-form');
  const successBox = document.getElementById('reg-success');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.remove('hidden');
    });
  });

  if (closeButton && modal) {
    closeButton.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-fullname')?.value || 'Değerli Aday';
      const phone = document.getElementById('reg-phone')?.value || '';
      const chosenClass = document.getElementById('reg-class')?.value || 'B Sınıfı';

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 90,
          spread: 75,
          colors: ['#facc15', '#22c55e', '#ef4444', '#ffffff'],
          origin: { y: 0.6 }
        });
      }

      regForm.classList.add('hidden');
      if (successBox) {
        successBox.classList.remove('hidden');
        document.getElementById('success-name').textContent = name;
      }

      const waBtn = document.getElementById('btn-success-wa');
      if (waBtn) {
        const msg = encodeURIComponent(`Merhaba Girginler Sürücü Kursu, web sitenizden ön kayıt yaptım. İsmim: ${name}, Telefon: ${phone}, İlgilendiğim Sınıf: ${chosenClass}. Bilgi alabilir miyim?`);
        waBtn.href = `https://wa.me/905059090955?text=${msg}`;
      }
    });
  }
}

/* ==========================================================
   8. MOBILE NAVIGATION
   ========================================================== */
function setupMobileNav() {
  const menuToggle = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

/* ==========================================================
   9. STICKY HEADER
   ========================================================== */
function setupStickyHeader() {
  const navbar = document.getElementById('main-nav');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('py-2.5', 'bg-black/95', 'shadow-2xl');
      navbar.classList.remove('py-4', 'bg-transparent');
    } else {
      navbar.classList.add('py-4', 'bg-transparent');
      navbar.classList.remove('py-2.5', 'bg-black/95', 'shadow-2xl');
    }
  });
}

/* ==========================================================
   TOAST HELPER (YELLOW/GREEN THEMED)
   ========================================================== */
function showToast(message) {
  let toast = document.getElementById('custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-green-600 text-black font-extrabold text-sm shadow-2xl shadow-yellow-500/30 flex items-center gap-3 transition-all transform translate-y-20 opacity-0';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-check-circle text-lg text-black"></i> <span>${message}</span>`;
  toast.classList.remove('translate-y-20', 'opacity-0');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3200);
}
