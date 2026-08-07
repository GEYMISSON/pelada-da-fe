const Jogadores = {

    async iniciar() {

        await this.listar();

    },


    // ==========================
    // LISTAR JOGADORES
    // ==========================

    async listar() {

        try {

            const jogadores =
                await JogadorService.listar();

            this.renderizar(jogadores);

        } catch (erro) {

            console.error(
                "Erro ao carregar jogadores:",
                erro
            );

            if (typeof toast === "function") {

                toast(
                    "Erro ao carregar jogadores.",
                    "#dc3545"
                );

            }

        }

    },


    // ==========================
    // RENDERIZAR JOGADORES
    // ==========================

    renderizar(jogadores) {

        const lista =
            document.getElementById("listaJogadores");

        if (!lista) {

            return;

        }

        lista.innerHTML = "";


        // ==========================
        // NENHUM JOGADOR
        // ==========================

        if (!jogadores || jogadores.length === 0) {

            lista.innerHTML = `
                <div class="col-12">

                    <div class="alert alert-secondary">

                        Nenhum jogador cadastrado.

                    </div>

                </div>
            `;

            return;

        }


        // ==========================
        // CARDS
        // ==========================

        jogadores.forEach(jogador => {

            lista.innerHTML += `

                <div class="col-lg-4 col-md-6 mb-4">

                    <div class="card shadow-sm h-100">

                        <div class="card-body">

                            <h5 class="card-title">
                                ${jogador.nome || "Sem nome"}
                            </h5>

                            <p class="mb-2">
                                ⭐ Nível:
                                ${jogador.nivel ?? 0}
                            </p>

                            <p class="mb-0">
                                ⚽ Gols:
                                ${jogador.gols ?? 0}
                            </p>

                        </div>

                    </div>

                </div>

            `;

        });

    }

};


// ==========================
// INICIALIZAÇÃO
// ==========================

Jogadores.iniciar();