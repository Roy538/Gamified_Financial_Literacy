function calculateEMI() {
    // Retrieve input values
    var loanAmount = parseFloat(document.getElementById('loanAmount').value);
    var interestRate = parseFloat(document.getElementById('interestRate').value);
    var loanTenure = parseFloat(document.getElementById('loanTenure').value);

    // Validate inputs
    if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTenure) || loanAmount <= 0 || interestRate <= 0 || loanTenure <= 0) {
        alert('Please enter valid positive values for all fields.');
        return;
    }

    // Calculate monthly interest rate
    // var monthlyInterestRate = (interestRate / 12) / 100;

    // Calculate EMI
    // var emi = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenure) / (Math.pow(1 + monthlyInterestRate, loanTenure) - 1);

    // Calculate total payment
    // var totalPayment = emi * loanTenure;

    // Calculate total interest paid
    var totalInterestPaid = totalPayment - loanAmount;

    // Display results
    document.getElementById('monthlyEMI').textContent = 'Ksh ' + emi.toFixed(2);
    document.getElementById('totalPayment').textContent = 'Ksh ' + totalPayment.toFixed(2);
    document.getElementById('totalInterestPaid').textContent = 'Ksh ' + totalInterestPaid.toFixed(2);
}

function clearEMI() {
    document.getElementById('loanAmount').value = '';
    document.getElementById('interestRate').value = '';
    document.getElementById('loanTenure').value = '';
    document.getElementById('monthlyEMI').innerText = '';
    document.getElementById('totalPayment').innerText = '';
    document.getElementById('totalInterestPaid').innerText = '';
}
