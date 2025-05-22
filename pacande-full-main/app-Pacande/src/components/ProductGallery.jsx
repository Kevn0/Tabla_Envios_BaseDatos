import React from "react";
import ProductCard from "./ProductCard";
import "uikit/dist/css/uikit.min.css";

const ProductGallery = ({ products, showSizes }) => {
  return (
    <div
      className="uk-grid uk-child-width-1-3@m uk-child-width-1-2@s uk-grid-match"
      data-uk-grid
    >
      {products.map((product, index) => (
        <div key={product._id || index}>
          <ProductCard
            _id={product._id}
            title={product.name}
            price={product.price}
            image={product.image}
            description={product.description}
            category={product.category}
            subcategory={product.subcategory}
            specifications={product.specifications}
            showSizes={showSizes}
            sizes={product.sizes}
            discount={product.discount}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGallery;
