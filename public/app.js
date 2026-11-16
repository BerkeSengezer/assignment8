const buttons = document.querySelectorAll('[data-path]');
const requestInfo = document.querySelector('#request-info');
const responseStatus = document.querySelector('#response-status');
const responseBody = document.querySelector('#response-body');

async function tryRoute(button) {
  const path = button.dataset.path;
  const method = button.dataset.method || 'GET';

  buttons.forEach((item) => {
    item.disabled = true;
  });
  requestInfo.textContent = `${method} ${path}`;
  responseStatus.textContent = 'Status: loading...';
  responseStatus.className = '';
  responseBody.textContent = 'Waiting for the server...';

  try {
    const response = await fetch(path, { method });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? JSON.stringify(await response.json(), null, 2)
      : await response.text();

    responseStatus.textContent = `Status: ${response.status} ${response.statusText}`;
    responseStatus.className = response.ok ? 'success' : 'error';
    responseBody.textContent = body;
  } catch (error) {
    responseStatus.textContent = 'Status: request failed';
    responseStatus.className = 'error';
    responseBody.textContent = `Could not reach the server. Check that it is running and try again.\n${error.message}`;
  } finally {
    buttons.forEach((item) => {
      item.disabled = false;
    });
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    tryRoute(button);
  });
});
