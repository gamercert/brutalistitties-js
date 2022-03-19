// Copyright (c) 2020 Cryptogogue, Inc. All Rights Reserved.

import './index.css';

import pkg                                  from '../package.json';
import registerServiceWorker                from './util/registerServiceWorker';
import _                                    from 'lodash';
import React                                from 'react';
import { useClearCache }                    from 'react-clear-cache';
import ReactDOM                             from 'react-dom';
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";

//----------------------------------------------------------------//
const GridArea = ( props ) => {

    return (
        <div style = {{
            gridArea:               props.area,
            position:               'relative',
            backgroundColor:        props.color || undefined,
        }}>
            { props.children }
        </div>
    );
}

//----------------------------------------------------------------//
const GridAreaContent = ( props ) => {

    return (
        <div className = 'center' style = {{
            width:                  'fit-content',
            backgroundColor:        props.color || undefined,
        }}>
            { props.children }
        </div>
    );
}

//----------------------------------------------------------------//
const AgeClaimForm = ( props ) => {

    const [ challenge, setChallenge ]               = React.useState ( '' );
    const [ challengeToken, setChallengeToken ]     = React.useState ( '' );
    const [ claim, setClaim ]                       = React.useState ( '' );
    const [ busy, setBusy ]                         = React.useState ( false );

    const getChallenge = async () => {
        const response = await ( await fetch ( `http://localhost:8008/challenge/` )).json ();
        setChallenge ( response.challenge );
        setChallengeToken ( response.token );
    }

    React.useEffect (() => { getChallenge (); }, []);

    const onCopy = () => {
        navigator.clipboard.writeText ( challenge );
    }

    const onSubmit = async () => {

        if ( !claim ) return;
        setBusy ( true );

        try {
            const response = await ( await fetch (
                `http://localhost:8008/claim/`, {
                    method:         'POST',
                    headers:        {[ 'content-type' ]: 'application/json' },
                    body: JSON.stringify ({
                        token:      challengeToken,
                        claim:      claim,
                    })
                }
            )).json ();

            props.onAccessToken ( response.token, response.type );
        }
        catch ( error ) {
            console.log ( error );
        }

        setBusy ( false );
    }

    return (
        <div className = 'center-horizontal' style = {{
            width:                  'fit-content',
            backgroundColor:        '#000',
        }}>
            <div style = {{ color: '#ffffff', lineHeight: '1.25em', marginTop: '5px', marginBottom: '10px' }}>
                <p>Want to remove the black bars? Verify your age with an <b>anonymous ad hoc age claim</b> from <a href = 'https://google.com' target = '_blank'>Gamercert</a>.</p>
                <p>Nothing about this site will be revealed to Gamercert. Nothing about your Gamercert account will be revealed to this site.</p>
                <p>This site's server is stateless and will not record anything about your visit. This site does not use cookies or local storage.</p>
                <p>Haven't verified your Gamercert account? Test things out with a <b>pretend</b> claim. We won't tell your mom.</p>
            </div>

            <div style = {{ textAlign: 'center', margin: '15px', overflow: 'visible' }}>
                <form style = {{ overflow: 'visible' }} onSubmit = {( event ) => { event.preventDefault (); }}>
                    <div style = {{ overflow: 'visible' }}>
                        <input
                            readOnly
                            style           = {{ width: '256px' }}
                            type            = 'text'
                            value           = { challenge }
                        />
                        <input type = 'submit' value = 'copy' onClick = { onCopy }/>
                    </div>
                    <div style = {{ marginTop: '10px', overflow: 'visible' }}>
                        <input
                            style           = {{ width: '256px' }}
                            type            = 'text'
                            placeholder     = 'Gamercert Age Claim'
                            value           = { claim }
                            onChange        = {( event ) => { setClaim ( event.target.value ); }}
                        />
                        <input type = 'submit' value = 'submit' onClick = { onSubmit }/>
                    </div>
                </form>
            </div>
        </div>
    );
}

//----------------------------------------------------------------//
const AgeClaimMessage = ( props ) => {

    return (
        <GridAreaContent>
            <center>
                <h3>{ props.message }</h3>
                <p style = {{ width: '100%', margin: 'auto', color: 'white', cursor: 'pointer' }} onClick = { props.onReset }>Reset</p>
            </center>
        </GridAreaContent> 
    );
}

//----------------------------------------------------------------//
const App = () => {

    const { isLatestVersion, emptyCacheStorage }    = useClearCache ();
    const [ slide, setSlide ]                       = React.useState ();
    const [ claimType, setClaimType ]               = React.useState ( 'none' );
    const [ busy, setBusy ]                         = React.useState ( false );

    if ( !isLatestVersion ) {
        emptyCacheStorage ();
    }

    const getSlide = async ( slideName, token ) => {
        if ( busy ) return;
        setBusy ( true );
        const slidePath     = slideName ? `/${ slideName }` : '';
        const url           = `http://localhost:8008/slides${ slidePath }?token=${ token || 'none' }`;
        const slide         = await ( await fetch ( url )).json ();
        setSlide ( slide );
        console.log ( slide );
        setBusy ( false );
    }

    React.useEffect (() => { getSlide (); }, []);

    const onAccessToken = async ( token, type ) => {
        await getSlide ( slide.curr, token );
        setClaimType ( type );
    }

    const onReset = async ( token, type ) => {
        setSlide ( _.assign ({}, slide, { token: 'none' }));
        setClaimType ( 'nonce' );
    }

    return (
        <div
            style = {{
                display:                'grid',
                gridTemplateRows:       '96px auto 192px 24px',
                gridTemplateColumns:    '48px auto 48px',
                gridTemplateAreas: `
                    'header header header'
                    'left slides right'
                    'content content content'
                    'footer footer footer'
                `,
                position:               'absolute',
                width:                  '100%',
                height:                 '100%',
                background:             '#000000',

                alignItems:             'stretch',
                justifyItems:           'stretch',
            }}
        >
            <GridArea area = 'header' color = '#ff0000'>
                <GridAreaContent>
                    <h1>BRUTALISTITTIES</h1>
                    <h2>an 18+ gallery of brutalist architecture badly photoshopped with classical titties</h2>
                </GridAreaContent>
            </GridArea>

            <GridArea area = 'left' color = '#00ffff'>
                <button className = 'center nav-button' onClick = {() => { getSlide ( slide.prev, slide.token ); }}>
                    <i className = 'material-icons'>chevron_left</i>
                </button>
            </GridArea>

            <GridArea area = 'right' color = '#00ff00'>
                <button className = 'center nav-button' onClick = {() => { getSlide ( slide.next, slide.token ); }}>
                    <i className = 'material-icons'>chevron_right</i>
                </button>
            </GridArea>

            <GridArea area = 'slides' color = '#ffff77'>
                <If condition = { slide }>
                    <div className = 'center slide-shadow' style = {{
                        width:                  '1024px',
                        height:                 '512px',
                        backgroundColor:        '#fff',
                    }}>
                        <img className = 'center' src = { `http://localhost:8008/images/${ slide.curr }?token=${ slide.token }` } width = '992' height = '480'/>
                    </div>
                </If>
            </GridArea>

            <GridArea area = 'content' color = '#000000'>    
                <Choose>
                    <When condition = { claimType === 'over18' }>
                        <AgeClaimMessage message = '18+ ACCESS GRANTED' onReset = { onReset }/>
                    </When>
                    <When condition = { claimType === 'pretend' }>
                        <AgeClaimMessage message = '18+ ACCESS GRANTED (PRETEND)' onReset = { onReset }/>
                    </When>
                    <Otherwise>
                        <AgeClaimForm onAccessToken = { onAccessToken }/>
                    </Otherwise>
                </Choose>
            </GridArea>

            <GridArea area = 'footer' color = '#000000'>
                <GridAreaContent>
                    <footer
                        style       = {{ cursor: 'pointer' }}
                        onClick     = {() => {}}
                    >
                        { `Copyright © 2022 by Cryptogogue, Inc. - Terms of Service - v${ pkg.version }` }
                    </footer>
                </GridAreaContent>
            </GridArea>
        </div>
    );
}

//----------------------------------------------------------------//
ReactDOM.render (
    <App/>,
    document.getElementById ( 'root' )
);

registerServiceWorker ();
