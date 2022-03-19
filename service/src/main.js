/* eslint-disable no-whitespace-before-property */

process.on ( 'uncaughtException', function ( err ) {
    console.log ( err );
    process.exit ( 1 );
});

import bodyParser                   from 'body-parser';
import express                      from 'express';
import fetch                        from 'cross-fetch';
import fs                           from 'fs';
import * as jwtutil                 from 'jwtutil';
import _                            from 'lodash';
import path                         from 'path';
import * as sodium                  from 'sodium';

const JWT_SIGNING_KEY = 'd1168613e7f71f6416047538edd9ad6699e12e3f32fadd2ffdc2ebd5efcf5b0f';

const GALLERIES = {
    GENERAL:        {},
    MATURE:         {},
};

//----------------------------------------------------------------//
function loadGallery ( gallery, path ) {

    gallery.PATH            = path;
    gallery.SLIDES          = [];
    gallery.SLIDES_BY_NAME  = {};

    fs.readdirSync ( path ).forEach (( name, i ) => {
        if ( name.toLowerCase () !== '.ds_store' ) {
            gallery.SLIDES_BY_NAME [ name ] = gallery.SLIDES.length;
            gallery.SLIDES.push ( name );
        }
    });
}

loadGallery ( GALLERIES.GENERAL, 'gallery/general' );
loadGallery ( GALLERIES.MATURE, 'gallery/mature' );

//----------------------------------------------------------------//
( async () => {

    await sodium.initAsync ();

    const server = express ();

    server.use ( function ( req, res, next ) {
        res.header ( 'Access-Control-Allow-Origin', '*' );
        res.header ( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-Auth-Token, Authorization, Content-Type, Accept' );
        res.header ( 'Access-Control-Allow-Methods', 'GET, OPTIONS, POST' );
        next ();
    });

    server.use ( bodyParser.json ({
        verify: ( req, res, buf ) => {
            req.rawBody = buf;
        }
    }));
    server.use ( bodyParser.urlencoded ({ extended: true }));

    let router = express.Router ();

    router.use (( request, response, next ) => {

        request.gallery     = GALLERIES.GENERAL;

        if ( request.query.token && ( request.query.token !== 'none' )) {
            const jwtClaims = jwtutil.verify ( request.query.token, JWT_SIGNING_KEY );
            if ( jwtClaims && jwtClaims.mature ) {
                request.gallery = GALLERIES.MATURE;
                console.log ( 'MATURE!' );
            }
        }
        next ();
    });

    router.get      ( '/challenge',             getChallengeAsync );
    router.post     ( '/claim',                 postClaimAsync );

    router.get      ( '/images/:slideName',     getImageAsync );
    router.get      ( '/slides',                getSlideAsync );
    router.get      ( '/slides/:slideName',     getSlideAsync );

    router.get ( '/', ( request, response ) => {
        const message = {
            type: 'BRUTALISTITTIES',
        };
        response.json ( message );
    });

    server.use ( '/', router );

    await server.listen ( 8008 );
    console.log ( 'LISTENING ON PORT:', 8008 );
        
})();

//----------------------------------------------------------------//
async function getChallengeAsync ( request, response ) {

    const nonce         = sodium.randomBytes ( 8, 'hex' );

    response.json ({
        challenge:      `over18.${ nonce }`,
        token:          jwtutil.create ({ nonce: nonce }, JWT_SIGNING_KEY ),
    });
}

//----------------------------------------------------------------//
async function getImageAsync ( request, response ) {

    const GALLERY   = request.gallery;

    const slideName = request.params.slideName;
    if ( slideName && _.has ( GALLERY.SLIDES_BY_NAME, slideName )) {
        response.sendFile ( path.join ( __dirname, `../${ GALLERY.PATH }`, slideName ));
        return;
    }
    response.status ( 404 ).send ( '404: Not found.' );
}

//----------------------------------------------------------------//
async function getSlideAsync ( request, response ) {

    const GALLERY   = request.gallery;

    const index     = request.params.slideName ? GALLERY.SLIDES_BY_NAME [ request.params.slideName ] : 0;
    const prev      = ( index + GALLERY.SLIDES.length - 1 ) % GALLERY.SLIDES.length;
    const next      = ( index + 1 ) % GALLERY.SLIDES.length;

    response.json ({
        curr:           GALLERY.SLIDES [ index ],
        prev:           GALLERY.SLIDES [ prev ],
        next:           GALLERY.SLIDES [ next ],
        token:          request.query.token || 'none',
    });
}

//----------------------------------------------------------------//
async function postClaimAsync ( request, response ) {

    try {

        const token         = request.body.token;
        const claimString   = request.body.claim;

        sodium.assert ( token && claimString );

        const jwtClaims = jwtutil.verify ( token, JWT_SIGNING_KEY );

        sodium.assert ( jwtClaims );
        sodium.assert ( jwtClaims.nonce );

        const claimComponents = claimString.split ( '.' );
        sodium.assert ( claimComponents.length === 5 );

        const claim = {
            type:           claimComponents [ 0 ],
            nonce:          claimComponents [ 1 ],
            salt:           claimComponents [ 2 ],
            keyName:        claimComponents [ 3 ],
            signature:      claimComponents [ 4 ],
        }

        sodium.assert ( claim.type );
        sodium.assert ( claim.nonce );
        sodium.assert ( claim.salt );
        sodium.assert ( claim.keyName );
        sodium.assert ( claim.signature );

        sodium.assert ( claim.nonce === jwtClaims.nonce );

        const keyResult = await ( await fetch ( `http://localhost:7777/sig/keys/${ claim.keyName }` )).json ();
        sodium.assert ( keyResult.publicKey );

        const hash      = sodium.hash ( `${ claim.nonce }${ claim.salt }` );
        const message   = `${ claim.type }.${ hash }`;
        const verified  = sodium.verify ( claim.signature, keyResult.publicKey, 'utf8' );

        sodium.assert ( verified === message );

        response.json ({
            type:           claim.type,
            token:          jwtutil.create ({ mature: true }, JWT_SIGNING_KEY ),
        });
        return;
    }
    catch ( error ) {
        console.log ( error );
    }
    response.status ( 400 ).send ( '400: Bad request.' );
}
