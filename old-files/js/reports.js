// Reports JavaScript for Nexus Pay
document.addEventListener('DOMContentLoaded', function() {
    console.log('JECH Pay Reports - Ready');
    try {
        initializeReportsPage();
    } catch (e) {
        console.warn('Reports init skipped (missing deps?)', e);
    }
});

function initializeReportsPage(){
    try {
        // Initialize charts
        initializeCharts();
        // Load initial data
        loadRecentReports();
        loadPayrollStats();
        loadEmployeeMetrics();
        loadTaxLiabilityTrend();
        // Setup toggle functionality for reports table
        setupTableToggle();
        // Setup real-time updates
        setupRealTimeUpdates();
        // Setup role-based navigation
        setupRoleBasedNavigation();
    } catch (e) {
        console.error('Reports init error:', e);
    }
}

// Expose init for HTMX swaps
window.NexuPayrollReportsInit = function(){
    initializeReportsPage();
};

// Chart instances
let payrollChart = null;
let employeeChart = null;
let taxChart = null;

// Initialize all charts
function initializeCharts() {
    if (typeof Chart === 'undefined') { return; }
    initializePayrollChart();
    initializeEmployeeChart();
    initializeTaxChart();
    
    // Setup period change listener for payroll chart
    const periodSelect = document.getElementById('payrollPeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', updatePayrollChart);
    }
}

// Initialize Payroll Overview Chart
function initializePayrollChart() {
    const ctx = document.getElementById('payrollChart');
    if (!ctx) return;
    
    payrollChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Total Payroll',
                data: [45000, 47000, 48500, 46000, 49000, 51000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Net Pay',
                data: [35000, 36500, 37800, 35800, 38200, 39700],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Initialize Employee Distribution Chart
function initializeEmployeeChart() {
    const ctx = document.getElementById('employeeChart');
    if (!ctx) return;
    
    employeeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Loading...'],
            datasets: [{
                data: [1],
                backgroundColor: ['#6b7280'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Initialize Tax Summary Chart
function initializeTaxChart() {
    const ctx = document.getElementById('taxChart');
    if (!ctx) return;
    
    taxChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Federal Income Tax', 'State Income Tax', 'Social Security', 'Medicare', 'FUTA', 'SUTA'],
            datasets: [{
                label: 'Tax Amount',
                data: [12000, 4500, 8000, 2000, 800, 1200],
                backgroundColor: [
                    '#3b82f6',
                    '#1e40af',
                    '#10b981',
                    '#059669',
                    '#f59e0b',
                    '#d97706'
                ],
                borderWidth: 1,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Update payroll chart based on selected period
function updatePayrollChart() {
    if (!payrollChart) return;
    
    const period = document.getElementById('payrollPeriod').value;
    let labels, totalPayrollData, netPayData;
    
    switch(period) {
        case 'quarterly':
            labels = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
            totalPayrollData = [138000, 145000, 142000, 155000];
            netPayData = [107000, 113000, 110000, 120500];
            break;
        case 'yearly':
            labels = ['2020', '2021', '2022', '2023', '2024'];
            totalPayrollData = [520000, 580000, 645000, 695000, 580000];
            netPayData = [405000, 451000, 502000, 540000, 450500];
            break;
        default: // monthly
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            totalPayrollData = [45000, 47000, 48500, 46000, 49000, 51000];
            netPayData = [35000, 36500, 37800, 35800, 38200, 39700];
    }
    
    payrollChart.data.labels = labels;
    payrollChart.data.datasets[0].data = totalPayrollData;
    payrollChart.data.datasets[1].data = netPayData;
    payrollChart.update();
}

// Setup table toggle functionality
function setupTableToggle() {
    const toggleButton = document.getElementById('toggleReportsTable');
    const reportsContainer = document.getElementById('recent-reports');
    
    if (toggleButton && reportsContainer) {
        toggleButton.addEventListener('click', function() {
            const isHidden = reportsContainer.style.display === 'none';
            
            if (isHidden) {
                reportsContainer.style.display = 'block';
                toggleButton.textContent = 'Hide Table';
            } else {
                reportsContainer.style.display = 'none';
                toggleButton.textContent = 'Show Table';
            }
        });
    }
}

// Load recent reports
function loadRecentReports() {
    const reportsContainer = document.getElementById('recent-reports');
    if (!reportsContainer) return;

    if (!window.__NP_LAST_REPORTS_TS) window.__NP_LAST_REPORTS_TS = 0;
    if (Date.now() - window.__NP_LAST_REPORTS_TS < 1000) return;
    window.__NP_LAST_REPORTS_TS = Date.now();

    makeApiRequest('/api/reports/list')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data) {
            renderReportsTable(data.data);
        } else {
            const mockReports = [
                { name: 'Payroll Register', date: '2025-06-30', type: 'PDF', id: '1' },
                { name: 'Tax Liability', date: '2025-06-30', type: 'CSV', id: '2' },
                { name: 'Employee Summary', date: '2025-06-15', type: 'Excel', id: '3' }
            ];
            renderReportsTable(mockReports);
        }
    })
    .catch(error => {
        console.error('Error loading reports:', error);
        const mockReports = [
            { name: 'Payroll Register', date: '2025-06-30', type: 'PDF', id: '1' },
            { name: 'Tax Liability', date: '2025-06-30', type: 'CSV', id: '2' },
            { name: 'Employee Summary', date: '2025-06-15', type: 'Excel', id: '3' }
        ];
        renderReportsTable(mockReports);
    });
}

// Render reports table
function renderReportsTable(reports) {
    const reportsContainer = document.getElementById('recent-reports');
    if (!reportsContainer) return;

    let tableHtml = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;

    reports.forEach(report => {
        tableHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${report.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(report.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${report.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-jech-accent hover:text-jech-dark mr-3" onclick="viewReport('${report.id || report.name}')">View</button>
                    <button class="text-jech-secondary hover:text-jech-dark" onclick="downloadReport('${report.id || report.name}')">Download</button>
                </td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table>`;
    reportsContainer.innerHTML = tableHtml;
}

// Generate a report
function generateReport(type) {
    showToast(`Generating ${type.replace('-', ' ')} report...`, 'info');
    makeApiRequest(`/api/reports/generate`, { method: 'POST', body: JSON.stringify({ type: type }) })
    .then(response => response.json())
    .then(data => { if (data.success) { showToast(`${type.replace('-', ' ')} report generated successfully!`, 'success'); loadRecentReports(); } else { showToast(data.message || 'Failed to generate report', 'error'); } })
    .catch(error => { console.error('Error generating report:', error); showToast('Network error while generating report', 'error'); });
}

// View report details
function viewReport(reportId) {
    makeApiRequest(`/api/reports/${reportId}`)
    .then(response => response.json())
    .then(data => { if (data.success) { window.open(`/api/reports/${reportId}/view`, '_blank'); showToast('Opening report...', 'success'); } else { showToast(data.message || 'Failed to view report', 'error'); } })
    .catch(error => { console.error('Error viewing report:', error); showToast('Network error while viewing report', 'error'); });
}

// Download report
function downloadReport(reportId) {
    makeApiRequest(`/api/reports/${reportId}/download`)
    .then(response => { if (response.ok) { return response.blob(); } else { throw new Error('Download failed'); } })
    .then(blob => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = `report_${reportId}.pdf`; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a); showToast('Report downloaded successfully', 'success'); })
    .catch(error => { console.error('Error downloading report:', error); showToast('Network error while downloading report', 'error'); });
}

// Toast notification function
function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Load Payroll Statistics from API
async function loadPayrollStats() {
    try {
        if (!window.__NP_LAST_PAYROLL_TS) window.__NP_LAST_PAYROLL_TS = 0;
        if (Date.now() - window.__NP_LAST_PAYROLL_TS < 1000) return;
        window.__NP_LAST_PAYROLL_TS = Date.now();
        const period = document.getElementById('payrollPeriod')?.value || 'monthly';
        const response = await makeApiRequest(`/api/reports/payroll-stats?period=${period}`);
        const data = await response.json();
        if (data.success && data.data) { updatePayrollChartWithData(data.data); }
    } catch (error) {
        console.error('Error loading payroll stats:', error);
        showToast('Failed to load payroll statistics', 'error');
    }
}

// Load Employee Metrics from API
async function loadEmployeeMetrics() {
    try {
        if (!window.__NP_LAST_EMP_TS) window.__NP_LAST_EMP_TS = 0;
        if (Date.now() - window.__NP_LAST_EMP_TS < 1000) return;
        window.__NP_LAST_EMP_TS = Date.now();
        const response = await makeApiRequest('/api/reports/employee-metrics');
        const data = await response.json();
        if (data.success && data.data) { updateEmployeeChartWithData(data.data); updateEmployeeSummary(data.data.summary); }
    } catch (error) {
        console.error('Error loading employee metrics:', error);
        showToast('Failed to load employee metrics', 'error');
    }
}

// Load Tax Liability Trend from API
async function loadTaxLiabilityTrend() {
    try {
        if (!window.__NP_LAST_TAX_TS) window.__NP_LAST_TAX_TS = 0;
        if (Date.now() - window.__NP_LAST_TAX_TS < 1000) return;
        window.__NP_LAST_TAX_TS = Date.now();
        const period = document.getElementById('taxPeriod')?.value || 'monthly';
        const response = await makeApiRequest(`/api/reports/tax-liability-trend?period=${period}`);
        const data = await response.json();
        if (data.success && data.data) { updateTaxChartWithData(data.data); }
    } catch (error) {
        console.error('Error loading tax liability trend:', error);
        showToast('Failed to load tax liability trend', 'error');
    }
}

// Update payroll chart with real data
function updatePayrollChartWithData(data) {
    if (!payrollChart || !data) return;
    
    payrollChart.data.labels = data.labels;
    payrollChart.data.datasets[0].data = data.totalPayroll;
    payrollChart.data.datasets[1].data = data.netPay;
    
    // Add additional datasets if available
    if (data.taxes && payrollChart.data.datasets.length < 3) {
        payrollChart.data.datasets.push({
            label: 'Total Taxes',
            data: data.taxes,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        });
    } else if (data.taxes) {
        payrollChart.data.datasets[2].data = data.taxes;
    }
    
    payrollChart.update('active');
}

// Update employee chart with real data
function updateEmployeeChartWithData(data) {
    if (!employeeChart || !data.employmentTypes) return;
    
    const empTypes = data.employmentTypes;
    employeeChart.data.labels = empTypes.labels;
    employeeChart.data.datasets[0].data = empTypes.data;
    employeeChart.data.datasets[0].backgroundColor = empTypes.colors;
    
    employeeChart.update('active');
    
    // Update department distribution if element exists
    const deptChart = document.getElementById('departmentChart');
    if (deptChart && data.departmentDistribution) {
        createDepartmentChart(data.departmentDistribution);
    }
}

// Update tax chart with real data
function updateTaxChartWithData(data) {
    if (!taxChart || !data) return;
    
    // Prepare data for stacked bar chart
    const labels = data.labels;
    const datasets = [
        {
            label: 'Federal Tax',
            data: data.federalTax,
            backgroundColor: '#3b82f6',
        },
        {
            label: 'State Tax',
            data: data.stateTax,
            backgroundColor: '#1e40af',
        },
        {
            label: 'Social Security',
            data: data.socialSecurity,
            backgroundColor: '#10b981',
        },
        {
            label: 'Medicare',
            data: data.medicare,
            backgroundColor: '#059669',
        },
        {
            label: 'FUTA',
            data: data.futa,
            backgroundColor: '#f59e0b',
        },
        {
            label: 'SUTA',
            data: data.suta,
            backgroundColor: '#d97706',
        }
    ];
    
    // Update chart type to stacked bar for better visualization
    taxChart.config.type = 'bar';
    taxChart.data.labels = labels;
    taxChart.data.datasets = datasets;
    
    // Update options for stacked chart
    taxChart.options.scales.x = {
        stacked: true,
    };
    taxChart.options.scales.y.stacked = true;
    taxChart.options.plugins.legend.display = true;
    taxChart.options.plugins.legend.position = 'bottom';
    
    taxChart.update('active');
}

// Create department distribution chart
function createDepartmentChart(deptData) {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: deptData.labels,
            datasets: [{
                data: deptData.data,
                backgroundColor: deptData.colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Update employee summary statistics
function updateEmployeeSummary(summaryData) {
    if (!summaryData) return;
    
    // Update summary cards
    const updateSummaryCard = (id, value, suffix = '') => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value + suffix;
            element.classList.add('animate-pulse');
            setTimeout(() => element.classList.remove('animate-pulse'), 1000);
        }
    };
    
    updateSummaryCard('totalEmployees', summaryData.totalEmployees);
    updateSummaryCard('activeEmployees', summaryData.activeEmployees);
    updateSummaryCard('newHires', summaryData.newHiresThisMonth);
    updateSummaryCard('avgTenure', summaryData.avgTenure, ' years');
    updateSummaryCard('turnoverRate', summaryData.turnoverRate, '%');
}

// Setup real-time updates with polling
function setupRealTimeUpdates() {
    // Prevent multiple polling intervals
    if (typeof window !== 'undefined' && window.__reportsPollingActive) {
        return;
    }
    if (typeof window !== 'undefined') {
        window.__reportsPollingActive = true;
    }
    // Update data every 5 minutes
    setInterval(() => {
        loadPayrollStats();
        loadEmployeeMetrics();
        loadTaxLiabilityTrend();
        loadRecentReports();
    }, 5 * 60 * 1000);
    
    // Setup period change listeners (attach once per element)
    const payrollPeriodSelect = document.getElementById('payrollPeriod');
    if (payrollPeriodSelect && !payrollPeriodSelect.dataset.listenerAttached) {
        payrollPeriodSelect.addEventListener('change', loadPayrollStats);
        payrollPeriodSelect.dataset.listenerAttached = '1';
    }
    
    const taxPeriodSelect = document.getElementById('taxPeriod');
    if (taxPeriodSelect && !taxPeriodSelect.dataset.listenerAttached) {
        taxPeriodSelect.addEventListener('change', loadTaxLiabilityTrend);
        taxPeriodSelect.dataset.listenerAttached = '1';
    }
}

// Export functions for use in HTML
function exportToExcel(chartType) {
    showToast(`Exporting ${chartType} data to Excel...`, 'info');
    makeApiRequest(`/api/reports/export/${chartType}`, { method: 'POST', body: JSON.stringify({ format: 'excel' }) })
    .then(response => { if (response.ok) { return response.blob(); } throw new Error('Export failed'); })
    .then(blob => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = `${chartType}_data_${new Date().toISOString().split('T')[0]}.xlsx`; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a); showToast('Data exported successfully', 'success'); })
    .catch(error => { console.error('Export error:', error); showToast('Failed to export data', 'error'); });
}

// Print chart functionality
function printChart(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chart Report</title>
            <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
            </style>
        </head>
        <body>
            <h1>JECH Pay - Chart Report</h1>
            <img src="${canvas.toDataURL()}" alt="Chart" />
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Refresh specific chart data
function refreshChart(chartType) {
    showToast(`Refreshing ${chartType} data...`, 'info');
    
    switch(chartType) {
        case 'payroll':
            loadPayrollStats();
            break;
        case 'employee':
            loadEmployeeMetrics();
            break;
        case 'tax':
            loadTaxLiabilityTrend();
            break;
        default:
            loadPayrollStats();
            loadEmployeeMetrics();
            loadTaxLiabilityTrend();
    }
}

// ===========================================
// CHART EXPORT FUNCTIONALITY
// ===========================================

// Export chart as PNG
function exportChartAsPNG(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        showToast('Chart not found', 'error');
        return;
    }
    
    try {
        // Create high-quality PNG
        canvas.toBlob(function(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('Chart exported as PNG successfully', 'success');
        }, 'image/png', 1.0);
    } catch (error) {
        console.error('PNG export error:', error);
        showToast('Failed to export chart as PNG', 'error');
    }
}

// Export chart as PDF
function exportChartAsPDF(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        showToast('Chart not found', 'error');
        return;
    }
    
    if (typeof jsPDF === 'undefined') {
        showToast('PDF library not loaded', 'error');
        return;
    }
    
    try {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF.jsPDF();
        
        // Add title
        pdf.setFontSize(16);
        pdf.text('JECH Pay - Chart Report', 20, 20);
        pdf.setFontSize(12);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Add chart image
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
        
        // Add chart data table if available
        const chartInstance = getChartInstance(chartId);
        if (chartInstance && chartInstance.data) {
            addChartDataToPDF(pdf, chartInstance, 40 + imgHeight + 20);
        }
        
        pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Chart exported as PDF successfully', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Failed to export chart as PDF', 'error');
    }
}

// Export chart data as CSV
function exportChartAsCSV(chartId, chartType) {
    const chartInstance = getChartInstance(chartId);
    if (!chartInstance || !chartInstance.data) {
        showToast('Chart data not available', 'error');
        return;
    }
    
    try {
        const csvData = convertChartDataToCSV(chartInstance.data, chartType);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${chartType}-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Chart data exported as CSV successfully', 'success');
    } catch (error) {
        console.error('CSV export error:', error);
        showToast('Failed to export chart data as CSV', 'error');
    }
}

// Export chart data as Excel (XLSX)
function exportChartAsExcel(chartId, chartType) {
    const chartInstance = getChartInstance(chartId);
    if (!chartInstance || !chartInstance.data) {
        showToast('Chart data not available', 'error');
        return;
    }
    
    if (typeof XLSX === 'undefined') {
        showToast('Excel library not loaded', 'error');
        return;
    }
    
    try {
        const workbook = XLSX.utils.book_new();
        const worksheetData = convertChartDataToExcelFormat(chartInstance.data, chartType);
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Add formatting
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "FFCCCCCC" } }
                };
            }
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart Data');
        XLSX.writeFile(workbook, `${chartType}-data-${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Chart data exported as Excel successfully', 'success');
    } catch (error) {
        console.error('Excel export error:', error);
        showToast('Failed to export chart data as Excel', 'error');
    }
}

// Helper function to get chart instance
function getChartInstance(chartId) {
    switch (chartId) {
        case 'payrollChart':
            return payrollChart;
        case 'employeeChart':
            return employeeChart;
        case 'taxChart':
            return taxChart;
        default:
            return null;
    }
}

// Convert chart data to CSV format
function convertChartDataToCSV(chartData, chartType) {
    let csvContent = '';
    
    if (chartType === 'payroll') {
        // Payroll chart - line chart with multiple datasets
        csvContent = 'Period,Total Payroll,Net Pay\n';
        chartData.labels.forEach((label, index) => {
            const totalPayroll = chartData.datasets[0].data[index] || 0;
            const netPay = chartData.datasets[1].data[index] || 0;
            csvContent += `"${label}",${totalPayroll},${netPay}\n`;
        });
    } else if (chartType === 'employee') {
        // Employee chart - doughnut chart
        csvContent = 'Employment Type,Count\n';
        chartData.labels.forEach((label, index) => {
            const count = chartData.datasets[0].data[index] || 0;
            csvContent += `"${label}",${count}\n`;
        });
    } else if (chartType === 'tax') {
        // Tax chart - bar chart with multiple categories
        csvContent = 'Tax Type,Amount\n';
        chartData.labels.forEach((label, index) => {
            const amount = chartData.datasets[0].data[index] || 0;
            csvContent += `"${label}",${amount}\n`;
        });
    }
    
    return csvContent;
}

// Convert chart data to Excel format
function convertChartDataToExcelFormat(chartData, chartType) {
    let excelData = [];
    
    if (chartType === 'payroll') {
        excelData.push(['Period', 'Total Payroll', 'Net Pay']);
        chartData.labels.forEach((label, index) => {
            const totalPayroll = chartData.datasets[0].data[index] || 0;
            const netPay = chartData.datasets[1].data[index] || 0;
            excelData.push([label, totalPayroll, netPay]);
        });
    } else if (chartType === 'employee') {
        excelData.push(['Employment Type', 'Count', 'Percentage']);
        const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
        chartData.labels.forEach((label, index) => {
            const count = chartData.datasets[0].data[index] || 0;
            const percentage = ((count / total) * 100).toFixed(1);
            excelData.push([label, count, `${percentage}%`]);
        });
    } else if (chartType === 'tax') {
        excelData.push(['Tax Type', 'Amount']);
        chartData.labels.forEach((label, index) => {
            const amount = chartData.datasets[0].data[index] || 0;
            excelData.push([label, amount]);
        });
    }
    
    return excelData;
}

// Add chart data table to PDF
function addChartDataToPDF(pdf, chartInstance, startY) {
    const data = chartInstance.data;
    const chartType = chartInstance.config.type;
    
    pdf.setFontSize(12);
    pdf.text('Chart Data:', 20, startY);
    
    let tableData = [];
    let headers = [];
    
    if (chartType === 'line') {
        headers = ['Period', 'Total Payroll', 'Net Pay'];
        data.labels.forEach((label, index) => {
            const row = [label];
            data.datasets.forEach(dataset => {
                row.push(dataset.data[index] || 0);
            });
            tableData.push(row);
        });
    } else if (chartType === 'doughnut' || chartType === 'pie') {
        headers = ['Category', 'Value'];
        data.labels.forEach((label, index) => {
            tableData.push([label, data.datasets[0].data[index] || 0]);
        });
    } else if (chartType === 'bar') {
        headers = ['Category', 'Amount'];
        data.labels.forEach((label, index) => {
            tableData.push([label, data.datasets[0].data[index] || 0]);
        });
    }
    
    // Simple table rendering
    let currentY = startY + 10;
    const colWidth = 50;
    
    // Headers
    pdf.setFont(undefined, 'bold');
    headers.forEach((header, index) => {
        pdf.text(header, 20 + (index * colWidth), currentY);
    });
    
    // Data rows
    pdf.setFont(undefined, 'normal');
    tableData.forEach((row, rowIndex) => {
        currentY += 10;
        row.forEach((cell, colIndex) => {
            pdf.text(String(cell), 20 + (colIndex * colWidth), currentY);
        });
    });
}

// Mobile-responsive export functions
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Enhanced mobile export with fallbacks
function mobileExportChart(chartId, format, filename) {
    if (!isMobileDevice()) {
        // Use regular export functions for desktop
        switch (format) {
            case 'png':
                exportChartAsPNG(chartId, filename);
                break;
            case 'pdf':
                exportChartAsPDF(chartId, filename);
                break;
            case 'csv':
                exportChartAsCSV(chartId, filename.replace('-', ''));
                break;
        }
        return;
    }
    
    // Mobile-specific handling
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        showToast('Chart not found', 'error');
        return;
    }
    
    if (format === 'png') {
        // For mobile PNG export, open in new tab for manual save
        try {
            const dataURL = canvas.toDataURL('image/png');
            const newWindow = window.open();
            newWindow.document.write(`<img src="${dataURL}" style="max-width:100%;height:auto;" alt="Chart">`);
            newWindow.document.title = `${filename}.png`;
            showToast('Chart opened in new tab. Long press to save on mobile.', 'info');
        } catch (error) {
            showToast('Mobile PNG export failed', 'error');
        }
    } else {
        // For other formats, use regular export with mobile-friendly messages
        switch (format) {
            case 'pdf':
                exportChartAsPDF(chartId, filename);
                break;
            case 'csv':
                exportChartAsCSV(chartId, filename.replace('-', ''));
                break;
        }
    }
}

// Setup role-based navigation
async function setupRoleBasedNavigation() {
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            const userData = await response.json();
            const userRole = userData.data.role;
            
            // Handle Users link (system_admin and hr_manager only)
            const usersLink = document.getElementById('users-link');
            if (usersLink) {
                if (userRole === 'system_admin' || userRole === 'hr_manager') {
                    usersLink.style.display = '';
                } else {
                    usersLink.style.display = 'none';
                }
            }
            
            // Handle Payroll link (system_admin, payroll_manager, hr_manager)
            const payrollLink = document.getElementById('payroll-link');
            if (payrollLink) {
                if (userRole === 'system_admin' || userRole === 'payroll_manager' || 
                    userRole === 'hr_manager') {
                    payrollLink.style.display = '';
                } else {
                    payrollLink.style.display = 'none';
                }
            }
            
            // Handle Reports link (system_admin, payroll_manager, hr_manager)
            const reportsLink = document.getElementById('reports-link');
            if (reportsLink) {
                if (userRole === 'system_admin' || userRole === 'payroll_manager' || 
                    userRole === 'hr_manager') {
                    reportsLink.style.display = '';
                } else {
                    reportsLink.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Hide links by default if we can't determine role
        const usersLink = document.getElementById('users-link');
        if (usersLink) {
            usersLink.style.display = 'none';
        }
        const payrollLink = document.getElementById('payroll-link');
        if (payrollLink) {
            payrollLink.style.display = 'none';
        }
        const reportsLink = document.getElementById('reports-link');
        if (reportsLink) {
            reportsLink.style.display = 'none';
        }
    }
}

// Handle unauthorized access
document.addEventListener('htmx:afterRequest', function(event) {
    if (event.detail.xhr.status === 401) {
        if (typeof window.redirectToLoginOnce === 'function') { window.redirectToLoginOnce(); } else { window.location.href = '/login'; }
    }
});

// Safe API wrapper to avoid ReferenceError when authManager is not defined
function makeApiRequest(url, options) {
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const requestOptions = {
        ...(options || {}),
        headers: {
            ...defaultHeaders,
            ...((options && options.headers) || {})
        },
        credentials: 'same-origin'
    };
    if (typeof window !== 'undefined' && window.authManager && typeof window.authManager.makeRequest === 'function') {
        return window.authManager.makeRequest(url, requestOptions);
    }
    return fetch(url, requestOptions);
}
