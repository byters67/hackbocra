import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link to="/" className="hover:text-bocra-blue" aria-label="Home">
        <Home size={16} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight size={14} />
          {item.href ? (
            <Link to={item.href} className="hover:text-bocra-blue">{item.label}</Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
