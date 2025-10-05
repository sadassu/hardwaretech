import React, { useState, useRef } from "react";
import { Camera } from "lucide-react";
import api from "../../utils/api";
import { useAuthContext } from "../../hooks/useAuthContext";

const ChangeAvatar = () => {
  const { user, dispatch } = useAuthContext();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await api.post(`/profile/${user.userId}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });
      // Update auth context so UI updates immediately
      dispatch({
        type: "LOGIN",
        payload: { ...user, avatar: res.data.user.avatar },
      });
      setPreview(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-4">
      <div className="relative inline-block">
        {/* Avatar Image */}
        <img
          src={preview || user?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAvatarClick}
        />

        {/* Camera Icon Overlay */}
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploading}
          className="absolute cursor-pointer bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-focus transition-colors disabled:opacity-50"
        >
          <Camera size={20} />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Upload Status */}
      {uploading && <p className="mt-2 text-sm text-gray-600">Uploading...</p>}
    </div>
  );
};

export default ChangeAvatar;
