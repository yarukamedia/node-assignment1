const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// create server
const app = http.createServer((req, res)=>{
    // get app meta data
    headers = req.headers;
    path = url.parse(req.url, true);
    requestedPath = path.pathname;
    trimmedPath = requestedPath.replace(/^\/+|\/+$/g, '');
    queryString = JSON.stringify(path);
    requestMethod = req.method;

    // decode payload
    const decoder = new StringDecoder('utf-8');
    let payload = '';
    // get payload
    req.on('data', (data)=>{
        payload += decoder.write(data);
    });
    req.on('end', ()=>{
        payload += decoder.end();
        
        // payoad object to be sent to the client
        const data = {
            path: requestedPath,
            method: requestMethod,
            payload: payload
        };
        const errorMessage = `An error occured while processing a ${data.method} request to: ${data.path}!`

        // check what router the client requested, and if found redirect to that router. If NOTFOUND, use the notFound handler
        let requestedRouter = '';
        requestedRouter = typeof(router[trimmedPath]) !== `undefined` ? router[trimmedPath]: handlers.notFound;

        // call requestedRouter 
        requestedRouter(data, (statusCode, payload)=>{
            // check statusCode, if not found default to 500
            statusCode = typeof(statusCode) == `Number` ? statusCode: 500;
            // check payload, if empty default to error message
            payload = typeof(payload) == `object` ? payload: errorMessage;

            // send response back to client
            const payloadString = JSON.stringify(payload);
            res.setHeader('Content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
});

// create application route handlers
const handlers = {};
handlers.hello = function (data, callback){
    callback(200, {'Message': `Application successfully redirected to: /hello with the following message: ${data.payload}`});
};

// if the requested resource is not found, redirect to this route
handlers.notFound = function(data, callback){
    callback(404);
};

// application router
const router = {
    'hello' : handlers.hello
};

// start server
app.listen(3000, ()=>{
    console.log(`Application started and running on port: 3000`);
});