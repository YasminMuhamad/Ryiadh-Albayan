import React from "react";

export default function Title(props) {
    return (
        <div>
            <div className={`text-dark ${props.className}`} >
                {props.enTitle}
            </div>
            <div className={`text-gray-500 ${props.className}`}>
                {props.arTitle}
            </div>
        </div>
    );
}