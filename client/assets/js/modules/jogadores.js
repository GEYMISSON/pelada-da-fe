const Jogadores = {

    async iniciar() {

        await this.listar();

    },

    async listar() {

        try {

            const jogadores = await JogadorService.listar();

            this.renderizar(jogadores);

        }

        catch (erro) {

            console.error(erro);

            toast("Erro ao carregar jogadores.", "#dc3545");

        }

    },

    renderizar(jogadores) {

        const lista = document.getElementById("listaJogadores");

        if (!lista) return;

        lista.innerHTML = "";

        if (jogadores.length === 0) {

            lista.innerHTML = `
                <div class="col-12">

                    <div class="alert alert-secondary">

                        Nenhum jogador cadastrado.

                    </div>

                </div>
            `;

            return;

        }

        jogadores.forEach(jogador => {

            lista.innerHTML += `
                <div class="col-lg-4 col-md-6 mb-4">

                    <div class="card shadow-sm">

                        <div class="card-body">

                            <h5>${jogador.nome}</h5>

                            <p>

                                ⭐ ${jogador.nivel}

                            </p>

                            <p>

                                ⚽ ${jogador.gols}

                            </p>

                        </div>

                    </div>

                </div>
            `;

        });

    }

};

document.addEventListener("DOMContentLoaded", () => {

    Jogadores.iniciar();

});