/**
 * Girginler Sürücü Kursu - 3D Interactive Hero Scene
 * Color Palette: Pure Black background with Yellow (#facc15), Green (#22c55e), Red (#ef4444) tones
 */

class DrivingSchool3DScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cardGroup = null;
    this.vehicles = [];
    this.particles = null;

    // State
    this.isFlipped = false;
    this.targetRotationY = 0;
    this.currentRotationY = 0;
    this.targetTiltX = 0;
    this.targetTiltY = 0;
    this.currentTiltX = 0;
    this.currentTiltY = 0;
    this.orbitPaused = false;
    this.orbitSpeed = 1.0;
    this.time = 0;

    // Card personalization data
    this.candidateData = {
      surname: 'GİRGİN',
      name: 'ÖMER FARUK',
      birth: '15.08.1998 ANKARA',
      issueDate: '12.04.2024',
      expiryDate: '12.04.2034',
      authority: 'SİNCAN / ANKARA',
      docNo: '06-TR-849201',
      licenseClass: 'B'
    };

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 550;
    
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 11.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Setup Yellow, Green, Red Lighting
    this.setupLighting();

    // Create 3D Turkish Driver's License Card
    this.createLicenseCard();

    // Create 3D Orbiting Vehicles (Car, Truck, Bus, Motorcycle)
    this.createVehicles();

    // Floating Tri-color Particles
    this.createParticles();

    // Event Listeners
    this.setupEvents();

    // Start Loop
    this.animate();
  }

  setupLighting() {
    // Soft Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambient);

    // Key Directional Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // 1. Vibrant Yellow / Amber Rim Light
    this.yellowRim = new THREE.PointLight(0xfacc15, 2.5, 22);
    this.yellowRim.position.set(-7, 4, 4);
    this.scene.add(this.yellowRim);

    // 2. Neon Emerald Green Rim Light
    this.greenRim = new THREE.PointLight(0x22c55e, 2.4, 22);
    this.greenRim.position.set(7, -4, 4);
    this.scene.add(this.greenRim);

    // 3. Sport Crimson Red Under/Top Light
    this.redRim = new THREE.PointLight(0xef4444, 2.0, 20);
    this.redRim.position.set(0, 7, -3);
    this.scene.add(this.redRim);

    // Cursor Follow Light for dynamic shimmer
    this.mouseLight = new THREE.PointLight(0xffffff, 1.6, 15);
    this.mouseLight.position.set(0, 0, 6);
    this.scene.add(this.mouseLight);
  }

  /* ==========================================================
     TEXTURE GENERATORS FOR T.C. SÜRÜCÜ BELGESİ
     ========================================================== */
  generateFrontCardCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 646;
    const ctx = canvas.getContext('2d');

    // Base background with subtle warm gold & pale mint security tones
    const grad = ctx.createLinearGradient(0, 0, 1024, 646);
    grad.addColorStop(0, '#fefce8');   // pale yellow
    grad.addColorStop(0.35, '#f0fdf4'); // pale mint green
    grad.addColorStop(0.7, '#fff1f2');  // pale rose red
    grad.addColorStop(1, '#fef9c3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 646);

    // Guilloche Security Wave Pattern
    ctx.save();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.18)'; // Gold wave
    ctx.lineWidth = 1.2;
    for (let i = -100; i < 1100; i += 30) {
      ctx.beginPath();
      for (let y = 0; y < 646; y += 15) {
        const x = i + Math.sin((y + i) * 0.04) * 22;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Secondary Green Guilloche
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.12)';
    for (let i = -80; i < 1100; i += 40) {
      ctx.beginPath();
      for (let y = 0; y < 646; y += 15) {
        const x = i + Math.cos((y + i) * 0.04) * 18;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Security micro-text
    ctx.fillStyle = 'rgba(161, 98, 7, 0.12)';
    ctx.font = 'bold 11px sans-serif';
    for (let y = 80; y < 600; y += 45) {
      ctx.fillText('TURKIYE CUMHURIYETI SURUCU BELGESI DRIVING LICENCE GENC GIRGINLER SURUCU KURSU SINCAN ANKARA', 30, y);
    }
    ctx.restore();

    // Top Header Banner
    // Left: EU/TR Badge in Forest Green & Gold
    ctx.fillStyle = '#15803d';
    this.drawRoundedRect(ctx, 40, 36, 75, 48, 8, true);
    ctx.fillStyle = '#facc15'; // Gold TR text
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TR', 77, 70);

    // Center Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 23px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TÜRKİYE CUMHURİYETİ', 135, 58);
    ctx.fillStyle = '#b45309'; // Warm bronze-gold
    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SÜRÜCÜ BELGESİ / DRIVING LICENCE', 135, 78);

    // Right: Turkish Flag Crescent & Star Emblem (Bold Crimson Red)
    ctx.fillStyle = '#dc2626';
    this.drawRoundedRect(ctx, 915, 34, 68, 48, 8, true);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(944, 58, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(948, 58, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    this.drawStar(ctx, 960, 56, 5, 6, 2.8);

    // Left Column: Candidate Photo Frame
    ctx.fillStyle = '#e2e8f0';
    this.drawRoundedRect(ctx, 42, 110, 210, 270, 12, true);
    
    const photoGrad = ctx.createLinearGradient(42, 110, 252, 380);
    photoGrad.addColorStop(0, '#1c1917');
    photoGrad.addColorStop(0.5, '#292524');
    photoGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = photoGrad;
    this.drawRoundedRect(ctx, 46, 114, 202, 262, 10, true);

    // Candidate Silhouette
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.arc(147, 210, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(147, 330, 80, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Girginler Kursu Holographic Seal over photo (Emerald Green)
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(147, 245, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.95)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ GİRGİNLER SÜRÜCÜ KURSU ★', 147, 248);
    ctx.restore();

    // Security Chip / Hologram (under photo in Solid Metallic Gold)
    const chipGrad = ctx.createLinearGradient(44, 410, 140, 480);
    chipGrad.addColorStop(0, '#fef08a');
    chipGrad.addColorStop(0.3, '#facc15');
    chipGrad.addColorStop(0.7, '#eab308');
    chipGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = chipGrad;
    this.drawRoundedRect(ctx, 45, 410, 95, 75, 8, true);
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 420, 65, 55);
    ctx.beginPath();
    ctx.moveTo(45, 435); ctx.lineTo(60, 435);
    ctx.moveTo(45, 460); ctx.lineTo(60, 460);
    ctx.moveTo(125, 435); ctx.lineTo(140, 435);
    ctx.moveTo(125, 460); ctx.lineTo(140, 460);
    ctx.moveTo(92, 410); ctx.lineTo(92, 420);
    ctx.moveTo(92, 475); ctx.lineTo(92, 485);
    ctx.stroke();

    // MEB Hologram Emblem in Emerald Green & Red accents
    const holoGrad = ctx.createLinearGradient(160, 410, 245, 485);
    holoGrad.addColorStop(0, '#15803d');
    holoGrad.addColorStop(0.5, '#16a34a');
    holoGrad.addColorStop(1, '#dc2626');
    ctx.fillStyle = holoGrad;
    this.drawRoundedRect(ctx, 155, 410, 90, 75, 8, true);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MEB ONAYLI', 200, 442);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('GİRGİNLER', 200, 460);

    // Personal Details Fields
    ctx.textAlign = 'left';
    const fields = [
      { label: '1. Soyadı / Surname', val: this.candidateData.surname, isMain: true },
      { label: '2. Adı / Given name', val: this.candidateData.name, isMain: true },
      { label: '3. Doğum tarihi ve yeri / Date and place of birth', val: this.candidateData.birth },
      { label: '4a. Veriliş tarihi / Date of issue', val: this.candidateData.issueDate, inline: true },
      { label: '4b. Geçerlilik / Expiry', val: this.candidateData.expiryDate, inlineRight: true },
      { label: '4c. Veren makam / Authority', val: this.candidateData.authority },
      { label: '5. Belge no / Licence No', val: this.candidateData.docNo, isCode: true }
    ];

    let currentY = 125;
    fields.forEach((f) => {
      ctx.fillStyle = '#16a34a'; // Green labels
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      
      if (f.inlineRight) {
        ctx.fillText(f.label, 580, currentY - 38);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(f.val, 580, currentY - 14);
      } else {
        ctx.fillText(f.label, 285, currentY);
        ctx.fillStyle = '#0f172a';
        ctx.font = f.isMain ? '800 23px "Plus Jakarta Sans", sans-serif' : 'bold 17px "Plus Jakarta Sans", sans-serif';
        if (f.isCode) ctx.font = 'bold 20px "Space Grotesk", monospace';
        ctx.fillText(f.val, 285, currentY + 24);
        currentY += 46;
      }
    });

    // 7. Signature area
    ctx.fillStyle = '#16a34a';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('7. İmza / Signature', 285, 435);
    ctx.fillStyle = '#1c1917';
    ctx.font = 'italic 26px "Brush Script MT", "Caveat", cursive';
    ctx.fillText(this.candidateData.name + ' ' + this.candidateData.surname, 290, 470);

    // 9. License Class Badge (Signal Red & Gold Accent)
    ctx.fillStyle = '#dc2626';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('9. Sınıf / Category', 760, 420);

    ctx.fillStyle = '#dc2626';
    this.drawRoundedRect(ctx, 760, 430, 220, 68, 14, true);
    ctx.fillStyle = '#fef08a'; // Gold Text
    ctx.font = '800 32px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SINIF: ' + this.candidateData.licenseClass, 870, 476);

    // Bottom Bar (Official Tri-color strip)
    ctx.fillStyle = '#15803d'; // Green Bar
    this.drawRoundedRect(ctx, 35, 545, 954, 70, 10, true);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ÖZEL GENÇ GİRGİNLER MOTORLU TAŞIT SÜRÜCÜLERİ KURSU', 55, 575);
    ctx.fillStyle = '#fef08a';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Sincan / ANKARA • Tel: (0312) 270 42 62 • MEB Ruhsat No: 06-9842', 55, 598);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 16px "Space Grotesk", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('★ %98 BAŞARI ORANI ★', 965, 587);

    return canvas;
  }

  generateBackCardCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 646;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 646);

    // Magnetic Strip (Dark Charcoal)
    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 25, 1024, 60);

    // Category Grid Table Header
    const tableX = 35;
    const tableY = 105;
    const tableW = 954;
    const tableH = 390;

    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(tableX, tableY, tableW, tableH);
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tableX, tableY, tableW, tableH);

    const categories = [
      { code: 'AM', desc: 'Moped', has: false },
      { code: 'A1', desc: 'Motosiklet ≤125cc', has: false },
      { code: 'A2', desc: 'Motosiklet ≤35kW', has: this.candidateData.licenseClass.includes('A') },
      { code: 'A',  desc: 'Ağır Motosiklet', has: this.candidateData.licenseClass === 'A' },
      { code: 'B1', desc: '4 Tekerlekli Hafif', has: false },
      { code: 'B',  desc: 'Otomobil & Kamyonet', has: this.candidateData.licenseClass.includes('B') || this.candidateData.licenseClass === 'CE' },
      { code: 'BE', desc: 'Römorklu Otomobil', has: false },
      { code: 'C1', desc: 'Hafif Kamyon', has: this.candidateData.licenseClass.includes('C') },
      { code: 'C',  desc: 'Kamyon & Çekici', has: this.candidateData.licenseClass.includes('C') },
      { code: 'CE', desc: 'Tır (Römorklu Kamyon)', has: this.candidateData.licenseClass === 'CE' },
      { code: 'D1', desc: 'Minibüs', has: this.candidateData.licenseClass.includes('D') },
      { code: 'D',  desc: 'Otobüs', has: this.candidateData.licenseClass.includes('D') },
      { code: 'F',  desc: 'Traktör', has: false },
      { code: 'G',  desc: 'İş Makinaları', has: this.candidateData.licenseClass === 'G' }
    ];

    // Table Header Row in Racing Red
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(tableX, tableY, tableW, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9. Sınıf', tableX + 15, tableY + 23);
    ctx.fillText('Araç Tipi / Tanım', tableX + 85, tableY + 23);
    ctx.fillText('10. İlk Veriliş', tableX + 310, tableY + 23);
    ctx.fillText('11. Geçerlilik', tableX + 440, tableY + 23);
    ctx.fillText('12. Kısıtlamalar / Kodlar', tableX + 580, tableY + 23);
    ctx.fillText('Yetkili Eğitim Kurumu', tableX + 760, tableY + 23);

    let rowY = tableY + 36;
    const rowH = 25;

    categories.forEach((cat, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f4f4f5';
      if (cat.has) {
        ctx.fillStyle = '#dcfce7'; // Highlighted authorized category in light green!
      }
      ctx.fillRect(tableX, rowY, tableW, rowH);

      ctx.strokeStyle = '#e4e4e7';
      ctx.strokeRect(tableX, rowY, tableW, rowH);

      ctx.fillStyle = cat.has ? '#15803d' : '#27272a';
      ctx.font = cat.has ? 'bold 13px "Plus Jakarta Sans", sans-serif' : '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cat.code, tableX + 18, rowY + 17);
      
      ctx.fillStyle = '#71717a';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cat.desc, tableX + 85, rowY + 17);

      if (cat.has) {
        ctx.fillStyle = '#09090b';
        ctx.font = 'bold 11px "Space Grotesk", monospace';
        ctx.fillText(this.candidateData.issueDate, tableX + 310, rowY + 17);
        ctx.fillText(this.candidateData.expiryDate, tableX + 440, rowY + 17);
        ctx.fillText('01.01, 102 (GİRGİNLER)', tableX + 580, rowY + 17);
        
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✓ GİRGİNLER MEB ONAYLI', tableX + 760, rowY + 17);
      }

      rowY += rowH;
    });

    // Barcode
    ctx.fillStyle = '#09090b';
    for (let x = 40; x < 600; x += 5) {
      const barW = (x % 3 === 0) ? 3 : (x % 2 === 0 ? 1.5 : 2);
      ctx.fillRect(x, 520, barW, 45);
    }
    ctx.font = 'bold 11px "Space Grotesk", monospace';
    ctx.fillText('TR06-GIRGINLER-SURUCU-KURSU-SINCAN-2024-MEB-APPROVED', 40, 585);

    // Official Stamp in Red
    ctx.save();
    ctx.translate(850, 560);
    ctx.rotate(-0.1);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(-80, -35, 160, 60);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ÖZEL GENÇ GİRGİNLER', 0, -12);
    ctx.fillText('SÜRÜCÜ KURSU MÜDÜRLÜĞÜ', 0, 8);
    ctx.font = '9px sans-serif';
    ctx.fillText('ANKARA / SİNCAN', 0, 22);
    ctx.restore();

    return canvas;
  }

  drawRoundedRect(ctx, x, y, width, height, radius, fill) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  /* ==========================================================
     3D MESH BUILDERS
     ========================================================== */
  createLicenseCard() {
    this.cardGroup = new THREE.Group();

    const cardWidth = 5.6;
    const cardHeight = 3.54;
    const cardDepth = 0.08;

    const frontCanvas = this.generateFrontCardCanvas();
    const backCanvas = this.generateBackCardCanvas();

    this.frontTexture = new THREE.CanvasTexture(frontCanvas);
    this.backTexture = new THREE.CanvasTexture(backCanvas);
    this.frontTexture.anisotropy = 16;
    this.backTexture.anisotropy = 16;

    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: this.frontTexture,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: this.backTexture,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.5
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // Gold Edge
      roughness: 0.3,
      metalness: 0.6
    });

    const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth, 4, 4, 1);
    const materials = [
      edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial,
      frontMaterial, backMaterial
    ];

    this.cardMesh = new THREE.Mesh(geometry, materials);
    this.cardMesh.castShadow = true;
    this.cardMesh.receiveShadow = true;

    // Glowing rim in Yellow/Green
    const rimGeom = new THREE.BoxGeometry(cardWidth + 0.06, cardHeight + 0.06, cardDepth + 0.02);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);

    this.cardGroup.add(this.cardMesh);
    this.cardGroup.add(rimMesh);
    this.scene.add(this.cardGroup);
  }

  updateCardTextures() {
    const frontCanvas = this.generateFrontCardCanvas();
    const backCanvas = this.generateBackCardCanvas();

    this.frontTexture.image = frontCanvas;
    this.frontTexture.needsUpdate = true;

    this.backTexture.image = backCanvas;
    this.backTexture.needsUpdate = true;
  }

  /* ==========================================================
     3D ORBITING VEHICLES (YELLOW, GREEN, RED STYLED)
     ========================================================== */
  createVehicles() {
    // 1. CAR (B Sınıfı - Emerald Green Metallic)
    const car = this.buildStylizedCar();
    this.vehicles.push({
      mesh: car,
      radius: 4.6,
      speed: 0.85,
      angle: 0.2,
      bobOffset: 0,
      bobSpeed: 2.2,
      name: 'Otomobil (B Sınıfı)',
      classKey: 'B'
    });
    this.scene.add(car);

    // 2. TRUCK (C/CE Sınıfı - Signal Racing Yellow)
    const truck = this.buildStylizedTruck();
    this.vehicles.push({
      mesh: truck,
      radius: 5.7,
      speed: -0.65,
      angle: Math.PI * 0.75,
      bobOffset: 1.5,
      bobSpeed: 1.8,
      name: 'Kamyon & Tır (C/CE Sınıfı)',
      classKey: 'C'
    });
    this.scene.add(truck);

    // 3. BUS (D Sınıfı - Deep Forest Green & Yellow LED)
    const bus = this.buildStylizedBus();
    this.vehicles.push({
      mesh: bus,
      radius: 5.1,
      speed: 0.72,
      angle: Math.PI * 1.45,
      bobOffset: 2.8,
      bobSpeed: 2.0,
      name: 'Otobüs (D Sınıfı)',
      classKey: 'D'
    });
    this.scene.add(bus);

    // 4. MOTORCYCLE (A Sınıfı - Sport Crimson Red)
    const moto = this.buildStylizedMotorcycle();
    this.vehicles.push({
      mesh: moto,
      radius: 3.7,
      speed: -1.05,
      angle: Math.PI * 1.9,
      bobOffset: 4.1,
      bobSpeed: 2.8,
      name: 'Motosiklet (A Sınıfı)',
      classKey: 'A'
    });
    this.scene.add(moto);
  }

  // --- 3D Car (Emerald Green + Yellow Headlights + Red Taillights) ---
  buildStylizedCar() {
    const car = new THREE.Group();

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x16a34a, // Emerald Green
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 0.9,
      reflectivity: 0.9
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9
    });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 }); // Gold Rims!
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow Headlights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });  // Red Taillights

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 0.76), bodyMat);
    lowerBody.castShadow = true;
    car.add(lowerBody);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.36, 0.68), glassMat);
    cabin.position.set(-0.06, 0.36, 0);
    cabin.castShadow = true;
    car.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.65), bodyMat);
    roof.position.set(-0.06, 0.56, 0);
    car.add(roof);

    const wheelPositions = [
      { x: 0.45, z: 0.4 }, { x: 0.45, z: -0.4 },
      { x: -0.45, z: 0.4 }, { x: -0.45, z: -0.4 }
    ];
    wheelPositions.forEach(pos => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16), tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(pos.x, -0.16, pos.z);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.13, 8), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(pos.x, -0.16, pos.z);

      car.add(tire);
      car.add(rim);
    });

    // Yellow Headlights
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.16), lightMat);
    headL.position.set(0.74, 0.05, 0.24);
    const headR = headL.clone();
    headR.position.set(0.74, 0.05, -0.24);
    car.add(headL);
    car.add(headR);

    // Red Taillights
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.16), tailMat);
    tailL.position.set(-0.74, 0.08, 0.24);
    const tailR = tailL.clone();
    tailR.position.set(-0.74, 0.08, -0.24);
    car.add(tailL);
    car.add(tailR);

    // Green Underglow
    const underglow = new THREE.PointLight(0x22c55e, 1.4, 2.5);
    underglow.position.set(0, -0.3, 0);
    car.add(underglow);

    car.scale.set(0.85, 0.85, 0.85);
    return car;
  }

  // --- 3D Heavy Truck (Signal Racing Yellow + Red Container + Gold Grill) ---
  buildStylizedTruck() {
    const truck = new THREE.Group();

    const cabMat = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.7 }); // Racing Yellow
    const cargoMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 }); // Carbon container
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: 0.1, transparent: true, opacity: 0.85 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.8), cabMat);
    cab.position.set(0.85, 0.22, 0);
    cab.castShadow = true;
    truck.add(cab);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.72), glassMat);
    windshield.position.set(1.27, 0.42, 0);
    truck.add(windshield);

    const grill = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.6), chromeMat);
    grill.position.set(1.28, -0.05, 0);
    truck.add(grill);

    const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.05, 0.86), cargoMat);
    cargo.position.set(-0.45, 0.28, 0);
    cargo.castShadow = true;
    truck.add(cargo);

    // Red Racing Stripe on Container
    const badgeGeom = new THREE.BoxGeometry(1.4, 0.3, 0.88);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const badge = new THREE.Mesh(badgeGeom, badgeMat);
    badge.position.set(-0.45, 0.35, 0);
    truck.add(badge);

    const wheelPositions = [
      { x: 0.85, z: 0.44 }, { x: 0.85, z: -0.44 },
      { x: -0.15, z: 0.44 }, { x: -0.15, z: -0.44 },
      { x: -0.85, z: 0.44 }, { x: -0.85, z: -0.44 }
    ];
    wheelPositions.forEach(p => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16), tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(p.x, -0.28, p.z);
      truck.add(tire);
    });

    // Amber roof lights
    for (let z = -0.25; z <= 0.25; z += 0.25) {
      const roofLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.08), lightMat);
      roofLight.position.set(1.2, 0.72, z);
      truck.add(roofLight);
    }

    // Yellow Underglow
    const underglow = new THREE.PointLight(0xfacc15, 1.4, 2.5);
    underglow.position.set(0, -0.4, 0);
    truck.add(underglow);

    truck.scale.set(0.72, 0.72, 0.72);
    return truck;
  }

  // --- 3D City/Coach Bus (Racing Green + Yellow Sign + Red Taillights) ---
  buildStylizedBus() {
    const bus = new THREE.Group();

    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x15803d, roughness: 0.25, metalness: 0.7 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: 0.1, transparent: true, opacity: 0.88 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const roofAcMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Yellow AC unit
    const signMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow LED sign

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.86, 0.76), bodyMat);
    body.position.set(0, 0.2, 0);
    body.castShadow = true;
    bus.add(body);

    const glassStripe = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.36, 0.78), glassMat);
    glassStripe.position.set(-0.06, 0.32, 0);
    bus.add(glassStripe);

    const frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.72), glassMat);
    frontWindshield.position.set(1.12, 0.25, 0);
    bus.add(frontWindshield);

    const destSign = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.55), signMat);
    destSign.position.set(1.13, 0.52, 0);
    bus.add(destSign);

    const roofAc = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.45), roofAcMat);
    roofAc.position.set(-0.2, 0.68, 0);
    bus.add(roofAc);

    const wheelPositions = [
      { x: 0.75, z: 0.4 }, { x: 0.75, z: -0.4 },
      { x: -0.75, z: 0.4 }, { x: -0.75, z: -0.4 }
    ];
    wheelPositions.forEach(p => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16), tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(p.x, -0.24, p.z);
      bus.add(tire);
    });

    const underglow = new THREE.PointLight(0x22c55e, 1.4, 2.5);
    underglow.position.set(0, -0.4, 0);
    bus.add(underglow);

    bus.scale.set(0.72, 0.72, 0.72);
    return bus;
  }

  // --- 3D Sport Motorcycle (Crimson Red + Gold Detail + Red Underglow) ---
  buildStylizedMotorcycle() {
    const moto = new THREE.Group();

    const redMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.7 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.9, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const frontWheel = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.08, 8, 20), tireMat);
    frontWheel.position.set(0.65, -0.15, 0);
    moto.add(frontWheel);

    const rearWheel = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.09, 8, 20), tireMat);
    rearWheel.position.set(-0.65, -0.15, 0);
    moto.add(rearWheel);

    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.32), redMat);
    tank.position.set(0.1, 0.22, 0);
    tank.castShadow = true;
    moto.add(tank);

    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.25), goldMat);
    engine.position.set(0.0, -0.05, 0);
    moto.add(engine);

    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), frameMat);
    fork.rotation.z = -0.3;
    fork.position.set(0.48, 0.22, 0);
    moto.add(fork);

    const handlebars = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.65), frameMat);
    handlebars.position.set(0.4, 0.5, 0);
    moto.add(handlebars);

    const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), lightMat);
    headlight.rotation.z = Math.PI / 2;
    headlight.position.set(0.58, 0.4, 0);
    moto.add(headlight);

    const underglow = new THREE.PointLight(0xef4444, 1.4, 2.0);
    underglow.position.set(0, -0.3, 0);
    moto.add(underglow);

    moto.scale.set(0.85, 0.85, 0.85);
    return moto;
  }

  // --- Background Particles in Yellow, Green, Red & White ---
  createParticles() {
    const count = 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xfacc15), // Yellow
      new THREE.Color(0x22c55e), // Green
      new THREE.Color(0xef4444), // Red
      new THREE.Color(0xffffff)  // Sparkle White
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  /* ==========================================================
     INTERACTIONS & EVENT HANDLERS
     ========================================================= */
  setupEvents() {
    window.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.targetTiltY = x * 0.45;
      this.targetTiltX = -y * 0.35;

      if (this.mouseLight) {
        this.mouseLight.position.x = x * 6;
        this.mouseLight.position.y = y * 5;
      }
    });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);

        this.targetTiltY = x * 0.45;
        this.targetTiltX = -y * 0.35;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    this.container.addEventListener('click', () => {
      this.flipCard();
    });
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    this.targetRotationY = this.isFlipped ? Math.PI : 0;
    
    const event = new CustomEvent('cardFlipped', { detail: { isFlipped: this.isFlipped } });
    window.dispatchEvent(event);
  }

  setCandidateData(newData) {
    this.candidateData = { ...this.candidateData, ...newData };
    this.updateCardTextures();
  }

  toggleOrbit() {
    this.orbitPaused = !this.orbitPaused;
    return this.orbitPaused;
  }

  setOrbitSpeed(speed) {
    this.orbitSpeed = speed;
  }

  /* ==========================================================
     RENDER ANIMATION LOOP
     ========================================================== */
  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = 0.016;
    if (!this.orbitPaused) {
      this.time += delta * this.orbitSpeed;
    }

    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
    this.currentTiltX += (this.targetTiltX - this.currentTiltX) * 0.08;
    this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.08;

    if (this.cardGroup) {
      const cardBob = Math.sin(this.time * 1.5) * 0.12;
      this.cardGroup.position.y = cardBob;

      this.cardGroup.rotation.y = this.currentRotationY + this.currentTiltY;
      this.cardGroup.rotation.x = this.currentTiltX;
      this.cardGroup.rotation.z = -this.currentTiltY * 0.2;
    }

    this.vehicles.forEach((v) => {
      if (!this.orbitPaused) {
        v.angle += v.speed * 0.015 * this.orbitSpeed;
      }

      const currentRadius = v.radius + Math.sin(this.time * 0.8 + v.bobOffset) * 0.25;
      const x = Math.cos(v.angle) * currentRadius;
      const z = Math.sin(v.angle) * currentRadius;
      const y = Math.sin(this.time * v.bobSpeed + v.bobOffset) * 0.45 + (x * 0.15);

      v.mesh.position.set(x, y, z);

      const tangentX = -Math.sin(v.angle) * (v.speed > 0 ? 1 : -1);
      const tangentZ = Math.cos(v.angle) * (v.speed > 0 ? 1 : -1);
      const targetLookAt = new THREE.Vector3(x + tangentX, y, z + tangentZ);
      v.mesh.lookAt(targetLookAt);

      v.mesh.rotation.z += (v.speed > 0 ? -0.15 : 0.15);
    });

    if (this.particles) {
      this.particles.rotation.y = this.time * 0.04;
      this.particles.rotation.x = Math.sin(this.time * 0.02) * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.DrivingSchool3DScene = DrivingSchool3DScene;
