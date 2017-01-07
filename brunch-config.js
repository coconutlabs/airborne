module.exports = {
    // See http://brunch.io for documentation.
    files: {
        javascripts: {
            joinTo: {
                // all BUT app code - 'vendor/', 'node_modules/', etc
                'js/vendor.js': /^(?!app)/,
                // all code from 'app/'
                'js/app.js': /^app/
            }
        },
        stylesheets: {
            joinTo: 'css/app.css'
        }
    },

    plugins: {
        sass: {
            options: {
                mode: 'native',
                includePaths: [
                    'node_modules/bourbon/core',
                    'node_modules/bourbon-neat/app/assets/stylesheets',
                    'node_modules/normalize.css',
                    'node_modules/leaflet/dist'
                ],
                // Set the precision for arithmetic operations.
                precision: 8,
                // To enable embedded source maps, pass the option `sourceMapEmbed`.
                // This is only supported in _native_ mode; Ruby Sass isn't supported.
                sourceMapEmbed: true
            }
        }
    }
}
