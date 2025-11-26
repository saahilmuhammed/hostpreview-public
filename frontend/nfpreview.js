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
  // Get full URL for sharing
  const fullUrl = window.location.origin + previewUrl;
  previewContainer.innerHTML = `<iframe class="preview-frame" src="${previewUrl}" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation allow-modals"></iframe>`;
  previewUrlDiv.innerHTML = `<a href="${fullUrl}" target="_blank" class="preview-link">${fullUrl}</a> <button onclick="copyPreviewLink('${fullUrl}')" class="copy-btn" title="Copy link">📋</button>`;
}

function copyPreviewLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    showMessage('Preview link copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for older browsers
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
  previewContainer.innerHTML = `<div class="preview-placeholder">${text}</div>`;
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const domain = form.domain.value.trim();
  const ip = form.ip.value.trim();
  
  // Clear previous messages
  messageDiv.innerHTML = '';
  
  // Validate inputs
  if (!validateDomain(domain)) {
    showMessage('Please enter a valid domain name (e.g., example.com)', 'error');
    return;
  }
  
  if (!validateIP(ip)) {
    showMessage('Please enter a valid IP address (e.g., 192.168.1.1)', 'error');
    return;
  }
  
  // Disable form and show loading
  submitBtn.disabled = true;
  setStatus('loading', 'Connecting...');
  showPlaceholder('Connecting to server...');
  
  try {
    // Create preview link
    const response = await fetch('/api/preview-link', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({domain, ip})
    });
    
    if (!response.ok) {
      throw new Error('Failed to create preview link');
    }
    
    const data = await response.json();
    currentPreviewId = data.previewUrl;
    
    // Get full URL for display
    const fullUrl = window.location.origin + data.previewUrl;
    
    // Show success message with shareable link
    showMessage(`Preview created! Share this link: <a href="${fullUrl}" target="_blank" style="color: #4ade80; text-decoration: underline;">${fullUrl}</a>`, 'success');
    
    // Show the preview iframe directly
    setStatus('loading', 'Loading website...');
    showPreview(data.previewUrl);
    
    // Monitor iframe load status
    const iframe = previewContainer.querySelector('.preview-frame');
    let loadTimeout;
    let hasLoaded = false;
    
    iframe.onload = () => {
      hasLoaded = true;
      clearTimeout(loadTimeout);
      setStatus('success', 'Website loaded');
    };
    
    iframe.onerror = () => {
      clearTimeout(loadTimeout);
      if (!hasLoaded) {
        setStatus('error', 'Failed to load');
        showMessage('The website could not be loaded. Please check if the IP address is correct and the server is accessible.', 'error');
      }
    };
    
    // Timeout after 15 seconds
    loadTimeout = setTimeout(() => {
      if (!hasLoaded) {
        setStatus('error', 'Connection timeout');
        showMessage('Connection timeout. Please verify the IP address is correct and the server is accessible.', 'error');
      }
    }, 15000);
    
  } catch (error) {
    console.error('Error:', error);
    setStatus('error', 'Error');
    showPlaceholder('Failed to create preview. Please try again.');
    showMessage('An error occurred while creating the preview link. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

// Initialize
setStatus('', 'Ready');
showPlaceholder('Enter a domain and IP address to preview the website');

// Make copyPreviewLink globally accessible
window.copyPreviewLink = copyPreviewLink;
