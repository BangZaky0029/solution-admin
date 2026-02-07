import { FC } from 'react';

const Footer: FC = () => {
    return (
        <footer className="hidden md:block bg-white border-t border-gray-200 px-4 py-1.5 md:px-6 md:py-3 text-center transition-all duration-300">
            <p className="text-[10px] md:text-sm text-gray-500 font-medium tracking-tight">
                © {new Date().getFullYear()} Gateway APTO • Built with 💜
            </p>
        </footer>
    );
};

export default Footer;
