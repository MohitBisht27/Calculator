"use strict";

// Select individual elements by class name
const clearButton = document.querySelector(".all-clear");
const bracketButton = document.querySelector(".bracket");
const percentageButton = document.querySelector(".percentage");
const divideButton = document.querySelector(".divide");
const multiplyButton = document.querySelector(".multi");
const subtractButton = document.querySelector(".sub");
const addButton = document.querySelector(".add");
const equalButton = document.querySelector(".equal");
const decimalButton = document.querySelector(".decimal");
const display = document.querySelector(".screen");
const remove = document.querySelector(".remove-button");
const toggleSignButton = document.querySelector(".unknown");

// Select number buttons individually
const numZero = document.querySelector(".num-zero");
const numOne = document.querySelector(".num-one");
const numTwo = document.querySelector(".num-two");
const numThree = document.querySelector(".num-three");
const numFour = document.querySelector(".num-four");
const numFive = document.querySelector(".num-five");
const numSix = document.querySelector(".num-six");
const numSeven = document.querySelector(".num-seven");
const numEight = document.querySelector(".num-eight");
const numNine = document.querySelector(".num-nine");

// Initialize calculator state
let waitingForOperand = false;
let bracketCount = 0;

// Initialize display
display.value = "";

// Helper function to check if the last character is an operator
function isLastCharOperator() {
  const lastChar = display.value.slice(-1);
  return ["+", "-", "*", "/", "%"].includes(lastChar);
}

// Helper function to check if string ends with a number
function endsWithNumber(str) {
  return /[0-9]$/.test(str);
}

// Helper function to get the last number from the display
function getLastNumber() {
  const parts = display.value.split(/[+\-*/()]/g).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "";
}

// Format number for display (handles large numbers and decimals)
function formatNumber(num) {
  // Convert to number to handle evaluation
  const value = parseFloat(num);

  // Check for invalid results
  if (!isFinite(value)) return "Error";

  // Format the number
  if (Math.abs(value) < 1e-10) return "0"; // Handle very small numbers

  if (Math.floor(value) === value) {
    // It's an integer
    return value.toString();
  } else {
    // For decimals, limit to reasonable precision
    return value
      .toFixed(10)
      .replace(/\.?0+$/, "")
      .replace(/(\.\d+[1-9])0+$/, "$1");
  }
}

// Handle number input
function appendNumber(number) {
  if (waitingForOperand) {
    display.value = number;
    waitingForOperand = false;
  } else {
    display.value = display.value === "0" ? number : display.value + number;
  }
}

// Set up number button events
numZero.addEventListener("click", () => appendNumber("0"));
numOne.addEventListener("click", () => appendNumber("1"));
numTwo.addEventListener("click", () => appendNumber("2"));
numThree.addEventListener("click", () => appendNumber("3"));
numFour.addEventListener("click", () => appendNumber("4"));
numFive.addEventListener("click", () => appendNumber("5"));
numSix.addEventListener("click", () => appendNumber("6"));
numSeven.addEventListener("click", () => appendNumber("7"));
numEight.addEventListener("click", () => appendNumber("8"));
numNine.addEventListener("click", () => appendNumber("9"));

// Handle operator input
function appendOperator(operator) {
  // If display is empty and not minus, don't add operator
  if (display.value === "" && operator !== "-") {
    return;
  }

  // If the last character is an operator, replace it
  if (isLastCharOperator()) {
    display.value = display.value.slice(0, -1) + operator;
    return;
  }

  display.value += operator;
  waitingForOperand = false;
}

// Set up operator button events
divideButton.addEventListener("click", () => appendOperator("/"));
multiplyButton.addEventListener("click", () => appendOperator("*"));
subtractButton.addEventListener("click", () => appendOperator("-"));
addButton.addEventListener("click", () => appendOperator("+"));

// Handle percentage
percentageButton.addEventListener("click", () => {
  if (display.value === "" || isLastCharOperator()) return;

  try {
    // Get the last number in the expression
    const expression = display.value;
    const lastNumber = getLastNumber();

    if (lastNumber) {
      // Calculate the percentage value
      const percentValue = parseFloat(lastNumber) / 100;

      // Find where the last number starts
      const lastNumberIndex = expression.lastIndexOf(lastNumber);

      // Get everything before the last number
      const beforeLastNumber = expression.substring(0, lastNumberIndex);

      // Check if there's an operation before this number
      if (beforeLastNumber && /[+\-*/]$/.test(beforeLastNumber)) {
        const operatorChar = beforeLastNumber.slice(-1);

        if (["+", "-"].includes(operatorChar)) {
          // For + and -, calculate percentage of previous result
          try {
            // Evaluate what's before the operator
            const prevExpression = beforeLastNumber.slice(0, -1);
            let prevResult;

            // Be careful with empty expressions
            if (prevExpression) {
              prevResult = eval(prevExpression);
            } else {
              prevResult = 0;
            }

            const percentOfPrev = prevResult * percentValue;
            display.value = beforeLastNumber + percentOfPrev;
          } catch {
            // Fallback if evaluation fails
            display.value = beforeLastNumber + percentValue;
          }
        } else {
          // For * and /, simply convert to decimal
          display.value = beforeLastNumber + percentValue;
        }
      } else {
        // Just convert number to percentage
        display.value = expression.substring(0, lastNumberIndex) + percentValue;
      }
    }
  } catch (error) {
    // If any error occurs, just append "/100"
    display.value += "/100";
  }
});

// Handle decimal point
decimalButton.addEventListener("click", () => {
  // If waiting for operand, start with "0."
  if (waitingForOperand) {
    display.value = "0.";
    waitingForOperand = false;
    return;
  }

  // Get the current number part
  const currentPart = getLastNumber();

  // If empty display or ends with operator, add "0."
  if (display.value === "" || isLastCharOperator()) {
    display.value += "0.";
    return;
  }

  // If current number doesn't have a decimal, add one
  if (!currentPart.includes(".")) {
    display.value += ".";
  }
});

// Handle brackets
bracketButton.addEventListener("click", () => {
  // If display is empty or ends with operator or opening bracket, add opening bracket
  if (
    display.value === "" ||
    isLastCharOperator() ||
    display.value.slice(-1) === "("
  ) {
    display.value += "(";
    bracketCount++;
    return;
  }

  // If there are open brackets and the last character is a number or closing bracket, add closing bracket
  if (
    bracketCount > 0 &&
    (endsWithNumber(display.value) || display.value.slice(-1) === ")")
  ) {
    display.value += ")";
    bracketCount--;
    return;
  }

  // Otherwise add opening bracket
  display.value += "(";
  bracketCount++;
});

// Handle plus/minus toggle button
toggleSignButton.addEventListener("click", () => {
  if (display.value === "") return;

  const lastNumber = getLastNumber();
  if (!lastNumber) return;

  // Find where the last number starts
  const lastNumberIndex = display.value.lastIndexOf(lastNumber);

  // Everything before the last number
  const beforeLastNumber = display.value.substring(0, lastNumberIndex);

  // Check if the last number is already negative (preceded by a minus)
  const isNegative =
    beforeLastNumber.endsWith("(-") ||
    (beforeLastNumber.endsWith("-") &&
      !beforeLastNumber.endsWith("+-") &&
      !beforeLastNumber.endsWith("*-") &&
      !beforeLastNumber.endsWith("/-"));

  if (isNegative) {
    // Remove the negative sign
    if (beforeLastNumber.endsWith("(-")) {
      // Handle case with parentheses
      display.value =
        beforeLastNumber.substring(0, beforeLastNumber.length - 2) + lastNumber;
    } else {
      // Handle case with just minus
      display.value =
        beforeLastNumber.substring(0, beforeLastNumber.length - 1) + lastNumber;
    }
  } else {
    // Add negative sign
    if (beforeLastNumber === "" || beforeLastNumber.endsWith("(")) {
      // At the start or after opening bracket, just add minus
      display.value = beforeLastNumber + "-" + lastNumber;
    } else if (isLastCharOperator()) {
      // After an operator, wrap with parentheses
      display.value = beforeLastNumber + "(-" + lastNumber;
      bracketCount++; // Increment bracket count
    } else {
      // Middle of expression, use multiplication by -1
      display.value = beforeLastNumber + "(-" + lastNumber;
      bracketCount++; // Increment bracket count
    }
  }
});

// Handle clear button
clearButton.addEventListener("click", () => {
  display.value = "";
  waitingForOperand = false;
  bracketCount = 0;
});

// Handle backspace/delete
remove.addEventListener("click", () => {
  if (display.value.length > 0) {
    // Update bracket count if needed
    const lastChar = display.value.slice(-1);
    if (lastChar === "(") bracketCount--;
    if (lastChar === ")") bracketCount++;

    // Remove the last character
    display.value = display.value.slice(0, -1);
  }
});

// Handle equals/evaluation
equalButton.addEventListener("click", () => {
  // If the display is empty, do nothing
  if (display.value === "") return;

  // Close any open brackets
  let expression = display.value;
  for (let i = 0; i < bracketCount; i++) {
    expression += ")";
  }

  try {
    // Safely evaluate the expression
    const result = eval(expression);
    display.value = formatNumber(result);
    waitingForOperand = true;
    bracketCount = 0;
  } catch (error) {
    display.value = "Error";
    waitingForOperand = true;
    bracketCount = 0;
  }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  // Prevent default action for some keys
  if (
    ["Enter", "=", "Backspace", "Delete", "+", "-", "*", "/", "."].includes(
      event.key
    )
  ) {
    event.preventDefault();
  }

  // Handle numbers
  if (/^[0-9]$/.test(event.key)) {
    appendNumber(event.key);
  }

  // Handle operators
  switch (event.key) {
    case "+":
      appendOperator("+");
      break;
    case "-":
      appendOperator("-");
      break;
    case "*":
      appendOperator("*");
      break;
    case "/":
      appendOperator("/");
      break;
    case ".":
      decimalButton.click();
      break;
    case "(":
    case ")":
      bracketButton.click();
      break;
    case "Enter":
    case "=":
      equalButton.click();
      break;
    case "Backspace":
    case "Delete":
      remove.click();
      break;
    case "Escape":
      clearButton.click();
      break;
    case "%":
      percentageButton.click();
      break;
  }
});
