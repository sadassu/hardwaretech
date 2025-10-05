import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { SquarePen } from "lucide-react";

function ChangeName({ onUpdateSuccess }) {
  const { user, dispatch } = useAuthContext();
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await api.put(
        `/profile/${user.userId}/change-name`,
        { name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      dispatch({ type: "UPDATED_USER", payload: res.data.user });

      localStorage.setItem("user", JSON.stringify(res.data.user));

      setIsOpen(false);

      if (onUpdateSuccess) onUpdateSuccess(res.data.user);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn bg-red-500 text-white rounded-xl"
      >
        <SquarePen />
        Change Name
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4 w-96">
            <h2 className="text-xl font-semibold">Change Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
            <button type="submit" className="btn btn-primary w-full">
              Update
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default ChangeName;
