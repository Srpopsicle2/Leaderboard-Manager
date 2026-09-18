let quantidadeParticipantes = 0;
let participantes = [];
let rodadas = [];

let torneioAleatorio = false;

let nomeTorneio = "TORNEIO";

let participantesBloqueados = [];

let placarFinalizado = false;

window.addEventListener("DOMContentLoaded", () => {
    const salvo = localStorage.getItem("torneioPlacar");

    if (salvo) {
        criarPerguntaRecuperacao();
    }
});

function salvarArquivoTXT() {

    if (
        !participantes.length ||
        !rodadas.length
    ) {
        alert(
            "Não existe nenhum torneio para salvar."
        );

        return;
    }

    const dados = {
        quantidadeParticipantes,
        participantes,
        rodadas,
        torneioAleatorio,
        terceiroLugar,
        nomeTorneio,
        participantesBloqueados
    };

    const texto =
        JSON.stringify(
            dados,
            null,
            4
        );

    const arquivo =
        new Blob(
            [texto],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(arquivo);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `${nomeTorneio}.txt`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


function abrirArquivoTXT() {

    document
        .getElementById("arquivoTXT")
        .click();
}


function abrirArquivoTXT() {
    document
        .getElementById("arquivoTXT")
        .click();
}

function carregarArquivoTXT(event) {

    const arquivo =
        event.target.files[0];

    if (!arquivo) {
        return;
    }

    const leitor =
        new FileReader();

    leitor.onload = function() {

        try {

            const dados =
                JSON.parse(
                    leitor.result
                );

            if (
                !dados ||
                !Array.isArray(
                    dados.participantes
                ) ||
                !Array.isArray(
                    dados.rodadas
                )
            ) {
                throw new Error(
                    "Arquivo inválido."
                );
            }

            quantidadeParticipantes =
                dados.quantidadeParticipantes ||
                dados.participantes.length;

            participantes =
                dados.participantes;

            rodadas =
                dados.rodadas;

            torneioAleatorio =
                dados.torneioAleatorio ||
                false;

            terceiroLugar =
                dados.terceiroLugar || {
                    jogador1: null,
                    jogador2: null,
                    vencedor: null
                };

            nomeTorneio =
                dados.nomeTorneio ||
                "TORNEIO";

            participantesBloqueados =
                Array.isArray(
                    dados.participantesBloqueados
                )
                    ? dados.participantesBloqueados
                    : participantes.map(
                        () => false
                    );

            while (
                participantesBloqueados.length <
                participantes.length
            ) {
                participantesBloqueados.push(
                    false
                );
            }

            salvarTorneio();

            document
                .getElementById(
                    "configuracao"
                )
                .classList.add(
                    "escondido"
                );

            document
                .getElementById(
                    "participantes"
                )
                .classList.add(
                    "escondido"
                );

            document
                .getElementById(
                    "torneio"
                )
                .classList.remove(
                    "escondido"
                );

            document
                .getElementById(
                    "tituloTorneio"
                )
                .textContent =
                    nomeTorneio;

            desenharTorneio();

            alert(
                "Torneio carregado com sucesso!"
            );

        } catch (erro) {

            console.error(erro);

            alert(
                "Não foi possível carregar este arquivo.\n\n" +
                "Verifique se ele é um arquivo de torneio válido."
            );
        }

        event.target.value = "";
    };

    leitor.readAsText(arquivo);
}

function criarPerguntaRecuperacao() {
    const fundo = document.createElement("div");

    fundo.className = "confirmacao";

    fundo.innerHTML = `
        <div class="confirmacaoCaixa">

            <h2>TORNEIO ENCONTRADO</h2>

            <p>
                Foi encontrado um torneio salvo.
            </p>

            <p>
                Deseja recuperar o torneio?
            </p>

            <div class="confirmacaoBotoes">

                <button
                    class="botaoPrincipal botaoSim"
                    onclick="recuperarTorneio()">
                    SIM
                </button>

                <button
                    class="botaoPrincipal botaoNao"
                    onclick="recusarRecuperacao()">
                    NÃO
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(fundo);
}

function atualizarTerceiroLugar() {
    const semifinal = rodadas[rodadas.length - 2];

    if (!semifinal || semifinal.length < 2) {
        return;
    }

    if (
        !semifinal[0].vencedor ||
        !semifinal[1].vencedor
    ) {
        return;
    }

    const perdedor1 =
        semifinal[0].jogador1 === semifinal[0].vencedor
            ? semifinal[0].jogador2
            : semifinal[0].jogador1;

    const perdedor2 =
        semifinal[1].jogador1 === semifinal[1].vencedor
            ? semifinal[1].jogador2
            : semifinal[1].jogador1;

    terceiroLugar.jogador1 = perdedor1;
    terceiroLugar.jogador2 = perdedor2;
    terceiroLugar.vencedor = null;
}

function criarTituloResultado(texto) {
    const titulo = document.createElement("div");

    titulo.className = "resultadoTitulo";
    titulo.textContent = texto;

    return titulo;
}

function adicionarLugar(container, lugar, nome, emoji) {
    if (!nome) {
        return;
    }

    const div = document.createElement("div");

    div.className = "lugarResultado";

    div.innerHTML = `
        <span class="emojiLugar">
            ${emoji}
        </span>

        <span class="numeroLugar">
            ${lugar}º
        </span>

        <span class="nomeLugar">
            ${nome}
        </span>
    `;

    container.appendChild(div);
}

function calcularRestantes() {
    const eliminados = [];

    for (let r = rodadas.length - 2; r >= 0; r--) {
        for (let p = 0; p < rodadas[r].length; p++) {
            const partida = rodadas[r][p];

            if (
                !partida.jogador1 ||
                !partida.jogador2 ||
                !partida.vencedor
            ) {
                continue;
            }

            const perdedor =
                partida.jogador1 === partida.vencedor
                    ? partida.jogador2
                    : partida.jogador1;

            if (!eliminados.includes(perdedor)) {
                eliminados.push(perdedor);
            }
        }
    }

    return eliminados;
}

function criarBotaoTerceiro(nome) {
    const botao =
        document.createElement("button");

    botao.className = "jogador";
    botao.textContent = nome;

    if (
        terceiroLugar.vencedor === nome
    ) {
        botao.classList.add("vencedor");
    }

    if (placarFinalizado) {
        botao.disabled = true;
        botao.classList.add("bloqueado");
        return botao;
    }

    botao.onclick = function () {
        terceiroLugar.vencedor =
            nome;

        salvarTorneio();
        desenharTorneio();
    };

    return botao;
}

function desenharDisputaTerceiro() {
    const resultado =
        document.getElementById("resultadoFinal");

    resultado.innerHTML = "";

    if (
        !terceiroLugar.jogador1 ||
        !terceiroLugar.jogador2
    ) {
        return;
    }

    const titulo =
        criarTituloResultado("🥉 TERCEIRO LUGAR");

    resultado.appendChild(titulo);

    const confronto =
        document.createElement("div");

    confronto.className = "confronto";

    confronto.style.maxWidth = "350px";
    confronto.style.margin = "10px auto";

    confronto.appendChild(
        criarBotaoTerceiro(
            terceiroLugar.jogador1
        )
    );

    const vs =
        document.createElement("span");

    vs.className = "vs";
    vs.textContent = "VS";

    confronto.appendChild(vs);

    confronto.appendChild(
        criarBotaoTerceiro(
            terceiroLugar.jogador2
        )
    );

    resultado.appendChild(confronto);
}

function criarPodio(primeiro, segundo, terceiro) {
    const podio =
        document.createElement("div");

    podio.className = "podio";

    podio.innerHTML = `
        <div class="podioTitulo">
            🏆 PÓDIO
        </div>

        <div class="podioContainer">

            <div class="podioLugar segundoPodio">
                <div class="podioMedalha">🥈</div>
                <div class="podioNumero">2º</div>
                <div class="podioNome">
                    ${segundo || "—"}
                </div>
            </div>

            <div class="podioLugar primeiroPodio">
                <div class="podioMedalha">🥇</div>
                <div class="podioNumero">1º</div>
                <div class="podioNome">
                    ${primeiro || "—"}
                </div>
            </div>

            <div class="podioLugar terceiroPodio">
                <div class="podioMedalha">🥉</div>
                <div class="podioNumero">3º</div>
                <div class="podioNome">
                    ${terceiro || "—"}
                </div>
            </div>

        </div>
    `;

    return podio;
}

function recuperarTorneio() {
    const salvo =
        localStorage.getItem("torneioPlacar");

    if (!salvo) return;

    try {
        const dados = JSON.parse(salvo);

        quantidadeParticipantes =
            dados.quantidadeParticipantes || 0;

        participantes =
            dados.participantes || [];

        rodadas =
            dados.rodadas || [];

        torneioAleatorio =
            dados.torneioAleatorio || false;

        nomeTorneio =
            dados.nomeTorneio || "TORNEIO";

        participantesBloqueados =
            Array.isArray(dados.participantesBloqueados)
                ? dados.participantesBloqueados
                : [];

        terceiroLugar =
            dados.terceiroLugar || {
                jogador1: null,
                jogador2: null,
                vencedor: null
            };

        const confirmacao =
            document.querySelector(".confirmacao");

        if (confirmacao) {
            confirmacao.remove();
        }

        document
            .getElementById("configuracao")
            .classList.add("escondido");

        document
            .getElementById("participantes")
            .classList.add("escondido");

        document
            .getElementById("torneio")
            .classList.remove("escondido");


        document.getElementById("tituloTorneio").textContent = nomeTorneio;
        desenharTorneio();

    } catch (erro) {
        console.error(erro);

        localStorage.removeItem(
            "torneioPlacar"
        );
    }
}

function recusarRecuperacao() {
    localStorage.removeItem(
        "torneioPlacar"
    );

    const confirmacao =
        document.querySelector(".confirmacao");

    if (confirmacao) {
        confirmacao.remove();
    }
}

function criarParticipantes() {
    const quantidade =
        Number(
            document
                .getElementById("quantidade")
                .value
        );

    const erro =
        document.getElementById("erro");

    erro.textContent = "";

    if (
        !quantidade ||
        quantidade < 2
    ) {
        erro.textContent =
            "Digite pelo menos 2 participantes.";

        return;
    }

    if (quantidade > 64) {
        erro.textContent =
            "O máximo é 64 participantes.";

        return;
    }

    quantidadeParticipantes =
        quantidade;

    torneioAleatorio =
        document.getElementById(
            "torneioAleatorio"
        ).checked;

    const lista =
        document.getElementById(
            "listaParticipantes"
        );

    lista.innerHTML = "";

    for (
        let i = 0;
        i < quantidade;
        i++
    ) {
        const input =
            document.createElement("input");

        input.type = "text";

        input.placeholder =
            `Participante ${i + 1}`;

        input.className =
            "participanteInput";

        lista.appendChild(input);
    }

    document
        .getElementById("configuracao")
        .classList.add("escondido");

    document
        .getElementById("participantes")
        .classList.remove("escondido");
}

function preencherPessoas() {
    const inputs =
        document.querySelectorAll(
            ".participanteInput"
        );

    inputs.forEach((input, index) => {
        input.value =
            `Pessoa ${index + 1}`;
    });
}

function criarTorneio() {
    const inputs =
        document.querySelectorAll(
            ".participanteInput"
        );

    participantes = [];

    for (
        let i = 0;
        i < inputs.length;
        i++
    ) {
        const nome =
            inputs[i].value.trim();

        if (!nome) {
            alert(
                `Digite o nome do participante ${i + 1}.`
            );

            inputs[i].focus();

            return;
        }

        participantes.push(nome);
    }

    if (torneioAleatorio) {
        participantes =
            embaralhar(participantes);
    }

    const nomes = participantes.map(nome =>
        nome.toLowerCase()
    );
    
    const nomesRepetidos =
        nomes.filter(
            (nome, index) =>
                nomes.indexOf(nome) !== index
        );
    
    if (nomesRepetidos.length > 0) {
        alert(
            "Não é permitido ter participantes com nomes repetidos."
        );
    
        return;
    }
    
    participantesBloqueados =
        participantes.map(() => false);

    gerarRodadas();

    terceiroLugar = {
        jogador1: null,
        jogador2: null,
        vencedor: null
    };

    salvarTorneio();

    document
        .getElementById("participantes")
        .classList.add("escondido");

    document
        .getElementById("torneio")
        .classList.remove("escondido");

    desenharTorneio();
}

function embaralhar(array) {
    const copia = [...array];

    for (
        let i = copia.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            copia[i],
            copia[j]
        ] = [
            copia[j],
            copia[i]
        ];
    }

    return copia;
}

function proximaPotenciaDeDois(numero) {
    let valor = 1;

    while (valor < numero) {
        valor *= 2;
    }

    return valor;
}

function gerarRodadas() {
    rodadas = [];

    const totalVagas =
        proximaPotenciaDeDois(
            participantes.length
        );

    const quantidadePartidas =
        totalVagas / 2;

    let jogadores =
        [...participantes];

    if (torneioAleatorio) {
        jogadores =
            embaralhar(jogadores);
    }

    const quantidadeByes =
        totalVagas - jogadores.length;

    const partidasBye = [];

    if (quantidadeByes > 0) {
        const indices =
            Array.from(
                {
                    length:
                        quantidadePartidas
                },
                (_, i) => i
            );

        const escolhidos =
            torneioAleatorio
                ? embaralhar(indices)
                : indices;

        for (
            let i = 0;
            i < quantidadeByes;
            i++
        ) {
            partidasBye.push(
                escolhidos[i]
            );
        }
    }

    const primeiraRodada = [];

    let jogadorIndex = 0;

    for (
        let i = 0;
        i < quantidadePartidas;
        i++
    ) {
        const temBye =
            partidasBye.includes(i);

        let jogador1 = null;
        let jogador2 = null;

        if (temBye) {
            jogador1 =
                jogadores[jogadorIndex++];

            jogador2 = null;
        } else {
            jogador1 =
                jogadores[jogadorIndex++];

            jogador2 =
                jogadores[jogadorIndex++];
        }

        primeiraRodada.push({
            jogador1,
            jogador2,
            vencedor:
                temBye
                    ? jogador1
                    : null,
            bye: temBye,
            alteracoes: 0
        });
    }

    rodadas.push(
        primeiraRodada
    );

    let partidasAtuais =
        quantidadePartidas;

    while (partidasAtuais > 1) {
        partidasAtuais /= 2;

        const rodada = [];

        for (
            let i = 0;
            i < partidasAtuais;
            i++
        ) {
            rodada.push({
                jogador1: null,
                jogador2: null,
                vencedor: null,
                bye: false,
                alteracoes: 0
            });
        }

        rodadas.push(rodada);
    }

    placarFinalizado = false;

    passarByesPrimeiraRodada();
}

function passarByesPrimeiraRodada() {
    if (rodadas.length < 2) {
        return;
    }

    const primeira =
        rodadas[0];

    const segunda =
        rodadas[1];

    for (
        let i = 0;
        i < primeira.length;
        i++
    ) {
        const partida =
            primeira[i];

        if (
            !partida.bye ||
            !partida.vencedor
        ) {
            continue;
        }

        const proximaPartida =
            Math.floor(i / 2);

        const proximo =
            segunda[proximaPartida];

        if (i % 2 === 0) {
            proximo.jogador1 =
                partida.vencedor;
        } else {
            proximo.jogador2 =
                partida.vencedor;
        }
    }
}

function desenharTorneio() {
    const chave =
        document.getElementById("chave");

    chave.innerHTML = "";

    placarFinalizado = false;

    if (rodadas.length > 0) {
        const ultima =
            rodadas[rodadas.length - 1];

        const final =
            ultima && ultima[0];

        if (
            final &&
            final.vencedor &&
            terceiroLugar.vencedor
        ) {
            placarFinalizado = true;
        }
    }

    for (let r = 0; r < rodadas.length; r++) {
        const coluna =
            document.createElement("div");

        coluna.className = "rodada";

        const titulo =
            document.createElement("h3");

        titulo.textContent =
            nomeDaRodada(
                r,
                rodadas.length
            );

        coluna.appendChild(titulo);

        for (
            let p = 0;
            p < rodadas[r].length;
            p++
        ) {
            const partida =
                rodadas[r][p];

            const confronto =
                document.createElement("div");

            confronto.className =
                "confronto";

            criarJogador(
                confronto,
                partida.jogador1,
                r,
                p,
                partida.bye
            );

            const vs =
                document.createElement("span");

            vs.className = "vs";

            vs.textContent =
                partida.bye
                    ? "NULA"
                    : "VS";

            confronto.appendChild(vs);

            criarJogador(
                confronto,
                partida.jogador2,
                r,
                p,
                partida.bye
            );

            coluna.appendChild(confronto);
        }

        chave.appendChild(coluna);
    }

    desenharResultados();
}

function selecionarVencedor(
    rodada,
    partida,
    vencedor
) {
    if (placarFinalizado) {
        return;
    }

    const confronto =
        rodadas[rodada][partida];

    if (
        !confronto.jogador1 ||
        !confronto.jogador2
    ) {
        return;
    }

    if (
        confronto.vencedor &&
        confronto.vencedor !== vencedor
    ) {
        if (
            confronto.alteracoes >= 1
        ) {
            return;
        }

        confronto.alteracoes++;
    }

    confronto.vencedor =
        vencedor;

    const ultimaRodada =
        rodadas.length - 1;

    if (
        rodada ===
        ultimaRodada - 1
    ) {
        atualizarTerceiroLugar();
    }

    if (
        rodada === ultimaRodada
    ) {
        salvarTorneio();
        desenharTorneio();
        return;
    }

    const proximaPartida =
        Math.floor(partida / 2);

    const proximoConfronto =
        rodadas[rodada + 1]
        [proximaPartida];

    if (
        partida % 2 === 0
    ) {
        proximoConfronto.jogador1 =
            vencedor;
    } else {
        proximoConfronto.jogador2 =
            vencedor;
    }

    proximoConfronto.vencedor =
        null;

    proximoConfronto.alteracoes =
        0;

    salvarTorneio();

    desenharTorneio();
}

function desenharResultados() {
    const resultado =
        document.getElementById(
            "resultadoFinal"
        );

    resultado.innerHTML = "";

    if (!rodadas.length) {
        return;
    }

    const ultima =
        rodadas[rodadas.length - 1];

    if (
        !ultima ||
        !ultima[0]
    ) {
        return;
    }

    const final =
        ultima[0];

    if (!final.vencedor) {
        if (
            terceiroLugar.jogador1 &&
            terceiroLugar.jogador2
        ) {
            desenharDisputaTerceiro();
        }

        return;
    }

    const primeiro =
        final.vencedor;

    const segundo =
        final.jogador1 === primeiro
            ? final.jogador2
            : final.jogador1;

    if (
        !segundo
    ) {
        return;
    }

    let terceiro =
        terceiroLugar.vencedor;
    
    const podioCompleto =
        primeiro &&
        segundo &&
        terceiro;

    if (
        terceiroLugar.jogador1 &&
        terceiroLugar.jogador2 &&
        !terceiroLugar.vencedor
    ) {
        const tituloTerceiro =
            criarTituloResultado(
                "🥉 TERCEIRO LUGAR"
            );

        resultado.appendChild(
            tituloTerceiro
        );

        const confronto =
            document.createElement(
                "div"
            );

        confronto.className =
            "confronto";

        confronto.style.maxWidth =
            "350px";

        confronto.style.margin =
            "10px auto 25px";

        confronto.appendChild(
            criarBotaoTerceiro(
                terceiroLugar.jogador1
            )
        );

        const vs =
            document.createElement(
                "span"
            );

        vs.className = "vs";
        vs.textContent = "VS";

        confronto.appendChild(vs);

        confronto.appendChild(
            criarBotaoTerceiro(
                terceiroLugar.jogador2
            )
        );

        resultado.appendChild(
            confronto
        );

        return;
    }

    if (podioCompleto) {
        placarFinalizado = true;
        resultado.appendChild(
            criarPodio(
                primeiro,
                segundo,
                terceiro
            )
        );
    } else {
        const tituloFinal =
            criarTituloResultado(
                "🏆 RESULTADO FINAL"
            );

        resultado.appendChild(
            tituloFinal
        );

        adicionarLugar(
            resultado,
            1,
            primeiro,
            "🥇"
        );

        adicionarLugar(
            resultado,
            2,
            segundo,
            "🥈"
        );
    }

    if (terceiroLugar.vencedor) {
        const quarto =
            terceiroLugar.jogador1 ===
            terceiroLugar.vencedor
                ? terceiroLugar.jogador2
                : terceiroLugar.jogador1;

        adicionarLugar(
            resultado,
            4,
            quarto,
            "🏅"
        );
    }

    const lugares =
        calcularRestantes();

    const ocupados = [
        primeiro,
        segundo,
        terceiroLugar.jogador1,
        terceiroLugar.jogador2
    ];

    let numero =
        terceiroLugar.vencedor
            ? 5
            : 3;

    if (lugares.length > 0) {
        const tituloRestante =
            criarTituloResultado(
                "📋 RESTANTE"
            );

        resultado.appendChild(
            tituloRestante
        );
    }

    lugares.forEach(nome => {
        if (
            ocupados.includes(nome)
        ) {
            return;
        }

        if (
            nome === primeiro ||
            nome === segundo
        ) {
            return;
        }

        adicionarLugar(
            resultado,
            numero,
            nome,
            "🏅"
        );

        numero++;
    });
}

function salvarTorneio() {
    const dados = {
        quantidadeParticipantes,
        participantes,
        rodadas,
        torneioAleatorio,
        terceiroLugar,
        nomeTorneio,
        participantesBloqueados
    };

    localStorage.setItem(
        "torneioPlacar",
        JSON.stringify(dados)
    );
}

function criarJogador(
    confrontoElemento,
    nome,
    rodada,
    partida,
    bye
) {
    const botao =
        document.createElement("button");

    botao.className = "jogador";

    const confronto =
        rodadas[rodada][partida];

    if (!nome) {
        botao.textContent = "Aguardando";

        botao.disabled = true;

        botao.classList.add("desativado");

        confrontoElemento.appendChild(botao);

        return;
    }

    const indiceParticipante =
        participantes.indexOf(nome);

    const bloqueado =
        indiceParticipante >= 0 &&
        participantesBloqueados[indiceParticipante];

    const nomeContainer =
        document.createElement("div");

    nomeContainer.className =
        "jogadorNomeContainer";

    const nomeSpan =
        document.createElement("span");

    nomeSpan.className =
        "nomeJogador";

    nomeSpan.textContent = nome;

    nomeContainer.appendChild(nomeSpan);

    const cabecalho =
        document.createElement("div");

    cabecalho.className =
        "jogadorCabecalho";

    cabecalho.appendChild(nomeContainer);

    if (indiceParticipante >= 0) {

        const acoes =
            document.createElement("div");

        acoes.className =
            "acoesJogador";

        const lapis =
            document.createElement("button");

        lapis.type = "button";

        lapis.className =
            "acaoJogador";

        lapis.textContent = "✏️";

        lapis.title =
            "Renomear participante";

        lapis.onclick = function(event) {

            event.stopPropagation();

            renomearParticipante(
                indiceParticipante
            );
        };

        const cadeado =
            document.createElement("button");

        cadeado.type = "button";

        cadeado.className =
            "acaoJogador";

        cadeado.textContent =
            bloqueado ? "🔒" : "🔓";

        cadeado.title =
            bloqueado
                ? "Desbloquear participante"
                : "Bloquear participante";

        cadeado.onclick = function(event) {

            event.stopPropagation();

            alternarBloqueioParticipante(
                indiceParticipante
            );
        };

        acoes.appendChild(lapis);
        acoes.appendChild(cadeado);

        cabecalho.appendChild(acoes);
    }

    botao.appendChild(cabecalho);

    if (confronto.vencedor === nome) {
        botao.classList.add("vencedor");
    }

    if (bloqueado) {
        botao.classList.add("bloqueado");
    }

    if (bye) {

        botao.disabled = true;

        botao.classList.add("desativado");

        confrontoElemento.appendChild(botao);

        return;
    }

    if (placarFinalizado) {

        botao.disabled = true;

        botao.classList.add("bloqueado");

        confrontoElemento.appendChild(botao);

        return;
    }

    if (
        confronto.alteracoes !== undefined &&
        confronto.alteracoes >= 1
    ) {

        botao.disabled = true;

        botao.classList.add("bloqueado");

        confrontoElemento.appendChild(botao);

        return;
    }

    botao.onclick = function() {

        selecionarVencedor(
            rodada,
            partida,
            nome
        );
    };

    confrontoElemento.appendChild(botao);
}

function novoTorneio() {
    const confirmar =
        confirm(
            "Tem certeza que deseja apagar o torneio atual e criar um novo?"
        );

    if (!confirmar) {
        return;
    }

    localStorage.removeItem(
        "torneioPlacar"
    );

    quantidadeParticipantes = 0;
    participantes = [];
    rodadas = [];

    terceiroLugar = {
        jogador1: null,
        jogador2: null,
        vencedor: null
    };

    document
        .getElementById("torneio")
        .classList.add("escondido");

    document
        .getElementById("participantes")
        .classList.add("escondido");

    document
        .getElementById("configuracao")
        .classList.remove("escondido");

    document
        .getElementById("quantidade")
        .value = "";

    document
        .getElementById("erro")
        .textContent = "";

    document
        .getElementById("torneioAleatorio")
        .checked = false;

    document
        .getElementById("listaParticipantes")
        .innerHTML = "";
}

function nomeDaRodada(indice, total) {
    const restantes =
        total - indice;

    if (restantes === 1) {
        return "FINAL";
    }

    if (restantes === 2) {
        return "SEMIFINAIS";
    }

    if (restantes === 3) {
        return "QUARTAS DE FINAL";
    }

    return `RODADA ${indice + 1}`;
}

function renomearParticipante(indice) {

    if (
        participantesBloqueados[indice]
    ) {
        alert(
            "Este participante está bloqueado e não pode ser renomeado."
        );

        return;
    }

    const nomeAtual =
        participantes[indice];

    const novoNome =
        prompt(
            "Digite o novo nome do participante:",
            nomeAtual
        );

    if (novoNome === null) {
        return;
    }

    const nome =
        novoNome.trim();

    if (!nome) {
        alert(
            "O nome não pode ficar vazio."
        );

        return;
    }

    const nomeRepetido =
        participantes.some(
            (participante, i) =>
                i !== indice &&
                participante
                    .trim()
                    .toLowerCase() ===
                nome.toLowerCase()
        );

    if (nomeRepetido) {
        alert(
            "Esse nome já está sendo usado por outro participante."
        );

        return;
    }

    const nomeAntigo =
        participantes[indice];

    participantes[indice] =
        nome;

    for (const rodada of rodadas) {

        for (const partida of rodada) {

            if (
                partida.jogador1 ===
                nomeAntigo
            ) {
                partida.jogador1 = nome;
            }

            if (
                partida.jogador2 ===
                nomeAntigo
            ) {
                partida.jogador2 = nome;
            }

            if (
                partida.vencedor ===
                nomeAntigo
            ) {
                partida.vencedor = nome;
            }
        }
    }

    if (
        terceiroLugar.jogador1 ===
        nomeAntigo
    ) {
        terceiroLugar.jogador1 = nome;
    }

    if (
        terceiroLugar.jogador2 ===
        nomeAntigo
    ) {
        terceiroLugar.jogador2 = nome;
    }

    if (
        terceiroLugar.vencedor ===
        nomeAntigo
    ) {
        terceiroLugar.vencedor = nome;
    }

    salvarTorneio();

    desenharTorneio();
}

function alternarBloqueioParticipante(indice) {

    if (
        participantesBloqueados[indice] ===
        undefined
    ) {
        participantesBloqueados[indice] =
            false;
    }

    participantesBloqueados[indice] =
        !participantesBloqueados[indice];

    salvarTorneio();

    desenharTorneio();
}