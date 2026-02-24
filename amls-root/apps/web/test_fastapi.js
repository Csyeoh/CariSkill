const http = require('http');

console.log("Starting Next.js to FastAPI Diagnostics...");

const req = http.request({
    hostname: '127.0.0.1',
    port: 8000,
    path: '/health',
    method: 'GET'
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`ERROR CONNECTING TO FASTAPI: ${e.message}`);
    console.error("This usually means Uvicorn is dead or frozen.");
});

req.setTimeout(5000, () => {
    console.error("TIMEOUT: FastAPI server did not respond within 5 seconds.");
    req.abort();
})

req.end();
