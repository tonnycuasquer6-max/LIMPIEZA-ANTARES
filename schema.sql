CREATE TYPE product_category AS ENUM ('Joya', 'Ropa');

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category product_category NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url TEXT,
  custom_options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data for testing
INSERT INTO products (name, category, price, stock, image_url, custom_options)
VALUES
('Collar de Diamantes "Eternidad"', 'Joya', 2500.00, 5, 'https://picsum.photos/seed/j1/600/800', '{"materiales": ["Oro Blanco", "Platino"], "gemas": ["Diamante", "Zafiro"]}'),
('Chaqueta de Cuero "Nómada"', 'Ropa', 850.00, 15, 'https://picsum.photos/seed/c1/600/800', '{"tallas": ["S", "M", "L", "XL"], "colores": ["Negro", "Marrón"]}'),
('Anillo de Compromiso "Infinito"', 'Joya', 3200.00, 3, 'https://picsum.photos/seed/j2/600/800', '{"grabado_personalizado": true, "metal": ["Oro Rosa", "Platino"]}'),
('Vestido de Seda "Ocaso"', 'Ropa', 680.00, 20, 'https://picsum.photos/seed/c2/600/800', '{"tallas": ["XS", "S", "M"], "colores": ["Rojo", "Azul Marino"]}');
