import React from 'react';
import './NotFound.css';
import Button from '../../components/Button';

function NotFound() {
    return (
        <main className="view" id="not-found">
            <h1>Page not found</h1>
            <article className="not-found">
                <h1>The Internet Times</h1>
                <hr />
                <h2>What Happened to {window.location.pathname}?</h2>
                <p>
                    After the strange disappearance of {window.location.pathname} last year,
                    people are still scouring the streets of {window.location.hostname} for 
                    the missing page.
                </p>
                <p className="continued-text">Continued on page 4</p>
            </article>
            <Button link="/">Home</Button>
        </main>
    );
}

export default NotFound;
