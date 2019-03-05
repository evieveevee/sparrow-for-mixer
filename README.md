# Sparrow for Mixer
### Installation

* Install node.js. Default options are fine.
* Install Gulp globally. This allows Gulp to be run from the command line.
  - type or paste `npm install gulp -g`
* Open the project folder in the command line (on Windows, Shift+Right Click in the folder, and choose "Open in Command Prompt")
* Type, or paste `npm install`. This will install the dependencies for the project.
* [Create a Mixer OAuth application](https://mixer.com/lab/oauth).
* Add your Mixer OAuth Client ID and Secret to `config/clientinfo.json`.
* [Generate a self-signed SSL certificate.](https://devcenter.heroku.com/articles/ssl-certificate-self)
  * Place the SSL key into `sslcert` as `server.key`.
  * Place the SSL certificate into `sslcert` as `server.pem`.
* Run `gulp install` to create the database file, build the CSS, and get everything ready.
* Run `node index` to start the server.
* Open localhost/dashboard in your browser, and click "Sign in to Mixer" in the top right.
* Authorize through Mixer.
* When you're done, open localhost/overlay, and the overlay will display.

### Customization

* To customize the overlay's contents, you can edit the following locations:
  * The overlay's HTML can be edited in `views/overlay/overlay.ejs`. 
    * A default theme has been provided that requires light customization, but was designed with a specific use case in mind. A more generic theme is planned for public release in time, including less specific references to services like Discord and Humble Bundle.
  * The overlay's CSS can be edited by customizing the Sass files in `public/sass`. You can build it by running `gulp sass`, or watch for changes using `gulp sass:watch`.
  * The overlay's queuing function can be edited by customizing `public/js/queue.js`.
  * To add icons to the overlay, please see an example in the `overlay1` block in `views/overlay/overlay.ejs`. You can add your own icons from images, or using iconfonts like Font Awesome.