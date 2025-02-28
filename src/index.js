import path from 'path';
import copy from "./copy.js";

function majestic(config) {
    const copyList =  typeof config.copy === 'object' && Object.keys( config.copy ).length
        ? config.copy : {};

    let output = false;

    return {
        name: 'majestic',

        config() {
            return {
                root: './resources',
                build: {
                    manifest: 'manifest.json',
                    sourcemap: true,
                    assetsDir: '',
                    outDir: path.resolve( './', config.output ? config.output : 'public' ),
                    emptyOutDir: config.clear ? config.clear : false,
                    rollupOptions: {
                        input: config.input ? config.input : [],
                    },
                }
            };
        },

        handleHotUpdate({ file, server }) {
            if ( file.endsWith('.php') ) {
                server.ws.send({ type: 'full-reload' } );
            }
        },

        configureServer(server) {
            server.middlewares.use('/hot', function (req, res) {
                res.writeHead(200, { 'Content-Type': 'application/javascript' })
                    .end(`true`);
            } );
        },

        buildEnd() {
            output = false;
        },

        async writeBundle() {
            if ( output ) return;
            output = true;

            await copy( copyList );
        }
    };
}

export default majestic;