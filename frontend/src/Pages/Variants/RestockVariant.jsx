import React, { useState } from "react";
import { useVariant } from "../../hooks/useVariant";
import Modal from "../../components/Modal";
import { RotateCcw } from "lucide-react";
import TextInput from "../../components/TextInput";

function RestockVariant({ variantId }) {
  const { restockVariant } = useVariant();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    supplier_price: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await restockVariant(variantId, formData);
    setIsOpen(false);
  };

  return (
    <>
      <button className="btn btn-square" onClick={() => setIsOpen(true)}>
        <RotateCcw />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <TextInput
            label="Quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />

          <TextInput
            label="Supplier Price"
            type="number"
            step="0.01"
            name="supplier_price"
            value={formData.supplier_price}
            onChange={handleChange}
            required
          />

          <label className="block font-medium">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="textarea textarea-bordered w-full  bg-[#30475E] text-white"
            placeholder="Optional notes"
          />

          <button
            type="submit"
            className="btn bg-red-500 text-white border-red-500 w-full"
          >
            Restock
          </button>
        </form>
      </Modal>
    </>
  );
}

export default RestockVariant;
