const categories = [
  {
    name: 'Joyería Femenina',
    imageUrl: 'https://picsum.photos/seed/jf/1200/1600',
  },
  {
    name: 'Joyería de Hombre',
    imageUrl: 'https://picsum.photos/seed/jm/1200/1600',
  },
  {
    name: 'Ropa de Mujer',
    imageUrl: 'https://picsum.photos/seed/rf/1200/1600',
  },
  {
    name: 'Ropa de Varón',
    imageUrl: 'https://picsum.photos/seed/rm/1200/1600',
  },
];

export default function ProductGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => (
        <div key={category.name} className="relative h-[80vh] group overflow-hidden">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out filter grayscale group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h3 className="text-4xl font-serif text-white text-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out">
              {category.name}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
