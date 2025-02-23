const form = document.getElementById("mortgage-form");

// Helper function to dynamically add error messages
function showError(input, message) {
  const parent = input.closest("p"); // Find closest <p> parent
  let errorSpan = parent.querySelector(".error-message");
  
  // Create the error span if it doesn’t already exist
  if (!errorSpan) {
    errorSpan = document.createElement("span");
    errorSpan.classList.add("error-message");
    parent.appendChild(errorSpan);
  }
  errorSpan.textContent = message; // Set the error message text
  input.classList.add("invalid");
}

// Helper function to clear error messages
function clearError(input) {
  const parent = input.closest("p");
  const errorSpan = parent.querySelector(".error-message");
  if (errorSpan) {
    errorSpan.remove(); // Remove the error message element
  }
  input.classList.remove("invalid");
}

// Validation function for each field
function validateField(input) {
  let isValid = true;
  if (input.id === "mortgage-amount" && (!input.value || input.value <= 0)) {
    showError(input, "Please enter a valid mortgage amount.");
    isValid = false;
  } else if (input.id === "mortgage-term" && (!input.value || input.value <= 0)) {
    showError(input, "Please enter a valid mortgage term.");
    isValid = false;
  } else if (input.id === "interest-rate" && (!input.value || input.value <= 0)) {
    showError(input, "Please enter a valid interest rate.");
    isValid = false;
  } else {
    clearError(input);
  }
  return isValid;
}

// Validation for radio buttons (Mortgage Type)
function validateRadioGroup() {
  const mortgageType = document.querySelector('input[name="mortgage-type"]:checked');
  const radioGroup = document.querySelector(".radio-group");
  let errorSpan = radioGroup.querySelector(".error-message");

  if (!mortgageType) {
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.classList.add("error-message");
      radioGroup.appendChild(errorSpan);
    }
    errorSpan.textContent = "This field is required";
    return false;
  } else {
    if (errorSpan) errorSpan.remove();
    return true;
  }
}

// Calculate mortgage payments
function calculatePayments() {
  // Retrieve values from form fields
  const mortgageAmount = parseFloat(document.getElementById("mortgage-amount").value);
  const mortgageTerm = parseFloat(document.getElementById("mortgage-term").value);
  const annualInterestRate = parseFloat(document.getElementById("interest-rate").value) / 100;
  const mortgageType = document.querySelector('input[name="mortgage-type"]:checked').id;

  const monthlyInterestRate = annualInterestRate / 12; // Convert annual rate to monthly
  const numberOfPayments = mortgageTerm * 12; // Total number of monthly payments

  let monthlyPayment, totalPayment;

  // Calculate monthly payment and total payment based on mortgage type
  if (mortgageType === "repayment") {
    monthlyPayment = mortgageAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    totalPayment = monthlyPayment * numberOfPayments;
  } else if (mortgageType === "interest") {
    monthlyPayment = mortgageAmount * monthlyInterestRate;
    totalPayment = (monthlyPayment * numberOfPayments) + mortgageAmount;
  }

  // Format as currency
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const monthlyFormatted = formatter.format(monthlyPayment);
  const totalFormatted = formatter.format(totalPayment);

  document.querySelector(".results-section").classList.add("results-visible");
  document.querySelector(".empty-state").style.display = "none";
  document.querySelector(".completed-state").style.display = "block";

  // Display results
  document.querySelector(".monthly-result").textContent = monthlyFormatted;
  document.querySelector(".total-result").textContent = totalFormatted;
}


// Validate form on submit
form.addEventListener("submit", function (event) {
  event.preventDefault();
  let isFormValid = true;

  ["mortgage-amount", "mortgage-term", "interest-rate"].forEach(id => {
    const input = document.getElementById(id);
    if (!validateField(input)) {
      isFormValid = false;
    }
  });

  if (!validateRadioGroup()) {
    isFormValid = false;
  }

  if (isFormValid) {
    calculatePayments();
  }
});

// Validate each input on blur
document.querySelectorAll("#mortgage-amount, #mortgage-term, #interest-rate").forEach(input => {
  input.addEventListener("blur", () => validateField(input));
});

document.querySelectorAll('input[name="mortgage-type"]').forEach(radio => {
  radio.addEventListener("blur", validateRadioGroup);
});

let reset_button = document.querySelector(".js-reset")
reset_button.addEventListener("click", event => {
  event.preventDefault();
  form.reset();

  document.querySelector(".results-section").classList.remove("results-visible");
  document.querySelector(".empty-state").style.display = "block";
  document.querySelector(".completed-state").style.display = "none";

  // Display results
  document.querySelector(".monthly-result").textContent = "";
  document.querySelector(".total-result").textContent = "";
})