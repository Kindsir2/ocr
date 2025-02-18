function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));
  contents.forEach(content => content.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

async function processFile(input, type) {
  const file = input.files[0];
  const outputField = document.getElementById('output');

  if (file) {
      outputField.textContent = `Processing ${type}...`;

      if (file.type === 'application/pdf') {
          const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
          let combinedText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 2 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              await page.render({ canvasContext: context, viewport }).promise;
              const imageData = canvas.toDataURL('image/png');

              await Tesseract.recognize(imageData, 'eng', { logger: m => console.log(m) })
                  .then(({ data: { text } }) => {
                      combinedText += text + '\n';
                  })
                  .catch(err => {
                      console.error(`Error processing page ${i}:`, err);
                  });
          }

          outputField.innerHTML = `<strong>${type} Output:</strong><br>${combinedText}`;
      } else {
          Tesseract.recognize(
              file, 
              'eng', 
              { logger: m => console.log(m) } 
          ).then(({ data: { text } }) => {
              const formattedText = text.split('\n').map(line => line.trim()).filter(line => line).join('\n');
              outputField.innerHTML = `<strong>${type} Output:</strong><br>${formattedText}`;
          }).catch(err => {
              outputField.textContent = `Error processing ${type}: ${err.message}`;
          });
      }
  } else {
      outputField.textContent = `No file selected for ${type}.`;
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
});