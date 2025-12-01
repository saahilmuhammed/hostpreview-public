const form = document.getElementById('previewForm');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const previewContainer = document.getElementById('previewContainer');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const previewUrlDiv = document.getElementById('previewUrl');

let currentPreviewId = null;

function setStatus(status, text) {
  statusIndicator.className = `status-indicator ${status}`;
  statusText.textContent = text;
}

function showMessage(text, type) {
  messageDiv.innerHTML = `<div class="${type}-message">${text}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 5000);
}

function showPreview(previewUrl) {
  const fullUrl = window.location.origin + previewUrl;
  previewContainer.innerHTML = `<iframe class="preview-frame" src="${previewUrl}" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals" style="width: 100%; height: 400px; border: none; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);"></iframe>`;
  previewUrlDiv.innerHTML = `
    <div class="preview-actions">
      <button onclick="navigator.clipboard.writeText('${fullUrl}')" class="copy-btn" title="Copy URL">Copy</button>
      <button onclick="window.open('${fullUrl}', '_blank')" class="open-btn" title="Open in new tab">Open</button>
    </div>
  `;
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
  previewContainer.innerHTML = `<div class="preview-placeholder" style="color: #aaa; font-size: 1rem;">${text}</div>`;
  previewUrlDiv.innerHTML = '';
}

function validateIP(ip) {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

function validateDomain(domain) {
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

async function fetchPreviewLink(domain, ip) {
  try {
    const response = await fetch('/api/preview-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, ip }),
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

  if (!validateDomain(domain)) {
    showMessage('Invalid domain format', 'error');
    return;
  }

  if (!validateIP(ip)) {
    showMessage('Invalid IP address format', 'error');
    return;
  }

  previewContainer.innerHTML = '<div style="color: #aaa; font-size: 1rem;">Loading...</div>';

  try {
    const previewUrl = await fetchPreviewLink(domain, ip);
    if (!previewUrl) {
      throw new Error('Preview URL not generated');
    }
    showPreview(previewUrl);
  } catch (error) {
    previewContainer.innerHTML = `<div style="color: #f00; font-size: 1rem;">Error: ${error.message}</div>`;
  }
});

// Initialize
setStatus('', 'Ready');
showPlaceholder('Enter a domain and IP address to preview the website');

// Make copyPreviewLink globally accessible
window.copyPreviewLink = copyPreviewLink;
