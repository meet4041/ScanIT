(() => {
  const form = document.getElementById('qrForm');
  const nameInput = document.getElementById('companyName');
  const urlInput = document.getElementById('websiteUrl');
  const addressInput = document.getElementById('destinationAddress');
  const websiteField = document.getElementById('websiteField');
  const addressField = document.getElementById('addressField');
  const typeButtons = document.querySelectorAll('.qr-type');
  const emptyPreview = document.getElementById('emptyPreview');
  const qrResult = document.getElementById('qrResult');
  const qrcode = document.getElementById('qrcode');
  const resultName = document.getElementById('resultName');
  const resultUrl = document.getElementById('resultUrl');
  const resultMessage = document.getElementById('resultMessage');
  const toast = document.getElementById('toast');
  let current = null;
  let qrType = 'website';
  let toastTimer;

  const showToast = (message) => { toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600); };
  const setError = (input, id, message) => { input.classList.toggle('invalid', Boolean(message)); document.getElementById(id).textContent = message; };
  const normalizeUrl = (value) => {
    let candidate = value.trim();
    if (!candidate) return null;
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(candidate)) candidate = `https://${candidate}`;
    try {
      const parsed = new URL(candidate);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || !parsed.hostname.includes('.')) return null;
      if (!parsed.hostname.toLowerCase().startsWith('www.')) parsed.hostname = `www.${parsed.hostname}`;
      return parsed.href;
    } catch { return null; }
  };
  const directionsUrl = (address) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const cleanFileName = (name) => {
    const cleaned = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${cleaned || 'destination'}-qr-code.png`;
  };
  const setQrType = (type) => {
    qrType = type;
    const isWebsite = type === 'website';
    websiteField.hidden = !isWebsite;
    addressField.hidden = isWebsite;
    typeButtons.forEach((button) => {
      const active = button.dataset.type === type;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    setError(urlInput, 'urlError', '');
    setError(addressInput, 'addressError', '');
  };
  const generate = (name, url, type) => {
    qrcode.replaceChildren();
    if (!window.QRCode) { showToast('QR generator is unavailable. Please check your connection.'); return; }
    new QRCode(qrcode, { text: url, width: 184, height: 184, colorDark: '#172b4d', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
    resultName.textContent = name;
    resultMessage.textContent = type === 'directions' ? 'Scan to get directions' : 'Scan to visit website';
    resultUrl.textContent = url;
    resultUrl.href = url;
    current = { name, url, type };
    emptyPreview.hidden = true;
    qrResult.hidden = false;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const destination = addressInput.value.trim();
    const url = qrType === 'website' ? normalizeUrl(urlInput.value) : directionsUrl(destination);
    const validDestination = qrType !== 'directions' || destination.length > 3;
    setError(nameInput, 'companyError', name ? '' : 'Please enter your business or company name.');
    setError(urlInput, 'urlError', qrType === 'website' && !url ? 'Enter a valid website address, such as example.com.' : '');
    setError(addressInput, 'addressError', qrType === 'directions' && !validDestination ? 'Enter a destination address.' : '');
    if (!name || !url || !validDestination) return;
    if (qrType === 'website') urlInput.value = url;
    generate(name, url, qrType);
  });

  document.getElementById('copyButton').addEventListener('click', async () => {
    if (!current) return;
    try { await navigator.clipboard.writeText(current.url); showToast(current.type === 'directions' ? 'Directions link copied.' : 'Website link copied.'); }
    catch { showToast('Could not copy automatically.'); }
  });
  document.getElementById('downloadButton').addEventListener('click', () => {
    if (!current) return;
    const canvas = qrcode.querySelector('canvas');
    const image = qrcode.querySelector('img');
    const link = document.createElement('a');
    link.download = cleanFileName(current.name);
    link.href = canvas ? canvas.toDataURL('image/png') : image?.src;
    if (!link.href) { showToast('Your QR code is still preparing. Please try again.'); return; }
    link.click();
    showToast('PNG download started.');
  });
  document.getElementById('resetButton').addEventListener('click', () => {
    form.reset();
    setQrType('website');
    qrcode.replaceChildren();
    current = null;
    qrResult.hidden = true;
    emptyPreview.hidden = false;
    setError(nameInput, 'companyError', '');
    setError(urlInput, 'urlError', '');
    setError(addressInput, 'addressError', '');
    nameInput.focus();
  });
  typeButtons.forEach((button) => button.addEventListener('click', () => setQrType(button.dataset.type)));
  [[nameInput, 'companyError'], [urlInput, 'urlError'], [addressInput, 'addressError']].forEach(([input, errorId]) => input.addEventListener('input', () => { input.classList.remove('invalid'); document.getElementById(errorId).textContent = ''; }));
})();
