const JogadorService = {

    listar() {

        return api("/jogadores");

    },

    buscar(id) {

        return api(`/jogadores/${id}`);

    },

    salvar(jogador) {

        return api("/jogadores", {

            method: "POST",

            body: JSON.stringify(jogador)

        });

    },

    editar(id, jogador) {

        return api(`/jogadores/${id}`, {

            method: "PUT",

            body: JSON.stringify(jogador)

        });

    },

    excluir(id) {

        return api(`/jogadores/${id}`, {

            method: "DELETE"

        });

    }

};