function toast(mensagem, cor = "#198754") {

    Toastify({

        text: mensagem,

        duration: 3000,

        gravity: "top",

        position: "right",

        style: {
            background: cor
        }

    }).showToast();

}

async function confirmar(titulo, texto) {

    const resposta = await Swal.fire({

        title: titulo,

        text: texto,

        icon: "question",

        showCancelButton: true,

        confirmButtonText: "Sim",

        cancelButtonText: "Cancelar",

        confirmButtonColor: "#198754"

    });

    return resposta.isConfirmed;

}

function sucesso(texto){

    Swal.fire({

        icon:"success",

        title:"Sucesso",

        text:texto,

        confirmButtonColor:"#198754"

    });

}