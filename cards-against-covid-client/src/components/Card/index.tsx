import React, { HTMLAttributes, MouseEventHandler, ReactElement } from "react";
import classNames from "classnames";
import CardBlank from "./CardBlank";
import "./Card.css";

type SingleCardProps = {
    type: "prompt" | "response";
    children: string;
}

type MultiCardProps = {
    type: "multi-response";
    children: string[];
}

type CardProps = HTMLAttributes<HTMLElement> & (SingleCardProps | MultiCardProps) & {
    selectedIndex?: number;
    showIndex?: boolean;
    onClick?: MouseEventHandler;
    disabled?: boolean;
};

const blank = /_+/g;

function Card({ type, children, selectedIndex = -1, showIndex, onClick, ...others }: CardProps): ReactElement {
    /* Figure out which css classes to give the card. It always has 'card', will have exactly one
     * of [prompt, response, multi-response], and 0 or more of [clickable, selected]
     */
    const clickable = typeof onClick === "function";
    const selected = selectedIndex > -1;
    const className = classNames(["card", type, { clickable, selected }]);

    // This will be an array of JSX Elements that go inside the card
    const content = [];
    let label = "";

    if (type === "prompt") {
        /* We will replace the blanks in prompts with CardBlank elements, which are numbered.
         * The rest of the text will be put inside <label> elements.
         */
        const blanks = (children as string).match(blank) || [];

        // Create label elements from text -- "children" should be a string containing card text
        const textNodes = (children as string)
            .split(blank)
            .map((text, i) => <span key={i}>{text}</span>);

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
                content.push(<CardBlank key={`blank${j}`} index={indexLabel} />);
                j++;
            }
        }
        label = (children as string).replace(blank, " blank ");
    } else if (type === "multi-response") {
        /* This is a special response card used to show a user's response as one entity even if it
         * contained multiple cards. Notice that the "children" attribute is an array of strings.
         */
        const numSeparators = children.length - 1;
        for (let i = 0; i < children.length; i++) {
            if (children.length > 1) {
                content.push(<span key={`index${i}`} className="card-response-index">{i + 1}</span>);
                label += `response number ${i + 1}: `;
            }
            content.push(<span key={`text${i}`}>{children[i]}</span>);
            label += `${children[i]}. `;
            if (children.length > 1 && i < numSeparators) {
                content.push(<hr key={`break${i}`} />);
            }
        }
    } else if (type === "response") {
        // This is a response card being shown to a player who is answering
        // Number them if there are more than 1
        if (showIndex && selectedIndex > -1) {
            content.push(<span key="index" className="card-selected-index">{selectedIndex + 1}</span>);
        }
        content.push(<span key="text">{children}</span>);
        label = (children as string);
        if (showIndex && selectedIndex > -1) {
            label += ` - selection number ${selectedIndex + 1}`;
        }
    }

    if (clickable) {
        return (
            <button type="button" aria-pressed={selected} aria-label={label} {...{ className, onClick, ...others }}>
                <div className="card-content" tabIndex={-1} aria-hidden="true">{content}</div>
            </button>
        );
    }

    return (
        <div {...{ className, ...others }}>
            <div className="card-content" tabIndex={-1} aria-hidden="true">{content}</div>
            <span className="sr-only">{label}</span>
        </div>
    );
}

export default Card;
