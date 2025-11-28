import React, { useState } from "react";
import { useVariant } from "../../hooks/useVariant";
import Modal from "../../components/Modal";
import { RotateCcw } from "lucide-react";
import TextInput from "../../components/TextInput";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

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

  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await confirm({
      title: "Restock this variant?",
      text: "Quantity and supplier cost will be updated.",
      confirmButtonText: "Yes, restock",
    });
    if (!result.isConfirmed) return;

    try {
      await restockVariant(variantId, formData);
      quickToast({
        title: "Variant restocked",
        icon: "success",
      });
    } catch (error) {
      quickToast({
        title: "Failed to restock",
        text: error.response?.data?.message || error.message,
        icon: "error",
      });
      return;
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="Restock Variant"
      >
        <RotateCcw className="w-4 h-4" />
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
