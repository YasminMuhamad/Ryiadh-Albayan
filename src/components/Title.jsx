import React from "react";

export default function Title(props) {
    return (
        <div>
            <div className="text-dark text-lg">
                {props.enTitle}
            </div>
            <div className="text-gray-500 mb-4">
                {props.arTitle}
            </div>
        </div>
    );
}