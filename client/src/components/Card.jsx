import React from 'react';
import './Card.css';
import CardBlank from './CardBlank';

const blank = /_+/g;

function Card({ type, children, selectedIndex, ...others }) {
    // Build className based on card attributes
    const isSelected = selectedIndex > -1 ? " selected" : "";
    const hasClick = others.onClick ? " hasClick" : "";
    const className = "card " + type + isSelected + hasClick;

    // This will be an array of JSX Elements that go inside the card 
    const content = [];

    if (type === "prompt") {
        // We will replace the blanks in prompts with CardBlank elements, which are just labeled blanks.
        // The rest of the text will be put inside <label> elements.
        const blanks = children.match(blank) || [];

        // Create label elements from text-- "children" should be a string containing card text
        const textNodes = children.split(blank).map(text => <label>{text}</label>);

        // Create card content. Replace text with label elements and blanks with CardBlank elements.
        let i = 0, j = 0;
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
        // This is a special response card used to show a user's response as one entity even if it contained multiple cards
        // Notice that the "children" attribute is an array of strings
        const numSeparators = children.length - 1;
        for (let i = 0; i < children.length; i++) {
            if (children.length > 1) {
                content.push(<label className="card-response-index">{i + 1}</label>)
            }
            content.push(children[i]);
            if (children.length > 1 && i < numSeparators) {
                content.push(<hr/>)
            }
        }
    } else if (type === "response") {
        // This is a response card being shown to a player who is answering
        // Number them if there are more than 1
        if (isSelected) {
            content.push(<label className="card-selected-index">{selectedIndex + 1}</label>)
        }
        content.push(children);
    }

    return <div className={className} {...others}>{content}</div>;
}

export default Card;
