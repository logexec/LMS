"use client";

import { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface FileUploadState {
  files: {
    id: string;
    file: File | { name: string; size: number; type: string };
  }[];
  isDragging: boolean;
  errors: string[];
}

interface FileUploadActions {
  handleDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  openFileDialog: () => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  getInputProps: () => {
    type: string;
    multiple: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
  };
}

export interface FileUploadOptions {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  onDrop?: (acceptedFiles: File[]) => void;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function useFileUpload(options: FileUploadOptions = {}): [
  FileUploadState,
  FileUploadActions
] {
  const {
    multiple = false,
    accept,
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    disabled = false,
    onDrop,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    files: [],
    isDragging: false,
    errors: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { acceptedFiles: File[]; rejectedFiles: string[] } => {
      const acceptedFiles: File[] = [];
      const rejectedFiles: string[] = [];

      files.forEach((file) => {
        // Check file size
        if (file.size > maxSize) {
          rejectedFiles.push(
            `"${file.name}" excede el tamaño máximo de ${formatBytes(maxSize)}`
          );
          return;
        }

        // Check file type (if accept is provided)
        if (accept) {
          const acceptTypes = accept.split(",").map((type) => type.trim());
          const fileType = file.type;
          const fileExtension = `.${file.name.split(".").pop()}`;

          const isAccepted = acceptTypes.some((type) => {
            // Check if the file type matches directly
            if (fileType === type) return true;
            // Check if the file type starts with the accepted type (e.g. image/*)
            if (type.endsWith("*") && fileType.startsWith(type.slice(0, -1)))
              return true;
            // Check if the file extension matches
            if (type.startsWith(".") && fileExtension === type) return true;
            return false;
          });

          if (!isAccepted) {
            rejectedFiles.push(
              `"${file.name}" no es un tipo de archivo válido`
            );
            return;
          }
        }

        acceptedFiles.push(file);
      });

      return { acceptedFiles, rejectedFiles };
    },
    [accept, maxSize]
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      if (disabled) return;

      // Convert FileList to array
      const filesArray = Array.from(fileList);

      // Validate files
      const { acceptedFiles, rejectedFiles } = validateFiles(filesArray);

      // Check max files
      if (!multiple && acceptedFiles.length > 1) {
        setState((prev) => ({
          ...prev,
          errors: ["Solo puedes subir un archivo"],
        }));
        return;
      }

      if (
        multiple &&
        state.files.length + acceptedFiles.length > maxFiles
      ) {
        setState((prev) => ({
          ...prev,
          errors: [`No puedes subir más de ${maxFiles} archivos`],
        }));
        return;
      }

      // Add accepted files
      if (acceptedFiles.length > 0) {
        setState((prev) => {
          let newFiles;
          if (multiple) {
            newFiles = [
              ...prev.files,
              ...acceptedFiles.map((file) => ({
                id: uuidv4(),
                file,
              })),
            ];
          } else {
            newFiles = [
              {
                id: uuidv4(),
                file: acceptedFiles[0],
              },
            ];
          }

          return {
            ...prev,
            files: newFiles,
            errors: rejectedFiles,
          };
        });
      } else {
        setState((prev) => ({
          ...prev,
          errors: rejectedFiles,
        }));
      }

      // Call onDrop callback if provided
      if (onDrop && acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }
    },
    [disabled, maxFiles, multiple, onDrop, state.files.length, validateFiles]
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;

      setState((prev) => ({ ...prev, isDragging: true }));
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;

      setState((prev) => ({ ...prev, isDragging: false }));
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;

      setState((prev) => ({ ...prev, isDragging: false }));
      handleFiles(event.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const removeFile = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((file) => file.id !== id),
      errors: [],
    }));
  }, []);

  const clearFiles = useCallback(() => {
    setState((prev) => ({
      ...prev,
      files: [],
      errors: [],
    }));
  }, []);

  const getInputProps = useCallback(() => {
    return {
      type: "file",
      multiple,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
          handleFiles(event.target.files);
        }
        // Reset input value so the same file can be uploaded again
        event.target.value = "";
      },
      accept,
      ref: inputRef,
    };
  }, [accept, handleFiles, multiple]);

  return [
    state,
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ];
}