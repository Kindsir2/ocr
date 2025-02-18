function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  }
  
  async function processFile(input, type) {
    const file = input.files[0];
    const outputField = document.getElementById('output');
  
    if (!file) {
      outputField.textContent = `No file selected for ${type}.`;
      return;
    }
  
    outputField.textContent = `Processing ${type}...`;
  
    try {
      if (file.type === 'application/pdf') {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        const textArray = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf.getPage(i + 1);
            return extractTextFromPage(page);
          })
        );
  
        outputField.innerHTML = `<strong>${type} Output:</strong><br>${textArray.join('\n')}`;
      } else {
        const text = await extractTextFromImage(file);
        outputField.innerHTML = `<strong>${type} Output:</strong><br>${text}`;
      }
    } catch (error) {
      outputField.textContent = `An unexpected error occurred: ${error.message}`;
    }
  }
  
  async function extractTextFromPage(page) {
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
  
    await page.render({ canvasContext: context, viewport }).promise;
    const imageData = canvas.toDataURL('image/png');
  
    try {
      const { data: { text } } = await Tesseract.recognize(imageData, 'eng', { logger: m => console.log(m) });
      return text.trim();
    } catch (err) {
      console.error('OCR Error:', err);
      return 'Error extracting text from page.';
    }
  }
  
  async function extractTextFromImage(file) {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', { logger: m => console.log(m) });
      return text.split('\n').map(line => line.trim()).filter(line => line).join('\n');
    } catch (err) {
      console.error('OCR Error:', err);
      return 'Error extracting text.';
    }
  }
  
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');
  });
  
