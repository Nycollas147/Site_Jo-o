// =========================================================================
// 1. SISTEMA DE SEGURANÇA E VERIFICAÇÃO DE SESSÃO
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const painelAluno = document.getElementById("info-aluno");
    
    if (painelAluno) {
        const raSalvo = localStorage.getItem("aluno_ra");
        const nomeSalvo = localStorage.getItem("aluno_nome");

        // JUNTA O ENDEREÇO EXTERNO DA INTERNET COM O SEU CAMINHO
        if (!raSalvo) {
            window.location.href = window.location.origin + "/Site_Jo-o/login.html"; 
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
    // FAZ O MESMO LOGOUT MANDANDO PARA O LINK EXTERNO GERADO DINAMICAMENTE
    window.location.href = window.location.origin + "/Site_Jo-o/login.html";
}
