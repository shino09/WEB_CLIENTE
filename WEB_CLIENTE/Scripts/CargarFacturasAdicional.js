﻿
//Eliminar Fila, funcion que elimina un archivo selecionado de la lista, creandose una nueva lista sin el
function eliminarFila(index) {
    cantidadArchivos = $('#cantidadArchivos').val();
    cantidadArchivos = cantidadArchivos - 1;

    $("#fila" + index).remove();
    index = index - 1;
    parametros = { index: index };
    $.ajax({
        url: "/CargarFacturasAdiccional/Delete",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(parametros),
        dataType: "json",
        success: function (result, status, xhr) {
            var html = '';
            var i, j = 1;
            for (i = 0; i < result.length; i++) {
                j = parseInt(1) + parseInt(i);
                html += '<tr id=fila' + j + '>' +

                    '<td>' + j + '</td>' +

                    '<td>' + result[i].name + '</td>' +
                     //'<td>' + result.nameOriginal + '</td>' +

                    '<td><input data-toggle="modal" data-target="#ModalEliminar" type="button" class="btn btn-danger glyphicon   glyphicon-trash" onclick="GetEliminar(' + j + ');" value="Eliminar" /></td>' +

                    '</tr>';
            }
            $('#DataResult').html(html);
            if (i > 0) {
                $('#cantidadArchivos').val(j);
                document.getElementById("idErrorFileXml").innerHTML = "";
            }
            if (i == 0) {

                $('#cantidadArchivos').val(i);
            }

        },
        error: function (xhr, status, error) {
        }
    });
}


//Enviar formulario, funcion que envia  todos los campos del formulario incluyendo  los archivos de la lista al controlador para enviarlos al ws_04002
$(function () {
    $("#btnSubmit").click(function (e) {
        var valorRuC, valorParticipantCode, valorType, valorFileXml;
        var valido = 100;
        valorRuc = $('#ruc').val();
        valorParticipantCode = $('#participantCode').val();
        valorType = $('#type').val();
        valorFileXml = $('#cantidadArchivos').val();
        if (valorFileXml === "" || valorFileXml === "0") {
            document.getElementById("idErrorFileXml").innerHTML = "Debe cargar 1 archivo XLSX/XLS.";

        }

        if (rucValido(valorRuc) != false && valorRuc !== '' && valorParticipantCode !== '' && valorType !== '' && valorFileXml !== '' && valorFileXml !== '0') {
            if (valorType != "") {
                document.getElementById("idErrorType").innerHTML = "";
                event.preventDefault();

            }

            e.preventDefault();
            var formData = new FormData();
            formData.append("type", $("#type").val());
            formData.append("participantCode", $("#participantCode").val());
            formData.append("ruc", $("#ruc").val());
            ShowProgress();
            $.ajax({
                url: "/CargarFacturasAdiccional/enviarXml",
                type: 'POST',
                cache: false,
                contentType: false,
                processData: false,
                data: formData,
                async: true,
                success: function (response) {
                   
                    $('#resultado').html('');
                    if (response.mensajeClienteCode == "0") {
                        document.body.removeChild(modalCarga);
                        loading.style.display = "none";
                        $('#myModal').modal('show');

                        $('#tituloModal').html("Transacción Correcta.");
                        $('#resultado').html(response.mensajeCliente);

                    }
                    else {
                        document.body.removeChild(modalCarga);
                        loading.style.display = "none";
                        $('#myModal').modal('show');

                        $('#tituloModal').html("Error");
                        $('#resultado').html(response.mensajeCliente);
                    }

                    if (response.mensajeCliente === "") {
                        $('#myModal').modal('hide');
                    }

                    e.preventDefault();
                       
                }
            });
           
        }

        else {
            if (valorRuc === '') {
                $('#idErrorRuc').html("El campo Ruc es requerido.");
                event.preventDefault();
            }
            if (rucValido(valorRuc) ==false) {
                $('#idErrorRuc').html("El campo RUC debe ser un RUC válido.");
               
                event.preventDefault();

            }
            if (valorParticipantCode === '') {
                $('#idErrorParticipantCode').html("El campo Código del Participante es requerido.");

                event.preventDefault();

            }
            if (valorType == "") {
                document.getElementById("idErrorType").innerHTML = "El campo Tipo de Consumidor es requerido.";
                event.preventDefault();


            }
            if (valorFileXml == "" || valorFileXml == "0") {
                document.getElementById("idErrorFileXml").innerHTML = "Debe cargar 1 archivo XLSX/XLS.";
                event.preventDefault();
            }

        }
    });

    event.preventDefault();

});

$("#cerrarmodal").click(function (e) {
    document.location.reload();
})
$("#cerrarmodalx").click(function (e) {
    document.location.reload();
})

//GetType, funcion que trae los datos desde el ws_get_tipo_participantes y los muestra en select tipo participantes
$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: "/CargarFacturasAdiccional/getType",
        data: "{}",
        success: function (data) {
            var s = '<option value="">Seleccione un Tipo de Consumidor</option>';
            for (var i = 0; i < data.length; i++) {
                s += '<option value="' + data[i].codigo + '">' + data[i].descripcion + '</option>';
            }
            $("#type").html(s);
            $("#idErrorType").html("");

        }
    });
});

$('#type').change(function () {
    $("#idErrorType").html("");
});
$('#fileInput').change(function () {
    $("#idErrorFileXml").html("");
});
$("#aceptarEliminar").click(function (e) {
    $('#ModalEliminar').modal('hide');
});


$("#aceptarErrores").click(function (e) {
    var path = 'Errores.csv';
    $("#iframe").attr("src", "/CargarFacturasAdiccional/Download?file=" + path);
    $('#ModalErrores').modal('hide');

});


//Confirmar Eliminar, funcion que desplega un modal de confirmacion para eliminar un elemento de la lista
function GetEliminar(index) {
    document.getElementById("aceptarEliminar").onclick = function () { eliminarFila(index) };
}

function GetdescargarArchivoErrores() {
    document.getElementById("aceptarErrores").onclick = function () { descargarArchivoErrores() };
}


//Funcion para validar ruc peruano
//Elimina cualquier caracter espacio o signos habituales y comprueba validez
function validarInput(input) {
    var rucOriginal  = $('#ruc').val();
    var ruc = input.value.replace(/\s/g, ""),
        rucFormateado = document.getElementById("idErrorRuc2"),
        resultadoNoValido = document.getElementById("idErrorRucNoValido"),
        resultadoValido = document.getElementById("idErrorRucValido"),

        existente = document.getElementById("idErrorRucValido"),
        valido;
    if (ruc !== "") {
        $('#ruc').val(ruc);
        $('#idErrorRuc').html("");
    }
    existente.innerHTML = "";
    if ((esnumero(ruc)) && (eslargo11(ruc))) {
        $('#idErrorRuc').html("");
    }
    else {
   
        if (!esnumero(ruc)) {
            $('#idErrorRuc').html("");
            $('#idErrorRuc').html("El campo Ruc no es un número entero.");
            $('#ruc').val('');
    
        }
        else {

            if (!eslargomenor11(ruc)) {
                $('#idErrorRuc').html("");
                $('#idErrorRuc').html("El campo Ruc debe tener una longitud exacta de 11 dígitos.");
            }
            if (eslargomayor15(ruc)) {
                $('#idErrorRuc').html("");
                $('#idErrorRuc').html("El campo Ruc debe tener una longitud exacta de 11 dígitos.");
                $('#ruc').val('');
                $('#idErrorRuc').html("");
            }
        }
  
    }
   

    //Es entero?
    if ((ruc = Number(ruc)) && ruc % 1 === 0
        && rucValido(ruc)) { //  Acá se comprueba
        valido = "RUC Válido";
        resultadoValido.classList.add("ok");
        resultadoValido.innerText = "\n" + valido;
        resultadoNoValido.innerText = "";
        //obtenerDatosSUNAT(ruc);
    } else {
        valido = "RUC no válido";
        resultadoNoValido.classList.remove("ok");
        resultadoNoValido.innerText = "\n" + valido;
        resultadoValido.innerText = "";       
    }
}

// Devuelve un booleano si es un RUC válido
// (deben ser 11 dígitos sin otro caracter en el medio)
function rucValido(ruc) {
    //11 dígitos y empieza en 10,15,16,17 o 20
    if (!(ruc >= 1e10 && ruc < 11e9
        || ruc >= 15e9 && ruc < 18e9
        || ruc >= 2e10 && ruc < 21e9))
        return false;

    for (var suma = -(ruc % 10 < 2), i = 0; i < 11; i++ , ruc = ruc / 10 | 0)
        suma += (ruc % 10) * (i % 7 + (i / 7 | 0) + 1);
    return suma % 11 === 0;

}


function validarInputParticipantCode(input) {
    var participantCodeOriginal = $('#participantCode').val();
    var participantCode = input.value.replace(/\s/g, "");



    if (participantCode !== "") {
        $('#participantCode').val(participantCode);
        $('#idErrorParticipantCode').html("");
    }
    if ((esnumero(participantCode)) && (eslargomenor9(participantCode))) {
        $('#idErrorParticipantCode').html("");
    }
    else {
        if (!esnumero(participantCode)) {
            $('#idErrorParticipantCode').html("");
            $('#idErrorParticipantCode').html("El campo Código del Participante no es un número entero.");
            $('#participantCode').val('');
        }
        else {
            if (!eslargomenor9(participantCode)) {
                $('#idErrorParticipantCode').html("");
                $('#idErrorParticipantCode').html("El campo Código del Participante debe tener una longitud menor o igual a 9 dígitos.");
            }

            if (eslargomayor15(participantCode)) {
                $('#idErrorParticipantCode').html("");
                $('#idErrorParticipantCode').html("El campo Código del Participante debe tener una longitud menor o igual a 9 dígitos.");
                $('#participantCode').val('');
                $('#idErrorParticipantCode').html("");
            }
        }

    }

}

    /*
    //Buscar datos del RUC y si existe
    function obtenerDatosSUNAT(ruc) {
        var url = "https://cors-anywhere.herokuapp.com/wmtechnology.org/Consultar-RUC/?modo=1&btnBuscar=Buscar&nruc=" + ruc,
            existente = document.getElementById("idErrorRuc2"),
            xhr = false;
        if (window.XMLHttpRequest)
            xhr = new XMLHttpRequest();
        else if (window.ActiveXObject)
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        else return false;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var doc = document.implementation.createHTMLDocument()
                    .documentElement,
                    res = "",
                    txt, campos,
                    ok = false;

                doc.innerHTML = xhr.responseText;
                campos = doc.querySelectorAll(".list-group-item");
                if (campos.length) {
                    for (txt of campos)
                        res += txt.innerText + "\n";
                    res = res.replace(/^\s+\n*|(:) *\n| +$/gm, "$1");
                    ok = /^Estado: *ACTIVO *$/m.test(res);
                } else
                    res = "RUC: " + ruc + "\nRuc valido pero no existente en la Sunat.";

                if (ok)
                    existente.classList.add("ok");
                else
                    existente.classList.remove("ok");
                existente.innerText = res;
            }
        }
        xhr.open("POST", url, true);
        xhr.send(null);
    }*/


//validaciones de enteors y largo
function esnumero(campo) { return (!(isNaN(campo))); }
function eslargo11(ruc) { return (ruc.length == 11); }
function eslargomenor9(ruc) { return (ruc.length <= 9); }
function eslargomenor11(ruc) { return (ruc.length <= 11); }
function eslargomayor20(ruc) { return (ruc.length >= 20); }
function eslargomayor15(ruc) { return (ruc.length > 15); }

$(document).ready(function () {
    $("#fileButton").click(function () {
        var files = $("#fileInput").get(0).files;
        if (files.length == 0) {
            $('#idErrorFileXml').html("Debe cargar 1 archivo XLSX/XLS");
        }

        else {
            var fileInput = document.getElementById('fileInput');
            var filePath = fileInput.value;
            var allowedExtensions = /(\.xlsx|\.xls|\.XLSX|\.XLS)$/i;
            if (!allowedExtensions.exec(filePath)) {
                $('#idErrorFileXml').html("Debe cargar un Archivo de extensión .XLSX/.XLS.");
                fileInput.value = '';
                return false;
            }
            var fileData = new FormData();

            for (var i = 0; i < files.length; i++) {
                fileData.append("fileInput", files[i]);
            }
            //ShowProgress();
            $.ajax({
                type: "POST",
                url: "/CargarFacturasAdiccional/UploadFilesAjax",
                dataType: "json",
                contentType: false,
                processData: false,
                data: fileData,
                success: function (result, status, xhr) {
                    var html = '';
                    var j, i;

                    if (result.errores != '1') {
                        document.body.removeChild(modalCarga);
                        loading.style.display = "none";
                        nombre = result.name;
                        if (result.name != "" && result.ruta != "" && result.name != null && result.ruta != null) {
                            i = parseInt(1);
                            j = parseInt(0);

                            html += '<tr id=fila' + j + '>' +

                                '<td>' + i + '</td>' +

                                '<td>' + result.name + '</td>' +
                                //'<td>' + result.nameOriginal + '</td>' +

                                '<td><input data-toggle="modal" data-target="#ModalEliminar" type="button" class="btn btn-danger glyphicon   glyphicon-trash" onclick="GetEliminar(' + i + ');" value="Eliminar" /></td>' +

                                '</tr>';
                            $('#eliminarnombrearchivo').html(result.name);
                            $('#DataResult').html(html);
                            if (i > 0) {
                                $('#cantidadArchivos').val(i);
                                document.getElementById("idErrorFileXml").innerHTML = "";
                            }
                        }
                    
                    }
                    if (result.errores == "1") {


                        $('#ModalErrores').modal('show');
                        document.body.removeChild(modalCarga);
                        loading.style.display = "none";
                    }

                },
                error: function (xhr, status, error) {
                    alert(status);

                }
            });
        }
    });
      
    $(document).ajaxStart(function () {
        $("#fileButton").prop('disabled', true);
    });

    $(document).ajaxStop(function () {
        $("#fileButton").prop('disabled', false);
        $("#fileInput").val("");
        //document.body.removeChild(modalCarga);
        //loading.style.display = "none";
    });

});


$("#ruc").on({
    keydown: function (e) {
        if (e.which === 32)
            return false;
    },
    change: function () {
        this.value = this.value.replace(/\s/g, "");
    }
});


$("#participantCode").on({
    keydown: function (e) {
        if (e.which === 32)
            return false;
    },
    change: function () {
        this.value = this.value.replace(/\s/g, "");
    }
});



//mostrar pantalla cargando
var modalCarga, loading;
function ShowProgress() {
    modalCarga = document.createElement("DIV");
    modalCarga.className = "modal2";
    document.body.appendChild(modalCarga);
    loading = document.getElementsByClassName("loading")[0];
    loading.style.display = "block";
    var top = Math.max(window.innerHeight / 2 - loading.offsetHeight / 2, 0);
    var left = Math.max(window.innerWidth / 2 - loading.offsetWidth / 2, 0);
    loading.style.top = top + "px";
    loading.style.left = left + "px";
};


window.onload = function () {
    if (document.cookie.indexOf("_instance=true") === -1) {
        document.cookie = "_instance=true";
        // Set the onunload function
        window.onunload = function () {
            document.cookie = "_instance=true;expires=Thu, 01-Jan-1970 00:00:01 GMT";
        };
        // Load the application
    }
    else {
        alert("No puede abrir más de un formulario a la vez.");
        var win = window.open("about:blank", "_self"); win.close();
        // Notify the user
    }
};