import React, { useState } from "react";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import TextInput from "../../components/TextInput.jsx";
import { useVariant } from "../../hooks/useVariant.js";
import { Plus } from "lucide-react";

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

const CreateVariant = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasColor, setHasColor] = useState(false);
  const { createVariant } = useVariant();
  const [formData, setFormData] = useState({
    unit: "pcs",
    size: "",
    price: "",
    quantity: "",
    supplier_price: "",
    color: "",
    conversionSource: "",
    conversionQuantity: 1,
    autoConvert: false,
    conversionNotes: "",
  });

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

    if (!product?._id) {
      return toast.error("Product not specified");
    }

    await createVariant(product._id, formData, hasColor);

    // reset
    setFormData({
      unit: "pcs",
      size: "",
      price: "",
      quantity: "",
      supplier_price: "",
      color: "",
      conversionSource: "",
      conversionQuantity: 1,
      autoConvert: false,
      conversionNotes: "",
    });

    setHasColor(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-sm gap-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="Add Variant"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Variant</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-[#222831] text-white rounded-2xl w-full max-w-2xl shadow-2xl p-4 sm:p-6"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-1 sm:pr-2 space-y-6">
          <h2 className="text-xl font-semibold">
            Add Variant for "{product?.name}"
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="unit" className="block text-sm font-medium mb-1">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-[#30475E] text-white"
                >
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
                placeholder="e.g., small, medium"
                value={formData.size}
                onChange={handleChange}
                className="w-full"
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
                className="w-full"
              />

              <TextInput
                label="Retail Price"
                type="number"
                name="price"
                placeholder="Retail Price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full"
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
                className="w-full"
              />

              <div className="flex items-center gap-3 rounded-2xl border border-gray-600/40 px-4 py-3">
                <input
                  type="checkbox"
                  id="hasColor"
                  checked={hasColor}
                  onChange={(e) => setHasColor(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                <label htmlFor="hasColor" className="text-sm font-medium">
                  Variant has a color option
                </label>
              </div>
            </div>

            {hasColor && (
              <TextInput
                label="Color"
                type="text"
                name="color"
                placeholder="e.g., Red, Blue"
                value={formData.color}
                onChange={handleChange}
                required={hasColor}
                className="w-full"
              />
            )}

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
                      <option value="">Select a variant to break down</option>
                      {product?.variants?.map((variant) => (
                        <option key={variant._id} value={variant._id}>
                          {variant.size
                            ? `${variant.size} ${variant.unit}`
                            : variant.unit}{" "}
                          • Stock: {variant.quantity ?? 0}
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
                      className="w-full"
                    />

                    <TextInput
                      label="Conversion Notes (optional)"
                      type="text"
                      name="conversionNotes"
                      placeholder="e.g., 1 set = 100 meters"
                      value={formData.conversionNotes}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn text-white border-red-500 bg-red-500 w-full"
            >
              Create Variant
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default CreateVariant;
