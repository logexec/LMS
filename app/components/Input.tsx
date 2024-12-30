"use client";
import React, { ChangeEvent, useState } from "react";
import "./input.component.css";
import styled from "styled-components";

type InputProps = {
  label: string;
  name: string;
  id: string;
  required?: boolean;
  type:
    | "checkbox"
    | "date"
    | "email"
    | "file"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "text";
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholderText?: string;
};

const InputField: React.FC<{
  label: string;
  name: string;
  id: string;
  type: string;
  required: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}> = ({
  label,
  name,
  id,
  type,
  required,
  value,
  onChange,
  placeholder,
  className,
}) => (
  <div className={`input-container ${className}`}>
    <input
      placeholder={placeholder}
      className="input-field"
      type={type}
      name={name}
      id={id}
      required={required}
      value={value}
      onChange={onChange}
    />
    <label htmlFor={id} className="input-label">
      {label}
    </label>
    <span className="input-highlight"></span>
  </div>
);

const Input: React.FC<InputProps> = ({
  label,
  name,
  id,
  placeholder = label,
  required = false,
  type,
  value,
  onChange,
  className,
  placeholderText,
}) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setFileName(file.name);
    }
  };

  if (type === "file") {
    return (
      <div className={className}>
        <span className="input-label">Adjunto</span>
        <label htmlFor={id} className="labelFile">
          <span>
            <svg
              viewBox="0 0 184.69 184.69"
              xmlns="http://www.w3.org/2000/svg"
              id="Capa_1"
              version="1.1"
              width="60px"
              height="60px"
            >
              <svg
                viewBox="0 0 184.69 184.69"
                xmlns="http://www.w3.org/2000/svg"
                id="Capa_1"
                version="1.1"
                width="60px"
                height="60px"
              >
                <g>
                  <g>
                    <g>
                      <path
                        d="M149.968,50.186c-8.017-14.308-23.796-22.515-40.717-19.813
              C102.609,16.43,88.713,7.576,73.087,7.576c-22.117,0-40.112,17.994-40.112,40.115c0,0.913,0.036,1.854,0.118,2.834
              C14.004,54.875,0,72.11,0,91.959c0,23.456,19.082,42.535,42.538,42.535h33.623v-7.025H42.538
              c-19.583,0-35.509-15.929-35.509-35.509c0-17.526,13.084-32.621,30.442-35.105c0.931-0.132,1.768-0.633,2.326-1.392
              c0.555-0.755,0.795-1.704,0.644-2.63c-0.297-1.904-0.447-3.582-0.447-5.139c0-18.249,14.852-33.094,33.094-33.094
              c13.703,0,25.789,8.26,30.803,21.04c0.63,1.621,2.351,2.534,4.058,2.14c15.425-3.568,29.919,3.883,36.604,17.168
              c0.508,1.027,1.503,1.736,2.641,1.897c17.368,2.473,30.481,17.569,30.481,35.112c0,19.58-15.937,35.509-35.52,35.509H97.391
              v7.025h44.761c23.459,0,42.538-19.079,42.538-42.535C184.69,71.545,169.884,53.901,149.968,50.186z"
                        style={{ fill: "#010002" }}
                      ></path>
                    </g>
                    <g>
                      <path
                        d="M108.586,90.201c1.406-1.403,1.406-3.672,0-5.075L88.541,65.078
              c-0.701-0.698-1.614-1.045-2.534-1.045l-0.064,0.011c-0.018,0-0.036-0.011-0.054-0.011c-0.931,0-1.85,0.361-2.534,1.045
              L63.31,85.127c-1.403,1.403-1.403,3.672,0,5.075c1.403,1.406,3.672,1.406,5.075,0L82.296,76.29v97.227
              c0,1.99,1.603,3.597,3.593,3.597c1.979,0,3.59-1.607,3.59-3.597V76.165l14.033,14.036
              C104.91,91.608,107.183,91.608,108.586,90.201z"
                        style={{ fill: "#010002" }}
                      ></path>
                    </g>
                  </g>
                </g>
              </svg>
            </svg>
          </span>
          <p>
            {fileName ||
              placeholderText ||
              "Arrastra el archivo adjunto aquí o haz click para seleccionar un archivo."}
          </p>
        </label>
        <input
          className="input-file"
          name={name}
          id={id}
          type="file"
          required={required}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className={`input-container ${className}`}>
        <input
          type="date"
          name={name}
          id={id}
          required={required}
          className="input-field"
        />
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      </div>
    );
  }

  if (type === "checkbox") {
    const StyledWrapper = styled.div`
      .check {
        cursor: pointer;
        position: relative;
        margin: auto;
        width: 18px;
        height: 18px;
        -webkit-tap-highlight-color: transparent;
        transform: translate3d(0, 0, 0);
      }

      .check:before {
        content: "";
        position: absolute;
        top: -15px;
        left: -15px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(34, 50, 84, 0.03);
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .check svg {
        position: relative;
        z-index: 1;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke: #c8ccd4;
        stroke-width: 1.5;
        transform: translate3d(0, 0, 0);
        transition: all 0.2s ease;
      }

      .check svg path {
        stroke-dasharray: 60;
        stroke-dashoffset: 0;
      }

      .check svg polyline {
        stroke-dasharray: 22;
        stroke-dashoffset: 66;
      }

      .check:hover:before {
        opacity: 1;
      }

      .check:hover svg {
        stroke: #4285f4;
      }

      #cbx:checked + .check svg {
        stroke: #4285f4;
      }

      #cbx:checked + .check svg path {
        stroke-dashoffset: 60;
        transition: all 0.3s linear;
      }

      #cbx:checked + .check svg polyline {
        stroke-dashoffset: 42;
        transition: all 0.2s linear;
        transition-delay: 0.15s;
      }
    `;
    return (
      <StyledWrapper>
        <div className={`container ${className}`}>
          <input type="checkbox" id="cbx" style={{ display: "none" }} />
          <label htmlFor="cbx" className="check">
            <svg width="18px" height="18px" viewBox="0 0 18 18">
              <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
              <polyline points="1 9 7 14 15 4" />
            </svg>
          </label>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <InputField
      label={label}
      name={name}
      id={id}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default Input;
