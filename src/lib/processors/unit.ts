import type { ProcessorArgs, ProcessorResult } from "./types";
import {
  formatNumber,
  n,
  resultText,
  safeEval,
  safeString,
  unitConverter,
} from "./shared";

export async function handleUnitTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  switch (key) {
    case "currencyConverter": {
      const amount = n(args.amount, 1);
      const rate = n(args.rate, 1);
      const from = safeString(args.from, "USD");
      const to = safeString(args.to, "EUR");
      return resultText(
        "Currency Converter",
        `${formatNumber(amount)} ${from} = ${formatNumber(amount * rate)} ${to}`
      );
    }

    case "unitConverter": {
      const kind = safeString(args.kind, "length");
      const value = n(args.value, 1);
      const from = safeString(args.from, "m");
      const to = safeString(args.to, "ft");
      const output = unitConverter(kind, value, from, to);

      return resultText(
        "Unit Converter",
        `${formatNumber(value)} ${from} = ${formatNumber(output)} ${to}`
      );
    }

    case "percentageCalculator": {
      const value = n(args.value, 0);
      const percent = n(args.percent, 0);
      return resultText(
        "Percentage Calculator",
        `${percent}% of ${value} = ${formatNumber((value * percent) / 100)}`
      );
    }

    case "bmiCalculator": {
      const weight = n(args.weight, 70);
      const height = n(args.height, 170) / 100;
      const bmi = weight / (height * height);

      return resultText(
        "BMI Calculator",
        `BMI: ${formatNumber(bmi)}`
      );
    }

    case "tipCalculator": {
      const total = n(args.total, 0);
      const percent = n(args.percent, 10);
      const tip = (total * percent) / 100;

      return resultText(
        "Tip Calculator",
        `Tip: ${formatNumber(tip)}\nTotal: ${formatNumber(total + tip)}`
      );
    }

    case "loanCalculator": {
      const principal = n(args.amount, 10000);
      const annual = n(args.rate, 8) / 100 / 12;
      const months = n(args.months, 12);

      const payment =
        annual === 0
          ? principal / months
          : (principal * annual) / (1 - Math.pow(1 + annual, -months));

      return resultText(
        "Loan Calculator",
        `Monthly payment: ${formatNumber(payment)}`
      );
    }

    case "taxCalculator": {
      const amount = n(args.amount, 0);
      const rate = n(args.rate, 18);

      return resultText(
        "Tax Calculator",
        `Tax: ${formatNumber((amount * rate) / 100)}\nTotal: ${formatNumber(
          amount + (amount * rate) / 100
        )}`
      );
    }

    case "discountCalculator": {
      const price = n(args.price, 0);
      const discount = n(args.discount, 0);
      const finalPrice = price - (price * discount) / 100;

      return resultText(
        "Discount Calculator",
        `Final price: ${formatNumber(finalPrice)}`
      );
    }

    case "basicMathCalculator": {
      try {
        const value = safeEval(safeString(args.expression, "0"));
        return resultText("Calculator", formatNumber(value));
      } catch (error) {
        return resultText(
          "Calculator",
          error instanceof Error ? error.message : "Invalid expression"
        );
      }
    }

    case "dateCalculator": {
      const start = new Date(safeString(args.start, new Date().toISOString()));
      const days = n(args.days, 0);

      const output = new Date(start);
      output.setDate(output.getDate() + days);

      return resultText(
        "Date Calculator",
        output.toDateString()
      );
    }

    case "ageCalculator": {
      const birth = new Date(safeString(args.birth, "2000-01-01"));
      const diff = Date.now() - birth.getTime();
      const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));

      return resultText(
        "Age Calculator",
        `${age} years old`
      );
    }

    default:
      return resultText("Utility Tool", "Ready.");
  }
}