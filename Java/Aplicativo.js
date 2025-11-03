const frm = document.querySelector("#formContas");  // obtém elementos da página
const listaContasEl = document.querySelector("#listaContas");
const resumoContasEl = document.querySelector("#resumoContas");
const btnSubmit = frm.querySelector("input[type='submit']");  //Seleciona o botão de submit
const selectMes = document.querySelector("#mes")
const inputAno = document.querySelector("#ano")
const inputSalario = document.querySelector("#salario")
const btnLimparMes = document.querySelector("#btnLimparMes");
const filtroContainer = document.querySelector(".filtros-container");
const filtroBtnTodas = document.querySelector("#filtro-todas");
const filtroBtnPendentes = document.querySelector("#filtro-pendentes");
const filtroBtnPagas = document.querySelector("#filtro-pagas");

    //Seletores para os elementos do Modal
const modalContainer = document.querySelector("#modal-container");
const formModal = document.querySelector("#formModal");
const modalIndice = document.querySelector("#modalIndice");
const modalDescricao = document.querySelector("#modalDescricao");
const modalValor = document.querySelector("#modalValor");
const btnModalCancelar = document.querySelector("#btnModalCancelar");
   

    //---ESTADO DO APLICATIVO---
    //Estrututa para armazenar todas as contas, separadas por mês (ex: {"2025-10": [{...}, {...}]})
    let todasAsContas = JSON.parse(localStorage.getItem("todasAsContas")) || {};
    let salarioPorMes = JSON.parse(localStorage.getItem("salarioPorMes")) || {};
    let mesAtualSelecionado = '';
    let filtroAtual = 'todas';

        //---FUNÇÕES---

    function salvarDados(){
        localStorage.setItem("todasAsContas", JSON.stringify(todasAsContas));
        localStorage.setItem("salarioPorMes", JSON.stringify(salarioPorMes)); //Salva o salario
    }

    //Função para atualizar a classe 'active' nos botões de filtro
    function atualizarBotoesFiltro(){
        filtroBtnTodas.classList.toggle('active', filtroAtual === 'todas');
        filtroBtnPendentes.classList.toggle('active', filtroAtual === 'pendentes');
        filtroBtnPagas.classList.toggle('active', filtroAtual === 'pagas');
    }


    //Função para gerar a mensagem de feedback financeiro
    function obterMensagemFinanceira(percentualGasto){
        if(isNaN(percentualGasto) || percentualGasto < 0) {
            return { texto: '', cor: ''}; //Não mostra mensagem se não houver dados
        }

        if(percentualGasto <= 40){
            return{texto: 'Parabéns! Você está gastando bem menos que o seu salário.', cor: 'green' };
        }else if(percentualGasto <= 70) {
            return{texto: 'Seus gastos estão na média. Continue controlando!', cor: 'orange' };
        }else{
            return{texto: 'Cuidado! Seus gastos estão muito altos. Risco de endividamento!', cor: 'red' };
        }
    }

    //Função para renderizar (exibir) as contas na tela
    function renderizarContasDoMes(){
       //Pega a lista de contas do mês atual. Se não existir, usa uma lista vazia
        const contasDoMes = todasAsContas[mesAtualSelecionado] || [];
        const salarioDoMes = salarioPorMes[mesAtualSelecionado] || 0; //Pega o salário do mês, ou 0 se não houver

        //Aplica o filtro antes de renderizar
        let contasFiltradas = [];
        if(filtroAtual === 'pendentes'){
            contasFiltradas = contasDoMes.filter(conta => !conta.paga);
        }else if(filtroAtual === 'pagas'){
            contasFiltradas = contasDoMes.filter(conta => conta.paga);
        }else{
            contasFiltradas = contasDoMes; //'todas'
        }

        listaContasEl.innerHTML = "";
        if(contasDoMes.length === 0 && salarioDoMes === 0){
            resumoContasEl.innerHTML = "<p>Nenhuma conta registrada para este mês.</p>";
            return;
        }

        //Limpa a lista apenas se houver contas, para não apagar o resumo do salário
        if (contasFiltradas.length === 0) {
        if (filtroAtual === 'pendentes') {
            listaContasEl.innerHTML = "<p>Nenhuma conta pendente. Bom trabalho!</p>";
        } else if (filtroAtual === 'pagas') {
            listaContasEl.innerHTML = "<p>Nenhuma conta foi paga ainda.</p>";
        } else {
            listaContasEl.innerHTML = "<p>Nenhuma conta registrada.</p>";
        }
    } else {
        contasFiltradas.forEach((conta) =>{
            //Precisamos encontrar o índice original da conta para Edição/Exclusão
            const indexOriginal = contasDoMes.indexOf(conta);

            const li = document.createElement("li");
            if(conta.paga) { li.className = "conta-paga"; }

            const chkPaga = document.createElement("input");
            chkPaga.type = "checkbox"; chkPaga.checked = conta.paga; chkPaga.className = "chk-paga";
            chkPaga.dataset.index = indexOriginal; //Usa o índice original

            const btnEditar = document.createElement("button");
            btnEditar.innerText = "Editar"; btnEditar.className = "btn-editar";
            btnEditar.dataset.index = indexOriginal; //Usa o índice original

            const btnExcluir = document.createElement("button");
            btnExcluir.innerText = "Excluir"; btnExcluir.className = "btn-excluir";
            btnExcluir.dataset.index = indexOriginal; //Usa o índice original

            li.appendChild(chkPaga);
            li.append(` ${conta.descricao} - R$: ${conta.valor.toFixed(2)} `);
            li.appendChild(btnEditar);
            li.appendChild(btnExcluir);

            listaContasEl.appendChild(li);
        });
    }

        let totalGeral = 0;
        let totalPago = 0;
        contasDoMes.forEach(conta => {
            totalGeral += conta.valor;
            if (conta.paga) {
                totalPago += conta.valor;
            }
        });

        const saldo = salarioDoMes - totalGeral;
        const corSaldo = saldo >= 0 ? 'green' : 'red'; //Saldo verde se positivo, vermelho se negativo

        //Lógica para calcular o percentual e obter a mensagem
        let mensagemFinanceira = { texto: '', cor: '' };
        if(salarioDoMes > 0){
            const percentualGasto = (totalGeral / salarioDoMes) * 100;
            mensagemFinanceira = obterMensagemFinanceira(percentualGasto);
        }

        //Resumo mais completo
        resumoContasEl.innerHTML =  `
        <hr>
        <p>Salário: <span style="color: blue;">R$ ${salarioDoMes.toFixed(2)}</span></p>
        <p>Total de Contas: <span style="color: red;">R$ ${totalGeral.toFixed(2)}</span></p>
        <p><strong>Saldo Final: <span style="color: ${corSaldo};">R$ ${saldo.toFixed(2)}</span></strong></p>
        <br>
        <p>Pago do Mês: R$ ${totalPago.toFixed(2)}</p>
        <p class="mensagem-financeira" style="color: ${ mensagemFinanceira.cor };">${mensagemFinanceira.texto}</p>
        
    `;
    }

    function obterMensagemFinanceira(percentualGasto) {
    if (isNaN(percentualGasto) || percentualGasto < 0) { return { texto: '', cor: '' }; }
    if (percentualGasto <= 40) { return { texto: 'Parabéns! Você está gastando bem menos que o seu salário.', cor: 'green' }; }
    else if (percentualGasto <= 70) { return { texto: 'Seus gastos estão na média. Continue controlando!', cor: 'orange' }; }
    else { return { texto: 'Cuidado! Seus gastos estão muito altos. Risco de endividamento!', cor: 'red' }; }
}

    //Função para atualizar a chave do mês selecionado e recarregar a lista
    function atualizarMesSelecionado(){
        const mes = selectMes.value;
        const ano = inputAno.value;
        mesAtualSelecionado = `${ano}-${mes}`;

    //Carrega o salário salvo para o mês selecionado
        const salarioSalvo = salarioPorMes[mesAtualSelecionado] || "";
        inputSalario.value = salarioSalvo;

        renderizarContasDoMes();
    }

    //Funções para abrir e fechar o modal
        function abrirModal(index){
            const contasDoMes = todasAsContas[mesAtualSelecionado] || [];
            const contaParaEditar = contasDoMes[index];
            //Preenche os campos do modal com os dados da conta
            modalIndice.value = index;
            modalDescricao.value = contaParaEditar.descricao;
            modalValor.value = contaParaEditar.valor;
            //Mostra o modal
            modalContainer.classList.remove("modal-escondido");
            modalDescricao.focus(); //Foca no primeiro campo    
        }
        function fecharModal(){
            modalContainer.classList.add("modal-escondido");
        }

    //Função para popular o seletor de mês e definir o mês/ano atual
    function inicializarSeletorDeMes() {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const hoje = new Date();
        const mesAtual = hoje.getMonth(); //0-11
        const anoAtual = hoje.getFullYear();

        meses.forEach((nomeMes, index) =>{
            const option = document.createElement("option");
            //O valor será "1", "2", etc.. para facilitar a ordenação
            option.value = String(index + 1).padStart(2,'0');
            option.innerText = nomeMes;
            selectMes.appendChild(option);
        });

        selectMes.value = String(mesAtual + 1).padStart(2, '0');
        inputAno.value = anoAtual;

        //Adiciona "escutadores" para atualizar a lista sempre que o mês ou ano mudar
        selectMes.addEventListener("change", atualizarMesSelecionado);
        inputAno.addEventListener("change", atualizarMesSelecionado);

       

       

    }   
        //---EVENTOS---

 btnLimparMes.addEventListener("click", () =>{
            //Pede confirmação
            const confirmou = confirm("Tem certeza que deseja apagar TODAS as contas deste mês? Esta ação não pode ser desfeita.");
            if(confirmou){
                todasAsContas[mesAtualSelecionado] = []; //Esvazia a lista do mês atual
                salvarDados();
                renderizarContasDoMes();
                frm.inDescricao.focus();
            } 
        });

         //Evento para cuidar dos cliques nos botões de filtro
            filtroContainer.addEventListener("click", (e) =>{
                const target = e.target;
                if(target.id === 'filtro-todas'){
                    filtroAtual = 'todas';
                }else if(target.id === 'filtro-pendentes'){
                    filtroAtual = 'pendentes';
                }else if(target.id === 'filtro-pagas'){
                    filtroAtual = 'pagas';
                }else{
                    return;  //Sai se o clique não foi em um botão
                }

                atualizarBotoesFiltro(); //Atualiza o visual dos botões
                renderizarContasDoMes(); //Renderiza a lista com o novo filtro
            });

    //Evento para salvar o salário sempre que o valor do campo mudar
    inputSalario.addEventListener("change", () => {
        const salario = Number(inputSalario.value);
        salarioPorMes[mesAtualSelecionado] = salario;
        salvarDados();
        renderizarContasDoMes(); //Atualiza o resumo com o novo salário
    } )

    //"Escuta" o evento de envio do formulário
    frm.addEventListener("submit", (e) =>{
        e.preventDefault();  //Evita o comportamento padrão de recarregar a página

        //Obtém os valores dos campos
        const descricao = frm.inDescricao.value;
        const valor = Number(frm.inValor.value);

        //Garante que a lista para o mês atual exista
        if(!todasAsContas[mesAtualSelecionado]){
            todasAsContas[mesAtualSelecionado] = [];
        }
        const contasDoMes = todasAsContas[mesAtualSelecionado];
 
        contasDoMes.push({ descricao, valor, paga: false });
        
        renderizarContasDoMes();
        salvarDados(); 
        frm.reset();
        frm.inDescricao.focus();
    });
    

    //"Escuta" o clique na lista de contas
    listaContasEl.addEventListener("click", (e) =>{
        const target = e.target;
        if(!target.dataset.index) return;  //Se o clique não foi em um elemento com data-index, ignora
        const index = Number(target.dataset.index);
        const contasDoMes = todasAsContas[mesAtualSelecionado];

        if(target.classList.contains("btn-excluir")) {
            const confirmou = confirm(`Tem certeza que deseja excluir a conta "${contasDoMes[index].descricao}"?`);
            if(confirmou) {
                contasDoMes.splice(index, 1);
            }
            
        }else if(target.classList.contains("btn-editar")) {
            //Em vez de mexe no form principal, abre o modal
            abrirModal(index);
            return;
            
        }else if(target.classList.contains("chk-paga")) {
            //Lógica para o checkbox
            //Inverte o valor booleano (true vira false, false vira true)
            contasDoMes[index].paga = !contasDoMes[index].paga;
        }else{
            return; //Se não clicou em um elemento de ação, não faz nada
        }
        salvarDados();
        renderizarContasDoMes();
    });

    //Evento para o Modal
    formModal.addEventListener("submit", (e) =>{
        e.preventDefault();

        //Pega os dados do modal
        const indexParaSalvar = Number(modalIndice.value);
        const novaDescricao = modalDescricao.value;
        const novoValor = Number(modalValor.value);
        const contasDoMes = todasAsContas[mesAtualSelecionado];

        //Atualiza a conta no array original
        contasDoMes[indexParaSalvar].descricao = novaDescricao;
        contasDoMes[indexParaSalvar].valor = novoValor;

        salvarDados();
        renderizarContasDoMes();
        fecharModal();
    });

    btnModalCancelar.addEventListener("click", fecharModal);
        
    //Lógica para fechar clicando no fundo
    modalContainer.addEventListener("click", (e) =>{
        if(e.target.id === "modal.container"){
            fecharModal();
        }
    })

        //---INICIALIZAÇÃO---
        inicializarSeletorDeMes();
        atualizarMesSelecionado();  //Carrega as contas do mês atual logo no início
        atualizarBotoesFiltro(); //Garante que o botão 'todas' comece ativo