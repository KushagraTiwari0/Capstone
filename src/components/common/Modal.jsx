// import { useEffect } from 'react';

// const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const sizes = {
//     sm: 'max-w-md',
//     md: 'max-w-lg',
//     lg: 'max-w-2xl',
//     xl: 'max-w-4xl'
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
//       <div 
//         className={`bg-white rounded-lg shadow-xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {title && (
//           <div className="flex items-center justify-between p-6 border-b">
//             <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
//             >
//               ×
//             </button>
//           </div>
//         )}
//         <div className="p-6">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Modal;



import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    // FIX: Changed z-50 to z-[60] to stay above the Navbar
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`bg-white rounded-xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto transform transition-all scale-100 opacity-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-white">
            <h2 className="text-2xl font-bold text-gray-800 font-fredoka">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-3xl font-bold transition-colors leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;