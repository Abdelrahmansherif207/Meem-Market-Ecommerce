const http = require('http');

http.get('http://localhost:3000/en/category/electronics', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Basic regex to find the hierarchy from container down to page
    const containerIdx = data.indexOf('class="container');
    if (containerIdx !== -1) {
      console.log(data.substring(containerIdx, containerIdx + 1000));
    }
  });
});
