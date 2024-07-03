import axios, { endpoints } from 'src/utils/axios';

export const createFaqs = async(data) => {
    const url = endpoints.ayuda.createFaqs;
    const accessToken = localStorage.getItem('accessToken');
  
    const form = new FormData()
    form.append('titulo', data.titulo)
    form.append('descripcion', data.descripcion)
    form.append('rol', data.rol)
    form.append('modificadoPor', data.modificadoPor)
  
    const res = await axios.post(
      url,
      form,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Token: accessToken,
        },
      }
    );
  
    return res.data;
  }

  export const createManuales = async(data) => {
    const url = endpoints.ayuda.createManuales;
    const accessToken = localStorage.getItem('accessToken');
  
    const form = new FormData()
    form.append('titulo', data.titulo)
    form.append('descripcion', data.descripcion)
    form.append('icono', data.icono)
    form.append('video', data.video)
    form.append('rol', data.rol)
    form.append('modificadoPor', data.modificadoPor)
  
    const res = await axios.post(
      url,
      form,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Token: accessToken,
        },
      }
    );
  
    return res.data;
  }

  export const updateManuales = async(data) => {
    const url = endpoints.ayuda.updateManuales;
    const accessToken = localStorage.getItem('accessToken');
  
    const form = new FormData()
    form.append('id', data.id)
    form.append('titulo', data.titulo)
    form.append('descripcion', data.descripcion)
    form.append('icono', data.icono)
    form.append('video', data.video)
    form.append('rol', data.rol)
    form.append('modificadoPor', data.modificadoPor)
  
    const res = await axios.post(
      url,
      form,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Token: accessToken,
        },
      }
    );
  
    return res.data;
  }

  export const updateFaqs = async(data) => {
    const url = endpoints.ayuda.updateFaqs;
    const accessToken = localStorage.getItem('accessToken');
  
    const form = new FormData()
    form.append('id', data.id)
    form.append('titulo', data.titulo)
    form.append('descripcion', data.descripcion)
    form.append('rol', data.rol)
    form.append('modificadoPor', data.modificadoPor)
  
    const res = await axios.post(
      url,
      form,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Token: accessToken,
        },
      }
    );
  
    return res.data;
  }