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
const modalContainer = document.querySelector("#modal-container");
const formModal = document.querySelector("#formModal");
const modalIndice = document.querySelector("#modalIndice");
const modalDescricao = document.querySelector("#modalDescricao");
const modalValor = document.querySelector("#modalValor");
const btnModalCancelar = document.querySelector("#btnModalCancelar");
const graficoContainer = document.querySelector("#grafico-container");
const selectOrdenacao = document.querySelector("#ordenacao");
const inCategoria = document.querySelector("#inCategoria");
const modalCategoria = document.querySelector("#modalCategoria");
const inData = document.querySelector("#inData");
const btnGerenciarCategorias = document.querySelector("#btnGerenciarCategorias");
const modalCategoriasContainer = document.querySelector("#modal-categorias-container");
const btnFecharModalCategorias = document.querySelector("#btnFecharModalCategorias");
const formAddCategoria = document.querySelector("#formAddCategoria");
const inNovaCategoria = document.querySelector("#inNovaCategoria");
const listaCategoriasModal = document.querySelector("#lista-categorias-modal");
const btnTema = document.querySelector("#btnTema");
const btnCopiarMes = document.querySelector("#btnCopiarMes");
const inCorCategoria = document.querySelector("#inCorCategoria");
const btnExportar = document.querySelector("#btnExportar");


    //---ESTADO DO APLICATIVO---
    //Estrututa para armazenar todas as contas, separadas por mês (ex: {"2025-10": [{...}, {...}]})
    let todasAsContas = JSON.parse(localStorage.getItem("todasAsContas")) || {};
    let salarioPorMes = JSON.parse(localStorage.getItem("salarioPorMes")) || {};

   // Lógica de Categorias Dinâmicas (COM CORES)
    const defaultCategorias = [
     { nome: 'moradia', cor: '#17a2b8' },
     { nome: 'alimentacao', cor: '#28a745' },
     { nome: 'transporte', cor: '#ffc107' },
     { nome: 'lazer', cor: '#fd7e14' },
     { nome: 'saude', cor: '#dc3545' },
     { nome: 'outros', cor: '#6c757d' }
];

    //Carrega categorias. Se estiver no formato antigo (strings), converte para objetos
    let appCategorias = carregarCategoriasComMigracao();

    let mesAtualSelecionado = '';
    let filtroAtual = 'todas';
    let ordenacaoAtual = 'data-asc'; //Guarda o estado da ordenação
    let graficoAtual = null; //Variável para guardar a instância do gráfico

        //---FUNÇÕES---

    //Função para exibir nitificações bonitas (Toasts)
    function mostrarNotificacao(texto, tipo = 'sucesso'){
        let corFundo;

        if(tipo === 'sucesso'){
            corFundo = "linear-gradient(to right, #00b09b, #96c93d)"; //Verde degradê
        }else if(tipo === 'erro'){
            corFundo = "linear-gradient(to right, #ff5f6d, #ffc371)"; //Vermelho degradê
        }else if(tipo === 'aviso'){
            corFundo = "linear-gradient(to right, #f8b500, #fceabb)"; //Amarelo
        }

        Toastify({
            text: texto,
            duration: 3000, //3 segundos
            close: true,
            gravity: "top", //'top' ou 'bottom'
            position: "right", //'left', 'center' ou 'right'
            stopOnFocus: true, //Para o tempo se passar o mouse
            style: {
                background: corFundo,
                borderRadius: "8px",
                fontWeight: "bold"
            },
        }).showToast();
    }

    //Função especial para migrar dados antigos para o novo formato com cores
    function carregarCategoriasComMigracao(){
        const saved = JSON.parse(localStorage.getItem("appCategorias"));
        if(!saved) return defaultCategorias;

        //Verifica se o primeiro item é uma string (formato antigo)
        if(typeof saved[0] === 'string'){
        //Converte lista de strings para lista de objetos
            const novasCategorias = saved.map(catNome =>{
                //Tenta achar a cor no defalt, se não achar, usa cinza
                const def = defaultCategorias.find(d => d.nome === catNome);
                return { nome: catNome, cor: def ? def.cor : '#6c757d' };
            });
            return novasCategorias;
        }
        return saved; //Já está no formato novo (objetos)
    }

    function salvarDados(){
        localStorage.setItem("todasAsContas", JSON.stringify(todasAsContas));
        localStorage.setItem("salarioPorMes", JSON.stringify(salarioPorMes)); //Salva o salario
    }
    //Função para salvar categorias
    function salvarCategorias(){
        localStorage.setItem("appCategorias", JSON.stringify(appCategorias));
        popularDropdownsCategorias();//Atualiza os <select>
   }

   function getHojeFormatado() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}
   //Preenche os <select> #inCategoria e #modalCategoria
   function popularDropdownsCategorias(){
    //Limpa os dropdowns
    inCategoria.innerHTML = '';
    modalCategoria.innerHTML = '';

    //Adiciona a opção "Selecione..."
    const optionVazia = '<option value="">Selecione...</option>';
    inCategoria.innerHTML += optionVazia;
    modalCategoria.innerHTML += optionVazia;

    //Adiciona as categorias salvas
    appCategorias.forEach(cat =>{
        const catNome = cat.nome; //Agora acessamos .nome
        const catCapitalizada = catNome.charAt(0).toUpperCase() + catNome.slice(1);
        const optionHTML = `<option value="${catNome}">${catCapitalizada}</option>`;
        inCategoria.innerHTML += optionHTML;
        modalCategoria.innerHTML += optionHTML;
   }); 
 }

    //Renderiza a lista de categorias dentro do modal de gerenciamento
    function renderizarListaCategorias(){
        listaCategoriasModal.innerHTML = '';
        appCategorias.forEach(cat => {
            //Não permite excluir a categoria "outros"
            const desabilitado = (cat.nome === 'outros') ? 'disabled' : '';
            const catCapitalizada = cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1);

            listaCategoriasModal.innerHTML += `
            <li>
            <div style="display:flex; align-items:center;">
                <span class="cor-preview" style:"background-color: ${cat.cor};"></span>
                <span>${catCapitalizada}</span>
            </div>
                <button class="btn-excluir-categoria" data-categoria="${cat}" ${desabilitado}>Excluir</button>
            </li>
            `;
        });
    }

    //Função auxiliar para pegar a cor de uma categoria
    function getCorCategoria(nomeCategoria){
        const catEncontrada = appCategorias.find(c => c.nome === nomeCategoria);
        return catEncontrada ? catEncontrada.cor : '#6c757d'; //Retorna a cor ou cinza
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

    //Função para renderizar (exibir) as contas na tela(agora tamber desenha o gráfico)
    function renderizarContasDoMes(){
        //Destrói o gráfico antigo antes de começar
        if(graficoAtual){
            graficoAtual.destroy();
        }

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

        //Lógica de Ordenação
        //Ordena a lista filtrada antes de exibi-la
        contasFiltradas.sort((a, b) =>{
            switch (ordenacaoAtual){
                case 'data-asc':
                    //Coloca contas sem data no final
                    if(!a.data) return 1;
                    if(!b.data) return -1;
                    return new Date(a.data) - new Date(b.data);
                case 'data-desc':
                    if(!a.data) return 1;
                    if(!b.data) return -1;
                    return new Date(b.data) - new Date(a.data);
                case 'valor-desc':
                    return b.valor - a.valor; //Ex: 100 - 50 = 50 (b vem primeiro)            
                case 'valor-asc':
                    return a.valor - b.valor; //Ex: 50 - 100 = -50 (a vem primeiro)
                case 'desc-asc':
                    return a.descricao.localeCompare(b.descricao); //Ordem alfabética
                default:
                    return 0; //Sem ordenação
            }
        });

        listaContasEl.innerHTML = "";
        if(contasDoMes.length === 0 && salarioDoMes === 0){
            resumoContasEl.innerHTML = "<p>Nenhuma conta registrada para este mês.</p>";
            listaContasEl.innerHTML = "";
            graficoContainer.style.display = 'none'; //Esconde o gráfico se não houver dados
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

            //Cria o botão de copiar
            const btnCopiar = document.createElement("button");
            btnCopiar.innerText = "Copiar"; //Você pode usar "📋" se preferir
            btnCopiar.className = "btn-copiar";
            btnCopiar.dataset.index = indexOriginal;

            const btnExcluir = document.createElement("button");
            btnExcluir.innerText = "Excluir"; btnExcluir.className = "btn-excluir";
            btnExcluir.dataset.index = indexOriginal; //Usa o índice original

            li.appendChild(chkPaga);

            //Adiciona a tag categoria com a cor dinâmica
            if(conta.categoria) {
                const spanCategoria = document.createElement("span");
                spanCategoria.className = "tag-categoria";
                spanCategoria.dataset.categoria = conta.categoria;
                spanCategoria.innerText = conta.categoria.charAt(0).toUpperCase() + conta.categoria.slice(1);

                //Pega a cor direto do objeto da categoria
                const corDaCategoria = getCorCategoria(conta.categoria);
                spanCategoria.style.backgroundColor = corDaCategoria;
                li.appendChild(spanCategoria);
            }

            //Formata a data para [DD/MM] e adiciona ao texto
            let dataFormatada = "";
            if(conta.data) {
                const partesData = conta.data.split('-'); //Pega 'YYYY/MM/DD' e quebra
                dataFormatada = `[${partesData[2]}/${partesData[1]}]`; //Forma para 'DD/MM'
            }
            li.append(` ${dataFormatada}${conta.descricao} - R$: ${conta.valor.toFixed(2)} `);
            li.appendChild(btnCopiar);
            li.appendChild(btnEditar);
            li.appendChild(btnExcluir);

            listaContasEl.appendChild(li);
        });
    }

    //---Lógica do Resumo de texto e Gráfico---

        let totalGeral = 0;
        let totalPago = 0;
        //Agrega gastos por categoria 
        const gastosPorCategoria = {};

        contasDoMes.forEach(conta => {
            totalGeral += conta.valor;
            if (conta.paga) {
                totalPago += conta.valor;
            }
            //Agrega para o gráfico
            const categoria = conta.categoria || 'outros';
            if (!gastosPorCategoria[categoria]) {
            gastosPorCategoria[categoria] = 0;
        }
        gastosPorCategoria[categoria] += conta.valor;

        });

        const saldo = salarioDoMes - totalGeral;
        const corSaldo = saldo >= 0 ? 'green' : 'red'; //Saldo verde se positivo, vermelho se negativo
        let mensagemFinanceira = { texto: '', cor: '' };//Lógica para calcular o percentual e obter a mensagem

        if(salarioDoMes > 0 && totalGeral > 0) {
           graficoContainer.style.display = 'block'; //Mostra o container do gráfico
           const ctx = document.getElementById('graficoResumo').getContext('2d');
           
          const labelsDoGrafico = Object.keys(gastosPorCategoria).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
          const dataDoGrafico = Object.values(gastosPorCategoria);

          //Pega as cores dinâmicas
          const backgroundColors = Object.keys(gastosPorCategoria).map(cat =>  getCorCategoria(cat));

           graficoAtual = new Chart(ctx, {
            type: 'doughnut', //tipo de gráfico: rosca
            data:{
                labels: labelsDoGrafico, //Labels: ['Moradia', 'Alimentação' etc..]
                datasets: [{
                    label: 'Gastos por Categoria',
                    data: dataDoGrafico, //Data: [500, 300 ...]
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, //Permite que o CSS controle a altura
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context){
                                const label = context.label || '';
                                const valor = context.parsed;
                                const percentual = (valor / totalGeral * 100).toFixed(1);
                                return `${label}: R$ ${valor.toFixed(2)} (${percentual}%)`;
                            }
                        }
                    }
                }
            }
           });

           //Calcula a mensagem financeira
           const percentualGasto = (totalGeral / salarioDoMes) * 100;
           mensagemFinanceira = obterMensagemFinanceira(percentualGasto);

        }else if(salarioDoMes > 0 && totalGeral === 0){
            graficoContainer.style.display = 'none';
            mensagemFinanceira = { texto: 'Você não teve nenhum gasto este mês. Parabéns!', cor: 'green' };
        }else {
            //Se não tem salário, esconde o gráfico e não calcula o percentual
            graficoContainer.style.display = 'none';
            mensagemFinanceira = { texto: 'Insira um salário para ver feedback.', cor: 'blue' };
        } 

        //Atualiza o resumo de texto
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
    //Função para pegar a data de hoje formatada (YYYY/MM/DD)
    function getHojeFormatado(){
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0'); //+1 porque getMonth() é 0-11
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }


    //Funções para abrir e fechar o modal
        function abrirModal(index){
            const contasDoMes = todasAsContas[mesAtualSelecionado] || [];
            const contaParaEditar = contasDoMes[index];
            //Preenche os campos do modal com os dados da conta
            modalIndice.value = index;
            modalDescricao.value = contaParaEditar.descricao;
            modalValor.value = contaParaEditar.valor;
            modalData.value = contaParaEditar.data; //Carrega a data da conta
            
        //Verifica se a categoria existe (não é undefined ou null)
        if(contaParaEditar.categoria !== undefined && contaParaEditar.categoria !== null) {
            modalCategoria.value = contaParaEditar.categoria; // Usa o valor salvo (que pode ser "" ou "moradia", etc.)
        }else{
            modalCategoria.value = 'outros'; //Só usa 'outros' se a propriedade nem existir
        }
            modalContainer.classList.remove("modal-escondido");
            modalDescricao.focus(); //Foca no primeiro campo    
        }
        function fecharModal(){
            modalContainer.classList.add("modal-escondido");
        }
        //Funções para o modal de categorias
        function abrirModalCategorias(){
            renderizarListaCategorias();
            modalCategoriasContainer.classList.remove("modal-escondido");
            inNovaCategoria.focus();
      }
      function fecharModalCategorias(){
        modalCategoriasContainer.classList.add("modal-escondido");
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

        //Lógica para copiar contas para o próximo mês
        btnCopiarMes.addEventListener("click", () =>{
            const contasAtuais = todasAsContas[mesAtualSelecionado] || [];

            //1.Verifica se tem algo para copiar
            if(contasAtuais.length === 0){
                mostrarNotificacao("Não há contas neste mês para copiar.", "aviso");
                return;
            }

            //2.Calcula qual é o próximo mês e ano
            const [anoStr, mesStr] = mesAtualSelecionado.split('-');
            let anoAtualNum = parseInt(anoStr);
            let mesAtualNum = parseInt(mesStr);
            let proxMesNum = mesAtualNum + 1;
            let proxAnoNum = anoAtualNum;

            //Se passou de Dezembro (12), vira Janeiro (1) do próximo ano
            if(proxMesNum > 12){
                proxMesNum = 1;
                proxAnoNum++;
            }

            //Formata para string (ex: "01", "02")
            const proxMesStr = String(proxMesNum).padStart(2, '0');
            const chaveProxMes = `${proxAnoNum}-${proxMesStr}`;

            //3.Verifica se já existem contas no destino para evitar duplicatas acidentais
            if(todasAsContas[chaveProxMes] && todasAsContas[chaveProxMes].length > 0){
                const confirmar = confirm(`O mês de ${proxMesStr}/${proxAnoNum} já possui contas registradas. Deseja adicionar as cópias mesmo assim?`);
                if(!confirmar) return;
            }

            //4.Cria as cópias
            const novasContas = contasAtuais.map(conta =>{
                //Tenta ajustar a data para o novo mês
                let novaData = "";
                if(conta.data){
                //A data vem com YYYY-MM-DD. Pegamos só o dia (parte final)
                const dia = conta.data.split('-')[2];
                novaData = `${proxAnoNum}-${proxMesStr}-${dia}`;
                }

                return{
                    descricao: conta.descricao,
                    valor: conta.valor,
                    categoria: conta.categoria,
                    paga: false, //Importante: A cópia nasce como "não paga"
                    data: novaData
                };
            });

            //5.Salva no novo mês
            if(!todasAsContas[chaveProxMes]){
                todasAsContas[chaveProxMes] = [];
            }
            //Adiciona as novas contas à lista existente (usando spread operator...)
            todasAsContas[chaveProxMes].push(...novasContas);

            salvarDados();

            mostrarNotificacao("Contas copiadas para o próximo mês!", "sucesso");

            //6.Pergunta se quer ir para o novo mês
            if(confirm(`Sucesso! ${novasContas.length} contas copiadas para ${proxMesStr}/${proxAnoNum}. Deseja ir para lá agora?`)){
                selectMes.value = proxMesStr;
                inputAno.value = proxAnoNum;
                atualizarMesSelecionado();
            }
        });

 btnLimparMes.addEventListener("click", () =>{
            //Pede confirmação
            const confirmou = confirm("Tem certeza que deseja apagar TODAS as contas deste mês? Esta ação não pode ser desfeita.");
            if(confirmou){
                todasAsContas[mesAtualSelecionado] = []; //Esvazia a lista do mês atual
                salvarDados();
                renderizarContasDoMes();
                mostrarNotificacao("Todas as contas foram removidas.", "aviso"); //Notificação
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

            //Evento para cuidar da ordenação
            selectOrdenacao.addEventListener("change", () =>{
                ordenacaoAtual = selectOrdenacao.value;
                renderizarContasDoMes(); //Re-renderiza a lista com a nova ordem
            })

    //Evento para salvar o salário sempre que o valor do campo mudar
    inputSalario.addEventListener("change", () => {
        const salario = Number(inputSalario.value);
        salarioPorMes[mesAtualSelecionado] = salario;
        salvarDados();
        renderizarContasDoMes(); //Atualiza o resumo com o novo salário
        mostrarNotificacao("Salário atualizado!", "sucesso");
    } )

    //"Escuta" o evento de envio do formulário
    frm.addEventListener("submit", (e) =>{
        e.preventDefault();  //Evita o comportamento padrão de recarregar a página

        //Obtém os valores dos campos
        const descricao = frm.inDescricao.value;
        const valor = Number(frm.inValor.value);
        const data = frm.inData.value;
        const categoria = inCategoria.value;

        //Garante que a lista para o mês atual exista
        if(!todasAsContas[mesAtualSelecionado]){
            todasAsContas[mesAtualSelecionado] = [];
        }
        const contasDoMes = todasAsContas[mesAtualSelecionado];
 
        contasDoMes.push({ descricao, valor, paga: false, data: data, categoria: categoria});
        
        renderizarContasDoMes();
        salvarDados(); 
        frm.reset();
        inData.value = getHojeFormatado(); //Redefine a data para hoje
        frm.inDescricao.focus();

        mostrarNotificacao("Conta registrada com sucesso!", "sucesso");
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
                salvarDados();
                renderizarContasDoMes();
                mostrarNotificacao("Conta excluída.", "erro"); //Notificação de erro
            }
            
        }else if(target.classList.contains("btn-copiar")){
            //Pega os dados da conta que queremos copiar
            const contaParaCopiar = contasDoMes[index];

            //Preenche o formulário principal com os dados da conta
            frm.inDescricao.value = contaParaCopiar.descricao;
            frm.inValor.value = contaParaCopiar.valor;
            //Define a data para hoje (ou use contaParaCopiar.data se preferir copiar a data antiga)
            inData.value =contaParaCopiar.data;
            inCategoria.value = contaParaCopiar.categoria || ""; //Usa o seletor 'inCategoria'

            //Foca no campo de descrição para o usuário salvar
            frm.inDescricao.focus();

            //Rola a página para o topo, onde está o formulário
            frm.scrollIntoView({ behavior: 'smooth' });
            
            mostrarNotificacao("Dados copiados para o formulário!", "aviso");

            return; //Sai da função para não salvar/renderizar

        }else if(target.classList.contains("btn-editar")) {
            //Em vez de mexe no form principal, abre o modal
            abrirModal(index);
            return;
            
        }else if(target.classList.contains("chk-paga")) {
            //Lógica para o checkbox
            //Inverte o valor booleano (true vira false, false vira true)
            contasDoMes[index].paga = !contasDoMes[index].paga;
            salvarDados();
            renderizarContasDoMes();
        }else{
            return; //Se não clicou em um elemento de ação, não faz nada
        }
    });

    //Evento para o Modal
    formModal.addEventListener("submit", (e) =>{
        e.preventDefault();

        //Pega os dados do modal
        const indexParaSalvar = Number(modalIndice.value);
        const novaDescricao = modalDescricao.value;
        const novoValor = Number(modalValor.value);
        const novaData = modalData.value;
        const novaCategoria = modalCategoria.value;
        const contasDoMes = todasAsContas[mesAtualSelecionado];

        //Atualiza a conta no array original
        contasDoMes[indexParaSalvar].descricao = novaDescricao;
        contasDoMes[indexParaSalvar].valor = novoValor;
        contasDoMes[indexParaSalvar].data = novaData;
        contasDoMes[indexParaSalvar].categoria = novaCategoria;

        salvarDados();
        renderizarContasDoMes();
        fecharModal();
        mostrarNotificacao("Conta atualizada com sucesso!", "sucesso");
    });

    btnModalCancelar.addEventListener("click", fecharModal);
        
    //Lógica para fechar clicando no fundo
    modalContainer.addEventListener("click", (e) =>{
        if(e.target.id === "modal-container"){
            fecharModal();
        }
    });
    //Eventos para o Modal de Categorias
    btnGerenciarCategorias.addEventListener("click", abrirModalCategorias);
    btnFecharModalCategorias.addEventListener("click", fecharModalCategorias);

    formAddCategoria.addEventListener("submit", (e) =>{
        e.preventDefault();
        const novaCategoriaNome = inNovaCategoria.value.trim().toLowerCase();
        const novaCategoriaCor = inCorCategoria.value; //Pega a cor

        if(novaCategoriaNome){
            //Verifica se já existe (pelo nome)
            const existe = appCategorias.some(c => c.nome === novaCategoriaNome);

            if(!existe){
                appCategorias.push({ nome: novaCategoriaNome, cor: novaCategoriaCor });
                salvarCategorias();
                renderizarListaCategorias();
                mostrarNotificacao("Categoria criada!", "sucesso");
            }else{
                mostrarNotificacao("Essa categoria já existe!", "erro");
            }
        }
        inNovaCategoria.value = '';
        inNovaCategoria.focus();
    });

    listaCategoriasModal.addEventListener("click", (e) =>{
        if(e.target.classList.contains("btn-excluir-categoria")){
            const categoriaParaExcluir = e.target.dataset.categoria;
            if(categoriaParaExcluir === 'outros') return; //Segurança

            if(confirm(`Tem certeza que quer excluir a categoria "${categoriaParaExcluir}"?`)) {
            appCategorias = appCategorias.filter(cat => cat !== categoriaParaExcluir);
            salvarCategorias();
            renderizarListaCategorias();
            mostrarNotificacao("Categoria removida.", "aviso");
            // Opcional: Atualizar contas existentes que usavam essa categoria para "outros"
            // (Por enquanto, elas apenas ficarão sem categoria ou com uma categoria "órfã")
            }
        }
    });

    //---LÓGICA DO MODO ESCURO---
    //Função para aplicar o tema
    function aplicarTema(escuro){
        if(escuro){
            document.body.classList.add("dark-mode");
            btnTema.innerText = "☀️"; //Muda ícone para Sol
        }else{
            document.body.classList.remove("dark-mode");
            btnTema.innerText = "🌙"; //Muda ícone para Lua
        }
    }

    //Verifica preferência salva ao carregar
    const temaSalvo = localStorage.getItem("temaEscuro") === "sim";
    aplicarTema(temaSalvo);

    //Evento de clique no botão
    btnTema.addEventListener("click", () =>{
    //Altera a classe
        document.body.classList.toggle("dark-mode");

    //Verifica se ficou escuro
        const isDark = document.body.classList.contains("dark-mode");

    //Salva a preferência
        localStorage.setItem("temaEscuro", isDark ? "sim" : "nao");

    //Atualiza o ícone
    aplicarTema(isDark);
    });

    //---EXPORTAR PARA EXCEL (CSV)---
    if(btnExportar){
        btnExportar.addEventListener("click", () =>{
            const contas = todasAsContas[mesAtualSelecionado] || [];

            if(contas.length === 0){
                mostrarNotificacao("Não há dados neste mês para exportar.", "aviso");
                return;
            }
            //1.Cria o Cabeçalho do CSV
            let csvContent = "Descrição,Categoria,Data,Valor,Status\n";

            //2.Adiciona as linhas
            contas.forEach(conta =>{
            //Formata os dados para ficarem bonitos no Excel
                const descricao = `"${conta.descricao}"`; //Aspas para evitar erro se tiver vírgula no texto
                const categoria = conta.categoria ? conta.categoria.charAt(0).toUpperCase() + conta.categoria.slice(1) : "Outros";

            //Formata Data (de YYYY/MM/DD PARA DD/MM/YYYY)
            let dataFormatada = "";
            if(conta.data){
                const [ano, mes, dia] = conta.data.split('-');
                dataFormatada = `${dia}/${mes}/${ano}`;
            }
            //Formata Valor (troca ponto por vírgula para Excel brasileiro)
            const valorFormatado = conta.valor.toFixed(2).replace('.', ',');

            const status = conta.paga ? "Paga" : "Pendente";

            //Monta a linha
            csvContent += `${descricao},${categoria},${dataFormatada},"${valorFormatado}",${status}\n`;

            });
            //3.Cria o arquivo para download
            //O "\uFEFF" é um truque para o Excel entender acentos (UTF-8 com BOM)
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            //4.Cria um link invisível e clica nele
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Contas_${mesAtualSelecionado}.csv`);
            link.style.visibiity = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            mostrarNotificacao("Relatório Excel baixado com sucesso!", "sucesso");
        });
    }

        //---INICIALIZAÇÃO---
        inicializarSeletorDeMes();
        popularDropdownsCategorias(); //Popula os <select> na inicialização
        atualizarMesSelecionado();  //Carrega as contas do mês atual logo no início
        atualizarBotoesFiltro(); //Garante que o botão 'todas' comece ativo
        inData.value = getHojeFormatado(); //Define a data de hoje no formulário principal
