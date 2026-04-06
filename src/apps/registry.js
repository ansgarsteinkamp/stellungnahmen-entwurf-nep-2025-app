const modules = import.meta.glob("./app*/index.jsx", { eager: true });

const registry = Object.values(modules)
   .map(m => m.default)
   .sort((a, b) => a.id - b.id);

export default registry;
