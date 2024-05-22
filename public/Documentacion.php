<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

require 'vendor/autoload.php';

use Google\Cloud\Storage\StorageClient;

class Documentacion extends CI_Controller {

    private $bucket;

    public function __construct() {
        parent::__construct();
        $this->load->model(array('Documentacion_model', 'General_model', 'Registrolote_modelo'));
        $this->load->library(array('session', 'form_validation', 'get_menu', 'email','permisos_sidebar'));
        $this->load->helper(array('url', 'form'));
        $this->load->database('default');
        date_default_timezone_set('America/Mexico_City');
        $this->validateSession();

        $val =  $this->session->userdata('certificado'). $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"];
        $_SESSION['rutaController'] = str_replace('' . base_url() . '', '', $val);
        $rutaUrl = explode($_SESSION['rutaActual'], $_SERVER["REQUEST_URI"]);
        $this->permisos_sidebar->validarPermiso($this->session->userdata('datos'),$rutaUrl[1],$this->session->userdata('opcionesMenu'));

        $storage = new StorageClient([
            'keyFilePath' => APPPATH . 'config/google.json'
        ]);

        $this->bucket = $storage->bucket('maderascrm_bucket');
    }

    public function migracion(){
        $documents = $this->Documentacion_model->getTotalFilesIsNotBucket();

        $chunk = $this->input->get('lote');
        
        $rows = 100000;
        $start = ($chunk * $rows) - $rows + 1;
        $end = $rows * $chunk; 
        
        $total = $documents->total;

        $updated = 0;
        for ($i=$start; $i <= $total; $i++) {
            $file = $this->Documentacion_model->getDocument($i);

            if($file && $file->idLote){
                $lote = (object) $this->Registrolote_modelo->getNameLote($file->idLote);

                if($lote){
                    $folder = $this->Documentacion_model->getCarpetaArchivo($file->tipo_documento, $lote->proceso, $lote->nombreLote, $file->expediente);

                    if($file->expediente){
                        $filename = $folder . $file->expediente;

                        if (file_exists($filename)) {
                            print_r($filename . ' Existe' . "\n");

                            $object = $this->bucket->upload(
                                fopen($filename, 'r'),
                                [
                                    'name' => $file->expediente,
                                    //'predefinedAcl' => 'publicRead'
                                ]
                            );

                            if($object){
                                print_r($filename . ' Subido' . "\n");

                                $result = $this->Documentacion_model->updateDocumentToBucket($file->idDocumento);

                                if($result){
                                    print_r('Documento actualizado:' . $file->idDocumento . "\n");

                                    $updated += 1;
                                }
                            }
                        }
                    }
                }
            }

            if($i == $end){
                break;
            }
        }

        print_r('Actualizados: ' . $updated . "\n");
        print_r('Chunk: ' . $chunk . "\n");
        print_r('Lineas: ' . $rows . "\n");
        print_r('Inicio: ' . $start . "\n");
        print_r('Fin: ' . $i . "\n");
    }

    public function index()
    {
    }

    public function documentacion() {
        $datos["residencial"] = $this->Registrolote_modelo->getResidencialQro();
        $this->load->view('template/header');
        $this->load->view("documentacion/documentacion_view", $datos);
    }

    public function validateSession()
    {
        if ($this->session->userdata('id_usuario') == "" || $this->session->userdata('id_rol') == "") {
            redirect(base_url() . "index.php/login");
        }
    }

    function mainDocumentTreeView()
    {
        if ($this->session->userdata('id_rol') == FALSE) {
            redirect(base_url());
        }
        $this->load->view('template/header');
        $this->load->view("documentacion/mainDocumentTreeView");
    }

    function mainDocumentTreeViewTest()
    {
        if ($this->session->userdata('id_rol') == FALSE) {
            redirect(base_url());
        }
        $this->load->view('template/header');
        $this->load->view("documentacion/mainDocumentTreeView_Test");
    }

    function getDocumentsInformation()
    {
        $idLote = $this->input->post("idLote");
        $data["owner"] = $this->Documentacion_model->getClientInformation($this->input->post("idLote"))->result_array();
        $depositoSeriedad = $this->Documentacion_model->getdp($idLote)->result_array();
        if (count($depositoSeriedad) <= 0) {
            $depositoSeriedad = $this->Documentacion_model->getdp_DS($idLote)->result_array();
        }
        $lead = $this->Documentacion_model->getLead($idLote)->result_array();
        $mktdEvidence = $this->Documentacion_model->getMktdEvidence($idLote)->result_array();
        $authorizations = $this->Documentacion_model->getAuthorizations($idLote)->result_array();
        $documentTree = $this->Documentacion_model->getDocumentTree($idLote)->result_array();

        if ($depositoSeriedad[0]["estatus_validacion"] == 2)
            $depositoSeriedad[0]["rejectReasons"] = $this->Documentacion_model->getRejectReasons($depositoSeriedad[0]["idDocumento"], $depositoSeriedad[0]["idLote"], 30)->result_array();


        if ($lead[0]["estatus_validacion"] == 2)
            $lead[0]["rejectReasons"] = $this->Documentacion_model->getRejectReasons($lead[0]["idDocumento"], $lead[0]["idLote"], 33)->result_array();

        if ($mktdEvidence[0]["estatus_validacion"] == 2)
            $mktdEvidence[0]["rejectReasons"] = $this->Documentacion_model->getRejectReasons($mktdEvidence[0]["idDocumento"], $mktdEvidence[0]["idLote"], 34)->result_array();

        if ($authorizations[0]["estatus_validacion"] == 2)
            $authorizations[0]["rejectReasons"] = $this->Documentacion_model->getRejectReasons($authorizations[0]["idDocumento"], $authorizations[0]["idLote"], 32)->result_array();

        for ($i = 0; $i < count($documentTree); $i++) {
            if ($documentTree[$i]["estatus_validacion"] == 2)
                $documentTree[$i]["rejectReasons"] = $this->Documentacion_model->getRejectReasons($documentTree[$i]["idDocumento"], $documentTree[$i]["idLote"], 0)->result_array();
        }

        $documentationRecords = array_merge(
            $depositoSeriedad,
            $lead,
            $mktdEvidence,
            $authorizations,
            $documentTree
        );
        $data["documentation"] = $documentationRecords;
        echo json_encode($data);
    }

    public function uploadFile()
    {
        $file = $_FILES["uploadedDocument"];
        $idLote = $this->input->post('idLote');
        $idDocumento = $this->input->post('idDocumento');
        $documentType = $this->input->post('documentType');
        $documentName = $this->Documentacion_model->generateFilename($idLote, $idDocumento)->row();
        $documentName = $documentName->fileName . '.' . substr(strrchr($_FILES["uploadedDocument"]["name"], '.'), 1);
        $folder = $this->getFolderFile($documentType);
        if ($documentType == 7) { // SE VA A SUBIR / REEMPLAZAR LA CORRIDA
            $fileExt = strtolower(substr($documentName, strrpos($documentName, '.') + 1));
            if ($fileExt == 'xlsx') {
                $this->updateDocumentBranch($file, $folder, $documentName, $idDocumento);
            } else {
                echo json_encode(3); // SE INTENTÓ SUBIR UN ARCHIVO DIFERENTE A UN .XLSX (CORRIDA)
            }
        } else { // SE VA A SUBIR EL EXPEDIENTE O EL CONTRATO
            $this->updateDocumentBranch($file, $folder, $documentName, $idDocumento);
        }
    }

    function getFolderFile($documentType)
    {
        if ($documentType == 7) $folder = "static/documentos/cliente/corrida/";
        else if ($documentType == 8) $folder = "static/documentos/cliente/contrato/";
        else $folder = "static/documentos/cliente/expediente/";
        return $folder;
    }


    function actualizarRamaDeDocumento($file, string $folder, string $documentName, $idDocumento): array {
        //$movement = move_uploaded_file($file["tmp_name"], $folder . $documentName);
        $input = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ä', 'ë', 'ï', 'ö', 'ü', 'Ä', 'Ë', 'Ï', 'Ö', 'Ü', 'â', 'ã', 'ä', 'å', 'ā', 'ă', 'ą', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Ā', 'Ă', 'Ą', 'è', 'é', 'é', 'ê', 'ë', 'ē', 'ĕ', 'ė', 'ę', 'ě', 'Ē', 'Ĕ', 'Ė', 'Ę', 'Ě', 'ì', 'í', 'î', 'ï', 'ì', 'ĩ', 'ī', 'ĭ', 'Ì', 'Í', 'Î', 'Ï', 'Ì', 'Ĩ', 'Ī', 'Ĭ', 'ó', 'ô', 'õ', 'ö', 'ō', 'ŏ', 'ő', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ō', 'Ŏ', 'Ő', 'ù', 'ú', 'û', 'ü', 'ũ', 'ū', 'ŭ', 'ů', 'Ù', 'Ú', 'Û', 'Ü', 'Ũ', 'Ū', 'Ŭ', 'Ů', '(', ')'];
        $output = '';
        $documentName = str_replace($input, $output, $documentName);
        
        $file = $this->bucket->upload(
            fopen($file["tmp_name"], 'r'),
            [
                'name' => $documentName,
                //'predefinedAcl' => 'publicRead'
            ]
        );

        //$movement = false;

        if ($file) {
            $updateDocumentData = array(
                "expediente" => $documentName,
                "modificado" => date('Y-m-d H:i:s'),
                "idUser" => $this->session->userdata('id_usuario'),
                "bucket" => 1
            );

            $result = $this->General_model->updateRecord("historial_documento", $updateDocumentData, "idDocumento", $idDocumento);

            return ($result)
                ? ['code' => 200]
                : ['code' => 500];
        }

        return ['code' => 400, 'message' => 'No fue posible almacenar el archivo en el servidor.'];
    }

    public function eliminarArchivo() {
        $idDocumento = $this->input->post('idDocumento');
        $tipoDocumento = $this->input->post('tipoDocumento');
        $updateDocumentData = array(
            "expediente" => NULL,
            "modificado" => date('Y-m-d H:i:s'),
            "idUser" => $this->session->userdata('id_usuario'),
            "bucket" => 0
        );

        $nombreExp = $this->Registrolote_modelo->getNomExp($idDocumento);
        $infoLote = $this->Registrolote_modelo->getNameLote($nombreExp->idLote);

        if ($infoLote->observacionContratoUrgente && intval($infoLote->observacionContratoUrgente) === 1) {
            echo json_encode(['code' => 400, 'message' => 'El registro se encuentra en proceso de liberación.']);
            return;
        }

        $documento = $this->Documentacion_model->getFilename($idDocumento)->row();

        $filename = $documento->expediente;

        if($documento->bucket){
            $object = $this->bucket->object($filename);

            if($object->exists()){
                $object->delete();
            }
        }else{
            $folder = $this->Documentacion_model->getCarpetaArchivo($tipoDocumento, $infoLote->proceso, $infoLote->nombreLote, $filename, true);

            $file = $folder . $filename;

            if (file_exists($file)) {
                unlink($file);
            }
        }

        $result = $this->General_model->updateRecord("historial_documento", $updateDocumentData, "idDocumento", $idDocumento);
        $response = ($result) ? ['code' => 200] : ['code' => 500];

        if (intval($tipoDocumento) !== 7) { // El tipo de documento es CORRIDA
            echo json_encode($response);
            return;
        }

        $validaMail = $this->Registrolote_modelo->sendMailAdmin($nombreExp->idLote);

        if (is_null($validaMail->idHistorialLote)) {
            echo json_encode($response);
            return;
        }

        $contenido[0] = [
            'nombreResidencial' => $infoLote->nombreResidencial,
            'nombre' => $infoLote->nombre,
            'nombreLote' => $infoLote->nombreLote,
            'observacion' => 'SE MODIFICÓ CORRIDA FINANCIERA',
            'fechaHora' => date('Y-m-d H:i:s')
        ];

        $this->email
            ->initialize()
            ->from('Ciudad Maderas')
            ->to(['coord.administrativoslp@ciudadmaderas.com',
                'coord.administrativo@ciudadmaderas.com',
                'coord.administrativo1@ciudadmaderas.com',
                'coord.administrativo2@ciudadmaderas.com',
                'coord.administrativo3@ciudadmaderas.com',
                'karen.pina@ciudadmaderas.com',
                'coord.administrativo4@ciudadmaderas.com',
                'coord.administrativo5@ciudadmaderas.com',
                'coord.administrativo7@ciudadmaderas.com',
                'coord.administrativo8@ciudadmaderas.com',
                'asistente.admon@ciudadmaderas.com'])
            ->subject('MODIFICACIÓN DE CORRIDA FINANCIERA')
            ->view($this->load->view('template/mail/componentes/tabla', [
                'encabezados' => [
                    'nombreResidencial' => 'PROYECTO',
                    'nombre' => 'CONDOMINIO',
                    'nombreLote' => 'LOTE',
                    'observacion' => 'OBSERVACIÓN',
                    'fechaHora' => 'FECHA/HORA'
                ],
                'contenido' => $contenido
            ], true));

            $this->email->send();

        echo json_encode($response);
    }

    function updateDocumentBranch($file, $folder, $documentName, $idDocumento)
    {
        $movement = move_uploaded_file($file["tmp_name"], $folder . $documentName);
        $validateMovement = $movement == FALSE ? 0 : 1;
        if ($validateMovement == 1) {
            $updateDocumentData = array(
                "expediente" => $documentName,
                "modificado" => date('Y-m-d H:i:s'),
                "idUser" => $this->session->userdata('id_usuario')
            );
            $response = $this->Documentacion_model->updateDocumentBranch($updateDocumentData, $idDocumento);
            echo json_encode($response);
        } else if ($validateMovement == 0) {
            echo json_encode(2); // EL ARCHIVO NO SE PUDO MOVER
        } else {
            echo json_encode(2); // EL ARCHIVO NO SE PUDO MOVER
        }
    }

    public function deleteFile()
    {
        $idDocumento = $this->input->post('idDocumento');
        $documentType = $this->input->post('documentType');
        $updateDocumentData = array(
            "expediente" => NULL,
            "modificado" => date('Y-m-d H:i:s'),
            "idUser" => $this->input->post('typeTransaction') == 2 ? $this->input->post('clientName') : $this->session->userdata('id_usuario')
        );
        $filename = $this->Documentacion_model->getFilename($idDocumento)->row()->expediente;
        $folder = $this->getFolderFile($documentType);
        $file = $folder . $filename;
        if (file_exists($file)) {
            unlink($file);
        }
        $response = $this->Documentacion_model->updateDocumentBranch($updateDocumentData, $idDocumento);
        echo json_encode($response);
        // FALTA ENVIAR EL CORREO CUANDO ES LA CORRIDA QUE SE ELIMINA
    }

    function getRejectionReasons()
    {
        $tipo_proceso = $this->input->post('tipo_proceso');
        $data = $this->Documentacion_model->getRejectionReasons($tipo_proceso);
        if ($data != null)
            echo json_encode($data);
        else
            echo json_encode(array());
    }

    public function validateFile()
    {
        $idDocumento = $this->input->post('idDocumento');
        $idLote = $this->input->post('idLote');
        $documentType = $this->input->post('documentType');
        $action = $this->input->post('action');
        if ($action == 4) {
            $rejectionReasons = explode(",", $this->input->post('rejectionReasons'));
            for ($i = 0; $i < count($rejectionReasons); $i++) {
                $insertData[$i] = array(
                    "id_motivo" => $rejectionReasons[$i],
                    "id_documento" => $idDocumento,
                    "tipo" => $documentType,
                    "creado_por" => $this->session->userdata('id_usuario')
                );
            }
        }
        $rejectionReasonsList = $this->Documentacion_model->getRejectReasons($idDocumento, $idLote, $documentType)->result_array();
        if (count($rejectionReasonsList) >= 1) { // SÍ ENCONTRÓ REGISTROS
            for ($r = 0; $r < count($rejectionReasonsList); $r++) {
                $updateArrayData[] = array(
                    'id_mrxdoc' => $rejectionReasonsList[$r]["id_mrxdoc"],
                    'estatus' => 0
                );
            }
            //echo json_encode($updateArrayData);
            //exit;
            $this->db->update_batch("motivos_rechazo_x_documento", $updateArrayData, "id_mrxdoc");
        }
        $updateData = array("estatus_validacion" => $action == 4 ? 2 : 1, "validado_por" => $this->session->userdata('id_usuario'));
        if ($documentType == 30) { //  DEPÓSITO DE SERIEDAD
            $table = "deposito_seriedad";
            $key = "id";
        } else if ($documentType == 31) { // DEPÓSITO DE SERIEDAD OLD VERSION
            $table = "deposito_seriedad_consulta";
            $key = "id";
        } else if ($documentType == 32) { // AUTORIZACIONES
            $table = "autorizaciones";
            $key = "id_autorizacion";
        } else if ($documentType == 33) { // PROSPECTOS
            $table = "prospectos";
            $key = "id_prospecto";
        } else if ($documentType == 34) { // EVIDENCIA
            $table = "evidencia_cliente";
            $key = "id_evidencia";
        } else { // HISTORIA DOCUMENTO
            $table = "historial_documento";
            $key = "idDocumento";
        }
        $updateResponse = $this->General_model->updateRecord($table, $updateData, $key, $idDocumento); // MJ: LLEVA 4 PARÁMETROS $table, $data, $key, $value
        if ($action == 4) {
            $insertResponse = $this->Documentacion_model->saveRejectionReasons($insertData);
            echo json_encode(($updateResponse == 1 && $insertResponse == 1) == TRUE ? 1 : 0);
        } else {
            echo json_encode($updateResponse == 1 ? 1 : 0);
        }
    }

    function reasonsForRejectionByDocument()
    {
        $this->load->view('template/header');
        $this->load->view("documentacion/reasonsForRejectionByDocument");
    }

    function getReasonsForRejectionByDocument()
    {
        if ($this->input->post("id_documento") == '' || $this->input->post("tipo_proceso") == '')
            echo json_encode(array());
        else {
            $data['data'] = $this->Documentacion_model->getReasonsForRejectionByDocument($this->input->post("id_documento"), $this->input->post('tipo_proceso'))->result_array();
            if ($data != null)
                echo json_encode($data);
            else
                echo json_encode(array());
        }
    }

    function saveRejectReason()
    {
        if($this->input->post("action") == '' || $this->input->post("reject_reason") == '')
            echo json_encode(array("status" => 400, "message" => "Algún parámetro no tiene un valor especificado o no viene informado."));
        else {
            if ($this->input->post("action") == 0) {
                if ($this->input->post("id_documento") == '')
                    echo json_encode(array("status" => 400, "message" => "Algún parámetro no tiene un valor especificado o no viene informado."));
                else {
                    $insertData = array(
                        "tipo_documento" => $this->input->post("id_documento"),
                        "motivo" => $this->input->post("reject_reason"),
                        "estatus" => 1,
                        "tipo_proceso" =>$this->input->post("id_documento") == 0 ? 3 :  2,
                        "creado_por" => $this->session->userdata('id_usuario'),
                        "fecha_creacion" => date('Y-m-d H:i:s'),
                        "modificado_por" => $this->session->userdata('id_usuario'),
                        "fecha_modificacion" => date('Y-m-d H:i:s')
                    );
                    $response = $this->General_model->addRecord("motivos_rechazo", $insertData);
                    if ($response)
                        echo json_encode(array("status" => 200, "message" => "El registro se ha ingresado de manera exitosa."));
                    else
                        echo json_encode(array("status" => 500, "message" => "Oops, algo salió mal. Inténtalo más tarde."));
                }
            } else {
                if ($this->input->post("id_motivo") == '')
                    echo json_encode(array("status" => 400, "message" => "Algún parámetro no tiene un valor especificado o no viene informado."));
                else {
                    $updateData = array(
                        "motivo" => $this->input->post("reject_reason"),
                        "modificado_por" => $this->session->userdata('id_usuario'),
                        "fecha_modificacion" => date('Y-m-d H:i:s')
                    );
                    $response = $this->General_model->updateRecord("motivos_rechazo", $updateData, "id_motivo", $this->input->post("id_motivo"));
                    if ($response)
                        echo json_encode(array("status" => 200, "message" => "El registro se ha actualizado de manera exitosa."));
                    else
                        echo json_encode(array("status" => 500, "message" => "Oops, algo salió mal. Inténtalo más tarde."));
                }
            }
        }
    }

    function changeStatus()
    {
        if ($this->input->post("action") == '' || $this->input->post("id_motivo") == '')
            echo json_encode(array("status" => 400, "message" => "Algún parámetro no tiene un valor especificado o no viene informado."));
        else {
            $updateData = array(
                "estatus" => $this->input->post("action") == 2 ? 0 : 1,
                "modificado_por" => $this->session->userdata('id_usuario'),
                "fecha_modificacion" => date('Y-m-d H:i:s')
            );
            $response = $this->General_model->updateRecord("motivos_rechazo", $updateData, "id_motivo", $this->input->post("id_motivo"));
            if ($response)
                echo json_encode(array("status" => 200, "message" => "El registro se ha actualizado de manera exitosa."));
            else
                echo json_encode(array("status" => 500, "message" => "Oops, algo salió mal. Inténtalo más tarde."));
        }
    }

    function getDocumentsInformation_Escrituracion(){
        $idLote = $this->input->post("idLote");
        $data = $this->Documentacion_model->getDocumentsInformation_Escrituracion($idLote)->result_array();
        if ($data != null)
            echo json_encode($data);
        else
            echo json_encode(array());
    }

    function getLotesList_escrituracion()
    {
        $idCondominio = $this->input->post("idCondominio");
        $data = $this->Documentacion_model->getLotesList_escrituracion($idCondominio)->result_array();
        if ($data != null)
            echo json_encode($data);
        else
            echo json_encode(array());
    }
    public function getCatalogOptions(){
        
            echo json_encode($this->Documentacion_model->getCatalogOptions()->result_array());
    }

    public function subirArchivo() {
        $lote = $this->Registrolote_modelo->getNameLote($this->input->post('idLote'));

        if ($lote->observacionContratoUrgente && intval($lote->observacionContratoUrgente) === 1) {
            echo json_encode(['code' => 400, 'message' => 'El registro se encuentra en proceso de liberación.']);
            return;
        }

        $file = $_FILES["uploadedDocument"];
        $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
        $idDocumento = $this->input->post('idDocumento');
        $tipoDocumento = $this->input->post('tipoDocumento');
        $documentName = "{$this->input->post('tituloDocumento')}.$fileExt";

        $folder = $this->Documentacion_model->getCarpetaArchivo($tipoDocumento, $lote->proceso, $lote->nombreLote);

        if ($tipoDocumento != 7) { // SE VA A SUBIR EL EXPEDIENTE O EL CONTRATO

            //validar si existe el la carpeta
            $folderBaseValidacion = $folder;
            if (!file_exists($folderBaseValidacion)) {
                mkdir($folderBaseValidacion, 0777, true);
            }
            //termina la validación


            $res = $this->actualizarRamaDeDocumento($file, $folder, $documentName, $idDocumento);
            echo json_encode($res);
            return;
        }

        // SE VA A SUBIR / REEMPLAZAR LA CORRIDA
        if ($fileExt != 'xlsx') {
            // SE INTENTÓ SUBIR UN ARCHIVO DIFERENTE A UN .XLSX (CORRIDA)
            echo json_encode(['code' => 400, 'message' => 'El archivo que se intenta subir no cuenta con la extención .xlsx']);
            return;
        }


        $res = $this->actualizarRamaDeDocumento($file, $folder, $documentName, $idDocumento);
        echo json_encode($res);
    }

    

    public function documentacionPorClienteLote() {
		$datos["residencial"]= $this->Registrolote_modelo->getResidencialQro();
        $this->load->view('template/header');
        $this->load->view("documentacion/documentacionClienteLote_view", $datos);
    }

    public function getLotesAll($condominio, $residencial) {
        $datos = array();
        $data = $this->Registrolote_modelo->getLotesGral($condominio, $residencial);
        echo json_encode($data);
    }
    
    public function getClientesPorLote($idLote) {
        $datos = array();
        $datos = $this->Documentacion_model->getClientesPorLote($idLote);
        echo json_encode($datos);
    }

    public function archivo($name)
    {
        $object = $this->bucket->object(urldecode($name));

        if($object->exists()){
            $contentType = $object->info()['contentType'];

            $file = $object->downloadAsString();

            header("Content-type: $contentType");

            print($file);
        }else{
            header("HTTP/1.1 404 Not Found");

            http_response_code(404);
        }
    }

    public function rename(){
        $archivo = $this->input->get('archivo');

        $input = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ä', 'ë', 'ï', 'ö', 'ü', 'Ä', 'Ë', 'Ï', 'Ö', 'Ü', 'â', 'ã', 'ä', 'å', 'ā', 'ă', 'ą', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Ā', 'Ă', 'Ą', 'è', 'é', 'é', 'ê', 'ë', 'ē', 'ĕ', 'ė', 'ę', 'ě', 'Ē', 'Ĕ', 'Ė', 'Ę', 'Ě', 'ì', 'í', 'î', 'ï', 'ì', 'ĩ', 'ī', 'ĭ', 'Ì', 'Í', 'Î', 'Ï', 'Ì', 'Ĩ', 'Ī', 'Ĭ', 'ó', 'ô', 'õ', 'ö', 'ō', 'ŏ', 'ő', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ō', 'Ŏ', 'Ő', 'ù', 'ú', 'û', 'ü', 'ũ', 'ū', 'ŭ', 'ů', 'Ù', 'Ú', 'Û', 'Ü', 'Ũ', 'Ū', 'Ŭ', 'Ů', '(', ')', ' '];
        $output = '';
        $new_name = str_replace($input, $output, $archivo);

        $object = $this->bucket->object(urldecode($archivo));

        if($object->exists()){
            print_r($archivo . " exist\n");

            $new_object = $object->rename($new_name);

            if($new_object->exists()){
                print_r($new_object->info());
            }
        }else{
            print_r($archivo . " no exist\n");
        }
    }
}
