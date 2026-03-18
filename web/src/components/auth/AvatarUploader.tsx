import React, { useRef, useState } from "react";
import axios from "axios";
import { uploadProfilePhoto } from "../../services/user";
import "./AvatarUploader.css";

type AvatarUploaderProps = {
  label?: string;
  onUploaded(newUrl: string): void;
};

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ label = "Trocar foto", onUploaded }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => {
    setError(null);
    inputRef.current?.click();
  };

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const buildErrorMessage = (err: unknown) => {
    if (err instanceof Error && err.message) return err.message;
    if (axios.isAxiosError(err)) {
      return (err.response?.data as any)?.message ?? "Não foi possível enviar a foto.";
    }
    return "Não foi possível enviar a foto.";
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Formato inválido. Use JPG, PNG ou WEBP.");
      resetInput();
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Imagem muito grande. Máx 2MB.");
      resetInput();
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { photoUrl } = await uploadProfilePhoto(file);
      onUploaded(photoUrl);
    } catch (err) {
      setError(buildErrorMessage(err));
    } finally {
      setIsUploading(false);
      resetInput();
    }
  };

  return (
    <div className="avatar-uploader" aria-live="polite">
      <button
        type="button"
        className={`avatar-uploader__button ${isUploading ? "is-uploading" : ""}`}
        onClick={openPicker}
        disabled={isUploading}
      >
        {isUploading ? "Salvando foto..." : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="avatar-uploader__input"
        onChange={handleFileChange}
      />
      {error ? (
        <div className="avatar-uploader__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
};

export default AvatarUploader;
