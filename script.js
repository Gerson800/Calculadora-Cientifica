// Elementos del DOM
const expressionDiv = document.getElementById('expressionDisplay');
const currentDiv = document.getElementById('currentDisplay');

// Estado
let currentExpression = "";
let currentInput = "0";
let lastAnswer = 0;
let waitingForOperand = false;

function updateDisplay() {
    expressionDiv.innerText = currentExpression === "" ? " " : currentExpression;
    currentDiv.innerText = (currentInput === "" || currentInput === undefined) ? "0" : currentInput;
}

function clearAll() {
    currentExpression = "";
    currentInput = "0";
    waitingForOperand = false;
    updateDisplay();
}

function clearEntry() {
    currentInput = "0";
    waitingForOperand = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1 && currentInput !== "0" && currentInput !== "Error") {
        currentInput = currentInput.slice(0, -1);
        if (currentInput === "" || currentInput === "-") currentInput = "0";
    } else if (currentInput === "0" && currentExpression !== "") {
        if (currentExpression.length > 0) {
            currentExpression = currentExpression.slice(0, -1);
            currentInput = "0";
        }
    } else if (currentInput === "0" && currentExpression === "") {
        return;
    } else {
        currentInput = "0";
    }
    waitingForOperand = false;
    updateDisplay();
}

function appendNumber(number) {
    if (waitingForOperand) {
        currentInput = number;
        waitingForOperand = false;
    } else {
        if (number === "." && currentInput.includes(".")) return;
        if (currentInput === "0" && number !== ".") {
            currentInput = number;
        } else {
            currentInput += number;
        }
    }
    updateDisplay();
}

function addOperator(op) {
    if (currentInput === "Error") clearAll();
    
    let realOp = op;
    if (op === "×") realOp = "*";
    if (op === "÷") realOp = "/";
    if (op === "−") realOp = "-";
    if (op === "xʸ") realOp = "^";
    if (op === "mod") realOp = "%";
    
    let leftPart = currentExpression;
    let currentVal = currentInput;
    
    if (leftPart === "" && realOp === "-" && (currentVal === "0" || currentVal === "")) {
        currentInput = "-";
        updateDisplay();
        return;
    }
    
    let newExpression = "";
    if (leftPart === "") {
        newExpression = currentVal + realOp;
    } else {
        if (/[+\-*/^%]$/.test(leftPart)) {
            newExpression = leftPart.slice(0, -1) + realOp;
        } else {
            newExpression = leftPart + currentVal + realOp;
        }
    }
    
    currentExpression = newExpression;
    currentInput = "0";
    waitingForOperand = true;
    updateDisplay();
}

function evaluateExpression(expr) {
    let safeExpr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
    if (!/^[\d\s+\-*/%().**]+$/.test(safeExpr)) {
        throw new Error("Expresión inválida");
    }
    let finalExpr = safeExpr.replace(/\*\*/g, '^').replace(/\^/g, '**');
    const result = Function('"use strict";return (' + finalExpr + ')')();
    if (isNaN(result) || !isFinite(result)) throw new Error("Resultado no definido");
    return result;
}

function calculateResult() {
    if (currentInput === "Error") {
        clearAll();
        return;
    }
    let fullExpression = currentExpression + currentInput;
    if (fullExpression === "" || fullExpression === "0") {
        currentInput = "0";
        currentExpression = "";
        updateDisplay();
        return;
    }
    if (/[+\-*/^%]$/.test(fullExpression)) {
        fullExpression = fullExpression.slice(0, -1);
    }
    if (fullExpression === "") {
        currentInput = "0";
        currentExpression = "";
        updateDisplay();
        return;
    }
    
    try {
        let resultado = evaluateExpression(fullExpression);
        resultado = parseFloat(resultado.toFixed(10));
        lastAnswer = resultado;
        currentInput = resultado.toString();
        currentExpression = "";
        waitingForOperand = true;
        updateDisplay();
    } catch (error) {
        currentInput = "Error";
        currentExpression = "";
        updateDisplay();
    }
}

function applyUnary(func) {
    if (currentInput === "Error") {
        clearAll();
        return;
    }
    let num = parseFloat(currentInput);
    if (isNaN(num)) {
        currentInput = "Error";
        updateDisplay();
        return;
    }
    let result;
    switch (func) {
        case 'sqrt':
            if (num < 0) { currentInput = "Error"; updateDisplay(); return; }
            result = Math.sqrt(num);
            break;
        case 'square':
            result = num * num;
            break;
        case 'reciprocal':
            if (num === 0) { currentInput = "Error"; updateDisplay(); return; }
            result = 1 / num;
            break;
        case 'percent':
            if (currentExpression !== "" && /[+\-*/^%]$/.test(currentExpression)) {
                let expr = currentExpression + currentInput;
                let parts = expr.match(/([\d.]+)([+\-*/^%])?$/);
                if (parts && parts[2]) {
                    let lastNum = parseFloat(parts[1]);
                    if (!isNaN(lastNum)) {
                        result = (lastNum * num) / 100;
                        break;
                    }
                }
            }
            result = num / 100;
            break;
        case 'plusminus':
            result = -num;
            break;
        default:
            return;
    }
    currentInput = result.toString();
    waitingForOperand = false;
    updateDisplay();
}

function insertParenthesis(p) {
    if (waitingForOperand) {
        currentInput = p;
        waitingForOperand = false;
    } else {
        if (currentInput !== "0" && !waitingForOperand && currentExpression === "") {
            currentExpression = currentInput;
            currentInput = "";
        }
        if (currentExpression === "" && currentInput !== "") {
            currentExpression = currentInput;
            currentInput = "";
        }
        currentExpression += p;
        currentInput = "0";
        waitingForOperand = false;
    }
    updateDisplay();
}

function insertAns() {
    let ansValue = lastAnswer.toString();
    if (waitingForOperand) {
        currentInput = ansValue;
        waitingForOperand = false;
    } else {
        if (currentInput === "0") {
            currentInput = ansValue;
        } else {
            if (currentExpression === "") {
                currentExpression = currentInput;
                currentInput = "";
            }
            currentExpression += ansValue;
            currentInput = "0";
        }
    }
    updateDisplay();
}

// Asignación de eventos
document.querySelectorAll('.number').forEach(btn => {
    btn.addEventListener('click', () => appendNumber(btn.getAttribute('data-num')));
});
document.querySelectorAll('.operator').forEach(btn => {
    btn.addEventListener('click', () => addOperator(btn.getAttribute('data-op')));
});
document.querySelector('[data-action="clearAll"]').addEventListener('click', clearAll);
document.querySelector('[data-action="clearEntry"]').addEventListener('click', clearEntry);
document.querySelector('[data-action="delete"]').addEventListener('click', deleteLast);
document.querySelector('[data-action="equal"]').addEventListener('click', calculateResult);
document.querySelector('[data-action="sqrt"]').addEventListener('click', () => applyUnary('sqrt'));
document.querySelector('[data-action="square"]').addEventListener('click', () => applyUnary('square'));
document.querySelector('[data-action="reciprocal"]').addEventListener('click', () => applyUnary('reciprocal'));
document.querySelector('[data-action="percent"]').addEventListener('click', () => applyUnary('percent'));
document.querySelector('[data-action="plusminus"]').addEventListener('click', () => applyUnary('plusminus'));
document.querySelector('[data-action="power"]').addEventListener('click', () => addOperator('^'));
document.querySelector('[data-action="mod"]').addEventListener('click', () => addOperator('mod'));
document.querySelector('[data-action="leftParen"]').addEventListener('click', () => insertParenthesis('('));
document.querySelector('[data-action="rightParen"]').addEventListener('click', () => insertParenthesis(')'));
document.querySelector('[data-action="ans"]').addEventListener('click', insertAns);

// Teclado
window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '0' && key <= '9') appendNumber(key);
    else if (key === '.') appendNumber('.');
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        let opMap = {'+':'+', '-':'−', '*':'×', '/':'÷'};
        addOperator(opMap[key] || key);
    }
    else if (key === 'Enter' || key === '=') calculateResult();
    else if (key === 'Escape') clearAll();
    else if (key === 'Backspace') deleteLast();
    else if (key === '%') applyUnary('percent');
    else if (key === '^') addOperator('^');
});

clearAll();