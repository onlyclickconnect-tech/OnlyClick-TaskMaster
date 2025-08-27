import { useState, useMemo, createContext, useContext } from "react";

const ModalContext = createContext();

export default function ModalProvider({ children }) {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(true);
  const [isAutoPayoutModalOpen, setIsAutoPayoutModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEnterAmountModalOpen, setIsEnterAmountModalOpen] = useState(false);
  const value = useMemo(
    () => ({
      isServiceModalOpen,
      setIsServiceModalOpen,
      isCustomModalOpen,
      setIsCustomModalOpen,
      isAutoPayoutModalOpen,
      setIsAutoPayoutModalOpen,
      isWithdrawModalOpen,
      setIsWithdrawModalOpen,
      isEnterAmountModalOpen,
      setIsEnterAmountModalOpen,
    }),
    [
      isServiceModalOpen,
      isCustomModalOpen,
      isAutoPayoutModalOpen,
      isWithdrawModalOpen,
      isEnterAmountModalOpen,
    ]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
