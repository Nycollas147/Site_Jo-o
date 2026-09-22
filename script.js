// 1. BANCO DE DADOS LOCAL COMPARTILHADO (Separado por R.A. de Aluno)
let bancoDeDadosGeral = JSON.parse(localStorage.getItem('registro_notas_app_multi')) || {};

// Captura as informações do aluno que realizou o login
const raLogado = localStorage.getItem('aluno_logado_ra') || "visitante";
const nomeLogado = localStorage.getItem('aluno_logado_nome') || "Aluno";

// Garante que o usuário atual tenha um espaço próprio e isolado no banco de dados
if (!bancoDeDadosGeral[raLogado]) {
    bancoDeDadosGeral[raLogado] = {
        "front-end": {},
        "back-end": {},
        "modelagem": {},
        "versionamento": {},
        "ia": {},
        "multidisciplinar": {},
        "mobile": {}
    };
}

// Atalho para manipular diretamente as notas do aluno logado no momento
let bancoDeDados = bancoDeDadosGeral[raLogado];

// 2. MAPEAMENTO DE ELEMENTOS DA TELA (DOM)
const botoesMaterias = document.querySelectorAll('.btn-materia');
const conteudoDinamico = document.getElementById('conteudo-dinamico');

// Variável para controlar a matéria selecionada
let materiaAtiva = "front-end";

// 3. FUNÇÃO: RENDERIZA OS CARDS DA SEMANA 15 ATÉ A 21
function renderizarTela(materiaId, nomeMateria) {
    materiaAtiva = materiaId;

    // Gera de forma inteligente a lista de semanas solicitadas (15 até 21)
    const semanasDisponiveis = Array.from({ length: 7 }, (_, i) => 15 + i);

    // Gerando o HTML dos cards dinamicamente
    const cardsHTML = semanasDisponiveis.map(numSemana => {
        const chaveSemana = "Semana " + numSemana;
        const textoSalvo = bancoDeDados[materiaId]?.[chaveSemana] || "";
        const temRegistro = textoSalvo.trim().length > 0;
        
        // Define as classes e textos das badges de status
        let classeBadge = 'status-vazio';
        let textoBadge = 'Vazio';

        if (temRegistro) {
            classeBadge = 'status-salvo';
            textoBadge = 'Com Registro';
        } else if (numSemana === 15) {
            classeBadge = 'status-atual';
            textoBadge = 'Atual';
        }

        const classeCardAtiva = numSemana === 15 ? 'card-semana ativa' : 'card-semana';
        const resumoTexto = temRegistro ? (textoSalvo.substring(0, 45) + '...') : 'Clique para adicionar seu registro...';

        // Botão de excluir só aparece se houver um registro salvo
        const botaoExcluirHTML = temRegistro 
            ? `<button class="btn-card-excluir" onclick="event.stopPropagation(); excluirRegistro('${chaveSemana}')">Excluir</button>` 
            : '';

        return `
            <div class="${classeCardAtiva}" onclick="abrirFormularioRegistro('${chaveSemana}')">
                <div class="card-header">
                    <h3>${chaveSemana}</h3>
                    <span class="badge ${classeBadge}">${textoBadge}</span>
                </div>
                <p class="preview-texto">${resumoTexto}</p>
                <div class="card-acoes" style="display: flex; gap: 8px; margin-top: 15px;">
                    <button class="btn-card-editar">Editar</button>
                    ${botaoExcluirHTML}
                </div>
            </div>
        `;
    }).join('');

    // Insere o container estruturado de volta na página
    conteudoDinamico.innerHTML = `
        <div class="materia-container">
            <h1 class="titulo-materia">Bloco de Notas: ${nomeMateria}</h1>
            <p class="subtitulo-cronograma">Cronograma da Atividade de <strong>${nomeLogado}</strong>:</p>
            <div class="grid-semanas">
                ${cardsHTML}
            </div>
        </div>
    `;
}

// 4. FUNÇÃO: ABRE A ÁREA DE TEXTO PARA INSERIR OU EDITAR O REGISTRO
function abrirFormularioRegistro(semanaNome) {
    const textoAtual = bancoDeDados[materiaAtiva]?.[semanaNome] || "";
    const nomeMateriaFormatado = document.querySelector('.titulo-materia').textContent;

    conteudoDinamico.innerHTML = `
        <div class="materia-container">
            <h1 class="titulo-materia">${nomeMateriaFormatado}</h1>
            <p class="subtitulo-cronograma">Editando: <strong>${semanaNome}</strong></p>

            <form id="form-notas" onsubmit="salvarRegistro(event, '${semanaNome}')">
                <div class="grupo-campo">
                    <textarea 
                        id="anotacoes-textarea" 
                        name="anotacoes" 
                        placeholder="Digite suas anotações da aula aqui..."
                    >${textoAtual}</textarea>
                </div>

                <div class="grupo-campo">
                    <label for="arquivo-input" class="upload-container">
                        <span class="upload-texto">Clique para anexar um documento ou arquivo</span>
                        <input type="file" id="arquivo-input" name="arquivo" hidden>
                    </label>
                </div>

                <div class="botoes-acoes" style="display: flex; gap: 10px;">
                    <button type="submit" id="btn-salvar">Salvar Mudanças</button>
                    <button type="button" id="btn-voltar" onclick="voltarParaSemanas()" style="background-color: #6c757d;">Voltar</button>
                </div>
            </form>
        </div>
    `;
}

// 5. FUNÇÃO: SALVA O TEXTO DIGITADO NO LOCALSTORAGE NO PERFIL CERTO
function salvarRegistro(event, semanaNome) {
    event.preventDefault();
    
    const textoDigitado = document.getElementById('anotacoes-textarea').value;

    if (!bancoDeDados[materiaAtiva]) {
        bancoDeDados[materiaAtiva] = {};
    }

    // Grava localmente no perfil do aluno atual
    bancoDeDados[materiaAtiva][semanaNome] = textoDigitado;
    
    // Atualiza a árvore global de dados e joga no LocalStorage
    bancoDeDadosGeral[raLogado] = bancoDeDados;
    localStorage.setItem('registro_notas_app_multi', JSON.stringify(bancoDeDadosGeral));

    alert(`Registro da ${semanaNome} salvo com sucesso!`);
    voltarParaSemanas();
}

// 6. FUNÇÃO: EXCLUI O REGISTRO DA SEMANA
function excluirRegistro(semanaNome) {
    const confirmar = confirm(`Tem certeza que deseja apagar o registro da ${semanaNome}?`);
    
    if (confirmar) {
        if (bancoDeDados[materiaAtiva] && bancoDeDados[materiaAtiva][semanaNome]) {
            // Remove o registro específico do usuário logado
            delete bancoDeDados[materiaAtiva][semanaNome];
            
            // Sincroniza e salva o banco global
            bancoDeDadosGeral[raLogado] = bancoDeDados;
            localStorage.setItem('registro_notas_app_multi', JSON.stringify(bancoDeDadosGeral));
            
            voltarParaSemanas();
        }
    }
}

// 7. FUNÇÃO: VOLTA PARA A VISUALIZAÇÃO DOS CARDS
function voltarParaSemanas() {
    const botaoAtivo = document.querySelector('.btn-materia.active');
    renderizarTela(materiaAtiva, botaoAtivo ? botaoAtivo.textContent : "Front-End");
}

// 8. EVENT LISTENERS: CLIQUE NAS DISCIPLINAS DA BARRA LATERAL
botoesMaterias.forEach(botao => {
    botao.addEventListener('click', (e) => {
        botoesMaterias.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const materiaId = e.target.getAttribute('data-materia');
        const nomeMateria = e.target.textContent;

        renderizarTela(materiaId, nomeMateria);
    });
});

// 9. ATUALIZAÇÃO VISUAL DO PERFIL DO ALUNO LOGADO NA SIDEBAR
function carregarPerfilDoAluno() {
    const elNome = document.getElementById('nome-usuario-sidebar');
    const elRa = document.getElementById('ra-usuario-sidebar');

    if (elNome && elRa) {
        elNome.textContent = nomeLogado;
        elRa.textContent = "R.A.: " + raLogado;
    }
}

// Inicializações padrão ao abrir a página
carregarPerfilDoAluno();
renderizarTela("front-end", "Front-End");
