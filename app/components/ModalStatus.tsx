import React from "react";
import { createPortal } from "react-dom";
import "./modal-status.component.css";

interface ModalProps {
  error?: boolean;
  information?: boolean;
  success?: boolean;
  text: string;
  suggestion?: string;
}

const ModalStatus: React.FC<ModalProps> = ({
  error,
  information,
  success,
  text,
  suggestion,
}) => {
  return createPortal(
    <div
      className={`fixed top-0 left-0 w-screen h-screen bg-black/20 flex items-center justify-center z-50 duration-300 backdrop-blur-sm`}
    >
      <div
        className={`bg-white p-8 rounded-lg w-[28rem] duration-300 fade-in-200`}
      >
        <div className="flex flex-col justify-center items-center my-5">
          {success && (
            <div className="modal-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="svg-success"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                >
                  <circle
                    className="success-circle-outline"
                    cx="12"
                    cy="12"
                    r="11.5"
                  />
                  <circle
                    className="success-circle-fill"
                    cx="12"
                    cy="12"
                    r="11.5"
                  />
                  <polyline
                    className="success-tick"
                    points="17,8.5 9.5,15.5 7,13"
                  />
                </g>
              </svg>
            </div>
          )}
          {error && (
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="svg-icon svg-error"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                >
                  <circle
                    className="error-circle-outline"
                    cx="12"
                    cy="12"
                    r="11.5"
                  />
                  <circle
                    className="error-circle-fill"
                    cx="12"
                    cy="12"
                    r="11.5"
                  />
                  <line className="error-cross" x1="8" y1="8" x2="16" y2="16" />
                  <line className="error-cross" x1="16" y1="8" x2="8" y2="16" />
                </g>
              </svg>
            </div>
          )}
          {information && (
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="svg-icon svg-info"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                >
                  <circle
                    className="info-circle-outline"
                    cx="12"
                    cy="12"
                    r="11.5"
                  />
                  <circle
                    className="info-circle-fill"
                    cx="12"
                    cy="12"
                    r="11.5"
                  />
                  <line
                    className="info-symbol"
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="14"
                  />
                  <circle className="info-symbol" cx="12" cy="17" r="0.5" />
                </g>
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-bold fade-in-700">{text}</h2>
          {suggestion !== "" && (
            <p className="text-base text-slate-700 mt-2">{suggestion}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalStatus;
