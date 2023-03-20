import React, { ButtonHTMLAttributes } from "react";
import { ReactNode } from "react";

// https://flowbite.com/docs/components/buttons/
//  flowbiteのデザインを導入

const Button = ({
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
}) => {
    return (
        <button
            //className="px-4 py-2 rounded-full bg-blue-500 text-white border border-black shadow-lg m-4"
            className="text-white relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center m-4"
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;