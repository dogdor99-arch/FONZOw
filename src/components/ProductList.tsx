import React from 'react';

const ProductList: React.FC = () => {
  const products = [
    { id: 1, name: 'Guitar', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800' },
    { id: 2, name: 'Bass', image: 'https://images.unsplash.com/photo-1567033084229-02b8ebe1b8a7?w=800' },
    { id: 3, name: 'Drums', image: 'https://images.unsplash.com/photo-1567033084229-02b8ebe1b8a7?w=800' }
  ];

  return (
    <ul className="flex flex-col gap-y-4">
      {products.map(product => (
        <li key={product.id} className="flex items-center gap-x-4">
          <img src={product.image} alt={product.name} width="100" height="100" />
          <div>
            <h3>{product.name}</h3>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProductList;