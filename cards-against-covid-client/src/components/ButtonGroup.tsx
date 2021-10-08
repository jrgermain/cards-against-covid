import React, { FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent, ReactElement, useEffect, useRef, useState } from "react";

type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactElement[];
    disabled?: boolean;
}

/**
 * A container element meant to wrap a group of buttons or links. When this container has focus,
 * the user can use the arrow keys to switch focus between the child elements.
 */
function ButtonGroup({ disabled, ...props }: ButtonGroupProps): ReactElement {
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const groupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const button = groupRef.current?.children[selectedIndex];
        if (button) {
            (button as HTMLElement).focus();
        }
    }, [selectedIndex]);

    const handleKeyDown = (event: KeyboardEvent) => {
        const length = groupRef.current?.children?.length;
        if (!length || !event.key.startsWith("Arrow")) {
            return;
        }

        /*
         * If the user hits the up or left arrows, move backwards in the button group.
         * If they hit the down or right arrows, move forwards.
         * Wrap around if they reach the end.
         */
        const direction = event.key.slice(5);
        if (direction === "Left" || direction === "Up") {
            setSelectedIndex((selectedIndex - 1 + length) % length);
        } else {
            setSelectedIndex((selectedIndex + 1) % length);
        }
    };

    const handleFocus = (event: FocusEvent) => {
        // If the button group is the element being focused (not any of its children)
        if (event.target === groupRef.current && selectedIndex === -1) {
            setSelectedIndex(0);
        }
    };

    const handleMouseDown = (event: MouseEvent) => {
        // If the user clicks button N, set selected index to N
        const childNodes = groupRef?.current?.childNodes;
        if (!childNodes || !event.target) {
            return;
        }

        const children = Array.from(childNodes);
        const target = event.target as ChildNode;

        if (children.includes(target)) {
            setSelectedIndex(children.indexOf(target));
        }
    };

    const handleBlur = (event: FocusEvent<HTMLElement>) => {
        // If the button group is tabbed out of and the element gaining focus (relatedTarget) is not
        // one of its children
        if (!event.relatedTarget || !groupRef?.current?.contains(event.relatedTarget as Node)) {
            setSelectedIndex(-1);
        }
    };

    return (
        <div
            ref={groupRef}
            className="button-group"
            tabIndex={disabled ? undefined : 0}
            onKeyDown={disabled ? undefined : handleKeyDown}
            onFocus={disabled ? undefined : handleFocus}
            onBlur={disabled ? undefined : handleBlur}
            onMouseDown={disabled ? undefined : handleMouseDown}
            {...props}
        />
    );
}

export default ButtonGroup;
