// Copyright (c) 2020 Cryptogogue, Inc. All Rights Reserved.

import './index.css';

import pkg                                  from '../package.json';
import { FAQ }                              from './faq';
import registerServiceWorker                from './util/registerServiceWorker';
import _                                    from 'lodash';
import React                                from 'react';
import { useClearCache }                    from 'react-clear-cache';
import ReactDOM                             from 'react-dom';
import ReactMarkdown                        from 'react-markdown';
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom';

const SERVICE_URL = 'https://api.brutalistitties.com/';

//----------------------------------------------------------------//
const AgeClaimForm = ( props ) => {

    const [ challenge, setChallenge ]               = React.useState ( '' );
    const [ challengeToken, setChallengeToken ]     = React.useState ( '' );
    const [ claim, setClaim ]                       = React.useState ( '' );
    const [ busy, setBusy ]                         = React.useState ( false );

    const getChallenge = async () => {
        const response = await ( await fetch ( `${ SERVICE_URL }challenge/` )).json ();
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
                `${ SERVICE_URL }claim/`, {
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
                <p>Want to remove the black bars? Verify your age with an <b>anonymous ad hoc age claim</b> from <a href = 'https://gamercert.com' target = '_blank'>Gamercert</a>.</p>
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
        <div className = 'center grid-content'>
            <center>
                <h3>{ props.message }</h3>
                <p style = {{ width: '100%', margin: 'auto', color: 'white', cursor: 'pointer' }} onClick = { props.onReset }>Reset</p>
            </center>
        </div> 
    );
}

//----------------------------------------------------------------//
const App = () => {

    const { isLatestVersion, emptyCacheStorage }    = useClearCache ();
    const [ slide, setSlide ]                       = React.useState ();
    const [ claimType, setClaimType ]               = React.useState ( 'none' );
    const [ showFAQ, setShowFAQ ]                   = React.useState ( false );
    const [ busy, setBusy ]                         = React.useState ( false );

    if ( !isLatestVersion ) {
        emptyCacheStorage ();
    }

    const getSlide = async ( slideName, token ) => {
        if ( busy ) return;
        setBusy ( true );
        const slidePath     = slideName ? `/${ slideName }` : '';
        const url           = `${ SERVICE_URL }slides${ slidePath }?token=${ token || 'none' }`;
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
        <React.Fragment>
            <If condition = { showFAQ }>
                <div className = 'modal' onClick = {() => { setShowFAQ ( false ); }}>
                    <ReactMarkdown className = 'modal-content'>
                        { FAQ }
                    </ReactMarkdown>
                </div>
            </If>

            <div className = 'grid'>
                <div className = 'grid-area-header'>
                    <div className = 'center grid-content'>
                        <h1>BRUTALISTITTIES</h1>
                        <h2>an 18+ gallery of brutalist architecture badly photoshopped with classical titties</h2>
                    </div>
                </div>

                <div className = 'grid-area-left'>
                    <button className = 'center nav-button' onClick = {() => { getSlide ( slide.prev, slide.token ); }}>
                        <i className = 'material-icons'>chevron_left</i>
                    </button>
                </div>

                <div className = 'grid-area-right'>
                    <button className = 'center nav-button' onClick = {() => { getSlide ( slide.next, slide.token ); }}>
                        <i className = 'material-icons'>chevron_right</i>
                    </button>
                </div>

                <div className = 'grid-area-slides'>
                    <If condition = { slide }>
                        <div className = 'center slide-shadow' style = {{
                            width:                  '1024px',
                            height:                 '512px',
                            backgroundColor:        '#fff',
                        }}>
                            <img className = 'center' src = { `${ SERVICE_URL }images/${ slide.curr }?token=${ slide.token }` } width = '992' height = '480'/>
                        </div>
                    </If>
                </div>

                <div className = 'grid-area-form'>
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
                </div>

                <div className = 'grid-area-footer'>
                    <div className = 'center grid-content'>
                        <footer
                            style       = {{ cursor: 'pointer' }}
                            onClick     = {() => { setShowFAQ ( true ); }}
                        >
                            { `Copyright © 2022 by Gamercert, Inc. - v${ pkg.version } - FAQ` }
                        </footer>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

//----------------------------------------------------------------//
ReactDOM.render (
    <App/>,
    document.getElementById ( 'root' )
);

registerServiceWorker ();
