import React from "react";
import classNames from "classnames";
import CardBlank from "./CardBlank";
import "./Card.css";

const blank = /_+/g;

function Card({ type, children, selectedIndex, showIndex, onClick, ...others }) {
    /* Figure out which css classes to give the card. It always has 'card', will have exactly one
     * of [prompt, response], and 0 or more of [clickable, selected]
     */
    const clickable = typeof onClick === "function";
    const selected = selectedIndex > -1;
    const className = classNames(["card", type, { clickable, selected }]);

    // This will be an array of JSX Elements that go inside the card
    const content = [];

    if (type === "prompt") {
        /* We will replace the blanks in prompts with CardBlank elements, which are numbered.
         * The rest of the text will be put inside <label> elements.
         */
        const blanks = children.match(blank) || [];

        // Create label elements from text-- "children" should be a string containing card text
        const textNodes = children.split(blank).map((text) => <span>{text}</span>);

        // Create card content. Replace text with label elements and blanks with CardBlank elements.
        let i = 0;
        let j = 0;
        while (i < textNodes.length || j < blanks.length) {
            // If there are is another text node, add it
            if (i < textNodes.length) {
                content.push(textNodes[i++]);
            }
            // If there are is another blank, add it
            if (j < blanks.length) {
                const indexLabel = blanks.length === 1 ? null : j + 1;
                content.push(<CardBlank index={indexLabel} />);
                j++;
            }
        }
    } else if (type === "response" && Array.isArray(children)) {
        /* This is a special response card used to show a user's response as one entity even if it
         * contained multiple cards. Notice that the "children" attribute is an array of strings.
         */
        const numSeparators = children.length - 1;
        for (let i = 0; i < children.length; i++) {
            if (children.length > 1) {
                content.push(<span className="card-response-index">{i + 1}</span>);
            }
            content.push(children[i]);
            if (children.length > 1 && i < numSeparators) {
                content.push(<hr />);
            }
        }
    } else if (type === "response") {
        // This is a response card being shown to a player who is answering
        // Number them if there are more than 1
        if (showIndex && selectedIndex > -1) {
            content.push(<span className="card-selected-index">{selectedIndex + 1}</span>);
        }
        content.push(children);
    }

    if (clickable) {
        return (
            <button type="button" aria-pressed={selected} {...{ className, onClick, ...others }}>
                <div className="card-content" tabIndex="-1">{content}</div>
            </button>
        );
    }

    return (
        <div {...{ className, ...others }}>
            <div className="card-content" tabIndex="-1">{content}</div>
        </div>
    );
}

export default Card;
