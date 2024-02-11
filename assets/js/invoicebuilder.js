document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector("table");
    const currencyInput = document.getElementById("currencyInp");
    const invoiceDateInput = document.getElementById("invoiceDate");
    const fileInput = document.getElementById("file"); // File input for CSV import

    const setInputValueFromLocalStorage = (element) => {
      const storedValue = localStorage.getItem(element.id);
      if (storedValue) {
        element.value = storedValue;
      }
    };

    const storeInputValue = (element) => {
      localStorage.setItem(element.id, element.value);
    };

    const validateInputPattern = (input) => {
      const pattern = input.getAttribute("pattern");
      if (pattern && !new RegExp(`^${pattern}$`).test(input.value)) {
        input.value = "";
      }
    };

    const setCurrentDate = () => {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      invoiceDateInput.value = formattedDate;
    };

    const calculateLineTotal = (row) => {
      const qtyInput = row.querySelector(".input-qty-cell");
      const priceInput = row.querySelector(".input-price-cell");
      const lineTotalElement = row.querySelector(".line-total");
      const qty = parseInt(qtyInput.value, 10);
      const price = parseFloat(priceInput.value);

      const total = !isNaN(qty) && !isNaN(price) ? qty * price : 0;
      lineTotalElement.textContent = total;
    };

    const calculateGrandTotal = () => {
      const lineTotals = Array.from(
        document.querySelectorAll(".line-total")
      );
      const grandTotal = lineTotals.reduce((total, element) => {
        const value = parseFloat(element.textContent);
        return total + (isNaN(value) ? 0 : value);
      }, 0);

      document.querySelectorAll(".grand-total").forEach((element) => {
        element.textContent = grandTotal;
      });
    };

    const changeCurrency = () => {
      const currency = currencyInput.value;
      document.querySelectorAll(".currency").forEach((element) => {
        element.textContent = currency;
      });
    };

    const parseCSVAndAddRows = (csvText) => {
      const rows = csvText.trim().split("\n");
      rows.forEach((row) => {
        const columns = row.split(",");
        addRow(columns);
      });
    };

    const parseJSONAndAddRows = (jsonText) => {
      const dataObjects = JSON.parse(jsonText);
      dataObjects.forEach(addRow);
    };

    const addRow = (data = []) => {
      const newRow = document.createElement("tr");
      let descriptionContent;
      console.log(Object.keys(data));
      if (Object.keys(data).length === 0) {
        data = {
          Description: "",
          "SAC code": "998314",
          Quantity: "1",
          "Unit Price": "0",
        }; // Default values if no data provided
        descriptionContent = `<input type="text" placeholder="Line description" value="${data.Description}">`; // use input for empty row
      } else {
        descriptionContent = `<p>${data.Description}</p>`; // use paragraph for populated rows
      }

      newRow.innerHTML = `
<td><span class="remove-row">-</span>${descriptionContent}</td>
<td><input type="text" value="${
data["SAC code"] || ""
}" placeholder="______" /></td>
<td><input class="input-qty-cell" type="text" value="${
data.Quantity || "1"
}" placeholder="Enter QTY" pattern="^[0-9]+$" /></td>
<td><input class="input-price-cell" type="text" value="${
data["Unit Price"] || "0"
}" placeholder="Enter Price" pattern="^[0-9]+$" /><span class="currency">₹</span></td>
<td><span class="line-total"></span><span class="currency">₹</span></td>
`;
      const tbody = table.querySelector("tbody");
      tbody.insertBefore(newRow, tbody.lastElementChild);
      changeCurrency();
      calculateLineTotal(newRow);
      calculateGrandTotal();
    };

    const removeRow = (event) => {
      if (event.target.classList.contains("remove-row")) {
        event.target.closest("tr").remove();
        calculateGrandTotal();
      }
    };

    // Event delegation for dynamic elements
    table.addEventListener("click", removeRow);
    table.addEventListener("input", (event) => {
      const target = event.target;
      if (target.tagName === "INPUT") {
        validateInputPattern(target);
        if (
          target.classList.contains("input-qty-cell") ||
          target.classList.contains("input-price-cell")
        ) {
          calculateLineTotal(target.closest("tr"));
          calculateGrandTotal();
        }
      }
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          parseJSONAndAddRows(e.target.result);
        };
        reader.readAsText(file);
      } else {
        alert("Please select a valid JSON file.");
      }
    });

    document
      .querySelectorAll('input[id$="Inp"], textarea[id$="Inp"]')
      .forEach(setInputValueFromLocalStorage);
    document
      .querySelectorAll('input[id$="Inp"], textarea[id$="Inp"]')
      .forEach((element) => {
        element.addEventListener("input", () => {
          if (!element.classList.contains("nostore")) {
            storeInputValue(element);
          }
        });
      });

    document.querySelector(".add-row").addEventListener("click", () => addRow());
    currencyInput.addEventListener("change", changeCurrency);

    setCurrentDate();
  });