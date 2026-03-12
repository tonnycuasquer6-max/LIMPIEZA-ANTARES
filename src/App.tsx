/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Auth from './components/Auth';
import { areSupabaseCredentialsSet, supabase } from './services/supabase';
import { useState, useEffect, useCallback, useMemo } from 'react';

const LOGO_URL = "https://ifdvcxlbikqhmdnuxmuy.supabase.co/storage/v1/object/public/assets/aa.png"; 
const FONDO_HEADER_URL = "/fondo-header.png"; 

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

  const [customPrenda, setCustomPrenda] = useState('Camiseta'); 
  const [customVista, setCustomView] = useState('frente'); 
  const [customColor, setCustomColor] = useState('#ffffff');
  const [customLogo, setCustomLogo] = useState(null);
  const [customPlacement, setCustomPlacement] = useState('centro-pecho');
  const [customRenderedImage, setCustomRenderedImage] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [sizeOffset, setSizeOffset] = useState(0); 
  const [yOffset, setYOffset] = useState(0); 

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
    } catch (e) { console.error("Error al procesar tallas:", e); }
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
    } catch (error) { setUserRole('cliente'); }
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
    } catch (error) { alert('Hubo un error al procesar su solicitud. Inténtelo más tarde.'); }
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
      if (!isNaN(disp) && disp > 1 && !producto.vendido) {} else { nuevoVendido = !producto.vendido; }
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
           setCustomLogo(event.target.result); 
        }
        setIsRemovingBg(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (activeCategory === 'Prêt-à-Porter' && activeView === 'categoria') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const shirtImg = new Image();
      shirtImg.crossOrigin = "Anonymous";
      
      shirtImg.onload = () => {
        canvas.width = shirtImg.width;
        canvas.height = shirtImg.height;
        ctx.drawImage(shirtImg, 0, 0);
        if(customColor !== '#ffffff') {
           ctx.globalCompositeOperation = 'source-atop';
           ctx.fillStyle = customColor;
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           ctx.globalCompositeOperation = 'multiply';
           ctx.drawImage(shirtImg, 0, 0);
           ctx.globalCompositeOperation = 'source-over'; 
        }
        if (customLogo) {
          const logoImg = new Image();
          logoImg.onload = () => {
            let x, y, baseSize;
            const shirtWidth = canvas.width;
            const shirtHeight = canvas.height;
            if (customVista === 'frente') {
                switch(customPlacement) {
                  case 'pecho-izq': x = shirtWidth * 0.65; y = shirtHeight * 0.35; baseSize = shirtWidth * 0.12; break;
                  case 'pecho-der': x = shirtWidth * 0.35; y = shirtHeight * 0.35; baseSize = shirtWidth * 0.12; break;
                  case 'centro-pecho': x = shirtWidth * 0.5; y = shirtHeight * 0.40; baseSize = shirtWidth * 0.35; break;
                  case 'pecho-sup-centro': x = shirtWidth * 0.5; y = shirtHeight * 0.25; baseSize = shirtWidth * 0.35; break;
                  default: x = shirtWidth * 0.5; y = shirtHeight * 0.40; baseSize = shirtWidth * 0.35;
                }
            } else {
                switch(customPlacement) {
                  case 'espalda-sup': x = shirtWidth * 0.5; y = shirtHeight * 0.25; baseSize = shirtWidth * 0.20; break;
                  case 'espalda-centro': x = shirtWidth * 0.5; y = shirtHeight * 0.45; baseSize = shirtWidth * 0.40; break;
                  default: x = shirtWidth * 0.5; y = shirtHeight * 0.45; baseSize = shirtWidth * 0.40;
                }
            }
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
      shirtImg.onerror = () => { setCustomRenderedImage(null); };
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
  const menuUnderlineClass = "absolute bottom-0 h-px bg-white transition-all duration-300";

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
          
          <p className="text-[9px] sm:text-[10px] text-white line-clamp-2 leading-relaxed mb-4 sm:mb-6 break-words uppercase w-full">{producto.descripcion}</p>

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
    <div className="bg-black text-white min-h-screen font-serif flex flex-col relative w-full overflow-x-hidden overflow-y-auto">
      
      <style>{`
        ::-webkit-scrollbar { display: none; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .auth-wrapper input, .auth-wrapper select { background-color: transparent !important; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @media print { 
          @page { margin: 0; size: auto; }
          html, body { background-color: #000000 !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .screen-only { display: none !important; } 
          .print-only { display: block !important; background-color: #000000 !important; min-height: 100vh; } 
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {stars.map(star => (
        <div key={star.id} className="fixed z-[9999] w-2 h-2 bg-white rounded-full pointer-events-none transition-all ease-in-out"
          style={{ transitionDuration: '700ms', left: star.active ? 'calc(100vw - 60px)' : star.x, top: star.active ? '30px' : star.y, opacity: star.active ? 0 : 1, transform: star.active ? 'scale(0.1)' : 'scale(1)', boxShadow: '0 0 20px 8px rgba(255, 255, 255, 0.8)' }}
        />
      ))}

      <div className="screen-only flex flex-col flex-grow w-full">
        <header className="w-full h-auto flex flex-col items-center bg-cover bg-center mt-0 relative z-[100] pt-3 px-4 sm:px-6 md:px-8" style={{ backgroundImage: `url(${FONDO_HEADER_URL})` }}>
          {user && activeView !== 'home' && (
            <button onClick={() => setActiveView('home')} className="absolute top-6 left-4 md:left-12 flex items-center gap-1.5 text-white hover:text-gray-400 transition-colors cursor-pointer bg-transparent border-none outline-none z-50 text-[10px] md:text-xs tracking-[0.2em] uppercase">
              Volver
            </button>
          )}

          {user && (
            <div className="absolute top-6 right-4 md:right-12 flex items-center gap-4 md:gap-6 z-[100]">
              {userRole !== 'admin' && (
                <button onClick={() => { setActiveView('bag'); setCheckoutPaso(1); }} className={`text-white hover:text-gray-400 transition-all duration-300 relative cursor-pointer bg-transparent border-none outline-none ${cartPulse ? 'scale-125 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'scale-100'}`}>
                  <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" height="20" width="20"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path></svg>
                  <span className="absolute -top-1 -right-2 bg-white text-black text-[8px] md:text-[9px] font-bold px-[4px] md:px-[5px] py-[1px] rounded-full">{carrito.length}</span>
                </button>
              )}

              <div 
                className="relative cursor-pointer" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUserMenuAbierto(!userMenuAbierto); setMenuAbierto(null); setOpenFilter(null); setOpenFormSelect(null); }}
              >
                <div className="text-white hover:text-gray-400 transition-colors bg-transparent border-none outline-none py-2">
                  <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" height="22" width="22"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path></svg>
                </div>
                <div className={`absolute top-full right-0 pt-2 z-[100] ${userMenuAbierto ? 'block' : 'hidden lg:group-hover:block'}`}>
                  <div className={`${cristalOpacoSubmenuClass} min-w-[150px] md:min-w-[200px] text-right`}>
                    <div onClick={(e) => { e.stopPropagation(); setUserMenuAbierto(false); setActiveView('perfil'); }} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-colors cursor-pointer text-right bg-transparent border-none p-0 outline-none block w-full py-2">Mi Perfil</div>
                    {userRole === 'admin' ? (
                      <>
                        <div onClick={(e) => { e.stopPropagation(); setUserMenuAbierto(false); setActiveView('pedidos'); }} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-colors cursor-pointer text-right bg-transparent border-none p-0 outline-none block mt-3 w-full py-2">Gestionar Pedidos</div>
                        <div onClick={(e) => { e.stopPropagation(); setUserMenuAbierto(false); setActiveView('inventario'); }} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white hover:text-gray-100 transition-colors cursor-pointer text-right bg-transparent border-none p-0 outline-none block mt-3 mb-3 font-bold w-full py-2">Inventario / Finanzas</div>
                      </>
                    ) : (
                      <>
                        <div onClick={(e) => { e.stopPropagation(); setUserMenuAbierto(false); setActiveView('pedidos'); }} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-colors cursor-pointer text-right bg-transparent border-none p-0 outline-none block mt-3 w-full py-2">Mis Pedidos</div>
                        <div onClick={(e) => { e.stopPropagation(); setUserMenuAbierto(false); setActiveView('deseos'); }} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-colors cursor-pointer text-right bg-transparent border-none p-0 outline-none block mt-3 mb-3 w-full py-2">Deseos ({favoritos.length})</div>
                      </>
                    )}
                    <hr className="border-white/10 my-2" />
                    <div onClick={(e) => { e.stopPropagation(); setUserMenuAbierto(false); handleLogout(); }} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-red-500 hover:text-red-400 transition-colors text-right bg-transparent border-none p-0 cursor-pointer outline-none block w-full py-2">Cerrar Sesión</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <img src={LOGO_URL} alt="ANTARES" onClick={() => setActiveView('home')} className="h-16 md:h-32 w-auto mt-[10px] md:mt-[4px] z-[100] cursor-pointer" />

          {user && activeView === 'home' && (
            <nav className="w-full mt-4 mb-2 relative z-[100] px-2 md:px-6 pt-0 animate-fade-in">
              <ul className="flex flex-wrap justify-center gap-y-4 gap-x-4 sm:gap-x-8 md:gap-x-16 py-2 text-[10px] md:text-sm tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase border-none bg-transparent">
                {Object.keys(estructuraCatalogo).map(menu => {
                  const isMenuHidden = hiddenItems.includes(menu);
                  if (userRole !== 'admin' && isMenuHidden) return null;
                  return (
                    <li key={menu} className="group relative cursor-pointer py-2 border-none bg-transparent" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuAbierto(menuAbierto === menu ? null : menu); setUserMenuAbierto(false); }}>
                      <div className={`inline-block relative transition-colors ${isMenuHidden ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                        {menu}
                        <div className={`${menuUnderlineClass} ${menuAbierto === menu ? 'w-full left-0' : 'w-0 left-1/2 lg:group-hover:w-full lg:group-hover:left-0'}`}></div>
                      </div>
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100] ${menuAbierto === menu ? 'block' : 'hidden lg:group-hover:block'}`}>
                        <div className={`${cristalOpacoSubmenuClass} min-w-[180px] md:min-w-[220px] text-center`}>
                          {estructuraCatalogo[menu].map(sub => {
                            const isSubHidden = hiddenItems.includes(sub);
                            if (userRole !== 'admin' && isSubHidden) return null;
                            return (
                              <div key={sub} onClick={(e) => { e.stopPropagation(); setMenuAbierto(null); irACategoria(sub); }} className={`cursor-pointer block mt-3 first:mt-0 text-[10px] md:text-xs transition-colors py-2 ${isSubHidden ? 'text-red-500' : 'text-gray-400 hover:text-gray-300'}`}>
                                {sub}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </li>
                  );
                })}
                
                {(!hiddenItems.includes('Obsequios') || userRole === 'admin') && (
                  <li className="group relative cursor-pointer py-2 border-none bg-transparent" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuAbierto(menuAbierto === 'Obsequios' ? null : 'Obsequios'); setUserMenuAbierto(false); }}>
                    <div className={`inline-block relative transition-colors ${hiddenItems.includes('Obsequios') ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                      Obsequios
                      <div className={`${menuUnderlineClass} ${menuAbierto === 'Obsequios' ? 'w-full left-0' : 'w-0 left-1/2 lg:group-hover:w-full lg:group-hover:left-0'}`}></div>
                    </div>
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100] ${menuAbierto === 'Obsequios' ? 'block' : 'hidden lg:group-hover:block'}`}>
                      <div className={`${cristalOpacoSubmenuClass} min-w-[150px] md:min-w-[180px] text-center max-h-64 overflow-y-auto`}>
                        {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(p => (
                          <div key={p} onClick={(e) => { e.stopPropagation(); setMenuAbierto(null); irACategoria(`Obsequios $${p}`); }} className="text-gray-400 hover:text-gray-300 transition-colors cursor-pointer block mt-3 first:mt-0 text-[10px] md:text-xs py-2">
                            $ {p}.00 USD
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </nav>
          )}

          {!user && (
            <div className="w-full flex justify-center mt-4 mb-4 auth-wrapper">
              <button onClick={() => setShowLoginModal(true)} className="text-white hover:text-gray-400 transition-colors p-0 bg-transparent border-none outline-none cursor-pointer z-50">
                <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" height="30" width="30"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </button>
            </div>
          )}
        </header>

        <main className="flex-grow flex flex-col items-center w-full px-4 sm:px-6 md:px-8">
          
          {(!user || activeView === 'home') && (
            <div className="w-full animate-fade-in flex flex-col items-center pb-20">
               <section className="w-full text-center py-16 md:py-32">
                 <h2 className="text-4xl md:text-8xl font-bold tracking-[0.2em] uppercase text-white mb-6 md:mb-8 opacity-90 break-words">Elegancia Atemporal</h2>
                 <p className="text-gray-400 tracking-[0.2em] uppercase text-[10px] md:text-xs max-w-2xl mx-auto leading-loose px-4">
                   Bienvenido al Atelier de Antares. Un espacio dedicado a la sofisticación, el diseño atemporal y la exclusividad en cada detalle.
                 </p>
               </section>
               <section className="w-full max-w-5xl mx-auto py-12 md:py-20 text-center">
                 <h3 className="text-sm md:text-lg tracking-[0.3em] uppercase text-gray-500 mb-8 md:mb-10">Sobre Nosotros</h3>
                 <p className="text-white text-base md:text-2xl leading-relaxed max-w-3xl mx-auto font-light">
                   "Fundada con la visión de redefinir el lujo contemporáneo, Antares fusiona la artesanía tradicional con una estética vanguardista. Cada una de nuestras piezas cuenta una historia de meticulosa atención al detalle y pasión inquebrantable por la perfección."
                 </p>
               </section>
               <section className="w-full max-w-6xl mx-auto py-16 md:py-24">
                 <h3 className="text-sm md:text-lg tracking-[0.3em] uppercase text-gray-500 mb-10 md:mb-16 text-center">Nuestros Servicios</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-center">
                   <div onClick={() => !user ? setShowLoginModal(true) : irACategoria('Sastrería a Medida')} className="p-6 md:p-10 bg-zinc-900/40 hover:bg-zinc-900 transition-colors duration-500 cursor-pointer">
                     <h4 className="text-xs md:text-sm tracking-[0.2em] uppercase text-white mb-4 md:mb-6">Sastrería a Medida</h4>
                     <p className="text-gray-400 text-[10px] md:text-xs tracking-[0.1em] leading-loose">Creación de prendas exclusivas adaptadas a su silueta y estilo personal, utilizando únicamente los tejidos más nobles.</p>
                   </div>
                   <div onClick={() => !user ? setShowLoginModal(true) : irACategoria('Joyería Exclusiva')} className="p-6 md:p-10 bg-zinc-900/40 hover:bg-zinc-900 transition-colors duration-500 cursor-pointer">
                     <h4 className="text-xs md:text-sm tracking-[0.2em] uppercase text-white mb-4 md:mb-6">Joyería Personalizada</h4>
                     <p className="text-gray-400 text-[10px] md:text-xs tracking-[0.1em] leading-loose">Diseño y forja de piezas únicas y exclusivas, seleccionando gemas excepcionales para capturar momentos eternos.</p>
                   </div>
                   <div onClick={() => !user ? setShowLoginModal(true) : setActiveView('perfil')} className="p-6 md:p-10 bg-zinc-900/40 hover:bg-zinc-900 transition-colors duration-500 cursor-pointer sm:col-span-2 lg:col-span-1">
                     <h4 className="text-xs md:text-sm tracking-[0.2em] uppercase text-white mb-4 md:mb-6">Asesoría de Imagen</h4>
                     <p className="text-gray-400 text-[10px] md:text-xs tracking-[0.1em] leading-loose">Curaduría de estilo y armario por nuestros expertos, elevando su presencia y confianza en cada ocasión especial.</p>
                   </div>
                 </div>
               </section>
            </div>
          )}

          {userRole === 'admin' && activeView === 'inventario' && (
            <section className="container mx-auto py-8 md:py-16 flex-grow animate-fade-in w-full max-w-6xl">
              <h2 className="text-[12px] md:text-sm tracking-[0.3em] uppercase text-white mb-12 text-center border-b border-white/10 pb-4">Inventario y Contabilidad</h2>
              <div className="bg-white/5 backdrop-blur-3xl border border-white/5 p-4 md:p-8 w-full overflow-x-auto mb-16">
                <h3 className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-400 mb-6">Stock Disponible (Proyección)</h3>
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-7 gap-4 text-[10px] md:text-xs tracking-[0.3em] uppercase text-gray-500 border-b border-white/10 pb-4 mb-4 font-bold text-center">
                    <div className="col-span-2 text-left">Pieza</div>
                    <div>Talla</div>
                    <div>Stock</div>
                    <div>Costo</div>
                    <div>Precio</div>
                    <div>Ganancia Potencial</div>
                  </div>
                  {stockProyeccion.map((item, idx) => {
                    const costo = parseFloat(item.costo) || 0;
                    const precio = parseFloat(item.precio) || 0;
                    const stockNum = parseInt(item.stock_especifico);
                    const ganancia = !isNaN(stockNum) ? (precio - costo) * stockNum : 0;
                    return (
                      <div key={`inv-${item.id}-${idx}`} className="grid grid-cols-7 gap-4 text-[10px] md:text-xs tracking-[0.1em] text-white border-b border-white/5 py-4 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="col-span-2 flex items-center gap-4 text-left">
                          <img src={item.imagen_url} alt={item.titulo} className="w-10 h-10 object-cover bg-black" />
                          <div className="flex flex-col truncate">
                            <span className="uppercase truncate">{item.titulo}</span>
                            <span className="text-[8px] text-gray-500 uppercase mt-1 truncate">{item.categoria}</span>
                          </div>
                        </div>
                        <div className="text-white font-bold">{item.talla_especifica}</div>
                        <div className="text-white">{item.stock_especifico}</div>
                        <div className="text-gray-400">${costo.toFixed(2)}</div>
                        <div className="text-white font-bold">${precio.toFixed(2)}</div>
                        <div className="text-green-400">{ganancia > 0 ? `+$${ganancia.toFixed(2)}` : 'N/A'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-3xl border border-white/5 p-4 md:p-8 w-full overflow-x-auto">
                <h3 className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white mb-6">Historial de Ventas (Ganancia Real)</h3>
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-6 gap-4 text-[10px] md:text-xs tracking-[0.3em] uppercase text-gray-500 border-b border-white/10 pb-4 mb-4 font-bold text-center">
                    <div className="col-span-2 text-left">Pieza Vendida</div>
                    <div>Talla</div>
                    <div>Costo</div>
                    <div>Precio Venta</div>
                    <div>Ganancia Neta</div>
                  </div>
                  {ventasDesglosadas.map((item, idx) => {
                    const ganancia = item.precio - item.costo;
                    return (
                      <div key={`sold-${item.id}-${idx}`} className="grid grid-cols-6 gap-4 text-[10px] md:text-xs tracking-[0.1em] text-white border-b border-white/5 py-4 items-center text-center hover:bg-white/5 transition-colors">
                        <div className="col-span-2 flex items-center gap-4 text-left">
                          <img src={item.imagen_url} alt={item.titulo} className="w-10 h-10 object-cover bg-black opacity-50" />
                          <div className="flex flex-col truncate">
                            <span className="uppercase truncate text-gray-300">{item.titulo}</span>
                            <span className="text-[8px] text-gray-500 uppercase mt-1 truncate">{item.categoria}</span>
                          </div>
                        </div>
                        <div className="text-white font-bold">{item.talla_especifica}</div>
                        <div className="text-gray-400">${item.costo.toFixed(2)}</div>
                        <div className="text-white font-bold">${item.precio.toFixed(2)}</div>
                        <div className="text-green-400 font-bold">+${ganancia.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {activeView === 'pedidos' && (
            <section className="container mx-auto py-8 md:py-16 flex-grow animate-fade-in w-full max-w-4xl">
              <h2 className="text-[10px] md:text-[14px] tracking-[0.3em] uppercase text-white mb-8 md:mb-12 text-center border-b border-white/10 pb-4 md:pb-6">
                {userRole === 'admin' ? 'Gestión de Pedidos' : 'Mis Pedidos'}
              </h2>
              {userRole === 'admin' ? (
                <div className="flex flex-col gap-6 w-full">
                  {Object.entries(groupedOrdersByMonth).map(([month, monthPedidos]) => {
                    const sortedMonthPedidos = [...monthPedidos].sort((a,b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
                    const userGroups = {};
                    sortedMonthPedidos.forEach(ped => {
                      const clientKey = `${ped.cliente_nombre}|${ped.cliente_telefono}`;
                      if(!userGroups[clientKey]) userGroups[clientKey] = [];
                      userGroups[clientKey].push({...ped, orderNumber: (userGroups[clientKey].length + 1).toString().padStart(3, '0')});
                    });
                    return (
                      <div key={month} className="mb-12 w-full">
                        <h3 className="text-[10px] md:text-[14px] font-bold text-gray-500 tracking-[0.3em] uppercase mb-6 border-b border-white/10 pb-2">{month}</h3>
                        <div className="flex flex-col gap-6">
                          {Object.entries(userGroups).map(([clientKey, clientPedidos]) => {
                             const [nombre, telefono] = clientKey.split('|');
                             const expandKey = `${month}-${clientKey}`;
                             const isExpanded = pedidoExpandido === expandKey;
                             return (
                               <div key={clientKey} className="bg-black/30 backdrop-blur-xl p-4 md:p-6 shadow-2xl rounded-sm border border-white/5 w-full">
                                   <div className="flex justify-between items-center cursor-pointer" onClick={() => setPedidoExpandido(isExpanded ? null : expandKey)}>
                                      <div className="flex items-center gap-4">
                                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-black flex items-center justify-center font-bold text-base sm:text-lg rounded-full uppercase">{nombre.charAt(0)}</div>
                                         <div>
                                           <p className="text-white text-[8px] sm:text-[10px] tracking-[0.1em] uppercase font-bold">{nombre}</p>
                                           <p className="text-gray-400 text-[7px] sm:text-[8px] tracking-[0.1em] mt-1">📞 {telefono}</p>
                                         </div>
                                      </div>
                                      <div className="text-right text-gray-400 text-[7px] sm:text-[8px] tracking-[0.2em] uppercase">
                                         {clientPedidos.length} Pedido(s) {isExpanded ? '[-]' : '[+]'}
                                      </div>
                                   </div>
                                   {isExpanded && (
                                      <div className="mt-6 border-t border-white/10 pt-6 space-y-6">
                                         {[...clientPedidos].reverse().map(pedido => (
                                            <div key={pedido.id} className="bg-black/20 p-3 sm:p-4 border border-white/5">
                                               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-white/5 pb-2 gap-2 sm:gap-0">
                                                  <span className="text-white font-bold text-[8px] sm:text-[10px] tracking-[0.2em]">PEDIDO #{pedido.orderNumber}</span>
                                                  <span className={`text-[7px] sm:text-[8px] md:text-[10px] px-2 sm:px-3 py-1 font-bold uppercase tracking-[0.1em] text-center w-fit ${pedido.estado === 'Completado' ? 'bg-green-500/20 text-green-500' : pedido.estado === 'Cancelado' ? 'bg-red-500/20 text-red-500' : 'bg-white/20 text-white'}`}>
                                                    {pedido.estado}
                                                  </span>
                                               </div>
                                               <div className="space-y-2 mb-4">
                                                 {JSON.parse(pedido.productos).map((prod, i) => (
                                                   <div key={i} className="flex justify-between text-[8px] sm:text-[10px] text-gray-300">
                                                     <span className="truncate pr-2">{prod.cantidad}x {prod.titulo} {prod.tallaSeleccionada ? `(Talla: ${prod.tallaSeleccionada})` : ''}</span>
                                                     <span>${(prod.precio * prod.cantidad).toFixed(2)}</span>
                                                   </div>
                                                 ))}
                                                 <div className="pt-2 mt-2 border-t border-white/10 flex justify-between text-[8px] sm:text-[10px] font-bold text-white">
                                                   <span>Envío:</span>
                                                   <span>${parseFloat(pedido.total_envio).toFixed(2)}</span>
                                                 </div>
                                               </div>
                                               {pedido.link_maps && (
                                                 <div className="pt-2 text-[8px] sm:text-[10px] text-blue-400 mb-2">
                                                   <a href={pedido.link_maps} target="_blank" rel="noreferrer">Ver Ubicación (Maps)</a>
                                                 </div>
                                               )}
                                               {pedido.comprobante_url && (
                                                 <a href={pedido.comprobante_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white text-[8px] sm:text-[10px] tracking-[0.1em] underline block mb-4">Ver Comprobante de Pago</a>
                                               )}
                                               {pedido.estado === 'En progreso' && (
                                                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 pt-4 border-t border-white/5">
                                                   <button onClick={() => completarPedido(pedido)} className="w-full sm:flex-grow py-3 bg-white text-black text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 cursor-pointer outline-none border-none">
                                                     Completar (Descuenta Stock)
                                                   </button>
                                                   <button onClick={() => cancelarPedido(pedido.id)} className="w-full sm:w-auto py-3 px-6 bg-transparent text-red-500 border border-red-500/30 hover:bg-red-500/10 text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer outline-none">
                                                     Cancelar
                                                   </button>
                                                 </div>
                                               )}
                                            </div>
                                         ))}
                                      </div>
                                   )}
                               </div>
                             )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  {listaPedidos.length === 0 && <p className="text-gray-500 text-center text-[10px] uppercase">No hay pedidos registrados.</p>}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-xl p-6 md:p-10 shadow-2xl rounded-sm w-full">
                  <p className="text-gray-400 tracking-[0.2em] uppercase text-[10px] md:text-[12px] text-center py-6 md:py-10">Aún no hay un historial de pedidos en su cuenta.</p>
                </div>
              )}
            </section>
          )}

          {user && activeView === 'categoria' && activeCategory === 'Prêt-à-Porter' && (
            <section className="container mx-auto py-8 md:py-16 flex-grow animate-fade-in w-full max-w-7xl">
              <h2 className="text-[10px] md:text-[14px] tracking-[0.3em] uppercase text-white mb-8 sm:mb-12 text-center border-b border-white/10 pb-4 sm:pb-6 break-words">Prêt-à-Porter Personalizado</h2>
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-start w-full">
                 <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-none lg:w-1/2 flex flex-col gap-4">
                     <div className="flex justify-center gap-2 sm:gap-4 mb-2">
                       <button type="button" onClick={() => { setCustomView('frente'); setSizeOffset(0); setYOffset(0); }} className={`px-4 sm:px-6 py-2 text-[8px] sm:text-[10px] tracking-[0.2em] uppercase transition-colors outline-none cursor-pointer border flex-1 sm:flex-none ${customVista === 'frente' ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-gray-500 hover:text-white'}`}>Frente</button>
                       <button type="button" onClick={() => { setCustomView('espalda'); setSizeOffset(0); setYOffset(0); }} className={`px-4 sm:px-6 py-2 text-[8px] sm:text-[10px] tracking-[0.2em] uppercase transition-colors outline-none cursor-pointer border flex-1 sm:flex-none ${customVista === 'espalda' ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-gray-500 hover:text-white'}`}>Espalda</button>
                     </div>
                     <div className="w-full relative bg-transparent backdrop-blur-[30px] aspect-[3/4] flex items-center justify-center overflow-hidden group shadow-2xl border-none mx-auto">
                       <img src={customRenderedImage || getMockupUrl(customPrenda, customVista)} alt="Renderizado Prêt-à-Porter" className="w-full h-full object-contain z-10 transition-opacity duration-300" />
                       {!customRenderedImage && <p className="absolute text-[8px] sm:text-[10px] text-gray-600 uppercase tracking-[0.2em] z-50 text-center px-4">Cargando Lienzo...</p>}
                     </div>
                 </div>
                 <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-none lg:w-1/2 flex flex-col gap-8 lg:gap-10">
                   <div className="flex flex-col gap-3 sm:gap-4">
                     <p className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase text-center lg:text-left">1. Seleccione la Prenda</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full">
                       {['Camiseta', 'Buso', 'Hoodie', 'Capucha'].map(prenda => (
                         <button key={prenda} type="button" onClick={() => setCustomPrenda(prenda)} className={`py-3 px-2 text-[8px] md:text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer outline-none border w-full ${customPrenda === prenda ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/20 hover:text-white hover:border-white/50'}`}>
                           {prenda}
                         </button>
                       ))}
                     </div>
                   </div>
                   <div className="flex flex-col gap-3 sm:gap-4">
                     <p className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase text-center lg:text-left">2. Tono de Prenda</p>
                     <div className="flex gap-3 sm:gap-4 flex-wrap items-center justify-center lg:justify-start">
                       {coloresPredeterminados.map(color => (
                         <div key={color.name} onClick={() => setCustomColor(color.hex)} className={`w-8 h-8 sm:w-10 sm:h-10 cursor-pointer rounded-full border-2 transition-transform ${customColor === color.hex ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: color.hex, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} title={color.name} />
                       ))}
                       <label className={`relative w-8 h-8 sm:w-10 sm:h-10 cursor-pointer rounded-full border-2 transition-transform flex items-center justify-center overflow-hidden ${!coloresPredeterminados.map(c=>c.hex).includes(customColor) ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`} style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} title="Elegir otro color">
                         <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="absolute opacity-0 w-full h-full cursor-pointer" />
                       </label>
                     </div>
                   </div>
                   <div className="flex flex-col gap-3 sm:gap-4">
                     <p className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase text-center lg:text-left">3. Insignia Personal</p>
                     <div className="flex flex-col gap-2 w-full">
                       <input type="file" accept="image/*" onChange={procesarInsigniaLogotipo} className="text-[8px] sm:text-[10px] text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-4 sm:file:px-6 file:border file:border-gray-500 hover:file:border-white file:tracking-[0.1em] sm:file:tracking-[0.2em] file:uppercase file:bg-transparent file:text-gray-500 hover:file:text-white transition-colors cursor-pointer w-full" />
                       {isRemovingBg && <p className="text-[7px] sm:text-[8px] text-blue-400 tracking-[0.1em] uppercase animate-pulse mt-1 sm:mt-2 text-center lg:text-left">Procesando transparencia y renderizando...</p>}
                     </div>
                   </div>
                   {customLogo && (
                     <div className="flex flex-col gap-4 animate-fade-in w-full">
                       <p className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase text-center lg:text-left">4. Ubicación ({customVista})</p>
                       <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
                         {customVista === 'frente' ? (
                           <>
                             <button type="button" onClick={() => { setCustomPlacement('pecho-izq'); setSizeOffset(0); setYOffset(0); }} className={`py-2 sm:py-3 px-1 sm:px-2 text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer outline-none border w-full ${customPlacement === 'pecho-izq' ? 'bg-white/10 text-white border-white/30' : 'bg-transparent text-gray-500 border-white/10 hover:text-white hover:border-white/30'}`}>Pecho Izquierdo</button>
                             <button type="button" onClick={() => { setCustomPlacement('pecho-der'); setSizeOffset(0); setYOffset(0); }} className={`py-2 sm:py-3 px-1 sm:px-2 text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer outline-none border w-full ${customPlacement === 'pecho-der' ? 'bg-white/10 text-white border-white/30' : 'bg-transparent text-gray-500 border-white/10 hover:text-white hover:border-white/30'}`}>Pecho Derecho</button>
                             <button type="button" onClick={() => { setCustomPlacement('pecho-sup-centro'); setSizeOffset(0); setYOffset(0); }} className={`py-2 sm:py-3 px-1 sm:px-2 text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer outline-none border col-span-2 w-full ${customPlacement === 'pecho-sup-centro' ? 'bg-white/10 text-white border-white/30' : 'bg-transparent text-gray-500 border-white/10 hover:text-white hover:border-white/30'}`}>Pecho Sup. Centro</button>
                             <button type="button" onClick={() => { setCustomPlacement('centro-pecho'); setSizeOffset(0); setYOffset(0); }} className={`py-2 sm:py-3 px-1 sm:px-2 text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer outline-none border col-span-2 w-full ${customPlacement === 'centro-pecho' ? 'bg-white/10 text-white border-white/30' : 'bg-transparent text-gray-500 border-white/10 hover:text-white hover:border-white/30'}`}>Centro Pecho</button>
                           </>
                         ) : (
                           <>
                             <button type="button" onClick={() => { setCustomPlacement('espalda-sup'); setSizeOffset(0); setYOffset(0); }} className={`py-2 sm:py-3 px-1 sm:px-2 text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer outline-none border w-full ${customPlacement === 'espalda-sup' ? 'bg-white/10 text-white border-white/30' : 'bg-transparent text-gray-500 border-white/10 hover:text-white hover:border-white/30'}`}>Espalda Superior</button>
                             <button type="button" onClick={() => { setCustomPlacement('espalda-centro'); setSizeOffset(0); setYOffset(0); }} className={`py-2 sm:py-3 px-1 sm:px-2 text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer outline-none border w-full ${customPlacement === 'espalda-centro' ? 'bg-white/10 text-white border-white/30' : 'bg-transparent text-gray-500 border-white/10 hover:text-white hover:border-white/30'}`}>Centro Espalda</button>
                           </>
                         )}
                       </div>
                       <div className="flex flex-col gap-3 sm:gap-4 mt-2 w-full">
                         <p className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase text-center lg:text-left">5. Ajuste Fino</p>
                         <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 w-full">
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-[7px] sm:text-[8px] text-gray-400 tracking-[0.1em] uppercase">Tamaño</span>
                             <div className="flex gap-2">
                               <button type="button" onClick={() => setSizeOffset(s => s - 5)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-transparent border border-white/20 text-white hover:bg-white/10 cursor-pointer text-base sm:text-lg font-bold outline-none">-</button>
                               <button type="button" onClick={() => setSizeOffset(s => s + 5)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-transparent border border-white/20 text-white hover:bg-white/10 cursor-pointer text-base sm:text-lg font-bold outline-none">+</button>
                             </div>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-[7px] sm:text-[8px] text-gray-400 tracking-[0.1em] uppercase">Posición Vertical</span>
                             <div className="flex gap-2">
                               <button type="button" onClick={() => setYOffset(y => y - 5)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-transparent border border-white/20 text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm font-bold outline-none">▲</button>
                               <button type="button" onClick={() => setYOffset(y => y + 5)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-transparent border border-white/20 text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm font-bold outline-none">▼</button>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                   <div className="mt-4 sm:mt-8 pt-4 sm:pt-8 border-t border-white/10 flex flex-col gap-4 sm:gap-6 w-full">
                     <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-2 sm:gap-0 w-full">
                        <span className="text-[12px] sm:text-[14px] text-white tracking-[0.2em] font-light">VALOR A MEDIDA</span>
                        <span className="text-[16px] sm:text-[18px] text-white font-bold tracking-[0.1em]">${getCalculatedPrice()} USD</span>
                     </div>
                     <button onClick={handleCustomAddToCart} className="w-full bg-white text-black text-[8px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase py-4 sm:py-5 hover:bg-gray-200 transition-colors cursor-pointer outline-none border-none shadow-xl">
                       Añadir Diseño al Bolso
                     </button>
                   </div>
                 </div>
              </div>
            </section>
          )}

          {user && activeView === 'categoria' && activeCategory !== 'Prêt-à-Porter' && (
            <section className="container mx-auto py-8 md:py-16 flex-grow animate-fade-in w-full max-w-7xl">
               <h2 className="text-[10px] md:text-[14px] tracking-[0.3em] uppercase text-white mb-8 md:mb-12 text-center border-b border-white/10 pb-4 md:pb-6 break-words">{activeCategory}</h2>
               {['Acero Fino', 'Plata de Ley 925'].includes(activeCategory) && (
                 <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-12 mb-6 border-b border-white/10 pb-6">
                   {subcategoriasJoyeria.map(sub => (
                     <li key={sub} onClick={() => setActiveSubCategory(sub)} className={`text-[8px] sm:text-[10px] tracking-[0.2em] uppercase cursor-pointer transition-colors ${activeSubCategory === sub ? 'text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}>
                       {sub}
                     </li>
                   ))}
                 </ul>
               )}

               {activeCategory === 'Acero Fino' && (
                 <div className="w-full max-w-3xl mx-auto mb-8 sm:mb-10 flex flex-col items-center relative z-[150]">
                    <p className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gray-500 font-bold mb-4 sm:mb-6 uppercase">Ordenar Por</p>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-16 w-full text-[8px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase">
                       <div className="relative group cursor-pointer pb-2" onMouseLeave={() => setOpenFilter(null)}>
                          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilter(openFilter === 'color' ? null : 'color'); }} className={`transition-colors ${filtroColor !== 'Todo' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-white'}`}>
                            Color: {filtroColor === 'Todo' ? 'Todos' : filtroColor}
                          </div>
                          {openFilter === 'color' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[200] min-w-[120px] sm:min-w-[140px]">
                               <div className="bg-transparent backdrop-blur-[30px] w-full flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4 shadow-none border-none">
                                 {['Todo', 'Silver', 'Gold', 'Black'].map(opt => (
                                   <span key={opt} onClick={(e) => { e.stopPropagation(); setFiltroColor(opt); setOpenFilter(null); }} className={`cursor-pointer transition-colors w-full text-center py-2 ${filtroColor === opt ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                                     {opt === 'Todo' ? 'Todos' : opt}
                                   </span>
                                 ))}
                               </div>
                            </div>
                          )}
                       </div>
                       
                       {['Todo', 'Anillos'].includes(activeSubCategory) && (
                         <div className="relative group cursor-pointer pb-2" onMouseLeave={() => setOpenFilter(null)}>
                            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilter(openFilter === 'talla' ? null : 'talla'); }} className={`transition-colors ${filtroTalla !== 'Todo' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-white'}`}>
                              Talla: {filtroTalla === 'Todo' ? 'Todas' : filtroTalla}
                            </div>
                            {openFilter === 'talla' && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[200] min-w-[120px] sm:min-w-[140px]">
                                 <div className="bg-transparent backdrop-blur-[30px] w-full flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4 shadow-none border-none max-h-64 overflow-y-auto">
                                   <span onClick={(e) => { e.stopPropagation(); setFiltroTalla('Todo'); setOpenFilter(null); }} className={`cursor-pointer transition-colors w-full text-center py-2 ${filtroTalla === 'Todo' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Todas</span>
                                   {tallasDisponibles.map(t => (
                                     <span key={t} onClick={(e) => { e.stopPropagation(); setFiltroTalla(t); setOpenFilter(null); }} className={`cursor-pointer transition-colors w-full text-center py-2 ${filtroTalla === t ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                                       {t}
                                     </span>
                                   ))}
                                 </div>
                              </div>
                            )}
                         </div>
                       )}

                       <div className="relative group cursor-pointer pb-2" onMouseLeave={() => setOpenFilter(null)}>
                          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilter(openFilter === 'precio' ? null : 'precio'); }} className={`transition-colors ${ordenPrecio !== '' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-white'}`}>
                            Precio: {ordenPrecio === '' ? 'Normal' : (ordenPrecio === 'Asc' ? 'Menor a Mayor' : 'Mayor a Menor')}
                          </div>
                          {openFilter === 'precio' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[200] min-w-[140px] sm:min-w-[160px]">
                               <div className="bg-transparent backdrop-blur-[30px] w-full flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4 shadow-none border-none">
                                 <span onClick={(e) => { e.stopPropagation(); setOrdenPrecio(''); setOpenFilter(null); }} className={`cursor-pointer transition-colors w-full text-center py-2 ${ordenPrecio === '' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Normal</span>
                                 <span onClick={(e) => { e.stopPropagation(); setOrdenPrecio('Asc'); setOpenFilter(null); }} className={`cursor-pointer transition-colors w-full text-center py-2 ${ordenPrecio === 'Asc' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Menor a Mayor</span>
                                 <span onClick={(e) => { e.stopPropagation(); setOrdenPrecio('Desc'); setOpenFilter(null); }} className={`cursor-pointer transition-colors w-full text-center py-2 ${ordenPrecio === 'Desc' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Mayor a Menor</span>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
               )}

               {userRole === 'admin' && !showInlineForm && (
                 <div onClick={() => { setEditandoId(null); setNuevaPieza({titulo: '', descripcion: '', costo: '', precio: '', disponibilidad: '', subcategoria: activeSubCategory !== 'Todo' ? activeSubCategory : '', tallas: {}, color: '', imagen: null, imagen_url: '' }); setShowInlineForm(true); }} className="mb-6 sm:mb-8 md:mb-12 border border-dashed border-white/20 py-4 sm:py-6 md:py-8 text-center hover:bg-white/5 transition-colors cursor-pointer w-full">
                   <span className="text-white tracking-[0.2em] text-[8px] sm:text-[10px] uppercase">+ Añadir nueva pieza a {activeCategory}</span>
                 </div>
               )}

               {userRole === 'admin' && showInlineForm && (
                 <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-start sm:items-center justify-center p-0 sm:p-4 animate-fade-in overflow-y-auto">
                   <form onSubmit={handlePublicarLocal} className="bg-[#0a0a0a] sm:bg-black/90 backdrop-blur-3xl border border-white/10 p-6 md:p-10 shadow-2xl relative w-full h-full sm:h-auto max-w-4xl m-auto rounded-none sm:rounded-sm overflow-y-auto">
                     <button type="button" onClick={cerrarFormulario} className="absolute top-4 right-4 sm:right-6 text-gray-500 hover:text-white text-3xl bg-transparent border-none cursor-pointer outline-none z-50">×</button>
                     <h3 className="text-[10px] md:text-sm tracking-[0.3em] uppercase text-white mb-6 text-center drop-shadow-md">{editandoId ? 'EDITAR PIEZA' : 'DETALLES DE LA NUEVA PIEZA'}</h3>
                     {(nuevaPieza.imagen || nuevaPieza.imagen_url) && (
                       <div className="mb-4 flex justify-center bg-transparent p-0">
                         <img src={nuevaPieza.imagen ? URL.createObjectURL(nuevaPieza.imagen) : nuevaPieza.imagen_url} alt="Vista previa" className="h-32 sm:h-40 md:h-64 w-auto object-contain drop-shadow-2xl" />
                       </div>
                     )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-4 mb-4 text-center items-center justify-items-center w-full">
                       <input type="text" value={nuevaPieza.titulo} onChange={e => setNuevaPieza({...nuevaPieza, titulo: e.target.value})} placeholder="TÍTULO DE LA OBRA" className="w-full bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors" required />
                       <div className="w-full relative">
                         <input type="number" value={nuevaPieza.costo} onChange={e => setNuevaPieza({...nuevaPieza, costo: e.target.value})} placeholder="COSTO FABRICACIÓN (USD)" className="w-full bg-transparent border-b border-white/20 text-white/70 text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-600 text-center hover:border-white/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                       </div>
                       <input type="number" value={nuevaPieza.precio} onChange={e => setNuevaPieza({...nuevaPieza, precio: e.target.value})} placeholder="PRECIO VENTA (USD)" className="w-full bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-400 text-center hover:border-white/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" required />
                       {nuevaPieza.subcategoria !== 'Anillos' && (
                         <input type="text" value={nuevaPieza.disponibilidad} onChange={e => setNuevaPieza({...nuevaPieza, disponibilidad: e.target.value})} placeholder="DISPONIBILIDAD (EJ: 5 EN STOCK)" className="w-full bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-400 text-center hover:border-white/50 transition-colors" />
                       )}
                       {['Acero Fino', 'Plata de Ley 925'].includes(activeCategory) && (
                         <div className="relative w-full z-[160]" onMouseLeave={() => setOpenFormSelect(null)}>
                           <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFormSelect(openFormSelect === 'subcat' ? null : 'subcat'); }} className="w-full bg-transparent border-b border-white/20 text-gray-500 hover:text-white text-[10px] md:text-xs tracking-[0.2em] py-2 cursor-pointer text-center transition-colors uppercase">
                             {nuevaPieza.subcategoria || 'TIPO DE JOYA (OPCIONAL)'}
                           </div>
                           {openFormSelect === 'subcat' && (
                             <div className="absolute top-full left-0 w-full pt-1 z-[300]">
                               <div className="bg-transparent backdrop-blur-[30px] flex flex-col gap-4 py-4 shadow-none border-none max-h-48 overflow-y-auto">
                                 <div onClick={(e) => { e.stopPropagation(); setNuevaPieza({...nuevaPieza, subcategoria: '', tallas: {}}); setOpenFormSelect(null); }} className="text-[10px] md:text-xs tracking-[0.2em] text-gray-500 hover:text-white cursor-pointer text-center transition-colors uppercase py-2">NINGUNO</div>
                                 {subcategoriasJoyeria.filter(s => s !== 'Todo').map(sub => (
                                   <div key={sub} onClick={(e) => { e.stopPropagation(); setNuevaPieza({...nuevaPieza, subcategoria: sub, tallas: {}}); setOpenFormSelect(null); }} className="text-[10px] md:text-xs tracking-[0.2em] text-gray-500 hover:text-white cursor-pointer text-center transition-colors uppercase py-2">{sub}</div>
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                       )}
                       {activeCategory === 'Acero Fino' && (
                         <div className="relative w-full z-[150]" onMouseLeave={() => setOpenFormSelect(null)}>
                           <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFormSelect(openFormSelect === 'color' ? null : 'color'); }} className="w-full bg-transparent border-b border-white/20 text-gray-500 hover:text-white text-[10px] md:text-xs tracking-[0.2em] py-2 cursor-pointer text-center transition-colors uppercase">
                             {nuevaPieza.color || 'COLOR (OPCIONAL)'}
                           </div>
                           {openFormSelect === 'color' && (
                             <div className="absolute top-full left-0 w-full pt-1 z-[300]">
                               <div className="bg-transparent backdrop-blur-[30px] flex flex-col gap-4 py-4 shadow-none border-none">
                                 <div onClick={(e) => { e.stopPropagation(); setNuevaPieza({...nuevaPieza, color: ''}); setOpenFormSelect(null); }} className="text-[10px] md:text-xs tracking-[0.2em] text-gray-500 hover:text-white cursor-pointer text-center transition-colors uppercase py-2">NINGUNO</div>
                                 {['Silver', 'Gold', 'Black'].map(c => (
                                   <div key={c} onClick={(e) => { e.stopPropagation(); setNuevaPieza({...nuevaPieza, color: c}); setOpenFormSelect(null); }} className="text-[10px] md:text-xs tracking-[0.2em] text-gray-500 hover:text-white cursor-pointer text-center transition-colors uppercase py-2">{c}</div>
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                     {nuevaPieza.costo > 0 && (
                       <div className="w-full flex flex-col items-center justify-center mb-6 pb-4 border-b border-white/5 mt-4">
                         <p className="text-[8px] md:text-[10px] tracking-[0.2em] text-gray-500 mb-4 uppercase">Estrategia de Precios (Haz clic para aplicar)</p>
                         <div className="flex gap-2 sm:gap-4 md:gap-8 flex-wrap justify-center text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] text-gray-300 uppercase">
                            {[115, 100, 75, 50, 25].map(porcentaje => {
                              const sugerido = nuevaPieza.costo * (1 + porcentaje / 100);
                              return (
                                <button key={porcentaje} type="button" onClick={() => setNuevaPieza({...nuevaPieza, precio: sugerido.toFixed(2)})} className="bg-transparent text-gray-500 hover:text-white transition-colors cursor-pointer outline-none border border-gray-500 hover:border-white px-2 sm:px-4 py-1 sm:py-2">{porcentaje}%: ${sugerido.toFixed(2)}</button>
                              );
                            })}
                         </div>
                       </div>
                     )}
                     {nuevaPieza.subcategoria === 'Anillos' && (
                       <div className="w-full flex flex-col items-center mt-4 mb-6 pb-4">
                         <p className="text-[10px] md:text-xs tracking-[0.2em] text-gray-300 mb-6 uppercase drop-shadow-md">Inventario por talla:</p>
                         <div className="flex gap-2 sm:gap-4 md:gap-8 flex-wrap justify-center">
                           {tallasDisponibles.map(talla => (
                             <div key={talla} className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer" onClick={() => { const current = parseInt(nuevaPieza.tallas[talla]) || 0; setNuevaPieza({...nuevaPieza, tallas: { ...nuevaPieza.tallas, [talla]: current + 1 }}); }}>
                               <span className="text-white text-[10px] sm:text-[12px] md:text-sm font-light">{talla}</span>
                               <input type="number" min="0" value={nuevaPieza.tallas[talla] || ''} onChange={(e) => setNuevaPieza({...nuevaPieza, tallas: { ...nuevaPieza.tallas, [talla]: e.target.value }})} onClick={(e) => e.stopPropagation()} placeholder="0" className="w-8 sm:w-10 bg-transparent text-white text-center text-[8px] sm:text-[10px] md:text-xs py-1 outline-none border-b border-white/20 placeholder-gray-500 transition-colors focus:border-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0" />
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                     <textarea value={nuevaPieza.descripcion} onChange={e => setNuevaPieza({...nuevaPieza, descripcion: e.target.value})} placeholder="DESCRIPCIÓN EDITORIAL..." rows="2" className="w-full bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors mb-6 resize-none"></textarea>
                     <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-10 bg-transparent p-0 w-full mb-10 sm:mb-0">
                       <input type="file" onChange={e => setNuevaPieza({...nuevaPieza, imagen: e.target.files[0]})} className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-4 sm:file:px-6 file:border file:border-gray-500 hover:file:border-white file:tracking-[0.1em] sm:file:tracking-[0.2em] file:uppercase file:bg-transparent file:text-gray-500 hover:file:text-white transition-colors cursor-pointer w-full md:w-auto" />
                       <button type="submit" className="bg-transparent text-gray-500 hover:text-white transition-colors cursor-pointer outline-none border border-gray-500 hover:border-white text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase px-8 sm:px-12 py-3 w-full md:w-auto">{editandoId ? 'Guardar Cambios' : 'Publicar'}</button>
                     </div>
                   </form>
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 w-full">
                 {productosMostrar.map(producto => renderProductoCard(producto))}
                 {productosMostrar.length === 0 && (
                    <p className="text-gray-500 tracking-[0.2em] uppercase text-[10px] col-span-full text-center py-10 w-full">No hay piezas en esta categoría aún.</p>
                 )}
               </div>
            </section>
          )}

          {/* MODAL PRODUCTO */}
          {productoSeleccionado && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-0 sm:p-4 screen-only animate-fade-in" onClick={() => setProductoSeleccionado(null)}>
              <div className="w-full h-full sm:h-auto max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-4xl flex flex-col md:flex-row relative shadow-2xl overflow-y-auto sm:overflow-hidden rounded-none sm:rounded-sm items-stretch bg-[#0a0a0a] max-h-[100vh] sm:max-h-[90vh] md:max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <button onClick={() => setProductoSeleccionado(null)} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 z-[250] text-2xl sm:text-3xl cursor-pointer bg-black/50 sm:bg-transparent rounded-full sm:rounded-none w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center border-none outline-none">×</button>
                <div className="w-full md:w-1/2 p-0 m-0 bg-[#0a0a0a] flex flex-col justify-center min-h-[300px] md:min-h-0">
                  <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.titulo} className="w-full h-full object-cover sm:object-contain block m-0 p-0" />
                </div>
                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center text-center bg-white/5 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/5 m-0">
                  <h2 className="text-[12px] sm:text-[14px] md:text-[20px] tracking-[0.2em] uppercase text-white mb-2 drop-shadow-md w-full">{productoSeleccionado.titulo}</h2>
                  <p className="text-[12px] sm:text-[14px] tracking-[0.1em] text-white font-light mb-6 sm:mb-8 drop-shadow-md">${productoSeleccionado.precio} USD</p>
                  
                  {productoSeleccionado.subcategoria !== 'Anillos' && (
                    <p className="text-[10px] sm:text-[12px] tracking-[0.2em] text-gray-300 mb-6 sm:mb-8 uppercase drop-shadow-md">
                      {productoSeleccionado.disponibilidad ? productoSeleccionado.disponibilidad : 'Bajo Pedido'}
                    </p>
                  )}

                  {productoSeleccionado.subcategoria === 'Anillos' && (() => {
                     const modalTallasObj = parseTallasseguro(productoSeleccionado.tallas);
                     const modalSelectedSizes = tallasSeleccionadas[productoSeleccionado.id] || [];
                     const modalCanBuy = modalSelectedSizes.length > 0;

                     return (
                     <div className="flex flex-col items-center w-full mb-8 sm:mb-10 mt-2">
                       <p className="text-[8px] sm:text-[10px] tracking-[0.2em] text-gray-400 mb-4 sm:mb-6 uppercase">Seleccione su talla</p>
                       <div className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full">
                         {tallasDisponibles.map(talla => {
                           const stock = parseInt(modalTallasObj[talla] || 0);
                           const isAvailable = stock > 0;
                           const isSelected = modalSelectedSizes.includes(talla);
                           return (
                             <div key={talla} className="flex flex-col items-center gap-1 sm:gap-2">
                               <button 
                                 type="button"
                                 onClick={(e) => { 
                                   e.preventDefault(); e.stopPropagation(); 
                                   if(isAvailable) handleSelectTalla(e, productoSeleccionado.id, talla); 
                                 }}
                                 className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] sm:text-[13px] tracking-[0.1em] transition-all duration-300 border outline-none ${isAvailable ? (isSelected ? 'bg-white text-black border-white font-bold scale-110 cursor-pointer' : 'bg-transparent text-white border-white/30 hover:border-white cursor-pointer') : 'border-red-500/20 text-red-500 cursor-not-allowed'}`}
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
                       {userRole === 'cliente' && !productoSeleccionado.vendido && (
                         <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-8 sm:mt-12 w-full justify-center">
                           <button 
                             onClick={(e) => { if(modalCanBuy) agregarAlCarrito(productoSeleccionado, e); }} 
                             className={`w-full sm:flex-grow text-[8px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase py-3 sm:py-4 transition-colors cursor-pointer border-none outline-none ${modalCanBuy ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-gray-400 cursor-not-allowed'}`}
                           >
                             {modalCanBuy ? 'AÑADIR AL BOLSO' : 'ELIJA TALLA'}
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); toggleFavorito(productoSeleccionado.id); }} className="w-full sm:w-auto border border-white/20 py-3 sm:py-0 px-6 text-white hover:bg-white/10 transition-colors cursor-pointer text-xs sm:text-sm bg-transparent outline-none flex items-center justify-center">{favoritos.includes(productoSeleccionado.id) ? '♥ QUITAR' : '♡ GUARDAR'}</button>
                         </div>
                       )}
                     </div>
                     );
                  })()}

                  {productoSeleccionado.subcategoria !== 'Anillos' && (
                    <>
                      <div className="w-12 h-px bg-white/30 mb-6 sm:mb-8 mx-auto"></div>
                      <p className="text-[10px] sm:text-[12px] text-white leading-loose mb-8 sm:mb-12 uppercase tracking-[0.1em] drop-shadow-sm break-words w-full">{productoSeleccionado.descripcion}</p>
                      
                      {userRole === 'cliente' && !productoSeleccionado.vendido ? (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-auto w-full justify-center">
                          <button onClick={(e) => agregarAlCarrito(productoSeleccionado, e)} className="w-full sm:flex-grow bg-white text-black text-[7px] sm:text-[8px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase py-3 sm:py-4 hover:bg-gray-200 transition-colors cursor-pointer border-none outline-none">Añadir al Bolso</button>
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorito(productoSeleccionado.id); }} className="w-full sm:w-auto border border-white/20 py-3 sm:py-0 px-6 text-white hover:bg-white/10 transition-colors cursor-pointer text-xs sm:text-sm bg-transparent outline-none flex items-center justify-center">{favoritos.includes(productoSeleccionado.id) ? '♥ QUITAR' : '♡ GUARDAR'}</button>
                        </div>
                      ) : userRole === 'cliente' && (
                        <div className="mt-auto py-3 sm:py-4 text-center border border-white/20 bg-black/20 w-full"><span className="text-gray-300 tracking-[0.3em] sm:tracking-[0.4em] text-[7px] sm:text-[8px] font-bold uppercase">Pieza Agotada</span></div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
        
        <footer className="bg-black py-8 md:py-12 text-center text-gray-600 text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.5em] uppercase border-none mt-auto px-4 screen-only w-full">
          &copy; {new Date().getFullYear()} ANTARES. Elegancia Atemporal.
        </footer>
      </div>

      {showLoginModal && <Auth onClose={() => setShowLoginModal(false)} />}

      <div className="auth-wrapper">
      {showCompleteProfile && user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[300] flex items-center justify-center p-0 sm:p-4 animate-fade-in overflow-y-auto">
           <div className="bg-white/5 backdrop-blur-3xl border border-none p-6 sm:p-8 md:p-16 w-full h-full sm:h-auto max-w-2xl flex flex-col shadow-2xl relative my-0 sm:my-8 rounded-none overflow-y-auto sm:overflow-visible">
              {(user.user_metadata?.first_name) && (
                <button onClick={() => setShowCompleteProfile(false)} className="absolute top-2 right-2 sm:top-4 sm:right-6 text-gray-500 hover:text-white text-2xl sm:text-3xl bg-black/50 sm:bg-transparent rounded-full sm:rounded-none w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center border-none cursor-pointer outline-none z-50">×</button>
              )}
              <h2 className="text-[12px] sm:text-[14px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white mb-8 sm:mb-12 text-center font-light mt-6 sm:mt-0">Complete su Perfil</h2>
              <form onSubmit={handleGuardarPerfil} className="flex flex-col gap-8 sm:gap-10 w-full">
                  <div className="relative w-full z-[160]" onMouseLeave={() => setOpenFormSelect(null)}>
                     <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFormSelect(openFormSelect === 'tratamiento' ? null : 'tratamiento'); }} className="w-full bg-transparent border-b border-white/20 text-gray-500 hover:text-white text-[10px] md:text-xs tracking-[0.2em] py-2 sm:py-3 cursor-pointer text-center transition-colors uppercase">
                       {perfilForm.tratamiento || 'SELECCIONAR TRATAMIENTO*'}
                     </div>
                     {openFormSelect === 'tratamiento' && (
                       <div className="absolute top-full left-0 w-full pt-1 z-[300]">
                         <div className="bg-black/90 backdrop-blur-2xl border border-white/10 w-full flex flex-col gap-3 sm:gap-4 py-3 sm:py-4 shadow-2xl rounded-sm">
                           {['Sr.', 'Sra.', 'Srta.', 'Prefiero no decirlo'].map(t => (
                             <div key={t} onClick={(e) => { e.stopPropagation(); setPerfilForm({...perfilForm, tratamiento: t}); setOpenFormSelect(null); }} className="text-[10px] md:text-xs tracking-[0.2em] text-gray-300 hover:text-white cursor-pointer text-center transition-colors uppercase w-full px-4">{t}</div>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-center items-center justify-items-center w-full">
                    <input type="text" value={perfilForm.nombre} onChange={e => setPerfilForm({...perfilForm, nombre: e.target.value})} placeholder="DOS NOMBRES*" className="w-full bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors" required />
                    <input type="text" value={perfilForm.apellidos} onChange={e => setPerfilForm({...perfilForm, apellidos: e.target.value})} placeholder="DOS APELLIDOS*" className="w-full bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors" required />
                  </div>
                  <div className="flex flex-col gap-4 sm:gap-6 items-center w-full">
                    <label className="text-[8px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gray-500">Fecha de Nacimiento*</label>
                    <div className="flex justify-center gap-4 sm:gap-8 w-full max-w-[280px] sm:max-w-none mx-auto">
                      <input type="text" maxLength={2} value={perfilForm.dia} onChange={e => setPerfilForm({...perfilForm, dia: e.target.value.replace(/\D/g,'')})} placeholder="DD" className="w-12 sm:w-16 bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors" required />
                      <input type="text" maxLength={2} value={perfilForm.mes} onChange={e => setPerfilForm({...perfilForm, mes: e.target.value.replace(/\D/g,'')})} placeholder="MM" className="w-12 sm:w-16 bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors" required />
                      <input type="text" maxLength={4} value={perfilForm.anio} onChange={e => setPerfilForm({...perfilForm, anio: e.target.value.replace(/\D/g,'')})} placeholder="AAAA" className="w-16 sm:w-24 bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors" required />
                    </div>
                  </div>
                  <div className="flex justify-center items-end gap-4 sm:gap-6 mt-2 sm:mt-4 w-full max-w-[280px] sm:max-w-none mx-auto">
                    <div className="relative w-16 sm:w-24 z-[150]" onMouseLeave={() => setOpenFormSelect(null)}>
                       <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFormSelect(openFormSelect === 'prefijo' ? null : 'prefijo'); }} className="w-full bg-transparent border-b border-white/20 text-gray-400 text-[10px] md:text-xs tracking-[0.1em] py-2 sm:py-3 cursor-pointer text-center transition-colors">
                         {perfilForm.prefijo}
                       </div>
                       {openFormSelect === 'prefijo' && (
                         <div className="absolute top-full left-0 w-full pt-1 z-[300]">
                           <div className="bg-black/90 backdrop-blur-2xl border border-white/10 w-full flex flex-col gap-3 sm:gap-4 py-3 sm:py-4 shadow-2xl rounded-sm">
                             {['+593', '+34', '+1', '+52', '+57'].map(p => (
                               <div key={p} onClick={(e) => { e.stopPropagation(); setPerfilForm({...perfilForm, prefijo: p}); setOpenFormSelect(null); }} className="text-[10px] md:text-xs tracking-[0.1em] text-gray-300 hover:text-white cursor-pointer text-center transition-colors w-full px-2">{p}</div>
                             ))}
                           </div>
                         </div>
                       )}
                    </div>
                    <input type="tel" value={perfilForm.telefono} onChange={e => setPerfilForm({...perfilForm, telefono: e.target.value.replace(/\D/g,'')})} placeholder="MÓVIL" className="flex-grow sm:w-48 bg-transparent border-b border-white/20 text-white text-[10px] md:text-xs tracking-[0.2em] py-2 sm:py-3 outline-none placeholder-gray-500 text-center hover:border-white/50 transition-colors" />
                  </div>
                  <label className="flex items-start gap-3 sm:gap-4 cursor-pointer mt-6 sm:mt-8 group justify-center px-2 sm:px-4 w-full">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 border transition-colors flex items-center justify-center mt-0.5 ${perfilForm.newsletter ? 'bg-white border-white' : 'border-gray-500 group-hover:border-white'}`}>
                      {perfilForm.newsletter && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-black"></div>}
                    </div>
                    <input type="checkbox" checked={perfilForm.newsletter} onChange={e => setPerfilForm({...perfilForm, newsletter: e.target.checked})} className="hidden" />
                    <span className="text-gray-400 text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] leading-relaxed max-w-md text-left sm:text-center">
                      Me gustaría recibir novedades acerca de ANTARES, actividades, productos exclusivos, servicios a medida y tener una experiencia personalizada basada en mis intereses.
                    </span>
                  </label>
                  <p className="text-gray-500 text-[6px] sm:text-[7px] tracking-[0.1em] leading-loose mt-2 sm:mt-4 pt-4 sm:pt-6 text-center max-w-md mx-auto px-4">
                    Al seleccionar "Actualizar Perfil", acepta nuestras <span className="text-white underline cursor-pointer">Condiciones de uso</span> y confirma que ha leído y comprendido nuestra <span className="text-white underline cursor-pointer">política de privacidad</span>.
                  </p>
                  <button type="submit" className="mt-4 sm:mt-8 bg-transparent text-gray-500 hover:text-white transition-colors cursor-pointer outline-none border border-gray-500 hover:border-white text-[8px] sm:text-[10px] md:text-[12px] tracking-[0.2em] sm:tracking-[0.3em] uppercase py-4 sm:py-5 w-full mb-10 sm:mb-0">
                    Actualizar Perfil
                  </button>
              </form>
           </div>
        </div>
      )}
      </div>

      {userRole === 'admin' && (
      <div className="hidden print-only w-full min-h-screen font-serif pb-20" style={{ backgroundColor: '#000000', color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <header className="w-full flex flex-col items-center mt-0 relative pt-10 pb-6 mb-16 border-b border-white/10" style={{ backgroundColor: '#000000' }}>
          <img src={LOGO_URL} alt="ANTARES" className="h-24 w-auto object-contain z-10" />
        </header>

        {(categoriasDescarga.length > 0 ? categoriasDescarga : Object.values(estructuraCatalogo).flat()).map(cat => {
          const piezasDeCategoria = productos.filter(p => p.categoria === cat);
          const parentMenu = Object.entries(estructuraCatalogo).find(([_, subs]) => subs.includes(cat))?.[0];

          return (
            <div key={cat} className="mb-24 page-break-after px-10" style={{ backgroundColor: '#000000' }}>
              <h3 className="text-xl tracking-[0.3em] uppercase mb-2 text-center" style={{ color: '#888888' }}>{parentMenu}</h3>
              <h2 className="text-4xl tracking-[0.2em] uppercase mb-16 text-center" style={{ color: '#ffffff' }}>{cat}</h2>
              
              {piezasDeCategoria.length > 0 ? (
                <div className="grid grid-cols-2 gap-12">
                  {piezasDeCategoria.map(p => (
                    <div key={p.id} className="flex flex-col items-center text-center relative border p-4 rounded-sm" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#000000' }}>
                      <div className="relative w-full mb-6 flex items-center justify-center h-80" style={{ backgroundColor: '#0a0a0a' }}>
                        <img src={p.imagen_url} className="w-full h-full object-contain" alt={p.titulo} />
                        {p.vendido && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                            <span className="tracking-[0.4em] text-[12px] font-bold uppercase border px-4 py-2" style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.5)' }}>Agotado</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm tracking-[0.2em] uppercase mb-2 break-words" style={{ color: '#ffffff' }}>{p.titulo}</h3>
                      <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '16px' }}>${p.precio} USD</p>
                      
                      {p.subcategoria === 'Anillos' ? (
                        <div className="flex gap-3 justify-center mb-6 flex-wrap mt-2">
                           {tallasDisponibles.map(t => {
                             const stock = parseInt(parseTallasseguro(p.tallas)[t] || 0);
                             const isAvailable = stock > 0;
                             return (
                               <div key={t} className="flex flex-col items-center gap-1">
                                 <div style={{
                                   border: `1px solid ${isAvailable ? 'rgba(255,255,255,0.3)' : 'rgba(255,0,0,0.2)'}`,
                                   color: isAvailable ? '#ffffff' : '#ff0000',
                                   width: '40px', height: '40px',
                                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                                   fontSize: '19px', fontWeight: 'bold'
                                 }}>
                                   {t}
                                 </div>
                                 <span style={{ fontSize: '18px', color: isAvailable ? '#aaaaaa' : '#ff0000', opacity: isAvailable ? 1 : 0.7 }}>
                                   {stock}
                                 </span>
                               </div>
                             );
                           })}
                        </div>
                      ) : (
                        <div style={{ height: '16px', marginBottom: '16px' }}></div> 
                      )}
                      <p className="text-[12px] leading-relaxed px-4 line-clamp-2 uppercase" style={{ color: '#888888' }}>{p.descripcion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center tracking-[0.2em] text-[12px] uppercase" style={{ color: '#666666' }}>Colección en desarrollo</p>
              )}
            </div>
          )
        })}
      </div>
      )}

    </div>
  );
}