import React, { useEffect, useState } from "react";
import { useCategoriesStore } from "../../store/categoriesStore";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router";

function CategoryList() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    deleteCategory,
    addCategory,
  } = useCategoriesStore();

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "add" or "delete"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Fetch categories once
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [fetchCategories, categories.length]);

  // DELETE CATEGORY
  const openDeleteModal = (category) => {
    setModalType("delete");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCategory) await deleteCategory(selectedCategory._id);
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  // ADD CATEGORY
  const openAddModal = () => {
    setModalType("add");
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Category name is required.");
    await addCategory(formData);
    setIsModalOpen(false);
    setFormData({ name: "", description: "" });
  };

  // COMMON
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  // MAIN TABLE UI
  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => navigate(-1)} // ✅ Go back to previous page
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-200"
      >
        ← Back
      </button>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Categories</h1>
          <p className="text-base-content/70 mt-2">
            Manage all product categories
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary text-white">
          + Add Category
        </button>
      </div>

      {/* Table Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="font-semibold">#</th>
                  <th className="font-semibold">Name</th>
                  <th className="font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories && categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <tr key={cat._id} className="hover">
                      <td className="text-sm">{index + 1}</td>
                      <td className="font-semibold text-sm">{cat.name}</td>
                      <td className="text-center">
                        <button
                          onClick={() => openDeleteModal(cat)}
                          className="btn btn-error btn-sm text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <div className="flex flex-col items-center space-y-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-base-content/20"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-base-content/60">
                          No categories found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Delete Modals */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {modalType === "delete" && (
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Delete “{selectedCategory?.name}”?
            </h3>
            <p className="text-base-content/70 mb-4">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={handleCloseModal} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-error text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {modalType === "add" && (
          <form onSubmit={handleAddCategory} className="p-4">
            <h3 className="text-lg font-semibold mb-3">Add New Category</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Category name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="textarea textarea-bordered w-full"
                placeholder="Optional description"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary text-white">
                Add
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default CategoryList;
