import React, { useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload } from "react-icons/fi";
import "./styles.css"

interface DropzoneProps {
  onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileUploaded }) => {
  const [selectedFileUtl, setSelectedFileUrl] = useState("");

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];

    const fileUrl = URL.createObjectURL(file);

    setSelectedFileUrl(fileUrl);
    onFileUploaded(file);
  }, [onFileUploaded])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: "image/*"
  })

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} accept="image/*"/>
      { selectedFileUtl
        ? (<img src={selectedFileUtl} alt="Point thumbnail" />)
        : (isDragActive
             ? (<p>Solte a imagem aqui ...</p>)
             : (
                 <p>
                  <FiUpload/>
                  Imagem do estabelecimento
                </p>
              )
          )
      }
    </div>
  )
}

export default Dropzone;