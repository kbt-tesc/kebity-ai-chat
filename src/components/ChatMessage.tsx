import React, { HTMLAttributes, ReactNode } from "react";

// https://flowbite.com/docs/components/buttons/
//  flowbiteのデザインを導入

const ChatMessage = ({
    children,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
}) => {
    return (
        <div className="chat-message-container"
            {...props}
        >
            <p className="chat-message-content">{children}</p>
            <input type="checkbox" />
        </div>
    );
};

export default ChatMessage;