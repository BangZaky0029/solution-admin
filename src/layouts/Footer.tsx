import { FC } from 'react';

const Footer: FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 px-6 py-3 text-center">
            <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Gateway APTO • Built with 💜
            </p>
        </footer>
    );
};

export default Footer;
