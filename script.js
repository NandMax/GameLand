/* ============================= Script do Brawl Star ============================= */
document.addEventListener('DOMContentLoaded', function() {
let morto = false;
let contador = 0;
let vitorias = 0;

const img = document.getElementById("screen");
const textoTela = document.getElementById("mensagem");
const contadorHtml = document.getElementById("contador");
const vitoriasHtml = document.getElementById("vitorias");
const op1 = document.getElementById("op1");
const op2 = document.getElementById("op2");
const startBtn = document.getElementById("startBtn");

const sons = {
    shelly1: new Audio("audio/Shelly1.mp3"),
    shelly2: new Audio("audio/Shelly2.mp3"),
    shelly3: new Audio("audio/Shelly3.mp3"),
    shelly4: new Audio("audio/Shelly4.mp3"),
    shelly5: new Audio("audio/Shelly5.mp3"),
    shelly6: new Audio("audio/Shelly6.mp3"),

    piper1: new Audio("audio/Piper1.mp3"),

    dyna1: new Audio("audio/Dyna1.mp3"),
    dyna2: new Audio("audio/Dyna2.mp3"),

    leon1: new Audio("audio/Leon1.mp3"),

    mico1: new Audio("audio/Mico1.mp3"),

    corvo1: new Audio("audio/Corvo1.mp3"),
    corvo2: new Audio("audio/Corvo2.mp3"),

    primo1: new Audio("audio/Primo1.mp3"),
    primo2: new Audio("audio/Primo2.mp3"),

    gene1: new Audio("audio/Gene1.mp3"),
    gene2: new Audio("audio/Gene2.mp3"),
    gene3: new Audio("audio/Gene3.mp3"),
    gene4: new Audio("audio/Gene4.mp3"),

    edgar1: new Audio("audio/Edgar1.mp3"),
    edgar2: new Audio("audio/Edgar2.mp3"),

    gale1: new Audio("audio/Gale1.mp3"),

    derrota: new Audio("audio/Derrota.mp3"),
    vitoria: new Audio("audio/Vitoria.mp3"),
};

// mensagem inicial / textos dos botões
textoTela.innerText = "Preparado para brawltalhar?";
op1.innerText = "Sim";
op2.innerText = "Não";

op1.onclick = () => iniciarJogo();
op2.onclick = () => {
    textoTela.innerText = "Beleza, quando estiver pronto volte aqui";
};

//controle do áudio
let audioAtual = null;
let sequenceController = null;

function tocarUmSom(nome) {
    if (sons[nome]) {
        if (audioAtual && audioAtual !== sons[nome]) {
            audioAtual.pause();
            audioAtual.currentTime = 0;
        }
        audioAtual = sons[nome];

        audioAtual.currentTime = 0;
        audioAtual.play().catch(() => {});
        return;
    }

    if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
    }
    audioAtual = new Audio("audio/" + nome + ".mp3");
    audioAtual.currentTime = 0;
    audioAtual.play().catch(() => {});
}


function pararSom() {
    if (sequenceController && typeof sequenceController.cancel === "function") {
        sequenceController.cancel();
    }
    sequenceController = null;

    if (audioAtual) {
        try {
            audioAtual.pause();
            audioAtual.currentTime = 0;
        } catch (e) { /* ignorar */ }
        audioAtual = null;
    }
}

function playSoundsSequence(names) {
    if (!names || !names.length) return { cancel() {} };

    let cancelled = false;
    let currentAudio = null;

    const controller = {
        cancel() {
            cancelled = true;
            if (currentAudio) {
                try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
                currentAudio = null;
            }
        }
    };

    (async () => {
        for (let name of names) {
            if (cancelled) break;

            let a;
            if (sons[name]) {
                a = sons[name];
            } else {
                a = new Audio("audio/" + name + ".mp3");
            }

            currentAudio = a;
            audioAtual = a;

            try {
                a.currentTime = 0;
                const playPromise = a.play();

                if (playPromise && playPromise.then) {
                    await new Promise((resolve) => {
                        const onEnded = () => { cleanup(); resolve(); };
                        const onAbort = () => { cleanup(); resolve(); };
                        function cleanup() {
                            a.removeEventListener("ended", onEnded);
                        }
                        a.addEventListener("ended", onEnded);

                        const interval = setInterval(() => {
                            if (cancelled) {
                                clearInterval(interval);
                                cleanup();
                                resolve();
                            }
                        }, 100);
                    });
                } else {
                    await new Promise((resolve) => a.addEventListener("ended", resolve, { once: true }));
                }
            } catch (err) {}

            if (cancelled) break;
        }

        if (!cancelled) {
            audioAtual = null;
        }
    })();

    sequenceController = controller;
    return controller;
}

function tocarSonsDaCena(names) {
    let list = [];
    if (!names) list = [];
    else if (Array.isArray(names)) list = names;
    else list = [names];

    list = list.filter(Boolean);

    if (sequenceController && typeof sequenceController.cancel === "function") {
        sequenceController.cancel();
    }
    sequenceController = null;
    audioAtual = null;

    if (list.length === 0) return;
    sequenceController = playSoundsSequence(list);
}

const fases = [
    // FASE 1
    {
        pergunta: "Você encontrou um monte de powercubes perto do mato.\nDeseja pegar?", img: "image/brawl/fases/Cubos.jpg",
        sim: { texto: "Uma Shelly saiu do mato e ultou em você! \nVocê já era!", morrer: true, img: "image/brawl/fases/Shelly.jpg", desbloquear: "char-shelly", som: "shelly1" },
        nao: { texto: "Você decide não ir, deve ser uma armadilha.", img: "image/brawl/fases/Shelly2.jpg", som: "shelly2" }
    },

    // FASE 2
    {
        pergunta: "Você ver uma Piper indefesa.\nDeseja pular nela?", img: "image/brawl/fases/Piper.jpg", som: "piper1",
        sim: { texto: "Um Dynamike usou o acessório e paralisou vocês, eliminando os dois!", morrer: true, img: "image/brawl/fases/Piper1.jpg", som1: "edgar1", som2: "dyna1",  desbloquear: "char-piper"},
        nao: { 
            texto: "Um Mico saiu de trás das paredes e pulou na Piper", img: "image/brawl/fases/Piper2.jpg", som: "mico1", desbloquear: "char-mico",
            extra: { texto: "Mas um Dynamike aparece e elimina os dois!", img: "image/brawl/fases/Piper2-2.jpg", som: "dyna1"}
        }
    },

    // FASE 3
    {
        pergunta: "O Dynamike está na sua mira.\nDeseja pular nele?", img: "image/brawl/fases/Dyna.jpg", som: "dyna2",
        sim: { texto: "Você pegou o Dynamike de surpresa, \"Easy hahaha\"!", img: "image/brawl/fases/Dyna1.jpg", som: "edgar2", desbloquear: "char-dyna"},
        nao: { texto: "Um Leon invisível te pegou por trás! \n😏🔥🔥", morrer: true, img: "image/brawl/fases/Dyna2.jpg", som: "leon1", desbloquear: "char-leon" }
    },

    // FASE 4
    {
        pergunta: "Um Eugênio gira para fazer amizade. \nDeseja girar de volta?", img: "image/brawl/fases/Gene.jpg", som: "gene1",
        sim: {
            texto: "Vocês se tornam amigos :)", img: "image/brawl/fases/Gene1.jpg", desbloquear: "char-gene", som: "gene2",
            extra: [
                { texto: "Um Gale surge e te empurra para o gás venenoso junto com um Leon que se aproximava de você invisível.", img: "image/brawl/fases/Gene1-2.jpg", som: "gale1" },
                { texto: "Mas o Eugênio te salva com o super", img: "image/brawl/fases/Gene1-3.jpg", som: "gene3" }
            ]
        },
        nao: {
            texto: "Você mata o Eugênio. \nNunca se deve confiar num Edgar!", img: "image/brawl/fases/Gene1-1.jpg", som: "gene3",
            extra: { texto: "Um Gale te empurra para o gás venenoso junto com um Leon que se aproximava de você invisível.", img: "image/brawl/fases/Gene1-2.jpg", som: "gale1", desbloquear: "char-gale", morrer: true }
        }
    },

    // FASE 5
    {
        pergunta: "Uma Shelly derrota o Eugênio e fica te encarando.\nDeseja ataca-lá?", img: "image/brawl/fases/Final.jpg", som: "shelly4",
        sim: { texto: "Você não é páreo para uma Shelly com hipercarga! \nVocê já era!", morrer: true, img: "image/brawl/fases/Final1.jpg", som: "shelly3" },
        nao: {
            texto: "Você foge pois não se sente preparado.", img: "image/brawl/fases/Final2.jpg", som: "edgar1",
            extra: [
                { texto: "Dois brawlers pulam na Shelly!", img: "image/brawl/fases/Final2-2.jpg", som1: "corvo1", som2: "primo1" },
                { texto: "A Shelly ativa hipercarga e derrota o Corvo.", img: "image/brawl/fases/Final2-3.jpg", som1: "shelly6", som2: "corvo2" },
                { texto: "Ela luta com o El Primo e vence, mas está fraca.", img: "image/brawl/fases/Final2-4.jpg", som1: "shelly5", som2: "primo2" }
            ]
        }
    },

    // DECISÃO FINAL
    {
        pergunta: "Você irá atacá-la?", img: "image/brawl/fases/Final2-4.jpg",
        sim: { texto: "Você derrota a Shelly enquanto ela está fraca! \nQue covardia, mas ganhou né", img: "image/brawl/fases/Ganhou.jpg", som: "vitoria", ganhar: true },
        nao: { texto: "Você manda um joinha. \nShelly se elimina no gás incrédula com o que viu!", img: "image/brawl/fases/Extra.jpg", som: "edgar2",  desbloquear: "char-edgar", ganhar: true }
    }
];

let faseAtual = -1;
let filaCenas = [];

// inicia o jogo
function iniciarJogo() {
    morto = false;
    faseAtual = -1;
    textoTela.innerText = "";
    pararSom();
    op2.style.display = "inline-block";
    proximaFase();
}

function proximaFase() {
    faseAtual++;

    if (faseAtual >= fases.length) {
        return ganharCenas();
    }

    let f = fases[faseAtual];
    img.src = f.img;
    textoTela.innerText = f.pergunta;

    if (f.som) {
        tocarSonsDaCena(f.som);
    }

    op1.innerText = "Sim";
    op2.innerText = "Não";
    op2.style.display = "inline-block";
    op1.onclick = () => escolher(true);
    op2.onclick = () => escolher(false);
}


function escolher(sim) {
    let f = fases[faseAtual];
    let acao = sim ? f.sim : f.nao;
    filaCenas = [];

    if (acao.desbloquear) {
        desbloquearPersonagem(acao.desbloquear);
    }

    if (faseAtual === fases.length - 1 && sim){
        img.src = acao.img;
        textoTela.innerText = acao.texto;
        tocarSonsDaCena(coletarSons(acao));

        op1.innerText = "Reiniciar";
        op1.onclick = () => {
            pararSom();
            faseAtual = -1;
            iniciarJogo();
        };
        op2.style.display = "none";
        return;
    }

    function coletarSons(obj) {
        const arr = [];
        if (!obj) return arr;
        if (obj.som) arr.push(obj.som);
        if (obj.som1) arr.push(obj.som1);
        if (obj.som2) arr.push(obj.som2);
        if (obj.som3) arr.push(obj.som3);
        return arr;
    }

    filaCenas.push({
        img: acao.img,
        texto: acao.texto,
        morrer: acao.morrer,
        ganhar: acao.ganhar,
        sonsDaCena: coletarSons(acao)
    });

    if (acao.extra) {
        if (Array.isArray(acao.extra)) {
            acao.extra.forEach(e => {
                filaCenas.push({
                    img: e.img,
                    texto: e.texto,
                    morrer: e.morrer,
                    sonsDaCena: coletarSons(e)
                });
            });
        } else {
            filaCenas.push({
                img: acao.extra.img,
                texto: acao.extra.texto,
                morrer: acao.extra.morrer,
                sonsDaCena: coletarSons(acao.extra)
            });
        }
    }

    op1.innerText = "Continuar";
    op1.onclick = avancarCena;
    op2.style.display = "none";

    avancarCena();
}


function avancarCena() {
    if (filaCenas.length === 0) return proximaFase();

    let cena = filaCenas.shift();

    img.src = cena.img;
    textoTela.innerText = cena.texto;

    if (cena.sonsDaCena && cena.sonsDaCena.length > 0) {
        tocarSonsDaCena(cena.sonsDaCena);
    } else {}

    if (cena.morrer) {
        filaCenas.unshift({
            img: "image/brawl/fases/Perdeu.jpg",
            texto: "YOU DEAD :(",
            isDefeat: true
        });

        op1.innerText = "Continuar";
        op2.style.display = "none";
        op1.onclick = avancarCena;
        return;
    }

    if (cena.isDefeat) {
        return morreuCenas();
    }
}

function morreuCenas() {
    contador++;
    contadorHtml.innerText = contador;

    img.src = "image/brawl/fases/Perdeu.jpg";
    textoTela.innerText = "YOU DEAD :(";

    tocarSonsDaCena(["derrota"]);

    op1.innerText = "Reiniciar";
    op2.style.display = "none";

    op1.onclick = () => {
        pararSom();
        filaCenas = [];
        faseAtual = -1;
        iniciarJogo();
    };
}

function ganharCenas() {
    vitorias++;
    vitoriasHtml.innerText = vitorias;
    explosaoVitoria(); //Animação de Vitória

    img.src = "image/brawl/fases/Ganhou.jpg";
    textoTela.innerText = "VOCÊ GANHOU! #1";

    tocarSonsDaCena(["vitoria"]);

    op1.innerText = "Reiniciar";
    op2.style.display = "none";

    op1.onclick = () => {
        pararSom();
        filaCenas = [];
        faseAtual = -1;
        iniciarJogo();
    };

}

function desbloquearPersonagem(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove("locked");
        el.classList.add("unlocked");

        el.classList.remove("animate");
        void el.offsetWidth;
        el.classList.add("animate");
    }
}

startBtn.onclick = iniciarJogo;
}); /* Fim do Brawl Star */


/* ============================= Script da Batata Quente ============================= */
document.addEventListener('DOMContentLoaded', function() {

const btnPlay = document.getElementById("btnPlay");
const btnPassar = document.getElementById("btnPassar");
const btnEsperar = document.getElementById("btnEsperar");
const telaBatata = document.getElementById("tela-batata");
const msgBatata = document.getElementById("msg-batata");
const ganhadorDiv = document.getElementById("ganhador");

// Variáveis globais
let fila = [];
let currentIndex = 0;
let tempo = 0;
let tempoMax = 0;
let jogoAtivo = false;
let aguardandoContinuar = false;

const ranking = { p1: 0, p2: 0, p3: 0, p4: 0 };

// Números de rodadas para a batata explodir
function novoTempoMax() {
    return Math.floor(Math.random() * 11) + 5; // 5..15
}

// Renomeia os Jogadores
function atualizarJogadores() {
    fila = [];
    for (let i = 1; i <= 4; i++) {
        let nome = document.getElementById(`j${i}`).value.trim();
        if (!nome) nome = `Jogador ${i}`;
        fila.push(nome);
    }
}

// Atualiza o ranking
function atualizarRanking() {

    const jogadores = [
        { id: 1, pontos: ranking.p1 },
        { id: 2, pontos: ranking.p2 },
        { id: 3, pontos: ranking.p3 },
        { id: 4, pontos: ranking.p4 }
    ];

    jogadores.sort((a, b) => b.pontos - a.pontos);
    const container = document.getElementById("ranking-container");
    document.querySelectorAll(".r-item").forEach(div => div.classList.remove("lider"));

   
    jogadores.forEach((j, index) => {
        const bloco = document.querySelector(`.r-item[data-jogador="${j.id}"]`);
        document.getElementById(`p${j.id}`).textContent = j.pontos;
        container.appendChild(bloco);

        if (index === 0 && j.pontos > 0) {
            bloco.classList.add("lider");
        }
    });
}

// Inicializa o jogo
btnPlay.addEventListener("click", () => {
    atualizarJogadores();
    currentIndex = 0;
    tempo = 0;
    tempoMax = novoTempoMax();
    jogoAtivo = true;
    aguardandoContinuar = false;

    ganhadorDiv.classList.remove("show");

    msgBatata.textContent = `Vez do ${fila[currentIndex]}`;
    telaBatata.src = "image/batata/Quente1.jpg";

    btnPassar.textContent = "Passar";
    btnEsperar.textContent = "Esperar";

    btnPassar.style.display = "inline-block";
    btnEsperar.style.display = "inline-block";

    btnPlay.style.display = "none";
});


// Botão Passar/Sim
btnPassar.addEventListener("click", () => {
    if (!jogoAtivo && !aguardandoContinuar) {
        atualizarJogadores();
        currentIndex = 0;
        tempo = 0;
        tempoMax = novoTempoMax();
        jogoAtivo = true;
        aguardandoContinuar = false;

        msgBatata.textContent = `Vez do ${fila[currentIndex]}`;
        telaBatata.src = "image/batata/Quente1.jpg";

        btnPassar.textContent = "Passar";
        btnEsperar.textContent = "Esperar";
        btnPlay.style.display = "none";
        return;
    }

    if (aguardandoContinuar) {
        
        aguardandoContinuar = false;
        btnPassar.textContent = "Passar";
        btnEsperar.style.display = "inline-block";

        if (fila.length > 1) {
            msgBatata.textContent = `Vez do ${fila[currentIndex]}`;
            telaBatata.src = "image/batata/Quente1.jpg";
        } else {
            finalizarJogo();
        }
        return;
    }

    rodarTurno(true);
});

// Botão Esperar
btnEsperar.addEventListener("click", () => {
    if (jogoAtivo && !aguardandoContinuar) {
        rodarTurno(false);
    } else {
        msgBatata.textContent = "A Batata está esquentando...";
    }
});

// Função do turno
function rodarTurno(passou) {
    if (!jogoAtivo) return;
    tempo++;

    const imgQuenteAntes = `image/batata/Quente${Math.floor(Math.random() * 6) + 1}.jpg`;
    telaBatata.src = imgQuenteAntes;

    if (tempo >= tempoMax) {
        const eliminado = fila.splice(currentIndex, 1)[0];
        msgBatata.textContent = `Eliminado: ${eliminado}`;
        telaBatata.src = `image/batata/Queimou${Math.floor(Math.random() * 2) + 1}.jpg`;

        tempo = 0;
        tempoMax = novoTempoMax();

        if (currentIndex >= fila.length && fila.length > 0) {
            currentIndex = 0;
        }

        btnPassar.textContent = "Continuar";
        btnEsperar.style.display = "none";
        aguardandoContinuar = true;

        return;
    }

    if (passou) {
        currentIndex = (currentIndex + 1) % fila.length;
    }

    msgBatata.textContent = `Vez do ${fila[currentIndex]}`;
    const imgQuenteDepois = `image/batata/Quente${Math.floor(Math.random() * 6) + 1}.jpg`;
    telaBatata.src = imgQuenteDepois;

    if (fila.length === 1) {
        finalizarJogo();
    }
}

function finalizarJogo() {
    if (fila.length === 0) return;

    const vencedor = fila[0];
    explosaoVitoria(); //Animação de Vitória

    msgBatata.textContent = `Ganhador: ${vencedor}`;
    telaBatata.src = "image/batata/Vitoria.png";

    ganhadorDiv.textContent = `🏆 ${vencedor} 🏆`;
    ganhadorDiv.style.display = "block";
    ganhadorDiv.classList.add("show");

    for (let i = 1; i <= 4; i++) {
        let nome = document.getElementById(`j${i}`).value.trim();
        if (!nome) nome = `Jogador ${i}`;
        if (nome === vencedor) ranking[`p${i}`] = (ranking[`p${i}`] || 0) + 1;
    }
    atualizarRanking();

    btnPassar.style.display = "none";
    btnEsperar.style.display = "none";
    jogoAtivo = false;
    aguardandoContinuar = false;

    btnPlay.style.display = "inline-block";
    btnPlay.textContent = "Jogar novamente";
}
}); /* Fim do Bloco da Batata Quente */


/* ============================= Script do Deu Match ============================= */
document.addEventListener('DOMContentLoaded', function() {

document.getElementById('form-casal').addEventListener('submit', function(e) {
    e.preventDefault();

    const nome1 = document.getElementById('nome1').value.trim();
    const nome2 = document.getElementById('nome2').value.trim();
    
    if (!nome1 || !nome2) {
        alert("Por favor, digite os dois nomes.");
        return;
    }
    const compatibilidade = calcularCompatibilidade(nome1, nome2);
    updateUI(compatibilidade);
    updateRanking(nome1, nome2, compatibilidade);
});


function calcularCompatibilidade(nome1, nome2) {
    // 1. Normalização (remove acentos e cedilhas)
    let casal = (nome1 + nome2).toLowerCase();
    casal = casal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 2. Remove caracteres não-alfabéticos (o seu filtro original)
    casal = casal.replace(/[^a-z]/g, ''); 
    
    let letras = Array.from(casal);
    let num = [];

    // Fase 1: Contar a frequência de cada letra
    while (letras.length > 0) {
        let letraAtual = letras[0];
        let cont = 0;
        
        letras = letras.filter(l => {
            if (l === letraAtual) {
                cont++;
                return false;
            }
            return true;
        });
        num.push(cont);
    }
    
    // Fase 2: Soma das extremidades
    while (num.length > 2) {
        let novaLista = [];
        let esquerda = 0;
        let direita = num.length - 1;
        
        while (esquerda <= direita) {
            let soma;
            if (esquerda === direita) {
                soma = num[esquerda];
            } else {
                soma = num[esquerda] + num[direita];
            }
            if (soma > 9) {
                novaLista.push(Math.floor(soma / 10));
                novaLista.push(soma % 10);
            } else {
                novaLista.push(soma);
            }
            
            esquerda++;
            direita--;
        }
        
        if (novaLista.length > 2) {
                num = novaLista;
        } else {
            num = novaLista;
            break; 
        }
    }

    let resultado = '';
    if (num.length === 2) {
        resultado = num[0].toString() + num[1].toString();
    } else if (num.length === 1) {
        resultado = num[0].toString() + '0'; 
    } else {
        resultado = '0';
    }
    
    return Math.min(100, parseInt(resultado));
}

function updateUI(compatibilidade) {
    const resultBox = document.getElementById('result-box');
    const compatibilityBar = document.getElementById('heart-bar');
    const telaLover = document.getElementById('tela-lover');

    resultBox.textContent = `${compatibilidade}%`;
    compatibilityBar.style.height = `${compatibilidade}%`;
    
    let imagePath = '';
    
    if (compatibilidade <= 20) {
        imagePath = 'image/match/Casal1.jpg';
    } else if (compatibilidade <= 50) {
        imagePath = 'image/match/Casal2.jpg';
    } else if (compatibilidade <= 75) {
        imagePath = 'image/match/Casal3.jpg';
    } else if (compatibilidade <= 85) {
        imagePath = 'image/match/Casal4.jpg';
    } else if (compatibilidade <= 95) {
        imagePath = 'image/match/Casal5.jpg';
    } else { // 96% - 100%
        imagePath = 'image/match/Casal6.jpg';
    }
    
    telaLover.src = imagePath; 
}

function updateRanking(nome1, nome2, compatibilidade) {
    const rankingList = document.getElementById('ranking-list');
    const minRankingScore = 75; 
    
    if (compatibilidade > minRankingScore) {
        
        const novoCasalTexto = `${nome1} + ${nome2} (${compatibilidade}%)`;
        const newItem = document.createElement('li');
        newItem.classList.add('ranking-item');
        newItem.textContent = novoCasalTexto;
        newItem.setAttribute('data-score', compatibilidade);

        let inserido = false;
        const itensExistentes = rankingList.children;

        for (let i = 0; i < itensExistentes.length; i++) {
            const scoreExistente = parseInt(itensExistentes[i].getAttribute('data-score')) || 0;
            
            if (compatibilidade > scoreExistente) {
                rankingList.insertBefore(newItem, itensExistentes[i]);
                inserido = true;
                break;
            }
        }
        
        if (!inserido) {
            rankingList.appendChild(newItem);
        }

        const limite = 5;
        if (rankingList.children.length > limite) {
            rankingList.removeChild(rankingList.lastElementChild);
        }

        const itensAtualizados = rankingList.children;
        for (let i = 0; i < itensAtualizados.length; i++) {
            const item = itensAtualizados[i];
            item.classList.remove('female-bg', 'male-bg');
            const isFemaleBg = i % 2 !== 0; 
            item.classList.add(isFemaleBg ? 'female-bg' : 'male-bg');
        }
        
        newItem.style.opacity = 0;
        setTimeout(() => {
             newItem.style.opacity = 1;
             newItem.style.transition = 'opacity 0.5s';
        }, 10);
    }
}

function updateUI(compatibilidade) {
    const resultBox = document.getElementById('result-box');
    const compatibilityBar = document.getElementById('heart-bar');
    const telaLover = document.getElementById('tela-lover');

    resultBox.textContent = `${compatibilidade}%`;
    compatibilityBar.style.height = `${compatibilidade}%`;
    
    let imagePath = '';
    
    if (compatibilidade <= 20) {
        imagePath = 'image/match/Casal1.jpg';
    } else if (compatibilidade <= 50) {
        imagePath = 'image/match/Casal2.jpg';
    } else if (compatibilidade <= 75) {
        imagePath = 'image/match/Casal3.jpg';
    } else if (compatibilidade <= 85) {
        imagePath = 'image/match/Casal4.jpg';
    } else if (compatibilidade <= 95) {
        imagePath = 'image/match/Casal5.jpg';
    } else { // 96% - 100%
        imagePath = 'image/match/Casal6.jpg';
    }
    
    telaLover.src = imagePath; 
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('heart-bar').style.height = '0%';
    document.getElementById('result-box').textContent = '--%';
});
}); /* Fim do Deu Match */


/* ============================= Script do Jogo Da Velha ============================= */
document.addEventListener('DOMContentLoaded', function() {
const iconsP1 = ["✖️", "🔵", "💙", "🟦", "❄️"];
const iconsP2 = ["❌", "🔴", "❤️", "🟥", "🔥"];

function gerarIcones(idContainer, jogador) {
    const div = document.getElementById(idContainer);
    const lista = jogador === 1 ? iconsP1 : iconsP2;

    lista.forEach(icon => {
        const btn = document.createElement("button");
        btn.textContent = icon;
        btn.className = "btn-icon";
        btn.onclick = () => selecionarIcone(jogador, icon, btn);
        div.appendChild(btn);
    });
}

gerarIcones("icones1", 1);
gerarIcones("icones2", 2);

let icon1 = null;
let icon2 = null;

function selecionarIcone(jogador, icon, botao) {
    if (jogador === 1) {
        icon1 = icon;
        document.querySelectorAll('#icones1 button').forEach(b => b.classList.remove('sel'));
        botao.classList.add('sel');
    } else {
        icon2 = icon;
        document.querySelectorAll('#icones2 button').forEach(b => b.classList.remove('sel'));
        botao.classList.add('sel');
    }
}

const nome1Input = document.getElementById("nome1");
const nome2Input = document.getElementById("nome2");

const label1 = document.getElementById("label1");
const label2 = document.getElementById("label2");

const btnNovamente = document.getElementById("novamente");
const btnJogar = document.getElementById("jogar");

let playerName1 = "Jogador 1";
let playerName2 = "Jogador 2";

let vez = 1;
let proximoComeca = 1;
let tabuleiro = Array(9).fill(null);
let jogando = false;

const mensagem = document.getElementById("msg-velha");
const casas = document.querySelectorAll(".casa");

nome1Input.addEventListener("input", () => {
    const nome = nome1Input.value.trim();
    label1.childNodes[0].nodeValue = (nome || "Jogador 1") + " | ";
});

nome2Input.addEventListener("input", () => {
    const nome = nome2Input.value.trim();
    label2.childNodes[0].nodeValue = (nome || "Jogador 2") + " | ";
});


function atualizarMensagem() {
    const nome1 = document.getElementById("nome1").value || "Jogador 1";
    const nome2 = document.getElementById("nome2").value || "Jogador 2";

    mensagem.textContent = `Vez de ${vez === 1 ? nome1 : nome2}`;

    if (vez === 1) {
        mensagem.style.background = "rgb(59, 137, 255)";
    } else {
        mensagem.style.background = "rgb(243, 13, 13)";
    }
}


function verificarVitoria() {
    const win = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (const [a,b,c] of win) {
        if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[b] === tabuleiro[c]) {
            return tabuleiro[a];
        }
    }
    return null;
}

function resetJogo() {
    tabuleiro.fill(null);
    casas.forEach(c => c.textContent = "");
    vez = proximoComeca;
    atualizarMensagem();
    jogando = true;
    document.querySelectorAll("#icones1 button, #icones2 button").forEach(b => {
        b.disabled = true;
        b.classList.add("bloqueado");
    });
    btnNovamente.style.display = "none";
}

casas.forEach(c => c.onclick = () => {
    if (!jogando) return;
    const i = c.dataset.index;
    if (tabuleiro[i]) return;

    const icon = vez === 1 ? icon1 : icon2;
    tabuleiro[i] = icon;
    c.textContent = icon;

    const v = verificarVitoria();
    if (v) {
        jogando = false;
        explosaoVitoria(); //Animação de Vitória
        const vencedorNome = vez === 1 ? playerName1 : playerName2;
        mensagem.textContent = `${vencedorNome} venceu!`;

        document.querySelectorAll("#icones1 button, #icones2 button").forEach(b => {
            b.disabled = false;
            b.classList.remove("bloqueado");
        });

        if (vez === 1) document.getElementById("p1").textContent++;
        else document.getElementById("p2").textContent++;

        proximoComeca = vez;
        btnNovamente.style.display = "block";
        atualizarRanking();
        return;
    }

    if (tabuleiro.every(x => x)) {
        jogando = false;
        document.getElementById("emp").textContent++;
        mensagem.textContent = "Empate!";

        document.querySelectorAll("#icones1 button, #icones2 button").forEach(b => {
            b.disabled = false;
            b.classList.remove("bloqueado");
        });

        proximoComeca = proximoComeca === 1 ? 2 : 1;

        btnNovamente.style.display = "block";
        return;
    }

    vez = vez === 1 ? 2 : 1;
    atualizarMensagem();
});

btnJogar.onclick = () => {
    playerName1 = nome1Input.value.trim() || "Jogador 1";
    playerName2 = nome2Input.value.trim() || "Jogador 2";

    if (!icon1 || !icon2) {
        alert("Escolha os ícones dos dois jogadores!");
        return;
    }

    proximoComeca = 1;
    resetJogo();
};

function atualizarRanking() {
    const p1 = parseInt(document.getElementById("p1").textContent);
    const p2 = parseInt(document.getElementById("p2").textContent);

    const rank = document.getElementById("rank-container");
    const j1 = document.querySelector(".j1");
    const j2 = document.querySelector(".j2");

    j1.classList.remove("coroa");
    j2.classList.remove("coroa");

    // Maior pontuação fica em cima
    if (p1 > p2) {
        rank.prepend(j1);
        j1.classList.add("coroa");
    } else if (p2 > p1) {
        rank.prepend(j2);
        j2.classList.add("coroa");
    } else {
        rank.append(j2);
    }
}

btnNovamente.onclick = resetJogo;
}); /* Fim do Jogo da Velha */


/* ============================= Script da Torre de Hannoi ============================= */
document.addEventListener('DOMContentLoaded', function() {
let segundos = 0;
let intervalo;
let jogoAtivo = false;

let ranking = [
    {nome:"Dr.Eggman", tempo:69},
    {nome:"Peach", tempo:91},
    {nome:"Mago Escarlate", tempo:120}
];

const msgTopo = document.getElementById("mensagemTopo");
const resetBtn = document.getElementById("resetBtn");
const nomeInput = document.getElementById("nome");

nomeInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") adicionarAoRanking();
});

function iniciarJogo() {
    if (jogoAtivo) return;

    jogoAtivo = true;
    segundos = 0;

    msgTopo.textContent = "Jogo iniciado!";
    resetBtn.style.display = "none";

    clearInterval(intervalo);
    intervalo = setInterval(() => {
        segundos++;
        const m = String(Math.floor(segundos / 60));
        const s = String(segundos % 60).padStart(2, "0");
        document.getElementById("tempo").textContent = `${m}:${s}`;
    }, 1000);
}

document.getElementById("startBtn").onclick = iniciarJogo;

document.querySelectorAll(".disco").forEach(disco => {
    disco.addEventListener("click", iniciarJogo);
});

let discoSelecionado = null;

document.querySelectorAll(".torre").forEach(torre => {
    torre.addEventListener("click", () => moverDisco(torre));
});

function moverDisco(torre) {
    const discos = torre.querySelectorAll(".disco");

    if (!discoSelecionado) {
        if (discos.length === 0) return;
        discoSelecionado = discos[0];
        discoSelecionado.classList.add("selecionado");
        return;
    }

    const topo = discos[0];

    if (topo && topo.clientWidth < discoSelecionado.clientWidth) {
        discoSelecionado.classList.remove("selecionado");
        discoSelecionado = null;
        return;
    }

    torre.prepend(discoSelecionado);
    discoSelecionado.classList.remove("selecionado");
    discoSelecionado = null;

    if (torre.dataset.id === "2") {
        checarVitoria();
    }
}

function checarVitoria() {
    const torreFinal = document.querySelector('.torre[data-id="2"]');
    const discos = torreFinal.querySelectorAll('.disco');

    if (discos.length === 5) {
        clearInterval(intervalo);
        jogoAtivo = false;
        explosaoVitoria(); //Animação de Vitória

        const tempoTexto = document.getElementById("tempo").textContent;
        const tempoFinal = segundos;
        const piorTempo = ranking[ranking.length - 1].tempo;

        document.getElementById("ultimo").textContent = tempoTexto;

        let recordeAtual = parseInt(document.getElementById("recorde").dataset.segundos || 99999);

        // Mensagem do topo
        if (tempoFinal < piorTempo) {
            msgTopo.textContent = `Parabéns! Você entrou no ranking!`;
            document.getElementById("ranking-msg").style.display = "block";
        } else if (tempoFinal < recordeAtual) {
            msgTopo.textContent = `Parabéns! Novo recorde: ${tempoTexto}`;
        } else {
            msgTopo.textContent = `Parabéns! Tempo final: ${tempoTexto}`;
        }

        // Salvar recorde
        if (tempoFinal < recordeAtual) {
            document.getElementById("recorde").dataset.segundos = tempoFinal;
            document.getElementById("recorde").textContent = tempoTexto;
        }

        resetBtn.style.display = "block";
    }
}

resetBtn.onclick = () => {
    clearInterval(intervalo);
    jogoAtivo = false;
    segundos = 0;

    document.getElementById("tempo").textContent = "0:00";

    msgTopo.textContent = "Pronto para começar?";
    resetBtn.style.display = "none";

    document.querySelectorAll(".torre").forEach(t => {
        if (t.dataset.id !== "0") {
            t.innerHTML = "";
        }
    });

    const torreInicial = document.querySelector('.torre[data-id="0"]');
    torreInicial.innerHTML = `
        <div class="disco d5"></div>
        <div class="disco d4"></div>
        <div class="disco d3"></div>
        <div class="disco d2"></div>
        <div class="disco d1"></div>
    `;
    
    discoSelecionado = null;
};

function adicionarAoRanking() {
    const nome = nomeInput.value.trim();
    if (nome === "") return;

    ranking.push({ nome: nome, tempo: segundos });
    ranking.sort((a, b) => a.tempo - b.tempo);

    ranking = ranking.slice(0, 3);
    atualizarRankingHTML();

    nomeInput.value = "";
    document.getElementById("ranking-msg").style.display = "none";

    msgTopo.textContent = "Ranking atualizado!";
}

function atualizarRankingHTML() {
    const rankingDiv = document.querySelector(".ranking");
    rankingDiv.innerHTML = "";

    ranking.forEach(item => {
        const min = Math.floor(item.tempo / 60);
        const seg = String(item.tempo % 60).padStart(2, "0");

        rankingDiv.innerHTML += `
            <div class="r-item">
                <span>${item.nome}</span>
                <span>${min}:${seg}</span>
            </div>
        `;
    });
}
}); /* Fim ds Torre de Hannoi */

/* Animação de Vitória */
function explosaoVitoria() {
    const container = document.getElementById("explosao-container");
    const quantidade = 30;

    const centroX = window.innerWidth / 2;
    const centroY = window.innerHeight / 2;

    for (let i = 0; i < quantidade; i++) {
        const item = document.createElement("img");
        item.classList.add("particula");

        if (Math.random() < 0.7) {
            item.src = "https://cdn-icons-png.flaticon.com/512/1828/1828884.png";
        } else {
            item.src = "https://cdn-icons-png.flaticon.com/512/1828/1828970.png";
        }

        item.style.left = centroX + "px";
        item.style.top = centroY + "px";

        const angulo = (Math.PI * 2 * i) / quantidade;
        const distancia = 250 + Math.random() * 120;

        const dx = Math.cos(angulo) * distancia + "px";
        const dy = Math.sin(angulo) * distancia + "px";

        item.style.setProperty("--dx", dx);
        item.style.setProperty("--dy", dy);

        container.appendChild(item);

        setTimeout(() => item.remove(), 1000);
    }
}
