/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Auth from './components/Auth';
import { areSupabaseCredentialsSet, supabase } from './services/supabase';
import { useState, useEffect, useCallback, useMemo } from 'react';

const LOGO_URL = "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/aa.png"; 
const FONDO_HEADER_URL = "/fondo-header.png"; 

// FUNCION PARA OBTENER EL MOCKUP SEGUN LA PRENDA Y VISTA
const getMockupUrl = (prenda, vista) => {
  if (prenda === 'Capucha') return vista === 'frente' ? "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/IMG_1120.png" : "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/IMG_1121.png";
  if (prenda === 'Buso') return vista === 'frente' ? "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/85.png" : "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/86.png";
  if (prenda === 'Hoodie') return vista === 'frente' ? "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/83.png" : "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/84.png";
  return vista === 'frente' ? "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/81.png" : "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/82.png";
};

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('cliente'); 
  
  const [activeView, setActiveView] = useState('home');
  const [activeCategory, setActiveCategory] = useState(''); 
  const [activeSubCategory, setActiveSubCategory] = useState('Todo');
  
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [nuevaPieza, setNuevaPieza] = useState({ 
    titulo: '', descripcion: '', costo: '', precio: '', disponibilidad: '', subcategoria: '', tallas: {}, color: '', imagen: null, imagen_url: '' 
  });
  
  const [productos, setProductos] = useState([]);
  const [categoriasDescarga, setCategoriasDescarga] = useState([]);
  const [menuPdfExpandido, setMenuPdfExpandido] = useState(null);
  const [hiddenItems, setHiddenItems] = useState([]);
  
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState({});

  const [stars, setStars] = useState([]);
  const [cartPulse, setCartPulse] = useState(false);

  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [perfilForm, setPerfilForm] = useState({
    tratamiento: '', nombre: '', apellidos: '', dia: '', mes: '', anio: '', prefijo: '+593', telefono: '', newsletter: false
  });

  const [checkoutPaso, setCheckoutPaso] = useState(1);
  const [envioConfig, setEnvioConfig] = useState({ tipo: 'local', sectorPrecio: 0, sectorNombre: 'Quito Centro', linkMaps: '' });
  const [comprobantePago, setComprobantePago] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [listaPedidos, setListaPedidos] = useState([]);
  const [pedidoExpandido, setPedidoExpandido] = useState(null);

  const [filtroColor, setFiltroColor] = useState('Todo');
  const [filtroTalla, setFiltroTalla] = useState('Todo');
  const [ordenPrecio, setOrdenPrecio] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [openFormSelect, setOpenFormSelect] = useState(null);

  // ESTADOS DEL ATELIER PRÊT-À-PORTER (CUSTOMIZADOR)
  const [customPrenda, setCustomPrenda] = useState('Camiseta'); 
  const [customVista, setCustomView] = useState('frente'); 
  const [customColor, setCustomColor] = useState('#ffffff');
  const [customLogo, setCustomLogo] = useState(null);
  const [customPlacement, setCustomPlacement] = useState('centro-pecho');
  const [customRenderedImage, setCustomRenderedImage] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [sizeOffset, setSizeOffset] = useState(0); 
  const [yOffset, setYOffset] = useState(0); 

  // NUEVOS ESTADOS PARA SOPORTE TÁCTIL (CELULARES/IPAD)
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);

  const tallasDisponibles = ['6', '7', '8', '9', '10', '11', '12'];
  const sectoresQuito = [
    { nombre: 'Quito Centro', precio: 1.00 },
    { nombre: 'Quito Sur (Quitumbe)', precio: 1.50 },
    { nombre: 'Quito Sur (De Quitumbe hacia el sur)', precio: 2.00 },
    { nombre: 'Quito Norte', precio: 2.00 },
    { nombre: 'Tumbaco', precio: 2.50 },
    { nombre: 'Los Chillos', precio: 2.00 },
    { nombre: 'Provincias', precio: 6.50 },
  ];

  const parseTallasseguro = (tallasData) => {
    if (!tallasData) return {};
    if (typeof tallasData === 'object') return tallasData;
    try {
      const parsed = JSON.parse(tallasData);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error al procesar tallas:", e);
    }
    if (typeof tallasData === 'string') {
      const obj = {};
      tallasData.split(',').forEach(t => { 
        const val = t.trim();
        if(val) obj[val] = 1; 
      });
      return obj;
    }
    return {};
  };

  const fetchProductos = async () => {
    const { data } = await supabase.from('productos').select('*').order('id', { ascending: false });
    if (data) setProductos(data);
  };

  const fetchConfiguracion = async () => {
    const { data } = await supabase.from('configuracion').select('menus_ocultos').eq('id', 1).single();
    if (data && data.menus_ocultos) setHiddenItems(data.menus_ocultos);
  };

  const fetchPedidosAdmin = useCallback(async () => {
    const { data } = await supabase.from('pedidos').select('*').order('id', { ascending: false });
    if (data) setListaPedidos(data);
  }, []);

  useEffect(() => {
    fetchProductos();
    fetchConfiguracion();
    supabase.auth.getSession().then(({ data: { session } }) => handleUserSession(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => handleUserSession(session?.user ?? null));
    
    // CERRAR MENÚS AL TOCAR FUERA (SOPORTE TÁCTIL)
    const handleClickOutside = () => {
      setMenuAbierto(null);
      setUserMenuAbierto(false);
      setOpenFilter(null);
      setOpenFormSelect(null);
    };
    
    document.addEventListener('click', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('click', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userRole === 'admin' && (activeView === 'pedidos' || activeView === 'inventario')) {
      fetchPedidosAdmin();
    }
  }, [userRole, activeView, fetchPedidosAdmin]);

  const handleUserSession = (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      setShowLoginModal(false);
      fetchUserRole(currentUser.id);
      setPerfilForm({
        tratamiento: currentUser.user_metadata?.tratamiento || '',
        nombre: currentUser.user_metadata?.first_name || '',
        apellidos: currentUser.user_metadata?.last_name || '',
        dia: currentUser.user_metadata?.fecha_nacimiento?.split('-')[2] || '',
        mes: currentUser.user_metadata?.fecha_nacimiento?.split('-')[1] || '',
        anio: currentUser.user_metadata?.fecha_nacimiento?.split('-')[0] || '',
        prefijo: currentUser.user_metadata?.telefono?.split(' ')[0] || '+593',
        telefono: currentUser.user_metadata?.telefono?.split(' ')[1] || '',
        newsletter: currentUser.user_metadata?.newsletter || false
      });
      if (!currentUser.user_metadata?.first_name || !currentUser.user_metadata?.last_name) setShowCompleteProfile(true);
      else setShowCompleteProfile(false);
    } else {
      setUserRole('cliente');
      setShowCompleteProfile(false);
    }
  };

  const fetchUserRole = async (userId) => {
    try {
      const { data } = await supabase.from('perfiles').select('rol').eq('id', userId).single();
      if (data && data.rol) setUserRole(data.rol);
      else setUserRole('cliente');
    } catch (error) {
      setUserRole('cliente');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole('cliente'); 
    setActiveView('home'); 
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: perfilForm.nombre, last_name: perfilForm.apellidos, tratamiento: perfilForm.tratamiento,
        fecha_nacimiento: `${perfilForm.anio}-${perfilForm.mes}-${perfilForm.dia}`, telefono: `${perfilForm.prefijo} ${perfilForm.telefono}`, newsletter: perfilForm.newsletter
      }
    });
    if (error) alert('Hubo un error al actualizar su información.');
    else { setUser(data.user); setShowCompleteProfile(false); }
  };

  const solicitarCambioContrasena = async () => {
    if (!user || !user.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin });
      if (error) throw error;
      alert(`Se ha enviado un enlace oficial de ANTARES al correo ${user.email}. Por favor, revise su bandeja de entrada.`);
    } catch (error) {
      alert('Hubo un error al procesar su solicitud. Inténtelo más tarde.');
    }
  };

  const irACategoria = (nombreCategoria) => {
    setActiveCategory(nombreCategoria);
    setActiveSubCategory('Todo');
    setActiveView('categoria');
    setShowInlineForm(false);
    setEditandoId(null);
    setFiltroColor('Todo');
    setFiltroTalla('Todo');
    setOrdenPrecio('');
    setOpenFilter(null);
    setOpenFormSelect(null);
    setMenuAbierto(null);
  };

  const handleCheckbox = (categoria) => setCategoriasDescarga(prev => prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]);

  const toggleMenuVisibility = async (itemName) => {
    let newHidden = [...hiddenItems];
    const isCurrentlyHidden = hiddenItems.includes(itemName);
    const isMainMenu = Object.keys(estructuraCatalogo).includes(itemName) || itemName === 'Obsequios';

    if (isMainMenu) {
      let itemsToToggle = [itemName];
      if (estructuraCatalogo[itemName]) itemsToToggle = [...itemsToToggle, ...estructuraCatalogo[itemName]];
      if (isCurrentlyHidden) newHidden = newHidden.filter(item => !itemsToToggle.includes(item));
      else newHidden = [...new Set([...newHidden, ...itemsToToggle])];
    } else {
      if (isCurrentlyHidden) newHidden = newHidden.filter(i => i !== itemName);
      else newHidden.push(itemName);
    }
    setHiddenItems(newHidden); 
    await supabase.from('configuracion').update({ menus_ocultos: newHidden }).eq('id', 1);
  };

  const handleSelectTalla = (e, productoId, talla) => {
    e.preventDefault();
    e.stopPropagation();
    setTallasSeleccionadas(prev => {
      const currentSelected = prev[productoId] || [];
      if (currentSelected.includes(talla)) return { ...prev, [productoId]: currentSelected.filter(t => t !== talla) };
      else return { ...prev, [productoId]: [...currentSelected, talla] };
    });
  };

  const triggerStarAnimation = (e) => {
    if (!e || !e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    const startX = rect.left + (rect.width / 2);
    const startY = rect.top + (rect.height / 2);
    setStars(prev => [...prev, { id, x: startX, y: startY, active: false }]);
    setTimeout(() => setStars(prev => prev.map(s => s.id === id ? { ...s, active: true } : s)), 50);
    setTimeout(() => {
      setStars(prev => prev.filter(s => s.id !== id));
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 400); 
    }, 700);
  };

  const agregarAlCarrito = (producto, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const isRing = producto.subcategoria === 'Anillos';
    const selectedSizes = tallasSeleccionadas[producto.id] || [];

    if (isRing && selectedSizes.length === 0) return;

    triggerStarAnimation(e);

    setCarrito(prev => {
      let newCart = [...prev];
      if (isRing) {
        const tallasObj = parseTallasseguro(producto.tallas);
        selectedSizes.forEach(talla => {
          const maxForTalla = parseInt(tallasObj[talla] || 0);
          const index = newCart.findIndex(item => item.id === producto.id && item.tallaSeleccionada === talla);
          if (index > -1) {
            if (newCart[index].cantidad < maxForTalla) newCart[index].cantidad += 1;
          } else {
            newCart.push({ ...producto, tallaSeleccionada: talla, cantidad: 1, stockMaximo: maxForTalla });
          }
        });
      } else {
        const stockMax = parseInt(producto.disponibilidad) || 99;
        const index = newCart.findIndex(item => item.id === producto.id);
        if (index > -1) {
          if (newCart[index].cantidad < stockMax) newCart[index].cantidad += 1;
        } else {
          newCart.push({ ...producto, cantidad: 1, stockMaximo: stockMax });
        }
      }
      return newCart;
    });

    if (isRing) setTallasSeleccionadas(prev => ({ ...prev, [producto.id]: [] }));
    setProductoSeleccionado(null); 
  };

  const updateCantidad = (id, tallaSeleccionada, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === id && item.tallaSeleccionada === tallaSeleccionada) {
        const nuevaCantidad = Math.max(1, Math.min((item.cantidad || 1) + delta, item.stockMaximo));
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const toggleFavorito = (id) => {
    if (favoritos.includes(id)) setFavoritos(favoritos.filter(favId => favId !== id));
    else setFavoritos([...favoritos, id]);
  };

  const handleContinuarCheckout = () => {
    if (envioConfig.tipo === 'domicilio') setCheckoutPaso(2);
    else enviarPedidoWhatsApp(); 
  };

  const enviarPedidoWhatsApp = async (e) => {
    if(e) e.preventDefault();
    setIsUploading(true);

    let urlComprobante = '';
    if (comprobantePago) {
      const fileExt = comprobantePago.name.split('.').pop();
      const fileName = `pago_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('catalogo').upload(`comprobantes/${fileName}`, comprobantePago);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('catalogo').getPublicUrl(`comprobantes/${fileName}`);
        urlComprobante = publicUrl;
      }
    }

    const subtotal = carrito.reduce((sum, item) => sum + ((item.precio || 0) * (item.cantidad || 1)), 0);
    const total = subtotal + (envioConfig.tipo === 'domicilio' ? envioConfig.sectorPrecio : 0);
    const nombreCliente = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`;
    const telfCliente = user?.user_metadata?.telefono || '';
    
    await supabase.from('pedidos').insert([{
      cliente_nombre: nombreCliente,
      cliente_telefono: telfCliente,
      productos: JSON.stringify(carrito),
      total_envio: envioConfig.tipo === 'domicilio' ? envioConfig.sectorPrecio : 0,
      estado: 'En progreso',
      comprobante_url: urlComprobante,
      link_maps: envioConfig.linkMaps
    }]);

    let mensaje = `*FACTURA VIRTUAL - ANTARES*%0A------------------------%0A*Cliente:* ${nombreCliente}%0A*Tel:* ${telfCliente}%0A*Productos:*%0A`;
    
    carrito.forEach(item => {
      const tallaStr = item.tallaSeleccionada ? ` (Talla: ${item.tallaSeleccionada})` : '';
      mensaje += `- ${item.cantidad || 1}x ${item.titulo}${tallaStr} : $${((item.precio || 0) * (item.cantidad || 1)).toFixed(2)}%0A`;
    });

    if (envioConfig.tipo === 'domicilio') {
      mensaje += `------------------------%0A*Subtotal:* $${subtotal.toFixed(2)}%0A*Envío:* $${envioConfig.sectorPrecio.toFixed(2)} (${envioConfig.sectorNombre})%0A*TOTAL DEL PEDIDO:* $${total.toFixed(2)}%0A------------------------%0A*TOTAL A PAGAR AHORA:* $${envioConfig.sectorPrecio.toFixed(2)} (Solo Envío)%0A*Ubicación:* ${envioConfig.linkMaps || 'No proporcionado'}%0A`;
      if (urlComprobante) mensaje += `*Comprobante:* ${urlComprobante}%0A`;
    } else {
      mensaje += `------------------------%0A*TOTAL:* $${total.toFixed(2)}%0A*Envío:* Recoger en Local%0A------------------------%0A`;
    }

    setIsUploading(false);
    setCarrito([]);
    setCheckoutPaso(1);
    setActiveView('home');
    window.open(`https://wa.me/593980111570?text=${mensaje}`, '_blank');
  };

  const completarPedido = async (pedido) => {
    if(!window.confirm('¿Seguro que deseas marcar este pedido como completado? Se descontará el stock de las piezas.')) return;
    
    const { error: err1 } = await supabase.from('pedidos').update({ estado: 'Completado' }).eq('id', pedido.id);
    if (err1) return alert('Error actualizando pedido.');

    const items = typeof pedido.productos === 'string' ? JSON.parse(pedido.productos) : pedido.productos;
    
    for (let item of items) {
      const { data: prodData } = await supabase.from('productos').select('*').eq('id', item.id).single();
      if (prodData) {
        let isRing = prodData.subcategoria === 'Anillos';
        let updatePayload = { vendidos: (prodData.vendidos || 0) + item.cantidad };
        
        if (isRing) {
          let currentTallas = parseTallasseguro(prodData.tallas);
          if (currentTallas[item.tallaSeleccionada] !== undefined) {
            currentTallas[item.tallaSeleccionada] = Math.max(0, parseInt(currentTallas[item.tallaSeleccionada]) - item.cantidad);
          }
          updatePayload.tallas = JSON.stringify(currentTallas);
          let totalStock = Object.values(currentTallas).reduce((a,b) => a + Number(b), 0);
          if (totalStock === 0) updatePayload.vendido = true;
        } else {
          let currentDisp = parseInt(prodData.disponibilidad);
          if (!isNaN(currentDisp)) {
            let newDisp = Math.max(0, currentDisp - item.cantidad);
            updatePayload.disponibilidad = newDisp.toString();
            if (newDisp === 0) updatePayload.vendido = true;
          }
        }
        await supabase.from('productos').update(updatePayload).eq('id', item.id);
      }
    }
    fetchPedidosAdmin();
    fetchProductos();
  };

  const cancelarPedido = async (id) => {
    if(!window.confirm('¿Seguro que deseas cancelar este pedido?')) return;
    await supabase.from('pedidos').update({ estado: 'Cancelado' }).eq('id', id);
    fetchPedidosAdmin();
  };

  const prepararEdicion = (producto) => {
    setNuevaPieza({
      titulo: producto.titulo, descripcion: producto.descripcion || '', costo: producto.costo || '', 
      precio: producto.precio, disponibilidad: producto.disponibilidad || '', subcategoria: producto.subcategoria || '',
      tallas: parseTallasseguro(producto.tallas), color: producto.color || '', imagen: null, imagen_url: producto.imagen_url
    });
    setEditandoId(producto.id);
    setShowInlineForm(true);
  };

  const cerrarFormulario = () => {
    setShowInlineForm(false);
    setEditandoId(null);
    setNuevaPieza({ titulo: '', descripcion: '', costo: '', precio: '', disponibilidad: '', subcategoria: '', tallas: {}, color: '', imagen: null, imagen_url: '' });
  };

  const handleToggleVendidoAdmin = async (e, producto) => {
    e.stopPropagation();
    const isRing = producto.subcategoria === 'Anillos';
    let nuevasTallas = null;
    let nuevoVendido = producto.vendido;
    let cantidadVendida = 1; 

    if (isRing) {
      const selectedSizes = tallasSeleccionadas[producto.id] || [];
      if (selectedSizes.length === 0) {
        return alert('Para descontar stock de un anillo, seleccione primero la(s) talla(s) que desea marcar como vendidas y luego presione este botón.');
      }
      
      const tallasObj = parseTallasseguro(producto.tallas);
      let errorStock = false;
      
      selectedSizes.forEach(talla => {
        if (!tallasObj[talla] || tallasObj[talla] < 1) errorStock = true;
        else tallasObj[talla] -= 1;
      });

      if (errorStock) return alert('Una de las tallas seleccionadas no tiene stock disponible para descontar.');
      
      nuevasTallas = JSON.stringify(tallasObj);
      cantidadVendida = selectedSizes.length; 

      const totalStockRestante = Object.values(tallasObj).reduce((acc, val) => acc + Number(val), 0);
      if (totalStockRestante === 0) nuevoVendido = true;

      setTallasSeleccionadas(prev => ({ ...prev, [producto.id]: [] }));

    } else {
      let disp = parseInt(producto.disponibilidad);
      if (!isNaN(disp) && disp > 1 && !producto.vendido) {
      } else {
        nuevoVendido = !producto.vendido;
      }
    }

    const currentVendidos = producto.vendidos || 0;
    
    const { data, error } = await supabase.from('productos').update({ 
      tallas: nuevasTallas !== null ? nuevasTallas : producto.tallas,
      vendido: nuevoVendido,
      vendidos: currentVendidos + cantidadVendida
    }).eq('id', producto.id).select();

    if (!error && data && data.length > 0) setProductos(prev => prev.map(p => p.id === producto.id ? data[0] : p));
  };

  const handleBorrarLocal = async (id) => {
    if(window.confirm('¿Seguro que deseas retirar esta pieza?')) {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (!error) setProductos(prev => prev.filter(p => p.id !== id));
    }
  };

  const handlePublicarLocal = async (e) => {
    e.preventDefault();
    if (!nuevaPieza.titulo || !nuevaPieza.precio) return alert('Ponle un título y precio.');
    
    let imageUrl = nuevaPieza.imagen_url || 'https://images.unsplash.com/photo-1610486241074-b778f69d2d0b?q=80&w=1000';

    if (nuevaPieza.imagen) {
      const fileExt = nuevaPieza.imagen.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('catalogo').upload(fileName, nuevaPieza.imagen);
      if (uploadError) return alert('Error subiendo la imagen.');
      const { data: { publicUrl } } = supabase.storage.from('catalogo').getPublicUrl(fileName);
      imageUrl = publicUrl;
    }

    const payload = { 
      titulo: nuevaPieza.titulo, 
      descripcion: nuevaPieza.descripcion, 
      costo: Number(nuevaPieza.costo) || 0, 
      precio: Number(nuevaPieza.precio), 
      categoria: activeCategory, 
      disponibilidad: nuevaPieza.disponibilidad || 'Bajo Pedido',
      subcategoria: nuevaPieza.subcategoria || 'General', 
      color: nuevaPieza.color || '',
      tallas: nuevaPieza.subcategoria === 'Anillos' ? JSON.stringify(nuevaPieza.tallas) : null,
      imagen_url: imageUrl 
    };

    if (editandoId) {
      const { data, error } = await supabase.from('productos').update(payload).eq('id', editandoId).select();
      if (data && data.length > 0) {
        setProductos(prev => prev.map(p => p.id === editandoId ? data[0] : p));
        cerrarFormulario();
      }
    } else {
      const { data, error } = await supabase.from('productos').insert([payload]).select();
      if (data && data.length > 0) {
        setProductos(prev => {
          if (prev.some(p => p.id === data[0].id)) return prev;
          return [data[0], ...prev];
        });
        cerrarFormulario();
      }
    }
  };

  // FUNCIONES DEL CUSTOMIZADOR PRÊT-À-PORTER CON BORRADO DE FONDO
  const procesarInsigniaLogotipo = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setIsRemovingBg(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const rBg = data[0], gBg = data[1], bBg = data[2], aBg = data[3];
          if(aBg > 0) { 
              const tolerance = 45;
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                if (Math.abs(r - rBg) < tolerance && Math.abs(g - gBg) < tolerance && Math.abs(b - bBg) < tolerance) {
                  data[i+3] = 0; 
                }
              }
              ctx.putImageData(imageData, 0, 0);
          }
          setCustomLogo(canvas.toDataURL());
        } catch(e) {
           console.error("Error al procesar fondo:", e);
           setCustomLogo(event.target.result); 
        }
        setIsRemovingBg(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // EFECTO PRINCIPAL DE RENDERIZADO DEL CUSTOMIZADOR (TEÑIDO REAL + OFFSETS DE TAMAÑO Y POSICIÓN DE 5 EN 5)
  useEffect(() => {
    if (activeCategory === 'Prêt-à-Porter' && activeView === 'categoria') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const shirtImg = new Image();
      shirtImg.crossOrigin = "Anonymous";
      
      shirtImg.onload = () => {
        canvas.width = shirtImg.width;
        canvas.height = shirtImg.height;
        
        // 1. Dibujamos la camiseta original primero
        ctx.drawImage(shirtImg, 0, 0);
        
        if(customColor !== '#ffffff') {
           // 2. Pintamos el color encima de la ropa respetando la forma (source-atop)
           ctx.globalCompositeOperation = 'source-atop';
           ctx.fillStyle = customColor;
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           
           // 3. Multiplicamos la textura original para recuperar arrugas y sombras oscuras
           ctx.globalCompositeOperation = 'multiply';
           ctx.drawImage(shirtImg, 0, 0);
           
           // Restauramos el comportamiento normal del canvas
           ctx.globalCompositeOperation = 'source-over'; 
        }
        
        // 4. Imprimir Logo en la posición correcta + Ajustes finos
        if (customLogo) {
          const logoImg = new Image();
          logoImg.onload = () => {
            let x, y, baseSize;
            const shirtWidth = canvas.width;
            const shirtHeight = canvas.height;
            
            // COORDENADAS EXACTAS SOLICITADAS
            if (customVista === 'frente') {
                switch(customPlacement) {
                  case 'pecho-izq': 
                      x = shirtWidth * 0.65; y = shirtHeight * 0.35; baseSize = shirtWidth * 0.12; 
                      break;
                  case 'pecho-der': 
                      x = shirtWidth * 0.35; y = shirtHeight * 0.35; baseSize = shirtWidth * 0.12; 
                      break;
                  case 'centro-pecho': 
                      x = shirtWidth * 0.5; y = shirtHeight * 0.40; baseSize = shirtWidth * 0.35; 
                      break;
                  case 'pecho-sup-centro': 
                      x = shirtWidth * 0.5; y = shirtHeight * 0.25; baseSize = shirtWidth * 0.35; 
                      break;
                  default: 
                      x = shirtWidth * 0.5; y = shirtHeight * 0.40; baseSize = shirtWidth * 0.35;
                }
            } else {
                switch(customPlacement) {
                  case 'espalda-sup': 
                      x = shirtWidth * 0.5; y = shirtHeight * 0.25; baseSize = shirtWidth * 0.20; 
                      break;
                  case 'espalda-centro': 
                      x = shirtWidth * 0.5; y = shirtHeight * 0.45; baseSize = shirtWidth * 0.40; 
                      break;
                  default: 
                      x = shirtWidth * 0.5; y = shirtHeight * 0.45; baseSize = shirtWidth * 0.40;
                }
            }
            
            // APLICAMOS LOS AJUSTES FINOS (+/- de 5 en 5 píxeles)
            const finalSize = Math.max(10, baseSize + sizeOffset);
            const finalY = y + yOffset;
            
            const aspectLogo = logoImg.width / logoImg.height;
            ctx.drawImage(logoImg, x - finalSize/2, finalY - (finalSize/aspectLogo)/2, finalSize, finalSize/aspectLogo);
            setCustomRenderedImage(canvas.toDataURL());
          };
          logoImg.src = customLogo;
        } else {
          setCustomRenderedImage(canvas.toDataURL());
        }
      };
      
      shirtImg.onerror = () => {
        console.error("No se pudo cargar la imagen base de Supabase.");
        setCustomRenderedImage(null);
      };
      
      shirtImg.src = getMockupUrl(customPrenda, customVista);
    }
  }, [activeCategory, activeView, customColor, customLogo, customPlacement, customVista, sizeOffset, yOffset, customPrenda]);

  const getPlacementLabel = () => {
    switch(customPlacement) {
      case 'pecho-izq': return 'Pecho (Izquierda)';
      case 'pecho-der': return 'Pecho (Derecha)';
      case 'centro-pecho': return 'Centro Pecho';
      case 'pecho-sup-centro': return 'Pecho Superior Centro';
      case 'espalda-sup': return 'Espalda Superior';
      case 'espalda-centro': return 'Mitad Espalda';
      default: return 'Centro Pecho';
    }
  };

  const getCalculatedPrice = () => {
     let basePrice = 0;
     switch(customPrenda) {
       case 'Camiseta': basePrice = 5.99; break;
       case 'Buso': basePrice = 8.99; break;
       case 'Hoodie': basePrice = 12.99; break;
       case 'Capucha': basePrice = 16.99; break;
       default: basePrice = 5.99;
     }

     let stampPrice = 0;
     if (customLogo) {
        if (customVista === 'frente') {
           if (['centro-pecho', 'pecho-sup-centro'].includes(customPlacement)) stampPrice = 3.00;
           else if (['pecho-izq', 'pecho-der'].includes(customPlacement)) stampPrice = 1.50;
        } else {
           if (customPlacement === 'espalda-centro') stampPrice = 3.00;
           else if (customPlacement === 'espalda-sup') stampPrice = 2.00;
        }
     }
     
     return (basePrice + stampPrice).toFixed(2);
  };

  const handleCustomAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if(!customRenderedImage) return;

    triggerStarAnimation(e);
    
    const finalPrice = parseFloat(getCalculatedPrice());

    const customItem = {
      id: `custom-${Date.now()}`,
      titulo: `PRÊT-À-PORTER: ${customPrenda} Diseño Exclusivo`,
      categoria: 'Prêt-à-Porter',
      subcategoria: 'A Medida',
      precio: finalPrice,
      cantidad: 1,
      stockMaximo: 99,
      imagen_url: customRenderedImage,
      tallaSeleccionada: 'A Medida',
      descripcion: `Prenda: ${customPrenda}, Tono: ${customColor}, Vista: ${customVista.toUpperCase()}, Ubicación: ${getPlacementLabel()}`
    };

    setCarrito(prev => [...prev, customItem]);
  };

  if (!areSupabaseCredentialsSet) return null;

  const estructuraCatalogo = {
    'Atelier': ['Joyería Exclusiva', 'Prêt-à-Porter'],
    'Joyería': ['Acero Fino', 'Plata de Ley 925', 'Gemas y Piedras Naturales'],
    'Esenciales': ['Básicos de Joyería', 'Básicos de Vestuario'],
    'Sartorial': ['Chaquetas', 'Camisetas', 'Buzos', 'Pantalones']
  };

  const subcategoriasJoyeria = ['Todo', 'Anillos', 'Pulseras', 'Collares', 'Aretes', 'Piercings'];
  const isAllSelected = (menuPrincipal) => estructuraCatalogo[menuPrincipal].every(sub => categoriasDescarga.includes(sub));

  const toggleAll = (menuPrincipal) => {
    const subs = estructuraCatalogo[menuPrincipal];
    if (isAllSelected(menuPrincipal)) setCategoriasDescarga(prev => prev.filter(c => !subs.includes(c)));
    else {
      const newSelections = [...categoriasDescarga];
      subs.forEach(sub => { if (!newSelections.includes(sub)) newSelections.push(sub); });
      setCategoriasDescarga(newSelections);
    }
  };

  const subtotalCarrito = carrito.reduce((sum, item) => sum + ((item.precio || 0) * (item.cantidad || 1)), 0);

  const cristalOpacoSubmenuClass = "flex flex-col bg-white/5 backdrop-blur-md py-6 px-8 shadow-none border-none"; 
  const menuUnderlineClass = "absolute bottom-0 left-1/2 w-0 h-px bg-white group-hover:w-full group-hover:left-0 transition-all duration-300";

  let productosMostrar = productos.filter(p => p.categoria === activeCategory && (activeSubCategory === 'Todo' || p.subcategoria === activeSubCategory));

  if (activeCategory === 'Acero Fino') {
    if (filtroColor !== 'Todo') {
      productosMostrar = productosMostrar.filter(p => p.color === filtroColor);
    }
    if (filtroTalla !== 'Todo') {
      productosMostrar = productosMostrar.filter(p => {
        if (p.subcategoria !== 'Anillos') return false;
        const tallasObj = parseTallasseguro(p.tallas);
        return parseInt(tallasObj[filtroTalla] || 0) > 0;
      });
    }
    if (ordenPrecio === 'Asc') {
      productosMostrar = productosMostrar.sort((a,b) => a.precio - b.precio);
    } else if (ordenPrecio === 'Desc') {
      productosMostrar = productosMostrar.sort((a,b) => b.precio - a.precio);
    }
  }

  const coloresPredeterminados = [
    {name: 'Blanco Original', hex: '#ffffff'}, 
    {name: 'Negro', hex: '#111111'}
  ];

  // RENDERING DE CADA TARJETA DE PRODUCTO (OPTIMIZADO)
  const renderProductoCard = (producto) => {
    const tallasObj = parseTallasseguro(producto.tallas);
    const isRing = producto.subcategoria === 'Anillos';
    const selectedSizes = tallasSeleccionadas[producto.id] || [];
    const canBuy = !isRing || selectedSizes.length > 0;

    return (
      <div key={producto.id} className="group relative bg-transparent rounded-sm flex flex-col p-0 w-full">
        <div className={`overflow-hidden aspect-square relative w-full ${userRole === 'cliente' ? 'cursor-pointer' : ''}`} onClick={() => { if(userRole === 'cliente') setProductoSeleccionado(producto); }}>
          <img src={producto.imagen_url} alt={producto.titulo} className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-700" />
          {producto.vendido && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <span className="text-white tracking-[0.4em] text-[10px] md:text-xs font-bold uppercase border border-white/50 px-4 py-2 bg-black/60">Agotado</span>
            </div>
          )}
          {userRole === 'admin' && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20">
              <button onClick={(e) => { e.stopPropagation(); prepararEdicion(producto); }} className="bg-black/80 backdrop-blur-md p-2 text-white border border-white/10 rounded-full cursor-pointer hover:text-white/80"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
              <button onClick={(e) => { e.stopPropagation(); handleBorrarLocal(producto.id); }} className="bg-black/80 backdrop-blur-md p-2 text-white border border-white/10 rounded-full cursor-pointer hover:text-red-500"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
          )}
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl rounded-b-sm p-4 md:p-6 flex flex-col flex-grow items-center text-center w-full">
          <h4 className="text-[10px] md:text-sm tracking-[0.2em] uppercase text-white mb-2 line-clamp-2 break-words w-full">{producto.titulo}</h4>
          <span className="text-[10px] md:text-sm tracking-[0.1em] text-white font-light whitespace-nowrap mb-1 block">${producto.precio} USD</span>
          
          {!isRing && (
            <p className="text-[8px] tracking-[0.2em] text-gray-400 mb-4 uppercase">{producto.disponibilidad ? producto.disponibilidad : 'Bajo Pedido'}</p>
          )}

          {isRing && (
            <div className="flex flex-col items-center w-full mb-6 mt-4 z-30">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 w-full">
                {tallasDisponibles.map(talla => {
                  const stock = parseInt(tallasObj[talla] || 0);
                  const isAvailable = stock > 0;
                  const isSelected = selectedSizes.includes(talla);
                  
                  return (
                    <div key={talla} className="flex flex-col items-center gap-1 sm:gap-1.5">
                      <button 
                        type="button"
                        onClick={(e) => { 
                          if (isAvailable) handleSelectTalla(e, producto.id, talla); 
                        }}
                        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-[10px] sm:text-[13px] tracking-[0.1em] transition-all duration-300 border outline-none ${isAvailable ? (isSelected ? 'bg-white text-black border-white font-bold scale-110 cursor-pointer' : 'bg-transparent text-white border-white/30 hover:border-white cursor-pointer') : 'border-red-500/20 text-red-500 cursor-not-allowed'}`}
                      >
                        <span>{talla}</span>
                      </button>
                      <span className={`text-[10px] sm:text-[12px] tracking-[0.1em] uppercase leading-none mt-1 ${isAvailable ? 'text-gray-400' : 'text-red-500/70'}`}>
                        {stock}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <p className="text-[8px] sm:text-[9px] text-gray-400 line-clamp-2 leading-relaxed mb-4 sm:mb-6 break-words uppercase w-full">{producto.descripcion}</p>

          {userRole === 'cliente' && !producto.vendido && (
            <div className="flex flex-col sm:flex-row gap-2 mt-auto w-full z-30 justify-center">
               <button 
                 onClick={(e) => { e.stopPropagation(); if(canBuy) agregarAlCarrito(producto, e); }} 
                 className={`w-full sm:flex-grow py-2 sm:py-3 text-[7px] sm:text-[8px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase transition-colors cursor-pointer border-none outline-none rounded-sm ${canBuy ? 'bg-white text-black hover:bg-gray-300' : 'bg-white/20 text-gray-400 cursor-not-allowed'}`}
               >
                 {canBuy ? 'COMPRAR' : 'ELIJA TALLA'}
               </button>
               <button onClick={(e) => { e.stopPropagation(); toggleFavorito(producto.id); }} className="w-full sm:w-auto px-4 md:px-5 py-2 md:py-3 border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer text-xs sm:text-sm flex items-center justify-center bg-transparent outline-none rounded-sm">{favoritos.includes(producto.id) ? '♥' : '♡'}</button>
            </div>
          )}

          {userRole === 'admin' && (
            <button onClick={(e) => handleToggleVendidoAdmin(e, producto)} className={`w-full py-2 sm:py-2.5 mt-auto text-[8px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase transition-colors cursor-pointer border outline-none rounded-sm z-30 ${producto.vendido ? 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-white' : 'bg-white text-black border-white hover:bg-gray-300'}`}>{producto.vendido ? 'Desmarcar Venta' : 'Marcar como Vendida'}</button>
          )}
        </div>
      </div>
    );
  };

  // OPTIMIZACIONES DE RENDIMIENTO (USEMEMO)
  const stockProyeccion = useMemo(() => {
    return productos.reduce((acc, p) => {
      if (!p.vendido) {
        if (p.subcategoria === 'Anillos') {
          const tallasObj = parseTallasseguro(p.tallas);
          const activeTallas = Object.entries(tallasObj).filter(([_, qty]) => parseInt(qty) > 0);
          activeTallas.forEach(([talla, cantidad]) => {
            acc.push({ ...p, talla_especifica: talla, stock_especifico: parseInt(cantidad) });
          });
        } else {
          const disp = parseInt(p.disponibilidad);
          if (!isNaN(disp) && disp > 0) acc.push({ ...p, talla_especifica: 'N/A', stock_especifico: disp });
          else if (isNaN(disp)) acc.push({ ...p, talla_especifica: 'N/A', stock_especifico: p.disponibilidad });
        }
      }
      return acc;
    }, []);
  }, [productos]);

  const ventasDesglosadas = useMemo(() => {
    const desglosadas = [];
    listaPedidos.filter(ped => ped.estado === 'Completado').forEach(ped => {
      const items = JSON.parse(ped.productos || '[]');
      items.forEach(item => {
        const qty = parseInt(item.cantidad) || 1;
        for (let i = 0; i < qty; i++) {
          desglosadas.push({
            id: item.id,
            titulo: item.titulo,
            categoria: item.categoria,
            subcategoria: item.subcategoria,
            imagen_url: item.imagen_url,
            talla_especifica: item.tallaSeleccionada || 'N/A',
            costo: parseFloat(item.costo) || 0,
            precio: parseFloat(item.precio) || 0
          });
        }
      });
    });
    return desglosadas;
  }, [listaPedidos]);

  const groupedOrdersByMonth = useMemo(() => {
    return listaPedidos.reduce((acc, pedido) => {
      let dateObj = pedido.created_at ? new Date(pedido.created_at) : new Date();
      const month = dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!acc[month]) acc[month] = [];
      acc[month].push(pedido);
      return acc;
    }, {});
  }, [listaPedidos]);

  return (