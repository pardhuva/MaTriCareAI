function RoleButton({ title, color, onClick, speak }) {
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={speak} 
      className={`${color} text-white py-8 px-10 rounded-3xl text-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all w-full text-center`}
    >
      {title}
    </button>
  );
}

export default RoleButton;