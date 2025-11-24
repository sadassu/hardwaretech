import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import TextInput from "../../components/TextInput.jsx";
import { useVariant } from "../../hooks/useVariant.js";
import { Edit } from "lucide-react";

const UNIT_OPTIONS = [
  "pcs",
  "kg",
  "g",
  "lb",
  "m",
  "cm",
  "ft",
  "set",
  "W",
  "V",
  "amphere",
  "gang",
  "box",
  "pack",
  "roll",
];

const UpdateVariant = ({ variant, product }) => {
  const { updateVariant } = useVariant();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    unit: "",
    size: "",
    color: "",
    supplier_price: "",
    price: "",
    quantity: "",
    conversionSource: "",
    conversionQuantity: 1,
    autoConvert: false,
    conversionNotes: "",
  });

  useEffect(() => {
    if (isOpen && variant) {
      setFormData({
        unit: variant.unit || "",
        size: variant.size || "",
        color: variant.color || "",
        price: variant.price || "",
        supplier_price: variant.supplier_price || "",
        quantity: variant.quantity || "",
        conversionSource:
          (typeof variant.conversionSource === "object"
            ? variant.conversionSource?._id
            : variant.conversionSource) || "",
        conversionQuantity: variant.conversionQuantity || 1,
        autoConvert: Boolean(variant.autoConvert),
        conversionNotes: variant.conversionNotes || "",
      });
    }
  }, [isOpen, variant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const nextValue = type === "checkbox" ? checked : value;
      const updated = {
        ...prev,
        [name]: nextValue,
      };

      if (name === "autoConvert" && !checked) {
        updated.conversionSource = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!variant?._id) return toast.error("No variant selected");

    const payload = { ...formData };
    if (!payload.unit) delete payload.unit;
    if (!payload.color) delete payload.color;

    await updateVariant(variant._id, payload);
    setIsOpen(false);
  };

  return (
    <>
        <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
          onClick={() => setIsOpen(true)}
        title="Update Variant"
        >
        <Edit className="w-4 h-4" />
        </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-[#222831] text-white rounded-2xl w-full max-w-2xl shadow-2xl p-4 sm:p-6"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-1 sm:pr-2 space-y-6">
          <h2 className="text-xl font-semibold">Update Variant</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-gray-200">
                    Unit
                  </span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-[#30475E] text-white"
                  required
                >
                  <option value="">No Unit</option>
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <TextInput
                label="Size"
                type="text"
                name="size"
                placeholder="Size (e.g., Small, Medium)"
                value={formData.size}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Supplier Price"
                type="number"
                name="supplier_price"
                placeholder="Supplier price"
                value={formData.supplier_price}
                onChange={handleChange}
                required
              />

              <TextInput
                label="Price"
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Quantity"
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              <TextInput
                label="Color (if applicable)"
                type="text"
                name="color"
                placeholder="Color (e.g., Red, Blue)"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="p-4 border border-dashed border-gray-300/60 rounded-2xl space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="autoConvert"
                  checked={formData.autoConvert}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                Allow this variant to convert from another variant
              </label>

              {formData.autoConvert && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Source Variant
                    </label>
                    <select
                      name="conversionSource"
                      value={formData.conversionSource}
                      onChange={handleChange}
                      className="select select-bordered w-full bg-[#30475E] text-white"
                      required
                    >
                      <option value="">Select a variant</option>
                      {product?.variants
                        ?.filter((v) => v._id !== variant?._id)
                        .map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.size ? `${v.size} ${v.unit}` : v.unit} • Stock:{" "}
                            {v.quantity ?? 0}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Units per source"
                      type="number"
                      name="conversionQuantity"
                      min="1"
                      value={formData.conversionQuantity}
                      onChange={handleChange}
                      required
                    />

                    <TextInput
                      label="Conversion Notes (optional)"
                      type="text"
                      name="conversionNotes"
                      placeholder="e.g., 1 box = 24 pcs"
                      value={formData.conversionNotes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn bg-red-500 text-white border-red-500 w-full"
            >
              Update Variant
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default UpdateVariant;
