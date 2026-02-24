import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Results', path: '/results' },
    { name: 'Demo Classes', path: '/demo-classes' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
];

export const Navigation = () => {
    const location = useLocation();

    return (
        <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
                <Link
                    key={link.path}
                    to={link.path}
                    className={`font-medium transition-colors duration-200 ${location.pathname === link.path
                            ? 'text-amber-600 font-semibold'
                            : 'text-stone-700 hover:text-amber-600'
                        }`}
                >
                    {link.name}
                </Link>
            ))}
        </div>
    );
};
