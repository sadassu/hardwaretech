import React, { useState } from "react";
import api from "../../utils/api";
import { useAuthContext } from "../../hooks/useAuthContext";

const ChangeAvatar = () => {
  const { user, dispatch } = useAuthContext();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.avatar.files[0];
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
      e.target.reset();
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="mt-4 space-y-3">
      {/* Current Avatar */}
      <div className="flex items-center gap-4">
        <img
          src={preview || user?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-16 h-16 rounded-full object-cover border"
        />

        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full max-w-xs"
        />
      </div>

      {/* Upload Button */}
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Change Avatar"}
      </button>
    </form>
  );
};

export default ChangeAvatar;
