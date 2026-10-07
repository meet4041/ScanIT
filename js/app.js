(() => {
  const form = document.getElementById('qrForm');
  const nameInput = document.getElementById('companyName');
  const urlInput = document.getElementById('websiteUrl');
  const emptyPreview = document.getElementById('emptyPreview');
  const qrResult = document.getElementById('qrResult');
  const qrcode = document.getElementById('qrcode');
  const resultName = document.getElementById('resultName');
  const resultUrl = document.getElementById('resultUrl');
  const toast = document.getElementById('toast');
  let current = null;
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
  const cleanFileName = (name) => {
    const cleaned = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${cleaned || 'website'}-qr-code.png`;
  };
  const generate = (name, url) => {
    qrcode.replaceChildren();
    if (!window.QRCode) { showToast('QR generator is unavailable. Please check your connection.'); return; }
    new QRCode(qrcode, { text: url, width: 184, height: 184, colorDark: '#172b4d', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
    resultName.textContent = name;
    resultUrl.textContent = url;
    resultUrl.href = url;
    current = { name, url };
    emptyPreview.hidden = true;
    qrResult.hidden = false;
    qrResult.focus?.();
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const url = normalizeUrl(urlInput.value);
    setError(nameInput, 'companyError', name ? '' : 'Please enter your business or company name.');
    setError(urlInput, 'urlError', url ? '' : 'Enter a valid website address, such as example.com.');
    if (!name || !url) return;
    urlInput.value = url;
    generate(name, url);
  });
  document.getElementById('copyButton').addEventListener('click', async () => {
    if (!current) return;
    try { await navigator.clipboard.writeText(current.url); showToast('Website link copied.'); }
    catch { showToast('Could not copy automatically — please copy the link above.'); }
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
    qrcode.replaceChildren();
    current = null;
    qrResult.hidden = true;
    emptyPreview.hidden = false;
    setError(nameInput, 'companyError', ''); setError(urlInput, 'urlError', '');
    nameInput.focus();
  });
  [nameInput, urlInput].forEach((input) => input.addEventListener('input', () => { input.classList.remove('invalid'); document.getElementById(input === nameInput ? 'companyError' : 'urlError').textContent = ''; }));
})();
