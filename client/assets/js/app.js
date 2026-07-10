const menu = document.querySelector(".sidebar");
const botao = document.getElementById("menu-btn");

botao.addEventListener("click", () => {

    menu.classList.toggle("active");

});

function atualizarRelogio(){

    const agora = new Date();

    document.getElementById("relogio").innerHTML=

    agora.toLocaleDateString("pt-BR")+" - "+agora.toLocaleTimeString("pt-BR");

}

setInterval(atualizarRelogio,1000);

atualizarRelogio();