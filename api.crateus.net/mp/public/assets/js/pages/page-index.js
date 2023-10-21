     formPayerInformation.on('submit', function (e){
        e.preventDefault(); 
        sendFormDataToGeneratePixPayment();
    });


     const sendFormDataToGeneratePixPayment = () => {

        modalBodyPayer.addClass('d-none');
        modalBodyPayment.removeClass('d-none');

        $.post('payment/create.php', function(response){

            if(response.status === "error"){
                modalBodyPayer.removeClass('d-none');
                modalBodyPayment.addClass('d-none');

                alertFormPayer.removeClass('d-none');
                alertFormPayer.text(response.message);
            } else {
                showInformationToPay(response);
            }
        });
    }


    const showInformationToPay = (information) => {

        const codePix         = information.qr_code;
        const QRCodePixBase64 = information.qr_code_base64;
        const IDPedido = information.id_pedido;

        $('#load').addClass('d-none');
        $("#img-pix").attr('src', 'data:image/jpeg;base64,' + QRCodePixBase64);
        $("#code-pix").val(codePix);
        $("#id-pedido").val(IDPedido);
        $("#dix-pix").removeClass('d-none');

        $("#copyButton").click(function() {
            var copyText = $("#code-pix");
            copyText.select();
            document.execCommand("copy");
            $('#copyButton').text("código copiado!");
        });

    }
