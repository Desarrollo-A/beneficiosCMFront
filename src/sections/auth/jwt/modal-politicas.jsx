import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import styles from './style.css';

// ----------------------------------------------------------------------

export default function ModalPoliticas({ open, onClose }) {

  return (
    
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      PaperProps={{
        className: styles.scrollbar,
      }}
    >

<div className="scroll-shadows">
      <DialogContent>

        <DialogTitle sx={{ textAlign: 'center', color: '#B4A46C' }}>TÉRMINOS Y CONDICIONES</DialogTitle>

        <Stack spacing={1} sx={{ textAlign: 'justify' }}>

          <DialogContent style={{ textAlign: 'center', fontWeight: 'bold', color: '#B4A46C' }} variant="h7">OBJETIVO GENERAL </DialogContent>

          <DialogContent>
            El sistema de <b style={{ color: '#B4A46C' }}>BENEFICIOS MADERAS</b> pertenece a Ciudad Maderas, se define como
            aquél medio que ayuda a facilitar la gestión y agenda de los colaboradores con los diversos beneficios que
            ofrece la empresa como; Quantum Balance, Nutrición, Psicología, Guía Espiritual en que esta manera los colaboradores pueden visualizar la disponibilidad de los
            servicios que ofrece Ciudad Maderas y agendar citas con el área de interés.
          </DialogContent>

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            Con este sistema, facilita a los colaboradores el seguimiento de su agenda y poder organizar sus actividades de
            la empresa, además de notificar cada evento registrado.
          </DialogContent>

          <DialogContent>
            <b style={{ color: '#B4A46C' }}>La presente página web, es propiedad de Ciudad Maderas y este operando por el
              sistema BENEFICIOS MADERAS,</b> por lo que CIUDAD MADERAS hace del conocimiento que mediante el uso del
            sistema BENEFICIOS MADERAS y de la plataforma de “Calendario de Google”, gestionará todo lo relacionado a la
            calendarización de agenda (eventos, reuniones presenciales y/o virtuales, etc.) de sus colaboradores, bajo las
            necesidades de uso y manejo que CIUDAD MADERAS considere pertinentes. Los presentes Términos y Condiciones
            establecerán los lineamientos por los que serán regidas dichas actividades dentro de la página web.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            Del Funcionamiento en Conjunto
          </DialogContent>

          <DialogContent>
            Debido a la utilización de la plataforma de “Calendario de Google” para los fines anteriormente mencionados, <b
              style={{ color: '#B4A46C' }}>CIUDAD MADERAS</b> trabajará en conjunto con los parámetros y lineamientos que
            <b style={{ color: '#B4A46C' }}> GOOGLE</b> utiliza por sí y para cada uno de sus servicios de aplicaciones que
            éste ofrece, siendo estos independientes a todos aquellos parámetros y lineamientos que <b style={{
              color: '#B4A46C'
            }}>CIUDAD MADERAS</b> señale para el uso de su calendarización interna. En ese sentido, se
            presume que a la aceptación de los presentes Términos y Condiciones, se da por consentido no sólo a los
            parámetros de uso de <b style={{ color: '#B4A46C' }}>CIUDAD MADERAS</b>, sino también a los que pertenezcan a <b
              style={{ color: '#B4A46C' }}>GOOGLE.</b>
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De la Información a Recabar y de la que GOOGLE puede hacer uso
          </DialogContent>

          <DialogContent>
            Para la gestión de eventos que serán creados en la plataforma “Calendario de Google”, <b style={{
              color: '#B4A46C'
            }}>CIUDAD MADERAS</b> podrá compartir en conjunto con <b style={{
              color: '#B4A46C'
            }}>GOOGLE</b>, información respectiva a sus colaboradores, con el propósito de dar correcto funcionamiento a
            la calendarización en la plataforma. Dicha información puede abarcar de manera enunciativa más no limitativa,
            los siguientes :
          </DialogContent>

          <DialogContent>
            <ul>
              <li>
                Nombre del colaborador.
              </li>
            </ul>
            <ul>
              <li>
                Correo institucional del colaborador.
              </li>
            </ul>
            <ul>
              <li>Contraseña de correo institucional.</li>
            </ul>
            <ul>
              <li>Número de teléfono.</li>
            </ul>
            <ul>
              <li>Fechas de eventos.</li>
            </ul>
            <ul>
              <li>Beneficio seleccionado.</li>
            </ul>
            <ul>
              <li>Cita y lugar del Beneficio.</li>
            </ul>
            <ul>
              <li>Área a la que pertenece el colaborador dentro de Ciudad Maderas.</li>
            </ul>
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De las Políticas para el uso de “Calendario de Google”
          </DialogContent>

          <DialogContent>
            A la aceptación de los presentes Términos y Condiciones, se da por consentido que los colaboradores que hagan
            uso de la plataforma de “Calendario de Google”, se apegarán a las “Políticas del Programa Google Calendar”,
            dónde se señala que Google Calendar podrá rechazar el alojamiento de calendarios públicos o de contenido de
            eventos, así como rescindir el acuerdo con usuarios que se vean implicados en actividades que infrinjan estas
            políticas, dichas actividades pueden consistir en:
          </DialogContent>

          <DialogContent>
            <ul>
              <li>
                Publicar contenido ilegal (información difamatoria o actividades que promuevan comportamientos fuera de la
                legalidad).
              </li>
            </ul>
            <ul>
              <li>
                Utilizar Google Calendar para invadir la intimidad de otros usuarios (mediante acoso y amenazas).
              </li>
            </ul>
            <ul>
              <li>
                Infringir los derechos de autor.
              </li>
            </ul>
            <ul>
              <li>
                Utilizar la plataforma para enviar spam o intercambiar código malintencionado o virus.
              </li>
            </ul>
            <ul>
              <li>
                Fomentar el odio e incitar a la violencia.
              </li>
            </ul>
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De la Sincronización de Datos
          </DialogContent>

          <DialogContent>
            <b style={{
              color: '#B4A46C'
            }}>CIUDAD MADERAS</b> hace del conocimiento que, en atención a que dentro de las funciones que <b style={{
              color: '#B4A46C'
            }}>GOOGLE</b> ofrece, se encuentra la de sincronización de datos, por lo que el nombre de usuario y correo electrónico del colaborador pueden ser usados por <b style={{
              color: '#B4A46C'
            }}>GOOGLE</b> para almacenar información de preferencias de uso basadas en el historial de actividad del colaborador dentro de la plataforma, facilitar el acceso a la cuenta y mostrar los datos del Calendario que hayan sido subidos incluso desde otros dispositivos.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De los Derechos de Propiedad Intelectual y Cesión de Derechos
          </DialogContent>

          <DialogContent>
            A la aceptación de los presentes Términos y Condiciones, se entiende por confirmado que todos los colaboradores
            pertenecientes a <b style={{ color: '#B4A46C' }}>CIUDAD MADERAS</b>, cuentan con los permisos y/o
            autorizaciones necesarias para el uso de información, datos o cualquier otro factor que sea dado de alta en la
            plataforma. En ese sentido y como se ha estipulado anteriormente, si bien <b style={{ color: '#B4A46C' }}>CIUDAD
              MADERAS</b> trabajará en conjunto con
            los parámetros y lineamientos que <b style={{ color: '#B4A46C' }}>GOOGLE</b> utiliza, esto no supone la cesión de
            derechos por parte de algún
            colaborador o de <b style={{ color: '#B4A46C' }}>CIUDAD MADERAS</b> hacía <b style={{
              color: '#B4A46C'
            }}>GOOGLE</b>, pues la información compartida y
            dada de alta en la plataforma de
            “Calendario de Google”, será destinada ÚNICA Y EXCLUSIVAMENTE a los fines anteriormente descritos.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De la Duración del Permiso de Uso de la Plataforma
          </DialogContent>

          <DialogContent >
            Los términos de vigencia en los que <b style={{ color: '#B4A46C' }}>CIUDAD MADERAS</b> podrá hacer uso de la
            plataforma de “Calendario de Google, será
            hasta en tanto ésta cumpla con “Los Términos Adicionales Específicos de los Servicios” de <b style={{
              color: '#B4A46C'
            }}>GOOGLE</b> (los cuales pueden
            ser consultados por medio de la siguiente liga <a style={{ color: '#B4A46C' }} href="https://policies.google.com/terms?hl=es"
              target="_blank" rel="noreferrer">(https://policies.google.com/terms?hl=es)</a> y con las “Políticas para el
            uso de “Calendario de Google”, mencionadas con anterioridad.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            Del Acceso a la Plataforma
          </DialogContent>

          <DialogContent>
            Al ingresar al presente sitio web, se otorga una licencia limitada, no exclusiva, intransferible, susceptible de
            cesión y revocable; para consultar de forma temporal el contenido ofrecido en el presente sitio web, siendo
            únicamente para uso personal del usuario perteneciente al grupo de <b style={{ color: '#B4A46C' }}>CIUDAD
              MADERAS</b> y se podrá usar únicamente para
            fines laborales de la empresa.
          </DialogContent>

          <DialogContent>
            Al ingresar al sistema de <b style={{ color: '#B4A46C' }}>BENEFICIOS MADERAS</b> el usuario se obliga a:
          </DialogContent>

          <DialogContent>
            <li>1. Cumplir con todas las leyes, reglamentos y normas aplicables a nivel local, estatal y nacional, así como
              cualquiera otra legislación aplicable.</li>
            <ul>2. No infringir los derechos de propiedad intelectual y de privacidad, derechos de patente, derechos sobre el
              sistema <b style={{ color: '#B4A46C' }}>BENEFICIOS MADERAS</b> las marcas registradas y toda la información
              dentro del presente sistema.</ul>
            <ul>3. NO descargar, transmitir, enviar o almacenar material que;
              <ul>
                <li>
                  Sea ilegal, ofensivo, difamatorio, engañoso, dañino, obsceno o que induzca a un error.
                </li>
              </ul>
              <ul>
                <li>
                  Infrinja las obligaciones contractuales o de confidencialidad del usuario.
                </li>
              </ul>
              <ul>
                <li>Perjudique o interfiera en otras aplicaciones NO permitidas dentro del sistema.
                </li>
              </ul>
            </ul>
            <ul>4. Vulnerar los derechos personales y de privacidad de terceros.</ul>
            <ul>5. Utilizar cualquier mecanismo u información son el previo consentimiento por escrito.</ul>
            <ul>6. No Copiar, modificar, reproducir, eliminar, distribuir, vender o publicar todo el contenido que se encuentra
              dentro del sistema de CRM.</ul>
            <ul>7. No falsificar los datos que publiquen sobre sí mismo o de terceros.</ul>
          </DialogContent>

          <Box mb={2} />

          <DialogContent sx={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De la Utilización del Sistema:
          </DialogContent>

          <DialogContent>
            Además de las obligaciones ya mencionadas, el usuario deberá:
          </DialogContent>

          <DialogContent>
            <ul>
              1. Utilizar el sistema únicamente para los fines legalmente permitidos.
            </ul>
            <ul>
              2. Facilitar y mantener los datos personales que conformar el registro del usuario de forma completa, correcta,
              actualizada y veraz.
            </ul>
            <ul>
              3. Subir el material que solamente el usuario tenga los correspondientes derechos o licencias para hacer uso de
              esta.
            </ul>
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            Del Nombre de Usuario y Contraseña
          </DialogContent>

          <DialogContent>
            Los usuarios registrados deben ser autorizados y dados de alta por medio del departamento de Capital Humano, cada
            usuario será responsable de su contraseña, así como la confidencialidad de las contraseñas.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De la Exclusividad:
          </DialogContent>

          <DialogContent>
            La información que se encuentra en el siguiente sistema es contenido exclusiva propiedad de <b style={{
              color: '#B4A46C'
            }}>CIUDAD MADERAS</b>, por lo
            cual queda estrictamente prohibido revelar, duplicar, o copiar la información y el contenido del sistema.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ fontWeight: 'bold', color: '#B4A46C' }}>
            De los Vínculos Directos con Terceros
          </DialogContent>

          <DialogContent>
            El sistema puede tener vínculos que indican el acceso a páginas web de terceros, por lo cual cada usuario deberá de
            utilizar de manera responsable y sin causar daños y perjuicios.
          </DialogContent>

          <DialogContent>
            Por todo lo anterior, al ingresar a la presente página web se dan por aceptados todos y cada uno de los lineamientos
            de estos Términos y Condiciones.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ textAlign: 'center', fontWeight: 'bold', color: '#B4A46C' }}>
            DE LA CANCELACIÓN DE UNA CITA:
          </DialogContent>

          <DialogContent>
            El tiempo para hacer una cancelación sin penalización (la cual es por un costo de <b style={{
              color: '#B4A46C'
            }}>$500.00</b> pesos más el costo de
            reservación de la cita <b style={{ color: '#B4A46C' }}>$50.00 pesos)</b> son tres horas previas a la fecha y horario
            a la que se debe de acudir a la
            cita, los administradores del sistema tendrán la posibilidad de justificar una penalización según lo requieran para
            que el colaborador no se vea perjudicado con ese monto, pero si perdiendo los <b style={{
              color: '#B4A46C'
            }}>$50.00</b> pesos que pagaron inicialmente
            por hacer la reservación.
          </DialogContent>

          <DialogContent>
            No hay ningún tipo de penalización siempre y cuando la cancelación se haga previas a las tres horas de su cita
            reservada,
            Cabe mencionar que existe la posibilidad de reagendar la cita solamente dos veces, no se podría tener un tercer Re
            agendamiento, el colaborador tendría que acudir a la cita, de no ser así aplicara el mismo monto de penalización
            comentado en la primera pregunta.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ textAlign: 'center', fontWeight: 'bold', color: '#B4A46C' }}>
            REQUISITOS PARA SER ACREEDOR A UN BENEFICIO
          </DialogContent>

          <DialogContent>
            El personal administrativo del sistema de beneficios contará con un panel para señalar que puestos son los
            acreedores a estos beneficios aunado a ello se considerará un tiempo de antigüedad de tres meses y que no estén
            dados de baja.
          </DialogContent>

          <DialogContent>
            A diferencia de los asesores de comercialización donde a estos puestos en particular no se les solicitara un tiempo
            de antigüedad.
            Así como aquellas personas que se encuentren habitando las fundaciones de Lamat a quienes tampoco se les solicitara
            un tiempo de antigüedad y quienes estarán gozando exclusivamente de los beneficios de quantum balance de manera
            gratuita.
          </DialogContent>

          <Box mb={2} />

          <DialogContent style={{ textAlign: 'center', fontWeight: 'bold', color: '#B4A46C' }}>
            RESTRICCIONES
          </DialogContent>

          <DialogContent>
            El límite de uso de beneficios es de dos beneficios de manera mensual, puede ser solo de una misma área o de
            distintas áreas, pero serán únicamente dos mensuales.
          </DialogContent>

          <DialogContent>
            En caso de requerir beneficios adicionales a los permitidos el especialista podrá otorgarlos según sea el caso, pero
            solo dicho especialista estaría realizando las reservaciones para el quien debe hacer el pago de su cita para poder
            reservar el espacio.
          </DialogContent>

          <DialogContent>
            Para reservar cualquiera cita para cualquier beneficio se tendrá que hacer primeramente el pago de la misma vía
            nuestro sistema de beneficios maderas donde te permitirá realizar el pago a través de tarjeta bancaria.
          </DialogContent>

        </Stack>

        <DialogContent style={{ textAlign: 'center' }}>
          <Button sx={{ width: '200px' }} variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
        </DialogContent>

        <Box mb={3} />

      </DialogContent>
      </div>

    </Dialog>

  );
}

ModalPoliticas.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
