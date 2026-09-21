// =========================================================================
// 1. SISTEMA DE SEGURANÇA E VERIFICAÇÃO DE SESSÃO
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const painelAluno = document.getElementById("info-aluno");
    
    if (painelAluno) {
        const raSalvo = localStorage.getItem("aluno_ra");
        const nomeSalvo = localStorage.getItem("aluno_nome");

        if (!raSalvo) {
            window.location.href = "login.html";
            return;
        }

        painelAluno.innerHTML = `
            <p><strong>Aluno:</strong> ${nomeSalvo}</p>
            <p><strong>R.A.:</strong> ${raSalvo}</p>
            <a href="#" onclick="fazerLogout()" style="color: #e74c3c; text-decoration: none; font-size: 0.85rem; font-weight: bold; border-bottom: 1px dashed #e74c3c;">[ Sair / Logout ]</a>
        `;
    }
});

function fazerLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}

let materiaAtiva = "";

// =========================================================================
// 2. BANCO DE DADOS INICIAL LOCAL (LOCALSTORAGE)
// =========================================================================
const databaseInicial = {
    frontend: { titulo: "Front-End", semanas: [] },
    backend: { titulo: "Back-End", semanas: [] },
    versionamento: { titulo: "Versionamento de Código e Sistemas de Mensageria", semanas: [] },
    ia: { titulo: "Inteligência Artificial", semanas: [] },
    multidisciplinar: { titulo: "Projeto Multidisciplinar", semanas: [] },
    mobile: { titulo: "Programação Mobile", semanas: [] },
    banco: { titulo: "Modelagem de Banco de Dados", semanas: [] }
};

if (!localStorage.getItem("banco_portfolio")) {
    localStorage.setItem("banco_portfolio", JSON.stringify(databaseInicial));
}

// =========================================================================
// 3. MOTORES DE ATIVIDADES, INTERAÇÃO, EDIÇÃO E EXCLUSÃO
// =========================================================================
function mostrarMateria(materiaKey) {
    materiaAtiva = materiaKey;
    cancelarEdicao(); // Limpa qualquer edição pendente ao trocar de matéria
    
    const bancoTotal = JSON.parse(localStorage.getItem("banco_portfolio"));
    const dados = bancoTotal[materiaKey];

    if (!dados) return;

    document.getElementById('cabecalho-materia').innerHTML = `<h2>Disciplina: ${dados.titulo}</h2>`;
    document.getElementById('formulario-registro').style.display = "block";

    atualizarListaTela(dados);
}

function atualizarListaTela(dados) {
    const painel = document.getElementById('painel-atividades');
    let htmlSemanas = "";

    if (!dados.semanas || dados.semanas.length === 0) {
        htmlSemanas = `<p style="color: #7f8c8d; font-style: italic;">Nenhum registro ou bloco de notas criado para esta matéria.</p>`;
    } else {
        // Organiza os cards criados seguindo a ordem das semanas de forma crescente
        dados.semanas.sort((a, b) => a.numero - b.numero);

        dados.semanas.forEach(sem => {
            htmlSemanas += `
                <div class="semana-card" style="position: relative; background: white; border-left: 5px solid #1abc9c; padding: 20px; margin-top: 20px; margin-bottom: 20px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    <!-- Botões de Ação Dinâmicos -->
                    <div style="position: absolute; top: 15px; right: 15px; display: flex; gap: 10px;">
                        <button onclick="prepararEdicao(${sem.id})" style="background: none; border: none; color: #3498db; font-weight: bold; cursor: pointer; font-size: 0.85rem;">[Editar]</button>
                        <button onclick="deletarRegistro(${sem.id})" style="background: none; border: none; color: #e74c3c; font-weight: bold; cursor: pointer; font-size: 0.85rem;">[Excluir]</button>
                    </div>
                    
                    <h3>Registro Acadêmico - Semana ${sem.numero}</h3>
                    <p style="margin: 10px 0; white-space: pre-wrap; background: #fdfdfd; padding: 10px; border-radius: 4px; border: 1px solid #eee; color: #555;">${sem.descricao}</p>
                    ${sem.arquivo ? `<p style="font-size: 0.9rem; color: #2c3e50;">📂 <strong>Arquivo Anexado:</strong> <span style="color:#1abc9c">\${sem.arquivo}</span></p>` : ''}
                </div>
            `;
        });
    }
    painel.innerHTML = htmlSemanas;
}

// SALVAR NOVO OU ATUALIZAR UM REGISTRO EXISTENTE
function salvarNovoRegistro() {
    const idExistente = document.getElementById('reg-id').value;
    const numSemana = document.getElementById('reg-semana').value.trim();
    const descricao = document.getElementById('reg-descricao').value.trim();
    const inputArquivo = document.getElementById('reg-arquivo');

    if (!numSemana || !descricao) {
        alert("Por favor, preencha o número da semana e as anotações do registro!");
        return;
    }

    const bancoTotal = JSON.parse(localStorage.getItem("banco_portfolio"));
    let nomeArquivo = "";

    // Pega com segurança o nome do arquivo selecionado pelo componente upload
    if (inputArquivo && inputArquivo.files.length > 0) {
        nomeArquivo = inputArquivo.files[0].name;
    }

    if (idExistente) {
        // --- PROCESSO DE EDIÇÃO ---
        const registro = bancoTotal[materiaAtiva].semanas.find(sem => sem.id == idExistente);
        if (registro) {
            registro.numero = parseInt(numSemana);
            registro.descricao = descricao;
            // Se o usuário não escolheu outro arquivo, mantém o anexo original
            if (nomeArquivo !== "") {
                registro.arquivo = nomeArquivo;
            }
        }
    } else {
        // --- PROCESSO DE CRIAÇÃO ---
        bancoTotal[materiaAtiva].semanas.push({
            id: Date.now(),
            numero: parseInt(numSemana),
            descricao: descricao,
            arquivo: nomeArquivo
        });
    }

    localStorage.setItem("banco_portfolio", JSON.stringify(bancoTotal));
    cancelarEdicao();
    atualizarListaTela(bancoTotal[materiaAtiva]);
}

// CAPTURA OS DADOS DO CARD E JOGA NO BLOCO DE NOTAS PARA PODER ALTERAR
function prepararEdicao(idRegistro) {
    const bancoTotal = JSON.parse(localStorage.getItem("banco_portfolio"));
    const registro = bancoTotal[materiaAtiva].semanas.find(sem => sem.id == idRegistro);

    if (!registro) return;

    // Devolve as informações para os campos de digitação
    document.getElementById('reg-id').value = registro.id;
    document.getElementById('reg-semana').value = registro.numero;
    document.getElementById('reg-descricao').value = registro.descricao;
    document.getElementById('arquivo-atual-nome').innerText = registro.arquivo ? `Arquivo salvo: ${registro.arquivo}` : "";

    // Modifica a interface visual informando a alteração
    document.getElementById('titulo-form').innerText = "Editando Registro de Aula";
    document.getElementById('btn-salvar').innerText = "Atualizar Registro";
    document.getElementById('btn-cancelar').style.display = "block";
    
    // Move a tela de forma automática até o formulário do bloco de notas
    document.getElementById('formulario-registro').scrollIntoView({ behavior: 'smooth' });
}

// RESETAR E LIMPAR O FORMULÁRIO DO BLOCO DE NOTAS
function cancelarEdicao() {
    document.getElementById('reg-id').value = "";
    document.getElementById('reg-semana').value = "";
    document.getElementById('reg-descricao').value = "";
    document.getElementById('reg-arquivo').value = "";
    document.getElementById('arquivo-atual-nome').innerText = "";

    document.getElementById('titulo-form').innerText = "Novo Registro de Aula";
    document.getElementById('btn-salvar').innerText = "Salvar no Portfólio";
    document.getElementById('btn-cancelar').style.display = "none";
}

// APAGAR UM CARD ESPECÍFICO
function deletarRegistro(idRegistro) {
    if (!confirm("Tem certeza que deseja apagar este registro permanentemente?")) return;

    const bancoTotal = JSON.parse(localStorage.getItem("banco_portfolio"));
    bancoTotal[materiaAtiva].semanas = bancoTotal[materiaAtiva].semanas.filter(sem => sem.id !== idRegistro);
    localStorage.setItem("banco_portfolio", JSON.stringify(bancoTotal));

    // Se apagar o item enquanto ele estava sendo editado, limpa o bloco
    if(document.getElementById('reg-id').value == idRegistro) {
        cancelarEdicao();
    }

    atualizarListaTela(bancoTotal[materiaAtiva]);
}
