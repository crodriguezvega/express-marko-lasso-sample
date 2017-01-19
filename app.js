require('marko/express');
require('marko/node-require');

// Enable browser reloading (should be enabled only in development)
require('marko/browser-refresh').enable();
require('lasso/browser-refresh').enable('*.marko *.css');

var path = require('path');
var express = require('express');
var compression = require('compression');
var serveStatic = require('serve-static');

var isProduction = process.env.NODE_ENV === 'production';

// Configure the RaptorJS Optimizer to control how JS/CSS/etc. is
// delivered to the browser
require('lasso').configure({
  plugins: [
    'lasso-marko', // Auto compile Marko template files
  ],

  // Enable splitting out code that multiple pages/entry points have in common into separate bundles
  bundles: [
      {
          'name': 'layout',
          'dependencies': [
              {
                  'intersection': [
                      './src/views/page1/browser.json',
                      './src/views/page2/browser.json'
                  ]
              }
          ]
      }
  ],

  // Directory where generated JS and CSS bundles are written
  outputDir: path.join(__dirname, 'build/static'),
  
  // URL prefix for static assets
  urlPrefix: '/static',
  
  // Only enable bundling in production
  bundlingEnabled: isProduction,

  // Only minify JS and CSS code in production
  minify: isProduction,

  // Only add fingerprints to URLs in production
  fingerprintsEnabled: isProduction, 
});

var app = express();

var port = process.env.PORT || 8080;

// Enable gzip compression for all HTTP responses
app.use(compression());

// Allow all of the generated files under "static" to be served up by Express
app.use('/static', serveStatic(path.join(__dirname, 'build/static')));

// Routes
app.use('/page1', require('./src/routes/page1'));
app.use('/page2', require('./src/routes/page2'));

app.listen(port, function(err) {
    if (err) {
        throw err;
    }
    console.log('Listening on port %d', port);

    // The browser-refresh module uses this event to know that the
    // process is ready to serve traffic after the restart
    if (process.send) {
        process.send('online');
    }
});