// frontend/nfpreview.js

const form = document.getElementById('previewForm');
const submitBtn = document.getElementById('submitBtn'); // may be null, harmless
const messageDiv = document.getElementById('message');
const previewContainer = document.getElementById('previewContainer');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// NEW: replace old previewUrlDiv
const previewToolbar = document.getElementById('previewToolbar');   // wrapper with buttons
const previewUrlText = document.getElementById('previewUrlText');   // shows full URL

let currentPreviewId = null;

function setStatus(status, text) {
  if (!statusIndicator || !statusText) return;
  statusIndicator.className = `status-indicator ${status}`;
  statusText.textContent = text;
}

function showMessage(text, type) {
  if (!messageDiv) return;
  messageDiv.innerHTML = `<div class="${type}-message">${text}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 5000);
}

function showPreview(previewUrl) {
  const fullUrl = window.location.origin + previewUrl;

  previewContainer.innerHTML =
    `<iframe class="preview-frame" src="${previewUrl}" ` +
    `sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals" ` +
    `style="width: 100%; height: 400px; border: none; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);"></iframe>`;

  // UPDATED: use toolbar instead of previewUrlDiv
  if (previewUrlText) {
    previewUrlText.textContent = fullUrl;
  }
  if (previewToolbar) {
    previewToolbar.style.display = 'flex';
  }
}

function copyPreviewLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    showMessage('Preview link copied to clipboard!', 'success');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showMessage('Preview link copied to clipboard!', 'success');
  });
}

function showPlaceholder(text) {
  previewContainer.innerHTML =
    `<div class="preview-placeholder" style="color: #aaa; font-size: 1rem;">${text}</div>`;

  // UPDATED: clear/hide toolbar instead of touching previewUrlDiv
  if (previewUrlText) {
    previewUrlText.textContent = '';
  }
  if (previewToolbar) {
    previewToolbar.style.display = 'none';
  }
}

function validateIP(ip) {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

function validateDomain(domain) {
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

async function fetchPreviewLink(domain, ip, protocol, path) {
  try {
    const response = await fetch('/api/preview-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        ip,
        protocol: protocol || null,
        path: path || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate preview link');
    }

    const data = await response.json();
    return data.previewUrl;
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'error');
    throw error;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const domain = form.domain.value.trim();
  const ip = form.ip.value.trim();
  const protocol = form.protocol ? form.protocol.value.trim() : '';
  const path = form.path ? form.path.value.trim() : '';

  if (!validateDomain(domain)) {
    showMessage('Invalid domain format', 'error');
    return;
  }

  if (!validateIP(ip)) {
    showMessage('Invalid IP address format', 'error');
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  setStatus('loading', 'Connecting...');
  previewContainer.innerHTML =
    '<div style="color: #aaa; font-size: 1rem;">Loading...</div>';

  if (previewToolbar) {
    previewToolbar.style.display = 'none';
  }

  try {
    const previewUrl = await fetchPreviewLink(domain, ip, protocol, path);
    if (!previewUrl) {
      throw new Error('Preview URL not generated');
    }
    currentPreviewId = previewUrl;
    setStatus('loading', 'Loading website...');
    showPreview(previewUrl);
  } catch (error) {
    previewContainer.innerHTML =
      `<div style="color: #f00; font-size: 1rem;">Error: ${error.message}</div>`;
    setStatus('error', 'Error');
    if (previewToolbar) {
      previewToolbar.style.display = 'none';
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// Initialize
setStatus('', 'Ready');
showPlaceholder('Enter a domain, IP, protocol and path to preview the website');

window.copyPreviewLink = copyPreviewLink;
