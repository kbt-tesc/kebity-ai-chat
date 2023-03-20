import React, { TextareaHTMLAttributes, useState } from "react";

//const TextBox = (props: InputHTMLAttributes<HTMLInputElement> & {children: ReactNode}) => {   ///< inputタグはchildren要素カットで良いんじゃない？
const TextBox = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    const [text, setText] = useState('');
    return (
        <>
            <textarea
                className="px-4 py-2 rounded-full bg-white text-black border border-gray-500 m-4"
                {...props}
            />
        </>
    );
};
export default TextBox;