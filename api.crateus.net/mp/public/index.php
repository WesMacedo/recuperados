<?php
    require_once __DIR__ . '/../app/config.php';
 

?>

<!DOCTYPE html>
<html lang="pt-br" class="h-100">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAGAR</title> 
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"> 
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
 
 
<button type="button" data-toggle="modal" data-target="#modalPayer" class="rounded-4 btn btn-lg px-4 gap-3 bg-yellow font-helvetica">PIX</button>
  
  
    <div class="modal fade" id="modalPayer" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content rounded-4 shadow">
           
         
                <div id="modal-body-payer" class="modal-body p-5 pt-0">
                    <form id="form-payer-information" method="POST">
                        Ao gerar o QR-Code você tera 5 minutos para realizar o pagamento. <hr> 
                        <button type="submit" class="w-100 border-none mb-2 btn btn-lg btn-warning text-white fw-bold rounded-3">Continuar</button>  
                    </form>
                </div>
                

                
                <div id="modal-body-payment" class="modal-body text-center d-none" style="margin-top: -30px;">
                    <img id="load" src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif?20151024034921" style="max-width: 100%;" />
                    <div class="row d-none" id="dix-pix">
                        <div class="col-md-12">
                            <img src="" id="img-pix" width="400" style="max-width: 100%;">
                        </div>
                        <div class="col-md-12">
                            <textarea name="code-pix" class="form-control" id="code-pix" rows="5" cols="80"></textarea>
                            <button class="w-90 mt-3 rounded-4 btn btn-warning text-white btn-clipboard btn-lg px-4 gap-3" id="copyButton">Copiar</button>
                        </div>
                    </div>
                </div>
             

            </div>
        </div>
    </div>
  
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
 
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
 
    <script src="assets/js/pages/page-index.js"></script>

</body>
</html>