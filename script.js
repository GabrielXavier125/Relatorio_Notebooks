document.addEventListener('DOMContentLoaded', function() {
    // Definir data atual como padrão
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('reportDate').value = formattedDate;
    
    // Botão de envio
    document.getElementById('submitBtn').addEventListener('click', function() {
        // Validar campos obrigatórios
        const notebookId = document.getElementById('notebookId').value;
        if (!notebookId) {
            alert('Por favor, informe a identificação do notebook.');
            return;
        }
        
        // Gerar PDF
        generatePDF();
        
        // Mostrar confirmação
        document.getElementById('confirmationMessage').style.display = 'block';
        
        // Rolar para a confirmação
        document.getElementById('confirmationMessage').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Botão de limpar
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja limpar todo o formulário?')) {
            document.getElementById('reportForm').reset();
            document.getElementById('confirmationMessage').style.display = 'none';
            document.getElementById('reportDate').value = formattedDate;
        }
    });
    
    // Impedir que múltiplas opções sejam selecionadas em alguns grupos
    const exclusiveGroups = [
        ['notebookOk', 'notebookDamaged', 'notebookSlow', 'notebookScreen'],
        ['keyboardOk', 'keyboardSomeKeys', 'keyboardSticky', 'keyboardMissing'],
        ['mouseOk', 'mouseBattery', 'mouseButtons', 'mouseScroll', 'mouseConnection']
    ];
    
    exclusiveGroups.forEach(group => {
        group.forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                if (this.checked) {
                    group.forEach(otherId => {
                        if (otherId !== id) {
                            document.getElementById(otherId).checked = false;
                        }
                    });
                }
            });
        });
    });
    
    // Função para gerar PDF
    function generatePDF() {
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Dados do relatório
        const reportDate = document.getElementById('reportDate').value;
        const notebookId = document.getElementById('notebookId').value;
        
        // Configurações do PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;
        
        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('RELATÓRIO DE CONDIÇÕES DO NOTEBOOK', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
        
        // Informações básicas
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Data do Relatório: ${formatDate(reportDate)}`, 20, yPosition);
        doc.text(`Identificação do Notebook: ${notebookId}`, pageWidth - 20, yPosition, { align: 'right' });
        yPosition += 15;
        
        // Adicionar linha separadora
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;
        
        // Função para adicionar seção
        function addSection(title, checkboxes, notes) {
            // Verificar se precisa de nova página
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Título da seção
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(title, 20, yPosition);
            yPosition += 8;
            
            // Itens marcados
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            const markedItems = checkboxes.filter(item => item.checked).map(item => item.label);
            
            if (markedItems.length > 0) {
                markedItems.forEach(item => {
                    doc.text(`✓ ${item}`, 25, yPosition);
                    yPosition += 6;
                });
            } else {
                doc.text('Nenhum item selecionado', 25, yPosition);
                yPosition += 6;
            }
            
            // Observações
            if (notes && notes.trim() !== '') {
                yPosition += 4;
                doc.setFont(undefined, 'bold');
                doc.text('Observações:', 20, yPosition);
                yPosition += 6;
                doc.setFont(undefined, 'normal');
                
                // Quebrar texto longo em várias linhas
                const lines = doc.splitTextToSize(notes, pageWidth - 40);
                lines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 6;
                });
            }
            
            yPosition += 10;
        }
        
        // Adicionar seções
        addSection(
            'CONDIÇÕES GERAIS DO NOTEBOOK', 
            [
                { checked: document.getElementById('notebookOk').checked, label: 'Em boas condições' },
                { checked: document.getElementById('notebookDamaged').checked, label: 'Com danos físicos' },
                { checked: document.getElementById('notebookSlow').checked, label: 'Sistema operacional lento' },
                { checked: document.getElementById('notebookScreen').checked, label: 'Tela com problemas' }
            ],
            document.getElementById('notebookNotes').value
        );
        
        addSection(
            'TECLADO', 
            [
                { checked: document.getElementById('keyboardOk').checked, label: 'Funcionando normalmente' },
                { checked: document.getElementById('keyboardSomeKeys').checked, label: 'Algumas teclas não funcionam' },
                { checked: document.getElementById('keyboardSticky').checked, label: 'Teclas grudando' },
                { checked: document.getElementById('keyboardMissing').checked, label: 'Teclas faltando' }
            ],
            document.getElementById('keyboardNotes').value
        );
        
        addSection(
            'MOUSE SEM FIO', 
            [
                { checked: document.getElementById('mouseOk').checked, label: 'Funcionando normalmente' },
                { checked: document.getElementById('mouseBattery').checked, label: 'Pilha fraca/descarga' },
                { checked: document.getElementById('mouseButtons').checked, label: 'Botões com problemas' },
                { checked: document.getElementById('mouseScroll').checked, label: 'Scroll não funciona' },
                { checked: document.getElementById('mouseConnection').checked, label: 'Problemas de conexão' }
            ],
            document.getElementById('mouseNotes').value
        );
        
        addSection(
            'OUTROS PROBLEMAS', 
            [
                { checked: document.getElementById('otherAudio').checked, label: 'Problemas de áudio' },
                { checked: document.getElementById('otherInternet').checked, label: 'Problemas de internet' },
                { checked: document.getElementById('otherBattery').checked, label: 'Bateria com problemas' },
                { checked: document.getElementById('otherCharger').checked, label: 'Carregador com problemas' }
            ],
            document.getElementById('otherNotes').value
        );
        
        // Rodapé
        const currentPage = doc.internal.getNumberOfPages();
        doc.setPage(currentPage);
        doc.setFontSize(10);
        doc.text('Relatório gerado em ' + new Date().toLocaleString('pt-BR'), pageWidth / 2, 285, { align: 'center' });
        
        // Salvar PDF
        const fileName = `Relatorio_Notebook_${notebookId}_${reportDate.replace(/-/g, '')}.pdf`;
        doc.save(fileName);
    }
    
    // Função para formatar data
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
});