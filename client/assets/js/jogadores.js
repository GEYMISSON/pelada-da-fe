async function carregarJogadores() {

    const resposta = await fetch("/api/jogadores");

    const jogadores = await resposta.json();

    const lista = document.getElementById("listaJogadores");

    if (!lista) return;

    lista.innerHTML = "";

    jogadores.forEach(jogador => {

        lista.innerHTML += `
            <div class="col-lg-4 col-md-6 mb-4">

                <div class="card shadow h-100">

                    <div class="card-body text-center">

                        <img
                            src="${jogador.foto || 'assets/img/logo.png'}"
                            class="rounded-circle mb-3"
                            width="90"
                            height="90">

                        <h5>${jogador.nome}</h5>

                        <p class="text-warning fs-5">
                            ${"⭐".repeat(jogador.nivel)}
                        </p>

                        <p>👕 ${jogador.numeroCamisa || "-"}</p>

                        <p>📍 ${jogador.posicao || "-"}</p>

                        <span class="badge bg-success">
                            ${jogador.status}
                        </span>

                    </div>

                </div>

            </div>
        `;

    });

}

carregarJogadores();