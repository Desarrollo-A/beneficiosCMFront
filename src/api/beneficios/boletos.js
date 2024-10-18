import axios, { endpoints} from 'src/utils/axios';

export const newEvent = async (
    titulo,
    descripcion,
    fechaPartido,
    estadio,
    inicioPublicacion,
    finPublicacion,
    sedes,
    boletos,
    imagenPreview,
    imagen,
    idUsuario
  ) => {
    const url = endpoints.boletos.newEvent;
    const accessToken = localStorage.getItem('accessToken');
  
    const form = new FormData();
    
    form.append('titulo', titulo);
    form.append('descripcion', descripcion);
    form.append('fechaPartido', fechaPartido);
    form.append('inicioPublicacion', inicioPublicacion);
    form.append('finPublicacion', finPublicacion);
    form.append('estadio', estadio);
    form.append('boletos', boletos);
    form.append('sedes', JSON.stringify(sedes));
    form.append('imagenPreview', imagenPreview);
    form.append('imagen', imagen);
    form.append('idUsuario', idUsuario);
  
    const res = await axios.post(url, form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Token: accessToken,
      },
    });
  
    return res.data;
  };

export const updateEvent = async (
    id,
    titulo,
    descripcion,
    fechaPartido,
    estadio,
    inicioPublicacion,
    finPublicacion,
    sedes,
    boletos,
    imagenPreview,
    imagen,
    idUsuario
  ) => {
    const url = endpoints.boletos.updateEvento;
    const accessToken = localStorage.getItem('accessToken');
  
    const form = new FormData();
  
    form.append('id', id);
    form.append('titulo', titulo);
    form.append('descripcion', descripcion);
    form.append('fechaPartido', fechaPartido);
    form.append('inicioPublicacion', inicioPublicacion);
    form.append('finPublicacion', finPublicacion);
    form.append('estadio', estadio);
    form.append('boletos', boletos);
    form.append('sedes', JSON.stringify(sedes));
    form.append('imagenPreview', imagenPreview);
    form.append('imagen', imagen);
    form.append('idUsuario', idUsuario);
  
    const res = await axios.post(url, form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Token: accessToken,
      },
    });
  
    return res.data;
};