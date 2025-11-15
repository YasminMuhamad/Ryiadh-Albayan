const PrimaryButton = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full mt-4 bg-[var(--primary)] text-white py-2 rounded-full hover:opacity-90 transition"
    >
      {text}
    </button>
  );
};

export default PrimaryButton;
