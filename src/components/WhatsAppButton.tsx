const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5521995612947"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 animate-bounce"
      aria-label="Fale conosco no WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.503 1.132 6.745 3.054 9.378L1.054 31.2l6.057-1.94a15.924 15.924 0 008.893 2.696C24.828 31.956 32 24.78 32 16.004 32 7.176 24.828 0 16.004 0zm9.32 22.608c-.39 1.1-2.28 2.1-3.14 2.18-.81.08-1.56.38-5.26-1.1-4.46-1.78-7.3-6.38-7.52-6.68-.22-.3-1.82-2.42-1.82-4.62s1.14-3.28 1.56-3.72c.4-.44.88-.56 1.18-.56.3 0 .58 0 .84.02.28.02.64-.1.98.76.36.88 1.2 2.94 1.3 3.16.1.22.18.48.04.76-.14.3-.22.48-.42.74-.22.26-.44.58-.64.78-.22.22-.44.44-.18.88.24.42 1.1 1.82 2.36 2.94 1.62 1.44 2.98 1.9 3.42 2.1.42.22.68.18.92-.1.26-.28 1.06-1.24 1.34-1.66.28-.42.56-.36.94-.22.38.16 2.44 1.16 2.86 1.36.42.22.7.32.8.5.12.18.12 1.02-.28 2.02z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
