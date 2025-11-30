import React from 'react';

export default function Breadcrumb({ items }) {
  return (
    <>
    <div className='flex justify-between items-center'>
    <nav className="flex " aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index !== items.length - 1 ? (
              <div className="flex items-center">
                <a
                  href={item.href}
                  className="inline-flex items-center text-base font-medium text-gray-900 hover:text-indigo-800"
                >
                  {item.text}
                </a>
                <svg
                  className="mx-1 w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 15L11.0858 11.4142C11.7525 10.7475 12.0858 10.4142 12.0858 10C12.0858 9.58579 11.7525 9.25245 11.0858 8.58579L7.5 5"
                    stroke="#E5E7EB"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              <span className="ml-1 text-base font-medium text-indigo-600 md:ml-2">
                {item.text}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
    
    </div>
    </>
    
  );
}
