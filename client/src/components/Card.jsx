import React from 'react';
import './Card.css';
import CardBlank from './CardBlank';

const blank = /_+/g;

function Card({ isPrompt, isForJudge, children, selectedIndex, ...others }) {
    const cardType = isPrompt ? " prompt" : " response";
    const isSelected = selectedIndex > -1 ? " selected" : "";
    const hasClick = others.onClick ? " hasClick" : "";
 
    const content = [];

    if (isPrompt) {
        // We will replace the blanks in prompts with CardBlank elements so we can "enhance" them with number labels.
        // The rest of the text will be put inside normal label elements.
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
    } else if (isForJudge) {
        // This is a response card being presented to the judge at the end of a round
        // These need to be capable of showing more than one answer
        // Children will be an array of answers a player gave
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
    } else {
        // This is a response card being shown to a player who is answering
        // Number them if there are more than 1
        if (isSelected) {
            content.push(<label className="card-selected-index">{selectedIndex + 1}</label>)
        }
        content.push(children);
    }

    return <div className={"card" + cardType + isSelected + hasClick} {...others}>{content}</div>;
}

export default Card;
