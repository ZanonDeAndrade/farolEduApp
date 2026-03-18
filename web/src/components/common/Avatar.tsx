import React, { useEffect, useMemo, useState } from "react";
import "./Avatar.css";

type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  onClick?: () => void;
  className?: string;
};

const getInitials = (name: string) => {
  const clean = (name || "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({ name, photoUrl, size = 40, onClick, className }) => {
  const [failed, setFailed] = useState(false);
  const clickable = typeof onClick === "function";
  const initials = useMemo(() => getInitials(name), [name]);
  const hasImage = Boolean(photoUrl) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`avatar ${hasImage ? "has-image" : "is-initials"} ${clickable ? "is-clickable" : ""} ${
        className ?? ""
      }`.trim()}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: Math.max(12, Math.round(size / 2.15)),
      }}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      aria-label={clickable ? `Foto de ${name}. Clique para alterar.` : `Avatar de ${name}`}
    >
      {hasImage ? (
        <img src={photoUrl!} alt={`Foto de ${name}`} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
      {clickable ? <span className="avatar__hint" aria-hidden="true">Editar</span> : null}
    </div>
  );
};

export default Avatar;
