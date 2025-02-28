import { stat, readdir, copyFile, access, mkdir } from 'fs/promises';
import { constants  } from 'fs';
import path from 'path';
import fg from "fast-glob";

async function prepareDir(dir) {
    const parents = path.dirname( dir );

    await access( parents, constants.F_OK ).catch( async ( err ) => {
        if ( err.code === 'ENOENT') await prepareDir( parents );
    } );

    await access( dir, constants.F_OK ).catch(async ( err ) => {
        if ( err.code === 'ENOENT' ) await mkdir( dir ).catch( err => {
            if ( err.code !== 'EEXIST' ) console.error( err );
        } );
    } );
}

async function doCopy(src, tarDir) {
    tarDir = path.resolve( tarDir );
    src = path.resolve( src );

    await prepareDir( tarDir );

    const fstat = await stat( src );

    const tarPath = path.join( tarDir, path.basename( src ) );

    if ( fstat.isDirectory() ) {
        for ( const file of await readdir( src ) ) {
            const srcPath = path.join( src, file );

            await doCopy( srcPath, tarPath );
        }
    } else {
        await copyFile( src, tarPath ).catch( () => {
            console.warn(`The file "${src}" could not be copied`);
        } );
    }
}

async function copy(copyList) {
    for ( const [ src, dest ] of Object.entries( copyList ) ) {
        await stat( src ).catch( () => {
            console.log();
            console.warn(`No such file or directory "${src}"`);
        } )

        const sources = await fg( src, {
            expandDirectories: false,
            onlyFiles: false,
        } );

        if ( sources.length > 0 ) {
            for ( const src of sources ) {
                if ( Array.isArray( dest ) ) {
                    for ( const dest of tasks ) {
                        await doCopy( src, dest );
                    }
                } else {
                    await doCopy( src, dest );
                }
            }
        }
    }
}

export default copy;